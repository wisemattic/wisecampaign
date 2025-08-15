<?php

use WISECAMPAIGN\Classes\SalesNotification;
/*
 * Plugin Name:       wiseCampaign - Powerful WooCommerce Add-ons to Boost Conversions
 * Plugin URI:        https://wisemattic.com/wisecampaign
 * Description:       Take Your WooCommerce Store to the Next Level with wiseCampaign: High-Converting Top Bar Banners, StockBar, Direct Checkout, Sales Notifications and More!
 * Version:           1.1.6
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
        // Check if instance already exists
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
        add_action('plugins_loaded', function() {
            // Plugin A is fully loaded, now trigger a custom action for Plugin B to hook into
            do_action('plugin_a_loaded'); 
        });
    }

    public function appsero_init_tracker_wisecampaign() {

        $client = new Appsero\Client( '78f49ac6-4577-4712-b9b4-2dc7a67a07f2', 'wiseCampaign', __FILE__ );

        // Active insights
        $client->insights()->init();

    }

    /**
     * Include required files and set directory paths
     */
    private function include_require_files()
    {
        // Set the plugin directory path and URL
        self::$plugin_dir_path = plugin_dir_path(__FILE__);
        self::$plugin_dir_url = plugin_dir_url(__FILE__);

        // Define constants for easy access throughout the plugin
        define('WISECAMPAIGN_DIR_PATH', self::$plugin_dir_path);
        define('WISECAMPAIGN_DIR_URL', self::$plugin_dir_url);
    }

    /**
     * Register necessary classes for the plugin
     */
    private function register_classes()
    {
        Menu::getInstance(); // Initialize the Menu class
        Register::getInstance(); // Initialize the Register class
        Banner::getInstance(); // Initialize the Banner class
        StockBar::getInstance();
        WISECAMPAIGN\Classes\SalesNotification::getInstance();
    }

    /**
     * Register hooks for plugin activation and other actions
     */
    private function register_hooks()
    {
        // Register activation hook to create the banner table
        register_activation_hook(__FILE__, [$this, 'wise_campaign_create_banner_table']);
        register_deactivation_hook(__FILE__, [$this, 'wise_campaign_deactivate']);
        register_uninstall_hook( __FILE__, [$this, 'uninstall' ] );
    }

    public static function uninstall() {

        require_once plugin_dir_path( __FILE__ ) . 'uninstall.php';
    }

    function wise_campaign_deactivate() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wc_banners';

        $json_file = site_url('wp-content/plugins/wisecampaign/includes/Database/banners.json');

        $banners = [];
        // Read the file contents
        $json_data = wp_remote_get($json_file);

        if (is_wp_error($json_data)) {
            // Handle the error
            $error_message = $json_data->get_error_message();
            echo "Something went wrong: ".esc_html($error_message);
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
        // Call the create_banner_table method from the Banner class
        Banner::getInstance()->create_banner_table();
        StockBar::getInstance()->initialize_stockbar_defaults();
    }
}

// Initialize the plugin by creating an instance of the Wisecampaign class
Wisecampaign::get_instance();
