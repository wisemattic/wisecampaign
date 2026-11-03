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

    // The exit-intent popup is a second design that runs alongside the bar.
    const POPUP_OPTION = 'wc-wisebanner-v2-popup';
    const POPUP_SETTINGS_OPTION = 'wc-wisebanner-v2-popup-setting';
    const POPUP_MOBILE_TRIGGERS = ['scroll-up', 'delay'];
    const POPUP_FREQUENCY_DAYS = [0, 1, 3, 7, 30];

    // What the current page shows, decided on `wp`.
    private $show_bar = false;
    private $show_popup = false;

    public function __construct()
    {
        // Register REST routes
        add_action('rest_api_init', [$this, 'banner_register_rest_routes']);

        // Load frontend hooks
        add_action('wp', [$this, 'load_on_page']);
    }

    public static function is_pro_active()
    {
        if (class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')) {
            return (bool) \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
        }
        return false;
    }

    /**
     * Whether the current request matches a design's display locations.
     */
    private function matches_display_settings($settings)
    {
        $show_on_all = isset($settings['displayOnAllPages']) ? (bool) $settings['displayOnAllPages'] : false;
        $show_on_home = isset($settings['displayOnHomePage']) ? (bool) $settings['displayOnHomePage'] : false;
        $selected_pages = isset($settings['selectedPages']) ? array_map('intval', (array) $settings['selectedPages']) : [];
        $current_id = get_queried_object_id();

        if ($show_on_all) {
            return true;
        }
        if ($show_on_home && (is_front_page() || is_home())) {
            return true;
        }
        return !empty($selected_pages) && (is_page($selected_pages) || in_array($current_id, $selected_pages));
    }

    /**
     * Whether the popup is switched on. Like the bar, it works without Pro: seasonal designs
     * and effects need Pro and fall back to the basic design without it.
     */
    public function is_popup_live()
    {
        $popup = get_option(self::POPUP_OPTION, []);
        return !empty($popup['isActive']) && !empty($popup['id']);
    }

    public function load_on_page()
    {
        if (is_admin()) {
            return;
        }

        $config = get_option('wc-wisebanner-v2-active', []);
        $bar_active = !empty($config) && isset($config['isActive']) && $config['isActive'];
        $this->show_bar = $bar_active && $this->matches_display_settings(get_option('wc-wisebanner-v2-setting', []));

        $on_checkout = function_exists('is_checkout') && is_checkout();
        $this->show_popup = !$on_checkout
            && $this->is_popup_live()
            && $this->matches_display_settings(get_option(self::POPUP_SETTINGS_OPTION, []));

        if ($this->show_bar) {
            $is_pro_active = self::is_pro_active();

            $position = ($is_pro_active && isset($config['position'])) ? $config['position'] : 'top';
            $is_sticky = ($is_pro_active && isset($config['isSticky'])) ? (bool)$config['isSticky'] : false;

            if ($position === 'bottom' && !$is_sticky) {
                add_action('wp_footer', [$this, 'render_banner_container'], 5);
            } else {
                add_action('wp_body_open', [$this, 'render_banner_container']);
                add_action('wp_footer', [$this, 'render_banner_container'], 1); // Fallback if wp_body_open not supported
            }
        } elseif ($this->show_popup) {
            add_action('wp_footer', [$this, 'render_banner_container'], 5);
        }
    }

    /**
     * Prints the one storefront root. The bar and the popup render into it together, because
     * the module's styles are scoped to #wise-banner-v2-app.
     */
    public function render_banner_container()
    {
        static $rendered = false;
        if ($rendered) return;

        $bar_config = null;
        if ($this->show_bar) {
            $bar_config = array_merge($this->get_default_config(), get_option('wc-wisebanner-v2-active', []));
        }

        $popup_config = null;
        if ($this->show_popup) {
            $popup_config = array_merge($this->get_default_popup_config(), get_option(self::POPUP_OPTION, []));
        }

        if (!$bar_config && !$popup_config) {
            return;
        }

        $this->enqueue_module_assets($bar_config, $popup_config);
        echo '<div id="wise-banner-v2-app"></div>';
        $rendered = true;
    }

    private function get_default_config()
    {
        return [
            'id' => 'holiday-gradient',
            'name' => 'Holiday Sale Gradient',
            'bgType' => 'gradient',
            'bgSolid' => '#0F172A',
            'bgGradient' => 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            'bgImage' => '',
            'bgEffect' => 'none',
            'bgEffectOpacity' => 60,
            'headline' => 'Black Friday Mega Sale!',

            'headlineSize' => '16px',
            'headlineColor' => '#FFFFFF',
            'headlineWeight' => '900',
            'subHeadline' => 'Use code: SAVE50 for 50% off everything',
            'subHeadlineSize' => '12px',
            'subHeadlineColor' => '#E2E8F0',
            'subHeadlineWeight' => '500',
            'showSubHeadline' => true,
            'showTimer' => true,
            'endDate' => '2025-12-31',
            'endTime' => '23:59',
            'timerLabel' => 'OFFER ENDS IN:',
            'timerTextColor' => '#FFFFFF',
            'timerBgColor' => 'rgba(255, 255, 255, 0.1)',
            'showCTA' => true,
            'ctaText' => 'SHOP NOW',
            'ctaUrl' => 'https://myshop.com/sale',
            'ctaBg' => '#FCD34D',
            'ctaTextColor' => '#111827',
            'ctaRadius' => '12px',
            'ctaAnimation' => 'none',
            'showBogoBadge' => false,

            'badgeType' => 'text',
            'badgeImage' => '',
            'bogoText' => '50% OFF',
            'badgeBgColor' => '#EF4444',
            'badgeTextColor' => '#FFFFFF',
            'badgeRotation' => '-12deg',
            'badgePosition' => 'left',
            'badgeVerticalPosition' => 'middle',
            'timerLabelPosition' => 'left',


            'daysLabel' => 'D',
            'hoursLabel' => 'H',
            'minutesLabel' => 'M',
            'secondsLabel' => 'S',
            'enableRecursion' => false,
            'recurrenceUnit' => 'hours',
            'showCouponCode' => false,
            'couponCode' => 'SAVE10',
            'couponPlacement' => 'bottom',
            'position' => 'top',
            'isSticky' => false,
            'hideBranding' => false,
            'isActive' => true
        ];
    }

    /**
     * Popup behavior defaults. The design itself comes from the editor on first save
     * (until then the popup has no id and stays off).
     */
    private function get_default_popup_config()
    {
        return [
            'isActive' => false,
            'showOnMobile' => true,
            'mobileTrigger' => 'scroll-up',
            'mobileDelay' => 10,
            'frequencyDays' => 1,
            'showDecline' => true,
            'declineText' => "No thanks, I'll pay full price"
        ];
    }

    private function get_default_display_settings()
    {
        return [
            'displayOnAllPages' => true,
            'displayOnHomePage' => false,
            'selectedPages' => []
        ];
    }

    public function initialize_defaults()
    {
        $default_config = $this->get_default_config();

        if (get_option('wc-wisebanner-v2-active') === false) {
            update_option('wc-wisebanner-v2-active', $default_config);
        }

        if (get_option('wc-wisebanner-v2-setting') === false) {
            update_option('wc-wisebanner-v2-setting', $this->get_default_display_settings());
        }

        if (get_option(self::POPUP_SETTINGS_OPTION) === false) {
            update_option(self::POPUP_SETTINGS_OPTION, $this->get_default_display_settings());
        }
    }

    public function banner_register_rest_routes()
    {
        $namespace = 'wisecampaign/v1';

        register_rest_route($namespace, '/banner-v2', [
            'methods' => 'GET',
            'callback' => function () {
                $config = get_option('wc-wisebanner-v2-active', []);
                return rest_ensure_response(array_merge($this->get_default_config(), $config));
            },
            'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/banner-v2', [
            'methods' => 'POST',
            'callback' => [$this, 'save_banner_settings'],
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/banner-v2/settings', [
            'methods' => 'GET',
            'callback' => function () {
                return rest_ensure_response(get_option('wc-wisebanner-v2-setting', []));
            },
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/banner-v2/settings', [
            'methods' => 'POST',
            'callback' => [$this, 'update_display_settings'],
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/banner-v2/popup', [
            [
                'methods' => 'GET',
                'callback' => function () {
                    return rest_ensure_response(array_merge($this->get_default_popup_config(), get_option(self::POPUP_OPTION, [])));
                },
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                }
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'save_popup_settings'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                }
            ]
        ]);

        register_rest_route($namespace, '/banner-v2/popup/settings', [
            [
                'methods' => 'GET',
                'callback' => function () {
                    return rest_ensure_response(get_option(self::POPUP_SETTINGS_OPTION, $this->get_default_display_settings()));
                },
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                }
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'update_popup_display_settings'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                }
            ]
        ]);

        register_rest_route($namespace, '/banner-v2/pages', [
            'methods' => 'GET',
            'callback' => [$this, 'get_pages'],
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/banner-v2/license', [
            'methods' => 'GET',
            'callback' => [$this, 'get_license_status'],
                        'permission_callback' => function () {
                return current_user_can('manage_options');
            }
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

    public function save_popup_settings(WP_REST_Request $request)
    {
        $params = $request->get_json_params();
        if (!is_array($params)) {
            return new \WP_Error('invalid_popup', 'Popup settings must be an object.', ['status' => 400]);
        }

        update_option(self::POPUP_OPTION, $this->sanitize_popup_config($params));
        return rest_ensure_response(['success' => true]);
    }

    public function update_popup_display_settings(WP_REST_Request $request)
    {
        $params = $request->get_json_params();
        $params = is_array($params) ? $params : [];

        update_option(self::POPUP_SETTINGS_OPTION, [
            'displayOnAllPages' => !empty($params['displayOnAllPages']),
            'displayOnHomePage' => !empty($params['displayOnHomePage']),
            'selectedPages' => array_values(array_filter(array_map('intval', (array) ($params['selectedPages'] ?? [])), function ($id) {
                return $id > 0;
            }))
        ]);
        return rest_ensure_response(['success' => true]);
    }

    /**
     * The design keys are stored as the editor sends them, like the bar. The popup's own
     * behavior keys and its links are checked here, since the storefront acts on them.
     */
    private function sanitize_popup_config(array $config)
    {
        $config['isActive'] = !empty($config['isActive']);
        $config['showOnMobile'] = !isset($config['showOnMobile']) || !empty($config['showOnMobile']);
        $config['showDecline'] = !isset($config['showDecline']) || !empty($config['showDecline']);

        $trigger = isset($config['mobileTrigger']) ? sanitize_key($config['mobileTrigger']) : '';
        $config['mobileTrigger'] = in_array($trigger, self::POPUP_MOBILE_TRIGGERS, true) ? $trigger : 'scroll-up';

        $delay = isset($config['mobileDelay']) ? (int) $config['mobileDelay'] : 10;
        $config['mobileDelay'] = min(120, max(3, $delay));

        $days = isset($config['frequencyDays']) ? (int) $config['frequencyDays'] : 1;
        $config['frequencyDays'] = in_array($days, self::POPUP_FREQUENCY_DAYS, true) ? $days : 1;

        $config['declineText'] = isset($config['declineText']) ? sanitize_text_field($config['declineText']) : '';
        if (isset($config['id'])) {
            $config['id'] = sanitize_key($config['id']);
        }

        // An empty button link is allowed: the button then copies the code and closes the popup.
        foreach (['ctaUrl', 'bgImage', 'badgeImage'] as $url_key) {
            if (isset($config[$url_key])) {
                $config[$url_key] = esc_url_raw((string) $config[$url_key]);
            }
        }

        return $config;
    }

    private function enqueue_module_assets($config, $popup_config = null)
    {
        $dist_path = WISECAMPAIGN_DIR_PATH . 'modules/wise-banner-v2/dist/';
        $dist_url = WISECAMPAIGN_DIR_URL . 'modules/wise-banner-v2/dist/';

        $manifest_path = $dist_path . '.vite/manifest.json';
        if (!file_exists($manifest_path)) {
            $manifest_path = $dist_path . 'manifest.json';
        }

        if (!file_exists($manifest_path))
            return;

        $manifest = json_decode(file_get_contents($manifest_path), true);
        $entry_point = 'src/main.jsx';

        if (isset($manifest[$entry_point])) {
            $entry = $manifest[$entry_point];

            if (isset($entry['css'])) {
                foreach ($entry['css'] as $css_file) {
                    wp_enqueue_style('wise-banner-v2-style-' . md5($css_file), $dist_url . $css_file, [], null);
                }
            }

            wp_enqueue_script('wise-banner-v2-frontend', $dist_url . $entry['file'], [], null, true);

            add_filter('script_loader_tag', function ($tag, $handle, $src) {
                if ($handle === 'wise-banner-v2-frontend') {
                    return '<script type="module" src="' . esc_url($src) . '"></script>';
                }
                return $tag;
            }, 10, 3);

            // `config` is the bar and `popup` the exit-intent popup; either is null when it isn't on this page.
            wp_localize_script('wise-banner-v2-frontend', 'wiseBannerData', [
                'isStorefront' => true,
                'config' => $config,
                'popup' => $popup_config,
                'isPro' => self::is_pro_active(),
                'tracking' => BannerAnalytics::getInstance()->get_storefront_config()
            ]);
        }
    }
}
