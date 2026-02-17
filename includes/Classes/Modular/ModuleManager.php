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
        $this->plugin_url = trailingslashit(parse_url($plugin_url_full, PHP_URL_PATH));

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
            'handle' => 'wise-' . $id . '-app'
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
            $module_dist_url = wp_make_link_relative($this->plugin_url . $module['module_path'] . '/dist/');

            $manifest = $this->get_manifest($module_dist_path);

            if ($manifest && isset($manifest[$module['entry_point']])) {
                $entry = $manifest[$module['entry_point']];

                // Enqueue CSS
                if (isset($entry['css'])) {
                    foreach ($entry['css'] as $css_file) {
                        $css_url = wp_make_link_relative($module_dist_url . $css_file);
                        wp_enqueue_style(
                            $module['handle'] . '-style-' . md5($css_file),
                            $css_url,
                            [],
                            null
                        );
                    }
                }

                // Enqueue JS
                $js_url = wp_make_link_relative($module_dist_url . $entry['file']);
                wp_enqueue_script(
                    $module['handle'],
                    $js_url,
                    [],
                    null,
                    true
                );

                // Add module type
                add_filter('script_loader_tag', function ($tag, $handle, $src) use ($module) {
                    if ($handle === $module['handle']) {
                        // Force relative path here too
                        $relative_src = wp_make_link_relative($src);
                        return '<script type="module" src="' . esc_url($relative_src) . '"></script>';
                    }
                    return $tag;
                }, 10, 3);

            } else {
                // FALLBACK: Dev mode (Assuming Vite is running on localhost:5173)
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    $dev_url = 'http://localhost:5173/';

                    wp_enqueue_script('vite-client', $dev_url . '@vite/client', [], null, true);

                    wp_enqueue_script(
                        $module['handle'] . '-dev',
                        $dev_url . $module['entry_point'],
                        ['vite-client'],
                        null,
                        true
                    );

                    add_filter('script_loader_tag', function ($tag, $handle, $src) use ($module) {
                        if (in_array($handle, [$module['handle'] . '-dev', 'vite-client'])) {
                            return '<script type="module" src="' . esc_url($src) . '"></script>';
                        }
                        return $tag;
                    }, 10, 3);
                }
            }

            // Localize for module
            wp_localize_script($module['handle'], 'wiseModuleData', [
                'apiUrl' => rest_url('wisecampaign/v1/'),
                'nonce' => wp_create_nonce('wp_rest'),
                'moduleId' => $id
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
