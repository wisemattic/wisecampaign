<?php

namespace WISECAMPAIGN\Rewards;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Points for orders, signups and product reviews, taken back when an order is cancelled or
 * refunded or a review is removed, and balances that expire after months without activity.
 *
 * Orders are synced rather than counted: every status change works out what the order should
 * have earned (and spent) by now and adds the difference, so repeated hooks never double count.
 */
class Earning
{
    const EARN_META = '_wiserewards_earn_points';      // points the order earns once paid, fixed at checkout
    const SIGNUP_PENDING_META = '_wiserewards_signup_pending';
    const DAILY_HOOK = 'wiserewards_daily';

    public function __construct()
    {
        // Orders: after Redemption has saved what was spent
        add_action('woocommerce_checkout_order_processed', [$this, 'on_order_placed'], 20);
        add_action('woocommerce_store_api_checkout_order_processed', [$this, 'on_order_placed'], 20);
        add_action('woocommerce_order_status_changed', [$this, 'sync_order'], 20);
        add_action('woocommerce_order_refunded', [$this, 'sync_order'], 20);
        add_action('woocommerce_trash_order', [$this, 'sync_order'], 20);
        add_action('woocommerce_untrash_order', [$this, 'sync_order'], 20);

        add_action('user_register', [$this, 'on_signup'], 20);

        add_action('comment_post', [$this, 'on_review_posted'], 20, 2);
        add_action('transition_comment_status', [$this, 'on_review_status'], 20, 3);

        add_action('init', [$this, 'schedule_daily']);
        add_action(self::DAILY_HOOK, [$this, 'expire_balances']);
    }

    /**
     * =================================================================
     * ORDERS
     * =================================================================
     */

    /**
     * What an order's points are worked out from: its items after every discount (the points used
     * on it included) and Discount Manager's discounts, without tax and shipping.
     */
    public static function order_base(\WC_Order $order)
    {
        $base = 0.0;
        foreach ($order->get_items() as $item) {
            $base += (float) $item->get_total();
        }
        foreach ($order->get_fees() as $fee) {
            if ((float) $fee->get_total() < 0) {
                $base += (float) $fee->get_total();
            }
        }
        return max(0.0, $base);
    }

    /**
     * Points an amount spent earns, with wiseCampaign Pro's tier and campaign bonuses.
     *
     * @param float $amount
     * @param int   $user_id 0 for a guest.
     */
    public static function points_for_amount($amount, $user_id = 0)
    {
        $s = Settings::get();
        if (!$s['earnPurchase'] || (float) $s['earnAmount'] <= 0) {
            return 0;
        }
        return (int) floor((float) $amount / (float) $s['earnAmount'] * (int) $s['earnPoints'] * self::multiplier($user_id) + 1e-6);
    }

    /**
     * Bonus multiplier for a customer's purchases right now (1 without wiseCampaign Pro).
     */
    public static function multiplier($user_id = 0)
    {
        /**
         * Filters the purchase points multiplier, such as 1.5 for a Gold tier or 2 during a campaign.
         *
         * @param float $multiplier
         * @param int   $user_id
         */
        return max(0.0, (float) apply_filters('wiserewards_earn_multiplier', 1.0, (int) $user_id));
    }

    public function on_order_placed($order)
    {
        $order = $order instanceof \WC_Order ? $order : wc_get_order($order);
        if (!$order || !$order->get_customer_id()) {
            return;
        }
        // Fixed now, so later rate changes, tiers or campaigns don't change what was promised
        if ($order->get_meta(self::EARN_META) === '' && Settings::is_active()) {
            $order->update_meta_data(self::EARN_META, self::points_for_amount(self::order_base($order), $order->get_customer_id()));
            $order->save_meta_data();
        }
        $this->sync_order($order);
    }

