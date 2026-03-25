<?php
namespace WISECAMPAIGN\Classes;

use WISECAMPAIGN\Traits\SingletonTrait;
use WP_REST_Request;

if (!defined('ABSPATH')) {
    exit;
}

class WiseBannerV2
{
    use SingletonTrait;

    public function __construct()
    {
        // Register REST routes
        add_action('rest_api_init', [$this, 'banner_register_rest_routes']);

        // Load frontend hooks
        add_action('wp', [$this, 'load_on_page']);
    }

    public function load_on_page()
    {
        if (is_admin()) {
            return;
        }

        $config = get_option('wc-wisebanner-v2-active', []);
        if (empty($config) || !isset($config['isActive']) || !$config['isActive']) {
            return;
        }

        $settings = get_option('wc-wisebanner-v2-setting', []);

        $should_show = false;

        // Check Display Locations
        $show_on_all = isset($settings['displayOnAllPages']) ? (bool) $settings['displayOnAllPages'] : false;
        $show_on_home = isset($settings['displayOnHomePage']) ? (bool) $settings['displayOnHomePage'] : false;
        $selected_pages = isset($settings['selectedPages']) ? array_map('intval', (array) $settings['selectedPages']) : [];
        $current_id = get_queried_object_id();

        if ($show_on_all) {
            $should_show = true;
        } elseif ($show_on_home && (is_front_page() || is_home())) {
            $should_show = true;
        } elseif (!empty($selected_pages) && (is_page($selected_pages) || in_array($current_id, $selected_pages))) {
            $should_show = true;
        }

        if ($should_show) {
            add_action('wp_body_open', [$this, 'render_banner_container']);
        }
    }

    public function render_banner_container()
    {
        $active_config = get_option('wc-wisebanner-v2-active', []);
        if (empty($active_config))
            return;

        $this->enqueue_module_assets($active_config);
        echo '<div id="wise-banner-v2-app"></div>';
    }

    public function initialize_defaults()
    {
        $default_config = [
            'id' => 'holiday-gradient',
            'name' => 'Holiday Sale Gradient',
            'layout' => 'Top Bar Sticky',
            'isActive' => true,
            'headline' => 'Black Friday Mega Sale!',
            'subHeadline' => 'Use code: SAVE50 for 50% off everything',
            'showTimer' => true,
            'endDate' => '2024-11-30',
            'endTime' => '23:59',
            'timerLabel' => 'OFFER ENDS IN:',
            'showCTA' => true,
            'ctaText' => 'Shop Now',
            'ctaUrl' => 'https://myshop.com/sale',
            'ctaBg' => '#FCD34D',
            'ctaTextColor' => '#111827',
            'bgType' => 'gradient',
            'bgGradient' => 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
            'bgSolid' => '#0F172A',
            'bgImage' => ''
        ];

        if (get_option('wc-wisebanner-v2-active') === false) {
            update_option('wc-wisebanner-v2-active', $default_config);
        }

        if (get_option('wc-wisebanner-v2-setting') === false) {
            update_option('wc-wisebanner-v2-setting', [
                'displayOnAllPages' => true,
                'displayOnHomePage' => false,
                'selectedPages' => []
            ]);
        }
    }

    public function banner_register_rest_routes()
    {
        $namespace = 'wisecampaign/v1';

        register_rest_route($namespace, '/banner-v2', [
            'methods' => 'GET',
            'callback' => function () {
                return rest_ensure_response(get_option('wc-wisebanner-v2-active', []));
            },
            'permission_callback' => '__return_true'
        ]);

        register_rest_route($namespace, '/banner-v2', [
            'methods' => 'POST',
            'callback' => [$this, 'save_banner_settings'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route($namespace, '/banner-v2/settings', [
            'methods' => 'GET',
            'callback' => function () {
                return rest_ensure_response(get_option('wc-wisebanner-v2-setting', []));
            },
            'permission_callback' => '__return_true'
        ]);

        register_rest_route($namespace, '/banner-v2/settings', [
            'methods' => 'POST',
            'callback' => [$this, 'update_display_settings'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route($namespace, '/banner-v2/pages', [
            'methods' => 'GET',
            'callback' => [$this, 'get_pages'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route($namespace, '/banner-v2/license', [
            'methods' => 'GET',
            'callback' => [$this, 'get_license_status'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function get_pages()
    {
        $pages = get_pages();
        $formatted_pages = array_map(function ($page) {
            return [
                'id' => $page->ID,
                'title' => $page->post_title
            ];
        }, $pages);

        return rest_ensure_response($formatted_pages);
    }

    public function get_license_status()
    {
        if (class_exists('WISECAMPAIGNPRO\Classes\ProPluginLicense')) {
            $license_response = \WISECAMPAIGNPRO\Classes\ProPluginLicense::get_license_status();
            return $license_response;
        }

        return rest_ensure_response([
            'valid' => false,
            'message' => 'Pro plugin not active.'
        ]);
    }

    public function save_banner_settings(WP_REST_Request $request)
    {
        try {
            $params = $request->get_json_params();
            update_option('wc-wisebanner-v2-active', $params);
            return rest_ensure_response(['success' => true]);
        } catch (\Throwable $e) {
            return new \WP_Error('server_error', $e->getMessage(), ['status' => 500]);
        }
    }

    public function update_display_settings(WP_REST_Request $request)
    {
        try {
            $params = $request->get_json_params();
            update_option('wc-wisebanner-v2-setting', $params);
            return rest_ensure_response(['success' => true]);
        } catch (\Throwable $e) {
            return new \WP_Error('server_error', $e->getMessage(), ['status' => 500]);
        }
    }

    private function enqueue_module_assets($config)
    {
        $dist_path = WISECAMPAIGN_DIR_PATH . 'modules/wise-banner-v2/dist/';
        $dist_url = WISECAMPAIGN_DIR_URL . 'modules/wise-banner-v2/dist/';

        $manifest_path = $dist_path . '.vite/manifest.json';
        if (!file_exists($manifest_path))
            return;

        $manifest = json_decode(file_get_contents($manifest_path), true);
        $entry_point = 'src/main.jsx';

        if (isset($manifest[$entry_point])) {
            $entry = $manifest[$entry_point];

            wp_enqueue_script('wise-banner-v2-frontend', $dist_url . $entry['file'], ['wp-element'], null, true);

            if (isset($entry['css'])) {
                foreach ($entry['css'] as $css_file) {
                    wp_enqueue_style('wise-banner-v2-style-' . md5($css_file), $dist_url . $css_file);
                }
            }

            add_filter('script_loader_tag', function ($tag, $handle, $src) {
                if ($handle === 'wise-banner-v2-frontend') {
                    return '<script type="module" src="' . esc_url($src) . '"></script>';
                }
                return $tag;
            }, 10, 3);

            wp_localize_script('wise-banner-v2-frontend', 'wiseBannerData', [
                'isStorefront' => true,
                'config' => $config
            ]);
        }
    }
}
