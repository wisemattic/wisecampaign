<?php

use WISECAMPAIGN\Classes\SalesNotification;

/*
 * Plugin Name:       wiseCampaign - WooCommerce Conversions Made Easy
 * Plugin URI:        https://wisemattic.com/wisecampaign
 * Description:       Take Your WooCommerce Store to the Next Level with wiseCampaign: Top Bar Banners, StockBar, Doscounts, Direct Checkout, Sales Notifications and More!
 * Version:           1.3.1
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Tested up to:      7.1
 * WC requires at least: 4.0
 * WC tested up to:   11.2
 * Author:            Wisemattic
 * Author URI:        https://wisemattic.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wisecampaign
 * Domain Path:       /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

if (!defined('WISECAMPAIGN_VERSION')) {
    define('WISECAMPAIGN_VERSION', '1.3.1');
}


// Ensure plugin helper functions are available.
if (!function_exists('is_plugin_active')) {
    include_once ABSPATH . 'wp-admin/includes/plugin.php';
}

if (!function_exists('wisecampaign_is_wc_active')) {
    /**
     * Determine whether WooCommerce is active.
     *
     * @return bool
     */
    function wisecampaign_is_wc_active()
    {
        if (class_exists('WooCommerce')) {
            return true;
        }

        if (function_exists('is_plugin_active') && is_plugin_active('woocommerce/woocommerce.php')) {
            return true;
        }

        if (is_multisite()) {
            $network_plugins = get_site_option('active_sitewide_plugins', []);
            if (isset($network_plugins['woocommerce/woocommerce.php'])) {
                return true;
            }
        }

        return false;
    }
}

if (!defined('WISECAMPAIGN_HAS_WC')) {
    define('WISECAMPAIGN_HAS_WC', wisecampaign_is_wc_active());
}

// if (!WISECAMPAIGN_HAS_WC) {
//     add_action('admin_notices', 'wisecampaign_render_wc_missing_notice');
//}

/**
 * ------------------------------------------------------------------
 *  WooCommerce Compatibility Declarations for WC 10.3.5+
 * ------------------------------------------------------------------
 *  Declares compatibility with:
 *  - HPOS (custom_order_tables)
 *  - Cart & Checkout Blocks
 *  - Product Block Editor
 */
add_action('before_woocommerce_init', function () {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {

        // HPOS compatibility
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'custom_order_tables',
            __FILE__,
            true
        );

        // Cart & Checkout Blocks compatibility
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'cart_checkout_blocks',
            __FILE__,
            true
        );

        // Product Blocks compatibility
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'product_block_editor',
            __FILE__,
            true
        );
    }
});


// Autoload required classes using Composer
require_once plugin_dir_path(__FILE__) . 'vendor/autoload.php';

// Modules turned off on the Getting Started page are not loaded at all.
use WISECAMPAIGN\Classes\Modules;

// Sales Notification also runs without WooCommerce, using simulated orders.
if (Modules::is_enabled('socialproof')) {
    require_once plugin_dir_path(__FILE__) . 'includes/features/SalesNotification.php';
}

if (WISECAMPAIGN_HAS_WC) {
    if (Modules::is_enabled('checkout')) {
        require_once plugin_dir_path(__FILE__) . 'includes/features/direct-checkout.php';
    }
    if (Modules::is_enabled('wisecart')) {
        require_once plugin_dir_path(__FILE__) . 'includes/features/wiseCart.php';
    }
    // Lowercase "features": the folder name is case-sensitive on Linux servers.
    if (Modules::is_enabled('wisevideo')) {
        require_once plugin_dir_path(__FILE__) . 'includes/features/WiseVideoCommerce.php';
    }
    if (Modules::is_enabled('producttable')) {
        require_once plugin_dir_path(__FILE__) . 'includes/features/WiseProductTable.php';
    }
}

// Import classes
use WISECAMPAIGN\Classes\Banner;
use WISECAMPAIGN\Classes\BannerAnalytics;
use WISECAMPAIGN\Classes\Menu;
use WISECAMPAIGN\Classes\Register;
use WISECAMPAIGN\Classes\StockBar;
use WISECAMPAIGN\Classes\WiseBannerV2;

/**
 * Main class for the WiseCampaign plugin
 */
class Wisecampaign
{

    private static $instance;
    private static $plugin_dir_path;
    private static $plugin_dir_url;

    public static function get_instance()
    {
        if (!isset(self::$instance)) {
            self::$instance = new self();
            self::$instance->init();
        }
        return self::$instance;
    }

    private function init()
    {
        $this->include_require_files();
        $this->register_classes();
        $this->register_hooks();
        $this->appsero_init_tracker_wisecampaign();

        add_action('plugins_loaded', function () {
            do_action('plugin_a_loaded');
        });
    }

    public function appsero_init_tracker_wisecampaign()
    {
        $client = new Appsero\Client('78f49ac6-4577-4712-b9b4-2dc7a67a07f2', 'wiseCampaign', __FILE__);

        // Active insights
        $client->insights()->init();
    }

    private function include_require_files()
    {
        self::$plugin_dir_path = plugin_dir_path(__FILE__);
        self::$plugin_dir_url = plugin_dir_url(__FILE__);

        define('WISECAMPAIGN_DIR_PATH', self::$plugin_dir_path);
        define('WISECAMPAIGN_DIR_URL', self::$plugin_dir_url);
    }

