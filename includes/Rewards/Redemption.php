<?php

namespace WISECAMPAIGN\Rewards;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Paying with points. The points a shopper chooses to use are kept in the WooCommerce session and
 * applied as a virtual coupon (code "wiserewards"), so they come off before tax, show in every
 * cart, checkout and order like other discounts, and work with Discount Manager's discounts.
 * The points are taken when the order is placed and given back if it is cancelled, fails or is
 * fully refunded.
 */
class Redemption
{
    const CODE = 'wiserewards';
    const SESSION_KEY = 'wiserewards_points';
    const POINTS_META = '_wiserewards_redeemed_points';
    const VALUE_META = '_wiserewards_redeemed_value';

    public function __construct()
    {
        add_filter('woocommerce_get_shop_coupon_data', [$this, 'coupon_data'], 10, 2);
        add_filter('woocommerce_cart_totals_coupon_label', [$this, 'coupon_label'], 10, 2);
        add_filter('woocommerce_coupon_message', [$this, 'quiet_coupon_message'], 10, 3);
        add_filter('woocommerce_coupon_error', [$this, 'quiet_coupon_error'], 10, 3);
        add_action('woocommerce_removed_coupon', [$this, 'on_coupon_removed']);
        add_action('woocommerce_cart_emptied', [$this, 'forget_points']);
        add_action('woocommerce_before_calculate_totals', [$this, 'drop_unusable'], 5);
        add_action('woocommerce_after_calculate_totals', [$this, 'match_discount'], 20);

        // Orders
        add_action('woocommerce_checkout_create_order', [$this, 'save_order_meta']);
        add_action('woocommerce_store_api_checkout_update_order_meta', [$this, 'save_order_meta']);
        add_action('woocommerce_checkout_order_processed', [$this, 'on_order_placed'], 10);
        add_action('woocommerce_store_api_checkout_order_processed', [$this, 'on_order_placed'], 10);
        add_action('woocommerce_after_checkout_validation', [$this, 'validate_checkout'], 10, 2);

        // Classic cart and checkout
        add_action('wp_ajax_wiserewards_redeem', [$this, 'ajax_redeem']);

        // Cart and Checkout blocks
        add_action('woocommerce_blocks_loaded', [$this, 'register_store_api']);
    }

    /**
     * =================================================================
     * HOW MANY POINTS
     * =================================================================
     */

    private static function cart()
    {
        return function_exists('WC') && WC()->cart ? WC()->cart : null;
    }

    public static function can_redeem()
    {
        $s = Settings::get();
        return Settings::is_active() && $s['redeemEnabled'] && is_user_logged_in() && wc_coupons_enabled();
    }

    /**
     * Most points this cart takes: the set share of the products' price, worth no more than that.
     */
    public static function max_points_for_cart()
    {
        $cart = self::cart();
        if (!$cart) {
            return 0;
        }
        // From the products' prices as entered (with or without tax, like a fixed coupon's amount):
        // the cart's own subtotal is reset to 0 while its totals are being calculated.
        $subtotal = 0.0;
        foreach ($cart->get_cart() as $item) {
            if (isset($item['data']) && $item['data'] instanceof \WC_Product) {
                $subtotal += (float) $item['data']->get_price() * (float) $item['quantity'];
            }
        }
        // Less the discounts added as negative fees (Discount Manager), so points never push them out:
        // WooCommerce caps negative fees at what is left to pay. Other coupons are settled by match_discount().
        foreach ($cart->fees_api()->get_fees() as $fee) {
            if ((float) $fee->amount < 0) {
                $subtotal += (float) $fee->amount;
            }
        }
        // And other coupons, as far as the last calculation knows them
        foreach ($cart->get_applied_coupons() as $code) {
            if ($code !== self::CODE) {
                $subtotal -= (float) $cart->get_coupon_discount_amount($code, !wc_prices_include_tax());
            }
        }
        $max_value = max(0, $subtotal) * (int) Settings::get('redeemMaxPercent') / 100;
        return max(0, (int) floor($max_value / Settings::point_value() + 1e-6));
    }

    /**
     * Points the shopper can use on this cart now: what they chose, within their balance and the cart's limit.
     */
    public static function usable_points()
    {
        if (!self::can_redeem() || !WC()->session) {
            return 0;
        }
        $requested = (int) WC()->session->get(self::SESSION_KEY, 0);
        if ($requested <= 0) {
            return 0;
        }
        $points = min($requested, Ledger::balance(get_current_user_id()), self::max_points_for_cart());
        return $points >= max(1, (int) Settings::get('redeemMinPoints')) ? $points : 0;
    }

