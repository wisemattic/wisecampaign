<?php
namespace WISECAMPAIGN\Classes;

use WISECAMPAIGN\Traits\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Privacy-friendly analytics for wiseBanner.
 *
 * Stores daily aggregate counts per banner template, event and device type.
 * No IP addresses, user IDs or per-visitor rows are recorded. Orders are
 * attributed to the banner when the buyer clicked its button within the
 * attribution window, and counted once the order is paid.
 */
class BannerAnalytics
{
    use SingletonTrait;

    const DB_VERSION = '1.0.0';
    const DB_VERSION_OPTION = 'wisecampaign_banner_stats_db_version';
    const SETTINGS_OPTION = 'wc-wisebanner-v2-analytics';
    const ATTRIBUTION_COOKIE = 'wise_banner_ref';
    const ATTRIBUTION_DAYS = 7;
    const ATTRIBUTION_META = '_wise_banner_attribution';
    const CONVERTED_META = '_wise_banner_converted';

    const EVENTS = ['view', 'visitor', 'click', 'copy', 'close', 'conversion'];
    // Events the storefront may report; conversions are only recorded server-side.
    const CLIENT_EVENTS = ['view', 'visitor', 'click', 'copy', 'close'];
    const DEVICES = ['desktop', 'tablet', 'mobile'];
    const RANGES = [7, 30, 90, 365];

    public function __construct()
    {
        add_action('init', [$this, 'maybe_create_table']);
        add_action('rest_api_init', [$this, 'register_routes']);

        // WooCommerce order attribution (the hooks never fire without WooCommerce).
        add_action('woocommerce_checkout_order_processed', [$this, 'capture_classic_checkout_attribution'], 10, 3);
        add_action('woocommerce_store_api_checkout_order_processed', [$this, 'capture_attribution']);
        add_action('woocommerce_order_status_processing', [$this, 'record_conversion']);
        add_action('woocommerce_order_status_completed', [$this, 'record_conversion']);
    }

    public static function table_name()
    {
        global $wpdb;
        return $wpdb->prefix . 'wc_banner_stats';
    }

    public function maybe_create_table()
    {
        if (get_option(self::DB_VERSION_OPTION) === self::DB_VERSION) {
            return;
        }

        global $wpdb;
        $table = self::table_name();
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            stat_date date NOT NULL,
            banner_id varchar(100) NOT NULL,
            event varchar(20) NOT NULL,
            device varchar(10) NOT NULL DEFAULT 'desktop',
            count bigint(20) unsigned NOT NULL DEFAULT 0,
            revenue decimal(19,4) NOT NULL DEFAULT 0,
            PRIMARY KEY  (id),
            UNIQUE KEY stat_key (stat_date,banner_id,event,device),
            KEY stat_date (stat_date)
        ) {$charset_collate};";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);

