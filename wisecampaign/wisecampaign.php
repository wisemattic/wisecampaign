<?php

use WISECAMPAIGN\Classes\SalesNotification;

/*
 * Plugin Name:       wiseCampaign - WooCommerce Conversions Made Easy
 * Plugin URI:        https://wisemattic.com/wisecampaign
 * Description:       Take Your WooCommerce Store to the Next Level with wiseCampaign: Top Bar Banners, StockBar, Doscounts, Direct Checkout, Sales Notifications and More!
 * Version:           1.1.15
 * Requires at least: 5.4
 * Requires PHP:      7.4
 * Tested up to:      6.9
 * WC requires at least: 4.0
 * WC tested up to: 10.4.9
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

if (WISECAMPAIGN_HAS_WC) {
    require_once plugin_dir_path(__FILE__) . 'includes/features/direct-checkout.php';
    require_once plugin_dir_path(__FILE__) . 'includes/features/SalesNotification.php';
    require_once plugin_dir_path(__FILE__) . 'includes/features/wiseCart.php';
}

// Import classes
use WISECAMPAIGN\Classes\Banner;
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

        if (WISECAMPAIGN_HAS_WC) {
            StockBar::getInstance();
            WISECAMPAIGN\Classes\SalesNotification::getInstance();
            WISECAMPAIGN\Features\WiseCart::getInstance();
        }

        WiseBannerV2::getInstance();
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
        // if (WISECAMPAIGN_HAS_WC) {
        StockBar::getInstance()->initialize_stockbar_defaults();
        WiseBannerV2::getInstance()->initialize_defaults();
    // }
    }
}

// Initialize plugin
Wisecampaign::get_instance();
