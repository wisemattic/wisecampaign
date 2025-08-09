<?php

namespace WISECAMPAIGN\Classes;

use WISECAMPAIGN\Traits\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;

class Menu
{
    use SingletonTrait;
    private $option_name = 'wisecampaign_plugin_enabled';

    private $is_pro_version = false;

    public function __construct()
    {
        add_action('admin_menu', [$this, 'wisecampaign_admin_menu']);
        add_action('rest_api_init', [$this, 'register_settings']);
        add_shortcode('wise_banner', [$this, 'wise_banner_shortcode']);

        $pro_installed = has_action('wise_campaign_check_pro');
        if ($pro_installed) {
            $this->is_pro_version = true;
        }

        if(strtolower(get_option('banner_position')) == 'bottom' && $this->is_pro_version == true) {
            add_action('wp_footer', function(){
                $this -> wise_campaign_pro_banner_show( true, get_option('banner_type') == 'sticky');
            });
        } else {
            add_action('wp_head', function(){
                $this -> wise_campaign_pro_banner_show( false, get_option('banner_type') == 'sticky');
            });
        };
    }

    public function register_settings()
    {
        // register_setting('wisecampaign_plugin_settings', $this->option_name);
        register_rest_route('wise-campaign-plugin/v1', '/setting', [
            'methods' => 'GET',
            'callback' => function () {
                return ['enabled' => get_option('wisecampaign_plugin_enabled') == '1'];
            },
        ]);
    
        register_rest_route('wise-campaign-plugin/v1', '/setting', [
            'methods' => 'POST',
            'callback' => function (WP_REST_Request $request) {
                $enabled = $request->get_json_params()['enabled'];
                update_option('wisecampaign_plugin_enabled', $enabled ? '1' : '0');
                return ['enabled' => $enabled];
            },
        ]);

        // registe selected theme
        register_rest_route('wisecampaign-plugin-theme/v1', '/setting', [
            'methods' => 'GET',
            'callback' => function () {
                return ['selected_banner' => get_option('wisecampaign_selected_banner') ];
            },
        ]);
    
        register_rest_route('wisecampaign-plugin-theme/v1', '/setting', [
            'methods' => 'POST',
            'callback' => function (WP_REST_Request $request) {
                $selected_banner = $request->get_json_params()['selected_banner'];
                update_option('wisecampaign_selected_banner', $selected_banner ? $selected_banner : 'default');
                return ['selected_banner' => $selected_banner];
            },
        ]);

        register_rest_route('wise-campaign-plugin/v1', '/plugin-version', [
            'methods' => 'GET',
            'callback' => function () {

                return new WP_REST_Response(['is_pro_version' => $this->is_pro_version ], 200);
            },
            'permission_callback' => '__return_true'
        ]);
    }

    // Add WiseCampaign Menu to Admin Dashboard
    function wisecampaign_admin_menu()
    {
        add_menu_page(
            'WiseCampaign',           
            'WiseCampaign',           
            'manage_options',         
            'wisecampaign_menu',      
            [$this, 'wisecampaign_getting_started_page'],
            'dashicons-megaphone',  
            30                        
        );

        add_submenu_page(
            'wisecampaign_menu',     
            'Dashboard',        
            'Dashboard',        
            'manage_options',         
            'wisecampaign_menu',
            [$this, 'wisecampaign_getting_started_page']
        );

        add_submenu_page(
            'wisecampaign_menu',     
            'wiseBanner',               
            'wiseBanner',               
            'manage_options',         
            'wisecampaign_banner',  
            [$this, 'wisecampaign_banner_page']
        );

        add_submenu_page(
            'wisecampaign_menu',     
            'Stock Bar',               
            'Stock Bar',               
            'manage_options',         
            'wisecampaign_stockbar',  
            [$this, 'wisecampaign_stockbar_page']
        );

        add_submenu_page(
            'wisecampaign_menu',     
            'Direct Checkout',               
            'Direct Checkout',               
            'manage_options',         
            'wisecampaign_checkout',  
            'wisecampaign_direct_checkout_settings_page'
        );

        add_submenu_page(
            'wisecampaign_menu',     
            'Sales Notification',               
            'Sales Notification',               
            'manage_options',         
            'wisecampaign_notification',  
            [$this, 'wisecampaign_notification_page']
        );

        add_submenu_page(
            'wisecampaign_menu',     
            'wiseCart',               
            'wiseCart',               
            'manage_options',         
            'wisecampaign_cart',  
            [$this, 'wisecampaign_cart_page']
        );

        // add_submenu_page(
        //     'wisecampaign_menu',     
        //     'Settings',               
        //     'Settings',               
        //     'manage_options',         
        //     'wisecampaign_settings',  
        //     [$this, 'wisecampaign_settings_page']
        // );
    }

    // Add callback functions for new pages
    function wisecampaign_banner_page() {
        echo "<div id='wisecampaign-banner-page-app'></div>";
    }

    function wisecampaign_stockbar_page() {
        echo "<div id='wisecampaign-stockbar-page-app'></div>";
    }

    function wisecampaign_checkout_page() {
        echo "<div id='wisecampaign-checkout-page-app'></div>";
    }

    function wisecampaign_notification_page() {
        echo "<div id='wisecampaign-notification-page-app'></div>";
    }

    function wisecampaign_cart_page() {
        echo "<div id='wisecampaign-cart-page-app'></div>";
    }

    // Callback function to display the WiseCampaign menu page
    function wisecampaign_menu_page()
    {
        // Add your code to display the WiseCampaign menu page content
        echo '<h1>WiseCampaign Menu Page</h1>';
    }



    function wise_banner_shortcode() {
        return '<div id="wise-campaign-banner-show11"></div>';
    }

    function wise_campaign_pro_banner_show($isFooter, $isSticky) {
        if($isFooter && $isSticky)
            echo '<div id="wise-campaign-banner-show" class="bottomSticky" ></div>';
        else if($isSticky)
            echo '<div id="wise-campaign-banner-show" class="topSticky" ></div>';
        else
            echo '<div id="wise-campaign-banner-show"></div>';
    }


    // Callback functions to display sub-menu pages
    function wisecampaign_getting_started_page()
    {
        // Add your code to display the Getting Started page content
        echo "<div id='wisecampaign-getting-started-page-app'></div>";
    }

    function wisecampaign_settings_page()
    {
        if (!defined('WISECAMPAIGN_PRO_VERSION_ACTIVE') || !WISECAMPAIGN_PRO_VERSION_ACTIVE) {
            echo "<div id='wisecampaign-setting-page-admin-app'>Free</div>";
        } else {
            echo "<div id='wisecampaign-page-app'>Pro</div>";
        }

    }
}
