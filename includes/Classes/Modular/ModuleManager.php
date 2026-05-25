<?php

namespace WISECAMPAIGN\Classes\Modular;

/**
 * ModuleManager
 * 
 * Handles the modular architecture for WiseCampaign features.
 * Allows registering independent React/Vite modules and enqueuing their assets.
 */
class ModuleManager
{
    private static $instance = null;
    private $modules = [];
    private $plugin_path;
    private $plugin_url;

    private function __construct()
    {
        $this->plugin_path = defined('WISECAMPAIGN_DIR_PATH') ? WISECAMPAIGN_DIR_PATH : plugin_dir_path(dirname(dirname(dirname(dirname(__FILE__)))));
        $plugin_url_full = defined('WISECAMPAIGN_DIR_URL') ? WISECAMPAIGN_DIR_URL : plugin_dir_url(dirname(dirname(dirname(dirname(__FILE__)))));
        $this->plugin_url = trailingslashit($plugin_url_full);

        // Hook into admin menu and scripts
        add_action('admin_enqueue_scripts', [$this, 'enqueue_module_assets']);
    }

    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Register a new module
     * 
     * @param string $id Unique module ID
     * @param array $config Configuration (name, menu_slug, path, etc)
     */
    public function register_module($id, $config)
    {
        $defaults = [
            'name' => '',
            'menu_slug' => $id,
            'module_path' => 'modules/' . $id,
            'entry_point' => 'src/main.jsx',
            'handle' => 'wise-' . $id . '-app',
            'dev_port' => 5173
        ];

        $this->modules[$id] = array_merge($defaults, $config);
    }

    /**
     * Get all registered modules
     */
    public function get_modules()
    {
        return $this->modules;
    }

    /**
     * Enqueue assets for a specific module if we are on its admin page
     */
    public function enqueue_module_assets($hook)
    {
        foreach ($this->modules as $id => $module) {
            // Check if we are on this module's admin page
            if (strpos($hook, $module['menu_slug']) === false) {
                continue;
            }


            // Enqueue WordPress Media
            wp_enqueue_media();

            $module_dist_path = $this->plugin_path . $module['module_path'] . '/dist/';
            $module_dist_url = $this->plugin_url . $module['module_path'] . '/dist/';

            $manifest = $this->get_manifest($module_dist_path);

            if ($manifest && isset($manifest[$module['entry_point']])) {
                $entry = $manifest[$module['entry_point']];

                // Enqueue CSS
                if (isset($entry['css'])) {
                    foreach ($entry['css'] as $css_file) {
                        wp_enqueue_style(
                            $module['handle'] . '-style-' . md5($css_file),
                            $module_dist_url . $css_file,
                            [],
                            null
                        );
                    }
                }

                // Enqueue JS
                wp_enqueue_script(
                    $module['handle'],
                    $module_dist_url . $entry['file'],
                    [],
                    null,
                    true
                );

                // Add module type
                add_filter('script_loader_tag', function ($tag, $handle, $src) use ($module) {
                    if ($handle === $module['handle']) {
                        return '<script type="module" src="' . esc_url($src) . '"></script>';
                    }
                    return $tag;
                }, 10, 3);

            } else {
                // FALLBACK: Dev mode
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    $dev_port = isset($module['dev_port']) ? $module['dev_port'] : 5173;
                    $dev_url = "http://localhost:{$dev_port}/";

                    wp_enqueue_script('vite-client-' . $id, $dev_url . '@vite/client', [], null, true);

                    wp_enqueue_script(
                        $module['handle'] . '-dev',
                        $dev_url . $module['entry_point'],
                        ['vite-client-' . $id],
                        null,
                        true
                    );

                    add_filter('script_loader_tag', function ($tag, $handle, $src) use ($module, $id) {
                        if (in_array($handle, [$module['handle'] . '-dev', 'vite-client-' . $id])) {
                            return '<script type="module" src="' . esc_url($src) . '"></script>';
                        }
                        return $tag;
                    }, 10, 3);
                }
            }

            // Localize for module
            $localization_handle = (defined('WP_DEBUG') && WP_DEBUG && !($manifest && isset($manifest[$module['entry_point']])))
                ? $module['handle'] . '-dev'
                : $module['handle'];

            if (!function_exists('is_plugin_active')) {
                require_once ABSPATH . 'wp-admin/includes/plugin.php';
            }
            $is_wc_active = class_exists('WooCommerce') || is_plugin_active('woocommerce/woocommerce.php');
            $is_wc_installed = file_exists(WP_PLUGIN_DIR . '/woocommerce/woocommerce.php');

            $wc_install_url = wp_nonce_url(
                self_admin_url('update.php?action=install-plugin&plugin=woocommerce'),
                'install-plugin_woocommerce'
            );
            $wc_activate_url = wp_nonce_url(
                self_admin_url('plugins.php?action=activate&plugin=woocommerce/woocommerce.php'),
                'activate-plugin_woocommerce/woocommerce.php'
            );

            $is_pro_active = is_plugin_active('wisecampaign-pro/wisecampaign-pro.php');
            $is_pro_installed = file_exists(WP_PLUGIN_DIR . '/wisecampaign-pro/wisecampaign-pro.php');
            $is_license_active = false;

            if ($is_pro_active && class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')) {
                $is_license_active = \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
            }

            wp_localize_script($localization_handle, 'wiseModuleData', [
                'apiUrl' => rest_url('wisecampaign/v1/'),
                'pluginUrl' => $this->plugin_url,
                'nonce' => wp_create_nonce('wp_rest'),
                'moduleId' => $id,
                'wc' => [
                    'isActive' => $is_wc_active,
                    'isInstalled' => $is_wc_installed,
                    'installUrl' => html_entity_decode($wc_install_url),
                    'activateUrl' => html_entity_decode($wc_activate_url)
                ],
                'pro' => [
                    'isInstalled' => $is_pro_installed,
                    'isActive' => $is_pro_active,
                    'isLicenseActive' => $is_license_active,
                    'licensePageUrl' => admin_url('admin.php?page=wisecampaign_plugin_license')
                ]
            ]);
        }
    }

    private function get_manifest($dist_path)
    {
        $paths = [
            $dist_path . '.vite/manifest.json',
            $dist_path . 'manifest.json'
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) {
                return json_decode(file_get_contents($path), true);
            }
        }
        return null;
    }
}