    /**
     * What the shopper sees before choosing: balance, the most they can use here, and what is applied.
     */
    public static function state()
    {
        $user_id = get_current_user_id();
        $balance = Ledger::balance($user_id);
        $max = min(max(0, $balance), self::max_points_for_cart());
        $applied = self::is_applied() ? self::usable_points() : 0;
        $min = max(1, (int) Settings::get('redeemMinPoints'));
        return [
            'canRedeem'    => self::can_redeem(),
            'balance'      => $balance,
            'balanceValue' => Settings::points_to_value(max(0, $balance)),
            'max'          => $max >= $min ? $max : 0,
            'min'          => $min,
            'applied'      => $applied,
            'appliedValue' => Settings::points_to_value($applied),
            'pointValue'   => Settings::point_value(),
        ];
    }

    public static function is_applied()
    {
        $cart = self::cart();
        return $cart && $cart->has_discount(self::CODE);
    }

    /**
     * Uses $points on the cart (0 removes them). Returns an error message, or '' on success.
     */
    public static function apply($points)
    {
        $cart = self::cart();
        $points = max(0, (int) $points);
        // Taking points off always works, even after the program or paying with points was switched off
        if ($cart && $points === 0) {
            if (WC()->session) {
                WC()->session->set(self::SESSION_KEY, 0);
            }
            if (self::is_applied()) {
                $cart->remove_coupon(self::CODE);
            }
            $cart->calculate_totals();
            return '';
        }
        if (!$cart || !is_user_logged_in()) {
            return __('Please sign in to use your points.', 'wisecampaign');
        }
        if (!self::can_redeem()) {
            return __('Points can’t be used on orders right now.', 'wisecampaign');
        }

        $state = self::state();
        if ($points < $state['min']) {
            /* translators: %s: points, such as "500 points" */
            return sprintf(__('You can use %s or more at a time.', 'wisecampaign'), Settings::label($state['min']));
        }
        if ($points > max(0, $state['balance'])) {
            /* translators: %s: points, such as "500 points" */
            return sprintf(__('You have %s.', 'wisecampaign'), Settings::label(max(0, $state['balance'])));
        }
        if ($points > $state['max']) {
            /* translators: %s: points, such as "500 points" */
            return sprintf(__('You can use up to %s on this order.', 'wisecampaign'), Settings::label($state['max']));
        }

        WC()->session->set(self::SESSION_KEY, $points);
        if (!self::is_applied() && !$cart->apply_coupon(self::CODE)) {
            WC()->session->set(self::SESSION_KEY, 0);
            $errors = wc_get_notices('error');
            wc_clear_notices();
            return $errors ? html_entity_decode(wp_strip_all_tags($errors[0]['notice']), ENT_QUOTES, 'UTF-8') : __('Your points could not be used on this order.', 'wisecampaign');
        }
        $cart->calculate_totals();
        return '';
    }

    /**
     * =================================================================
     * THE VIRTUAL COUPON
     * =================================================================
     */

    public function coupon_data($data, $code)
    {
        if ($data !== false || wc_format_coupon_code($code) !== self::CODE || is_admin() && !wp_doing_ajax()) {
            return $data;
        }
        $points = self::usable_points();
        if ($points <= 0) {
            return $data;
        }
        return [
            'discount_type'  => 'fixed_cart',
            'amount'         => Settings::points_to_value($points),
            'individual_use' => false,
            'usage_limit'    => 0,
            'virtual'        => true,
            'description'    => Settings::label($points),
        ];
    }

    public function coupon_label($label, $coupon)
    {
        if (!$coupon instanceof \WC_Coupon || $coupon->get_code() !== self::CODE) {
            return $label;
        }
        /* translators: 1: program name, 2: points used, such as "500 points" */
        return sprintf(__('%1$s (%2$s)', 'wisecampaign'), Settings::get('programName'), Settings::label(self::usable_points()));
    }

    // "Coupon code applied successfully" makes no sense for points
    public function quiet_coupon_message($message, $code, $coupon)
    {
        return $coupon instanceof \WC_Coupon && $coupon->get_code() === self::CODE ? '' : $message;
    }

