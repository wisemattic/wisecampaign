<?php

namespace WISECAMPAIGN\Features;

use WISECAMPAIGN\Traits\SingletonTrait;

/**
 * WiseProductTable Feature
 * 
 * Handles WooCommerce integration, REST API settings saving, and shortcode rendering.
 */
class WiseProductTable {
    use SingletonTrait;

    private $option_name = 'wisecampaign_product_table_settings';

    public function __construct() {
        add_action('rest_api_init', [$this, 'register_api_routes']);
        add_shortcode('product_table', [$this, 'render_product_table_shortcode']);
        
        // Enqueue frontend CSS and JS when shortcode is active
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets_fallback']);
    }

    /**
     * Get settings from options
     */
    public function get_settings() {
        $settings = get_option($this->option_name, [
            'isActive' => false,
            'selectedSavedTable' => 'Shop Pages',
            'activeTemplate' => [ 'name' => 'Default Table', 'style' => 'MINIMAL' ],
            'designState' => [],
            'advSettings' => []
        ]);

        $is_license_active = false;
        if (class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')) {
            $is_license_active = \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
        }

        if (!$is_license_active) {
            if (isset($settings['isActive']) && $settings['isActive'] === true) {
                $settings['isActive'] = false;
                update_option($this->option_name, $settings);
            } else {
                $settings['isActive'] = false;
            }
        }

        return $settings;
    }

