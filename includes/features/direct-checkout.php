<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Check if wiseCampaign PRO is active and licensed.
 */
function wisecampaign_dc_is_pro_active()
{
    if (class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')) {
        return \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
    }
    return false;
}

/**
 * Returns inline SVG for supported button icons.
 */
function wisecampaign_dc_get_icon_svg($icon_key)
{
    switch ($icon_key) {
        case 'bolt':
            return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
        case 'bag':
            return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>';
        case 'lock':
            return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>';
        case 'cart':
            return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>';
        case 'arrow':
            return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-7.85-1.42 1.42 5.43 5.43H5v2z"/></svg>';
        default:
            return '';
    }
}

/**
 * Button style templates. Every template except "classic" is PRO.
 * Templates only change the button shape and effects; colors come from the color settings.
 */
function wisecampaign_dc_get_button_templates()
{
    return ['classic', 'pill', 'outline', 'gradient', 'raised', 'glow', 'soft', 'block'];
}

/**
 * Attention animations (PRO). They loop to draw the eye to the button.
 */
function wisecampaign_dc_get_button_animations()
{
    return ['none', 'pulse', 'shimmer', 'shake', 'bounce', 'heartbeat', 'wobble', 'radiate', 'tada'];
}

/**
 * Hover effects (PRO). They play while the shopper points at the button.
 */
function wisecampaign_dc_get_hover_effects()
{
    return ['none', 'lift', 'grow', 'shine', 'glow', 'icon_pop'];
}

function wisecampaign_dc_get_button_icons()
{
    return ['none', 'bolt', 'bag', 'lock', 'cart', 'arrow'];
}

function wisecampaign_dc_get_button_positions()
{
    return ['after_add_to_cart', 'before_add_to_cart', 'side_by_side', 'below_add_to_cart', 'replace_add_to_cart'];
}

/**
 * Default values for every Direct Checkout setting.
 */
function wisecampaign_dc_get_defaults()
{
    return [
        'dc_enabled'             => '0',
        'dc_button_text'         => 'Buy Now',
        'dc_button_color'        => '#007cba',
        'dc_button_text_color'   => '#ffffff',
        'dc_button_template'     => 'classic',
        'dc_button_icon'         => 'none',
        'dc_icon_position'       => 'left',
        'dc_button_animation'    => 'none',
        'dc_button_hover'        => 'none',
        'dc_button_position'     => 'after_add_to_cart',
        'dc_redirect_to'         => 'checkout',
        'dc_redirect_custom_url' => '',
        'dc_display_on'          => [],
    ];
}

function wisecampaign_get_dc_option($key, $default = '')
{
    $options = get_option('wisecampaign_dc_settings');
    return isset($options[$key]) ? $options[$key] : $default;
}

/**
 * Returns a PRO setting, falling back to its default for free users or unknown values.
 */
function wisecampaign_dc_get_pro_option($key, $allowed)
{
    $default = wisecampaign_dc_get_defaults()[$key];
    if (!wisecampaign_dc_is_pro_active()) {
        return $default;
    }
    $value = wisecampaign_get_dc_option($key, $default);
    return in_array($value, $allowed, true) ? $value : $default;
}

function wisecampaign_dc_get_active_template()
{
    return wisecampaign_dc_get_pro_option('dc_button_template', wisecampaign_dc_get_button_templates());
}

/**
 * Sanitizes a full settings payload. PRO-only values are reset to their defaults for free users.
 */
