<?php

namespace WISECAMPAIGN\Features;

use WISECAMPAIGN\Traits\SingletonTrait;

/**
 * WiseVideoCommerce Feature
 * 
 * Handles WooCommerce integration for product videos and galleries.
 */
class WiseVideoCommerce {
    use SingletonTrait;

    private $option_name = 'wisecampaign_video_commerce_settings';

    public function __construct() {
        add_action('rest_api_init', [$this, 'register_api_routes']);
        
        // Always register save hook to prevent data loss if setting is toggled
        add_action('save_post_product', [$this, 'save_product_video_meta']);

        $settings = $this->get_settings();
        
        $is_license_active = false;
        if (class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')) {
            $is_license_active = \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
        }
        
        $is_active = isset($settings['status']) && $settings['status'] === 'active' && $is_license_active;

        if ($is_active) {
            add_action('woocommerce_before_single_product', [$this, 'init_product_hooks'], 1);
            add_action('add_meta_boxes', [$this, 'add_product_video_metaboxes']);
            add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
            add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
        }
    }

    public function init_product_hooks() {
        global $product;
        if (!is_product() || !$product) {
            return;
        }

        $settings = $this->get_settings();
        $product_id = $product->get_id();

        // 1. Gallery Logic
        $gallery_enabled = isset($settings['galleryEnabled']) && $settings['galleryEnabled'];
        if ($gallery_enabled) {
            $video_id = get_post_meta($product_id, '_wisecampaign_product_video_id', true);
            $gallery_ids = get_post_meta($product_id, '_wisecampaign_product_video_gallery_ids', true);
            
            $has_video = (!empty($video_id) && is_numeric($video_id) && intval($video_id) > 0);
            
            $has_gallery = false;
            if (!empty($gallery_ids)) {
                $ids = array_filter(explode(',', $gallery_ids));
                foreach ($ids as $id) {
                    $id = trim($id);
                    if (!empty($id) && is_numeric($id) && intval($id) > 0) {
                        $has_gallery = true;
                        break;
                    }
                }
            }
            
            if ($has_video || $has_gallery) {
                remove_action('woocommerce_before_single_product_summary', 'woocommerce_show_product_images', 20);
                add_action('woocommerce_before_single_product_summary', [$this, 'render_product_videos'], 20);
            }
        }
        
        // 2. Reels Logic
        $reels_enabled = isset($settings['reelsEnabled']) && $settings['reelsEnabled'];
        if ($reels_enabled) {
            add_action('woocommerce_after_add_to_cart_form', [$this, 'render_product_reels'], 20);
        }
    }


    /**
     * Get settings from options
     */
    public function get_settings() {
        $settings = get_option($this->option_name, [
            'status' => 'inactive',
            'activeFeature' => 'gallery',
            'galleryEnabled' => false,
            'reelsEnabled' => false,
            'reelsAutoplayEnabled' => true,
            'reelsTitle' => 'Tagged with Reels',
            'mobileCartOverlay' => true,
            'mobileCartBgColor' => 'rgba(30, 41, 59, 0.7)',
            'mobileCartBgOpacity' => 70,
            'mobileCartTextColor' => '#ffffff',
            'mobileCartBtnColor' => '#ffffff',
            'mobileCartBtnTextColor' => '#1E293B',
            'mobileCartBtnOpacity' => 100,
            'layoutStyle' => 'Carousel (Horizontal)',
            'cornerRadius' => 8,
            'titleSize' => '16px',
            'titleColor' => '#000000'
        ]);

        $is_license_active = false;
        if (class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')) {
            $is_license_active = \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
        }

        if (!$is_license_active) {
            if (isset($settings['status']) && $settings['status'] === 'active') {
                $settings['status'] = 'inactive';
                update_option($this->option_name, $settings);
            } else {
                $settings['status'] = 'inactive';
            }
        }

        return $settings;
    }

