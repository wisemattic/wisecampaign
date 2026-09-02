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
 * =================================================================
 * BACK-END ADMIN PAGE
 * =================================================================
 */

// Renders the main settings page HTML
function wisecampaign_direct_checkout_settings_page()
{
    $button_text = wisecampaign_get_dc_option('dc_button_text', 'Buy Now');
    $icon = wisecampaign_get_dc_option('dc_button_icon', 'none');
    $icon_pos = wisecampaign_get_dc_option('dc_icon_position', 'left');
    $animation = wisecampaign_get_dc_option('dc_button_animation', 'none');
    $is_pro = wisecampaign_dc_is_pro_active();

    $anim_class = ($is_pro && $animation !== 'none') ? 'wc-anim-' . sanitize_html_class($animation) : '';
    $icon_svg = ($is_pro && $icon !== 'none') ? wisecampaign_dc_get_icon_svg($icon) : '';
    ?>
    <div class="wrap wisecampaign-dc-admin-wrap">
        <div class="wisecampaign-header-banner">
            <div class="wisecampaign-header-title">
                <h1><?php echo esc_html__('Direct Checkout', 'wisecampaign'); ?></h1>
                <p><?php echo esc_html__('Speed up purchasing with 1-click Buy Now buttons, custom icons, attention-grabbing animations, and flexible positioning.', 'wisecampaign'); ?></p>
            </div>
            <?php if ($is_pro) : ?>
                <div class="wisecampaign-pro-active-badge">
                    <span class="dashicons dashicons-yes-alt"></span>
                    <span><?php esc_html_e('PRO Activated', 'wisecampaign'); ?></span>
                </div>
            <?php else : ?>
                <a href="https://wisemattic.com/wisecampaign/pricing" target="_blank" class="wisecampaign-upgrade-pill">
                    <span class="dashicons dashicons-star-filled"></span>
                    <span><?php esc_html_e('Upgrade to PRO', 'wisecampaign'); ?></span>
                </a>
            <?php endif; ?>
        </div>

        <div class="wisecampaign-settings-layout">
            <div class="wisecampaign-preview-pane">
                <div class="wisecampaign-pane-header">
                    <h2><?php echo esc_html__('Live Button Preview', 'wisecampaign'); ?></h2>
                    <span class="wisecampaign-live-dot"></span>
                </div>
                <div class="wisecampaign-preview-container">
                    <div id="wisecampaign-direct-checkout-preview">
                        <a href="#" id="preview-button" class="button button-primary button-large wisecampaign-buy-now-button <?php echo esc_attr($anim_class); ?>">
                            <span id="preview-icon-left" class="wisecampaign-dc-icon" style="<?php echo ($icon_pos !== 'right' && !empty($icon_svg)) ? '' : 'display:none;'; ?>">
                                <?php echo $icon_svg; ?>
                            </span>
                            <span id="preview-button-text"><?php echo esc_html($button_text); ?></span>
                            <span id="preview-icon-right" class="wisecampaign-dc-icon" style="<?php echo ($icon_pos === 'right' && !empty($icon_svg)) ? '' : 'display:none;'; ?>">
                                <?php echo $icon_svg; ?>
                            </span>
                        </a>
                    </div>
                </div>
                <div class="wisecampaign-preview-hint">
                    <?php esc_html_e('Real-time preview matching your selected colors, custom icons, and animation effects.', 'wisecampaign'); ?>
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
                        <?php submit_button('Save Changes', 'primary', 'submit', false, ['id' => 'wisecampaign-dc-save-btn']); ?>
                    </div>
                </form>
            </div>
        </div>

        <!-- Feature Request Section -->
        <div class="wisecampaign-feature-request-section">
            <div class="wisecampaign-feature-request-content">
                <div class="wisecampaign-feature-request-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                    </svg>
                </div>
                <div class="wisecampaign-feature-request-text">
                    <h3><?php esc_html_e('Have a Feature Request?', 'wisecampaign'); ?></h3>
                    <p><?php esc_html_e('We\'d love to hear your ideas for improving wiseCampaign! Share your suggestions and vote on existing feature requests.', 'wisecampaign'); ?></p>
                </div>
                <div class="wisecampaign-feature-request-action">
                    <a href="https://wisecampaign.canny.io/feature-requests" target="_blank" class="button button-primary button-large">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15,3 21,3 21,9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        <?php esc_html_e('Submit Feature Request', 'wisecampaign'); ?>
                    </a>
                </div>
            </div>
        </div>
    </div>
<?php
}