    private function register_classes()
    {
        Menu::getInstance();
        Register::getInstance();
        Banner::getInstance();

        // Initialize Modular System
        $module_manager = \WISECAMPAIGN\Classes\Modular\ModuleManager::get_instance();
        $module_manager->register_module('wise-stock-bar', [
            'name' => 'wiseStockBar',
            'menu_slug' => 'wise_stock_bar'
        ]);

        $module_manager->register_module('wise-banner-v2', [
            'name' => 'wiseBannerV2',
            'menu_slug' => 'wise_banner_v2'
        ]);

        $module_manager->register_module('getting-started', [
            'name' => 'Getting Started',
            'menu_slug' => 'wisecampaign_getting_started'
        ]);

        $module_manager->register_module('wise-analytics', [
            'name' => 'Analytics',
            'menu_slug' => 'wisecampaign_analytics',
            'dev_port' => 5179
        ]);

        $module_manager->register_module('wise-video-commerce', [
            'name' => 'WiseVideo Commerce',
            'menu_slug' => 'wise_video_commerce',
            'dev_port' => 5174
        ]);

        $module_manager->register_module('wise-product-table', [
            'name' => 'Wise Product Table',
            'menu_slug' => 'wise_product_table',
            'dev_port' => 5175
        ]);

        $module_manager->register_module('wise-direct-checkout', [
            'name' => 'Direct Checkout',
            'menu_slug' => 'wisecampaign_checkout',
            'dev_port' => 5176
        ]);

        $module_manager->register_module('wise-sales-notification', [
            'name' => 'Sales Notification',
            'menu_slug' => 'wisecampaign_notification',
            'dev_port' => 5177
        ]);

        $module_manager->register_module('wise-cart', [
            'name' => 'wiseCart',
            'menu_slug' => 'wisecampaign_cart',
            'dev_port' => 5178
        ]);

        Modules::getInstance();
        // Store-wide analytics for every module; always on, modules that are off simply report nothing
        WISECAMPAIGN\Classes\Analytics::getInstance();

        if (Modules::is_enabled('socialproof')) {
            WISECAMPAIGN\Classes\SalesNotification::getInstance();
        }

        if (WISECAMPAIGN_HAS_WC) {
            if (Modules::is_enabled('stockbar')) {
                StockBar::getInstance();
            }
            if (Modules::is_enabled('wisecart')) {
                WISECAMPAIGN\Features\WiseCart::getInstance();
            }
            if (Modules::is_enabled('producttable')) {
                \WISECAMPAIGN\Features\WiseProductTable::getInstance();
            }
        }

        // Pages keep their [product_table] shortcodes while the module is off: print nothing instead of the raw tag
        if (!Modules::is_enabled('producttable')) {
            add_shortcode('product_table', '__return_empty_string');
        }

        if (Modules::is_enabled('banner')) {
            WiseBannerV2::getInstance();
            BannerAnalytics::getInstance();
        }

        if (WISECAMPAIGN_HAS_WC && Modules::is_enabled('wisevideo')) {
            \WISECAMPAIGN\Features\WiseVideoCommerce::getInstance();
        }
    }

    private function register_hooks()
    {
        $this->on_activation();
        // register_activation_hook(__FILE__, [$this, 'on_activation']);
        register_deactivation_hook(__FILE__, [$this, 'wise_campaign_deactivate']);
        register_uninstall_hook(__FILE__, ['Wisecampaign', 'uninstall']);
    }

    /**
     * Runs during plugin activation.
     *
     * @return void
     */
    public function on_activation()
    {
        // if (!WISECAMPAIGN_HAS_WC) {
        //     deactivate_plugins(plugin_basename(__FILE__));
        //     wp_die(
        //         esc_html__('wiseCampaign requires WooCommerce to be installed and active before it can be enabled.', 'wisecampaign'),
        //         esc_html__('Missing dependency', 'wisecampaign'),
        //         ['back_link' => true]
        //     );
        // }

        $this->wise_campaign_create_banner_table();
    }

    public static function uninstall()
    {
        require_once plugin_dir_path(__FILE__) . 'uninstall.php';
    }

    function wise_campaign_deactivate()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wc_banners';

        $json_file = WISECAMPAIGN_DIR_PATH . 'includes/Database/banners.json';
        $banners = [];

        if (file_exists($json_file)) {
            $body = file_get_contents($json_file);
            $banners = json_decode($body, true) ?: [];
        }

        foreach ($banners as $banner) {
            $wpdb->update(
                $table_name,
                ['is_active' => 0],
                ['id' => $banner['id']]
            );
        }
    }

    public function wise_campaign_create_banner_table()
    {
        Banner::getInstance()->create_banner_table();
        // Creating these instances adds their storefront hooks, so modules that are off are skipped.
        // Their defaults are written on the first request after they are turned on.
        // if (WISECAMPAIGN_HAS_WC) {
        if (Modules::is_enabled('stockbar')) {
            StockBar::getInstance()->initialize_stockbar_defaults();
        }
        if (Modules::is_enabled('banner')) {
            WiseBannerV2::getInstance()->initialize_defaults();
        }
        // }
    }
}

// Initialize plugin
Wisecampaign::get_instance();
