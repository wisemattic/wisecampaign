<?php
namespace WISECAMPAIGN\Classes;

use WISECAMPAIGN\Traits\SingletonTrait;
use WP_REST_Request;

if (!defined('ABSPATH')) {
    exit;
}

class StockBar
{

    use SingletonTrait;

    public function __construct()
    {
        // Register REST routes
        add_action('rest_api_init', [$this, 'stockbar_register_rest_routes']);

        // Load frontend hooks only when appropriate
        add_action('wp', [$this, 'load_on_page']);
    }

    public function load_on_page()
    {
        // Don't load on admin or if WooCommerce functions aren't available
        if (is_admin() || !function_exists('is_product')) {
            return;
        }

        $defaultStatus = ['stockBarEnabled' => true]; // Default to true if not set for testing
        $status = get_option('wc-stockbar-status', $defaultStatus);
        if (isset($status['stockBarEnabled']) && $status['stockBarEnabled'] == false) {
            return;
        }

        $setting = get_option('wc-stockbar-setting', []);

        // Ensure keys exist before accessing
        $displayOnProductPage = isset($setting['displayOnProductPage']) ? filter_var($setting['displayOnProductPage'], FILTER_VALIDATE_BOOLEAN) : true;
        $displayOnShopPage = isset($setting['displayOnShopPage']) ? filter_var($setting['displayOnShopPage'], FILTER_VALIDATE_BOOLEAN) : false;

        // Display stock bar on **Product Page**
        if ($displayOnProductPage && is_product()) {
            add_action('woocommerce_before_add_to_cart_button', [$this, 'cspe_custom_content'], 20);
        }

        // Display stock bar on **Shop Page**
        if ($displayOnShopPage && (is_shop() || is_product_category())) {
            add_action('woocommerce_after_shop_loop_item_title', [$this, 'cspe_custom_content'], 15);
        }
    }

    /**
     * Initialize stock bar defaults during plugin activation.
     */
    public function initialize_stockbar_defaults()
    {
        $default_config = [
            'linear' => [
                'progressBarColor' => '#EC4899',
                'stockBarBg' => '#FFFFFF',
                'textColor' => '#111827',
                'borderColor' => '#F1F5F9',
                'fontSize' => '12px',
                'fontWeight' => 'Bold',
                'mainText' => "Hurry! Selling fast!",
                'icon' => "Flame",
                'subText' => "items left"
            ],
            'pulse' => [
                'progressBarColor' => '#EF4444',
                'stockBarBg' => '#FEF2F2',
                'textColor' => '#991B1B',
                'borderColor' => '#FEE2E2',
                'fontSize' => '13px',
                'fontWeight' => 'Bold',
                'mainText' => "Extremely Limited Stock!",
                'icon' => "AlertCircle",
                'subText' => "Only 12 items remaining"
            ],
            'minimal' => [
                'progressBarColor' => '#3B82F6',
                'stockBarBg' => '#F8FAFC',
                'textColor' => '#1E293B',
                'borderColor' => '#E2E8F0',
                'fontSize' => '11px',
                'fontWeight' => 'Medium',
                'mainText' => "Popular Product",
                'icon' => "TrendingUp",
                'subText' => "Pieces available"
            ],
            'countdown' => [
                'progressBarColor' => '#F59E0B',
                'stockBarBg' => '#FFFBEB',
                'textColor' => '#92400E',
                'borderColor' => '#FEF3C7',
                'fontSize' => '12px',
                'fontWeight' => 'Bold',
                'mainText' => "Flash Sale Ends In",
                'icon' => "Clock",
                'subText' => "left",
                'labelPosition' => "top",
                'timerExpiry' => ""
            ],
            'badge' => [
                'progressBarColor' => '#10B981',
                'stockBarBg' => '#F0FDF4',
                'textColor' => '#065F46',
                'borderColor' => '#DCFCE7',
                'fontSize' => '12px',
                'fontWeight' => 'Bold',
                'mainText' => "Limited Stock",
                'icon' => "Package",
                'subText' => "left"
            ]
        ];

        $defaults = [
            'wc-stockbar-1' => array_merge($default_config, [
                'id' => 'linear',
                'name' => 'High Demand Flow',
                'isActive' => true
            ]),
            'wc-stockbar-2' => array_merge($default_config, [
                'id' => 'pulse',
                'name' => 'Urgent Alert',
                'isActive' => false
            ])
        ];

        // Save each default stock bar design
        foreach ($defaults as $key => $settings) {
            if (get_option($key) === false) {
                update_option($key, $settings);
            }
        }

        if (get_option('activeWiseStockbarId') === false) {
            update_option('activeWiseStockbarId', 'wc-stockbar-1');
        }

        $default_setting = [
            'displayOnShopPage' => false,
            'displayOnProductPage' => true
        ];
        // Only set default if the option doesn't exist yet
        if (get_option('wc-stockbar-setting') === false) {
            update_option('wc-stockbar-setting', $default_setting);
        }
    }