// Registers all settings, sections, and fields
function wisecampaign_direct_checkout_register_settings()
{
    register_setting('wisecampaign_dc_settings_group', 'wisecampaign_dc_settings');

    // Section 1: Button Configuration
    add_settings_section('wisecampaign_dc_main_section', esc_html__('Button Appearance & Style', 'wisecampaign'), 'wisecampaign_dc_main_section_callback', 'wisecampaign_dc_page');
    add_settings_field('dc_enabled', esc_html__('Enable Direct Checkout', 'wisecampaign'), 'wisecampaign_dc_field_enabled_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
    add_settings_field('dc_button_text', esc_html__('Button Text', 'wisecampaign'), 'wisecampaign_dc_field_button_text_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
    add_settings_field('dc_button_color', esc_html__('Background Color', 'wisecampaign'), 'wisecampaign_dc_field_button_color_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
    add_settings_field('dc_button_text_color', esc_html__('Text & Icon Color', 'wisecampaign'), 'wisecampaign_dc_field_button_text_color_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');

    // PRO Fields: Icons, Animation & Positioning
    add_settings_field('dc_button_icon', esc_html__('Button Icon', 'wisecampaign') . wisecampaign_dc_get_pro_badge(), 'wisecampaign_dc_field_button_icon_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
    add_settings_field('dc_button_animation', esc_html__('Attention Animation', 'wisecampaign') . wisecampaign_dc_get_pro_badge(), 'wisecampaign_dc_field_button_animation_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');
    add_settings_field('dc_button_position', esc_html__('Single Product Placement', 'wisecampaign') . wisecampaign_dc_get_pro_badge(), 'wisecampaign_dc_field_button_position_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_main_section');

    // Section 2: Behavior & Routing
    add_settings_section('wisecampaign_dc_behavior_section', esc_html__('Behavior & Targeting', 'wisecampaign'), 'wisecampaign_dc_behavior_section_callback', 'wisecampaign_dc_page');
    add_settings_field('dc_redirect_to', esc_html__('Redirect Destination', 'wisecampaign'), 'wisecampaign_dc_field_redirect_to_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_behavior_section');
    add_settings_field('dc_display_on', esc_html__('Display On', 'wisecampaign'), 'wisecampaign_dc_field_display_on_cb', 'wisecampaign_dc_page', 'wisecampaign_dc_behavior_section');
}
add_action('admin_init', 'wisecampaign_direct_checkout_register_settings');

function wisecampaign_dc_get_pro_badge()
{
    if (wisecampaign_dc_is_pro_active()) {
        return '';
    }
    return ' <span class="wc-pro-badge">PRO</span>';
}

// Section and Field callback functions
function wisecampaign_dc_main_section_callback()
{
    echo '<p class="wisecampaign-section-desc">' . esc_html__('Customize the appearance, animations, and custom icons for your "Buy Now" button.', 'wisecampaign') . '</p>';
}

function wisecampaign_dc_behavior_section_callback()
{
    echo '<p class="wisecampaign-section-desc">' . esc_html__('Configure where the button displays and where shoppers are redirected.', 'wisecampaign') . '</p>';
}

function wisecampaign_get_dc_option($key, $default = '')
{
    $options = get_option('wisecampaign_dc_settings');
    return isset($options[$key]) ? $options[$key] : $default;
}

function wisecampaign_dc_field_enabled_cb()
{
    $enabled = wisecampaign_get_dc_option('dc_enabled', '0');
    echo '<label class="wisecampaign-switch-label" for="dc_enabled">
            <input type="checkbox" name="wisecampaign_dc_settings[dc_enabled]" id="dc_enabled" value="1" ' . checked(1, $enabled, false) . ' />
            <span class="wisecampaign-switch-text">' . esc_html__('Enable the "Buy Now" button on your store.', 'wisecampaign') . '</span>
          </label>';
}

function wisecampaign_dc_field_button_text_cb()
{
    $text = wisecampaign_get_dc_option('dc_button_text', 'Buy Now');
    echo '<input type="text" name="wisecampaign_dc_settings[dc_button_text]" id="dc_button_text" value="' . esc_attr($text) . '" class="regular-text" placeholder="e.g. Buy Now, Instant Checkout" />';
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

function wisecampaign_dc_field_button_icon_cb()
{
    $is_pro = wisecampaign_dc_is_pro_active();
    $icon = wisecampaign_get_dc_option('dc_button_icon', 'none');
    $icon_pos = wisecampaign_get_dc_option('dc_icon_position', 'left');

    $icons = [
        'none'  => __('None (Text Only)', 'wisecampaign'),
        'bolt'  => __('Lightning Bolt ⚡', 'wisecampaign'),
        'bag'   => __('Shopping Bag 🛍️', 'wisecampaign'),
        'lock'  => __('Secure Lock 🔒', 'wisecampaign'),
        'cart'  => __('Shopping Cart 🛒', 'wisecampaign'),
        'arrow' => __('Forward Arrow ➔', 'wisecampaign'),
    ];

    echo '<div class="wisecampaign-field-group">';
    echo '<select name="wisecampaign_dc_settings[dc_button_icon]" id="dc_button_icon" class="regular-text ' . (!$is_pro ? 'wisecampaign-pro-locked-field' : '') . '">';
    foreach ($icons as $k => $label) {
        $disabled = (!$is_pro && $k !== 'none') ? 'disabled' : '';
        $label_suffix = (!$is_pro && $k !== 'none') ? ' [PRO]' : '';
        echo '<option value="' . esc_attr($k) . '" ' . selected($k, $icon, false) . ' ' . $disabled . '>' . esc_html($label . $label_suffix) . '</option>';
    }
    echo '</select>';

    echo '<div class="wisecampaign-icon-pos-wrap" style="margin-top: 8px;">';
    echo '<label style="margin-right: 15px;"><input type="radio" name="wisecampaign_dc_settings[dc_icon_position]" value="left" ' . checked('left', $icon_pos, false) . ' ' . (!$is_pro ? 'disabled' : '') . ' /> ' . esc_html__('Icon on Left', 'wisecampaign') . '</label>';
    echo '<label><input type="radio" name="wisecampaign_dc_settings[dc_icon_position]" value="right" ' . checked('right', $icon_pos, false) . ' ' . (!$is_pro ? 'disabled' : '') . ' /> ' . esc_html__('Icon on Right', 'wisecampaign') . '</label>';
    echo '</div>';

    if (!$is_pro) {
        echo '<p class="description wisecampaign-pro-hint"><span class="dashicons dashicons-lock"></span> ' . sprintf(__('Custom icons are a %s feature.', 'wisecampaign'), '<a href="https://wisemattic.com/wisecampaign/pricing" target="_blank">PRO</a>') . '</p>';
    }
    echo '</div>';
}

function wisecampaign_dc_field_button_animation_cb()
{
    $is_pro = wisecampaign_dc_is_pro_active();
    $animation = wisecampaign_get_dc_option('dc_button_animation', 'none');

    $animations = [
        'none'    => __('None (Static)', 'wisecampaign'),
        'pulse'   => __('Pulse Effect (Glow Wave)', 'wisecampaign'),
        'shimmer' => __('Shimmer / Light Sweep', 'wisecampaign'),
        'shake'   => __('Subtle Attention Shake', 'wisecampaign'),
        'bounce'  => __('Rhythmic Bounce', 'wisecampaign'),
    ];

    echo '<div class="wisecampaign-field-group">';
    echo '<select name="wisecampaign_dc_settings[dc_button_animation]" id="dc_button_animation" class="regular-text ' . (!$is_pro ? 'wisecampaign-pro-locked-field' : '') . '">';
    foreach ($animations as $k => $label) {
        $disabled = (!$is_pro && $k !== 'none') ? 'disabled' : '';
        $label_suffix = (!$is_pro && $k !== 'none') ? ' [PRO]' : '';
        echo '<option value="' . esc_attr($k) . '" ' . selected($k, $animation, false) . ' ' . $disabled . '>' . esc_html($label . $label_suffix) . '</option>';
    }
    echo '</select>';
    if (!$is_pro) {
        echo '<p class="description wisecampaign-pro-hint"><span class="dashicons dashicons-lock"></span> ' . sprintf(__('Attention animations are a %s feature.', 'wisecampaign'), '<a href="https://wisemattic.com/wisecampaign/pricing" target="_blank">PRO</a>') . '</p>';
    } else {
        echo '<p class="description">' . esc_html__('Select an animation to make your Buy Now button stand out.', 'wisecampaign') . '</p>';
    }
    echo '</div>';
}

function wisecampaign_dc_field_button_position_cb()
{
    $is_pro = wisecampaign_dc_is_pro_active();
    $position = wisecampaign_get_dc_option('dc_button_position', 'after_add_to_cart');

    $positions = [
        'after_add_to_cart'   => __('After Add to Cart (Default)', 'wisecampaign'),
        'before_add_to_cart'  => __('Before Add to Cart', 'wisecampaign'),
        'side_by_side'        => __('Side-by-Side (50% / 50% Row)', 'wisecampaign'),
        'below_add_to_cart'   => __('Below Add to Cart (Full-Width Stacked)', 'wisecampaign'),
        'replace_add_to_cart' => __('Replace "Add to Cart" Completely (1-Click Store Mode)', 'wisecampaign'),
    ];

    echo '<div class="wisecampaign-field-group">';
    echo '<select name="wisecampaign_dc_settings[dc_button_position]" id="dc_button_position" class="regular-text ' . (!$is_pro ? 'wisecampaign-pro-locked-field' : '') . '">';
    foreach ($positions as $k => $label) {
        $disabled = (!$is_pro && $k !== 'after_add_to_cart') ? 'disabled' : '';
        $label_suffix = (!$is_pro && $k !== 'after_add_to_cart') ? ' [PRO]' : '';
        echo '<option value="' . esc_attr($k) . '" ' . selected($k, $position, false) . ' ' . $disabled . '>' . esc_html($label . $label_suffix) . '</option>';
    }
    echo '</select>';
    if (!$is_pro) {
        echo '<p class="description wisecampaign-pro-hint"><span class="dashicons dashicons-lock"></span> ' . sprintf(__('Advanced button positioning is a %s feature.', 'wisecampaign'), '<a href="https://wisemattic.com/wisecampaign/pricing" target="_blank">PRO</a>') . '</p>';
    } else {
        echo '<p class="description">' . esc_html__('Control exactly where the Direct Checkout button appears relative to the WooCommerce Add to Cart button.', 'wisecampaign') . '</p>';
    }
    echo '</div>';
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

    echo '<select name="wisecampaign_dc_settings[dc_redirect_to]" id="dc_redirect_to" class="regular-text">';

    // Group for default WooCommerce pages
    echo '<optgroup label="' . esc_attr__('Default WooCommerce', 'wisecampaign') . '">';
    echo '<option value="checkout" ' . selected('checkout', $redirect_to, false) . '>' . esc_html__('Checkout Page (Recommended)', 'wisecampaign') . '</option>';
    echo '<option value="cart" ' . selected('cart', $redirect_to, false) . '>' . esc_html__('Cart Page', 'wisecampaign') . '</option>';
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
    echo '<option value="custom" ' . selected('custom', $redirect_to, false) . '>' . esc_html__('Custom External URL', 'wisecampaign') . '</option>';
    echo '</optgroup>';

    echo '</select>';
    echo '<br>';
    echo '<input type="url" name="wisecampaign_dc_settings[dc_redirect_custom_url]" id="dc_redirect_custom_url" value="' . esc_url($custom_url) . '" class="regular-text" style="display: ' . ($redirect_to === 'custom' ? 'block' : 'none') . '; margin-top: 10px;" placeholder="https://example.com/special-checkout" />';
}

function wisecampaign_dc_field_display_on_cb()
{
    $display_on = wisecampaign_get_dc_option('dc_display_on', []);
    $locations = [
        'single_product' => esc_html__('Single Product Pages', 'wisecampaign'),
        'shop_page'      => esc_html__('Shop & Archive Pages (Category, Tag listings)', 'wisecampaign'),
    ];
    foreach ($locations as $key => $label) {
        echo '<label for="dc_display_on_' . esc_attr($key) . '" style="display: block; margin-bottom: 6px;">
                <input type="checkbox" name="wisecampaign_dc_settings[dc_display_on][]" id="dc_display_on_' . esc_attr($key) . '" value="' . esc_attr($key) . '" ' . checked(in_array($key, (array) $display_on), true, false) . ' /> ' . $label . '
              </label>';
    }
}

// Enqueues scripts and styles for the admin page
function wisecampaign_direct_checkout_admin_scripts($hook)
{
    if ('toplevel_page_wisecampaign_menu' !== $hook && 'wisecampaign_page_wisecampaign_checkout' !== $hook) {
        return;
    }
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_script('wp-color-picker');

    // Enqueue frontend styles in admin for live preview animations & icons
    wp_enqueue_style(
        'wisecampaign-dc-styles',
        WISECAMPAIGN_DIR_URL . 'includes/css/direct-checkout.css',
        [],
        '1.5.0'
    );

    // Enqueue admin JavaScript
    wp_enqueue_script(
        'wisecampaign-dc-admin-js',
        WISECAMPAIGN_DIR_URL . 'includes/js/direct-checkout-admin.js',
        ['jquery', 'wp-color-picker'],
        '1.5.0',
        true
    );

    // Pass data to our script
    wp_localize_script('wisecampaign-dc-admin-js', 'wiseCampaignDcAdmin', [
        'ajax_url'   => admin_url('admin-ajax.php'),
        'save_nonce' => wp_create_nonce('wisecampaign_dc_save_nonce'),
        'is_pro'     => wisecampaign_dc_is_pro_active(),
        'icons'      => [
            'bolt'  => wisecampaign_dc_get_icon_svg('bolt'),
            'bag'   => wisecampaign_dc_get_icon_svg('bag'),
            'lock'  => wisecampaign_dc_get_icon_svg('lock'),
            'cart'  => wisecampaign_dc_get_icon_svg('cart'),
            'arrow' => wisecampaign_dc_get_icon_svg('arrow'),
        ]
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
        .wisecampaign-dc-admin-wrap {
            max-width: 1200px;
            margin-top: 20px;
        }

        .wisecampaign-header-banner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #fff;
            padding: 20px 24px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            margin-bottom: 24px;
        }

        .wisecampaign-header-title h1 {
            margin: 0 0 4px 0;
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
        }

        .wisecampaign-header-title p {
            margin: 0;
            color: #64748b;
            font-size: 13px;
        }

        .wc-pro-badge {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 6px;
            vertical-align: middle;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .wc-pro-badge-active {
            display: inline-block;
            background: #0ea5e9;
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 6px;
            vertical-align: middle;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .wisecampaign-pro-active-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #ecfdf5;
            color: #059669;
            border: 1px solid #a7f3d0;
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
        }

        .wisecampaign-upgrade-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #fff !important;
            padding: 8px 16px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-decoration: none;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
            transition: all 0.2s ease;
        }

        .wisecampaign-upgrade-pill:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.45);
        }

        .wisecampaign-settings-layout {
            display: grid;
            grid-template-columns: 360px 1fr;
            grid-gap: 24px;
        }

        .wisecampaign-preview-pane,
        .wisecampaign-settings-pane {
            background: #fff;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .wisecampaign-pane-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 12px;
            border-bottom: 1px solid #f1f5f9;
            margin-bottom: 20px;
        }

        .wisecampaign-pane-header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
        }

        .wisecampaign-live-dot {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
            animation: wcPulseDot 2s infinite ease-in-out;
        }

        @keyframes wcPulseDot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }

        .wisecampaign-preview-container {
            padding: 50px 20px;
            text-align: center;
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 140px;
        }

        .wisecampaign-preview-hint {
            margin-top: 14px;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
            line-height: 1.4;
        }

        #preview-button {
            background-color: <?php echo esc_attr($button_bg_color); ?>;
            border-color: <?php echo esc_attr($button_bg_color); ?>;
            color: <?php echo esc_attr($button_text_color); ?>;
            font-size: 14px;
            padding: 10px 24px;
            text-shadow: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .wisecampaign-section-desc {
            color: #64748b;
            font-size: 13px;
            margin-top: -4px;
            margin-bottom: 16px;
        }

        .wisecampaign-pro-hint {
            color: #d97706 !important;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 6px;
        }

        .wisecampaign-pro-hint .dashicons {
            font-size: 15px;
            width: 15px;
            height: 15px;
        }

        .wisecampaign-pro-locked-field {
            background-color: #fcfcfd !important;
            border-color: #fcd34d !important;
        }

        .wisecampaign-form-footer {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 15px;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #f1f5f9;
        }

        .wisecampaign-feedback-message {
            font-weight: 600;
            color: #059669;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
            font-size: 13px;
        }

        .wisecampaign-feedback-message.show {
            opacity: 1;
        }

        .wisecampaign-feedback-message.error {
            color: #dc2626;
        }

        /* Feature Request Section */
        .wisecampaign-feature-request-section {
            margin-top: 30px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            overflow: hidden;
        }

        .wisecampaign-feature-request-content {
            display: flex;
            align-items: center;
            padding: 24px;
            gap: 20px;
        }

        .wisecampaign-feature-request-icon {
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            background-color: #eff6ff;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2563eb;
        }

        .wisecampaign-feature-request-icon svg {
            width: 24px;
            height: 24px;
            stroke: currentColor;
            fill: none;
        }

        .wisecampaign-feature-request-text {
            flex-grow: 1;
        }

        .wisecampaign-feature-request-text h3 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
        }

        .wisecampaign-feature-request-text p {
            margin: 0;
            color: #64748b;
            font-size: 13px;
            line-height: 1.5;
        }

        .wisecampaign-feature-request-action {
            flex-shrink: 0;
        }

        .wisecampaign-feature-request-action .button {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            background-color: #2563eb !important;
            border-color: #2563eb !important;
            color: #fff !important;
            padding: 8px 18px !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            font-size: 13px !important;
            text-decoration: none !important;
            box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2) !important;
            transition: all 0.2s ease !important;
        }

        .wisecampaign-feature-request-action .button:hover {
            background-color: #1d4ed8 !important;
            border-color: #1d4ed8 !important;
            transform: translateY(-1px);
        }

        .wisecampaign-feature-request-action .button svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
            fill: none;
        }

        @media (max-width: 782px) {
            .wisecampaign-feature-request-content {
                flex-direction: column;
                text-align: center;
                gap: 16px;
                padding: 20px;
            }
        }

        @media screen and (max-width: 960px) {
            .wisecampaign-settings-layout {
                grid-template-columns: 1fr;
            }
        }
    </style>
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
        '1.5.0'
    );

    $button_bg_color = wisecampaign_get_dc_option('dc_button_color', '#007cba');
    $button_text_color = wisecampaign_get_dc_option('dc_button_text_color', '#ffffff');

    $custom_css = "
        .wisecampaign-buy-now-button {
            background-color: " . esc_attr($button_bg_color) . " !important;
            border-color: " . esc_attr($button_bg_color) . " !important;
            color: " . esc_attr($button_text_color) . " !important;
        }
        .wisecampaign-buy-now-button:hover {
            color: " . esc_attr($button_text_color) . " !important;
        }
        .wisecampaign-buy-now-button .wisecampaign-dc-icon svg {
            fill: " . esc_attr($button_text_color) . " !important;
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
    $is_pro = wisecampaign_dc_is_pro_active();
    $position = ($is_pro) ? wisecampaign_get_dc_option('dc_button_position', 'after_add_to_cart') : 'after_add_to_cart';

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

    $buy_now_url = add_query_arg(['add-to-cart' => $product->get_id()], $redirect_url);
    $extra_classes = [];

    if (is_shop() || is_product_category() || is_product_tag()) {
        $extra_classes[] = 'wisecampaign-buy-now-loop';
    }

    $is_pro = wisecampaign_dc_is_pro_active();

    // PRO Animation
    $animation = ($is_pro) ? wisecampaign_get_dc_option('dc_button_animation', 'none') : 'none';
    if (!empty($animation) && $animation !== 'none') {
        $extra_classes[] = 'wc-anim-' . sanitize_html_class($animation);
    }

    // PRO Position
    $position = ($is_pro) ? wisecampaign_get_dc_option('dc_button_position', 'after_add_to_cart') : 'after_add_to_cart';
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
    $icon = ($is_pro) ? wisecampaign_get_dc_option('dc_button_icon', 'none') : 'none';
    $icon_pos = ($is_pro) ? wisecampaign_get_dc_option('dc_icon_position', 'left') : 'left';
    $icon_html = '';
    if (!empty($icon) && $icon !== 'none') {
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

/**
 * AJAX Save Handler with sanitization for all direct checkout settings.
 */
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

    $is_pro = wisecampaign_dc_is_pro_active();

    // Create a manifest of all settings for sanitization
    $settings_manifest = [
        'dc_enabled'             => 'bool',
        'dc_button_text'         => 'text',
        'dc_button_color'        => 'color',
        'dc_button_text_color'   => 'color',
        'dc_button_icon'         => 'text',
        'dc_icon_position'       => 'text',
        'dc_button_animation'    => 'text',
        'dc_button_position'     => 'text',
        'dc_redirect_to'         => 'url_or_key',
        'dc_redirect_custom_url' => 'url',
        'dc_display_on'          => 'array_key'
    ];
    $sanitized_options = [];

    foreach ($settings_manifest as $key => $type) {
        $value = $options_to_save[$key] ?? null;

        // Ensure PRO fields are only enabled when Pro license is active
        if (in_array($key, ['dc_button_icon', 'dc_button_animation', 'dc_button_position']) && !$is_pro) {
            $value = 'none';
            if ($key === 'dc_button_position') {
                $value = 'after_add_to_cart';
            }
        }

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

    wp_send_json_success(['message' => 'Settings saved successfully!']);
}
add_action('wp_ajax_wisecampaign_dc_save_settings', 'wisecampaign_dc_ajax_save_settings');