    /**
     * Brings an order's points in line with its status: earned once paid (or completed), taken back
     * in proportion to refunds, and all of it back when the order is cancelled, refunded or trashed.
     *
     * @param int|\WC_Order $order
     */
    public function sync_order($order)
    {
        $order = $order instanceof \WC_Order ? $order : wc_get_order($order);
        if (!$order || $order instanceof \WC_Order_Refund) {
            return;
        }
        $user_id = $order->get_customer_id();
        if (!$user_id) {
            return;
        }
        Redemption::sync_order($order);

        $planned = $order->get_meta(self::EARN_META);
        if ($planned === '') {
            // Orders made without the checkout (in the admin, by the REST API) get their points worked out now
            if (!Settings::is_active()) {
                return;
            }
            $planned = self::points_for_amount(self::order_base($order), $user_id);
            $order->update_meta_data(self::EARN_META, $planned);
            $order->save_meta_data();
        }
        $planned = (int) $planned;

        $statuses = Settings::get('earnStatus') === 'processing' ? ['processing', 'completed'] : ['completed'];
        $target = 0;
        if ($planned > 0 && $order->has_status($statuses)) {
            $total = (float) $order->get_total();
            $kept = $total > 0 ? max(0, 1 - (float) $order->get_total_refunded() / $total) : 1;
            $target = (int) floor($planned * $kept + 1e-6);
        }

        $current = Ledger::sum_for('order', $order->get_id(), ['earn', 'reverse'], $user_id);
        if ($target !== $current) {
            Ledger::add($user_id, $target - $current, $target > $current ? 'earn' : 'reverse', 'order', $order->get_id());
            $order->add_order_note($target > $current
                /* translators: %s: points, such as "120 points" */
                ? sprintf(__('wiseRewards: the customer earned %s.', 'wisecampaign'), Settings::label($target - $current))
                /* translators: %s: points, such as "120 points" */
                : sprintf(__('wiseRewards: %s taken back from the customer.', 'wisecampaign'), Settings::label($current - $target)));
        }

        if ($target > 0 && $current === 0) {
            $this->release_signup_bonus($user_id);
            /**
             * Fires when an order first earns its points.
             *
             * @param \WC_Order $order
             * @param int       $points
             */
            do_action('wiserewards_order_earned', $order, $target);
        }
    }

    /**
     * =================================================================
     * SIGNUP
     * =================================================================
     */

    public function on_signup($user_id)
    {
        $s = Settings::get();
        if (!Settings::is_active() || !$s['earnSignup'] || (int) $s['signupPoints'] <= 0) {
            return;
        }
        $user = get_userdata($user_id);
        /** Filters the roles that get the signup bonus. */
        $roles = (array) apply_filters('wiserewards_signup_roles', ['customer', 'subscriber']);
        if (!$user || !array_intersect($roles, (array) $user->roles)) {
            return;
        }
        if ($s['signupNeedsOrder']) {
            // Unlocks with the first order that earns points, so fake accounts get nothing
            Ledger::set_value($user_id, self::SIGNUP_PENDING_META, (int) $s['signupPoints']);
            return;
        }
        if (!Ledger::sum_for('signup', $user_id, ['earn'], $user_id)) {
            Ledger::add($user_id, (int) $s['signupPoints'], 'earn', 'signup', $user_id);
        }
    }

    private function release_signup_bonus($user_id)
    {
        $pending = (int) Ledger::get_value($user_id, self::SIGNUP_PENDING_META);
        if ($pending <= 0) {
            return;
        }
        Ledger::delete_value($user_id, self::SIGNUP_PENDING_META);
        if (!Ledger::sum_for('signup', $user_id, ['earn'], $user_id)) {
            Ledger::add($user_id, $pending, 'earn', 'signup', $user_id);
        }
    }

    public static function pending_signup_bonus($user_id)
    {
        return max(0, (int) Ledger::get_value($user_id, self::SIGNUP_PENDING_META));
    }

    /**
     * =================================================================
     * REVIEWS
     * =================================================================
     */

    public function on_review_posted($comment_id, $approved)
    {
        if ((int) $approved === 1) {
            $this->award_review(get_comment($comment_id));
        }
    }

