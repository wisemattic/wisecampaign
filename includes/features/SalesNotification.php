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

        add_action('wp_enqueue_scripts', [$this, 'frontend_enqueue']);
        add_action('wp_footer', [$this, 'render_frontend_container']);
    }

    public function render_admin_page()
    {
        $sample_notification = $this->get_sample_notification_data();
        $settings = get_option($this->option_name, []);
        $enabled = isset($settings['enabled']) ? $settings['enabled'] : '1';
        $is_pro = $this->is_pro_active();
        ?>
        <div class="wisecampaign-sales-notification-admin" style="max-width: 1200px; margin-top: 20px;">
            <div class="wisecampaign-header-banner">
                <div class="wisecampaign-header-title">
                    <h1 style="margin: 0 0 4px 0; font-size: 22px; font-weight: 800; color: #0f172a;"><?php esc_html_e('Sales Notification (Social Proof)', 'wisecampaign'); ?></h1>
                    <p style="margin: 0; color: #64748b; font-size: 13px;"><?php esc_html_e('Boost buyer trust and create authentic purchase urgency with real-time popup notifications.', 'wisecampaign'); ?></p>
                </div>
                <div class="wisecampaign-header-actions" style="display: flex; align-items: center; gap: 14px;">
                    <label class="wisecampaign-toggle-label" title="<?php esc_attr_e('Enable/Disable Sales Notification', 'wisecampaign'); ?>" style="display: inline-flex; align-items: center;">
                        <input type="checkbox" id="wisecampaign-toggle-enabled" <?php checked('1', $enabled); ?> />
                        <span class="wisecampaign-toggle-slider"></span>
                    </label>
                    <span id="wisecampaign-status-feedback" class="wisecampaign-feedback-message"></span>
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
            </div>

            <form action="options.php" method="post" id="wisecampaign-settings-form" autocomplete="off">
                <input type="hidden" name="<?php echo esc_attr($this->option_name); ?>[enabled]" id="wisecampaign-hidden-enabled" value="<?php echo esc_attr($enabled); ?>" />
                <?php settings_fields('wisecampaign_sales_notification_settings_group'); ?>

                <div class="wisecampaign-admin-main">
                    <aside class="wisecampaign-admin-sidebar">
                        <nav class="wisecampaign-tabs" role="tablist">
                            <button type="button" class="wisecampaign-tab active" data-tab="settings" aria-selected="true" aria-controls="wisecampaign-tab-settings" id="tab-settings"><?php _e('Settings & Content', 'wisecampaign'); ?></button>
                            <button type="button" class="wisecampaign-tab" data-tab="templates" aria-selected="false" aria-controls="wisecampaign-tab-templates" id="tab-templates"><?php _e('Templates', 'wisecampaign'); ?></button>
                        </nav>

                        <section class="wisecampaign-tab-content" id="wisecampaign-tab-settings" role="tabpanel" aria-labelledby="tab-settings" style="display: block;">
                            <div class="wisecampaign-settings-sections">
                                <div class="wisecampaign-settings-card">
                                    <div class="wisecampaign-settings-card-header" data-toggle="collapse">
                                        <span><?php _e('Content & Source', 'wisecampaign'); ?></span>
                                        <button type="button" class="wisecampaign-card-toggle" aria-label="Toggle Content Section">&#9660;</button>
                                    </div>
                                    <div class="wisecampaign-settings-card-body">
                                        <?php
                                        do_settings_fields('wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section');
                                        ?>
                                    </div>
                                </div>
                                <div class="wisecampaign-settings-card">
                                    <div class="wisecampaign-settings-card-header" data-toggle="collapse">
                                        <span><?php _e('Appearance', 'wisecampaign'); ?></span>
                                        <button type="button" class="wisecampaign-card-toggle" aria-label="Toggle Appearance Section">&#9660;</button>
                                    </div>
                                    <div class="wisecampaign-settings-card-body">
                                        <?php
                                        do_settings_fields('wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section');
                                        ?>
                                    </div>
                                </div>
                                <div class="wisecampaign-settings-card">
                                    <div class="wisecampaign-settings-card-header" data-toggle="collapse">
                                        <span><?php _e('Visibility & Timing', 'wisecampaign'); ?></span>
                                        <button type="button" class="wisecampaign-card-toggle" aria-label="Toggle Visibility Section">&#9660;</button>
                                    </div>
                                    <div class="wisecampaign-settings-card-body">
                                        <?php
                                        do_settings_fields('wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section');
                                        ?>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="wisecampaign-tab-content" id="wisecampaign-tab-templates" role="tabpanel" aria-labelledby="tab-templates" style="display:none;">
                            <h3 style="margin-top: 0; font-size: 15px; font-weight: 700; color: #1e293b;"><?php _e('Choose a Template Style', 'wisecampaign'); ?></h3>
                            <div class="wisecampaign-template-list">
                                <?php $this->field_cb_template(); ?>
                            </div>
                        </section>
                    </aside>

                    <main class="wisecampaign-admin-preview">
                        <div class="wisecampaign-live-preview-title"><?php _e('Live Preview', 'wisecampaign'); ?></div>
                        <div id="wisecampaign-notification-preview" class="wisecampaign-notification-popup" data-template="<?php echo esc_attr($settings['template'] ?? 'template_1'); ?>">
                            <img src="<?php echo esc_url($sample_notification['product_image']); ?>" alt="Product">
                            <div class="notification-content">
                                <div class="notification-body">
                                    <span class="buyer-info">
                                        <span class="buyer-name"><?php echo esc_html($sample_notification['buyer']); ?></span>
                                        <?php _e('just purchased', 'wisecampaign'); ?>
                                    </span>
                                    <div class="product-name"><?php echo esc_html($sample_notification['product_name']); ?></div>
                                    <div class="location-info">
                                        <?php _e('From:', 'wisecampaign'); ?>
                                        <span class="location"><?php echo esc_html($sample_notification['location']); ?></span>
                                    </div>
                                </div>
                                <div class="notification-footer">
                                    <span class="timestamp"><?php echo esc_html($sample_notification['time']); ?></span>
                                    <span class="brand-credit" style="<?php echo (isset($settings['hide_branding']) && $settings['hide_branding'] === '1' && $is_pro) ? 'display: none;' : ''; ?>">
                                        <a href="https://wisemattic.com/wisecampaign/" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
                                            <?php _e('by', 'wisecampaign'); ?> <b>wiseCampaign</b>
                                        </a>
                                    </span>
                                </div>

                            </div>
                        </div>
                        <div class="wisecampaign-admin-actions">
                            <button type="button" class="wisecampaign-btn reset" id="wisecampaign-reset-button"><?php _e('Reset', 'wisecampaign'); ?></button>
                            <button type="submit" class="wisecampaign-btn save" id="wisecampaign-set-now-button" form="wisecampaign-settings-form"><?php _e('Save Changes', 'wisecampaign'); ?></button>
                            <span id="wisecampaign-form-feedback" class="wisecampaign-feedback-message"></span>
                        </div>
                    </main>
                </div>
            </form>

            <!-- Feature Request Section -->
            <div class="wisecampaign-feature-request-section" style="margin-top: 30px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); overflow: hidden;">
                <div class="wisecampaign-feature-request-content" style="display: flex; align-items: center; padding: 24px; gap: 20px;">
                    <div class="wisecampaign-feature-request-icon" style="flex-shrink: 0; width: 48px; height: 48px; background-color: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #2563eb;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14,2 14,8 20,8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10,9 9,9 8,9" />
                        </svg>
                    </div>
                    <div class="wisecampaign-feature-request-text" style="flex-grow: 1;">
                        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a;"><?php esc_html_e('Have a Feature Request?', 'wisecampaign'); ?></h3>
                        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;"><?php esc_html_e('We\'d love to hear your ideas for improving wiseCampaign! Share your suggestions and vote on existing feature requests.', 'wisecampaign'); ?></p>
                    </div>
                    <div class="wisecampaign-feature-request-action" style="flex-shrink: 0;">
                        <a href="https://wisecampaign.canny.io/feature-requests" target="_blank" class="button button-primary button-large" style="display: inline-flex; align-items: center; gap: 6px; background-color: #2563eb; border-color: #2563eb; color: #fff; padding: 8px 18px; border-radius: 8px; font-weight: 600; font-size: 13px; text-decoration: none;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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


    public function register_settings()
    {
        register_setting('wisecampaign_sales_notification_settings_group', $this->option_name);

        add_settings_section('wisecampaign_sn_appearance_section', __('Appearance', 'wisecampaign'), null, 'wisecampaign_sales_notification_page');
        add_settings_field('sn_position', __('', 'wisecampaign'), [$this, 'field_cb_position'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['label_for' => __('Sales Pop Up Position', 'wisecampaign')]);
        add_settings_field('sn_bg_color', __('', 'wisecampaign'), [$this, 'field_cb_color'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'background_color', 'default' => '#FFFFFF', 'label_for' => __('Background Color', 'wisecampaign')]);
        add_settings_field('sn_border_color', __('', 'wisecampaign'), [$this, 'field_cb_color'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'border_color', 'default' => '#E85653', 'label_for' => __('Border Color', 'wisecampaign')]);
        add_settings_field('sn_border_width', __('', 'wisecampaign'), [$this, 'field_cb_slider'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'border_width', 'default' => 0, 'min' => 0, 'max' => 20, 'label_for' => __('Border Width', 'wisecampaign')]);
        add_settings_field('sn_border_radius', __('', 'wisecampaign'), [$this, 'field_cb_slider'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'border_radius', 'default' => 10, 'min' => 0, 'max' => 100, 'label_for' => __('Border Radius', 'wisecampaign')]);
        add_settings_field('sn_image_radius', __('', 'wisecampaign'), [$this, 'field_cb_slider'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'image_radius', 'default' => 8, 'min' => 0, 'max' => 50, 'label_for' => __('Image Radius', 'wisecampaign')]);
        add_settings_field('sn_font_family', __('', 'wisecampaign'), [$this, 'field_cb_font'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['label_for' => __('Font Family', 'wisecampaign')]);
        add_settings_field('sn_hide_branding', __('', 'wisecampaign'), [$this, 'field_cb_hide_branding'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_appearance_section', ['id' => 'hide_branding', 'label_for' => __('Hide Branding Watermark', 'wisecampaign')]);

        add_settings_section('wisecampaign_sn_content_section', __('Content & Source', 'wisecampaign'), null, 'wisecampaign_sales_notification_page');

        add_settings_field('sn_random', __('', 'wisecampaign'), [$this, 'field_cb_toggle'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section', ['id' => 'random_show', 'label_for' => __('Order Show Random', 'wisecampaign')]);
        add_settings_field('sn_source', __('', 'wisecampaign'), [$this, 'field_cb_source'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section', ['label_for' => __('Order Source', 'wisecampaign')]);
        add_settings_field('sn_selected_orders', __('', 'wisecampaign'), [$this, 'field_cb_selected_orders'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section', ['label_for' => __('Select Orders', 'wisecampaign')]);

        // Virtual Orders PRO fields
        add_settings_field('sn_virtual_names', __('', 'wisecampaign'), [$this, 'field_cb_virtual_names'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section', ['label_for' => __('Custom Buyer Names', 'wisecampaign')]);
        add_settings_field('sn_virtual_locations', __('', 'wisecampaign'), [$this, 'field_cb_virtual_locations'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section', ['label_for' => __('Custom Locations', 'wisecampaign')]);
        add_settings_field('sn_virtual_products_mode', __('', 'wisecampaign'), [$this, 'field_cb_virtual_products_mode'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section', ['label_for' => __('Products to Promote', 'wisecampaign')]);
        add_settings_field('sn_virtual_selected_products', __('', 'wisecampaign'), [$this, 'field_cb_virtual_selected_products'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_content_section', ['label_for' => __('Select Products', 'wisecampaign')]);

        add_settings_section('wisecampaign_sn_visibility_section', __('Visibility & Timing', 'wisecampaign'), null, 'wisecampaign_sales_notification_page');
        add_settings_field('sn_visibility', __('', 'wisecampaign'), [$this, 'field_cb_visibility'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section', ['label_for' => __('Visibility', 'wisecampaign')]);
        add_settings_field('sn_specific_pages', __('', 'wisecampaign'), [$this, 'field_cb_specific_pages'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section', ['label_for' => __('Select Pages', 'wisecampaign')]);
        add_settings_field('sn_loop', __('', 'wisecampaign'), [$this, 'field_cb_toggle'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section', ['id' => 'loop', 'label_for' => __('Loop', 'wisecampaign')]);
        add_settings_field('sn_display_time', __('', 'wisecampaign'), [$this, 'field_cb_timing'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section', ['id' => 'display_time', 'default' => 5, 'label' => 'Sec', 'label_for' => __('Display Time', 'wisecampaign')]);
        add_settings_field('sn_delay_time', __('', 'wisecampaign'), [$this, 'field_cb_timing'], 'wisecampaign_sales_notification_page', 'wisecampaign_sn_visibility_section', ['id' => 'delay_time', 'default' => 5, 'label' => 'Sec', 'label_for' => __('Next pop up delay', 'wisecampaign')]);
    }

    public function is_pro_active()
    {
        if (class_exists('\\WISECAMPAIGNPRO\\Classes\\ProPluginLicense')) {
            return \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
        }
        return false;
    }


    private function get_option($key, $default = '')
    {
        $options = get_option($this->option_name);
        return isset($options[$key]) ? $options[$key] : $default;
    }

    public function field_cb_toggle($args)
    {
        $value = $this->get_option($args['id'], '0');
        $id_attr = 'wisecampaign-toggle-' . esc_attr($args['id']);
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-toggle">
            <div class="wisecampaign-field-label">
                <label for="<?php echo $id_attr; ?>"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <label class="wisecampaign-toggle-label">
                    <input type="checkbox" id="<?php echo $id_attr; ?>" name="<?php echo esc_attr($this->option_name) . '[' . esc_attr($args['id']) . ']'; ?>" value="1" <?php checked('1', $value); ?>/>
                    <span class="wisecampaign-toggle-slider"></span>
                </label>
            </div>
        </div>
        <?php
    }

    public function field_cb_template()
    {
        $value = $this->get_option('template', 'template_1');
        $is_pro = $this->is_pro_active();

        $templates = [
            [
                'id' => 'template_1',
                'name' => __('Classic Card', 'wisecampaign'),
                'is_pro' => false,
                'desc' => __('Clean rounded card with square thumbnail', 'wisecampaign'),
                'type' => 'classic',
            ],
            [
                'id' => 'template_2',
                'name' => __('Modern Pill', 'wisecampaign'),
                'is_pro' => false,
                'desc' => __('Capsule pill layout with circular avatar', 'wisecampaign'),
                'type' => 'pill',
            ],
            [
                'id' => 'template_3',
                'name' => __('Frosted Glass', 'wisecampaign'),
                'is_pro' => true,
                'desc' => __('Translucent glassmorphism with blur glow', 'wisecampaign'),
                'type' => 'glass',
            ],
            [
                'id' => 'template_4',
                'name' => __('Minimalist Micro', 'wisecampaign'),
                'is_pro' => true,
                'desc' => __('Compact, high-density mobile card', 'wisecampaign'),
                'type' => 'micro',
            ],
            [
                'id' => 'template_5',
                'name' => __('Gradient Accent', 'wisecampaign'),
                'is_pro' => true,
                'desc' => __('Vibrant dual-color left border stripe', 'wisecampaign'),
                'type' => 'gradient',
            ],
            [
                'id' => 'template_6',
                'name' => __('Dark Mode Neo', 'wisecampaign'),
                'is_pro' => true,
                'desc' => __('Deep slate dark theme with cyan accent', 'wisecampaign'),
                'type' => 'dark',
            ],
        ];
        ?>
        <div class="wisecampaign-template-grid">
            <?php foreach ($templates as $tmpl) : 
                $locked = $tmpl['is_pro'] && !$is_pro;
                $selected = ($value === $tmpl['id']) && !$locked;
            ?>
                <div class="template-card <?php echo $selected ? 'selected' : ''; ?> <?php echo $locked ? 'pro-locked' : ''; ?>" 
                     data-template="<?php echo esc_attr($tmpl['id']); ?>" 
                     data-is-pro="<?php echo $tmpl['is_pro'] ? '1' : '0'; ?>">
                    
                    <div class="template-card-header">
                        <span class="template-card-title"><?php echo esc_html($tmpl['name']); ?></span>
                        <?php if ($tmpl['is_pro'] && !$is_pro) : ?>
                            <span class="wc-pro-badge"><?php esc_html_e('PRO', 'wisecampaign'); ?></span>
                        <?php endif; ?>
                    </div>

                    <div class="template-card-preview preview-<?php echo esc_attr($tmpl['type']); ?>">
                        <div class="mini-popup">
                            <div class="mini-img"></div>
                            <div class="mini-content">
                                <div class="mini-line mini-line-sm"></div>
                                <div class="mini-line mini-line-lg"></div>
                                <div class="mini-line mini-line-md"></div>
                            </div>
                        </div>
                    </div>

                    <input type="radio" name="<?php echo esc_attr($this->option_name); ?>[template]" value="<?php echo esc_attr($tmpl['id']); ?>" <?php checked($value, $tmpl['id']); ?> <?php echo $locked ? 'disabled' : ''; ?> />
                    <span class="template-card-desc"><?php echo esc_html($tmpl['desc']); ?></span>
                </div>
            <?php endforeach; ?>
        </div>
        <?php
    }


    public function field_cb_slider($args)
    {
        $value = $this->get_option($args['id'], $args['default']);
        $id_attr = 'wisecampaign-slider-' . esc_attr($args['id']);
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-slider">
            <div class="wisecampaign-field-label">
                <label for="<?php echo $id_attr; ?>"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <div class="slider-wrapper">
                    <input type="range" class="slider-input" id="<?php echo $id_attr; ?>" name="<?php echo esc_attr($this->option_name) . '[' . esc_attr($args['id']) . ']'; ?>" value="<?php echo esc_attr($value); ?>" min="<?php echo esc_attr($args['min']); ?>" max="<?php echo esc_attr($args['max']); ?>">
                    <input type="number" class="slider-value" value="<?php echo esc_attr($value); ?>" min="<?php echo esc_attr($args['min']); ?>" max="<?php echo esc_attr($args['max']); ?>">
                    <span class="unit">px</span>
                </div>
            </div>
        </div>
        <?php
    }

    public function field_cb_font($args)
    {
        $value = $this->get_option('font_family', 'Poppins');
        $fonts = ['Poppins' => 'Poppins', 'Roboto' => 'Roboto'];
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-font">
            <div class="wisecampaign-field-label">
                <label for="wisecampaign-font-family"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <select id="wisecampaign-font-family" name="<?php echo esc_attr($this->option_name); ?>[font_family]">
                    <?php foreach ($fonts as $key => $label) : ?>
                        <option value="<?php echo esc_attr($key); ?>" <?php selected($key, $value); ?>><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>
        <?php
    }

    public function field_cb_hide_branding($args)
    {
        $is_pro = $this->is_pro_active();
        $value = $this->get_option('hide_branding', '0');
        $id_attr = 'wisecampaign-toggle-hide_branding';
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-toggle wisecampaign-field-hide-branding">
            <div class="wisecampaign-field-label">
                <label for="<?php echo $id_attr; ?>">
                    <?php echo esc_html($args['label_for']); ?>
                    <?php if (!$is_pro) : ?>
                        <span class="wc-pro-badge" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-left: 6px; vertical-align: middle;">PRO</span>
                    <?php endif; ?>
                </label>
            </div>
            <div class="wisecampaign-field-control">
                <label class="wisecampaign-toggle-label">
                    <input type="checkbox" id="<?php echo $id_attr; ?>" name="<?php echo esc_attr($this->option_name); ?>[hide_branding]" value="1" <?php checked('1', $value); ?> <?php echo (!$is_pro ? 'disabled' : ''); ?> />
                    <span class="wisecampaign-toggle-slider"></span>
                </label>
                <p class="description"><?php esc_html_e('Remove the "by wiseCampaign" watermark link from all sales notification popups on your storefront.', 'wisecampaign'); ?></p>
                <?php if (!$is_pro) : ?>
                    <p class="description" style="color: #d97706; margin-top: 4px;"><span class="dashicons dashicons-lock" style="font-size: 14px; width: 14px; height: 14px; vertical-align: middle;"></span> <?php printf(esc_html__('Removing branding watermark is a %s feature.', 'wisecampaign'), '<a href="https://wisemattic.com/wisecampaign/pricing" target="_blank">PRO</a>'); ?></p>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }


    public function field_cb_visibility($args)
    {
        $value = $this->get_option('visibility', 'all_pages');
        $options = ['all_pages' => 'Show on every page', 'specific_pages' => 'Specific pages'];
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-visibility">
            <div class="wisecampaign-field-label">
                <label for="wisecampaign_visibility_select"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <select id="wisecampaign_visibility_select" name="<?php echo esc_attr($this->option_name); ?>[visibility]">
                    <?php foreach ($options as $key => $label) : ?>
                        <option value="<?php echo esc_attr($key); ?>" <?php selected($key, $value); ?>><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>
        <?php
    }

    public function field_cb_specific_pages($args)
    {
        $selected_pages = $this->get_option('specific_pages', []);
        $pages = get_pages(['post_status' => 'publish']);
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-specific-pages">
            <div class="wisecampaign-field-label">
                <label for="wisecampaign-specific-pages-select"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <?php if (empty($pages)) : ?>
                    <p>No pages found.</p>
                <?php else : ?>
                    <select id="wisecampaign-specific-pages-select" name="<?php echo esc_attr($this->option_name); ?>[specific_pages][]" multiple="multiple" style="height: 200px; width: 50%;">
                        <?php foreach ($pages as $page) :
                            $is_selected = in_array($page->ID, $selected_pages);
                            ?>
                            <option value="<?php echo esc_attr($page->ID); ?>" <?php selected($is_selected, true); ?>><?php echo esc_html($page->post_title); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <p class="description">Hold CTRL (or Command on Mac) to select multiple pages.</p>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }

    public function field_cb_timing($args)
    {
        $value = $this->get_option($args['id'], $args['default']);
        $id_attr = 'wisecampaign-timing-' . esc_attr($args['id']);
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-timing">
            <div class="wisecampaign-field-label">
                <label for="<?php echo $id_attr; ?>"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <input type="number" id="<?php echo $id_attr; ?>" name="<?php echo esc_attr($this->option_name) . '[' . esc_attr($args['id']) . ']'; ?>" value="<?php echo esc_attr($value); ?>" class="small-text">
                <span class="unit"><?php echo esc_html($args['label']); ?></span>
            </div>
        </div>
        <?php
    }

    public function field_cb_position($args)
    {
        $value = $this->get_option('position', 'bottom-left');
        $positions = ['bottom-left' => 'Bottom Left', 'bottom-right' => 'Bottom Right', 'top-left' => 'Top Left', 'top-right' => 'Top Right'];
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-position">
            <div class="wisecampaign-field-label">
                <label for="wisecampaign-position"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <select id="wisecampaign-position" name="<?php echo esc_attr($this->option_name); ?>[position]">
                    <?php foreach ($positions as $key => $label) : ?>
                        <option value="<?php echo esc_attr($key); ?>" <?php selected($key, $value); ?>><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>
        <?php
    }

    public function field_cb_color($args)
    {
        $value = $this->get_option($args['id'], $args['default']);
        $id_attr = 'wisecampaign-color-' . esc_attr($args['id']);
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-color">
            <div class="wisecampaign-field-label">
                <label for="<?php echo $id_attr; ?>"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <input type="text" id="<?php echo $id_attr; ?>" name="<?php echo esc_attr($this->option_name) . '[' . esc_attr($args['id']) . ']'; ?>" value="<?php echo esc_attr($value); ?>" class="wp-color-picker-field" />
            </div>
        </div>
        <?php
    }

    public function field_cb_source($args)
    {
        $is_pro = $this->is_pro_active();
        $value = $this->get_option('source', 'recent_orders');
        $sources = [
            'recent_orders'   => __('Recent Orders', 'wisecampaign'),
            'selected_orders' => __('Selected Orders', 'wisecampaign'),
            'virtual_orders'  => __('Custom / Virtual Orders (Simulated)', 'wisecampaign') . (!$is_pro ? ' [PRO]' : ''),
        ];
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-source">
            <div class="wisecampaign-field-label">
                <label for="wisecampaign_order_source_select"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <select id="wisecampaign_order_source_select" name="<?php echo esc_attr($this->option_name); ?>[source]">
                    <?php foreach ($sources as $key => $label) :
                        $disabled = (!$is_pro && $key === 'virtual_orders') ? 'disabled' : '';
                    ?>
                        <option value="<?php echo esc_attr($key); ?>" <?php selected($key, $value); ?> <?php echo $disabled; ?>><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
                <p class="description"><?php esc_html_e('Choose real recent orders, select specific past orders, or generate realistic virtual orders for instant social proof.', 'wisecampaign'); ?></p>
                <?php if (!$is_pro) : ?>
                    <p class="description" style="color: #d97706; margin-top: 4px;"><span class="dashicons dashicons-lock" style="font-size: 14px; width: 14px; height: 14px; vertical-align: middle;"></span> <?php printf(esc_html__('Virtual Orders generator is a %s feature.', 'wisecampaign'), '<a href="https://wisemattic.com/wisecampaign/pricing" target="_blank">PRO</a>'); ?></p>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }

    public function field_cb_selected_orders($args)
    {
        $selected_orders = $this->get_option('selected_orders', []);
        $query = new \WC_Order_Query(['limit' => 100, 'orderby' => 'date', 'order' => 'DESC']);
        $orders = $query->get_orders();
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-selected-orders">
            <div class="wisecampaign-field-label">
                <label for="wisecampaign-selected-orders-select"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <?php if (empty($orders)) : ?>
                    <p><?php esc_html_e('No orders found.', 'wisecampaign'); ?></p>
                <?php else : ?>
                    <select id="wisecampaign-selected-orders-select" name="<?php echo esc_attr($this->option_name); ?>[selected_orders][]" multiple="multiple" style="height: 180px; width: 100%;">
                        <?php foreach ($orders as $order) :
                            $order_id = $order->get_id();
                            $order_label = '#' . $order_id . ' &ndash; ' . $order->get_billing_first_name() . ' ' . $order->get_billing_last_name();
                            $is_selected = in_array($order_id, $selected_orders);
                            ?>
                            <option value="<?php echo esc_attr($order_id); ?>" <?php selected($is_selected, true); ?>><?php echo esc_html($order_label); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <p class="description"><?php esc_html_e('Hold CTRL (or Command on Mac) to select multiple orders.', 'wisecampaign'); ?></p>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }

    public function field_cb_virtual_names($args)
    {
        $default = "Sarah M., Alex K., David R., Emily W., Michael B., Jessica T., James H., Olivia P., Daniel S., Sophia L.";
        $value = $this->get_option('virtual_names', $default);
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-virtual-names">
            <div class="wisecampaign-field-label">
                <label for="wisecampaign-virtual-names"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <textarea id="wisecampaign-virtual-names" name="<?php echo esc_attr($this->option_name); ?>[virtual_names]" rows="3" placeholder="<?php esc_attr_e('Enter buyer names separated by commas (e.g. Sarah M., Alex K., David R.)', 'wisecampaign'); ?>"><?php echo esc_textarea($value); ?></textarea>
                <p class="description"><?php esc_html_e('Enter customer names separated by commas. Notifications will cycle randomly through these names.', 'wisecampaign'); ?></p>
            </div>
        </div>
        <?php
    }

    public function field_cb_virtual_locations($args)
    {
        $default = "New York, USA\nLondon, UK\nToronto, Canada\nSydney, Australia\nBerlin, Germany\nParis, France\nLos Angeles, USA\nMadrid, Spain";
        $value = $this->get_option('virtual_locations', $default);
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-virtual-locations">
            <div class="wisecampaign-field-label">
                <label for="wisecampaign-virtual-locations"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <textarea id="wisecampaign-virtual-locations" name="<?php echo esc_attr($this->option_name); ?>[virtual_locations]" rows="4" placeholder="<?php esc_attr_e('Enter locations, one per line (e.g. New York, USA)', 'wisecampaign'); ?>"><?php echo esc_textarea($value); ?></textarea>
                <p class="description"><?php esc_html_e('Enter city/country locations, one per line or separated by commas.', 'wisecampaign'); ?></p>
            </div>
        </div>
        <?php
    }

    public function field_cb_virtual_products_mode($args)
    {
        $value = $this->get_option('virtual_products_mode', 'all_products');
        $modes = [
            'all_products'      => __('All In-Stock Products', 'wisecampaign'),
            'selected_products' => __('Specific Selected Products', 'wisecampaign'),
        ];
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-virtual-products-mode">
            <div class="wisecampaign-field-label">
                <label for="wisecampaign-virtual-products-mode"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <select id="wisecampaign-virtual-products-mode" name="<?php echo esc_attr($this->option_name); ?>[virtual_products_mode]">
                    <?php foreach ($modes as $k => $label) : ?>
                        <option value="<?php echo esc_attr($k); ?>" <?php selected($k, $value); ?>><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
                <p class="description"><?php esc_html_e('Choose whether to showcase all published products or only hand-picked products.', 'wisecampaign'); ?></p>
            </div>
        </div>
        <?php
    }

    public function field_cb_virtual_selected_products($args)
    {
        $selected_products = $this->get_option('virtual_selected_products', []);
        $products = function_exists('wc_get_products') ? wc_get_products(['limit' => 100, 'status' => 'publish', 'orderby' => 'title', 'order' => 'ASC']) : [];
        ?>
        <div class="wisecampaign-field-group wisecampaign-field-virtual-selected-products">
            <div class="wisecampaign-field-label">
                <label for="wisecampaign-virtual-products-select"><?php echo esc_html($args['label_for']); ?></label>
            </div>
            <div class="wisecampaign-field-control">
                <?php if (empty($products)) : ?>
                    <p><?php esc_html_e('No WooCommerce products found.', 'wisecampaign'); ?></p>
                <?php else : ?>
                    <select id="wisecampaign-virtual-products-select" name="<?php echo esc_attr($this->option_name); ?>[virtual_selected_products][]" multiple="multiple" style="height: 180px; width: 100%;">
                        <?php foreach ($products as $p) :
                            $pid = $p->get_id();
                            $p_label = '#' . $pid . ' – ' . $p->get_name() . ' (' . wc_price($p->get_price()) . ')';
                            $is_sel = in_array($pid, (array)$selected_products);
                            ?>
                            <option value="<?php echo esc_attr($pid); ?>" <?php selected($is_sel, true); ?>><?php echo esc_html(wp_strip_all_tags($p_label)); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <p class="description"><?php esc_html_e('Hold CTRL (or Command on Mac) to select multiple products.', 'wisecampaign'); ?></p>
                <?php endif; ?>
            </div>
        </div>
        <?php
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
            'template' => 'key',
            'position' => 'key',
            'background_color' => 'color',
            'border_color' => 'color',
            'border_width' => 'int',
            'border_radius' => 'int',
            'image_radius' => 'int',
            'font_family' => 'text',
            'hide_branding' => 'bool',
            'random_show' => 'bool',
            'source' => 'key',
            'selected_orders' => 'array_int',
            'virtual_names' => 'textarea',
            'virtual_locations' => 'textarea',
            'virtual_products_mode' => 'key',
            'virtual_selected_products' => 'array_int',
            'visibility' => 'key',
            'specific_pages' => 'array_int',
            'loop' => 'bool',
            'display_time' => 'int',
            'delay_time' => 'int'
        ];

        $is_pro = $this->is_pro_active();

        foreach ($settings_manifest as $key => $type) {
            $value = isset($new_options[$key]) ? $new_options[$key] : null;
            switch ($type) {
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
                case 'bool':
                    $all_settings[$key] = ($value === '1' || $value === 1 || $value === true) ? '1' : '0';
                    break;
                case 'array_int':
                    $all_settings[$key] = is_array($value) ? array_map('intval', $value) : [];
                    break;
                case 'textarea':
                    if ($value !== null) {
                        $all_settings[$key] = sanitize_textarea_field($value);
                    }
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

        // PRO feature validation
        if (!$is_pro) {
            if (isset($all_settings['source']) && $all_settings['source'] === 'virtual_orders') {
                $all_settings['source'] = 'recent_orders';
            }
            $all_settings['hide_branding'] = '0';

            $pro_templates = ['template_3', 'template_4', 'template_5', 'template_6'];
            if (in_array($all_settings['template'] ?? '', $pro_templates, true)) {
                $all_settings['template'] = 'template_1';
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
        $settings = get_option($this->option_name, []);
        $enabled = isset($settings['enabled']) ? $settings['enabled'] : '1';
        if ('1' !== (string)$enabled) {
            return;
        }

        $visibility = $settings['visibility'] ?? 'all_pages';
        if ($visibility === 'specific_pages') {
            $specific_pages = $settings['specific_pages'] ?? [];
            if (empty($specific_pages) || !is_page($specific_pages)) {
                return;
            }
        }

        $notifications = $this->get_notification_data();
        if (empty($notifications)) {
            return;
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
            'notifications' => $notifications
        ]);
    }

    public function render_frontend_container()
    {
        $settings = get_option($this->option_name, []);
        $enabled = isset($settings['enabled']) ? $settings['enabled'] : '1';
        if ('1' !== (string)$enabled) {
            return;
        }
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
            'product_url' => '#',
            'buyer' => 'Sarah M.',
            'time' => '5 minutes ago',
            'location' => 'New York, USA'
        ];
    }

    private function get_notification_data()
    {
        $settings = get_option($this->option_name, []);
        $source = $settings['source'] ?? 'recent_orders';
        $items = [];

        // Virtual (Simulated) Orders Generator (PRO)
        if ($source === 'virtual_orders') {
            if (!$this->is_pro_active()) {
                return [];
            }

            $defaults = $this->get_default_settings();
            $raw_names = !empty($settings['virtual_names']) ? $settings['virtual_names'] : $defaults['virtual_names'];
            $raw_locations = !empty($settings['virtual_locations']) ? $settings['virtual_locations'] : $defaults['virtual_locations'];
            $products_mode = $settings['virtual_products_mode'] ?? 'all_products';
            $selected_pids = $settings['virtual_selected_products'] ?? [];

            $names = array_values(array_filter(array_map('trim', preg_split('/[\r\n,]+/', $raw_names))));
            if (empty($names)) {
                $names = ['Sarah M.', 'Alex K.', 'David R.', 'Emily W.', 'Michael B.'];
            }

            $locations = array_values(array_filter(array_map('trim', preg_split('/[\r\n]+/', $raw_locations))));
            if (empty($locations)) {
                $locations = ['New York, USA', 'London, UK', 'Toronto, Canada', 'Sydney, Australia'];
            }

            $products = [];
            if ($products_mode === 'selected_products' && !empty($selected_pids)) {
                if (function_exists('wc_get_products')) {
                    $products = wc_get_products([
                        'include' => $selected_pids,
                        'limit'   => count($selected_pids),
                    ]);
                }
            } else {
                if (function_exists('wc_get_products')) {
                    $products = wc_get_products([
                        'limit'   => 15,
                        'status'  => 'publish',
                        'orderby' => 'rand',
                    ]);
                }
                if (empty($products) && function_exists('wc_get_products')) {
                    $products = wc_get_products([
                        'limit' => 15,
                    ]);
                }
            }

            $time_options = [
                __('3 minutes ago', 'wisecampaign'),
                __('7 minutes ago', 'wisecampaign'),
                __('15 minutes ago', 'wisecampaign'),
                __('28 minutes ago', 'wisecampaign'),
                __('45 minutes ago', 'wisecampaign'),
                __('1 hour ago', 'wisecampaign'),
                __('2 hours ago', 'wisecampaign'),
                __('5 hours ago', 'wisecampaign'),
                __('8 hours ago', 'wisecampaign'),
                __('14 hours ago', 'wisecampaign'),
                __('19 hours ago', 'wisecampaign'),
                __('22 hours ago', 'wisecampaign'),
                __('1 day ago', 'wisecampaign'),
                __('2 days ago', 'wisecampaign'),
                __('3 days ago', 'wisecampaign'),
            ];

            // Shuffle time options for realistic randomness
            shuffle($time_options);

            $name_count = count($names);
            $loc_count = count($locations);
            $time_count = count($time_options);
            $total_items = max($name_count, $loc_count, 12);

            if (!empty($products)) {
                $prod_count = count($products);
                for ($i = 0; $i < $total_items; $i++) {
                    $product = $products[$i % $prod_count];
                    if (!$product) continue;

                    $image_url = function_exists('wp_get_attachment_url') ? wp_get_attachment_url($product->get_image_id()) : '';
                    if (empty($image_url) && function_exists('wc_placeholder_img_src')) {
                        $image_url = wc_placeholder_img_src();
                    }
                    if (empty($image_url)) {
                        $image_url = WISECAMPAIGN_DIR_URL . 'images/fe/wc_logo.png';
                    }

                    $items[] = [
                        'product_name'  => $product->get_name(),
                        'product_image' => $image_url,
                        'product_url'   => get_permalink($product->get_id()),
                        'buyer'         => $names[$i % $name_count],
                        'time'          => $time_options[$i % $time_count],
                        'location'      => $locations[$i % $loc_count],
                        'is_virtual'    => true,
                    ];
                }
            } else {
                // Fallback items if store has no WooCommerce products yet
                $placeholder = function_exists('wc_placeholder_img_src') ? wc_placeholder_img_src() : WISECAMPAIGN_DIR_URL . 'images/fe/wc_logo.png';
                $demo_items = [
                    'Premium Wireless Headphones',
                    'Smart Fitness Watch',
                    'Ultra-Comfort Sneakers',
                    'Minimalist Leather Wallet',
                    'Stainless Steel Water Bottle'
                ];
                $demo_count = count($demo_items);
                for ($i = 0; $i < $total_items; $i++) {
                    $items[] = [
                        'product_name'  => $demo_items[$i % $demo_count],
                        'product_image' => $placeholder,
                        'product_url'   => '#',
                        'buyer'         => $names[$i % $name_count],
                        'time'          => $time_options[$i % $time_count],
                        'location'      => $locations[$i % $loc_count],
                        'is_virtual'    => true,
                    ];
                }
            }

            return $items;
        }


        if (!class_exists('WooCommerce') || !function_exists('wc_placeholder_img_src')) {
            return [];
        }

        $order_args = [];
        if ($source === 'selected_orders') {
            $selected_ids = $settings['selected_orders'] ?? [];
            if (empty($selected_ids)) {
                return [];
            }
            $order_args = [
                'include' => $selected_ids,
                'limit'   => count($selected_ids),
                'status'  => 'completed',
            ];
        } else {
            $order_args = [
                'limit'   => 10,
                'orderby' => 'date',
                'order'   => 'DESC',
                'status'  => 'completed',
            ];
        }

        $query = new \WC_Order_Query($order_args);
        $orders = $query->get_orders();

        foreach ($orders as $order) {
            foreach ($order->get_items() as $item) {
                $product = $item->get_product();
                if (!$product) {
                    continue;
                }
                $image_url = wp_get_attachment_url($product->get_image_id()) ?: wc_placeholder_img_src();
                $items[] = [
                    'product_name'  => $item->get_name(),
                    'product_image' => $image_url,
                    'product_url'   => get_permalink($product->get_id()),
                    'buyer'         => $order->get_billing_first_name(),
                    'time'          => human_time_diff(strtotime($order->get_date_created()->date('Y-m-d H:i:s')), current_time('timestamp')) . ' ago',
                    'location'      => $order->get_billing_city() . ', ' . (WC()->countries->countries[$order->get_billing_country()] ?? $order->get_billing_country()),
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
            'border_color' => '#FFFFFF',
            'border_width' => 0,
            'border_radius' => 10,
            'image_radius' => 10,
            'font_family' => 'Poppins',
            'hide_branding' => '0',
            'random_show' => '0',

            'source' => 'recent_orders',
            'selected_orders' => [],
            'virtual_names' => "Sarah M., Alex K., David R., Emily W., Michael B., Jessica T., James H., Olivia P., Daniel S., Sophia L.",
            'virtual_locations' => "New York, USA\nLondon, UK\nToronto, Canada\nSydney, Australia\nBerlin, Germany\nParis, France\nLos Angeles, USA\nMadrid, Spain",
            'virtual_products_mode' => 'all_products',
            'virtual_selected_products' => [],
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