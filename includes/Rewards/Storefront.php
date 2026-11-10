<?php

namespace WISECAMPAIGN\Rewards;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * What shoppers see: "Earn X points" on product pages, the points box in the classic cart and
 * checkout, a line in wiseCart, and the points page in My Account. The Cart and Checkout blocks
 * get the same through BlocksIntegration.
 */
class Storefront
{
    const ENDPOINT = 'reward-points';
    const REWRITE_OPTION = 'wiserewards_rewrite';

    public function __construct()
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueue']);

        add_action('woocommerce_before_add_to_cart_form', [$this, 'product_message']);
        add_action('woocommerce_before_cart_totals', [$this, 'cart_box']);
        add_action('woocommerce_review_order_before_payment', [$this, 'checkout_box']);
        add_filter('woocommerce_update_order_review_fragments', [$this, 'checkout_fragment']);
        add_action('wisecart_before_items', [$this, 'wisecart_line'], 20);

        // My Account
        add_filter('woocommerce_get_query_vars', [$this, 'query_vars']);
        add_filter('woocommerce_account_menu_items', [$this, 'account_menu']);
        add_filter('woocommerce_endpoint_' . self::ENDPOINT . '_title', [$this, 'account_title']);
        add_action('woocommerce_account_' . self::ENDPOINT . '_endpoint', [$this, 'account_page']);
        add_action('init', [$this, 'maybe_flush_rewrites'], 99);
    }

    /**
     * Points the products in a cart earn (before the points used on it, which earn nothing).
     */
    public static function cart_points($cart)
    {
        if (!$cart || $cart->is_empty()) {
            return 0;
        }
        $base = (float) $cart->get_cart_contents_total();
        foreach ($cart->get_fees() as $fee) {
            if ((float) $fee->total < 0) {
                $base += (float) $fee->total;
            }
        }
        return Earning::points_for_amount(max(0, $base), get_current_user_id());
    }

    public function enqueue()
    {
        if (!Settings::is_active()) {
            return;
        }
        $on_product = is_product() && Settings::get('showProductMessage');
        $on_cart = is_cart() || is_checkout() || is_account_page();
        // wiseCart shows its line on every page
        $wisecart = class_exists('\WISECAMPAIGN\Features\WiseCart') && \WISECAMPAIGN\Features\WiseCart::getInstance()->get_option('wc_enable_wisecart') === 'yes';
        if (!$on_product && !$on_cart && !$wisecart) {
            return;
        }
        $css = WISECAMPAIGN_DIR_PATH . 'includes/css/wiserewards.css';
        $js = WISECAMPAIGN_DIR_PATH . 'includes/js/wiserewards.js';
        wp_enqueue_style('wiserewards', WISECAMPAIGN_DIR_URL . 'includes/css/wiserewards.css', [], file_exists($css) ? filemtime($css) : WISECAMPAIGN_VERSION);
        if (!$on_product && !$on_cart) {
            return;
        }
        wp_enqueue_script('wiserewards', WISECAMPAIGN_DIR_URL . 'includes/js/wiserewards.js', ['jquery'], file_exists($js) ? filemtime($js) : WISECAMPAIGN_VERSION, true);
        $s = Settings::get();
        wp_localize_script('wiserewards', 'wiseRewards', [
            'ajaxUrl'     => admin_url('admin-ajax.php'),
            'nonce'       => wp_create_nonce('wiserewards'),
            // For variations: points = price / earnAmount * earnPoints * multiplier, rounded down
            'earnPoints'  => (int) $s['earnPoints'],
            'earnAmount'  => (float) $s['earnAmount'],
            'multiplier'  => Earning::multiplier(get_current_user_id()),
            'pointLabel'  => $s['pointLabel'],
            'pointsLabel' => $s['pointsLabel'],
            'i18n'        => [
                'error' => __('Your points could not be used. Please try again.', 'wisecampaign'),
            ],
        ]);
    }

    /**
     * =================================================================
     * PRODUCT PAGE
     * =================================================================
     */

    /**
     * Points for one of a product, from its price before tax like an order's. Variable products get
     * every variation's points, so the message follows the chosen variation.
     *
     * @return array [min, max, [variation id => points]]
     */
    private function product_points($product)
    {
        $user_id = get_current_user_id();
        $points = function ($p) use ($user_id) {
            return Earning::points_for_amount((float) wc_get_price_excluding_tax($p), $user_id);
        };
        if (!$product->is_type('variable')) {
            $n = $points($product);
            return [$n, $n, []];
        }
        $prices = $product->get_variation_prices(false);
        if (empty($prices['price'])) {
            return [0, 0, []];
        }
        $by_variation = [];
        foreach (array_slice(array_keys($prices['price']), 0, 200, true) as $variation_id) {
            $variation = wc_get_product($variation_id);
            if ($variation) {
                $by_variation[$variation_id] = $points($variation);
            }
        }
        return $by_variation ? [min($by_variation), max($by_variation), $by_variation] : [0, 0, []];
    }

    public function product_message()
    {
        global $product;
        if (!Settings::is_active() || !Settings::get('showProductMessage') || !$product instanceof \WC_Product) {
            return;
        }
        if ($product->is_type('grouped') || $product->is_type('external')) {
            return;
        }
        [$min, $max, $variations] = $this->product_points($product);
        if ($max <= 0) {
            return;
        }
        $text = Settings::message('productMessage', $max);
        if ($min !== $max) {
            // "Earn 50–120 points" until a variation is chosen
            $text = str_replace(esc_html(Settings::label($max)), esc_html(number_format_i18n($min) . '–' . Settings::label($max)), $text);
        }
        printf(
            '<div class="wiserewards-product"%s>%s<span class="wiserewards-product-text">%s</span></div>',
            $variations ? ' data-variations="' . esc_attr(wp_json_encode($variations)) . '"' : '',
            $this->icon(), // phpcs:ignore WordPress.Security.EscapeOutput
            wp_kses($text, ['strong' => ['class' => []]])
        );
    }

    private function icon()
    {
        return '<svg class="wiserewards-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>';
    }

    /**
     * =================================================================
     * CLASSIC CART AND CHECKOUT
     * =================================================================
     */

    public function cart_box()
    {
        $this->box('cart', Settings::get('redeemOnCart'));
    }

    /**
     * The payment template prints this hook on page load only, so updates come as a fragment.
     */
    public function checkout_box()
    {
        echo '<div id="wiserewards-checkout">';
        $this->box('checkout', Settings::get('redeemOnCheckout'));
        echo '</div>';
    }

    public function checkout_fragment($fragments)
    {
        ob_start();
        $this->checkout_box();
        $fragments['#wiserewards-checkout'] = ob_get_clean();
        return $fragments;
    }

    /**
     * "You'll earn X points" and, for signed-in shoppers with points, the form to use them.
     */
    private function box($where, $redeem_here)
    {
        if (!Settings::is_active() || !WC()->cart || WC()->cart->is_empty()) {
            return;
        }
        $s = Settings::get();
        $user_id = get_current_user_id();
        $earn = self::cart_points(WC()->cart);
        $state = Redemption::state();
        $show_earn = $earn > 0 && $s['showCartMessage'] && ($user_id || $s['showGuestMessage']);
        $show_redeem = $redeem_here && $state['canRedeem'] && ($state['applied'] > 0 || $state['max'] > 0);
        if (!$show_earn && !$show_redeem) {
            return;
        }
        ?>
        <div class="wiserewards-box" data-where="<?php echo esc_attr($where); ?>">
            <?php if ($show_earn) : ?>
                <p class="wiserewards-earn">
                    <?php echo $this->icon(); // phpcs:ignore WordPress.Security.EscapeOutput ?>
                    <span>
                        <?php echo wp_kses(Settings::message($user_id ? 'cartMessage' : 'guestMessage', $earn), ['strong' => ['class' => []]]); ?>
                        <?php if (!$user_id) : ?>
                            <a class="wiserewards-login" href="<?php echo esc_url(wc_get_page_permalink('myaccount')); ?>"><?php esc_html_e('Sign in', 'wisecampaign'); ?></a>
                        <?php endif; ?>
                    </span>
                </p>
            <?php endif; ?>
            <?php if ($show_redeem) : ?>
                <div class="wiserewards-redeem">
                    <?php if ($state['applied'] > 0) : ?>
                        <p class="wiserewards-applied">
                            <span><?php
                            printf(
                                /* translators: 1: points, such as "500 points", 2: amount */
                                esc_html__('Using %1$s (−%2$s)', 'wisecampaign'),
                                '<strong>' . esc_html(Settings::label($state['applied'])) . '</strong>',
                                wp_kses_post(wc_price($state['appliedValue']))
                            );
                            ?></span>
                            <button type="button" class="wiserewards-remove" data-points="0"><?php esc_html_e('Remove', 'wisecampaign'); ?></button>
                        </p>
                    <?php else : ?>
                        <p class="wiserewards-balance">
                            <?php
                            printf(
                                /* translators: 1: points, such as "1,250 points", 2: their value */
                                esc_html__('You have %1$s worth %2$s.', 'wisecampaign'),
                                '<strong>' . esc_html(Settings::label($state['balance'])) . '</strong>',
                                wp_kses_post(wc_price($state['balanceValue']))
                            );
                            ?>
                        </p>
                        <div class="wiserewards-form">
                            <label class="screen-reader-text" for="wiserewards-points-<?php echo esc_attr($where); ?>"><?php esc_html_e('Points to use', 'wisecampaign'); ?></label>
                            <input type="number" class="input-text wiserewards-input" id="wiserewards-points-<?php echo esc_attr($where); ?>" min="<?php echo esc_attr($state['min']); ?>" max="<?php echo esc_attr($state['max']); ?>" step="1" value="<?php echo esc_attr($state['max']); ?>" data-value="<?php echo esc_attr($state['pointValue']); ?>">
                            <button type="button" class="button wiserewards-apply"><?php esc_html_e('Use points', 'wisecampaign'); ?></button>
                        </div>
                        <p class="wiserewards-hint">
                            <?php
                            printf(
                                /* translators: 1: points, such as "1,000 points", 2: their value */
                                esc_html__('Up to %1$s (%2$s) on this order.', 'wisecampaign'),
                                esc_html(Settings::label($state['max'])),
                                wp_kses_post(wc_price(Settings::points_to_value($state['max'])))
                            );
                            ?>
                        </p>
                    <?php endif; ?>
                    <p class="wiserewards-error" role="alert" hidden></p>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * wiseCart: what the cart earns, and a reminder of the points to use at checkout.
     */
    public function wisecart_line($cart)
    {
        if (!Settings::is_active() || !$cart || $cart->is_empty()) {
            return;
        }
        $s = Settings::get();
        $user_id = get_current_user_id();
        $earn = self::cart_points($cart);
        $parts = [];
        if ($earn > 0 && $s['showCartMessage'] && ($user_id || $s['showGuestMessage'])) {
            $parts[] = Settings::message($user_id ? 'cartMessage' : 'guestMessage', $earn);
        }
        $state = $user_id ? Redemption::state() : null;
        if ($state && $state['canRedeem'] && $state['applied'] === 0 && $state['max'] > 0 && $s['redeemOnCheckout']) {
            /* translators: %s: points, such as "1,250 points" */
            $parts[] = sprintf(esc_html__('Use your %s at checkout.', 'wisecampaign'), '<strong>' . esc_html(Settings::label($state['balance'])) . '</strong>');
        }
        if (!$parts) {
            return;
        }
        echo '<div class="wiserewards-wisecart">' . $this->icon() . '<span>' . wp_kses(implode('<br>', $parts), ['strong' => ['class' => []], 'br' => []]) . '</span></div>'; // phpcs:ignore WordPress.Security.EscapeOutput
    }

    /**
     * =================================================================
     * MY ACCOUNT
     * =================================================================
     */

    private function account_on()
    {
        return Settings::is_active() && Settings::get('accountTab');
    }

    public function query_vars($vars)
    {
        if ($this->account_on()) {
            $vars[self::ENDPOINT] = self::ENDPOINT;
        }
        return $vars;
    }

    /**
     * WooCommerce adds its endpoints on init; the new one needs the rewrite rules saved once.
     */
    public function maybe_flush_rewrites()
    {
        // With plain permalinks the page works through ?reward-points, without rules
        if (!$this->account_on() || !get_option('permalink_structure')) {
            return;
        }
        $rules = get_option('rewrite_rules');
        $has_rule = is_array($rules) && preg_grep('#' . preg_quote(self::ENDPOINT, '#') . '#', array_keys($rules));
        // Saved rules can lose the endpoint (rules flushed while the module was off); at most one try an hour
        if (!$has_rule && !get_transient(self::REWRITE_OPTION)) {
            set_transient(self::REWRITE_OPTION, 1, HOUR_IN_SECONDS);
            flush_rewrite_rules(false);
        }
    }

    public function account_menu($items)
    {
        if (!$this->account_on()) {
            return $items;
        }
        $out = [];
        foreach ($items as $key => $label) {
            if ($key === 'customer-logout') {
                $out[self::ENDPOINT] = Settings::get('programName');
            }
            $out[$key] = $label;
        }
        if (!isset($out[self::ENDPOINT])) {
            $out[self::ENDPOINT] = Settings::get('programName');
        }
        return $out;
    }

    public function account_title()
    {
        return Settings::get('programName');
    }

    public function account_page()
    {
        $user_id = get_current_user_id();
        if (!$user_id || !$this->account_on()) {
            return;
        }
        $s = Settings::get();
        $balance = Ledger::balance($user_id);
        $page = max(1, absint($_GET['points-page'] ?? 1)); // phpcs:ignore WordPress.Security.NonceVerification
        $history = Ledger::history($user_id, $page, 10);
        $pending_signup = Earning::pending_signup_bonus($user_id);
        $expires = $balance > 0 ? Earning::expires_at($user_id) : null;
        $currency_example = wc_price((float) $s['earnAmount']);
        ?>
        <div class="wiserewards-account">
            <div class="wiserewards-summary">
                <div class="wiserewards-summary-main">
                    <span class="wiserewards-summary-label"><?php esc_html_e('Your balance', 'wisecampaign'); ?></span>
                    <strong class="wiserewards-summary-points"><?php echo esc_html(Settings::label($balance)); ?></strong>
                    <?php if ($s['redeemEnabled'] && $balance > 0) : ?>
                        <span class="wiserewards-summary-value">
                            <?php
                            /* translators: %s: amount */
                            printf(esc_html__('Worth %s off your next order', 'wisecampaign'), wp_kses_post(wc_price(Settings::points_to_value($balance))));
                            ?>
                        </span>
                    <?php endif; ?>
                </div>
                <?php
                /**
                 * Prints more about the customer's membership, such as their tier (wiseCampaign Pro).
                 *
                 * @param int $user_id
                 */
                do_action('wiserewards_account_summary', $user_id);
                ?>
            </div>

            <?php if ($expires) : ?>
                <p class="wiserewards-notice">
                    <?php
                    /* translators: %s: date */
                    printf(esc_html__('Your points expire on %s. Earning or using points moves this date.', 'wisecampaign'), esc_html(date_i18n(get_option('date_format'), $expires)));
                    ?>
                </p>
            <?php endif; ?>
            <?php if ($pending_signup > 0) : ?>
                <p class="wiserewards-notice">
                    <?php
                    /* translators: %s: points, such as "100 points" */
                    printf(esc_html__('Your welcome bonus of %s unlocks with your first order.', 'wisecampaign'), '<strong>' . esc_html(Settings::label($pending_signup)) . '</strong>');
                    ?>
                </p>
            <?php endif; ?>

            <h3><?php esc_html_e('Ways to earn', 'wisecampaign'); ?></h3>
            <ul class="wiserewards-ways">
                <?php if ($s['earnPurchase']) : ?>
                    <li>
                        <?php
                        /* translators: 1: points, such as "1 point", 2: amount */
                        printf(esc_html__('%1$s for every %2$s you spend', 'wisecampaign'), '<strong>' . esc_html(Settings::label((int) $s['earnPoints'])) . '</strong>', wp_kses_post($currency_example));
                        ?>
                    </li>
                <?php endif; ?>
                <?php if ($s['earnReview'] && (int) $s['reviewPoints'] > 0) : ?>
                    <li>
                        <?php
                        /* translators: %s: points, such as "50 points" */
                        printf(esc_html__('%s for reviewing a product you bought', 'wisecampaign'), '<strong>' . esc_html(Settings::label((int) $s['reviewPoints'])) . '</strong>');
                        ?>
                    </li>
                <?php endif; ?>
                <?php
                /**
                 * Prints more ways to earn, such as referrals and birthdays (wiseCampaign Pro).
                 *
                 * @param int $user_id
                 */
                do_action('wiserewards_account_ways', $user_id);
                ?>
            </ul>
            <?php if ($s['redeemEnabled']) : ?>
                <p class="wiserewards-rate">
                    <?php
                    /* translators: 1: points, such as "100 points", 2: amount */
                    printf(esc_html__('%1$s = %2$s off at checkout.', 'wisecampaign'), '<strong>' . esc_html(Settings::label((int) $s['redeemPoints'])) . '</strong>', wp_kses_post(wc_price((float) $s['redeemAmount'])));
                    ?>
                </p>
            <?php endif; ?>

            <?php
            /**
             * Prints more sections, such as the referral link and birthday (wiseCampaign Pro).
             *
             * @param int $user_id
             */
            do_action('wiserewards_account_sections', $user_id);
            ?>

            <h3><?php esc_html_e('History', 'wisecampaign'); ?></h3>
            <?php if (!$history['rows']) : ?>
                <p class="wiserewards-empty"><?php esc_html_e('No points yet. Your first order starts the count.', 'wisecampaign'); ?></p>
            <?php else : ?>
                <table class="woocommerce-table shop_table shop_table_responsive wiserewards-history">
                    <thead>
                        <tr>
                            <th><?php esc_html_e('Date', 'wisecampaign'); ?></th>
                            <th><?php esc_html_e('Activity', 'wisecampaign'); ?></th>
                            <th class="wiserewards-num"><?php echo esc_html(ucfirst($s['pointsLabel'])); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($history['rows'] as $row) : ?>
                            <tr>
                                <td data-title="<?php esc_attr_e('Date', 'wisecampaign'); ?>"><?php echo esc_html($row['dateText']); ?></td>
                                <td data-title="<?php esc_attr_e('Activity', 'wisecampaign'); ?>"><?php echo esc_html($row['text']); ?></td>
                                <td class="wiserewards-num <?php echo $row['points'] < 0 ? 'is-minus' : 'is-plus'; ?>" data-title="<?php echo esc_attr(ucfirst($s['pointsLabel'])); ?>"><?php echo esc_html(($row['points'] > 0 ? '+' : '−') . number_format_i18n(abs($row['points']))); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php
                $pages = (int) ceil($history['total'] / 10);
                if ($pages > 1) :
                    ?>
                    <div class="woocommerce-pagination wiserewards-pages">
                        <?php if ($page > 1) : ?>
                            <a class="woocommerce-button button" href="<?php echo esc_url(add_query_arg('points-page', $page - 1)); ?>"><?php esc_html_e('Newer', 'wisecampaign'); ?></a>
                        <?php endif; ?>
                        <?php if ($page < $pages) : ?>
                            <a class="woocommerce-button button" href="<?php echo esc_url(add_query_arg('points-page', $page + 1)); ?>"><?php esc_html_e('Older', 'wisecampaign'); ?></a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
        <?php
    }
}
