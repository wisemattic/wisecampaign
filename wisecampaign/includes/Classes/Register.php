<?php

namespace WISECAMPAIGN\Classes;

use WISECAMPAIGN\Traits\SingletonTrait;


class Register
{
    use SingletonTrait;

    public function __construct()
    {
        add_action('admin_enqueue_scripts', [$this, 'wisecampaign_pages_enqueue_scripts']);
        if (get_option('wisecampaign_plugin_enabled') == '1') {
            add_action('wp_enqueue_scripts', [$this, 'wisecampaign_enqueue_scripts']);
            add_action('wp_enqueue_scripts', [$this, 'wisecampaign_plugin_enqueue_styles']);
        }
    }

    function wisecampaign_pages_enqueue_scripts($hook)
    {
        echo '<script> document.documentElement.style.setProperty("--wpadminbar-top", "0"); </script>';

        // Load dashboard CSS for the main dashboard page
        if (strpos($hook, 'wisecampaign_menu') !== false || strpos($hook, 'wisecampaign_banner') !== false) {
            wp_enqueue_style('wisecampaign-dashboard-style', WISECAMPAIGN_DIR_URL . 'includes/css/wisecart-admin-settings.css', [], '1.0.0');
        }
    }

    public function get_pro_status()
    {
        // For demonstration, we'll assume the pro version is always active.
        // In a real scenario, you would check the actual license status.
        $is_pro_active = false;
        $has_pro_installed = is_plugin_active('wisecampaign-pro/wisecampaign-pro.php'); // Replace with actual check

        if ($has_pro_installed && class_exists('WISECAMPAIGNPRO\Classes\ProPluginLicense')) {
            $is_pro_active = \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
        }


        return $is_pro_active;
    }

    function wisecampaign_enqueue_scripts()
    {
        // New modular system handles enqueuing via ModuleManager
    }

    // Define a function to enqueue styles
    function wisecampaign_plugin_enqueue_styles()
    {
        // Enqueue the stylesheet
        wp_enqueue_style('wisecampaign-style');
        wp_enqueue_style('google-fonts',
            'https://fonts.googleapis.com/css2?family=Inter&family=Kreon:wght@700&Rubik+Scribble&display=swap', array(),
            null);
    }

}