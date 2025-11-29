<?php

namespace WISECAMPAIGN\Classes;

use WP_REST_Request;
use WP_REST_Response;
use WISECAMPAIGN\Traits\SingletonTrait;

class Menu
{
    use SingletonTrait;
    private $option_name = 'wisecampaign_plugin_enabled';

    public function __construct()
    {
        add_action('admin_menu', [$this, 'wisecampaign_admin_menu']);
        add_action('admin_menu', [$this, 'add_help_and_upgrade_menus'], 999); // Run after Pro plugin menus
        add_action('admin_head', [$this, 'add_menu_link_styles']);
        add_filter('plugin_action_links_wisecampaign/wisecampaign.php', [$this, 'add_plugin_action_links']);
        add_action('rest_api_init', [$this, 'register_settings']);
        add_shortcode('wise_banner', [$this, 'wise_banner_shortcode']);

        if (strtolower(get_option('banner_position')) == 'bottom') {
            add_action('wp_footer', function () {
                $this->wise_campaign_pro_banner_show(true, get_option('banner_type') == 'sticky');
            });
        } else {
            add_action('wp_head', function () {
                $this->wise_campaign_pro_banner_show(false, get_option('banner_type') == 'sticky');
            });
        }
        ;
    }

    public function register_settings()
    {
        register_rest_route('wise-campaign-plugin/v1', '/setting', [
            'methods' => 'GET',
            'callback' => function () {
                return ['enabled' => get_option('wisecampaign_plugin_enabled') == '1'];
            },
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('wise-campaign-plugin/v1', '/setting', [
            'methods' => 'POST',
            'callback' => function (WP_REST_Request $request) {
                $enabled = $request->get_json_params()['enabled'];
                update_option('wisecampaign_plugin_enabled', $enabled ? '1' : '0');
                return ['enabled' => $enabled];
            },
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('wisecampaign-plugin-theme/v1', '/setting', [
            'methods' => 'GET',
            'callback' => function () {
                return ['selected_banner' => get_option('wisecampaign_selected_banner')];
            },
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('wisecampaign-plugin-theme/v1', '/setting', [
            'methods' => 'POST',
            'callback' => function (WP_REST_Request $request) {
                $selected_banner = $request->get_json_params()['selected_banner'];
                update_option('wisecampaign_selected_banner', $selected_banner ? $selected_banner : 'default');
                return ['selected_banner' => $selected_banner];
            },
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('wise-campaign-plugin/v1', '/plugin-version', [
            'methods' => 'GET',
            'callback' => function () {
                return new WP_REST_Response(['is_pro_version' => Register::getInstance()->get_pro_status()], 200);
            },
            'permission_callback' => '__return_true'
        ]);
    }

    function wisecampaign_admin_menu()
    {
        $icon_path = WISECAMPAIGN_DIR_URL . 'images/fe/wc_logo.png';
        add_menu_page('WiseCampaign', 'WiseCampaign', 'manage_options', 'wisecampaign_menu', [$this, 'wisecampaign_getting_started_page'], $icon_path, 30);
        add_submenu_page('wisecampaign_menu', 'Dashboard', 'Dashboard', 'manage_options', 'wisecampaign_menu', [$this, 'wisecampaign_getting_started_page']);
        add_submenu_page('wisecampaign_menu', 'wiseBanner', 'wiseBanner', 'manage_options', 'wisecampaign_banner', [$this, 'wisecampaign_banner_page']);
        $this->add_wc_dependent_submenu(
            'wisecampaign_menu',
            __('Stockbar', 'wisecampaign'),
            __('Stockbar', 'wisecampaign'),
            'wisecampaign_stockbar',
            [$this, 'wisecampaign_stockbar_page']
        );
        $this->add_wc_dependent_submenu(
            'wisecampaign_menu',
            __('Direct Checkout', 'wisecampaign'),
            __('Direct Checkout', 'wisecampaign'),
            'wisecampaign_checkout',
            'wisecampaign_direct_checkout_settings_page'
        );

        $sales_callback = (defined('WISECAMPAIGN_HAS_WC') && WISECAMPAIGN_HAS_WC)
            ? [SalesNotification::getInstance(), 'render_admin_page']
            : '__return_null';
        $this->add_wc_dependent_submenu(
            'wisecampaign_menu',
            __('Sales Notification', 'wisecampaign'),
            __('Sales Notification', 'wisecampaign'),
            'wisecampaign_notification',
            $sales_callback
        );

        $this->add_wc_dependent_submenu(
            'wisecampaign_menu',
            __('wiseCart', 'wisecampaign'),
            __('wiseCart', 'wisecampaign'),
            'wisecampaign_cart',
            [$this, 'wisecampaign_cart_page']
        );
    }

    /**
     * Add Help and Upgrade to Pro menus at the end (after Pro plugin menus)
     */
    function add_help_and_upgrade_menus()
    {
        // Add Help submenu that redirects to support page
        add_submenu_page(
            'wisecampaign_menu',
            __('Help', 'wisecampaign'),
            __('Help', 'wisecampaign'),
            'manage_options',
            'wisecampaign_help',
            [$this, 'wisecampaign_help_redirect']
        );

        // Add Upgrade to Pro submenu linking to pricing page only if Pro is not active
        if (!$this->is_pro_active()) {
            add_submenu_page(
                'wisecampaign_menu',
                __('Upgrade to Pro', 'wisecampaign'),
                __('Upgrade to Pro', 'wisecampaign'),
                'manage_options',
                'wisecampaign_upgrade',
                [$this, 'wisecampaign_upgrade_redirect']
            );
        }
    }

    /**
     * Check if wiseCampaign Pro plugin is active
     *
     * @return bool True if Pro plugin is active
     */
    private function is_pro_active()
    {
        // Check if Pro constant is defined and active
        if (defined('WISECAMPAIGN_PRO_VERSION_ACTIVE') && WISECAMPAIGN_PRO_VERSION_ACTIVE) {
            return true;
        }

        // Check if Pro plugin is installed and active
        if (!function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        return is_plugin_active('wisecampaign-pro/wisecampaign-pro.php');
    }

    /**
     * Add action links (Docs, Help, Upgrade to Pro) on plugins.php page
     *
     * @param array $links Existing plugin action links
     * @return array Modified plugin action links
     */
    function add_plugin_action_links($links)
    {
        // Add Docs link
        $docs_link = '<a href="https://wisemattic.com/docs/wisecampaign/getting-started/" target="_blank">' . __('Docs', 'wisecampaign') . '</a>';
        array_push($links, $docs_link);

        // Add Help link
        $help_link = '<a href="https://wisemattic.com/support/" target="_blank" style="color: #dc3232; font-weight: bold;">' . __('Help', 'wisecampaign') . '</a>';
        array_push($links, $help_link);

        // Add Upgrade to Pro link only if Pro is not active
        if (!$this->is_pro_active()) {
            $upgrade_link = '<a href="https://wisemattic.com/wisecampaign/pricing" target="_blank" style="color: #0a8d48; font-weight: bold;">' . __('Upgrade to Pro', 'wisecampaign') . '</a>';
            array_push($links, $upgrade_link);
        }

        return $links;
    }

    /**
     * Add a submenu that requires WooCommerce.
     *
     * @param string       $parent_slug
     * @param string       $page_title
     * @param string       $menu_title
     * @param string       $menu_slug
     * @param callable|string $callback
     */
    private function add_wc_dependent_submenu($parent_slug, $page_title, $menu_title, $menu_slug, $callback)
    {
        $feature_label = $menu_title;

        if (defined('WISECAMPAIGN_HAS_WC') && WISECAMPAIGN_HAS_WC) {
            add_submenu_page($parent_slug, $page_title, $menu_title, 'manage_options', $menu_slug, $callback);
            return;
        }

        add_submenu_page(
            $parent_slug,
            $page_title,
            $menu_title,
            'manage_options',
            $menu_slug,
            function () use ($feature_label) {
                $this->render_wc_missing_feature_notice($feature_label);
            }
        );
    }

    /**
     * Output a helpful message for WooCommerce-dependent screens.
     *
     * @param string $feature_label
     */
    private function render_wc_missing_feature_notice($feature_label = '')
    {
        $feature_label = $feature_label ?: __('This feature', 'wisecampaign');
        ?>
        <div class="wrap wisecampaign-requires-woocommerce">
            <h1><?php esc_html_e('WooCommerce Required', 'wisecampaign'); ?></h1>
            <div class="notice notice-error">
                <p>
                    <?php
                    printf(
                        /* translators: %s: Feature label */
                        esc_html__('%s can only be used when WooCommerce is installed and active.', 'wisecampaign'),
                        esc_html($feature_label)
                    );
                    ?>
                </p>
            </div>
            <p>
                <a
                    href="<?php echo esc_url(admin_url('plugin-install.php?s=woocommerce&tab=search&type=term')); ?>"
                    class="button button-primary"
                >
                    <?php esc_html_e('Install WooCommerce', 'wisecampaign'); ?>
                </a>
                <a href="<?php echo esc_url(admin_url('plugins.php')); ?>" class="button">
                    <?php esc_html_e('Activate WooCommerce', 'wisecampaign'); ?>
                </a>
            </p>
        </div>
        <?php
    }

    function wisecampaign_banner_page()
    {
        ?>
                        <div id="wisecampaign-banner-page-app"></div>
        <?php
    }
    function wisecampaign_stockbar_page()
    {
        echo "<div id='wisecampaign-stockbar-page-app'></div>";
    }
    function wisecampaign_checkout_page()
    {
        echo "<div id='wisecampaign-checkout-page-app'></div>";
    }

    function wisecampaign_notification_page()
    {
    }

    function wisecampaign_cart_page()
    {
        ?>
        <div class="wrap wisecart-settings-wrap">
            <form id="wisecart-settings-form" method="post">
                <?php
                wp_nonce_field('wisecart_save_action', 'wisecart_settings_nonce');

                do_settings_sections('wisecampaign_cart');
                ?>
                <div class="wisecart-settings-actions">
                    <button type="submit" id="wisecart-save-btn" class="button button-primary">
                        <?php _e('Save Changes', 'wisecampaign'); ?>
                    </button>
                    <span class="wisecart-save-feedback"></span>
                    <span class="spinner"></span>
                </div>
            </form>
        </div>
        <?php
    }
    function wisecampaign_menu_page()
    {
        echo '<h1>WiseCampaign Menu Page</h1>';
    }
    function wise_banner_shortcode()
    {
        return '<div id="wise-campaign-banner-show"></div>';
    }

    function wise_campaign_pro_banner_show($isFooter, $isSticky)
    {
        if ($isFooter && $isSticky)
            echo '<div id="wise-campaign-banner-show" class="bottomSticky" ></div>';
        else if ($isSticky)
            echo '<div id="wise-campaign-banner-show" class="topSticky" ></div>';
        else
            echo '<div id="wise-campaign-banner-show"></div>';
    }

    function wisecampaign_getting_started_page()
    {
        ?>
        <div class="wrap wisecampaign-dashboard-wrap">
            
            <!-- Main Dashboard App -->
            <div id="wisecampaign-getting-started-page-app"></div>
            
            <!-- Feature Request Section -->
            <div class="wisecampaign-feature-request-section">
                <div class="wisecampaign-feature-request-content">
                    <div class="wisecampaign-feature-request-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                        </svg>
                    </div>
                    <div class="wisecampaign-feature-request-text">
                        <h3><?php esc_html_e('Have a Feature Request?', 'wisecampaign'); ?></h3>
                        <p><?php esc_html_e('We\'d love to hear your ideas for improving wiseCampaign! Share your suggestions and vote on existing feature requests.', 'wisecampaign'); ?></p>
                    </div>
                    <div class="wisecampaign-feature-request-action">
                        <a href="https://wisecampaign.canny.io/feature-requests" target="_blank" class="button button-primary button-large">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15,3 21,3 21,9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            <?php esc_html_e('Submit Feature Request', 'wisecampaign'); ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    function wisecampaign_settings_page()
    {
        if (!defined('WISECAMPAIGN_PRO_VERSION_ACTIVE') || !WISECAMPAIGN_PRO_VERSION_ACTIVE) {
            echo "<div id='wisecampaign-setting-page-admin-app'>Free</div>";
        } else {
            echo "<div id='wisecampaign-page-app'>Pro</div>";
        }
    }

    /**
     * Redirect Help menu to support page in a new window
     */
    function wisecampaign_help_redirect()
    {
        // Immediately redirect to support page in new window
        ?>
        <script>
            (function() {
                var supportUrl = 'https://wisemattic.com/support/';
                window.open(supportUrl, '_blank');
                // Redirect current page back to dashboard
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = '<?php echo esc_js(admin_url('admin.php?page=wisecampaign_menu')); ?>';
                }
            })();
        </script>
        <div class="wrap">
            <h1><?php esc_html_e('Opening Support Page...', 'wisecampaign'); ?></h1>
            <p><?php esc_html_e('The support page should open in a new window. If it doesn\'t,', 'wisecampaign'); ?> <a href="https://wisemattic.com/support/" target="_blank"><?php esc_html_e('click here', 'wisecampaign'); ?></a>.</p>
        </div>
        <?php
    }

    /**
     * Redirect Upgrade menu to pricing page
     */
    function wisecampaign_upgrade_redirect()
    {
        // Immediately open pricing page in new window
        ?>
        <script>
            (function() {
                var pricingUrl = 'https://wisemattic.com/wisecampaign/pricing';
                window.open(pricingUrl, '_blank');
                // Redirect current page back to dashboard
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = '<?php echo esc_js(admin_url('admin.php?page=wisecampaign_menu')); ?>';
                }
            })();
        </script>
        <div class="wrap">
            <h1><?php esc_html_e('Opening Upgrade Page...', 'wisecampaign'); ?></h1>
            <p>
                <?php esc_html_e('The pricing page should open in a new window. If it doesn\'t,', 'wisecampaign'); ?>
                <a href="https://wisemattic.com/wisecampaign/pricing" target="_blank"><?php esc_html_e('click here', 'wisecampaign'); ?></a>.
            </p>
        </div>
        <?php
    }

    /**
     * Add CSS/JS tweaks for special submenu links.
     */
    function add_menu_link_styles()
    {
        ?>
        <style>
            #toplevel_page_wisecampaign_menu .wp-submenu li a[href*="wisecampaign_help"],
            #toplevel_page_wisecampaign_menu .wp-submenu li a[href*="wisecampaign_help"]:hover {
                color: #dc3232 !important;
                font-weight: bold !important;
            }
            #toplevel_page_wisecampaign_menu .wp-submenu li a[href*="wisecampaign_upgrade"],
            #toplevel_page_wisecampaign_menu .wp-submenu li a[href*="wisecampaign_upgrade"]:hover {
                color: #0a8d48 !important;
                font-weight: bold !important;
            }
        </style>
        <script>
            (function() {
                document.addEventListener('DOMContentLoaded', function() {
                    var helpLinks = document.querySelectorAll('#toplevel_page_wisecampaign_menu .wp-submenu li a[href*="wisecampaign_help"]');
                    helpLinks.forEach(function(link) {
                        link.addEventListener('click', function(e) {
                            e.preventDefault();
                            window.open('https://wisemattic.com/support/', '_blank');
                            return false;
                        });
                    });

                    var upgradeLinks = document.querySelectorAll('#toplevel_page_wisecampaign_menu .wp-submenu li a[href*="wisecampaign_upgrade"]');
                    upgradeLinks.forEach(function(link) {
                        link.addEventListener('click', function(e) {
                            e.preventDefault();
                            window.open('https://wisemattic.com/wisecampaign/pricing', '_blank');
                            return false;
                        });
                    });
                });
            })();
        </script>
        <?php
    }
}