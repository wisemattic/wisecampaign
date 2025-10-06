<?php

namespace WISECAMPAIGN\Features;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

use WISECAMPAIGN\Traits\SingletonTrait;

class WiseCart
{
    use SingletonTrait;

    private $settings_page_slug = 'wisecampaign_cart';
    private $settings_group = 'wisecart_settings_group';
    private $options_key = 'wisecart_options';
    private $options = [];

    public function __construct()
    {
        $this->load_options();
        add_action('admin_init', [$this, 'register_admin_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('wp_ajax_wisecart_save_settings', [$this, 'ajax_save_settings']);

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
            
            // Order success tracking.
            add_action('woocommerce_thankyou', [$this, 'track_wisecart_order_success']);
            add_action('wp_ajax_wisecart_mark_success_viewed', [$this, 'ajax_mark_success_viewed']);
            add_action('wp_ajax_nopriv_wisecart_mark_success_viewed', [$this, 'ajax_mark_success_viewed']);
        }
    }

    private function load_options()
    {
        $defaults = array_column($this->get_settings_fields(), 'default', 'id');
        $saved_options = get_option($this->options_key, []);
        $this->options = wp_parse_args($saved_options, $defaults);
    }

    public function get_option($key)
    {
        return $this->options[$key] ?? null;
    }

    private function get_settings_fields()
    {
        return [
            'wisecart_options_title' => ['id' => 'wisecart_options_title', 'title' => __('wiseCart Options', 'wisecampaign'), 'type' => 'title', 'desc' => __('The following options control the appearance and behavior of the wiseCart feature.', 'wisecampaign')],
            'wc_enable_wisecart' => ['id' => 'wc_enable_wisecart', 'title' => __('Enable wiseCart', 'wisecampaign'), 'desc' => __('Enable the side cart on your site.', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wc_auto_open_cart' => ['id' => 'wc_auto_open_cart', 'title' => __('Auto open', 'wisecampaign'), 'desc' => __('Open after adding a product to the cart', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wc_direct_checkout' => ['id' => 'wc_direct_checkout', 'title' => __('Direct checkout', 'wisecampaign'), 'desc' => __('Skip the cart and show the checkout immediately', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'no'],
            'wisecart_contents_title' => ['id' => 'wisecart_contents_title', 'title' => __('Cart Contents', 'wisecampaign'), 'type' => 'title'],
            'wc_show_product_images' => ['id' => 'wc_show_product_images', 'title' => __('Product Images', 'wisecampaign'), 'desc' => __('Show product images', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wc_show_product_prices' => ['id' => 'wc_show_product_prices', 'title' => __('Product Prices', 'wisecampaign'), 'desc' => __('Show product prices', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wc_show_quantity_pickers' => ['id' => 'wc_show_quantity_pickers', 'title' => __('Quantity Pickers', 'wisecampaign'), 'desc' => __('Show quantity pickers', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wc_show_delete_buttons' => ['id' => 'wc_show_delete_buttons', 'title' => __('Delete Buttons', 'wisecampaign'), 'desc' => __('Show delete buttons', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wc_show_coupons' => ['id' => 'wc_show_coupons', 'title' => __('Coupons', 'wisecampaign'), 'desc' => __('Show coupons', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wc_show_order_subtotal' => ['id' => 'wc_show_order_subtotal', 'title' => __('Order Subtotal', 'wisecampaign'), 'desc' => __('Show order subtotal', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wc_show_keep_shopping' => ['id' => 'wc_show_keep_shopping', 'title' => __('Continue Shopping Button', 'wisecampaign'), 'desc' => __("Show 'Keep Shopping' button", 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wisecart_icon_title' => ['id' => 'wisecart_icon_title', 'title' => __('Cart Icon', 'wisecampaign'), 'type' => 'title'],
            'wc_icon_position' => ['id' => 'wc_icon_position', 'title' => __('Position', 'wisecampaign'), 'type' => 'radio', 'options' => ['bottom_right' => __('Bottom Right'), 'bottom_left' => __('Bottom Left'), 'middle_right' => __('Middle Right'), 'middle_left' => __('Middle Left'), 'top_right' => __('Top Right'), 'top_left' => __('Top Left'), 'hidden' => __('Hidden')], 'default' => 'bottom_right'],
            'wc_button_style' => ['id' => 'wc_button_style', 'title' => __('Button style', 'wisecampaign'), 'type' => 'select', 'options' => ['icon_only' => 'Icon Only', 'text_only' => 'Text Only', 'icon_and_text' => 'Icon and Text'], 'default' => 'icon_only'],
            'wc_button_text' => ['id' => 'wc_button_text', 'title' => __('Button text', 'wisecampaign'), 'desc' => '(Used for "Text Only" and "Icon and Text" styles)', 'type' => 'text', 'default' => 'Cart'],
            'wisecart_replace_pages_title' => ['id' => 'wisecart_replace_pages_title', 'title' => __('Replace Pages', 'wisecampaign'), 'type' => 'title'],
            'wc_replace_cart_page' => ['id' => 'wc_replace_cart_page', 'title' => __('Replace cart page', 'wisecampaign'), 'desc' => __('Open wiseCart when customers try to access the default cart page', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wc_replace_checkout_page' => ['id' => 'wc_replace_checkout_page', 'title' => __('Replace checkout page', 'wisecampaign'), 'desc' => __('Open wiseCart when customers try to access the default checkout page', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'no'],
            'wisecart_design_title' => ['id' => 'wisecart_design_title', 'title' => __('Design Customization', 'wisecampaign'), 'type' => 'title'],
            'wc_button_background' => ['id' => 'wc_button_background', 'title' => __('Cart Button Background', 'wisecampaign'), 'type' => 'color', 'default' => '#1d1d1d'],
            'wc_icon_color' => ['id' => 'wc_icon_color', 'title' => __('Cart Icon Color', 'wisecampaign'), 'type' => 'color', 'default' => '#ffffff'],
            'wc_count_background' => ['id' => 'wc_count_background', 'title' => __('Cart Count Background', 'wisecampaign'), 'type' => 'color', 'default' => '#d63638'],
            'wc_count_text_color' => ['id' => 'wc_count_text_color', 'title' => __('Cart Count Text Color', 'wisecampaign'), 'type' => 'color', 'default' => '#ffffff'],
            'wc_border_radius' => ['id' => 'wc_border_radius', 'title' => __('Cart Button Border Radius (px)', 'wisecampaign'), 'type' => 'number', 'default' => '50'],
            'wc_checkout_btn_background' => ['id' => 'wc_checkout_btn_background', 'title' => __('Checkout Button Background', 'wisecampaign'), 'type' => 'color', 'default' => '#28a745'],
            'wc_checkout_text_color' => ['id' => 'wc_checkout_text_color', 'title' => __('Checkout Button Text Color', 'wisecampaign'), 'type' => 'color', 'default' => '#ffffff'],
            'wc_continue_btn_background' => ['id' => 'wc_continue_btn_background', 'title' => __('Continue Shopping BG', 'wisecampaign'), 'type' => 'color', 'default' => '#e9ecef'],
            'wc_continue_btn_text_color' => ['id' => 'wc_continue_btn_text_color', 'title' => __('Continue Shopping Text', 'wisecampaign'), 'type' => 'color', 'default' => '#343a40'],
            'wisecart_success_title' => ['id' => 'wisecart_success_title', 'title' => __('Order Success Message', 'wisecampaign'), 'type' => 'title'],
            'wc_success_message_enable' => ['id' => 'wc_success_message_enable', 'title' => __('Show Success Message', 'wisecampaign'), 'desc' => __('Display success message in cart after order placement', 'wisecampaign'), 'type' => 'checkbox', 'default' => 'yes'],
            'wc_success_message_title' => ['id' => 'wc_success_message_title', 'title' => __('Success Title', 'wisecampaign'), 'desc' => __('Title displayed on successful order', 'wisecampaign'), 'type' => 'text', 'default' => 'Order Placed Successfully!'],
            'wc_success_message_text' => ['id' => 'wc_success_message_text', 'title' => __('Success Message', 'wisecampaign'), 'desc' => __('Message displayed on successful order', 'wisecampaign'), 'type' => 'textarea', 'default' => 'Thank you for your order! We\'ve received your payment and will process your order shortly.'],
            'wc_success_redirect_delay' => ['id' => 'wc_success_redirect_delay', 'title' => __('Redirect Delay (seconds)', 'wisecampaign'), 'desc' => __('Time to wait before redirecting to order confirmation page', 'wisecampaign'), 'type' => 'number', 'default' => '5'],
        ];
    }

    public function sanitize_options($input)
    {
        $output = [];
        $settings_fields = $this->get_settings_fields();
        foreach ($settings_fields as $id => $field) {
            if (!isset($input[$id])) {
                continue;
            }
            switch ($field['type']) {
                case 'checkbox':
                    $output[$id] = 'yes';
                    break;
                case 'color':
                    $output[$id] = sanitize_hex_color($input[$id]);
                    break;
                case 'number':
                    $output[$id] = absint($input[$id]);
                    break;
                case 'textarea':
                    $output[$id] = sanitize_textarea_field($input[$id]);
                    break;
                default:
                    $output[$id] = sanitize_text_field($input[$id]);
                    break;
            }
        }
        foreach ($settings_fields as $id => $field) {
            if ($field['type'] === 'checkbox' && !isset($output[$id])) {
                $output[$id] = 'no';
            }
        }
        return $output;
    }

    public function register_admin_settings()
    {
        add_settings_section('wisecart_section_main', null, null, $this->settings_page_slug);

        foreach ($this->get_settings_fields() as $id => $field) {
            $field_title = ($field['type'] === 'title') ? '' : ($field['title'] ?? '');
            add_settings_field($id, $field_title, [$this, 'render_field'], $this->settings_page_slug, 'wisecart_section_main', $field);
        }
    }

    public function render_field($args)
    {
        $id = esc_attr($args['id']);
        $type = $args['type'];
        $value = $this->get_option($id);
        $desc = $args['desc'] ?? '';
        $options_name = $this->options_key . '[' . $id . ']';

        echo "<script>(function(){ var el = document.getElementById('" . esc_js($id) . "'); if(el) { var tr = el.closest('tr'); if(tr) { tr.className += ' wisecart-field-type-" . esc_js($type) . "'; } } })();</script>";

        switch ($type) {
            case 'title':
                echo '<h2>' . esc_html($args['title']) . '</h2>';
                if (!empty($desc)) {
                    echo '<p class="description">' . esc_html($desc) . '</p>';
                }
                break;
            case 'checkbox':
                echo '<label class="wisecart-switch">';
                echo '<input type="checkbox" id="' . $id . '" name="' . $options_name . '" value="yes"' . checked('yes', $value, false) . ' />';
                echo '<span class="wisecart-slider"></span>';
                echo '</label>';
                if (!empty($desc)) {
                    echo '<span class="wisecart-switch-description">' . esc_html($desc) . '</span>';
                }
                break;
            case 'text':
                echo '<input type="text" id="' . $id . '" name="' . $options_name . '" value="' . esc_attr($value) . '" class="regular-text" />';
                if (!empty($desc)) {
                    echo '<em> ' . esc_html($desc) . '</em>';
                }
                break;
            case 'number':
                echo '<input type="number" id="' . $id . '" name="' . $options_name . '" value="' . esc_attr($value) . '" class="small-text" />';
                if (!empty($desc)) {
                    echo '<p class="description">' . esc_html($desc) . '</p>';
                }
                break;
            case 'radio':
                echo '<fieldset>';
                foreach ($args['options'] as $key => $label) {
                    echo '<label><input type="radio" name="' . $options_name . '" value="' . esc_attr($key) . '"' . checked($value, $key, false) . '> ' . esc_html($label) . '</label><br>';
                }
                echo '</fieldset>';
                if (!empty($desc)) {
                    echo '<p class="description">' . esc_html($desc) . '</p>';
                }
                break;
            case 'select':
                echo '<select id="' . $id . '" name="' . $options_name . '">';
                foreach ($args['options'] as $key => $label) {
                    echo '<option value="' . esc_attr($key) . '"' . selected($value, $key, false) . '>' . esc_html($label) . '</option>';
                }
                echo '</select>';
                if (!empty($desc)) {
                    echo '<p class="description">' . esc_html($desc) . '</p>';
                }
                break;
            case 'textarea':
                echo '<textarea id="' . $id . '" name="' . $options_name . '" rows="3" cols="50" class="large-text">' . esc_textarea($value) . '</textarea>';
                if (!empty($desc)) {
                    echo '<p class="description">' . esc_html($desc) . '</p>';
                }
                break;
            case 'color':
                echo '<input type="text" id="' . $id . '" name="' . $options_name . '" value="' . esc_attr($value) . '" class="wisecart-color-picker" data-default-color="' . esc_attr($args['default']) . '" />';
                if (!empty($desc)) {
                    echo '<p class="description">' . esc_html($desc) . '</p>';
                }
                break;
        }
    }

    public function enqueue_admin_assets($hook_suffix)
    {
        if (strpos($hook_suffix, 'wisecampaign_cart') === false) {
            return;
        }

        wp_enqueue_style('wisecart-admin-settings', WISECAMPAIGN_DIR_URL . 'includes/css/wisecart-admin-settings.css', [], '1.3.0');
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wisecart-admin-script', WISECAMPAIGN_DIR_URL . 'includes/js/wisecart-admin.js', ['jquery', 'wp-color-picker'], '1.2.0', true);

        wp_localize_script('wisecart-admin-script', 'wiseCartAdmin', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wisecart_save_action'),
        ]);
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

        $version = '3.4.0';
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
        if (($this->get_option('wc_replace_cart_page') === 'yes' && is_cart()) || ($this->get_option('wc_replace_checkout_page') === 'yes' && is_checkout())) {
            wp_safe_redirect(add_query_arg('open-wisecart', 'true', wc_get_page_permalink('shop')));
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
            // Ensure WooCommerce checkout is properly initialized.
            if ( ! did_action( 'wp_loaded' ) ) {
                wp_send_json_error( [ 'html' => '<div class="woocommerce-error" style="margin:1.5rem;">' . esc_html__( 'WordPress not fully loaded. Please refresh and try again.', 'wisecampaign' ) . '</div>' ] );
            }

            // Set up proper WooCommerce context.
            if ( ! WC()->session ) {
                WC()->session = new WC_Session_Handler();
                WC()->session->init();
            }

            // Calculate totals to ensure cart is ready.
            WC()->cart->calculate_totals();

            // Buffer output to catch any errors.
            ob_start();
            
            // Load checkout content.
            $checkout_content = do_shortcode( '[woocommerce_checkout]' );
            
            // Check if shortcode produced content.
            if ( empty( $checkout_content ) || strlen( trim( $checkout_content ) ) < 50 ) {
                ob_end_clean();
                
                // Fallback: Try to load checkout directly.
                if ( function_exists( 'woocommerce_checkout' ) ) {
                    ob_start();
                    woocommerce_checkout();
                    $checkout_content = ob_get_clean();
                } else {
                    // Last resort: Simple checkout form.
                    $checkout_content = $this->get_simple_checkout_form();
                }
            } else {
                ob_end_clean();
            }

            $wrapped_content = '<div class="wisecart-checkout-wrapper">' . $checkout_content . '</div>';

            wp_send_json_success( [ 'html' => $wrapped_content ] );

        } catch ( Exception $e ) {
            wp_send_json_error(
                [
                    'html' => '<div class="woocommerce-error" style="margin:1.5rem;">' . esc_html__( 'Checkout temporarily unavailable.', 'wisecampaign' ) . ' <a href="' . esc_url( wc_get_checkout_url() ) . '">' . esc_html__( 'Click here to checkout normally', 'wisecampaign' ) . '</a></div>',
                ]
            );
        }
    }

    /**
     * Simple fallback checkout form.
     *
     * @return string Fallback checkout HTML.
     */
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
        // Check nonce for security.
        $nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
        if ( ! wp_verify_nonce( $nonce, 'wisecart_nonce' ) && ! wp_verify_nonce( $nonce, 'wisecart-update-cart' ) ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Security check failed.', 'wisecampaign' ) ] );
        }
        
        // Make sure WooCommerce is available.
        if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart ) {
            wp_send_json_error( [ 'message' => esc_html__( 'WooCommerce not available.', 'wisecampaign' ) ] );
        }
        
        // Get cart content HTML.
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
        parse_str(wp_unslash($_POST['cart_data'] ?? ''), $cart_data);
        if (empty($cart_data['cart'])) {
            wp_send_json_error(['message' => 'No cart data received.']);
        }
        foreach ($cart_data['cart'] as $cart_item_key => $cart_item) {
            if (isset($cart_item['qty'])) {
                WC()->cart->set_quantity($cart_item_key, absint($cart_item['qty']));
            }
        }
        wp_send_json_success(['html' => $this->get_cart_content_html(), 'item_count' => WC()->cart->get_cart_contents_count()]);
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

    public function ajax_save_settings()
    {
        if (!isset($_POST['wisecart_settings_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['wisecart_settings_nonce'])), 'wisecart_save_action')) {
            wp_send_json_error(['message' => 'Security check failed.'], 403);
            return;
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'You do not have permission to save settings.'], 403);
            return;
        }

        $posted_data = isset($_POST[$this->options_key]) && is_array($_POST[$this->options_key]) ? wp_unslash($_POST[$this->options_key]) : [];
        $sanitized_options = $this->sanitize_options($posted_data);

        update_option($this->options_key, $sanitized_options);

        wp_send_json_success(['message' => 'Settings Saved!']);
    }

    /**
     * Track when an order is successfully placed through wiseCart.
     *
     * @param int $order_id Order ID.
     */
    public function track_wisecart_order_success( $order_id )
    {
        if ( ! $order_id ) {
            return;
        }

        // Check if the order was placed through wiseCart.
        if ( isset( $_COOKIE['wisecart_checkout'] ) || ( isset( $_SESSION['wisecart_checkout'] ) && true === $_SESSION['wisecart_checkout'] ) ) {
            
            // Mark this order as placed through wiseCart.
            update_post_meta( $order_id, '_wisecart_order', 'yes' );
            
            // Clear the tracking cookie/session.
            if ( isset( $_COOKIE['wisecart_checkout'] ) ) {
                setcookie( 'wisecart_checkout', '', time() - 3600, '/' );
            }
            if ( isset( $_SESSION['wisecart_checkout'] ) ) {
                unset( $_SESSION['wisecart_checkout'] );
            }
        }
    }

    /**
     * AJAX handler to mark success message as viewed.
     */
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