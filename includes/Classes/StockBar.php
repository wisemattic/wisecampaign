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
        $this->load_on_page();


    }

    public function load_on_page()
    {

        $defaultStatus = ['stockBarEnabled' => false];
        $status = get_option('wc-stockbar-status', $defaultStatus);
        if ($status['stockBarEnabled'] == false) {
            return;
        }

        $setting = get_option('wc-stockbar-setting', []);

        // Ensure keys exist before accessing
        $displayOnProductPage = isset($setting['displayOnProductPage']) ? filter_var($setting['displayOnProductPage'], FILTER_VALIDATE_BOOLEAN) : false;
        $displayOnShopPage = isset($setting['displayOnShopPage']) ? filter_var($setting['displayOnShopPage'], FILTER_VALIDATE_BOOLEAN) : false;

        // Display stock bar on **Product Page**
        if ($displayOnProductPage) {
            add_action('woocommerce_before_add_to_cart_button', [$this, 'cspe_custom_content'], 20);
        }

        // Display stock bar on **Shop Page**
        if ($displayOnShopPage) {
            add_action('woocommerce_after_shop_loop_item_title', [$this, 'cspe_custom_content'], 15);
        }
    }

    /**
     * Initialize stock bar defaults during plugin activation.
     */
    public function initialize_stockbar_defaults()
    {
        $defaults = [
            'wc-stockbar-1' => [
                'type' => 'solid',
                'progressBgColor' => '#d2d2d2',
                'progressColor' => '#198038',
                'isActive' => true
            ],
            'wc-stockbar-2' => [
                'type' => 'gradient',
                'progressBgColor' => '#d2d2d2',
                'progressStartColor' => '#ffc83a',
                'progressEndColor' => '#fe4070',
                'isActive' => false
            ]
        ];

        // Log to confirm method execution
        error_log("Initializing stock bar defaults...");

        // Save each default stock bar design
        foreach ($defaults as $key => $settings) {
            if (get_option($key) === false) {
                update_option($key, $settings);
                error_log("Setting default for $key: " . json_encode($settings));
            }
        }

        $default_setting = [
            'displayOnShopPage' => false,
            'displayOnProductPage' => false
        ];
        // Only set default if the option doesn't exist yet
        if (get_option('wc-stockbar-setting') === false) {
            update_option('wc-stockbar-setting', $default_setting);
        }


    }

    function get_status()
    {
        $defaultStatus = ['stockBarEnabled' => false];
        $status = get_option('wc-stockbar-status', $defaultStatus);
        return rest_ensure_response($status);
    }

    function update_status(WP_REST_Request $request)
    {

        if ($request->has_param('stockBarEnabled')) {
            update_option('wc-stockbar-status', ['stockBarEnabled' => rest_sanitize_boolean($request['stockBarEnabled'])]);
        }

        $defaultStatus = ['stockBarEnabled' => false];
        $status = get_option('wc-stockbar-status', $defaultStatus);
        return rest_ensure_response($status);
    }


    /**
     * Register REST routes for stock bar settings.
     */
    public function stockbar_register_rest_routes()
    {

        // Endpoint to get initialized stock bar designs
        register_rest_route('wise-campaign-plugin/v1', '/stockbar-status', [
            'methods' => 'GET',
            'callback' => [$this, 'get_status'],
        ]);

        // Endpoint to get initialized stock bar designs
        register_rest_route('wise-campaign-plugin/v1', '/stockbar-status', [
            'methods' => 'POST',
            'callback' => [$this, 'update_status'],
        ]);

        // Endpoint to get initialized stock bar designs
        register_rest_route('wise-campaign-plugin/v1', '/stockbars', [
            'methods' => 'GET',
            'callback' => [$this, 'get_initialized_stockbars'],
        ]);

        // Endpoint to update stock bar design
        register_rest_route('wise-campaign-plugin/v1', '/stockbars', [
            'methods' => 'POST',
            'callback' => [$this, 'save_stockbar_design'],
            // 'permission_callback' => function () {
            //     return current_user_can('manage_options'); // Restrict access to admins
            // },
        ]);

        // Endpoint to update stock bar settings
        register_rest_route('wise-campaign-plugin/v1', '/stockbars/setting', [
            'methods' => 'POST',
            'callback' => [$this, 'update_stockbar_setting'],
            // 'permission_callback' => function () {
            //     return current_user_can('manage_options'); // Restrict access to admins
            // },
        ]);

        // Endpoint to update stock bar settings
        register_rest_route('wise-campaign-plugin/v1', '/stockbars/setting', [
            'methods' => 'GET',
            'callback' => [$this, 'get_stockbar_setting']
        ]);

        // Add new endpoint for setting active stock bar
        register_rest_route('wise-campaign-plugin/v1', '/stockbars/set-active', [
            'methods' => 'POST',
            'callback' => [$this, 'set_active_stockbar_endpoint'],
        ]);

        register_rest_route('wise-campaign-plugin/v1', '/pro-status', [
            'methods' => 'GET',
            'callback' => [$this, 'get_pro_status'],
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

        // Update isActive status for all stock bars
        $stockbar_ids = ['wc-stockbar-1', 'wc-stockbar-2'];
        foreach ($stockbar_ids as $id) {
            $stockbar = get_option($id, []);
            $stockbar['isActive'] = ($id === $stockbar_id);
            update_option($id, $stockbar);
        }

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

        // Retrieve each stock bar from the database and add to the array
        foreach ($defaults as $key) {
            $stockbar = get_option($key, []);
            // Add id to the stock bar settings
            $stockbar['id'] = $key;
            $stockbars[] = $stockbar;
        }

        return rest_ensure_response($stockbars);
    }

    /**
     * Save stock bar settings via REST API.
     */
    public function save_stockbar_design(WP_REST_Request $request)
    {
        $settings = $request->get_json_params();
        $design_id = $settings['id'] ?? '';

        if (!$design_id) {
            return rest_ensure_response(['success' => false, 'message' => 'ID not specified']);
        }

        $stockbar = get_option($design_id);
        if (!$stockbar) {
            return rest_ensure_response(['success' => false, 'message' => 'Stock bar design not found']);
        }

        // Common properties
        $common_properties = [
            'type' => 'sanitize_text_field',
            'progressBgColor' => 'sanitize_hex_color',
            'backgroundColor' => 'sanitize_hex_color',
            'textColor' => 'sanitize_hex_color',
            'borderColor' => 'sanitize_hex_color',
            'isActive' => null
        ];

        foreach ($common_properties as $prop => $sanitize_callback) {
            if (isset($settings[$prop])) {
                if ($sanitize_callback) {
                    $stockbar[$prop] = $sanitize_callback($settings[$prop]);
                } else {
                    $stockbar[$prop] = $settings[$prop];
                }
            }
        }

        // Handle isActive separately
        if (isset($settings['isActive']) && $settings['isActive']) {
            $this->set_active_stockbar($design_id);
        }

        // Type-specific properties
        if ($settings['type'] === 'solid' && isset($settings['progressColor'])) {
            $stockbar['progressColor'] = sanitize_hex_color($settings['progressColor']);
        }

        if ($settings['type'] === 'gradient') {
            if (isset($settings['progressStartColor'])) {
                $stockbar['progressStartColor'] = sanitize_hex_color($settings['progressStartColor']);
            }
            if (isset($settings['progressEndColor'])) {
                $stockbar['progressEndColor'] = sanitize_hex_color($settings['progressEndColor']);
            }
        }

        update_option($design_id, $stockbar);
        return rest_ensure_response(['success' => true, 'message' => 'Stock bar settings updated successfully']);
    }

    public function get_pro_status()
    {
        // For demonstration, we'll assume the pro version is always active.
        // In a real scenario, you would check the actual license status.
        $is_pro_active = false;
        $has_pro_installed = is_plugin_active('wisecampaign-pro/wisecampaign-pro.php'); // Replace with actual check

        if ($has_pro_installed) {
            $url = home_url('/wp-json/wise-campaign-plugin/v1/license-status');

            $response = wp_remote_get($url, ['timeout' => 20]);

            if (is_wp_error($response)) {
                $is_pro_active = false;
            }

            $data = json_decode(wp_remote_retrieve_body($response), true);

            if (isset($data['status']) && $data['status'] === 'active') {
                $is_pro_active = true;
            }
        }


        return rest_ensure_response([
            'isProActive' => $is_pro_active
        ]);
    }

    /**
     * Update stock bars setting.
     */
    public function update_stockbar_setting(WP_REST_Request $request)
    {
        // Retrieve the current settings
        $settings = get_option('wc-stockbar-setting', []);

        // Check if the 'displayOnShopPage' is provided in the request and sanitize it
        if (isset($request['displayOnShopPage'])) {
            $settings['displayOnShopPage'] = rest_sanitize_boolean($request['displayOnShopPage']);
        }

        // Check if the 'displayOnProductPage' is provided in the request and sanitize it
        if (isset($request['displayOnProductPage'])) {
            $settings['displayOnProductPage'] = rest_sanitize_boolean($request['displayOnProductPage']);
        }

        // Save the updated settings
        update_option('wc-stockbar-setting', $settings);

        return rest_ensure_response(['success' => true, 'message' => 'Stock bar settings updated successfully']);
    }

    public function set_active_stockbar($stockbarId)
    {
        update_option('activeWiseStockbarId', $stockbarId);
    }

    public function get_active_stockbar()
    {
        return get_option('activeWiseStockbarId', null);
    }


    /**
     * Retrieve stock bars setting.
     */
    public function get_stockbar_setting(WP_REST_Request $request)
    {
        // Retrieve the settings from the database
        $settings = get_option('wc-stockbar-setting', []);

        // Return the settings as a response
        return rest_ensure_response($settings);
    }

    /**
     * Display stock bar on product page
     */
    public function cspe_custom_content()
    {

        global $product;

        // Check if stock management is enabled and stock quantity is available
        if ($product->managing_stock() && $product->get_stock_quantity() !== null) {

            $active_stock_bar_id = $this->get_active_stockbar();
            $stockbar = get_option($active_stock_bar_id, []);

            $total_sold = $product->get_total_sales();
            $stock_quantity = $product->get_stock_quantity();

            // Enqueue React script globally to avoid issues with conditional loading
            $this->enqueue_react_stockbar_script(
                $stockbar,
                $total_sold,
                $stock_quantity
            );

            // Output React container
            echo '<div id="wise-stockbar-container">Hi this is from php</div>';
        }
    }


    public function enqueue_react_stockbar_script(
        $stockbar,
        $total_sold,
        $stock_quantity
    ) {
        wp_enqueue_script(
            'wise-pro-stockbar-script',
            WISECAMPAIGN_DIR_URL . 'stock-bar-dist/assets/js/index.js',
            ['wp-element'],
            '1.0.0',
            true
        );

        wp_enqueue_style('wise-pro-stockbar-react-style', WISECAMPAIGN_DIR_URL . 'stock-bar-dist/assets/css/index.css');

        wp_localize_script(
            'wise-pro-stockbar-script',
            'wiseStockbarData',
            [
                'stockbar' => [
                    'type' => $stockbar['type'] ?? 'solid',
                    'progressBgColor' => $stockbar['progressBgColor'] ?? '#d2d2d2',
                    'progressColor' => $stockbar['progressColor'] ?? '#198038',
                    'progressStartColor' => $stockbar['progressStartColor'] ?? '#ffc83a',
                    'progressEndColor' => $stockbar['progressEndColor'] ?? '#fe4070',
                    'backgroundColor' => $stockbar['backgroundColor'] ?? '#ffffff',
                    'textColor' => $stockbar['textColor'] ?? '#000000',
                    'borderColor' => $stockbar['borderColor'] ?? '#e5e7eb',
                    'isActive' => $stockbar['isActive'] ?? false,
                ],
                'progressValue' => ($total_sold / ($total_sold + $stock_quantity)) * 100,
                'totalSold' => $total_sold,
                'availableItems' => $stock_quantity
            ]
        );
    }
}