    /**
     * Register REST API routes
     */
    public function register_api_routes() {
        register_rest_route('wisecampaign/v1', '/video-commerce/settings', [
            'methods' => 'GET',
            'callback' => [$this, 'get_settings_callback'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('wisecampaign/v1', '/video-commerce/settings', [
            'methods' => 'POST',
            'callback' => [$this, 'update_settings_callback'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ]);
    }

    public function get_settings_callback() {
        return new \WP_REST_Response($this->get_settings(), 200);
    }

    public function update_settings_callback($request) {
        $params = $request->get_json_params();
        
        $is_license_active = false;
        if (class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')) {
            $is_license_active = \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
        }

        if (isset($params['status']) && $params['status'] === 'active' && !$is_license_active) {
            return new \WP_REST_Response([
                'message' => 'Cannot activate widget: An active Pro license is required.'
            ], 403);
        }

        $settings = $this->get_settings();
        
        // Merge new settings with existing ones
        foreach ($params as $key => $value) {
            $settings[$key] = $value;
        }

        $updated = update_option($this->option_name, $settings);
        
        // Log for debugging
        error_log('WiseVideo REST Update: ' . print_r($settings, true));
        error_log('Update success: ' . ($updated ? 'Yes' : 'No'));

        return new \WP_REST_Response([
            'message' => 'Settings updated successfully',
            'settings' => $settings
        ], 200);
    }

    /**
     * Enqueue assets for product edit page
     */
    public function enqueue_admin_assets($hook) {
        if (!in_array($hook, ['post.php', 'post-new.php'])) {
            return;
        }

        $screen = get_current_screen();
        if ($screen->post_type !== 'product') {
            return;
        }

        wp_enqueue_media();
        wp_enqueue_style('wisecampaign-video-commerce-admin', WISECAMPAIGN_DIR_URL . 'assets/css/video-commerce-admin.css', [], '1.0.1');
        wp_enqueue_script('wisecampaign-video-commerce-admin', WISECAMPAIGN_DIR_URL . 'assets/js/video-commerce-admin.js', ['jquery', 'jquery-ui-sortable', 'media-editor'], '1.0.1', true);
    }

    /**
     * Enqueue assets for frontend
     */
    public function enqueue_frontend_assets() {
        if (!is_product()) {
            return;
        }

        wp_enqueue_style('wisecampaign-video-commerce-frontend', WISECAMPAIGN_DIR_URL . 'assets/css/video-commerce-frontend.css', [], '1.0.0');
        wp_enqueue_script('wisecampaign-video-commerce-frontend', WISECAMPAIGN_DIR_URL . 'assets/js/video-commerce-frontend.js', ['jquery'], '1.0.0', true);
    }

    /**
     * Render product reels under Add to Cart
     */
    public function render_product_reels() {
        global $product;
        if (!$product) {
            return;
        }

        $reels_ids = get_post_meta($product->get_id(), '_wisecampaign_product_reels_ids', true);
        $reels_ids = !empty($reels_ids) ? explode(',', $reels_ids) : [];

        if (empty($reels_ids)) {
            return;
        }

        echo '<div class="wisecampaign-product-reels-container" style="margin-top: 30px; margin-bottom: 30px;">';
        echo '<h3 class="wisecampaign-reels-title" style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; color: #0F172A;">' . __('Tagged with Reels', 'wisecampaign') . '</h3>';
        echo '<div class="wisecampaign-reels-wrapper" style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 15px; -webkit-overflow-scrolling: touch;">';
        
        $settings = $this->get_settings();
        $autoplay_attr = (!isset($settings['reelsAutoplayEnabled']) || $settings['reelsAutoplayEnabled'] !== false) ? 'autoplay muted loop' : '';

        foreach ($reels_ids as $id) {
            $url = wp_get_attachment_url($id);
            if ($url) {
                echo '<div class="wisecampaign-reel-item" data-video="' . esc_url($url) . '" style="flex: 0 0 140px; aspect-ratio: 9/16; background: #f1f5f9; border-radius: 16px; overflow: hidden; position: relative; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">';
                echo '<video src="' . esc_url($url) . '" ' . $autoplay_attr . ' playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>';
                echo '<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: #fff;">';
                echo '<span class="dashicons dashicons-controls-play" style="font-size: 32px; width: 32px; height: 32px; background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); border-radius: 50%; display: flex; align-items: center; justify-content: center;"></span>';
                echo '</div>';
                echo '</div>';
            }
        }
        
        echo '</div>';
        echo '</div>';

        // Lightbox HTML
        $price_html = $product->get_price_html();
        $name = $product->get_name();
        $image_url = get_the_post_thumbnail_url($product->get_id(), 'thumbnail');
        
        $bg_color = isset($settings['mobileCartBgColor']) ? $settings['mobileCartBgColor'] : 'rgba(30, 41, 59, 0.7)';
        $bg_opacity = isset($settings['mobileCartBgOpacity']) ? $settings['mobileCartBgOpacity'] : 70;
        $text_color = isset($settings['mobileCartTextColor']) ? $settings['mobileCartTextColor'] : '#ffffff';
        $btn_color = isset($settings['mobileCartBtnColor']) ? $settings['mobileCartBtnColor'] : '#ffffff';
        $btn_text_color = isset($settings['mobileCartBtnTextColor']) ? $settings['mobileCartBtnTextColor'] : '#1E293B';
        $btn_opacity = isset($settings['mobileCartBtnOpacity']) ? $settings['mobileCartBtnOpacity'] : 100;

        // Handle colors/opacity
        if (strpos($bg_color, '#') === 0) {
            $opacity_hex = str_pad(dechex(round($bg_opacity * 2.55)), 2, '0', STR_PAD_LEFT);
            $bg_color_final = substr($bg_color, 0, 7) . $opacity_hex;
        } else if (strpos($bg_color, 'rgba') === 0) {
            $bg_color_final = preg_replace('/[\d.]+\)$/', ($bg_opacity / 100) . ')', $bg_color);
        } else {
            $bg_color_final = $bg_color;
        }

        if (strpos($btn_color, '#') === 0) {
            $btn_opacity_hex = str_pad(dechex(round($btn_opacity * 2.55)), 2, '0', STR_PAD_LEFT);
            $btn_color_final = substr($btn_color, 0, 7) . $btn_opacity_hex;
        } else if (strpos($btn_color, 'rgba') === 0) {
            $btn_color_final = preg_replace('/[\d.]+\)$/', ($btn_opacity / 100) . ')', $btn_color);
        } else {
            $btn_color_final = $btn_color;
        }

        $blur = ($bg_opacity > 0) ? 'blur(10px)' : 'none';
        $border = ($bg_opacity > 0) ? '1px solid rgba(255,255,255,0.1)' : 'none';

        echo '<div id="wisecampaign-reels-lightbox" class="wisecampaign-video-lightbox">';
        echo '  <div class="wisecampaign-lightbox-close"><span class="dashicons dashicons-no-alt"></span></div>';
        echo '  <div class="wisecampaign-lightbox-content">';
        echo '      <video id="wisecampaign-lightbox-video" src="" playsinline></video>';
        
        // Lightbox Product Overlay
        echo '      <div class="wisecampaign-lightbox-overlay" style="position: absolute; bottom: 20px; left: 15px; right: 15px; background: ' . esc_attr($bg_color_final) . '; backdrop-filter: ' . esc_attr($blur) . '; border-radius: 16px; padding: 12px; border: ' . esc_attr($border) . '; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">';
        if ($image_url) {
            echo '<div style="width: 50px; height: 50px; border-radius: 10px; overflow: hidden; flex-shrink: 0;">';
            echo '<img src="' . esc_url($image_url) . '" style="width: 100%; height: 100%; object-fit: cover;">';
            echo '</div>';
        }
        echo '<div style="flex: 1; min-width: 0;">';
        echo '<h4 style="margin: 0; color: ' . esc_attr($text_color) . '; font-size: 13px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">' . esc_html($name) . '</h4>';
        echo '<div style="color: ' . esc_attr($text_color) . '; opacity: 0.8; font-size: 12px; font-weight: 700; margin-top: 2px;">' . $price_html . '</div>';
        echo '</div>';
        echo '<button class="wisecampaign-mobile-add-to-cart" style="background: ' . esc_attr($btn_color_final) . '; color: ' . esc_attr($btn_text_color) . '; border: none; border-radius: 10px; padding: 8px 16px; font-size: 12px; font-weight: 900; cursor: pointer; white-space: nowrap;">' . __('Buy Now', 'wisecampaign') . '</button>';
        echo '      </div>';

        echo '  </div>';
        echo '</div>';
    }

    /**
     * Render product videos on frontend
     */
    public function render_product_videos() {
        global $product;
        if (!$product) {
            return;
        }

        $video_id = get_post_meta($product->get_id(), '_wisecampaign_product_video_id', true);
        $gallery_ids = get_post_meta($product->get_id(), '_wisecampaign_product_video_gallery_ids', true);
        $gallery_ids = !empty($gallery_ids) ? explode(',', $gallery_ids) : [];

        if (!$video_id && empty($gallery_ids)) {
            return;
        }

        $settings = $this->get_settings();
        $video_url = $video_id ? wp_get_attachment_url($video_id) : '';
        $layout = isset($settings['layoutStyle']) ? $settings['layoutStyle'] : 'Carousel (Horizontal)';
        $radius = isset($settings['cornerRadius']) ? $settings['cornerRadius'] : 8;

        echo '<div class="woocommerce-product-gallery wisecampaign-product-video-gallery images" style="opacity: 1;">';
        
        // Section Title
        if (!empty($settings['titleSize'])) {
            echo '<h2 class="wisecampaign-video-title" style="font-size: ' . esc_attr($settings['titleSize']) . '; color: ' . esc_attr($settings['titleColor']) . '; margin-bottom: 20px; font-weight: 800;">' . __('Product Video Showcase', 'wisecampaign') . '</h2>';
        }

        if ($video_url) {
            echo '<div class="wisecampaign-main-video woocommerce-product-gallery__wrapper" style="margin-bottom: 20px; position: relative;">';
            echo '<video id="wisecampaign-main-player" src="' . esc_url($video_url) . '" controls style="width: 100%; border-radius: ' . esc_attr($radius) . 'px; box-shadow: 0 4px 30px rgba(0,0,0,0.15);"></video>';
            
            // Mobile Cart Overlay - Premium Product Card
            if (isset($settings['mobileCartOverlay']) && $settings['mobileCartOverlay']) {
                $price_html = $product->get_price_html();
                $name = $product->get_name();
                $image_url = get_the_post_thumbnail_url($product->get_id(), 'thumbnail');
                
                $bg_color = isset($settings['mobileCartBgColor']) ? $settings['mobileCartBgColor'] : 'rgba(30, 41, 59, 0.7)';
                $bg_opacity = isset($settings['mobileCartBgOpacity']) ? $settings['mobileCartBgOpacity'] : 70;
                $text_color = isset($settings['mobileCartTextColor']) ? $settings['mobileCartTextColor'] : '#ffffff';
                $btn_color = isset($settings['mobileCartBtnColor']) ? $settings['mobileCartBtnColor'] : '#ffffff';
                $btn_text_color = isset($settings['mobileCartBtnTextColor']) ? $settings['mobileCartBtnTextColor'] : '#1E293B';
                $btn_opacity = isset($settings['mobileCartBtnOpacity']) ? $settings['mobileCartBtnOpacity'] : 100;

                // Handle background color and opacity
                if (strpos($bg_color, '#') === 0) {
                    $opacity_hex = str_pad(dechex(round($bg_opacity * 2.55)), 2, '0', STR_PAD_LEFT);
                    $bg_color = substr($bg_color, 0, 7) . $opacity_hex;
                } else if (strpos($bg_color, 'rgba') === 0) {
                    $bg_color = preg_replace('/[\d.]+\)$/', ($bg_opacity / 100) . ')', $bg_color);
                }

                // Handle button color and opacity
                if (strpos($btn_color, '#') === 0) {
                    $btn_opacity_hex = str_pad(dechex(round($btn_opacity * 2.55)), 2, '0', STR_PAD_LEFT);
                    $btn_color = substr($btn_color, 0, 7) . $btn_opacity_hex;
                } else if (strpos($btn_color, 'rgba') === 0) {
                    $btn_color = preg_replace('/[\d.]+\)$/', ($btn_opacity / 100) . ')', $btn_color);
                }
                
                $blur = ($bg_opacity > 0) ? 'blur(10px)' : 'none';
                $border = ($bg_opacity > 0) ? '1px solid rgba(255,255,255,0.1)' : 'none';
                $shadow = ($bg_opacity > 0) ? '0 10px 30px rgba(0,0,0,0.3)' : 'none';
                
                echo '<div class="wisecampaign-mobile-cart-overlay" style="position: absolute; bottom: 15px; left: 10px; right: 10px; z-index: 10; background: ' . esc_attr($bg_color) . '; backdrop-filter: ' . esc_attr($blur) . '; border-radius: 16px; padding: 12px; border: ' . esc_attr($border) . '; display: flex; align-items: center; gap: 12px; box-shadow: ' . esc_attr($shadow) . ';">';
                
                if ($image_url) {
                    echo '<div class="wisecampaign-overlay-thumb" style="width: 50px; height: 50px; border-radius: 10px; overflow: hidden; flex-shrink: 0;">';
                    echo '<img src="' . esc_url($image_url) . '" style="width: 100%; height: 100%; object-fit: cover;">';
                    echo '</div>';
                }
                
                echo '<div class="wisecampaign-overlay-details" style="flex: 1; min-width: 0;">';
                echo '<h4 style="margin: 0; color: ' . esc_attr($text_color) . '; font-size: 13px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">' . esc_html($name) . '</h4>';
                echo '<div style="color: ' . esc_attr($text_color) . '; opacity: 0.8; font-size: 12px; font-weight: 700; margin-top: 2px;">' . $price_html . '</div>';
                echo '</div>';
                
                echo '<button class="wisecampaign-mobile-add-to-cart" style="background: ' . esc_attr($btn_color) . '; color: ' . esc_attr($btn_text_color) . '; border: none; border-radius: 10px; padding: 8px 16px; font-size: 12px; font-weight: 900; cursor: pointer; white-space: nowrap; shadow: 0 4px 10px rgba(0,0,0,0.1);">' . __('Buy Now', 'wisecampaign') . '</button>';
                echo '</div>';
            }
            echo '</div>';
        } else {
            // Show standard product image if main video is empty
            echo '<div class="wisecampaign-main-image-fallback woocommerce-product-gallery__wrapper" style="margin-bottom: 20px;">';
            echo get_the_post_thumbnail($product->get_id(), 'full', ['style' => 'width: 100%; height: auto; border-radius: ' . esc_attr($radius) . 'px; box-shadow: 0 4px 30px rgba(0,0,0,0.1);']);
            echo '</div>';
        }

        if (!empty($gallery_ids)) {
            $thumb_style = '';
            $container_class = 'wisecampaign-video-thumbnails flex-control-nav';
            
            if ($layout === 'Grid (2 Columns)') {
                $container_class .= ' wisecampaign-grid-2';
            } elseif ($layout === 'Stacked (Vertical)') {
                $container_class .= ' wisecampaign-stacked';
            }

            echo '<div class="' . esc_attr($container_class) . '" style="display: flex; gap: 10px; overflow-x: auto; padding-top: 10px;">';
            foreach ($gallery_ids as $id) {
                $url = wp_get_attachment_url($id);
                if ($url) {
                    echo '<div class="video-thumb" data-video="' . esc_url($url) . '" style="width: 100px; height: 100px; flex-shrink: 0; cursor: pointer; position: relative; border-radius: ' . esc_attr($radius/2) . 'px; overflow: hidden; border: 2px solid #eee;">';
                    echo '<video src="' . esc_url($url) . '" style="width: 100%; height: 100%; object-fit: cover;"></video>';
                    echo '<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: #fff;"><span class="dashicons dashicons-video-alt3"></span></div>';
                    echo '</div>';
                }
            }
            echo '</div>';
        }

        echo '</div>';
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
        $video_id = get_post_meta($post->ID, '_wisecampaign_product_video_id', true);
        $video_url = $video_id ? wp_get_attachment_url($video_id) : '';
        ?>
        <div id="wisecampaign-product-video-container" style="text-align: center; border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: #f9f9f9;">
            <div id="wisecampaign-video-preview" style="<?php echo $video_id ? '' : 'display:none;'; ?> margin-bottom: 10px;">
                <video src="<?php echo esc_url($video_url); ?>" style="max-width: 100%; border-radius: 4px;" controls></video>
            </div>
            <div id="wisecampaign-video-placeholder" style="<?php echo $video_id ? 'display:none;' : ''; ?>">
                <span class="dashicons dashicons-video-alt3" style="font-size: 64px; width: 64px; height: 64px; color: #ccc;"></span>
            </div>
            <p class="description"><?php _e('Click the video icon to add or update your primary product video.', 'wisecampaign'); ?></p>
            <input type="hidden" name="wisecampaign_product_video_id" id="wisecampaign-product-video-id" value="<?php echo esc_attr($video_id); ?>">
            <p>
                <a href="#" id="wisecampaign-set-product-video" class="button"><?php echo $video_id ? __('Update product video', 'wisecampaign') : __('Set product video', 'wisecampaign'); ?></a>
                <a href="#" id="wisecampaign-remove-product-video" style="<?php echo $video_id ? '' : 'display:none;'; ?> color: #a00; border-bottom: 1px solid #a00; color: #dc3232; margin-top: 10px; display: block; text-decoration: none;"><?php _e('Remove product video', 'wisecampaign'); ?></a>
            </p>
        </div>
        <?php
    }

    /**
     * Render video gallery metabox
     */
    public function render_product_video_gallery_metabox($post) {
        $gallery_ids = get_post_meta($post->ID, '_wisecampaign_product_video_gallery_ids', true);
        $gallery_ids = !empty($gallery_ids) ? explode(',', $gallery_ids) : [];
        ?>
        <div id="wisecampaign-video-gallery-container">
            <ul id="wisecampaign-video-gallery-list" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; padding: 0;">
                <?php foreach ($gallery_ids as $id) : 
                    $url = wp_get_attachment_url($id);
                    if ($url) : ?>
                    <li data-id="<?php echo esc_attr($id); ?>" style="position: relative; width: 60px; height: 60px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; background: #eee; display: flex; items-center justify-center;">
                        <video src="<?php echo esc_url($url); ?>" style="width: 100%; height: 100%; object-fit: cover;"></video>
                        <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-center; color: #fff;">
                            <span class="dashicons dashicons-video-alt3" style="font-size: 16px;"></span>
                        </div>
                        <a href="#" class="remove-gallery-video" style="position: absolute; top: -5px; right: -5px; background: #fff; border-radius: 50%; color: #f00; font-size: 10px;"><span class="dashicons dashicons-dismiss"></span></a>
                    </li>
                <?php endif; endforeach; ?>
                <li id="plus-video-placeholder" style="width: 60px; height: 60px; border: 1px border-dashed #ccc; border-radius: 4px; display: flex; align-items: center; justify-center; cursor: pointer; background: #fff;">
                     <span class="dashicons dashicons-video-alt3" style="color: #ccc;"></span>
                </li>
            </ul>
            <input type="hidden" name="wisecampaign_product_video_gallery_ids" id="wisecampaign-product-video-gallery-ids" value="<?php echo esc_attr(implode(',', $gallery_ids)); ?>">
            <a href="#" id="wisecampaign-add-video-gallery" style="text-decoration: none; font-weight: 500; font-size: 13px; color: #2271b1;"><?php _e('Add product video gallery images', 'wisecampaign'); ?></a>
        </div>
        <?php
    }

    /**
     * Render product reels metabox
     */
    public function render_product_reels_metabox($post) {
        $reels_ids = get_post_meta($post->ID, '_wisecampaign_product_reels_ids', true);
        $reels_ids = !empty($reels_ids) ? explode(',', $reels_ids) : [];
        ?>
        <div id="wisecampaign-reels-container">
            <ul id="wisecampaign-reels-list" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; padding: 0;">
                <?php foreach ($reels_ids as $id) : 
                    $url = wp_get_attachment_url($id);
                    if ($url) : ?>
                    <li data-id="<?php echo esc_attr($id); ?>" style="position: relative; width: 60px; height: 100px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; background: #eee; display: flex; align-items: center; justify-content: center;">
                        <video src="<?php echo esc_url($url); ?>" style="width: 100%; height: 100%; object-fit: cover;"></video>
                        <a href="#" class="remove-reel-video" style="position: absolute; top: -5px; right: -5px; background: #fff; border-radius: 50%; color: #f00; font-size: 10px;"><span class="dashicons dashicons-dismiss"></span></a>
                    </li>
                <?php endif; endforeach; ?>
                <li id="plus-reel-placeholder" style="width: 60px; height: 100px; border: 1px dashed #ccc; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff;">
                     <span class="dashicons dashicons-video-alt3" style="color: #ccc;"></span>
                </li>
            </ul>
            <input type="hidden" name="wisecampaign_product_reels_ids" id="wisecampaign-product-reels-ids" value="<?php echo esc_attr(implode(',', $reels_ids)); ?>">
            <a href="#" id="wisecampaign-add-reels" style="text-decoration: none; font-weight: 500; font-size: 13px; color: #2271b1;"><?php _e('Add product reels', 'wisecampaign'); ?></a>
        </div>
        <?php
    }

    /**
     * Save metabox data
     */
    public function save_product_video_meta($post_id) {
        if (isset($_POST['wisecampaign_product_video_id'])) {
            update_post_meta($post_id, '_wisecampaign_product_video_id', sanitize_text_field($_POST['wisecampaign_product_video_id']));
        }
        if (isset($_POST['wisecampaign_product_video_gallery_ids'])) {
            update_post_meta($post_id, '_wisecampaign_product_video_gallery_ids', sanitize_text_field($_POST['wisecampaign_product_video_gallery_ids']));
        }
        if (isset($_POST['wisecampaign_product_reels_ids'])) {
            update_post_meta($post_id, '_wisecampaign_product_reels_ids', sanitize_text_field($_POST['wisecampaign_product_reels_ids']));
        }
    }
}
