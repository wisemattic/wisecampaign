<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * =================================================================
 * BACK-END ADMIN PAGE
 * =================================================================
 */

// Renders the main settings page HTML
function wisecampaign_direct_checkout_settings_page()
{
    ?>
    <div class="wrap">
        <h1><?php echo esc_html__('Direct Checkout Settings', 'wisecampaign'); ?></h1>
        <div class="wisecampaign-settings-layout">
            <div class="wisecampaign-preview-pane">
                <h2><?php echo esc_html__('Live Preview', 'wisecampaign'); ?></h2>
                <div class="wisecampaign-preview-container">
                    <div id="wisecampaign-direct-checkout-preview">
                        <a href="#" id="preview-button"
                            class="button button-primary button-large"><?php echo esc_html(wisecampaign_get_dc_option('dc_button_text', 'Buy Now')); ?></a>
                    </div>
                </div>
            </div>
            <div class="wisecampaign-settings-pane">
                <form action="options.php" method="post" id="wisecampaign-dc-settings-form">
                    <?php
                    settings_fields('wisecampaign_dc_settings_group');
                    do_settings_sections('wisecampaign_dc_page');
                    ?>
                    <div class="wisecampaign-form-footer">
                        <span id="wisecampaign-dc-feedback" class="wisecampaign-feedback-message"></span>
                        <?php submit_button('Save Changes'); ?>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <?php
}