    public function quiet_coupon_error($error, $code, $coupon)
    {
        return $coupon instanceof \WC_Coupon && $coupon->get_code() === self::CODE && (int) $code === \WC_Coupon::E_WC_COUPON_NOT_EXIST ? '' : $error;
    }

    public function on_coupon_removed($code)
    {
        if (wc_format_coupon_code($code) === self::CODE) {
            $this->forget_points();
        }
    }

    /**
     * The cart is emptied after a successful order (and by the shopper). Not cleared when the order
     * is placed: a declined payment keeps the cart, and a retry must keep its points.
     */
    public function forget_points()
    {
        if (function_exists('WC') && WC()->session) {
            WC()->session->set(self::SESSION_KEY, 0);
        }
    }

    /**
     * What the points coupon actually took off: WooCommerce applies it after other coupons and
     * caps it at what is left of each item's price. With prices entered with tax, that includes tax.
     */
    public static function applied_value($cart)
    {
        return (float) $cart->get_coupon_discount_amount(self::CODE, !wc_prices_include_tax());
    }

    /**
     * Uses only the points the discount needs, when other coupons left less to pay than the points
     * were worth: shoppers are never charged points for a discount they didn't get.
     */
    public function match_discount($cart)
    {
        static $running = false;
        if ($running || !$cart || !$cart->has_discount(self::CODE) || !WC()->session) {
            return;
        }
        $points = self::usable_points();
        $applied = self::applied_value($cart);
        if ($points <= 0 || $applied + 0.005 >= Settings::points_to_value($points)) {
            return;
        }
        $needed = (int) floor($applied / Settings::point_value() + 1e-6);
        $running = true;
        if ($needed >= max(1, (int) Settings::get('redeemMinPoints'))) {
            WC()->session->set(self::SESSION_KEY, $needed);
        } else {
            WC()->session->set(self::SESSION_KEY, 0);
            $cart->remove_coupon(self::CODE);
        }
        $cart->calculate_totals();
        $running = false;
    }

    /**
     * Takes the points off the cart when they can no longer be used (signed out, balance spent,
     * program switched off), before WooCommerce would show a "coupon does not exist" error.
     */
    public function drop_unusable($cart)
    {
        if ($cart && $cart->has_discount(self::CODE) && self::usable_points() <= 0) {
            $cart->remove_coupon(self::CODE);
        }
    }

    /**
     * =================================================================
     * ORDERS
     * =================================================================
     */

    /**
     * Records the points used on the order (blocks update draft orders many times).
     */
    public function save_order_meta($order)
    {
        $cart = self::cart();
        $points = $cart && self::is_applied() ? self::usable_points() : 0;
        if ($points > 0) {
            $order->update_meta_data(self::POINTS_META, $points);
            $order->update_meta_data(self::VALUE_META, round(min(Settings::points_to_value($points), self::applied_value($cart)), wc_get_price_decimals()));
        } else {
            $order->delete_meta_data(self::POINTS_META);
            $order->delete_meta_data(self::VALUE_META);
        }
    }

    public function on_order_placed($order)
    {
        $order = $order instanceof \WC_Order ? $order : wc_get_order($order);
        if (!$order) {
            return;
        }
        self::sync_order($order);
    }

    /**
     * Points used on an order are taken when it is placed and given back when it is cancelled or fully
     * refunded. A failed order keeps them, like WooCommerce keeps its coupon usage: it can still be paid
     * from My Account (giving them back would let them be spent twice), and the shopper or store can
     * cancel it to get them back. Partial refunds keep them: the shopper still has the rest of the order.
     */
    public static function sync_order(\WC_Order $order)
    {
        $points = (int) $order->get_meta(self::POINTS_META);
        $user_id = $order->get_customer_id();
        if ($points <= 0 || !$user_id) {
            return;
        }
        $live = !$order->has_status(['cancelled', 'refunded', 'checkout-draft', 'trash']);
        $target = $live ? -$points : 0;
        $current = Ledger::sum_for('order', $order->get_id(), ['redeem', 'restore'], $user_id);
        if ($target !== $current) {
            Ledger::add($user_id, $target - $current, $target < $current ? 'redeem' : 'restore', 'order', $order->get_id());
            $order->add_order_note($target < $current
                /* translators: 1: points, such as "300 points", 2: their value */
                ? sprintf(__('wiseRewards: the customer paid %2$s with %1$s.', 'wisecampaign'), Settings::label($current - $target), html_entity_decode(wp_strip_all_tags(wc_price((float) $order->get_meta(self::VALUE_META))), ENT_QUOTES, 'UTF-8'))
                /* translators: %s: points, such as "300 points" */
                : sprintf(__('wiseRewards: %s returned to the customer.', 'wisecampaign'), Settings::label($target - $current)));
        }
    }

