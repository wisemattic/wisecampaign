<?php

namespace WISECAMPAIGN\Classes;

use WISECAMPAIGN\Traits\SingletonTrait;

if (!defined('ABSPATH')) {
    exit;
}

class SalesNotification
{
    use SingletonTrait;
    private $option_name = 'wisecampaign_sales_notification_settings';

    public function __construct()
    {
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue']);
        add_action('wp_ajax_wisecampaign_toggle_status', [$this, 'ajax_toggle_notification_status']);
        add_action('wp_ajax_wisecampaign_save_all_settings', [$this, 'ajax_save_all_settings']);
        add_action('wp_ajax_wisecampaign_reset_settings', [$this, 'ajax_reset_settings']);

        $settings = get_option($this->option_name);
        if (!empty($settings['enabled']) && '1' === $settings['enabled']) {
            add_action('wp_enqueue_scripts', [$this, 'frontend_enqueue']);
            add_action('wp_footer', [$this, 'render_frontend_container']);
        }
    }

    public function render_admin_page()
    {
        $sample_notification = $this->get_sample_notification_data();
        ?>
        <div class="wrap wisecampaign-sales-notification-wrap">
            <form action="options.php" method="post" id="wisecampaign-settings-form">
                <?php settings_fields('wisecampaign_sales_notification_settings_group'); ?>

                <div class="wisecampaign-header-bar">
                    <div class="wisecampaign-header-left">
                        <h1><?php echo esc_html__('Sales Notification', 'wisecampaign'); ?></h1>
                        <?php $this->field_cb_toggle(['id' => 'enabled']); ?>
                        <span id="wisecampaign-status-feedback" class="wisecampaign-feedback-message"></span>
                    </div>
                    <div class="wisecampaign-header-right-actions">
                        <span id="wisecampaign-form-feedback" class="wisecampaign-feedback-message"></span>
                        <button type="button" class="button button-secondary"
                            id="wisecampaign-reset-button"><?php _e('Reset', 'wisecampaign'); ?></button>
                        <?php submit_button(__('Save Settings', 'wisecampaign'), 'primary', 'submit', false, ['id' => 'wisecampaign-set-now-button']); ?>
                    </div>
                </div>

                <div class="wisecampaign-editor-layout">
                    <div class="wisecampaign-settings-panel">
                        <div class="wisecampaign-tabs-nav">
                            <ul>
                                <li><a href="#templates"
                                        class="nav-tab nav-tab-active"><?php _e('Templates', 'wisecampaign'); ?></a></li>
                                <li><a href="#settings" class="nav-tab"><?php _e('Settings', 'wisecampaign'); ?></a></li>
                            </ul>
                        </div>
                        <div class="wisecampaign-tabs-content">
                            <div id="templates" class="tab-content active">
                                <div class="template-header">
                                    <h3><?php _e('Choose a Template', 'wisecampaign'); ?></h3>
                                    <p><?php _e('Select a pre-designed template to start with. You can customize it further in the Settings tab.', 'wisecampaign'); ?>
                                    </p>
                                </div>
                                <div class="template-selector">
                                    <?php $this->field_cb_template(); ?>
                                </div>
                            </div>
                            <div id="settings" class="tab-content">
                                <table class="form-table">
                                    <?php do_settings_sections('wisecampaign_sales_notification_page'); ?>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="wisecampaign-preview-panel">
                        <div class="wisecampaign-preview-header">
                            <h3><?php _e('Live Preview', 'wisecampaign'); ?></h3>
                        </div>
                        <div id="wisecampaign-notification-preview" class="wisecampaign-notification-popup"
                            data-template="template_1">
                            <img src="<?php echo esc_url($sample_notification['product_image']); ?>" alt="Product">
                            <div class="notification-content">
                                <div class="notification-body">
                                    <p class="buyer-info">
                                        <span class="buyer-name"><?php echo esc_html($sample_notification['buyer']); ?></span>
                                        just purchased
                                    </p>
                                    <p class="product-name"><?php echo esc_html($sample_notification['product_name']); ?></p>
                                    <p class="location-info">
                                        From: <span
                                            class="location"><?php echo esc_html($sample_notification['location']); ?></span>
                                    </p>
                                </div>
                                <div class="notification-footer">
                                    <p class="timestamp"><?php echo esc_html($sample_notification['time']); ?></p>
                                    <p class="brand-credit">
                                        <a href="https://wisemattic.com/wisecampaign/" target="_blank" rel="noopener noreferrer"
                                            style="text-decoration: none; color: inherit;">
                                            by <b>wiseCampaign</b>
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <?php
    }

