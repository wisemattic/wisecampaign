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
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);

        add_action('wp_enqueue_scripts', [$this, 'frontend_enqueue']);
        add_action('wp_footer', [$this, 'render_frontend_container']);
    }

    /**
     * =================================================================
     * ADMIN APP (React module: modules/wise-sales-notification)
     * =================================================================
     */

    /**
     * The live preview draws the real storefront popup, so it needs the storefront stylesheet and every font.
     */
    public function admin_enqueue($hook)
    {
        if (strpos($hook, 'wisecampaign_notification') === false) {
            return;
        }
        wp_enqueue_style('wisecampaign-notification-frontend-css', WISECAMPAIGN_DIR_URL . 'includes/css/notification-frontend.css', [], WISECAMPAIGN_VERSION);
        $families = array_map(function ($font) {
            return 'family=' . urlencode($font) . ':wght@400;600;700';
        }, $this->get_fonts());
        wp_enqueue_style('wisecampaign-notification-admin-fonts', 'https://fonts.googleapis.com/css2?' . implode('&', $families) . '&display=swap', [], null);
    }

    private function get_fonts()
    {
        return ['Poppins', 'Roboto', 'Open Sans', 'Lato'];
    }

    public function register_rest_routes()
    {
        $permission = function () {
            return current_user_can('manage_options');
        };

        register_rest_route('wisecampaign/v1', '/sales-notification', [
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

        register_rest_route('wisecampaign/v1', '/sales-notification/status', [
            'methods'             => 'POST',
            'callback'            => [$this, 'rest_set_status'],
            'permission_callback' => $permission,
        ]);

        register_rest_route('wisecampaign/v1', '/sales-notification/reset', [
            'methods'             => 'POST',
            'callback'            => [$this, 'rest_reset_settings'],
            'permission_callback' => $permission,
        ]);
    }

    /**
     * Settings plus everything the admin app needs to build the live preview.
     */
    public function rest_get_settings()
    {
        $has_wc = $this->has_wc();
        $settings = $this->get_settings_for_admin();
        $placeholder = function_exists('wc_placeholder_img_src') ? wc_placeholder_img_src() : WISECAMPAIGN_DIR_URL . 'images/fe/wc_logo.png';

        $pages = array_map(function ($page) {
            return ['id' => $page->ID, 'title' => $page->post_title];
        }, get_pages(['post_status' => 'publish']));

        $custom_images = [];
        foreach ($settings['virtual_custom_images'] as $image_id) {
            $thumb = wp_get_attachment_image_url($image_id, 'thumbnail');
            if ($thumb) {
                $custom_images[] = [
                    'id'    => $image_id,
                    'thumb' => $thumb,
                    'url'   => wp_get_attachment_image_url($image_id, 'medium') ?: $thumb,
                ];
            }
        }

        $response = rest_ensure_response([
            'settings'         => $settings,
            'defaults'         => $this->get_default_settings(),
            'isPro'            => $this->is_pro_active(),
            'hasWc'            => $has_wc,
            'avatars'          => $this->get_avatar_urls(),
            'placeholderImage' => $placeholder,
            'pages'            => $pages,
            'orders'           => $has_wc ? $this->get_admin_orders($placeholder) : [],
            'products'         => $has_wc ? $this->get_admin_products($placeholder) : [],
            'customImages'     => $custom_images,
        ]);
        // Some hosts cache REST responses; settings and license status must always be fresh.
        $response->header('Cache-Control', 'no-store');
        return $response;
    }

    public function rest_save_settings(\WP_REST_Request $request)
    {
        $current = get_option($this->option_name, []);
        $settings = $this->sanitize_settings($request->get_json_params());
        // On/off has its own endpoint, so saving the form never flips it.
        $settings['enabled'] = isset($current['enabled']) ? $current['enabled'] : '1';
        update_option($this->option_name, $settings);

        return rest_ensure_response(['success' => true, 'settings' => $this->get_settings_for_admin()]);
    }

    public function rest_set_status(\WP_REST_Request $request)
    {
        $options = get_option($this->option_name, []);
        $options['enabled'] = filter_var($request->get_param('enabled'), FILTER_VALIDATE_BOOLEAN) ? '1' : '0';
        update_option($this->option_name, $options);

        return rest_ensure_response(['success' => true, 'enabled' => $options['enabled']]);
    }

    public function rest_reset_settings()
    {
        update_option($this->option_name, $this->get_default_settings());
        return $this->rest_get_settings();
    }

    /**
     * Saved settings merged over the defaults, with the source and products mode the storefront will really use.
     */
    private function get_settings_for_admin()
    {
        $saved = get_option($this->option_name, []);
        $settings = array_merge($this->get_default_settings(), is_array($saved) ? $saved : []);
        $settings['source'] = $this->get_source($settings);
        $settings['virtual_products_mode'] = $this->get_products_mode($settings);
        foreach (['selected_orders', 'virtual_selected_products', 'virtual_custom_images', 'specific_pages'] as $key) {
            $settings[$key] = array_values(array_map('intval', (array) $settings[$key]));
        }
        return $settings;
    }

    /**
     * Latest orders with the same fields get_notification_data() shows, so the preview matches the storefront.
     */
    private function get_admin_orders($placeholder)
    {
        $query = new \WC_Order_Query(['limit' => 100, 'orderby' => 'date', 'order' => 'DESC']);
        $orders = [];
        foreach ($query->get_orders() as $order) {
            $items = [];
            foreach ($order->get_items() as $item) {
                $product = $item->get_product();
                if (!$product) {
                    continue;
                }
                $items[] = [
                    'name'  => $item->get_name(),
                    'image' => wp_get_attachment_url($product->get_image_id()) ?: $placeholder,
                    'url'   => get_permalink($product->get_id()),
                ];
            }
            $created = $order->get_date_created();
            $orders[] = [
                'id'       => $order->get_id(),
                'label'    => '#' . $order->get_id() . ' – ' . trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
                'status'   => $order->get_status(),
                'buyer'    => $order->get_billing_first_name(),
                'location' => $order->get_billing_city() . ', ' . (WC()->countries->countries[$order->get_billing_country()] ?? $order->get_billing_country()),
                'time'     => $created ? human_time_diff(strtotime($created->date('Y-m-d H:i:s')), current_time('timestamp')) . ' ago' : '',
                'items'    => $items,
            ];
        }
        return $orders;
    }

    private function get_admin_products($placeholder)
    {
        $products = wc_get_products(['limit' => 100, 'status' => 'publish', 'orderby' => 'title', 'order' => 'ASC']);
        return array_map(function ($product) use ($placeholder) {
            return [
                'id'    => $product->get_id(),
                'name'  => $product->get_name(),
                'price' => wp_strip_all_tags(wc_price($product->get_price())),
                'image' => wp_get_attachment_url($product->get_image_id()) ?: $placeholder,
                'url'   => get_permalink($product->get_id()),
            ];
        }, $products);
    }

    /**
     * Sanitizes a full settings payload. PRO-only values fall back for free users.
     */
    private function sanitize_settings($input)
    {
        $input = is_array($input) ? $input : [];
        $defaults = $this->get_default_settings();
        $is_pro = $this->is_pro_active();

        // Reads a scalar field as a string; anything else (arrays, objects) counts as missing.
        $str = function ($key) use ($input, $defaults) {
            return isset($input[$key]) && is_scalar($input[$key]) ? (string) $input[$key] : (string) $defaults[$key];
        };
        $enum = function ($key, $allowed) use ($str, $defaults) {
            $value = $str($key);
            return in_array($value, $allowed, true) ? $value : $defaults[$key];
        };
        $int = function ($key, $min, $max) use ($str) {
            return max($min, min($max, intval($str($key))));
        };
        $bool = function ($key) use ($input) {
            return filter_var($input[$key] ?? false, FILTER_VALIDATE_BOOLEAN) ? '1' : '0';
        };
        $ids = function ($key) use ($input) {
            return isset($input[$key]) && is_array($input[$key]) ? array_values(array_filter(array_map('intval', array_filter($input[$key], 'is_scalar')))) : [];
        };
        $color = function ($key) use ($str, $defaults) {
            return sanitize_hex_color($str($key)) ?: $defaults[$key];
        };

        $settings = [
            'template'                  => $enum('template', ['template_1', 'template_2', 'template_3', 'template_4', 'template_5', 'template_6']),
            'position'                  => $enum('position', ['bottom-left', 'bottom-right', 'top-left', 'top-right']),
            'background_color'          => $color('background_color'),
            'border_color'              => $color('border_color'),
            'border_width'              => $int('border_width', 0, 20),
            'border_radius'             => $int('border_radius', 0, 100),
            'image_radius'              => $int('image_radius', 0, 50),
            'font_family'               => $enum('font_family', $this->get_fonts()),
            'hide_branding'             => $bool('hide_branding'),
            'random_show'               => $bool('random_show'),
            'source'                    => $enum('source', ['recent_orders', 'selected_orders', 'virtual_orders']),
            'selected_orders'           => $ids('selected_orders'),
            'virtual_names'             => sanitize_textarea_field($str('virtual_names')),
            'virtual_locations'         => sanitize_textarea_field($str('virtual_locations')),
            'virtual_products_mode'     => $enum('virtual_products_mode', ['all_products', 'selected_products', 'custom_products']),
            'virtual_selected_products' => $ids('virtual_selected_products'),
            'virtual_custom_products'   => sanitize_textarea_field($str('virtual_custom_products')),
            'virtual_image_type'        => $enum('virtual_image_type', ['product', 'buyer']),
            'virtual_custom_images'     => array_values(array_filter($ids('virtual_custom_images'), 'wp_attachment_is_image')),
            'visibility'                => $enum('visibility', ['all_pages', 'specific_pages']),
            'specific_pages'            => $ids('specific_pages'),
            'loop'                      => $bool('loop'),
            'display_time'              => $int('display_time', 1, 300),
            'delay_time'                => $int('delay_time', 1, 300),
        ];

        $settings['virtual_products_mode'] = $this->get_products_mode($settings);
        $settings['source'] = $this->get_source($settings);

        // PRO feature validation
        if (!$is_pro) {
            if ($settings['source'] === 'virtual_orders' && $this->has_wc()) {
                $settings['source'] = 'recent_orders';
            }
            $settings['hide_branding'] = '0';

            $pro_templates = ['template_3', 'template_4', 'template_5', 'template_6'];
            if (in_array($settings['template'], $pro_templates, true)) {
                $settings['template'] = 'template_1';
            }
        }

        return $settings;
    }

    public function is_pro_active()
    {
        if (class_exists('\\WISECAMPAIGNPRO\\Classes\\ProPluginLicense')) {
            return \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
        }
        return false;
    }

    private function has_wc()
    {
        return defined('WISECAMPAIGN_HAS_WC') && WISECAMPAIGN_HAS_WC;
    }

    /**
     * Without WooCommerce there are no real orders, so the order sources fall back to simulated orders.
     */
    private function get_source($settings)
    {
        $source = $settings['source'] ?? ($this->has_wc() ? 'recent_orders' : 'virtual_orders');
        if (!$this->has_wc() && in_array($source, ['recent_orders', 'selected_orders'], true)) {
            $source = 'virtual_orders';
        }
        return $source;
    }

    /**
     * WooCommerce product modes need WooCommerce; without it only custom products are possible.
     */
    private function get_products_mode($settings)
    {
        if (!$this->has_wc()) {
            return 'custom_products';
        }
        $mode = $settings['virtual_products_mode'] ?? 'all_products';
        return in_array($mode, ['all_products', 'selected_products', 'custom_products'], true) ? $mode : 'all_products';
    }

    /**
     * Parses the custom products field: one "Product name | https://link" per line, the link is optional.
     */
    private function parse_custom_products($raw)
    {
        $products = [];
        foreach (preg_split('/\r\n|\r|\n/', (string) $raw) as $line) {
            $parts = array_map('trim', explode('|', $line, 2));
            $name = sanitize_text_field($parts[0]);
            if ($name === '') {
                continue;
            }
            $products[] = [
                'name' => $name,
                'url'  => isset($parts[1]) ? esc_url_raw($parts[1], ['http', 'https']) : '',
            ];
        }
        return $products;
    }


    private function get_option($key, $default = '')
    {
        $options = get_option($this->option_name);
        return isset($options[$key]) ? $options[$key] : $default;
    }

    /**
     * Bundled cartoon buyer avatars (Open Peeps, CC0).
     */
    private function get_avatar_urls()
    {
        $files = glob(WISECAMPAIGN_DIR_PATH . 'images/avatars/buyer-*.svg') ?: [];
        sort($files);
        return array_map(function ($file) {
            return WISECAMPAIGN_DIR_URL . 'images/avatars/' . basename($file);
        }, $files);
    }

    /**
     * The same buyer name always gets the same avatar. The admin live preview
     * (modules/wise-sales-notification/src/preview.js) uses the same djb2 hash, so keep the two in sync.
     */
    private function get_avatar_for_name($name, $avatars)
    {
        if (empty($avatars)) {
            return '';
        }
        $hash = 5381;
        foreach (preg_split('//u', (string) $name, -1, PREG_SPLIT_NO_EMPTY) as $char) {
            $code = function_exists('mb_ord') ? mb_ord($char, 'UTF-8') : ord($char);
            $hash = (($hash * 33) + $code) & 0xFFFFFFFF;
        }
        return $avatars[$hash % count($avatars)];
    }

    private function get_custom_image_urls($image_ids)
    {
        $urls = [];
        foreach (array_filter(array_map('intval', (array) $image_ids)) as $image_id) {
            $url = wp_get_attachment_image_url($image_id, 'medium');
            if ($url) {
                $urls[] = $url;
            }
        }
        return $urls;
    }

    /**
     * Picks the image for a simulated notification based on the "Notification Image" setting.
     */
    private function get_virtual_item_image($index, $buyer, $product_image, $context)
    {
        if ($context['type'] === 'buyer' && !empty($context['avatars'])) {
            return ['url' => $this->get_avatar_for_name($buyer, $context['avatars']), 'type' => 'avatar'];
        }
        if (!empty($context['custom'])) {
            return ['url' => $context['custom'][$index % count($context['custom'])], 'type' => 'custom'];
        }
        if ($product_image !== '') {
            return ['url' => $product_image, 'type' => 'product'];
        }
        // Custom products have no photo of their own; the buyer's avatar looks better than a placeholder.
        if (!empty($context['avatars'])) {
            return ['url' => $this->get_avatar_for_name($buyer, $context['avatars']), 'type' => 'avatar'];
        }
        return ['url' => WISECAMPAIGN_DIR_URL . 'images/fe/wc_logo.png', 'type' => 'product'];
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
        wp_enqueue_style('wisecampaign-notification-frontend-css', WISECAMPAIGN_DIR_URL . 'includes/css/notification-frontend.css', [], WISECAMPAIGN_VERSION);

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

    private function get_notification_data()
    {
        $settings = get_option($this->option_name, []);
        $source = $this->get_source($settings);
        $items = [];

        // Virtual (Simulated) Orders Generator (PRO)
        if ($source === 'virtual_orders') {
            if (!$this->is_pro_active()) {
                return [];
            }

            $defaults = $this->get_default_settings();
            $raw_names = !empty($settings['virtual_names']) ? $settings['virtual_names'] : $defaults['virtual_names'];
            $raw_locations = !empty($settings['virtual_locations']) ? $settings['virtual_locations'] : $defaults['virtual_locations'];
            $products_mode = $this->get_products_mode($settings);
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
            if ($products_mode === 'custom_products') {
                // Typed-in products, no WooCommerce needed.
            } elseif ($products_mode === 'selected_products' && !empty($selected_pids)) {
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

            $image_context = [
                'type'    => $settings['virtual_image_type'] ?? 'product',
                'avatars' => $this->get_avatar_urls(),
                'custom'  => $this->get_custom_image_urls($settings['virtual_custom_images'] ?? []),
            ];

            // Everything the notifications can promote, as name / link / photo.
            $catalog = [];
            if ($products_mode === 'custom_products') {
                foreach ($this->parse_custom_products($settings['virtual_custom_products'] ?? '') as $custom) {
                    $catalog[] = ['name' => $custom['name'], 'url' => $custom['url'], 'image' => ''];
                }
            }
            foreach ($products as $product) {
                if (!$product) {
                    continue;
                }
                $image_url = wp_get_attachment_url($product->get_image_id());
                if (empty($image_url) && function_exists('wc_placeholder_img_src')) {
                    $image_url = wc_placeholder_img_src();
                }
                $catalog[] = [
                    'name'  => $product->get_name(),
                    'url'   => get_permalink($product->get_id()),
                    'image' => $image_url ?: WISECAMPAIGN_DIR_URL . 'images/fe/wc_logo.png',
                ];
            }

            // Demo items until the WooCommerce store has products. Custom mode shows nothing until products are typed in.
            if (empty($catalog) && $products_mode !== 'custom_products') {
                $placeholder = function_exists('wc_placeholder_img_src') ? wc_placeholder_img_src() : '';
                $demo_items = [
                    'Premium Wireless Headphones',
                    'Smart Fitness Watch',
                    'Ultra-Comfort Sneakers',
                    'Minimalist Leather Wallet',
                    'Stainless Steel Water Bottle'
                ];
                foreach ($demo_items as $demo_item) {
                    $catalog[] = ['name' => $demo_item, 'url' => '#', 'image' => $placeholder];
                }
            }

            if (empty($catalog)) {
                return [];
            }

            $catalog_count = count($catalog);
            for ($i = 0; $i < $total_items; $i++) {
                $entry = $catalog[$i % $catalog_count];
                $buyer = $names[$i % $name_count];
                $image = $this->get_virtual_item_image($i, $buyer, $entry['image'], $image_context);
                $items[] = [
                    'product_name'  => $entry['name'],
                    'product_image' => $image['url'],
                    'product_photo' => $entry['image'],
                    'image_type'    => $image['type'],
                    'product_url'   => $entry['url'],
                    'buyer'         => $buyer,
                    'time'          => $time_options[$i % $time_count],
                    'location'      => $locations[$i % $loc_count],
                    'is_virtual'    => true,
                ];
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
            'virtual_custom_products' => '',
            'virtual_image_type' => 'product',
            'virtual_custom_images' => [],
            'visibility' => 'all_pages',
            'specific_pages' => [],
            'loop' => '1',
            'display_time' => 5,
            'delay_time' => 5
        ];
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