function wisecampaign_dc_sanitize_settings($input)
{
    $input = is_array($input) ? $input : [];
    $defaults = wisecampaign_dc_get_defaults();
    $is_pro = wisecampaign_dc_is_pro_active();

    // Reads a scalar field as a string; anything else (arrays, objects) counts as missing.
    $str = function ($key) use ($input) {
        return isset($input[$key]) && is_scalar($input[$key]) ? (string) $input[$key] : '';
    };

    $enum = function ($key, $allowed, $pro_only = true) use ($str, $defaults, $is_pro) {
        $value = $str($key);
        if (($pro_only && !$is_pro) || !in_array($value, $allowed, true)) {
            return $defaults[$key];
        }
        return $value;
    };

    $text = sanitize_text_field($str('dc_button_text'));

    $redirect_to = $str('dc_redirect_to');
    if (!in_array($redirect_to, ['checkout', 'cart', 'custom'], true)) {
        // Any other value is the permalink of one of the site's pages
        $redirect_to = filter_var($redirect_to, FILTER_VALIDATE_URL) ? esc_url_raw($redirect_to) : 'checkout';
    }

    $display_on = isset($input['dc_display_on']) && is_array($input['dc_display_on']) ? $input['dc_display_on'] : [];

    return [
        'dc_enabled'             => filter_var($input['dc_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
        'dc_button_text'         => $text !== '' ? $text : $defaults['dc_button_text'],
        'dc_button_color'        => sanitize_hex_color($str('dc_button_color')) ?: $defaults['dc_button_color'],
        'dc_button_text_color'   => sanitize_hex_color($str('dc_button_text_color')) ?: $defaults['dc_button_text_color'],
        'dc_button_template'     => $enum('dc_button_template', wisecampaign_dc_get_button_templates()),
        'dc_button_icon'         => $enum('dc_button_icon', wisecampaign_dc_get_button_icons()),
        'dc_icon_position'       => $enum('dc_icon_position', ['left', 'right'], false),
        'dc_button_animation'    => $enum('dc_button_animation', wisecampaign_dc_get_button_animations()),
        'dc_button_hover'        => $enum('dc_button_hover', wisecampaign_dc_get_hover_effects()),
        'dc_button_position'     => $enum('dc_button_position', wisecampaign_dc_get_button_positions()),
        'dc_redirect_to'         => $redirect_to,
        'dc_redirect_custom_url' => esc_url_raw($str('dc_redirect_custom_url')),
        'dc_display_on'          => array_values(array_intersect(['single_product', 'shop_page'], array_map('sanitize_key', array_filter($display_on, 'is_string')))),
    ];
}

/**
 * =================================================================
 * BACK-END ADMIN PAGE (React module: modules/wise-direct-checkout)
 * =================================================================
 */

function wisecampaign_dc_register_rest_routes()
{
    $permission = function () {
        return current_user_can('manage_options');
    };

    register_rest_route('wisecampaign/v1', '/direct-checkout', [
        [
            'methods'             => 'GET',
            'callback'            => 'wisecampaign_dc_rest_get_settings',
            'permission_callback' => $permission,
        ],
        [
            'methods'             => 'POST',
            'callback'            => 'wisecampaign_dc_rest_save_settings',
            'permission_callback' => $permission,
        ],
    ]);
}
add_action('rest_api_init', 'wisecampaign_dc_register_rest_routes');

/**
 * Settings plus everything the admin app needs to draw the live preview.
 */
function wisecampaign_dc_rest_get_settings()
{
    $saved = get_option('wisecampaign_dc_settings', []);
    $settings = array_merge(wisecampaign_dc_get_defaults(), is_array($saved) ? $saved : []);
    $settings['dc_display_on'] = array_values((array) $settings['dc_display_on']);

    $pages = array_map(function ($page) {
        return [
            'id'    => $page->ID,
            'title' => $page->post_title,
            'url'   => get_permalink($page->ID),
        ];
    }, get_pages(['sort_column' => 'post_title']));

    $icons = [];
    foreach (wisecampaign_dc_get_button_icons() as $icon) {
        $icons[$icon] = wisecampaign_dc_get_icon_svg($icon);
    }

    $response = rest_ensure_response([
        'settings' => $settings,
        'pages'    => $pages,
        'icons'    => $icons,
        'isPro'    => wisecampaign_dc_is_pro_active(),
    ]);
    // Some hosts cache REST responses; settings and license status must always be fresh.
    $response->header('Cache-Control', 'no-store');
    return $response;
}

function wisecampaign_dc_rest_save_settings(WP_REST_Request $request)
{
    $settings = wisecampaign_dc_sanitize_settings($request->get_json_params());
    update_option('wisecampaign_dc_settings', $settings);

    return rest_ensure_response([
        'success'  => true,
        'settings' => $settings,
    ]);
}

// The live preview renders the real storefront button, so it needs the storefront stylesheet.
function wisecampaign_direct_checkout_admin_scripts($hook)
{
    if (strpos($hook, 'wisecampaign_checkout') === false) {
        return;
    }
    wp_enqueue_style(
        'wisecampaign-dc-styles',
        WISECAMPAIGN_DIR_URL . 'includes/css/direct-checkout.css',
        [],
        '1.7.0'
    );
}
add_action('admin_enqueue_scripts', 'wisecampaign_direct_checkout_admin_scripts');

/**
 * =================================================================
 * FRONT-END LOGIC
 * =================================================================
 */

function wisecampaign_dc_enqueue_frontend_assets()
{
    $settings = get_option('wisecampaign_dc_settings');
    if (empty($settings['dc_enabled']) || '1' !== $settings['dc_enabled']) {
        return;
    }

    wp_enqueue_style(
        'wisecampaign-dc-styles',
        WISECAMPAIGN_DIR_URL . 'includes/css/direct-checkout.css',
        [],
        '1.7.0'
    );

    $button_bg_color = wisecampaign_get_dc_option('dc_button_color', '#007cba');
    $button_text_color = wisecampaign_get_dc_option('dc_button_text_color', '#ffffff');

    // Colors are applied through CSS variables in direct-checkout.css
    $custom_css = "
        .wisecampaign-buy-now-button {
            --wc-dc-bg: " . esc_attr($button_bg_color) . ";
            --wc-dc-text: " . esc_attr($button_text_color) . ";
        }
    ";
    wp_add_inline_style('wisecampaign-dc-styles', $custom_css);
}
add_action('wp_enqueue_scripts', 'wisecampaign_dc_enqueue_frontend_assets');

function wisecampaign_dc_initialize_frontend_button()
{
    $settings = get_option('wisecampaign_dc_settings');
    if (empty($settings['dc_enabled']) || '1' !== $settings['dc_enabled']) {
        return;
    }
    $display_locations = wisecampaign_get_dc_option('dc_display_on', []);
    $position = wisecampaign_dc_get_pro_option('dc_button_position', wisecampaign_dc_get_button_positions());

    if (in_array('single_product', (array) $display_locations)) {
        if ($position === 'before_add_to_cart') {
            add_action('woocommerce_before_add_to_cart_button', 'wisecampaign_dc_render_buy_now_button');
        } else {
            // Default, side_by_side, below_add_to_cart, replace_add_to_cart
            add_action('woocommerce_after_add_to_cart_button', 'wisecampaign_dc_render_buy_now_button');
        }
    }
    if (in_array('shop_page', (array) $display_locations)) {
        add_action('woocommerce_after_shop_loop_item', 'wisecampaign_dc_render_buy_now_button', 15);
    }
}
add_action('wp', 'wisecampaign_dc_initialize_frontend_button');

/**
 * Determines the redirect URL and renders the "Buy Now" button on storefront.
 */
function wisecampaign_dc_render_buy_now_button()
{
    global $product;
    if (!$product || !$product->is_purchasable()) {
        return;
    }
    if ((is_shop() || is_product_category() || is_product_tag()) && !$product->is_type('simple')) {
        return;
    }

    $button_text = wisecampaign_get_dc_option('dc_button_text', 'Buy Now');
    $redirect_to = wisecampaign_get_dc_option('dc_redirect_to', 'checkout');
    $redirect_url = '';

    switch ($redirect_to) {
        case 'cart':
            $redirect_url = wc_get_cart_url();
            break;
        case 'checkout':
            $redirect_url = wc_get_checkout_url();
            break;
        case 'custom':
            $custom_url = wisecampaign_get_dc_option('dc_redirect_custom_url', '');
            if (!empty($custom_url)) {
                $redirect_url = esc_url($custom_url);
            }
            break;
        default:
            if (filter_var($redirect_to, FILTER_VALIDATE_URL)) {
                $redirect_url = esc_url($redirect_to);
            }
            break;
    }

    // Fallback to the checkout page if no valid URL was determined
    if (empty($redirect_url)) {
        $redirect_url = wc_get_checkout_url();
    }

    // wisecampaign_source credits the sale to Direct Checkout in WiseCampaign Analytics
    $buy_now_url = add_query_arg(['add-to-cart' => $product->get_id(), 'wisecampaign_source' => 'checkout'], $redirect_url);
    $extra_classes = [];

    if (is_shop() || is_product_category() || is_product_tag()) {
        $extra_classes[] = 'wisecampaign-buy-now-loop';
    }

    // PRO Template
    $template = wisecampaign_dc_get_active_template();
    if ($template !== 'classic') {
        $extra_classes[] = 'wc-tpl-' . $template;
    }

    // PRO Animation
    $animation = wisecampaign_dc_get_pro_option('dc_button_animation', wisecampaign_dc_get_button_animations());
    if ($animation !== 'none') {
        $extra_classes[] = 'wc-anim-' . $animation;
    }

    // PRO Hover Effect
    $hover = wisecampaign_dc_get_pro_option('dc_button_hover', wisecampaign_dc_get_hover_effects());
    if ($hover !== 'none') {
        $extra_classes[] = 'wc-hover-' . str_replace('_', '-', $hover);
    }

    // PRO Position
    $position = wisecampaign_dc_get_pro_option('dc_button_position', wisecampaign_dc_get_button_positions());
    if ($position === 'side_by_side') {
        $extra_classes[] = 'wc-pos-side-by-side';
    } elseif ($position === 'below_add_to_cart') {
        $extra_classes[] = 'wc-pos-below';
    } elseif ($position === 'before_add_to_cart') {
        $extra_classes[] = 'wc-pos-before';
    } elseif ($position === 'replace_add_to_cart') {
        $extra_classes[] = 'wc-pos-replace';
    }

    // PRO Icon
    $icon = wisecampaign_dc_get_pro_option('dc_button_icon', wisecampaign_dc_get_button_icons());
    $icon_pos = wisecampaign_dc_is_pro_active() ? wisecampaign_get_dc_option('dc_icon_position', 'left') : 'left';
    $icon_html = '';
    if ($icon !== 'none') {
        $icon_svg = wisecampaign_dc_get_icon_svg($icon);
        if ($icon_svg) {
            $icon_html = '<span class="wisecampaign-dc-icon">' . $icon_svg . '</span>';
        }
    }

    $button_content = esc_html($button_text);
    if (!empty($icon_html)) {
        if ($icon_pos === 'right') {
            $button_content = $button_content . ' ' . $icon_html;
        } else {
            $button_content = $icon_html . ' ' . $button_content;
        }
    }

    $class_attr = !empty($extra_classes) ? ' ' . implode(' ', array_map('esc_attr', $extra_classes)) : '';

    echo '<a href="' . esc_url($buy_now_url) . '" rel="nofollow" class="button alt wisecampaign-buy-now-button' . $class_attr . '">' . $button_content . '</a>';
}
