<?php

use WISECAMPAIGN\Classes\SalesNotification;
/*
 * Plugin Name:       wiseCampaign - WooCommerce Conversions Made Easy
 * Plugin URI:        https://wisemattic.com/wisecampaign
 * Description:       Take Your WooCommerce Store to the Next Level with wiseCampaign: Top Bar Banners, StockBar, Doscounts, Direct Checkout, Sales Notifications and More!
 * Version:           1.1.10
 * Requires at least: 5.4
 * Requires PHP:      7.4
 * Author:            Wisemattic
 * Author URI:        https://wisemattic.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wisecampaign
 * Domain Path:       /languages
 */

// Prevent direct access to the script
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Autoload required classes using Composer
require_once plugin_dir_path(__FILE__) . 'vendor/autoload.php';
require_once plugin_dir_path(__FILE__) . 'includes/features/direct-checkout.php';
require_once plugin_dir_path(__FILE__) . 'includes/features/SalesNotification.php';
require_once plugin_dir_path(__FILE__) . 'includes/features/wiseCart.php';


// Import classes from the WISECAMPAIGN namespace
use WISECAMPAIGN\Classes\Banner;
use WISECAMPAIGN\Classes\Menu;
use WISECAMPAIGN\Classes\Register;
use WISECAMPAIGN\Classes\StockBar;

/**
 * Main class for the WiseCampaign plugin
 */
class Wisecampaign
{
    // Singleton instance
    private static $instance;

    // Plugin directory path and URL
    private static $plugin_dir_path;
    private static $plugin_dir_url;

    /**
     * Get the singleton instance of the Wisecampaign class
     *
     * @return Wisecampaign
     */
    public static function get_instance()
    {
        if (!isset(self::$instance)) {
            self::$instance = new self();
            self::$instance->init();

        }
        return self::$instance;
    }

    /**
     * Initialize the plugin
     */
    private function init()
    {
        $this->include_require_files();
        $this->register_classes();
        $this->register_hooks();
        $this->appsero_init_tracker_wisecampaign();
        add_action('plugins_loaded', function () {
            // Trigger a custom action for other plugins to hook into
            do_action('plugin_a_loaded');
        });
    }

    public function appsero_init_tracker_wisecampaign()
    {

        $client = new Appsero\Client('78f49ac6-4577-4712-b9b4-2dc7a67a07f2', 'wiseCampaign', __FILE__);

        // Active insights
        $client->insights()->init();

    }

    /**
     * Include required files and set directory paths
     */
    private function include_require_files()
    {
        self::$plugin_dir_path = plugin_dir_path(__FILE__);
        self::$plugin_dir_url = plugin_dir_url(__FILE__);

        define('WISECAMPAIGN_DIR_PATH', self::$plugin_dir_path);
        define('WISECAMPAIGN_DIR_URL', self::$plugin_dir_url);
    }

    /**
     * Register necessary classes for the plugin
     */
    private function register_classes()
    {
        Menu::getInstance();
        Register::getInstance();
        Banner::getInstance();
        StockBar::getInstance();
        WISECAMPAIGN\Classes\SalesNotification::getInstance();
        WISECAMPAIGN\Features\WiseCart::getInstance();
    }

    /**
     * Register hooks for plugin activation and other actions
     */
    private function register_hooks()
    {
        register_activation_hook(__FILE__, [$this, 'wise_campaign_create_banner_table']);
        register_deactivation_hook(__FILE__, [$this, 'wise_campaign_deactivate']);
        register_uninstall_hook(__FILE__, [$this, 'uninstall']);
    }

    public static function uninstall()
    {

        require_once plugin_dir_path(__FILE__) . 'uninstall.php';
    }

    function wise_campaign_deactivate()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wc_banners';

        $json_file = site_url('wp-content/plugins/wisecampaign/includes/Database/banners.json');

        $banners = [];
        $json_data = wp_remote_get($json_file);

        if (is_wp_error($json_data)) {
            $error_message = $json_data->get_error_message();
            echo "Something went wrong: " . esc_html($error_message);
        } else {
            $body = wp_remote_retrieve_body($json_data);
            $banners = json_decode($body, true);
        }

        foreach ($banners as $banner) {
            $wpdb->update(
                $table_name,
                ['is_active' => 0],
                ['id' => $banner['id']]
            );
        }
    }

    /**
     * Create the banner table in the database on plugin activation
     */
    public function wise_campaign_create_banner_table()
    {
        Banner::getInstance()->create_banner_table();
        StockBar::getInstance()->initialize_stockbar_defaults();
    }
}

// Initialize the plugin
Wisecampaign::get_instance();