<?php

namespace WISECAMPAIGN\Features;

use WISECAMPAIGN\Traits\SingletonTrait;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * WiseVideoCommerce Feature
 *
 * Handles WooCommerce integration for product videos and galleries (PRO).
 * Settings are edited in the React module modules/wise-video-commerce.
 */
class WiseVideoCommerce {
    use SingletonTrait;

    private $option_name = 'wisecampaign_video_commerce_settings';
    private $nonce_action = 'wisecampaign_save_product_videos';

    public function __construct() {
        add_action('rest_api_init', [$this, 'register_api_routes']);

        // Always register save hook to prevent data loss if setting is toggled
        add_action('save_post_product', [$this, 'save_product_video_meta']);

        if ($this->is_active()) {
            add_action('woocommerce_before_single_product', [$this, 'init_product_hooks'], 1);
            add_action('add_meta_boxes', [$this, 'add_product_video_metaboxes']);
            add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
            add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
        }
    }

    private function is_license_active() {
        return class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')
            && \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
    }

    private function is_active() {
        return $this->get_settings()['status'] === 'active';
    }

    /**
     * Default value of every setting. Keep in sync with DEFAULTS in modules/wise-video-commerce/src/App.jsx.
     */
    private function get_defaults() {
        return [
            'status'                 => 'inactive',
            'galleryEnabled'         => true,
            'reelsEnabled'           => true,
            'reelsAutoplayEnabled'   => true,
            'reelsTitle'             => 'Tagged with Reels',
            'showGalleryTitle'       => false,
            'galleryTitle'           => 'Product Video Showcase',
            'buyNowText'             => 'Buy Now',
            'mobileCartOverlay'      => true,
            'mobileCartBgColor'      => '#1E293B',
            'mobileCartBgOpacity'    => 70,
            'mobileCartTextColor'    => '#ffffff',
            'mobileCartBtnColor'     => '#ffffff',
            'mobileCartBtnTextColor' => '#1E293B',
            'mobileCartBtnOpacity'   => 100,
            'layoutStyle'            => 'Carousel (Horizontal)',
            'cornerRadius'           => 8,
            'titleSize'              => '16px',
            'titleColor'             => '#000000',
        ];
    }

    private function get_layouts() {
        return ['Carousel (Horizontal)', 'Grid (2 Columns)', 'Stacked (Vertical)'];
    }

    /**
     * Saved settings over the defaults. Without a Pro license the feature always reads as inactive.
     */
    public function get_settings() {
        $saved = get_option($this->option_name, []);
        $settings = array_merge($this->get_defaults(), is_array($saved) ? $saved : []);

        if (!$this->is_license_active()) {
            $settings['status'] = 'inactive';
        }

        return $settings;
    }