    function get_status()
    {
        $defaultStatus = ['stockBarEnabled' => true];
        $status = get_option('wc-stockbar-status', $defaultStatus);
        return rest_ensure_response($status);
    }

    function update_status(WP_REST_Request $request)
    {
        if ($request->has_param('stockBarEnabled')) {
            update_option('wc-stockbar-status', ['stockBarEnabled' => rest_sanitize_boolean($request['stockBarEnabled'])]);
        }

        $defaultStatus = ['stockBarEnabled' => true];
        $status = get_option('wc-stockbar-status', $defaultStatus);
        return rest_ensure_response($status);
    }


    /**
     * Register REST routes for stock bar settings.
     */
    public function stockbar_register_rest_routes()
    {
        $namespace = 'wisecampaign/v1';

        // Endpoint to get initialized stock bar designs
        register_rest_route($namespace, '/stockbar-status', [
            'methods' => 'GET',
            'callback' => [$this, 'get_status'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route($namespace, '/stockbar-status', [
            'methods' => 'POST',
            'callback' => [$this, 'update_status'],
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/stockbars', [
            'methods' => 'GET',
            'callback' => [$this, 'get_initialized_stockbars'],
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            },
        ]);

        register_rest_route($namespace, '/stockbars', [
            'methods' => 'POST',
            'callback' => [$this, 'save_stockbar_design'],
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/stockbars/setting', [
            'methods' => 'POST',
            'callback' => [$this, 'update_stockbar_setting'],
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/stockbars/setting', [
            'methods' => 'GET',
            'callback' => [$this, 'get_stockbar_setting'],
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            },
        ]);

        register_rest_route($namespace, '/stockbars/set-active', [
            'methods' => 'POST',
            'callback' => [$this, 'set_active_stockbar_endpoint'],
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);
    }

    public function set_active_stockbar_endpoint(WP_REST_Request $request)
    {
        $params = $request->get_json_params();
        $stockbar_id = $params['id'] ?? '';

        if (!$stockbar_id) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Stock bar ID is required'
            ]);
        }

        // Update active stock bar
        $this->set_active_stockbar($stockbar_id);