    public function register_settings()
    {
        register_setting('wisecampaign_sales_notification_settings_group', $this->option_name);

        add_settings_section('wisecampaign_sn_appearance_section', __('Appearance', 'wisecampaign'), null, 'wisecampaign_sales_notification_page');
        add_settings_field('sn_position', __('Sales Pop Up Position', 'wisecampaign'), [$this, 'field_cb_position'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section');
        add_settings_field('sn_bg_color', __('Background Color', 'wisecampaign'), [$this, 'field_cb_color'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'background_color', 'default' => '#FFFFFF']);
        add_settings_field('sn_border_color', __('Border Color', 'wisecampaign'), [$this, 'field_cb_color'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'border_color', 'default' => '#E85653']);
        add_settings_field('sn_border_width', __('Border Width', 'wisecampaign'), [$this, 'field_cb_slider'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'border_width', 'default' => 2, 'min' => 0, 'max' => 20]);
        add_settings_field('sn_border_radius', __('Border Radius', 'wisecampaign'), [$this, 'field_cb_slider'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'border_radius', 'default' => 10, 'min' => 0, 'max' => 100]);
        add_settings_field('sn_image_radius', __('Image Radius', 'wisecampaign'), [$this, 'field_cb_slider'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'image_radius', 'default' => 8, 'min' => 0, 'max' => 50]);
        add_settings_field('sn_font_family', __('Font Family', 'wisecampaign'), [$this, 'field_cb_font'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section');

        add_settings_section('wisecampaign_sn_content_section', __('Content & Source', 'wisecampaign'), null, 'wisecampaign_sales_notification_page');
        add_settings_field('sn_random', __('Order Show Random', 'wisecampaign'), [$this, 'field_cb_toggle'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section', ['id' => 'random_show']);
        add_settings_field('sn_source', __('Order Source', 'wisecampaign'), [$this, 'field_cb_source'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section');
        add_settings_field('sn_selected_orders', __('Select Orders', 'wisecampaign'), [$this, 'field_cb_selected_orders'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section');

        add_settings_section('wisecampaign_sn_visibility_section', __('Visibility & Timing', 'wisecampaign'), null, 'wisecampaign_sales_notification_page');
        add_settings_field('sn_visibility', __('Visibility', 'wisecampaign'), [$this, 'field_cb_visibility'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section');
        add_settings_field('sn_specific_pages', __('Select Pages', 'wisecampaign'), [$this, 'field_cb_specific_pages'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section');
        add_settings_field('sn_loop', __('Loop', 'wisecampaign'), [$this, 'field_cb_toggle'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section', ['id' => 'loop']);
        add_settings_field('sn_display_time', __('Display Time', 'wisecampaign'), [$this, 'field_cb_timing'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section', ['id' => 'display_time', 'default' => 5, 'label' => 'Sec']);
        add_settings_field('sn_delay_time', __('Next pop up delay', 'wisecampaign'), [$this, 'field_cb_timing'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section', ['id' => 'delay_time', 'default' => 5, 'label' => 'Sec']);
    }

    private function get_option($key, $default = '')
    {
        $options = get_option($this->option_name);
        return isset($options[$key]) ? $options[$key] : $default;
    }

    public function field_cb_toggle($args)
    {
        $value = $this->get_option($args['id'], false);
        $id_attr = 'wisecampaign-toggle-' . esc_attr($args['id']);
        echo '<label class="switch"><input type="checkbox" id="' . $id_attr . '" name="' . esc_attr($this->option_name) . '[' . esc_attr($args['id']) . ']" value="1" ' . checked(1, $value, false) . '/><span class="slider round"></span></label>';
    }

    public function field_cb_template()
    {
        $value = $this->get_option('template', 'template_1');
        ?>
        <div class="template-card <?php echo $value === 'template_1' ? 'selected' : ''; ?>" data-template="template_1">
            <input type="radio" name="<?php echo esc_attr($this->option_name); ?>[template]" value="template_1" <?php checked('template_1', $value); ?>>
            <img src="<?php echo esc_url(WISECAMPAIGN_DIR_URL . 'images/fe/temp-1.png'); ?>" alt="Classic Template Preview">
            <span><?php _e('Classic', 'wisecampaign'); ?></span>
        </div>
        <div class="template-card <?php echo $value === 'template_2' ? 'selected' : ''; ?>" data-template="template_2">
            <input type="radio" name="<?php echo esc_attr($this->option_name); ?>[template]" value="template_2" <?php checked('template_2', $value); ?>>
            <img src="<?php echo esc_url(WISECAMPAIGN_DIR_URL . 'images/fe/temp-2.png'); ?>" alt="Modern Template Preview">
            <span><?php _e('Modern', 'wisecampaign'); ?></span>
        </div>
        <?php
    }

    public function field_cb_slider($args)
    {
        $value = $this->get_option($args['id'], $args['default']);
        ?>
        <div class="slider-wrapper">
            <input type="range" min="<?php echo esc_attr($args['min']); ?>" max="<?php echo esc_attr($args['max']); ?>"
                value="<?php echo esc_attr($value); ?>" class="slider-input">
            <input type="number" name="<?php echo esc_attr($this->option_name); ?>[<?php echo esc_attr($args['id']); ?>]"
                value="<?php echo esc_attr($value); ?>" class="slider-value small-text"> px
        </div>
        <?php
    }

    public function field_cb_font()
    {
        $value = $this->get_option('font_family', 'Poppins');
        $fonts = ['Poppins' => 'Poppins', 'Roboto' => 'Roboto', 'Open Sans' => 'Open Sans', 'Lato' => 'Lato'];
        echo '<select name="' . esc_attr($this->option_name) . '[font_family]">';
        foreach ($fonts as $key => $label) {
            echo '<option value="' . esc_attr($key) . '" ' . selected($key, $value, false) . '>' . esc_html($label) . '</option>';
        }
        echo '</select>';
    }

    public function field_cb_visibility()
    {
        $value = $this->get_option('visibility', 'all_pages');
        $options = ['all_pages' => 'Show on every page', 'specific_pages' => 'Specific pages'];
        echo '<select id="wisecampaign_visibility_select" name="' . esc_attr($this->option_name) . '[visibility]">';
        foreach ($options as $key => $label) {
            echo '<option value="' . esc_attr($key) . '" ' . selected($key, $value, false) . '>' . esc_html($label) . '</option>';
        }
        echo '</select>';
    }

    public function field_cb_specific_pages()
    {
        $selected_pages = $this->get_option('specific_pages', []);
        $pages = get_pages(['post_status' => 'publish']);
        if (empty($pages)) {
            echo '<p>No pages found.</p>';
            return;
        }
        echo '<select id="wisecampaign-specific-pages-select" name="' . esc_attr($this->option_name) . '[specific_pages][]" multiple="multiple" style="height: 200px; width: 50%;">';
        foreach ($pages as $page) {
            $is_selected = in_array($page->ID, $selected_pages);
            echo '<option value="' . esc_attr($page->ID) . '" ' . selected($is_selected, true, false) . '>' . esc_html($page->post_title) . '</option>';
        }
        echo '</select>';
        echo '<p class="description">Hold CTRL (or Command on Mac) to select multiple pages.</p>';
    }

    public function field_cb_timing($args)
    {
        $value = $this->get_option($args['id'], $args['default']);
        echo '<input type="number" name="' . esc_attr($this->option_name) . '[' . esc_attr($args['id']) . ']" value="' . esc_attr($value) . '" class="small-text"> ' . esc_html($args['label']);
    }

    public function field_cb_position()
    {
        $value = $this->get_option('position', 'bottom-left');
        $positions = ['bottom-left' => 'Bottom Left', 'bottom-right' => 'Bottom Right', 'top-left' => 'Top Left', 'top-right' => 'Top Right'];
        echo '<select name="' . esc_attr($this->option_name) . '[position]">';
        foreach ($positions as $key => $label) {
            echo '<option value="' . esc_attr($key) . '" ' . selected($key, $value, false) . '>' . esc_html($label) . '</option>';
        }
        echo '</select>';
    }

    public function field_cb_color($args)
    {
        $value = $this->get_option($args['id'], $args['default']);
        echo '<input type="text" name="' . esc_attr($this->option_name) . '[' . esc_attr($args['id']) . ']" value="' . esc_attr($value) . '" class="wp-color-picker-field" />';
    }

    public function field_cb_source()
    {
        $value = $this->get_option('source', 'recent_orders');
        $sources = ['recent_orders' => 'Recent Orders', 'selected_orders' => 'Selected Orders'];
        echo '<select id="wisecampaign_order_source_select" name="' . esc_attr($this->option_name) . '[source]">';
        foreach ($sources as $key => $label) {
            echo '<option value="' . esc_attr($key) . '" ' . selected($key, $value, false) . '>' . esc_html($label) . '</option>';
        }
        echo '</select>';
        echo '<p class="description">Choose to show notifications from all recent orders or only from specific ones.</p>';
    }

    public function field_cb_selected_orders()
    {
        $selected_orders = $this->get_option('selected_orders', []);
        $query = new \WC_Order_Query(['limit' => 100, 'orderby' => 'date', 'order' => 'DESC']);
        $orders = $query->get_orders();
        if (empty($orders)) {
            echo '<p>No orders found.</p>';
            return;
        }
        echo '<select id="wisecampaign-selected-orders-select" name="' . esc_attr($this->option_name) . '[selected_orders][]" multiple="multiple" style="height: 200px; width: 50%;">';
        foreach ($orders as $order) {
            $order_id = $order->get_id();
            $order_label = '#' . $order_id . ' &ndash; ' . $order->get_billing_first_name() . ' ' . $order->get_billing_last_name();
            $is_selected = in_array($order_id, $selected_orders);
            echo '<option value="' . esc_attr($order_id) . '" ' . selected($is_selected, true, false) . '>' . esc_html($order_label) . '</option>';
        }
        echo '</select>';
        echo '<p class="description">Hold CTRL (or Command on Mac) to select multiple orders.</p>';
    }

    public function admin_enqueue($hook)
    {
        if ('wisecampaign_page_wisecampaign_notification' !== $hook) {
            return;
        }
        $this->enqueue_google_fonts();
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_style('wisecampaign-notification-admin-css', WISECAMPAIGN_DIR_URL . 'includes/css/notification-admin.css');
        wp_add_inline_style('wisecampaign-notification-admin-css', $this->get_dynamic_admin_css());
        wp_enqueue_script('wp-color-picker');
        wp_enqueue_script('wisecampaign-notification-admin-js', WISECAMPAIGN_DIR_URL . 'includes/js/notification-admin.js', ['jquery', 'wp-color-picker'], false, true);
        wp_localize_script('wisecampaign-notification-admin-js', 'wiseCampaignAdmin', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'toggle_nonce' => wp_create_nonce('wisecampaign_toggle_status_nonce'),
            'save_nonce' => wp_create_nonce('wisecampaign_save_settings_nonce'),
            'reset_nonce' => wp_create_nonce('wisecampaign_reset_settings_nonce')
        ]);
    }

    public function ajax_save_all_settings()
    {
        check_ajax_referer('wisecampaign_save_settings_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Permission denied.']);
        }

        $form_data = [];
        if (isset($_POST['form_data'])) {
            parse_str($_POST['form_data'], $form_data);
        }
        $new_options = isset($form_data[$this->option_name]) ? $form_data[$this->option_name] : [];
        $all_settings = get_option($this->option_name, []);

        $settings_manifest = [
            'enabled' => 'bool',
            'template' => 'key',
            'position' => 'key',
            'background_color' => 'color',
            'border_color' => 'color',
            'border_width' => 'int',
            'border_radius' => 'int',
            'image_radius' => 'int',
            'font_family' => 'text',
            'random_show' => 'bool',
            'source' => 'key',
            'selected_orders' => 'array_int',
            'visibility' => 'key',
            'specific_pages' => 'array_int',
            'loop' => 'bool',
            'display_time' => 'int',
            'delay_time' => 'int'
        ];

        foreach ($settings_manifest as $key => $type) {
            $value = isset($new_options[$key]) ? $new_options[$key] : null;
            switch ($type) {
                case 'bool':
                    $all_settings[$key] = $value ? '1' : '0';
                    break;
                case 'int':
                    if ($value !== null) {
                        $all_settings[$key] = intval($value);
                    }
                    break;
                case 'color':
                    if ($value !== null) {
                        $all_settings[$key] = sanitize_hex_color($value);
                    }
                    break;
                case 'array_int':
                    $all_settings[$key] = is_array($value) ? array_map('intval', $value) : [];
                    break;
                case 'key':
                case 'text':
                default:
                    if ($value !== null) {
                        $all_settings[$key] = sanitize_text_field($value);
                    }
                    break;
            }
        }

        update_option($this->option_name, $all_settings);
        wp_send_json_success(['message' => 'Settings saved.']);
    }

    public function ajax_toggle_notification_status()
    {
        check_ajax_referer('wisecampaign_toggle_status_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Permission denied.']);
        }

        $new_status = isset($_POST['status']) ? sanitize_text_field($_POST['status']) : '0';
        $options = get_option($this->option_name, []);
        $options['enabled'] = $new_status;
        update_option($this->option_name, $options);

        wp_send_json_success(['message' => 'Status updated successfully.']);
    }

    private function get_dynamic_admin_css()
    {
        $bg_color = $this->get_option('background_color', '#FFFFFF');
        $border_color = $this->get_option('border_color', '#E85653');
        $border_width = $this->get_option('border_width', 2);
        $border_radius = $this->get_option('border_radius', 10);
        $font_family = $this->get_option('font_family', 'Poppins');

        return ":root {
            --notification-bg-color: " . esc_attr($bg_color) . ";
            --notification-border-color: " . esc_attr($border_color) . ";
            --notification-border-width: " . esc_attr($border_width) . "px;
            --notification-border-radius: " . esc_attr($border_radius) . "px;
            --notification-font-family: '" . esc_attr($font_family) . "', sans-serif;
        }";
    }

    public function frontend_enqueue()
    {
        $settings = get_option($this->option_name);
        $visibility = $settings['visibility'] ?? 'all_pages';
        if ($visibility === 'specific_pages') {
            $specific_pages = $settings['specific_pages'] ?? [];
            if (empty($specific_pages) || !is_page($specific_pages)) {
                return;
            }
        }

        $this->enqueue_google_fonts();
        wp_enqueue_style('wisecampaign-notification-frontend-css', WISECAMPAIGN_DIR_URL . 'includes/css/notification-frontend.css');

        $position_css = '';
        $position = $settings['position'] ?? 'bottom-left';
        if ($position === 'bottom-left')
            $position_css = 'bottom: 20px; left: 20px;';
        if ($position === 'bottom-right')
            $position_css = 'bottom: 20px; right: 20px;';
        if ($position === 'top-left')
            $position_css = 'top: 20px; left: 20px;';
        if ($position === 'top-right')
            $position_css = 'top: 20px; right: 20px;';
        wp_add_inline_style('wisecampaign-notification-frontend-css', "#wisecampaign-notification-container { $position_css }");

        wp_enqueue_script('wisecampaign-notification-frontend-js', WISECAMPAIGN_DIR_URL . 'includes/js/notification-frontend.js', [], false, true);
        wp_localize_script('wisecampaign-notification-frontend-js', 'wiseCampaignFrontend', [
            'settings' => $settings,
            'notifications' => $this->get_notification_data()
        ]);
    }

    public function render_frontend_container()
    {
        echo '<div id="wisecampaign-notification-container"></div>';
    }

    private function get_sample_notification_data()
    {
        $notifications = $this->get_notification_data();
        if (!empty($notifications)) {
            return $notifications[0];
        }
        return [
            'product_name' => 'Sample Product',
            'product_image' => function_exists('wc_placeholder_img_src') ? wc_placeholder_img_src() : WISECAMPAIGN_DIR_URL . 'images/fe/wc_logo.png',
            'buyer' => 'John Doe',
            'time' => '5 minutes ago',
            'location' => 'New York, USA'
        ];
    }

    private function get_notification_data()
    {
        if (!class_exists('WooCommerce') || !function_exists('wc_placeholder_img_src')) {
            return [];
        }

        $settings = get_option($this->option_name);
        $source = $settings['source'] ?? 'recent_orders';
        $order_args = [];

        if ($source === 'selected_orders') {
            $selected_ids = $settings['selected_orders'] ?? [];
            if (empty($selected_ids)) {
                return [];
            }
            $order_args = [
                'include' => $selected_ids,
                'limit' => count($selected_ids),
                'status' => 'completed',
            ];
        } else {
            $order_args = [
                'limit' => 10,
                'orderby' => 'date',
                'order' => 'DESC',
                'status' => 'completed',
            ];
        }

        $query = new \WC_Order_Query($order_args);
        $orders = $query->get_orders();
        $items = [];

        foreach ($orders as $order) {
            foreach ($order->get_items() as $item) {
                $product = $item->get_product();
                if (!$product) {
                    continue;
                }
                $image_url = wp_get_attachment_url($product->get_image_id()) ?: wc_placeholder_img_src();
                $items[] = [
                    'product_name' => $item->get_name(),
                    'product_image' => $image_url,
                    'buyer' => $order->get_billing_first_name(),
                    'time' => human_time_diff(strtotime($order->get_date_created()->date('Y-m-d H:i:s')), current_time('timestamp')) . ' ago',
                    'location' => $order->get_billing_city() . ', ' . (WC()->countries->countries[$order->get_billing_country()] ?? $order->get_billing_country()),
                ];
            }
        }
        return $items;
    }

    private function get_default_settings()
    {
        return [
            'enabled' => '1',
            'template' => 'template_1',
            'position' => 'bottom-left',
            'background_color' => '#FFFFFF',
            'border_color' => '#10B981',
            'border_width' => 1,
            'border_radius' => 8,
            'image_radius' => 10,
            'font_family' => 'Poppins',
            'random_show' => '0',
            'source' => 'recent_orders',
            'selected_orders' => [],
            'visibility' => 'all_pages',
            'specific_pages' => [],
            'loop' => '1',
            'display_time' => 5,
            'delay_time' => 5
        ];
    }

    public function ajax_reset_settings()
    {
        check_ajax_referer('wisecampaign_reset_settings_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Permission denied.']);
        }

        $defaults = $this->get_default_settings();
        update_option($this->option_name, $defaults);
        wp_send_json_success($defaults);
    }

    private function enqueue_google_fonts()
    {
        $font_family = $this->get_option('font_family', 'Poppins');
        $font_families = ['Poppins', 'Roboto', 'Open Sans', 'Lato'];

        if (in_array($font_family, $font_families)) {
            $font_url = 'https://fonts.googleapis.com/css2?family=' . urlencode($font_family) . ':wght@400;600;700&display=swap';
            wp_enqueue_style('wisecampaign-google-font-' . sanitize_key($font_family), $font_url, [], null);
        }
    }
}