    public function on_review_status($new_status, $old_status, $comment)
    {
        if ($new_status === 'approved') {
            $this->award_review($comment);
        } elseif ($old_status === 'approved') {
            $this->reverse_review($comment);
        }
    }

    private function is_product_review($comment)
    {
        return $comment instanceof \WP_Comment
            && (int) $comment->user_id > 0
            && in_array($comment->comment_type, ['review', 'comment', ''], true)
            && get_post_type($comment->comment_post_ID) === 'product'
            && (int) $comment->comment_parent === 0;
    }

    /**
     * Points for an approved review: one review per product, and by default only from customers
     * who bought it.
     */
    private function award_review($comment)
    {
        $s = Settings::get();
        if (!Settings::is_active() || !$s['earnReview'] || (int) $s['reviewPoints'] <= 0 || !$this->is_product_review($comment)) {
            return;
        }
        $user_id = (int) $comment->user_id;
        $product_id = (int) $comment->comment_post_ID;
        if (Ledger::sum_for('review', $comment->comment_ID, ['earn', 'reverse'], $user_id) > 0) {
            return;
        }
        // Once per product, even if the review was removed and written again
        if (Ledger::has_ref($user_id, 'review', $product_id)) {
            return;
        }
        if ($s['reviewVerifiedOnly'] && !wc_customer_bought_product($comment->comment_author_email, $user_id, $product_id)) {
            return;
        }
        Ledger::add($user_id, (int) $s['reviewPoints'], 'earn', 'review', $comment->comment_ID, '', $product_id);
    }

    private function reverse_review($comment)
    {
        if (!$this->is_product_review($comment)) {
            return;
        }
        $user_id = (int) $comment->user_id;
        $earned = Ledger::sum_for('review', $comment->comment_ID, ['earn', 'reverse'], $user_id);
        if ($earned > 0) {
            Ledger::add($user_id, -$earned, 'reverse', 'review', $comment->comment_ID, '', (int) $comment->comment_post_ID);
        }
    }

    /**
     * =================================================================
     * EXPIRY
     * =================================================================
     */

    public function schedule_daily()
    {
        if (!wp_next_scheduled(self::DAILY_HOOK)) {
            wp_schedule_event(strtotime('tomorrow 03:00:00') ?: time() + DAY_IN_SECONDS, 'daily', self::DAILY_HOOK);
        }
    }

    /**
     * When a customer's points expire: a set number of months after their last earn or spend.
     *
     * @return int|null Timestamp, or null when points don't expire.
     */
    public static function expires_at($user_id)
    {
        if (!Settings::get('expiryEnabled')) {
            return null;
        }
        $activity = (int) Ledger::get_value($user_id, Ledger::ACTIVITY_META);
        return $activity ? strtotime('+' . (int) Settings::get('expiryMonths') . ' months', $activity) : null;
    }

    /**
     * Takes the whole balance of customers with no activity for the set number of months.
     */
    public function expire_balances()
    {
        global $wpdb;
        if (!Settings::is_active() || !Settings::get('expiryEnabled') || !get_option(Ledger::DB_OPTION)) {
            return;
        }
        $cutoff = strtotime('-' . (int) Settings::get('expiryMonths') . ' months');
        $started = time();
        do {
            $users = $wpdb->get_col($wpdb->prepare(
                "SELECT b.user_id FROM {$wpdb->usermeta} b
                JOIN {$wpdb->usermeta} a ON a.user_id = b.user_id AND a.meta_key = %s
                WHERE b.meta_key = %s AND CAST(b.meta_value AS SIGNED) > 0 AND CAST(a.meta_value AS UNSIGNED) < %d
                LIMIT 100",
                Ledger::meta_key(Ledger::ACTIVITY_META),
                Ledger::meta_key(Ledger::BALANCE_META),
                $cutoff
            ));
            foreach ($users as $user_id) {
                $balance = Ledger::refresh((int) $user_id);
                if ($balance > 0) {
                    Ledger::add((int) $user_id, -$balance, 'expire', 'expiry');
                }
            }
        } while (count($users) === 100 && time() - $started < 20);
    }
}