        update_option(self::DB_VERSION_OPTION, self::DB_VERSION);
    }

    public function get_settings()
    {
        $settings = get_option(self::SETTINGS_OPTION, []);
        return [
            'excludeAdmins' => isset($settings['excludeAdmins']) ? (bool) $settings['excludeAdmins'] : true
        ];
    }

    /**
     * Whether visits by the current user should be counted.
     */
    public function should_track_current_user()
    {
        $settings = $this->get_settings();
        return !($settings['excludeAdmins'] && current_user_can('manage_options'));
    }

    /**
     * Tracking config passed to the storefront script.
     */
    public function get_storefront_config()
    {
        return [
            'enabled' => $this->should_track_current_user(),
            'url' => rest_url('wisecampaign/v1/banner-v2/track'),
            'cookie' => self::ATTRIBUTION_COOKIE,
            'attributionDays' => self::ATTRIBUTION_DAYS
        ];
    }

    public function register_routes()
    {
        $namespace = 'wisecampaign/v1';
        $can_manage = function () {
            return current_user_can('manage_options');
        };

        // Public: storefront visitors report impressions and interactions.
        register_rest_route($namespace, '/banner-v2/track', [
            'methods' => 'POST',
            'callback' => [$this, 'track'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route($namespace, '/banner-v2/analytics', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_analytics'],
                'permission_callback' => $can_manage,
                'args' => [
                    'days' => [
                        'default' => 30,
                        'sanitize_callback' => 'absint'
                    ]
                ]
            ],
            [
                'methods' => 'DELETE',
                'callback' => [$this, 'reset_analytics'],
                'permission_callback' => $can_manage
            ]
        ]);

        register_rest_route($namespace, '/banner-v2/analytics/settings', [
            'methods' => 'POST',
            'callback' => [$this, 'update_settings'],
            'permission_callback' => $can_manage
        ]);
    }

    public function track(WP_REST_Request $request)
    {
        // sendBeacon posts the JSON as text/plain, so fall back to the raw body.
        $data = $request->get_json_params();
        if (empty($data)) {
            $data = json_decode($request->get_body(), true);
        }
        if (!is_array($data)) {
            return new WP_REST_Response(null, 400);
        }

        $event = isset($data['event']) ? sanitize_key($data['event']) : '';
        $banner_id = isset($data['bannerId']) ? sanitize_key($data['bannerId']) : '';
        $device = isset($data['device']) ? sanitize_key($data['device']) : 'desktop';

        if (!in_array($event, self::CLIENT_EVENTS, true)) {
            return new WP_REST_Response(null, 400);
        }

        // Only count events for the banner that is actually live.
        $active = get_option('wc-wisebanner-v2-active', []);
        if (empty($active['isActive']) || empty($active['id']) || sanitize_key($active['id']) !== $banner_id) {
            return new WP_REST_Response(null, 204);
        }

        if ($this->is_bot()) {
            return new WP_REST_Response(null, 204);
        }

        if (!in_array($device, self::DEVICES, true)) {
            $device = 'desktop';
        }

        $this->increment($event, $banner_id, $device);

        return new WP_REST_Response(null, 204);
    }

    private function is_bot()
    {
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';
        if ($user_agent === '') {
            return true;
        }
        return (bool) preg_match('/bot|crawl|spider|slurp|mediapartners|facebookexternalhit|embedly|quora link preview|whatsapp|headless|lighthouse|pingdom|uptime/i', $user_agent);
    }

    private function increment($event, $banner_id, $device, $count = 1, $revenue = 0.0)
    {
        global $wpdb;
        $this->maybe_create_table();
        $table = self::table_name();

        $wpdb->query(
            $wpdb->prepare(
                "INSERT INTO {$table} (stat_date, banner_id, event, device, count, revenue)
                VALUES (%s, %s, %s, %s, %d, %f)
                ON DUPLICATE KEY UPDATE count = count + %d, revenue = revenue + %f",
                current_time('Y-m-d'),
                $banner_id,
                $event,
                $device,
                $count,
                $revenue,
                $count,
                $revenue
            )
        );
    }

    /* ---------------------------------------------------------------------
     * Order attribution
     * ------------------------------------------------------------------- */

    public function capture_classic_checkout_attribution($order_id, $posted_data = [], $order = null)
    {
        $this->capture_attribution($order ?: $order_id);
    }

    /**
     * Copies the banner click cookie onto a newly created order.
     *
     * @param \WC_Order|int $order
     */
    public function capture_attribution($order)
    {
        if (!function_exists('wc_get_order')) {
            return;
        }
        $order = is_numeric($order) ? wc_get_order($order) : $order;
        if (!$order || empty($_COOKIE[self::ATTRIBUTION_COOKIE]) || $order->get_meta(self::ATTRIBUTION_META)) {
            return;
        }

        $parts = explode('|', sanitize_text_field(wp_unslash($_COOKIE[self::ATTRIBUTION_COOKIE])));
        if (count($parts) !== 3) {
            return;
        }

        $banner_id = sanitize_key($parts[0]);
        $device = in_array($parts[1], self::DEVICES, true) ? $parts[1] : 'desktop';
        $clicked_at = absint($parts[2]);

        if ($banner_id === '' || !$clicked_at || $clicked_at < time() - self::ATTRIBUTION_DAYS * DAY_IN_SECONDS) {
            return;
        }

        $order->update_meta_data(self::ATTRIBUTION_META, [
            'banner_id' => $banner_id,
            'device' => $device,
            'clicked_at' => $clicked_at
        ]);
        $order->save();

        // One click attributes one order.
        if (!headers_sent()) {
            setcookie(self::ATTRIBUTION_COOKIE, '', time() - HOUR_IN_SECONDS, COOKIEPATH ? COOKIEPATH : '/', COOKIE_DOMAIN, is_ssl());
        }
    }

    /**
     * Counts an attributed order once it is paid (processing or completed).
     */
    public function record_conversion($order_id)
    {
        if (!function_exists('wc_get_order')) {
            return;
        }
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        $attribution = $order->get_meta(self::ATTRIBUTION_META);
        if (empty($attribution['banner_id']) || $order->get_meta(self::CONVERTED_META)) {
            return;
        }

        $this->increment('conversion', $attribution['banner_id'], $attribution['device'] ?? 'desktop', 1, (float) $order->get_total());

        $order->update_meta_data(self::CONVERTED_META, current_time('mysql'));
        $order->save();
    }

    /* ---------------------------------------------------------------------
     * Admin endpoints
     * ------------------------------------------------------------------- */

    public function get_analytics(WP_REST_Request $request)
    {
        global $wpdb;
        $this->maybe_create_table();
        $table = self::table_name();

        $days = (int) $request->get_param('days');
        if (!in_array($days, self::RANGES, true)) {
            $days = 30;
        }

        $today = new \DateTimeImmutable('now', wp_timezone());
        $to = $today->format('Y-m-d');
        $from = $today->modify('-' . ($days - 1) . ' days')->format('Y-m-d');
        $prev_to = $today->modify('-' . $days . ' days')->format('Y-m-d');
        $prev_from = $today->modify('-' . (2 * $days - 1) . ' days')->format('Y-m-d');

        $empty_counts = array_fill_keys(self::EVENTS, 0) + ['revenue' => 0.0];

        // Daily series with every date present, so charts have no gaps.
        $daily = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = $today->modify('-' . $i . ' days')->format('Y-m-d');
            $daily[$date] = ['date' => $date] + $empty_counts;
        }

        $totals = $empty_counts;
        $devices = array_fill_keys(self::DEVICES, $empty_counts);
        $templates = [];

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT stat_date, banner_id, event, device, SUM(count) AS total, SUM(revenue) AS revenue
                FROM {$table}
                WHERE stat_date BETWEEN %s AND %s
                GROUP BY stat_date, banner_id, event, device",
                $from,
                $to
            ),
            ARRAY_A
        );

        foreach ((array) $rows as $row) {
            $event = $row['event'];
            if (!in_array($event, self::EVENTS, true)) {
                continue;
            }
            $count = (int) $row['total'];
            $revenue = (float) $row['revenue'];
            $device = in_array($row['device'], self::DEVICES, true) ? $row['device'] : 'desktop';
            $banner_id = $row['banner_id'];

            $totals[$event] += $count;
            $totals['revenue'] += $revenue;

            if (isset($daily[$row['stat_date']])) {
                $daily[$row['stat_date']][$event] += $count;
                $daily[$row['stat_date']]['revenue'] += $revenue;
            }

            $devices[$device][$event] += $count;
            $devices[$device]['revenue'] += $revenue;

            if (!isset($templates[$banner_id])) {
                $templates[$banner_id] = ['id' => $banner_id] + $empty_counts;
            }
            $templates[$banner_id][$event] += $count;
            $templates[$banner_id]['revenue'] += $revenue;
        }

        $previous = $empty_counts;
        $previous_rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT event, SUM(count) AS total, SUM(revenue) AS revenue
                FROM {$table}
                WHERE stat_date BETWEEN %s AND %s
                GROUP BY event",
                $prev_from,
                $prev_to
            ),
            ARRAY_A
        );
        foreach ((array) $previous_rows as $row) {
            if (in_array($row['event'], self::EVENTS, true)) {
                $previous[$row['event']] += (int) $row['total'];
                $previous['revenue'] += (float) $row['revenue'];
            }
        }

        usort($templates, function ($a, $b) {
            return $b['view'] <=> $a['view'];
        });

        $active = get_option('wc-wisebanner-v2-active', []);

        return rest_ensure_response([
            'range' => ['days' => $days, 'from' => $from, 'to' => $to],
            'totals' => $totals,
            'previous' => $previous,
            'daily' => array_values($daily),
            'devices' => $devices,
            'templates' => array_values($templates),
            'activeBannerId' => isset($active['id']) ? sanitize_key($active['id']) : '',
            'trackingSince' => $wpdb->get_var("SELECT MIN(stat_date) FROM {$table}"),
            'settings' => $this->get_settings(),
            'hasWooCommerce' => function_exists('get_woocommerce_currency'),
            'currency' => $this->get_currency()
        ]);
    }

    private function get_currency()
    {
        if (!function_exists('get_woocommerce_currency')) {
            return null;
        }
        return [
            'code' => get_woocommerce_currency(),
            'symbol' => html_entity_decode(get_woocommerce_currency_symbol(), ENT_QUOTES, 'UTF-8'),
            'position' => get_option('woocommerce_currency_pos', 'left'),
            'decimals' => function_exists('wc_get_price_decimals') ? wc_get_price_decimals() : 2
        ];
    }

    public function reset_analytics()
    {
        global $wpdb;
        $this->maybe_create_table();
        $table = self::table_name();
        $wpdb->query("TRUNCATE TABLE {$table}");

        return rest_ensure_response(['success' => true]);
    }

    public function update_settings(WP_REST_Request $request)
    {
        $params = $request->get_json_params();
        $settings = $this->get_settings();

        if (isset($params['excludeAdmins'])) {
            $settings['excludeAdmins'] = (bool) $params['excludeAdmins'];
        }
        update_option(self::SETTINGS_OPTION, $settings);

        return rest_ensure_response($settings);
    }
}
