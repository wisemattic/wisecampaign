<?php

namespace WISECAMPAIGN\Features;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

use WISECAMPAIGN\Traits\SingletonTrait;

class WiseCart
{
    use SingletonTrait;

    private $settings_group = 'wisecart_settings_group';
    private $options_key = 'wisecart_options';
    private $options = [];

    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_rest_routes']);

        // Progress bar goals: other plugins (such as wiseCampaign Pro's Discount Manager) add theirs to this filter.
        add_filter('wisecart_progress_goals', [$this, 'add_free_shipping_goal'], 10, 2);
        add_action('wisecart_before_items', [$this, 'render_progress_bar'], 10);

        // Options load on init, before the storefront hooks below are registered.
        add_action('init', [$this, 'init_hooks']);
    }

    public function init_hooks()
    {
        $this->load_options();

        if ($this->get_option('wc_enable_wisecart') === 'yes') {
            add_action('wp_head', [$this, 'print_dynamic_styles']);
            add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
            add_action('wp_footer', [$this, 'render_cart_components']);
            add_filter('woocommerce_add_to_cart_fragments', [$this, 'update_cart_fragments']);
            add_filter('woocommerce_add_to_cart_redirect', [$this, 'direct_checkout_redirect'], 99);
            add_action('template_redirect', [$this, 'replace_default_pages']);
            add_action('wp_ajax_wisecart_apply_coupon', [$this, 'ajax_apply_coupon']);
            add_action('wp_ajax_nopriv_wisecart_apply_coupon', [$this, 'ajax_apply_coupon']);
            add_action('wp_ajax_wisecart_update_quantity', [$this, 'ajax_update_quantity']);
            add_action('wp_ajax_nopriv_wisecart_update_quantity', [$this, 'ajax_update_quantity']);

            add_action('wp_ajax_get_wisecart_content', [$this, 'ajax_get_cart_content']);
            add_action('wp_ajax_nopriv_get_wisecart_content', [$this, 'ajax_get_cart_content']);
            
            add_action('wp_ajax_wisecart_load_checkout', [$this, 'ajax_load_checkout_content']);
            add_action('wp_ajax_nopriv_wisecart_load_checkout', [$this, 'ajax_load_checkout_content']);
            
            add_action('woocommerce_thankyou', [$this, 'track_wisecart_order_success']);
            add_action('wp_ajax_wisecart_mark_success_viewed', [$this, 'ajax_mark_success_viewed']);
            add_action('wp_ajax_nopriv_wisecart_mark_success_viewed', [$this, 'ajax_mark_success_viewed']);
        }
    }

    private function load_options()
    {
        $defaults = $this->get_defaults();
        $saved_options = get_option($this->options_key, []);
        $this->options = wp_parse_args($saved_options, $defaults);
    }

    public function get_option($key)
    {
        return $this->options[$key] ?? null;
    }

    /**
     * Default value of every wiseCart setting. Toggles are stored as "yes" / "no".
     */
    private function get_defaults()
    {
        return [
            'wc_enable_wisecart'         => 'no',
            'wc_auto_open_cart'          => 'yes',
            'wc_direct_checkout'         => 'no',
            'wc_show_product_images'     => 'yes',
            'wc_show_product_prices'     => 'yes',
            'wc_show_quantity_pickers'   => 'yes',
            'wc_show_delete_buttons'     => 'yes',
            'wc_show_coupons'            => 'yes',
            'wc_show_order_subtotal'     => 'yes',
            'wc_show_keep_shopping'      => 'yes',
            'wc_show_progress_bar'       => 'yes',
            'wc_show_discounts'          => 'yes',
            'wc_icon_position'           => 'bottom_right',
            'wc_button_style'            => 'icon_only',
            'wc_button_text'             => 'Cart',
            'wc_replace_cart_page'       => 'yes',
            'wc_replace_checkout_page'   => 'yes',
            'wc_button_background'       => '#1d1d1d',
            'wc_icon_color'              => '#ffffff',
            'wc_count_background'        => '#d63638',
            'wc_count_text_color'        => '#ffffff',
            'wc_border_radius'           => '50',
            'wc_checkout_btn_background' => '#28a745',
            'wc_checkout_text_color'     => '#ffffff',
            'wc_continue_btn_background' => '#e9ecef',
            'wc_continue_btn_text_color' => '#343a40',
            'wc_success_message_enable'  => 'yes',
            'wc_success_message_title'   => 'Order Placed Successfully!',
            'wc_success_message_text'    => 'Thank you for your order! We\'ve received your payment and will process your order shortly.',
            'wc_success_redirect_delay'  => '10',
        ];
    }

    /**
     * =================================================================
     * ADMIN APP (React module: modules/wise-cart)
     * =================================================================
     */

    public function register_rest_routes()
    {
        $permission = function () {
            return current_user_can('manage_options');
        };

        register_rest_route('wisecampaign/v1', '/wisecart', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'rest_get_settings'],
                'permission_callback' => $permission,
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'rest_save_settings'],
                'permission_callback' => $permission,
            ],
        ]);

        register_rest_route('wisecampaign/v1', '/wisecart/status', [
            'methods'             => 'POST',
            'callback'            => [$this, 'rest_set_status'],
            'permission_callback' => $permission,
        ]);
    }

    /**
     * Settings plus a sample cart for the live preview.
     */
    public function rest_get_settings()
    {
        $css_path = WISECAMPAIGN_DIR_PATH . 'includes/css/wisecart.css';

        $response = rest_ensure_response([
            'settings'       => $this->get_saved_settings(),
            'defaults'       => $this->get_defaults(),
            'sample'         => $this->get_preview_cart(),
            'goals'          => $this->get_progress_goals(null),
            'currency'       => [
                'symbol'      => html_entity_decode(get_woocommerce_currency_symbol()),
                'position'    => get_option('woocommerce_currency_pos', 'left'),
                'decimals'    => wc_get_price_decimals(),
                'decimalSep'  => wc_get_price_decimal_separator(),
                'thousandSep' => wc_get_price_thousand_separator(),
            ],
            'couponsEnabled' => function_exists('wc_coupons_enabled') && wc_coupons_enabled(),
            // The preview loads the storefront stylesheet, so it always matches the live cart.
            'cssUrl'         => WISECAMPAIGN_DIR_URL . 'includes/css/wisecart.css?ver=' . (file_exists($css_path) ? filemtime($css_path) : '1'),
        ]);
        // Some hosts cache REST responses; settings must always be fresh.
        $response->header('Cache-Control', 'no-store');
        return $response;
    }

    public function rest_save_settings(\WP_REST_Request $request)
    {
        $settings = $this->sanitize_settings($request->get_json_params());
        // On/off has its own endpoint, so saving the form never flips it.
        $settings['wc_enable_wisecart'] = $this->get_saved_settings()['wc_enable_wisecart'];
        update_option($this->options_key, $settings);

        return rest_ensure_response(['success' => true, 'settings' => $this->get_saved_settings()]);
    }

    public function rest_set_status(\WP_REST_Request $request)
    {
        $settings = $this->get_saved_settings();
        $settings['wc_enable_wisecart'] = filter_var($request->get_param('enabled'), FILTER_VALIDATE_BOOLEAN) ? 'yes' : 'no';
        update_option($this->options_key, $settings);

        return rest_ensure_response(['success' => true, 'enabled' => $settings['wc_enable_wisecart']]);
    }

    private function get_saved_settings()
    {
        $saved = get_option($this->options_key, []);
        return wp_parse_args(is_array($saved) ? $saved : [], $this->get_defaults());
    }

    /**
     * Sanitizes a full settings payload; unknown or invalid values fall back to the defaults.
     */
    private function sanitize_settings($input)
    {
        $input = is_array($input) ? $input : [];
        $defaults = $this->get_defaults();

        // Reads a scalar field as a string; anything else (arrays, objects) counts as missing.
        $str = function ($key) use ($input, $defaults) {
            return isset($input[$key]) && is_scalar($input[$key]) ? (string) $input[$key] : (string) $defaults[$key];
        };
        $toggle = function ($key) use ($str) {
            $value = $str($key);
            return ($value === 'yes' || filter_var($value, FILTER_VALIDATE_BOOLEAN)) ? 'yes' : 'no';
        };
        $enum = function ($key, $allowed) use ($str, $defaults) {
            $value = $str($key);
            return in_array($value, $allowed, true) ? $value : $defaults[$key];
        };
        $color = function ($key) use ($str, $defaults) {
            return sanitize_hex_color($str($key)) ?: $defaults[$key];
        };
        $int = function ($key, $min, $max) use ($str) {
            return (string) max($min, min($max, absint($str($key))));
        };
        $text = function ($key) use ($str, $defaults) {
            $value = sanitize_text_field($str($key));
            return $value !== '' ? $value : $defaults[$key];
        };

        $settings = [];
        foreach ($defaults as $key => $default) {
            if ($default === 'yes' || $default === 'no') {
                $settings[$key] = $toggle($key);
            }
        }

        return array_merge($settings, [
            'wc_icon_position'           => $enum('wc_icon_position', ['bottom_right', 'bottom_left', 'middle_right', 'middle_left', 'top_right', 'top_left', 'hidden']),
            'wc_button_style'            => $enum('wc_button_style', ['icon_only', 'text_only', 'icon_and_text']),
            'wc_button_text'             => $text('wc_button_text'),
            'wc_button_background'       => $color('wc_button_background'),
            'wc_icon_color'              => $color('wc_icon_color'),
            'wc_count_background'        => $color('wc_count_background'),
            'wc_count_text_color'        => $color('wc_count_text_color'),
            'wc_border_radius'           => $int('wc_border_radius', 0, 100),
            'wc_checkout_btn_background' => $color('wc_checkout_btn_background'),
            'wc_checkout_text_color'     => $color('wc_checkout_text_color'),
            'wc_continue_btn_background' => $color('wc_continue_btn_background'),
            'wc_continue_btn_text_color' => $color('wc_continue_btn_text_color'),
            'wc_success_message_title'   => $text('wc_success_message_title'),
            'wc_success_message_text'    => sanitize_textarea_field($str('wc_success_message_text')),
            'wc_success_redirect_delay'  => $int('wc_success_redirect_delay', 1, 120),
        ]);
    }

    /**
     * A few of the store's products as cart lines, so the preview looks like the real cart.
     */
    private function get_preview_cart()
    {
        $placeholder = function_exists('wc_placeholder_img_src') ? wc_placeholder_img_src('thumbnail') : '';
        $quantities = [1, 2, 1];
        $lines = [];

        foreach (wc_get_products(['limit' => 3, 'status' => 'publish', 'orderby' => 'date', 'order' => 'DESC']) as $index => $product) {
            $lines[] = [
                'name'  => $product->get_name(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') ?: $placeholder,
                'price' => (float) $product->get_price(),
                'qty'   => $quantities[$index],
            ];
        }

        // Demo lines until the store has products
        if (empty($lines)) {
            foreach ([['Wireless Headphones', 79], ['Leather Wallet', 25], ['Water Bottle', 15]] as $index => $demo) {
                $lines[] = ['name' => $demo[0], 'image' => $placeholder, 'price' => (float) $demo[1], 'qty' => $quantities[$index]];
            }
        }

        $subtotal = 0;
        $count = 0;
        foreach ($lines as &$line) {
            $subtotal += $line['price'] * $line['qty'];
            $count += $line['qty'];
            $line['priceHtml'] = wc_price($line['price']);
            unset($line['price']);
        }
        unset($line);

        return [
            'items'        => $lines,
            'subtotal'     => $subtotal,
            'subtotalHtml' => wc_price($subtotal),
            'count'        => $count,
        ];
    }

    /**
     * =================================================================
     * PROGRESS BAR & SAVINGS
     * =================================================================
     */

    /**
     * The free shipping method that applies to this cart, when it unlocks at a minimum amount.
     * Without a cart (admin preview) the store's own address decides the shipping zone.
     */
    private function get_free_shipping_method($cart)
    {
        if (!class_exists('WC_Shipping_Zones') || !wc_shipping_enabled()) {
            return null;
        }

        if ($cart && $cart->needs_shipping()) {
            $packages = $cart->get_shipping_packages();
            $package = reset($packages);
        } else {
            $package = ['destination' => [
                'country'  => WC()->countries->get_base_country(),
                'state'    => WC()->countries->get_base_state(),
                'postcode' => WC()->countries->get_base_postcode(),
            ]];
        }
        if (empty($package)) {
            return null;
        }

        $zone = \WC_Shipping_Zones::get_zone_matching_package($package);
        foreach ($zone->get_shipping_methods(true) as $method) {
            if ($method->id === 'free_shipping' && in_array($method->requires, ['min_amount', 'either'], true) && (float) $method->min_amount > 0) {
                return $method;
            }
        }
        return null;
    }

    public function add_free_shipping_goal($goals, $cart)
    {
        $method = $this->get_free_shipping_method($cart);
        if (!$method) {
            return $goals;
        }

        $goal = [
            'id'        => 'free_shipping',
            'label'     => __('Free shipping', 'wisecampaign'),
            'threshold' => (float) $method->min_amount,
            'icon'      => 'truck',
        ];
        // Same amount WooCommerce compares with the minimum: subtotal, after coupons unless the method ignores them.
        if ($cart) {
            $current = (float) $cart->get_displayed_subtotal();
            if ($method->ignore_discounts !== 'yes') {
                $current -= (float) $cart->get_discount_total();
                if ($cart->display_prices_including_tax()) {
                    $current -= (float) $cart->get_discount_tax();
                }
            }
            $goal['current'] = $current;
        }
        $goals[] = $goal;
        return $goals;
    }

    /**
     * All progress bar goals, cheapest first. Each goal: id, label, threshold, icon (truck|gift|tag) and
     * optionally current, the cart amount that goal is measured against.
     */
    private function get_progress_goals($cart)
    {
        $goals = [];
        foreach ((array) apply_filters('wisecart_progress_goals', [], $cart) as $goal) {
            if (!is_array($goal) || empty($goal['id']) || empty($goal['label']) || (float) ($goal['threshold'] ?? 0) <= 0) {
                continue;
            }
            $goals[$goal['id']] = [
                'id'        => (string) $goal['id'],
                'label'     => wp_strip_all_tags((string) $goal['label']),
                'threshold' => (float) $goal['threshold'],
                'icon'      => in_array($goal['icon'] ?? '', ['truck', 'gift', 'tag'], true) ? $goal['icon'] : 'gift',
                'current'   => isset($goal['current']) ? (float) $goal['current'] : null,
            ];
        }
        $goals = array_values($goals);
        usort($goals, function ($a, $b) {
            return $a['threshold'] <=> $b['threshold'];
        });
        return $goals;
    }

    public function render_progress_bar($cart)
    {
        if ($this->get_option('wc_show_progress_bar') !== 'yes' || !$cart) {
            return;
        }
        $goals = $this->get_progress_goals($cart);
        if (empty($goals)) {
            return;
        }

        $icons = ['truck' => '🚚', 'gift' => '🎁', 'tag' => '🏷️'];
        $subtotal = (float) $cart->get_displayed_subtotal();
        $max = end($goals)['threshold'];
        $next = null;
        $reached = [];
        foreach ($goals as $i => $goal) {
            $current = $goal['current'] ?? $subtotal;
            $goals[$i]['reached'] = $current >= $goal['threshold'];
            if ($goals[$i]['reached']) {
                $reached[] = $goal['label'];
            } elseif (!$next) {
                $next = $goal + ['remaining' => $goal['threshold'] - $current];
            }
        }

        if ($next) {
            $message = $icons[$next['icon']] . ' ' . sprintf(
                /* translators: 1: amount still needed, 2: reward name */
                __('Add %1$s more to get %2$s', 'wisecampaign'),
                '<span class="wisecart-progress-amount">' . wc_price($next['remaining']) . '</span>',
                '<strong>' . esc_html($next['label']) . '</strong>'
            );
        } else {
            /* translators: %s: names of the unlocked rewards */
            $message = '🎉 ' . sprintf(__('You unlocked %s!', 'wisecampaign'), '<strong>' . esc_html(implode(', ', $reached)) . '</strong>');
        }
        ?>
        <div class="wisecart-progress<?php echo $next ? '' : ' is-complete'; ?>">
            <p class="wisecart-progress-message"><?php echo wp_kses_post($message); ?></p>
            <div class="wisecart-progress-track">
                <span class="wisecart-progress-fill" style="width: <?php echo esc_attr(min(100, round($subtotal / $max * 100, 2))); ?>%;"></span>
                <?php foreach ($goals as $goal) : ?>
                    <span class="wisecart-progress-marker<?php echo $goal['reached'] ? ' is-reached' : ''; ?>" style="left: <?php echo esc_attr(round($goal['threshold'] / $max * 100, 2)); ?>%;" title="<?php echo esc_attr($goal['label']); ?>"><?php echo $icons[$goal['icon']]; ?></span>
                <?php endforeach; ?>
            </div>
            <?php if (count($goals) > 1) : ?>
                <div class="wisecart-progress-goals">
                    <?php foreach ($goals as $goal) : ?>
                        <span class="wisecart-progress-goal<?php echo $goal['reached'] ? ' is-reached' : ''; ?>"><?php echo $goal['reached'] ? '✓' : $icons[$goal['icon']]; ?> <?php echo esc_html($goal['label']); ?></span>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Coupon and fee lines (Discount Manager adds its discounts as negative fees), the savings and the total.
     * Shows nothing when the cart has neither, because the total would equal the subtotal.
     */
    public function render_totals_adjustments()
    {
        $cart = WC()->cart;
        if (!$cart || (empty($cart->get_coupons()) && empty($cart->get_fees()))) {
            return;
        }

        $incl_tax = $cart->display_prices_including_tax();
        $savings = 0;
        ?>
        <div class="wisecart-adjustments">
            <?php foreach ($cart->get_coupons() as $code => $coupon) :
                $savings += (float) $cart->get_coupon_discount_amount($code, !$incl_tax);
                ?>
                <div class="wisecart-adjustment is-saving">
                    <span><?php wc_cart_totals_coupon_label($coupon); ?></span>
                    <span><?php wc_cart_totals_coupon_html($coupon); ?></span>
                </div>
            <?php endforeach; ?>
            <?php foreach ($cart->get_fees() as $fee) :
                $amount = $incl_tax ? (float) $fee->total + (float) $fee->tax : (float) $fee->total;
                if ($amount < 0) {
                    $savings -= $amount;
                }
                ?>
                <div class="wisecart-adjustment<?php echo $amount < 0 ? ' is-saving' : ''; ?>">
                    <span><?php echo esc_html($fee->name); ?></span>
                    <span><?php wc_cart_totals_fee_html($fee); ?></span>
                </div>
            <?php endforeach; ?>
            <?php
            // Total before shipping: items after coupons, plus fees.
            $total = (float) $cart->get_cart_contents_total() + (float) $cart->get_fee_total();
            if ($incl_tax) {
                $total += (float) $cart->get_cart_contents_tax() + (float) $cart->get_fee_tax();
            }
            ?>
            <div class="wisecart-grand-total">
                <strong><?php esc_html_e('Total', 'wisecampaign'); ?></strong>
                <strong><?php echo wc_price(max(0, $total)); ?></strong>
            </div>
            <?php if ($savings > 0) : ?>
                <div class="wisecart-savings">
                    <?php
                    /* translators: %s: amount saved */
                    printf(esc_html__('🎉 You save %s on this order', 'wisecampaign'), wp_kses_post(wc_price($savings)));
                    ?>
                </div>
            <?php endif; ?>
            <?php if ($cart->needs_shipping()) : ?>
                <p class="wisecart-shipping-note"><?php esc_html_e('Shipping is calculated at checkout.', 'wisecampaign'); ?></p>
            <?php endif; ?>
        </div>
        <?php
    }

    public function print_dynamic_styles()
    {
        $button_bg = esc_attr($this->get_option('wc_button_background'));
        $icon_color = esc_attr($this->get_option('wc_icon_color'));
        $border_radius = esc_attr($this->get_option('wc_border_radius'));
        $count_bg = esc_attr($this->get_option('wc_count_background'));
        $count_text = esc_attr($this->get_option('wc_count_text_color'));
        $checkout_bg = esc_attr($this->get_option('wc_checkout_btn_background'));
        $checkout_text = esc_attr($this->get_option('wc_checkout_text_color'));
        $continue_bg = esc_attr($this->get_option('wc_continue_btn_background'));
        $continue_text = esc_attr($this->get_option('wc_continue_btn_text_color'));

        $style = ":root {
            --wc-button-bg: {$button_bg};
            --wc-icon-color: {$icon_color};
            --wc-button-radius: {$border_radius}px;
            --wc-count-bg: {$count_bg};
            --wc-count-text: {$count_text};
            --wc-checkout-bg: {$checkout_bg};
            --wc-checkout-text: {$checkout_text};
            --wc-continue-bg: {$continue_bg};
            --wc-continue-text: {$continue_text};
        }";

        echo "<style id='wisecampaign-wisecart-styles'>{$style}</style>";
    }

    public function enqueue_frontend_assets()
    {
        if ( ! function_exists( 'WC' ) || is_admin() ) {
            return;
        }

        $version = '3.5.0';
        wp_enqueue_style( 'wisecampaign-wisecart', WISECAMPAIGN_DIR_URL . 'includes/css/wisecart.css', [], $version );
        wp_enqueue_script( 'wisecampaign-wisecart', WISECAMPAIGN_DIR_URL . 'includes/js/wisecart.js', [ 'jquery', 'wc-cart-fragments' ], $version, true );
        
        if ( 'yes' === $this->get_option( 'wc_replace_checkout_page' ) ) {
            wp_enqueue_script( 'wc-checkout' );
        }

        $script_data = [
            'ajax_url'           => admin_url( 'admin-ajax.php' ),
            'nonce'              => wp_create_nonce( 'wisecart_nonce' ),
            'apply_coupon_nonce' => wp_create_nonce( 'wisecart-apply-coupon' ),
            'update_cart_nonce'  => wp_create_nonce( 'wisecart-update-cart' ),
            'autoOpen'           => ( 'yes' === $this->get_option( 'wc_auto_open_cart' ) ),
            'replaceCheckout'    => ( 'yes' === $this->get_option( 'wc_replace_checkout_page' ) ),
            'loadCheckoutNonce'  => wp_create_nonce( 'wisecart-load-checkout' ),
            'successViewedNonce' => wp_create_nonce( 'wisecart-success-viewed' ),
            'checkoutUrl'        => function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : '/checkout',
            'successSettings'    => [
                'enabled'       => ( 'yes' === $this->get_option( 'wc_success_message_enable' ) ),
                'title'         => $this->get_option( 'wc_success_message_title' ),
                'message'       => $this->get_option( 'wc_success_message_text' ),
                'redirectDelay' => max( 1, (int) $this->get_option( 'wc_success_redirect_delay' ) ),
            ],
        ];
        wp_localize_script( 'wisecampaign-wisecart', 'wiseCartData', $script_data );
    }

    public function render_cart_components()
    {
        if ($this->get_option('wc_icon_position') === 'hidden')
            return;
        $item_count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
        $count_visibility_class = $item_count > 0 ? '' : ' wisecart-count-hidden';
        $position_class = 'wisecart-trigger--' . str_replace('_', '-', $this->get_option('wc_icon_position'));
        $style = $this->get_option('wc_button_style');
        $text = esc_html($this->get_option('wc_button_text'));
        $style_class = 'wisecart-trigger--' . $style;
        echo '<button class="wisecart-trigger ' . esc_attr($position_class) . ' ' . esc_attr($style_class) . '" aria-label="' . esc_attr__('Open Cart', 'wisecampaign') . '">';
        $icon_svg = '<svg class="wisecart-trigger-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
        $text_span = '<span class="wisecart-trigger-text">' . $text . '</span>';
        if ($style === 'icon_and_text') {
            echo $icon_svg . $text_span;
        } elseif ($style === 'text_only') {
            echo $text_span;
        } else {
            echo $icon_svg;
        }
        echo '<span class="wisecart-trigger-count' . esc_attr($count_visibility_class) . '">' . esc_html($item_count) . '</span></button>';
        echo '<div id="wisecart-container" class="wisecart-container">' . $this->get_cart_content_html() . '</div>';
        echo '<div class="wisecart-overlay"></div>';
    }

    public function get_cart_content_html()
    {
        // Discounts added as fees (for example by Discount Manager) only exist after the totals are calculated.
        if (WC()->cart && !WC()->cart->is_empty() && !did_action('woocommerce_after_calculate_totals')) {
            WC()->cart->calculate_totals();
        }

        ob_start();
        $template_path = WISECAMPAIGN_DIR_PATH . 'includes/features/templates/wise-cart-content.php';
        if (file_exists($template_path)) {
            include($template_path);
        }
        return ob_get_clean();
    }

    public function update_cart_fragments($fragments)
    {
        $item_count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
        $count_visibility_class = $item_count > 0 ? '' : ' wisecart-count-hidden';
        $fragments['div#wisecart-container'] = '<div id="wisecart-container" class="wisecart-container">' . $this->get_cart_content_html() . '</div>';
        $fragments['span.wisecart-trigger-count'] = '<span class="wisecart-trigger-count' . esc_attr($count_visibility_class) . '">' . esc_html($item_count) . '</span>';
        return $fragments;
    }

    public function direct_checkout_redirect($url)
    {
        if ($this->get_option('wc_direct_checkout') === 'yes' && !is_cart() && !is_checkout())
            return wc_get_checkout_url();
        return $url;
    }

    public function replace_default_pages()
    {
        if (function_exists('is_wc_endpoint_url') && is_wc_endpoint_url('order-received')) {
            return;
        }

        if (($this->get_option('wc_replace_cart_page') === 'yes' && is_cart()) || ($this->get_option('wc_replace_checkout_page') === 'yes' && is_checkout())) {
            // wisecart.js opens the drawer on the shop page, on its checkout form when the shopper was headed to checkout
            wp_safe_redirect(add_query_arg('open-wisecart', is_checkout() ? 'checkout' : 'cart', wc_get_page_permalink('shop')));
            exit();
        }
    }
    
    public function ajax_load_checkout_content()
    {
        check_ajax_referer( 'wisecart-load-checkout', 'nonce' );

        if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
            wp_send_json_error( [ 'html' => '<div class="woocommerce-error" style="margin:1.5rem;">' . esc_html__( 'WooCommerce is not available.', 'wisecampaign' ) . '</div>' ] );
        }

        if ( WC()->cart->is_empty() ) {
            $error_html  = '<div class="wisecart-empty" style="padding:1.5rem;">';
            $error_html .= '<svg class="wisecart-empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">';
            $error_html .= '<circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />';
            $error_html .= '<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />';
            $error_html .= '</svg>';
            $error_html .= '<h3>' . esc_html__( 'Your cart is empty', 'wisecampaign' ) . '</h3>';
            $error_html .= '<p>' . esc_html__( 'Please add some products to your cart before checking out.', 'wisecampaign' ) . '</p>';
            $error_html .= '</div>';
            wp_send_json_error( [ 'html' => $error_html ] );
        }

        try {
            if ( ! did_action( 'wp_loaded' ) ) {
                wp_send_json_error( [ 'html' => '<div class="woocommerce-error" style="margin:1.5rem;">' . esc_html__( 'WordPress not fully loaded. Please refresh and try again.', 'wisecampaign' ) . '</div>' ] );
            }

            if ( ! WC()->session ) {
                WC()->session = new \WC_Session_Handler();
                WC()->session->init();
            }

            WC()->cart->calculate_totals();
            ob_start();
            $checkout_content = do_shortcode( '[woocommerce_checkout]' );
            if ( empty( $checkout_content ) || strlen( trim( $checkout_content ) ) < 50 ) {
                ob_end_clean();
                if ( function_exists( 'woocommerce_checkout' ) ) {
                    ob_start();
                    woocommerce_checkout();
                    $checkout_content = ob_get_clean();
                } else {
                    $checkout_content = $this->get_simple_checkout_form();
                }
            } else {
                ob_end_clean();
            }

            $wrapped_content = '<div class="wisecart-checkout-wrapper">' . $checkout_content . '</div>';
            wp_send_json_success( [ 'html' => $wrapped_content ] );

        } catch ( \Exception $e ) {
            wp_send_json_error(
                [
                    'html' => '<div class="woocommerce-error" style="margin:1.5rem;">' . esc_html__( 'Checkout temporarily unavailable.', 'wisecampaign' ) . ' <a href="' . esc_url( wc_get_checkout_url() ) . '">' . esc_html__( 'Click here to checkout normally', 'wisecampaign' ) . '</a></div>',
                ]
            );
        }
    }

    private function get_simple_checkout_form()
    {
        $html  = '<div class="wisecart-simple-checkout" style="padding:1.5rem;">';
        $html .= '<h3>' . esc_html__( 'Checkout Issue', 'wisecampaign' ) . '</h3>';
        $html .= '<p>' . esc_html__( 'There seems to be an issue loading the checkout form. Please use the link below to complete your order:', 'wisecampaign' ) . '</p>';
        $html .= '<a href="' . esc_url( wc_get_checkout_url() ) . '" class="button wc-forward" style="display:inline-block; padding:10px 20px; background:#0073aa; color:white; text-decoration:none; margin:10px 0;">';
        $html .= esc_html__( 'Continue to Checkout', 'wisecampaign' );
        $html .= '</a></div>';
        return $html;
    }

    public function ajax_get_cart_content()
    {
        $nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
        if ( ! wp_verify_nonce( $nonce, 'wisecart_nonce' ) && ! wp_verify_nonce( $nonce, 'wisecart-update-cart' ) ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Security check failed.', 'wisecampaign' ) ] );
        }
        
        if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart ) {
            wp_send_json_error( [ 'message' => esc_html__( 'WooCommerce not available.', 'wisecampaign' ) ] );
        }
        
        $cart_html  = $this->get_cart_content_html();
        $item_count = WC()->cart->get_cart_contents_count();
        
        wp_send_json_success(
            [
                'data'       => $cart_html,
                'item_count' => $item_count,
            ]
        );
    }

    public function ajax_update_quantity()
    {
        check_ajax_referer('wisecart-update-cart', 'nonce');

        if ( ! isset( $_POST['cart_key'] ) || ! isset( $_POST['quantity'] ) ) {
            wp_send_json_error( [ 'message' => 'Invalid data provided.' ] );
        }
    
        $cart_item_key = sanitize_text_field( $_POST['cart_key'] );
        $quantity      = absint( $_POST['quantity'] );
    
        // Use WooCommerce to update the quantity
        if ( WC()->cart->set_quantity( $cart_item_key, $quantity ) ) {
            // Recalculate totals to ensure session is updated
            WC()->cart->calculate_totals();
            
            // Send back a success response with the new cart HTML
            wp_send_json_success( [
                'html'       => $this->get_cart_content_html(),
                'item_count' => WC()->cart->get_cart_contents_count(),
            ] );
        } else {
            // Send an error if updating failed
            wp_send_json_error( [ 'message' => 'Could not update cart item.' ] );
        }
    }

    public function ajax_apply_coupon()
    {
        check_ajax_referer('wisecart-apply-coupon', 'nonce');
        $coupon_code = sanitize_text_field(wp_unslash($_POST['coupon_code'] ?? ''));
        if (empty($coupon_code)) {
            wp_send_json_error(['message' => '<div class="woocommerce-error">Please enter a coupon code.</div>']);
        }
        if (WC()->cart->apply_coupon($coupon_code)) {
            wp_send_json_success(['html' => $this->get_cart_content_html(), 'item_count' => WC()->cart->get_cart_contents_count()]);
        } else {
            $notices = wc_get_notices('error');
            $messages = '';
            if (!empty($notices)) {
                foreach ($notices as $notice) {
                    $messages .= '<div class="woocommerce-error">' . esc_html($notice['notice']) . '</div>';
                }
                wc_clear_notices();
            } else {
                $messages = '<div class="woocommerce-error">The coupon "' . esc_html($coupon_code) . '" is not valid.</div>';
            }
            wp_send_json_error(['message' => $messages]);
        }
    }

    public function track_wisecart_order_success( $order_id )
    {
        if ( ! $order_id ) {
            return;
        }

        if ( isset( $_COOKIE['wisecart_checkout'] ) || ( isset( $_SESSION['wisecart_checkout'] ) && true === $_SESSION['wisecart_checkout'] ) ) {
            
            update_post_meta( $order_id, '_wisecart_order', 'yes' );
            
            if ( isset( $_COOKIE['wisecart_checkout'] ) ) {
                setcookie( 'wisecart_checkout', '', time() - 3600, '/' );
            }
            if ( isset( $_SESSION['wisecart_checkout'] ) ) {
                unset( $_SESSION['wisecart_checkout'] );
            }
        }
    }

    public function ajax_mark_success_viewed()
    {
        check_ajax_referer( 'wisecart-success-viewed', 'nonce' );
        
        $order_id = isset( $_POST['order_id'] ) ? absint( $_POST['order_id'] ) : 0;
        
        if ( $order_id ) {
            update_post_meta( $order_id, '_wisecart_success_viewed', current_time( 'timestamp' ) );
            wp_send_json_success( [ 'message' => esc_html__( 'Success message viewed', 'wisecampaign' ) ] );
        }
        
        wp_send_json_error( [ 'message' => esc_html__( 'Invalid order ID', 'wisecampaign' ) ] );
    }
}