    /**
     * Register REST API routes
     */
    public function register_api_routes() {
        $permission = function () {
            return current_user_can('manage_options');
        };

        register_rest_route('wisecampaign/v1', '/video-commerce/settings', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_settings_callback'],
                'permission_callback' => $permission,
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'update_settings_callback'],
                'permission_callback' => $permission,
            ],
        ]);
    }

    public function get_settings_callback() {
        $response = new \WP_REST_Response([
            'settings'      => $this->get_settings(),
            'defaults'      => $this->get_defaults(),
            'licenseActive' => $this->is_license_active(),
            'productsUrl'   => admin_url('edit.php?post_type=product'),
        ], 200);
        // Some hosts cache REST responses; settings and license status must always be fresh.
        $response->header('Cache-Control', 'no-store');
        return $response;
    }

    /**
     * Saves the fields that were sent (the on/off switch sends only "status"), sanitized against the defaults.
     */
    public function update_settings_callback($request) {
        $params = $request->get_json_params();
        $params = is_array($params) ? $params : [];

        if (($params['status'] ?? '') === 'active' && !$this->is_license_active()) {
            return new \WP_REST_Response([
                'message' => 'Cannot activate widget: An active Pro license is required.'
            ], 403);
        }

        $saved = get_option($this->option_name, []);
        $settings = array_merge($this->get_defaults(), is_array($saved) ? $saved : []);
        foreach ($this->get_defaults() as $key => $default) {
            if (array_key_exists($key, $params)) {
                $settings[$key] = $this->sanitize_setting($key, $params[$key], $default);
            }
        }
        // Keys the editor no longer uses
        unset($settings['activeFeature']);

        update_option($this->option_name, $settings);

        return new \WP_REST_Response([
            'message'  => 'Settings updated successfully',
            'settings' => $this->get_settings(),
        ], 200);
    }

    private function sanitize_setting($key, $value, $default) {
        if (is_bool($default)) {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }
        if (!is_scalar($value)) {
            return $default;
        }
        switch ($key) {
            case 'status':
                return $value === 'active' ? 'active' : 'inactive';
            case 'mobileCartBgOpacity':
            case 'mobileCartBtnOpacity':
                return max(0, min(100, round((float) $value)));
            case 'cornerRadius':
                return max(0, min(40, (int) $value));
            case 'titleSize':
                return max(12, min(40, (int) $value)) . 'px';
            case 'layoutStyle':
                return in_array($value, $this->get_layouts(), true) ? $value : $default;
            case 'mobileCartBgColor':
            case 'mobileCartTextColor':
            case 'mobileCartBtnColor':
            case 'mobileCartBtnTextColor':
            case 'titleColor':
                return sanitize_hex_color($value) ?: $default;
            default:
                $text = sanitize_text_field($value);
                return $text !== '' ? $text : $default;
        }
    }

    /**
     * =================================================================
     * STOREFRONT
     * =================================================================
     */

    /**
     * Attachment ids stored as "1,2,3", keeping only real attachments.
     */
    private function get_meta_ids($product_id, $key) {
        $ids = array_filter(array_map('absint', explode(',', (string) get_post_meta($product_id, $key, true))));
        return array_values(array_filter($ids, function ($id) {
            return (bool) wp_get_attachment_url($id);
        }));
    }

    public function init_product_hooks() {
        global $product;
        if (!is_product() || !$product) {
            return;
        }

        $settings = $this->get_settings();
        $product_id = $product->get_id();

        // 1. Gallery: replaces the product images with a gallery of videos and the product images
        if ($settings['galleryEnabled']) {
            $main = absint(get_post_meta($product_id, '_wisecampaign_product_video_id', true));
            if (($main && wp_get_attachment_url($main)) || $this->get_meta_ids($product_id, '_wisecampaign_product_video_gallery_ids')) {
                remove_action('woocommerce_before_single_product_summary', 'woocommerce_show_product_images', 20);
                add_action('woocommerce_before_single_product_summary', [$this, 'render_product_videos'], 20);
            }
        }

        // 2. Reels under the Add to Cart form
        if ($settings['reelsEnabled']) {
            add_action('woocommerce_after_add_to_cart_form', [$this, 'render_product_reels'], 20);
        }
    }

    /**
     * Enqueue assets for frontend
     */
    public function enqueue_frontend_assets() {
        if (!is_product()) {
            return;
        }

        $settings = $this->get_settings();
        wp_enqueue_style('wisecampaign-video-commerce-frontend', WISECAMPAIGN_DIR_URL . 'assets/css/video-commerce-frontend.css', [], '2.0.0');
        wp_add_inline_style('wisecampaign-video-commerce-frontend', sprintf(
            ':root{--wcvc-radius:%dpx;--wcvc-card-bg:%s;--wcvc-card-text:%s;--wcvc-btn-bg:%s;--wcvc-btn-text:%s;--wcvc-title-size:%s;--wcvc-title-color:%s;}',
            $settings['cornerRadius'],
            $this->rgba($settings['mobileCartBgColor'], $settings['mobileCartBgOpacity'], '#1E293B'),
            sanitize_hex_color($settings['mobileCartTextColor']) ?: '#ffffff',
            $this->rgba($settings['mobileCartBtnColor'], $settings['mobileCartBtnOpacity'], '#ffffff'),
            sanitize_hex_color($settings['mobileCartBtnTextColor']) ?: '#1E293B',
            esc_attr($settings['titleSize']),
            sanitize_hex_color($settings['titleColor']) ?: '#000000'
        ));
        wp_enqueue_script('wisecampaign-video-commerce-frontend', WISECAMPAIGN_DIR_URL . 'assets/js/video-commerce-frontend.js', [], '2.0.0', true);
    }

    /**
     * Color plus opacity (0-100) as rgba(). Accepts hex and the rgba() values older versions saved.
     */
    private function rgba($color, $opacity, $fallback) {
        $color = trim((string) $color);
        if (preg_match('/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/', $color, $m)) {
            $rgb = [(int) $m[1], (int) $m[2], (int) $m[3]];
        } else {
            $hex = ltrim(sanitize_hex_color($color) ?: $fallback, '#');
            if (strlen($hex) === 3) {
                $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
            }
            $rgb = array_map('hexdec', str_split($hex, 2));
        }
        return sprintf('rgba(%d,%d,%d,%s)', $rgb[0], $rgb[1], $rgb[2], round(max(0, min(100, (float) $opacity)) / 100, 2));
    }

    private function icon($name) {
        $icons = [
            'play'  => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z" fill="currentColor"/></svg>',
            'close' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
            'sound' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor"/><path class="wcvc-wave" d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><path class="wcvc-mute" d="m22 9-6 6m0-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            'prev'  => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
            'next'  => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
        ];
        return $icons[$name] ?? '';
    }

    /**
     * Product card shown on the main video (phones) and in the reels lightbox.
     */
    private function render_product_card($product, $class) {
        $settings = $this->get_settings();
        $image_url = get_the_post_thumbnail_url($product->get_id(), 'thumbnail');
        // Simple products are added straight away; others scroll to the form to pick options
        $action = ($product->is_type('simple') && $product->is_purchasable() && $product->is_in_stock()) ? 'add' : 'scroll';

        $html = '<div class="wcvc-card ' . esc_attr($class) . '">';
        if ($image_url) {
            $html .= '<img class="wcvc-card__thumb" src="' . esc_url($image_url) . '" alt="">';
        }
        $html .= '<div class="wcvc-card__details"><p class="wcvc-card__name">' . esc_html($product->get_name()) . '</p>'
            . '<div class="wcvc-card__price">' . wp_kses_post($product->get_price_html()) . '</div></div>'
            . '<button type="button" class="wcvc-card__btn" data-wcvc-buy="' . esc_attr($action) . '">' . esc_html($settings['buyNowText']) . '</button>'
            . '</div>';
        return $html;
    }

    /**
     * Render product videos on frontend: the main video first, then the product images and the gallery videos.
     */
    public function render_product_videos() {
        global $product;
        if (!$product) {
            return;
        }

        $settings = $this->get_settings();
        $product_id = $product->get_id();
        $items = [];

        $main = absint(get_post_meta($product_id, '_wisecampaign_product_video_id', true));
        if ($main && ($url = wp_get_attachment_url($main))) {
            $items[] = ['type' => 'video', 'url' => $url];
        }
        $image_ids = array_filter(array_merge([(int) $product->get_image_id()], array_map('intval', $product->get_gallery_image_ids())));
        foreach (array_unique($image_ids) as $image_id) {
            $full = wp_get_attachment_image_url($image_id, 'woocommerce_single');
            if ($full) {
                $items[] = [
                    'type'  => 'image',
                    'url'   => $full,
                    'thumb' => wp_get_attachment_image_url($image_id, 'woocommerce_gallery_thumbnail') ?: $full,
                    'alt'   => get_post_meta($image_id, '_wp_attachment_image_alt', true) ?: $product->get_name(),
                ];
            }
        }
        foreach ($this->get_meta_ids($product_id, '_wisecampaign_product_video_gallery_ids') as $video_id) {
            $items[] = ['type' => 'video', 'url' => wp_get_attachment_url($video_id)];
        }
        if (empty($items)) {
            return;
        }

        $layouts = ['Grid (2 Columns)' => 'grid', 'Stacked (Vertical)' => 'stacked'];
        $layout = $layouts[$settings['layoutStyle']] ?? 'carousel';
        $first = $items[0];

        echo '<div class="woocommerce-product-gallery images wcvc-gallery">';

        if ($settings['showGalleryTitle']) {
            echo '<h2 class="wcvc-gallery__title">' . esc_html($settings['galleryTitle']) . '</h2>';
        }

        echo '<div class="wcvc-stage' . ($first['type'] === 'video' ? ' is-video' : '') . '">';
        echo '<video class="wcvc-stage__video" controls playsinline preload="metadata"' . ($first['type'] === 'video' ? ' src="' . esc_url($first['url']) . '"' : ' hidden') . '></video>';
        echo '<img class="wcvc-stage__image" alt="' . esc_attr($first['alt'] ?? $product->get_name()) . '"' . ($first['type'] === 'image' ? ' src="' . esc_url($first['url']) . '"' : ' hidden') . '>';
        if ($settings['mobileCartOverlay']) {
            echo $this->render_product_card($product, 'wcvc-card--stage');
        }
        echo '</div>';

        if (count($items) > 1) {
            echo '<div class="wcvc-thumbs wcvc-thumbs--' . esc_attr($layout) . '" role="list">';
            foreach ($items as $index => $item) {
                $label = $item['type'] === 'video' ? __('Play video', 'wisecampaign') : __('Show image', 'wisecampaign');
                echo '<button type="button" role="listitem" class="wcvc-thumb' . ($index === 0 ? ' is-active' : '') . '" data-type="' . esc_attr($item['type']) . '" data-src="' . esc_url($item['url']) . '" aria-label="' . esc_attr($label) . '">';
                if ($item['type'] === 'video') {
                    // #t= shows a frame from the video instead of a black box
                    echo '<video src="' . esc_url($item['url']) . '#t=0.5" muted playsinline preload="metadata"></video>';
                    echo '<span class="wcvc-thumb__play">' . $this->icon('play') . '</span>';
                } else {
                    echo '<img src="' . esc_url($item['thumb']) . '" alt="' . esc_attr($item['alt']) . '" loading="lazy">';
                }
                echo '</button>';
            }
            echo '</div>';
        }

        echo '</div>';
    }

    /**
     * Render product reels under Add to Cart, with a lightbox to watch them.
     */
    public function render_product_reels() {
        global $product;
        if (!$product) {
            return;
        }

        $reels = $this->get_meta_ids($product->get_id(), '_wisecampaign_product_reels_ids');
        if (empty($reels)) {
            return;
        }

        $settings = $this->get_settings();
        $autoplay = $settings['reelsAutoplayEnabled'];

        echo '<div class="wcvc-reels' . ($autoplay ? ' is-autoplay' : '') . '">';
        echo '<h3 class="wcvc-reels__title">' . esc_html($settings['reelsTitle']) . '</h3>';
        echo '<div class="wcvc-reels__list">';
        foreach ($reels as $index => $id) {
            $url = wp_get_attachment_url($id);
            echo '<button type="button" class="wcvc-reel" data-index="' . esc_attr($index) . '" data-src="' . esc_url($url) . '" aria-label="' . esc_attr__('Watch video', 'wisecampaign') . '">';
            // Autoplaying reels start when scrolled into view (video-commerce-frontend.js)
            echo '<video src="' . esc_url($url) . '#t=0.5" muted loop playsinline preload="metadata"></video>';
            echo '<span class="wcvc-reel__play">' . $this->icon('play') . '</span>';
            echo '</button>';
        }
        echo '</div></div>';

        echo '<div class="wcvc-lightbox" role="dialog" aria-modal="true" aria-label="' . esc_attr($settings['reelsTitle']) . '" hidden>';
        echo '<div class="wcvc-lightbox__inner">';
        echo '<video class="wcvc-lightbox__video" playsinline loop></video>';
        echo '<button type="button" class="wcvc-lightbox__btn wcvc-lightbox__close" aria-label="' . esc_attr__('Close', 'wisecampaign') . '">' . $this->icon('close') . '</button>';
        echo '<button type="button" class="wcvc-lightbox__btn wcvc-lightbox__sound" aria-label="' . esc_attr__('Sound on or off', 'wisecampaign') . '">' . $this->icon('sound') . '</button>';
        if (count($reels) > 1) {
            echo '<button type="button" class="wcvc-lightbox__btn wcvc-lightbox__prev" aria-label="' . esc_attr__('Previous video', 'wisecampaign') . '">' . $this->icon('prev') . '</button>';
            echo '<button type="button" class="wcvc-lightbox__btn wcvc-lightbox__next" aria-label="' . esc_attr__('Next video', 'wisecampaign') . '">' . $this->icon('next') . '</button>';
        }
        echo $this->render_product_card($product, 'wcvc-card--lightbox');
        echo '</div></div>';
    }

    /**
     * =================================================================
     * PRODUCT EDIT SCREEN
     * =================================================================
     */

    /**
     * Enqueue assets for product edit page
     */
    public function enqueue_admin_assets($hook) {
        if (!in_array($hook, ['post.php', 'post-new.php'], true)) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || $screen->post_type !== 'product') {
            return;
        }

        wp_enqueue_media();
        wp_enqueue_style('wisecampaign-video-commerce-admin', WISECAMPAIGN_DIR_URL . 'assets/css/video-commerce-admin.css', [], '2.0.0');
        wp_enqueue_script('wisecampaign-video-commerce-admin', WISECAMPAIGN_DIR_URL . 'assets/js/video-commerce-admin.js', ['jquery', 'jquery-ui-sortable'], '2.0.0', true);
    }

    /**
     * Add metaboxes to WooCommerce product page
     */
    public function add_product_video_metaboxes() {
        add_meta_box(
            'wisecampaign_product_video',
            __('Product video (WiseCampaign)', 'wisecampaign'),
            [$this, 'render_product_video_metabox'],
            'product',
            'side',
            'high'
        );

        add_meta_box(
            'wisecampaign_product_video_gallery',
            __('Product video gallery', 'wisecampaign'),
            [$this, 'render_product_video_gallery_metabox'],
            'product',
            'side',
            'low'
        );

        add_meta_box(
            'wisecampaign_product_reels',
            __('Product Reels (UGC)', 'wisecampaign'),
            [$this, 'render_product_reels_metabox'],
            'product',
            'side',
            'low'
        );
    }

    /**
     * Render main product video metabox
     */
    public function render_product_video_metabox($post) {
        $video_id = absint(get_post_meta($post->ID, '_wisecampaign_product_video_id', true));
        $video_url = $video_id ? wp_get_attachment_url($video_id) : '';
        wp_nonce_field($this->nonce_action, 'wisecampaign_product_videos_nonce');
        ?>
        <div id="wisecampaign-product-video-container" class="wcvc-box">
            <div id="wisecampaign-video-preview" <?php echo $video_url ? '' : 'hidden'; ?>>
                <video src="<?php echo esc_url($video_url); ?>" controls preload="metadata"></video>
            </div>
            <button type="button" id="wisecampaign-video-placeholder" class="wcvc-box__placeholder" <?php echo $video_url ? 'hidden' : ''; ?>>
                <span class="dashicons dashicons-video-alt3"></span>
                <span><?php esc_html_e('Choose a video', 'wisecampaign'); ?></span>
            </button>
            <p class="description"><?php esc_html_e('Shown first in the product gallery, before the product images.', 'wisecampaign'); ?></p>
            <input type="hidden" name="wisecampaign_product_video_id" id="wisecampaign-product-video-id" value="<?php echo esc_attr($video_url ? $video_id : ''); ?>">
            <p class="wcvc-box__actions">
                <button type="button" id="wisecampaign-set-product-video" class="button"><?php echo $video_url ? esc_html__('Update product video', 'wisecampaign') : esc_html__('Set product video', 'wisecampaign'); ?></button>
                <button type="button" id="wisecampaign-remove-product-video" class="button-link button-link-delete" <?php echo $video_url ? '' : 'hidden'; ?>><?php esc_html_e('Remove product video', 'wisecampaign'); ?></button>
            </p>
        </div>
        <?php
    }

    private function render_video_list($list_id, $input_name, $input_id, $ids, $remove_class, $add_id, $add_label, $help) {
        ?>
        <ul id="<?php echo esc_attr($list_id); ?>" class="wcvc-video-list">
            <?php foreach ($ids as $id) : ?>
                <li data-id="<?php echo esc_attr($id); ?>">
                    <video src="<?php echo esc_url(wp_get_attachment_url($id)); ?>#t=0.5" muted preload="metadata"></video>
                    <button type="button" class="<?php echo esc_attr($remove_class); ?>" aria-label="<?php esc_attr_e('Remove video', 'wisecampaign'); ?>"><span class="dashicons dashicons-no-alt"></span></button>
                </li>
            <?php endforeach; ?>
        </ul>
        <input type="hidden" name="<?php echo esc_attr($input_name); ?>" id="<?php echo esc_attr($input_id); ?>" value="<?php echo esc_attr(implode(',', $ids)); ?>">
        <button type="button" id="<?php echo esc_attr($add_id); ?>" class="button wcvc-add-videos"><span class="dashicons dashicons-plus-alt2"></span> <?php echo esc_html($add_label); ?></button>
        <p class="description"><?php echo esc_html($help); ?></p>
        <?php
    }

    /**
     * Render video gallery metabox
     */
    public function render_product_video_gallery_metabox($post) {
        $this->render_video_list(
            'wisecampaign-video-gallery-list',
            'wisecampaign_product_video_gallery_ids',
            'wisecampaign-product-video-gallery-ids',
            $this->get_meta_ids($post->ID, '_wisecampaign_product_video_gallery_ids'),
            'remove-gallery-video',
            'wisecampaign-add-video-gallery',
            __('Add gallery videos', 'wisecampaign'),
            __('Extra videos shown after the product images. Drag to reorder.', 'wisecampaign')
        );
    }

    /**
     * Render product reels metabox
     */
    public function render_product_reels_metabox($post) {
        $this->render_video_list(
            'wisecampaign-reels-list',
            'wisecampaign_product_reels_ids',
            'wisecampaign-product-reels-ids',
            $this->get_meta_ids($post->ID, '_wisecampaign_product_reels_ids'),
            'remove-reel-video',
            'wisecampaign-add-reels',
            __('Add reels', 'wisecampaign'),
            __('Vertical customer videos shown under Add to Cart. Drag to reorder.', 'wisecampaign')
        );
    }

    /**
     * Save metabox data
     */
    public function save_product_video_meta($post_id) {
        if (!isset($_POST['wisecampaign_product_videos_nonce'])
            || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['wisecampaign_product_videos_nonce'])), $this->nonce_action)
            || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
            || !current_user_can('edit_post', $post_id)) {
            return;
        }

        $ids = function ($field) {
            $raw = isset($_POST[$field]) ? sanitize_text_field(wp_unslash($_POST[$field])) : '';
            return implode(',', array_filter(array_map('absint', explode(',', $raw))));
        };

        update_post_meta($post_id, '_wisecampaign_product_video_id', $ids('wisecampaign_product_video_id'));
        update_post_meta($post_id, '_wisecampaign_product_video_gallery_ids', $ids('wisecampaign_product_video_gallery_ids'));
        update_post_meta($post_id, '_wisecampaign_product_reels_ids', $ids('wisecampaign_product_reels_ids'));
    }
}
