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

        wp_enqueue_style('wise_campaign_pro-style', WISECAMPAIGN_DIR_URL.'build/index.css');
        wp_enqueue_script('wise_campaign_pro-script', WISECAMPAIGN_DIR_URL.'build/index.js', array('wp-element'),
            '1.0.0', true);

        // Load dashboard CSS for the main dashboard page
        if (strpos($hook, 'wisecampaign_menu') !== false || strpos($hook, 'wisecampaign_banner') !== false) {
            wp_enqueue_style('wisecampaign-dashboard-style', WISECAMPAIGN_DIR_URL . 'includes/css/wisecart-admin-settings.css', [], '1.0.0');
        }

        // Localize the script with data
        wp_localize_script('wise_campaign_pro-script', 'wiseCampaignPageData', array(
                'wiseCampaignUrl' => WISECAMPAIGN_DIR_URL,
                'isWooCommerceExists' => class_exists( 'WooCommerce' )
            ));

    }

    function wisecampaign_enqueue_scripts()
    {

        wp_enqueue_script('wisecampaign-script', WISECAMPAIGN_DIR_URL.'build/index.js', array('wp-element'),
            '1.0.0', true);
        wp_enqueue_style('wise_campaign_pro-style', WISECAMPAIGN_DIR_URL.'build/index.css');

        $activeBannerData = Banner::getInstance()->get_active_banner_data();
        wp_localize_script('wisecampaign-script', 'wiseCampaignCustomize', $activeBannerData->data);
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