        return rest_ensure_response([
            'success' => true,
            'message' => 'Active stock bar updated successfully'
        ]);
    }

    /**
     * Retrieve all initialized stock bars.
     */
    public function get_initialized_stockbars(WP_REST_Request $request)
    {
        $defaults = [
            'wc-stockbar-1',
            'wc-stockbar-2'
        ];

        $stockbars = [];
        $active_id = $this->get_active_stockbar();

        foreach ($defaults as $key) {
            $stockbar = get_option($key, []);
            if (empty($stockbar))
                continue;

            $stockbar['db_id'] = $key;
            $stockbar['isActive'] = ($key === $active_id);
            $stockbars[] = $stockbar;
        }

        return rest_ensure_response($stockbars);
    }

    /**
     * Save stock bar settings via REST API.
     */
    public function save_stockbar_design(WP_REST_Request $request)
    {
        try {
            $settings = $request->get_json_params();
            if (!is_array($settings)) {
                return rest_ensure_response(['success' => false, 'message' => 'Invalid JSON data']);
            }

            $design_id = $settings['db_id'] ?? $settings['id'] ?? '';

            if (!$design_id) {
                return rest_ensure_response(['success' => false, 'message' => 'ID not specified']);
            }

            $stockbar = get_option($design_id, []);
            if (!is_array($stockbar)) {
                $stockbar = [];
            }

            // Update fields from request
            $fields_to_save = [
                'id',
                'progressBarColor',
                'progressBg',
                'stockBarBg',
                'textColor',
                'borderColor',
                'fontSize',
                'fontWeight',
                'content',
                'linear',
                'pulse',
                'minimal',
                'countdown',
                'badge'
            ];

            foreach ($fields_to_save as $field) {
                if (isset($settings[$field])) {
                    $stockbar[$field] = $settings[$field];
                }
            }

            update_option($design_id, $stockbar);

            if (isset($settings['isActive']) && $settings['isActive']) {
                $this->set_active_stockbar($design_id);
            }

            return rest_ensure_response(['success' => true, 'message' => 'Stock bar settings updated successfully', 'data' => $stockbar]);
        } catch (\Throwable $e) {
            return new \WP_Error('server_error', $e->getMessage(), ['status' => 500]);
        }
    }

    /**
     * Update stock bars setting.
     */
    public function update_stockbar_setting(WP_REST_Request $request)
    {
        try {
            $settings = get_option('wc-stockbar-setting', []);
            if (!is_array($settings)) {
                $settings = [];
            }
            $params = $request->get_json_params();
            if (!is_array($params)) {
                return rest_ensure_response(['success' => false, 'message' => 'Invalid JSON data']);
            }

            if (isset($params['displayOnShopPage'])) {
                $settings['displayOnShopPage'] = wp_validate_boolean($params['displayOnShopPage']);
            }

            if (isset($params['displayOnProductPage'])) {
                $settings['displayOnProductPage'] = wp_validate_boolean($params['displayOnProductPage']);
            }

            update_option('wc-stockbar-setting', $settings);

            return rest_ensure_response(['success' => true, 'message' => 'Stock bar display settings updated successfully', 'settings' => $settings]);
        } catch (\Throwable $e) {
            return new \WP_Error('server_error', $e->getMessage(), ['status' => 500]);
        }
    }

    public function set_active_stockbar($stockbarId)
    {
        update_option('activeWiseStockbarId', $stockbarId);
    }

    public function get_active_stockbar()
    {
        return get_option('activeWiseStockbarId', 'wc-stockbar-1');
    }

    /**
     * Retrieve stock bars setting.
     */
    public function get_stockbar_setting(WP_REST_Request $request)
    {
        $settings = get_option('wc-stockbar-setting', [
            'displayOnShopPage' => false,
            'displayOnProductPage' => true
        ]);
        return rest_ensure_response($settings);
    }

    /**
     * Display stock bar on storefront
     */
    public function cspe_custom_content()
    {
        global $product;

        if (!$product)
            return;

        // Check if stock management is enabled
        if ($product->managing_stock() && $product->get_stock_quantity() !== null) {

            $active_id = $this->get_active_stockbar();
            $config = get_option($active_id, []);

            if (empty($config))
                return;

            $total_sold = (int) $product->get_total_sales();
            $stock_quantity = (int) $product->get_stock_quantity();

            $this->enqueue_react_stockbar_script(
                $config,
                $total_sold,
                $stock_quantity
            );

            // Output React container
            echo '<div id="wise-stock-bar-app" class="wise-stock-bar-storefront"></div>';
        }
    }


    public function enqueue_react_stockbar_script($config, $total_sold, $stock_quantity)
    {
        $dist_path = WISECAMPAIGN_DIR_PATH . 'modules/wise-stock-bar/dist/';
        $dist_url = WISECAMPAIGN_DIR_URL . 'modules/wise-stock-bar/dist/';

        $entry_js = '';
        $entry_css = '';

        // Read manifest to get correct hashed filenames
        $manifest_path = $dist_path . '.vite/manifest.json';
        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);
            if (isset($manifest['src/main.jsx'])) {
                $entry_js = $dist_url . $manifest['src/main.jsx']['file'];
                if (isset($manifest['src/main.jsx']['css'][0])) {
                    $entry_css = $dist_url . $manifest['src/main.jsx']['css'][0];
                }
            }
        }

        if (!$entry_js) {
            // Fallback to dev if manifest not found - though in production we should have it
            return;
        }

        wp_enqueue_script('wise-stock-bar-frontend', $entry_js, ['wp-element'], '1.0.0', true);
        if ($entry_css) {
            wp_enqueue_style('wise-stock-bar-frontend-style', $entry_css);
        }

        // Add module type to script
        add_filter('script_loader_tag', function ($tag, $handle, $src) {
            if ($handle === 'wise-stock-bar-frontend') {
                return '<script type="module" src="' . esc_url($src) . '"></script>';
            }
            return $tag;
        }, 10, 3);

        wp_localize_script(
            'wise-stock-bar-frontend',
            'wiseStockbarData',
            [
                'isStorefront' => true,
                'config' => $config,
                'stockInfo' => [
                    'totalSold' => $total_sold,
                    'availableItems' => $stock_quantity,
                    'totalItems' => $total_sold + $stock_quantity,
                    'percentage' => ($total_sold + $stock_quantity) > 0 ? ($total_sold / ($total_sold + $stock_quantity)) * 100 : 0
                ]
            ]
        );
    }
}