// Registers all settings, sections, and fields
function wisecampaign_direct_checkout_register_settings()
{
    register_setting('wisecampaign_dc_settings_group', 'wisecampaign_dc_settings');
    add_settings_section('wisecampaign_dc_main_section', esc_html__('Button Configuration', 'wisecampaign'), 'wisecampaign_dc_main_section_callback', 'wisecampaign_dc_page');
    add_settings_field('dc_enabled', esc_html__('Enable Direct Checkout', 'wisecampaign'), 'wisecampaign_dc_field_enabled_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
    add_settings_field('dc_button_text', esc_html__('Button Text', 'wisecampaign'), 'wisecampaign_dc_field_button_text_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
    add_settings_field('dc_button_color', esc_html__('Button Background Color', 'wisecampaign'), 'wisecampaign_dc_field_button_color_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
    add_settings_field('dc_button_text_color', esc_html__('Button Text Color', 'wisecampaign'), 'wisecampaign_dc_field_button_text_color_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
    add_settings_field('dc_redirect_to', esc_html__('Redirect To', 'wisecampaign'), 'wisecampaign_dc_field_redirect_to_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
    add_settings_field('dc_display_on', esc_html__('Display On', 'wisecampaign'), 'wisecampaign_dc_field_display_on_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
}
add_action('admin_init', 'wisecampaign_direct_checkout_register_settings');

// Section and Field callback functions
function wisecampaign_dc_main_section_callback()
{
    echo '<p>' . esc_html__('Customize the appearance and behavior of your "Buy Now" button.', 'wisecampaign') . '</p>';
}

function wisecampaign_get_dc_option($key, $default = '')
{
    $options = get_option('wisecampaign_dc_settings');
    return isset($options[$key]) ? $options[$key] : $default;
}

function wisecampaign_dc_field_enabled_cb()
{
    $enabled = wisecampaign_get_dc_option('dc_enabled', '0');
    echo '<label for="dc_enabled"><input type="checkbox" name="wisecampaign_dc_settings[dc_enabled]" id="dc_enabled" value="1" ' . checked(1, $enabled, false) . ' /> ' . esc_html__('Enable the "Buy Now" button on your site.', 'wisecampaign') . '</label>';
}

function wisecampaign_dc_field_button_text_cb()
{
    $text = wisecampaign_get_dc_option('dc_button_text', 'Buy Now');
    echo '<input type="text" name="wisecampaign_dc_settings[dc_button_text]" id="dc_button_text" value="' . esc_attr($text) . '" class="regular-text" />';
}

function wisecampaign_dc_field_button_color_cb()
{
    $color = wisecampaign_get_dc_option('dc_button_color', '#007cba');
    echo '<input type="text" name="wisecampaign_dc_settings[dc_button_color]" id="dc_button_color" value="' . esc_attr($color) . '" class="wisecampaign-color-picker" />';
}

function wisecampaign_dc_field_button_text_color_cb()
{
    $color = wisecampaign_get_dc_option('dc_button_text_color', '#ffffff');
    echo '<input type="text" name="wisecampaign_dc_settings[dc_button_text_color]" id="dc_button_text_color" value="' . esc_attr($color) . '" class="wisecampaign-color-picker" />';
}


/**
 * fetches all WordPress pages and adds them to the dropdown.
 */
function wisecampaign_dc_field_redirect_to_cb()
{
    $redirect_to = wisecampaign_get_dc_option('dc_redirect_to', 'checkout');
    $custom_url = wisecampaign_get_dc_option('dc_redirect_custom_url', '');

    // Get all published pages
    $pages = get_pages(['sort_column' => 'post_title']);

    echo '<select name="wisecampaign_dc_settings[dc_redirect_to]" id="dc_redirect_to">';

    // Group for default WooCommerce pages
    echo '<optgroup label="' . esc_attr__('Default WooCommerce', 'wisecampaign') . '">';
    echo '<option value="cart" ' . selected('cart', $redirect_to, false) . '>' . esc_html__('Cart Page', 'wisecampaign') . '</option>';
    echo '<option value="checkout" ' . selected('checkout', $redirect_to, false) . '>' . esc_html__('Checkout Page', 'wisecampaign') . '</option>';
    echo '</optgroup>';

    // Group for all WordPress pages
    if (!empty($pages)) {
        echo '<optgroup label="' . esc_attr__('Your Pages', 'wisecampaign') . '">';
        foreach ($pages as $page) {
            $page_url = get_permalink($page->ID);
            echo '<option value="' . esc_url($page_url) . '" ' . selected($page_url, $redirect_to, false) . '>' . esc_html($page->post_title) . '</option>';
        }
        echo '</optgroup>';
    }

    // Group for Custom URL
    echo '<optgroup label="' . esc_attr__('Other', 'wisecampaign') . '">';
    echo '<option value="custom" ' . selected('custom', $redirect_to, false) . '>' . esc_html__('Custom URL', 'wisecampaign') . '</option>';
    echo '</optgroup>';

    echo '</select>';
    echo '<br>';
    echo '<input type="url" name="wisecampaign_dc_settings[dc_redirect_custom_url]" id="dc_redirect_custom_url" value="' . esc_url($custom_url) . '" class="regular-text" style="display: ' . ($redirect_to === 'custom' ? 'block' : 'none') . '; margin-top: 10px;" placeholder="https://example.com" />';
}


function wisecampaign_dc_field_display_on_cb()
{
    $display_on = wisecampaign_get_dc_option('dc_display_on', []);
    $locations = [
        'single_product' => esc_html__('Single Product Pages', 'wisecampaign'),
        'shop_page' => esc_html__('Shop / Archive Pages', 'wisecampaign'),
    ];
    foreach ($locations as $key => $label) {
        echo '<label for="dc_display_on_' . esc_attr($key) . '"><input type="checkbox" name="wisecampaign_dc_settings[dc_display_on][]" id="dc_display_on_' . esc_attr($key) . '" value="' . esc_attr($key) . '" ' . checked(in_array($key, (array) $display_on), true, false) . ' /> ' . $label . '</label><br>';
    }
}

// Enqueues scripts and styles for the admin page
// In function wisecampaign_direct_checkout_admin_scripts()

function wisecampaign_direct_checkout_admin_scripts($hook)
{
    if ('toplevel_page_wisecampaign_menu' !== $hook && 'wisecampaign_page_wisecampaign_checkout' !== $hook) {
        return;
    }
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_script('wp-color-picker');

    // Enqueue our new admin JavaScript file
    wp_enqueue_script(
        'wisecampaign-dc-admin-js',
        WISECAMPAIGN_DIR_URL . 'includes/js/direct-checkout-admin.js',
        ['jquery', 'wp-color-picker'],
        '1.0.0',
        true
    );

    // Pass data to our script
    wp_localize_script('wisecampaign-dc-admin-js', 'wiseCampaignDcAdmin', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'save_nonce' => wp_create_nonce('wisecampaign_dc_save_nonce')
    ]);
}
add_action('admin_enqueue_scripts', 'wisecampaign_direct_checkout_admin_scripts');


// Adds CSS and JS to the admin page head
function wisecampaign_direct_checkout_admin_head()
{
    $screen = get_current_screen();
    if ('toplevel_page_wisecampaign_menu' !== $screen->id && 'wisecampaign_page_wisecampaign_checkout' !== $screen->id) {
        return;
    }
    $button_bg_color = wisecampaign_get_dc_option('dc_button_color', '#007cba');
    $button_text_color = wisecampaign_get_dc_option('dc_button_text_color', '#ffffff');
    ?>
    <style>
        .wisecampaign-settings-layout {
            display: grid;
            grid-template-columns: 1fr 2fr;
            grid-gap: 20px;
            margin-top: 20px;
        }

        .wisecampaign-preview-pane,
        .wisecampaign-settings-pane {
            background: #fff;
            padding: 1px 20px 20px;
            border-radius: 4px;
            box-shadow: 0 1px 1px rgba(0, 0, 0, .04);
        }

        .wisecampaign-preview-container {
            padding: 40px;
            text-align: center;
            background: #f5f5f5;
            border: 1px dashed #ccc;
            margin-top: 20px;
        }

        #preview-button {
            background-color:
                <?php echo esc_attr($button_bg_color); ?>
            ;
            border-color:
                <?php echo esc_attr($button_bg_color); ?>
            ;
            color:
                <?php echo esc_attr($button_text_color); ?>
            ;
            text-shadow: none;
            box-shadow: none;
        }

        @media screen and (max-width: 782px) {
            .wisecampaign-settings-layout {
                grid-template-columns: 1fr;
            }
        }
        .wisecampaign-form-footer {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 15px; /* Adds space between message and button */
        }
        .wisecampaign-form-footer .wisecampaign-feedback-message {
            margin-right: auto; /* Pushes button to the right */
        }
        .wisecampaign-feedback-message {
            font-weight: 600;
            color: #2271b1;
            opacity: 0;
            transition: opacity 0.4s ease-in-out;
        }
        .wisecampaign-feedback-message.show {
            opacity: 1;
        }
        .wisecampaign-feedback-message.error {
            color: #d63638;
        }
    </style>
    <script type="text/javascript">
        jQuery(document).ready(function ($) {
            $('.wisecampaign-color-picker').wpColorPicker();
            $('#dc_button_color').wpColorPicker({ change: function (e, ui) { $('#preview-button').css({ 'backgroundColor': ui.color.toString(), 'borderColor': ui.color.toString() }); } });
            $('#dc_button_text_color').wpColorPicker({ change: function (e, ui) { $('#preview-button').css('color', ui.color.toString()); } });
            $('#dc_button_text').on('keyup', function () { $('#preview-button').text($(this).val() || 'Buy Now'); });
            $('#dc_redirect_to').on('change', function () { $(this).val() === 'custom' ? $('#dc_redirect_custom_url').show() : $('#dc_redirect_custom_url').hide(); }).trigger('change');
        });
    </script>
    <?php
}
add_action('admin_head', 'wisecampaign_direct_checkout_admin_head');


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
        '1.4.0' // Incremented version
    );

    $button_bg_color = wisecampaign_get_dc_option('dc_button_color', '#007cba');
    $button_text_color = wisecampaign_get_dc_option('dc_button_text_color', '#ffffff');

    $custom_css = "
        .wisecampaign-buy-now-button {
            background-color: " . esc_attr($button_bg_color) . " !important;
            color: " . esc_attr($button_text_color) . " !important;
        }
        .wisecampaign-buy-now-button:hover {
            color: " . esc_attr($button_text_color) . " !important;
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
    if (in_array('single_product', (array) $display_locations)) {
        add_action('woocommerce_after_add_to_cart_button', 'wisecampaign_dc_render_buy_now_button');
    }
    if (in_array('shop_page', (array) $display_locations)) {
        add_action('woocommerce_after_shop_loop_item', 'wisecampaign_dc_render_buy_now_button', 15);
    }
}
add_action('wp', 'wisecampaign_dc_initialize_frontend_button');


/**
 * This function determines the redirect URL for pages.
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
            // This handles the new page options, as their value is a full URL.
            if (filter_var($redirect_to, FILTER_VALIDATE_URL)) {
                $redirect_url = esc_url($redirect_to);
            }
            break;
    }

    // Fallback to the checkout page if no valid URL was determined
    if (empty($redirect_url)) {
        $redirect_url = wc_get_checkout_url();
    }

    $buy_now_url = add_query_arg(['add-to-cart' => $product->get_id()], $redirect_url);
    $extra_class = (is_shop() || is_product_category() || is_product_tag()) ? ' wisecampaign-buy-now-loop' : '';
    echo '<a href="' . esc_url($buy_now_url) . '" rel="nofollow" class="button alt wisecampaign-buy-now-button' . esc_attr($extra_class) . '">' . esc_html($button_text) . '</a>';
}

// Add this new function to your PHP file

function wisecampaign_dc_ajax_save_settings()
{
    // 1. Verify security
    check_ajax_referer('wisecampaign_dc_save_nonce', 'nonce');
    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'Permission denied.']);
    }

    // 2. Parse and sanitize form data
    $form_data = [];
    if (isset($_POST['form_data'])) {
        parse_str($_POST['form_data'], $form_data);
    }
    $options_to_save = $form_data['wisecampaign_dc_settings'] ?? [];

    // Create a manifest of all settings for sanitization
    $settings_manifest = [
        'dc_enabled' => 'bool',
        'dc_button_text' => 'text',
        'dc_button_color' => 'color',
        'dc_button_text_color' => 'color',
        'dc_redirect_to' => 'url_or_key',
        'dc_redirect_custom_url' => 'url',
        'dc_display_on' => 'array_key'
    ];
    $sanitized_options = [];

    foreach ($settings_manifest as $key => $type) {
        $value = $options_to_save[$key] ?? null;

        switch ($type) {
            case 'bool':
                $sanitized_options[$key] = $value ? '1' : '0';
                break;
            case 'color':
                $sanitized_options[$key] = $value ? sanitize_hex_color($value) : '';
                break;
            case 'url':
                $sanitized_options[$key] = $value ? esc_url_raw($value) : '';
                break;
            case 'array_key':
                $sanitized_options[$key] = is_array($value) ? array_map('sanitize_key', $value) : [];
                break;
            case 'url_or_key':
            case 'text':
            default:
                $sanitized_options[$key] = $value ? sanitize_text_field($value) : '';
                break;
        }
    }

    // 3. Save the sanitized options
    update_option('wisecampaign_dc_settings', $sanitized_options);

    wp_send_json_success(['message' => 'Settings saved.']);
}
// Hook the new function to WordPress AJAX
add_action('wp_ajax_wisecampaign_dc_save_settings', 'wisecampaign_dc_ajax_save_settings');