    /**
     * Classic checkout: the balance may have changed since the points were chosen.
     */
    public function validate_checkout($data, $errors)
    {
        if (!self::is_applied()) {
            return;
        }
        $requested = (int) (WC()->session ? WC()->session->get(self::SESSION_KEY, 0) : 0);
        if ($requested > 0 && $requested > Ledger::balance(get_current_user_id())) {
            $errors->add('wiserewards', __('Your points balance changed. Please review the points used on this order.', 'wisecampaign'));
        }
    }

    /**
     * =================================================================
     * CLASSIC CART AND CHECKOUT
     * =================================================================
     */

    public function ajax_redeem()
    {
        check_ajax_referer('wiserewards', 'nonce');
        $error = self::apply(isset($_POST['points']) ? absint($_POST['points']) : 0);
        if ($error) {
            wp_send_json_error(['message' => $error]);
        }
        wp_send_json_success(['state' => self::state()]);
    }

    /**
     * =================================================================
     * CART AND CHECKOUT BLOCKS (Store API)
     * =================================================================
     */

    public function register_store_api()
    {
        if (!function_exists('woocommerce_store_api_register_endpoint_data')) {
            return;
        }
        woocommerce_store_api_register_endpoint_data([
            'endpoint'        => \Automattic\WooCommerce\StoreApi\Schemas\V1\CartSchema::IDENTIFIER,
            'namespace'       => 'wiserewards',
            'data_callback'   => [__CLASS__, 'store_api_data'],
            'schema_callback' => function () {
                return [];
            },
            'schema_type'     => ARRAY_A,
        ]);
        woocommerce_store_api_register_update_callback([
            'namespace' => 'wiserewards',
            'callback'  => function ($data) {
                $error = self::apply(isset($data['points']) ? absint($data['points']) : 0);
                if ($error) {
                    throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException('wiserewards_error', $error, 400);
                }
            },
        ]);
    }

    /**
     * Everything the blocks show: points this cart earns, and the redeem state.
     */
    public static function store_api_data()
    {
        if (!Settings::is_active()) {
            return ['active' => false];
        }
        $cart = self::cart();
        $user_id = get_current_user_id();
        $earn = $cart ? Storefront::cart_points($cart) : 0;
        $s = Settings::get();
        return [
            'active'         => true,
            'code'           => self::CODE,
            'loggedIn'       => (bool) $user_id,
            'earn'           => $earn,
            'earnHtml'       => $earn > 0 && $s['showCartMessage'] ? Settings::message($user_id ? 'cartMessage' : 'guestMessage', $earn) : '',
            'showGuest'      => (bool) $s['showGuestMessage'],
            'loginUrl'       => wc_get_page_permalink('myaccount'),
            'redeemOnCart'   => (bool) $s['redeemOnCart'],
            'redeemOnCheckout' => (bool) $s['redeemOnCheckout'],
            'programName'    => $s['programName'],
            'pointLabel'     => $s['pointLabel'],
            'pointsLabel'    => $s['pointsLabel'],
            'redeem'         => $user_id ? self::texts(self::state()) : null,
            /* translators: 1: program name, 2: points used, such as "500 points" */
            'couponLabel'    => sprintf(__('%1$s (%2$s)', 'wisecampaign'), $s['programName'], Settings::label(self::usable_points())),
        ];
    }

    /**
     * The redeem state with its numbers written out for the blocks ("1,250 points", "$12.50").
     */
    private static function texts(array $state)
    {
        $money = function ($amount) {
            return html_entity_decode(wp_strip_all_tags(wc_price($amount)), ENT_QUOTES, 'UTF-8');
        };
        return $state + [
            'balanceText'      => Settings::label(max(0, $state['balance'])),
            'balanceValueText' => $money($state['balanceValue']),
            'maxText'          => Settings::label($state['max']),
            'maxValueText'     => $money(Settings::points_to_value($state['max'])),
            'appliedText'      => Settings::label($state['applied']),
            'appliedValueText' => $money($state['appliedValue']),
        ];
    }
}