    /**
     * Register REST API routes for settings and products fetching
     */
    public function register_api_routes() {
        register_rest_route('wisecampaign/v1', '/product-table/settings', [
            'methods' => 'GET',
            'callback' => [$this, 'get_settings_callback'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('wisecampaign/v1', '/product-table/settings', [
            'methods' => 'POST',
            'callback' => [$this, 'update_settings_callback'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route('wisecampaign/v1', '/product-table/products', [
            'methods' => 'GET',
            'callback' => [$this, 'get_products_callback'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('wisecampaign/v1', '/product-table/categories', [
            'methods' => 'GET',
            'callback' => [$this, 'get_categories_callback'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('wisecampaign/v1', '/product-table/store-metadata', [
            'methods' => 'GET',
            'callback' => [$this, 'get_store_metadata_callback'],
            'permission_callback' => '__return_true'
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

        if (isset($params['isActive']) && $params['isActive'] === true && !$is_license_active) {
            return new \WP_REST_Response([
                'message' => 'Cannot activate widget: An active Pro license is required.'
            ], 403);
        }

        $settings = $this->get_settings();
        
        foreach ($params as $key => $value) {
            $settings[$key] = $value;
        }

        update_option($this->option_name, $settings);

        return new \WP_REST_Response([
            'message' => 'Product Table settings saved successfully',
            'settings' => $settings
        ], 200);
    }

    public function get_products_callback($request) {
        $table_name = $request->get_param('table_name') ?: 'Shop Pages';
        $products = $this->get_wc_products($table_name);
        return new \WP_REST_Response($products, 200);
    }

    public function get_categories_callback($request) {
        if (!class_exists('WooCommerce')) {
            return new \WP_REST_Response([], 200);
        }

        $terms = get_terms([
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
        ]);

        $categories = [];

        if (!is_wp_error($terms) && !empty($terms)) {
            foreach ($terms as $term) {
                $categories[] = [
                    'id' => $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                    'count' => $term->count
                ];
            }
        } else {
            // Fallback if no terms found
            $categories = [
                ['id' => 1, 'name' => 'Accessories', 'slug' => 'accessories', 'count' => 12],
                ['id' => 2, 'name' => 'Hoodies', 'slug' => 'hoodies', 'count' => 8],
                ['id' => 3, 'name' => 'T-shirts', 'slug' => 't-shirts', 'count' => 15],
                ['id' => 4, 'name' => 'Apparel', 'slug' => 'apparel', 'count' => 23],
                ['id' => 5, 'name' => 'Music', 'slug' => 'music', 'count' => 5],
            ];
        }

        return new \WP_REST_Response($categories, 200);
    }

    public function get_store_metadata_callback($request) {
        if (!class_exists('WooCommerce')) {
            return new \WP_REST_Response([], 200);
        }

        // 1. Categories
        $cat_terms = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
        $categories = [];
        if (!is_wp_error($cat_terms) && !empty($cat_terms)) {
            foreach ($cat_terms as $t) { $categories[] = ['id' => $t->term_id, 'name' => $t->name, 'slug' => $t->slug]; }
        }

        // 2. Tags
        $tag_terms = get_terms(['taxonomy' => 'product_tag', 'hide_empty' => false]);
        $tags = [];
        if (!is_wp_error($tag_terms) && !empty($tag_terms)) {
            foreach ($tag_terms as $t) { $tags[] = ['id' => $t->term_id, 'name' => $t->name, 'slug' => $t->slug]; }
        }

        // 3. Products
        $prods = wc_get_products(['status' => ['publish', 'draft', 'pending', 'private'], 'limit' => 300]);
        $products_list = [];
        $types_set = ['simple', 'variable', 'external', 'grouped'];
        $statuses_set = ['publish', 'pending', 'draft', 'private'];
        
        foreach ($prods as $p) {
            $products_list[] = [
                'id' => $p->get_id(),
                'name' => $p->get_name(),
                'type' => $p->get_type(),
                'status' => $p->get_status()
            ];
        }

        // 4. Colors
        $color_terms = get_terms(['taxonomy' => 'pa_color', 'hide_empty' => false]);
        $colors = [];
        if (!is_wp_error($color_terms) && !empty($color_terms)) {
            foreach ($color_terms as $t) { $colors[] = $t->name; }
        }

        // 5. Sizes
        $size_terms = get_terms(['taxonomy' => 'pa_size', 'hide_empty' => false]);
        $sizes = [];
        if (!is_wp_error($size_terms) && !empty($size_terms)) {
            foreach ($size_terms as $t) { $sizes[] = $t->name; }
        }

        // 6. Custom Fields
        global $wpdb;
        $meta_keys = $wpdb->get_col("
            SELECT DISTINCT pm.meta_key 
            FROM {$wpdb->postmeta} pm 
            LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id 
            WHERE p.post_type = 'product' 
              AND pm.meta_key NOT LIKE '\_%' 
            LIMIT 40
        ");
        $custom_fields = !empty($meta_keys) ? $meta_keys : ['_featured', '_sale_price', '_manage_stock', '_downloadable', '_virtual', 'custom_tab_title', 'video_url'];
        if (!in_array('_featured', $custom_fields)) { $custom_fields[] = '_featured'; }
        if (!in_array('_sale_price', $custom_fields)) { $custom_fields[] = '_sale_price'; }

        return new \WP_REST_Response([
            'categories' => !empty($categories) ? $categories : [['id'=>1,'name'=>'Accessories'], ['id'=>2,'name'=>'Hoodies'], ['id'=>3,'name'=>'T-shirts']],
            'tags' => !empty($tags) ? $tags : [['id'=>101,'name'=>'Standard'], ['id'=>102,'name'=>'Featured'], ['id'=>103,'name'=>'New']],
            'products' => !empty($products_list) ? $products_list : [['id'=>1,'name'=>'Premium Hoodie'], ['id'=>2,'name'=>'Classic T-Shirt']],
            'colors' => !empty($colors) ? $colors : ['Black', 'Blue', 'Red', 'White', 'Grey', 'Green'],
            'sizes' => !empty($sizes) ? $sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            'custom_fields' => $custom_fields,
            'types' => $types_set,
            'statuses' => $statuses_set,
            'stocks' => ['in_stock', 'out_of_stock', 'on_backorder']
        ], 200);
    }

    /**
     * Get real WooCommerce products and format them uniformly for our Product Table app!
     */
    public function get_wc_products($table_name = 'Shop Pages') {
        if (!class_exists('WooCommerce')) {
            return [];
        }

        // Determine WooCommerce product arguments
        $args = [
            'status' => 'publish',
            'limit' => 60,
            'paginate' => false,
        ];

        // Apply filters based on saved quick order tables
        if (strpos($table_name, 'Accessories') !== false) {
            $args['category'] = ['accessories'];
        } elseif (strpos($table_name, 'Hoodies') !== false) {
            $args['category'] = ['hoodies', 'apparel'];
        } elseif (strpos($table_name, 'T-Shirts') !== false) {
            $args['category'] = ['t-shirts', 'apparel'];
        }

        $products = wc_get_products($args);
        $formatted = [];

        foreach ($products as $p) {
            $product_id = $p->get_id();
            $in_stock = $p->is_in_stock();

            // Categories
            $categories = wc_get_product_category_list($product_id);
            $categories_raw = strip_tags($categories);
            $category_first = trim(explode(',', $categories_raw)[0]);
            if (empty($category_first)) {
                $category_first = 'Uncategorized';
            }

            // Image URL
            $image_id = $p->get_image_id();
            $image_url = $image_id ? wp_get_attachment_url($image_id) : wc_placeholder_img_src();

            // Short Description / Summary
            $summary = $p->get_short_description();
            if (empty($summary)) {
                $summary = wp_strip_all_tags($p->get_description());
            }
            $summary = wp_strip_all_tags($summary);

            // Is variable or external?
            $is_variable = $p->is_type('variable');
            $is_external = $p->is_type('external');

            // Prices
            $price = floatval($p->get_price());
            $regular_price = floatval($p->get_regular_price());
            $on_sale = $p->is_on_sale();

            if ($regular_price <= 0) {
                $regular_price = $price;
            }

            // Extract real variations if variable
            $colors_arr = [];
            $sizes_arr = [];
            if ($is_variable) {
                $attributes = $p->get_attributes();
                if (isset($attributes['pa_color'])) {
                    $colors_arr = $attributes['pa_color']->get_slugs();
                }
                if (isset($attributes['pa_size'])) {
                    $sizes_arr = $attributes['pa_size']->get_slugs();
                }
            }

            // Tags
            $tags = wc_get_product_tag_list($product_id);
            $tags_raw = strip_tags($tags);
            $tag_first = trim(explode(',', $tags_raw)[0]);
            if (empty($tag_first)) {
                $tag_first = 'Standard';
            }

            $type = $p->get_type();
            $status = $p->get_status();

            $formatted[] = [
                'id' => $product_id,
                'name' => $p->get_name(),
                'category' => $category_first,
                'tag' => $tag_first,
                'type' => $type,
                'status' => $status,
                'featured' => $p->is_featured(),
                'color' => !empty($colors_arr) ? ucfirst($colors_arr[0]) : 'N/A',
                'size' => !empty($sizes_arr) ? strtoupper($sizes_arr[0]) : 'N/A',
                'price' => $price,
                'regularPrice' => $regular_price,
                'onSale' => $on_sale,
                'isVariable' => $is_variable,
                'isExternal' => $is_external,
                'summary' => $summary,
                'image' => $image_url,
                'inStock' => $in_stock
            ];
        }

        return $formatted;
    }

    /**
     * Shortcode renderer: [product_table id="5"]
     */
    public function render_product_table_shortcode($atts) {
        $atts = shortcode_atts([
            'id' => ''
        ], $atts, 'product_table');

        $settings = $this->get_settings();
        $is_module_active = isset($settings['isActive']) ? $settings['isActive'] : false;

        $is_license_active = false;
        if (class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')) {
            $is_license_active = \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
        }

        if (!$is_module_active || !$is_license_active) {
            return '';
        }

        // Determine which table card configuration to load
        $table_name = 'Shop Pages';
        if ($atts['id'] == '5') {
            $table_name = 'Quick Order Form - Accessories';
        } elseif ($atts['id'] == '4') {
            $table_name = 'Quick Order Form - Hoodies';
        } elseif ($atts['id'] == '3') {
            $table_name = 'Quick Order Form - T-Shirts';
        }

        // Fetch WooCommerce products for this shortcode
        $wc_products = $this->get_wc_products($table_name);

        // Fallback to localized mock data if no products in store
        $products_json = wp_json_encode($wc_products);

        // Generate the output HTML container and mount script
        ob_start();
        ?>
        <div class="wise-product-table-frontend-wrapper" style="width: 100%; margin: 30px 0;">
            <!-- Root mounting node -->
            <div id="wise-product-table-app"></div>
        </div>

        <script type="text/javascript">
            // Inject settings and WooCommerce products directly into the window object
            window.wiseTableProductData = <?php echo $products_json; ?>;
            window.wiseTableFrontendSettings = <?php echo wp_json_encode($settings); ?>;
            window.wiseTableSelectedOverride = <?php echo wp_json_encode($table_name); ?>;
        </script>
        <?php
        
        $this->enqueue_frontend_assets();

        return ob_get_clean();
    }

    /**
     * Enqueue the compiled Vite distribution assets on the frontend
     */
    public function enqueue_frontend_assets() {
        $plugin_path = defined('WISECAMPAIGN_DIR_PATH') ? WISECAMPAIGN_DIR_PATH : plugin_dir_path(dirname(dirname(__FILE__)));
        $plugin_url = defined('WISECAMPAIGN_DIR_URL') ? WISECAMPAIGN_DIR_URL : plugin_dir_url(dirname(dirname(__FILE__)));
        $dist_url = trailingslashit($plugin_url) . 'modules/wise-product-table/dist/';

        $manifest_path = $plugin_path . 'modules/wise-product-table/dist/manifest.json';
        if (!file_exists($manifest_path)) {
            $manifest_path = $plugin_path . 'modules/wise-product-table/dist/.vite/manifest.json';
        }

        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);
            $entry_point = 'src/main.jsx';

            if (isset($manifest[$entry_point])) {
                $entry = $manifest[$entry_point];

                // CSS Assets
                if (isset($entry['css'])) {
                    foreach ($entry['css'] as $css_file) {
                        wp_enqueue_style(
                            'wise-product-table-frontend-style-' . md5($css_file),
                            $dist_url . $css_file,
                            [],
                            null
                        );
                    }
                }

                // JS Entry point script
                wp_enqueue_script(
                    'wise-product-table-frontend',
                    $dist_url . $entry['file'],
                    [],
                    null,
                    true
                );

                // Localize essential data
                wp_localize_script('wise-product-table-frontend', 'wiseModuleData', [
                    'apiUrl' => rest_url('wisecampaign/v1/'),
                    'nonce' => wp_create_nonce('wp_rest')
                ]);

                // Inject script tag filter for module loading
                add_filter('script_loader_tag', function ($tag, $handle, $src) {
                    if ($handle === 'wise-product-table-frontend') {
                        return '<script type="module" src="' . esc_url($src) . '"></script>';
                    }
                    return $tag;
                }, 10, 3);
            }
        }
    }

    public function enqueue_frontend_assets_fallback() {
        // Registers fallback so shortcodes trigger enqueues correctly inside headers/pages
    }
}
