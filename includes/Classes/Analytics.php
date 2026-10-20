<?php

namespace WISECAMPAIGN\Classes;

if (!defined('ABSPATH')) {
    exit;
}

use WISECAMPAIGN\Traits\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Store-wide analytics for every WiseCampaign module (admin page: modules/wise-analytics).
 *
 * Two kinds of data, both without IP addresses, user ids or per-visitor rows:
 * - wisecampaign_stats: daily counts of storefront events per module (views, clicks, adds to cart).
 * - wisecampaign_orders: one row per paid order and module that took part in it:
 *   "direct"   the module put the product in the cart (Product Table, Buy Now, video add to cart),
 *   "assisted" the shopper used the module before buying (notification click, stock bar shown, ...),
 *   "discount" Discount Manager discounted the order,
 *   plus a "store" row for every paid order, so module numbers can be compared with the whole store.
 * Rows are rebuilt whenever an order's status changes or it is refunded, so refunds and
 * cancellations come off the numbers. wiseBanner keeps its own table (BannerAnalytics); its
 * clicks and views are read from there and its attributed orders are copied in here.
 */
class Analytics
{
    use SingletonTrait;

    const DB_VERSION = '1.0.0';
    const DB_VERSION_OPTION = 'wisecampaign_analytics_db_version';
    const SINCE_OPTION = 'wisecampaign_analytics_since';
    const SETTINGS_OPTION = 'wisecampaign_analytics_settings';
    const TOUCH_COOKIE = 'wisecampaign_touch';
    const ATTRIBUTION_DAYS = 7;
    const SOURCE_META = '_wisecampaign_source';   // order item: module that put it in the cart
    const ASSIST_META = '_wisecampaign_assist';   // order item: module shown when it was added (stock bar)
    const TOUCH_META = '_wisecampaign_touches';   // order: modules the shopper used before buying
    const CART_SESSION = 'wisecampaign_cart_sources';

    // Events the storefront may report, per module. Adds to cart are counted on the server.
    const CLIENT_EVENTS = [
        'checkout'     => ['view', 'click'],
        'socialproof'  => ['view', 'click'],
        'wisecart'     => ['open', 'checkout'],
        'stockbar'     => ['view'],
        'wisevideo'    => ['play', 'click'],
        'producttable' => ['view'],
    ];
    // The event that makes a later order count as assisted by the module
    const TOUCH_EVENTS = [
        'socialproof' => 'click',
        'wisecart'    => 'checkout',
        'wisevideo'   => 'play',
    ];
    // Modules that add to the cart themselves (sent as wisecampaign_source)
    const SOURCES = ['checkout', 'producttable', 'wisevideo'];
    // Modules shown in the add to cart form (sent as wisecampaign_assist)
    const ASSISTS = ['stockbar'];
    // Modules whose numbers are also kept per object (sent as wisecampaign_object): the product table id
    const OBJECT_MODULES = ['producttable'];
    const OBJECT_META = '_wisecampaign_object';   // order item: that object
    const RANGES = [7, 30, 90];
    const FREE_RANGE = 7;

    public function __construct()
    {
        add_action('init', [$this, 'maybe_create_tables']);
        add_action('rest_api_init', [$this, 'register_routes']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_tracker']);

        // Carts and orders (these hooks never fire without WooCommerce)
        add_action('woocommerce_add_to_cart', [$this, 'tag_cart_item'], 10, 4);
        add_action('woocommerce_cart_emptied', [$this, 'forget_cart_sources']);
        add_action('woocommerce_checkout_create_order_line_item', [$this, 'tag_order_item'], 10, 4);
        add_action('woocommerce_checkout_create_order', [$this, 'capture_touches']);
        add_action('woocommerce_store_api_checkout_update_order_meta', [$this, 'capture_touches']);

        // After BannerAnalytics (priority 10) has copied its click onto the order
        add_action('woocommerce_checkout_order_processed', [$this, 'sync_order'], 20);
        add_action('woocommerce_store_api_checkout_order_processed', [$this, 'sync_order'], 20);
        add_action('woocommerce_order_status_changed', [$this, 'sync_order'], 20);
        add_action('woocommerce_order_refunded', [$this, 'sync_order'], 20);
        add_action('woocommerce_trash_order', [$this, 'sync_order'], 20);
        add_action('woocommerce_untrash_order', [$this, 'sync_order'], 20);
        add_action('woocommerce_delete_order', [$this, 'forget_order']);
    }

    public static function stats_table()
    {
        global $wpdb;
        return $wpdb->prefix . 'wisecampaign_stats';
    }

    public static function orders_table()
    {
        global $wpdb;
        return $wpdb->prefix . 'wisecampaign_orders';
    }

    public function maybe_create_tables()
    {
        if (get_option(self::DB_VERSION_OPTION) === self::DB_VERSION) {
            return;
        }

        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $stats = self::stats_table();
        $orders = self::orders_table();

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        // object_id: the part of a module a row belongs to (a product table, a discount rule), else 0
        dbDelta("CREATE TABLE {$stats} (
            stat_date date NOT NULL,
            module varchar(32) NOT NULL,
            event varchar(32) NOT NULL,
            object_id bigint(20) unsigned NOT NULL DEFAULT 0,
            count bigint(20) unsigned NOT NULL DEFAULT 0,
            PRIMARY KEY  (stat_date,module,event,object_id)
        ) {$charset_collate};");
        dbDelta("CREATE TABLE {$orders} (
            order_id bigint(20) unsigned NOT NULL,
            module varchar(32) NOT NULL,
            type varchar(16) NOT NULL,
            object_id bigint(20) unsigned NOT NULL DEFAULT 0,
            order_date date NOT NULL,
            revenue decimal(19,4) NOT NULL DEFAULT 0,
            discount decimal(19,4) NOT NULL DEFAULT 0,
            items int(10) unsigned NOT NULL DEFAULT 0,
            PRIMARY KEY  (order_id,module,type,object_id),
            KEY order_date (order_date)
        ) {$charset_collate};");

        update_option(self::DB_VERSION_OPTION, self::DB_VERSION);
        if (!get_option(self::SINCE_OPTION)) {
            update_option(self::SINCE_OPTION, current_time('Y-m-d'));
        }
    }

    public function get_settings()
    {
        $saved = get_option(self::SETTINGS_OPTION, []);
        $saved = is_array($saved) ? $saved : [];
        return [
            'enabled'       => isset($saved['enabled']) ? (bool) $saved['enabled'] : true,
            'excludeAdmins' => isset($saved['excludeAdmins']) ? (bool) $saved['excludeAdmins'] : true,
        ];
    }

    private function should_track_current_user()
    {
        $settings = $this->get_settings();
        return $settings['enabled'] && !($settings['excludeAdmins'] && current_user_can('manage_options'));
    }

    private function is_pro()
    {
        return class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')
            && \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
    }

    private function is_bot()
    {
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';
        return $user_agent === ''
            || (bool) preg_match('/bot|crawl|spider|slurp|mediapartners|facebookexternalhit|embedly|quora link preview|whatsapp|headless|lighthouse|pingdom|uptime/i', $user_agent);
    }

    private function increment($module, $event, $count = 1, $object_id = 0)
    {
        global $wpdb;
        $this->maybe_create_tables();
        $table = self::stats_table();
        $wpdb->query($wpdb->prepare(
            "INSERT INTO {$table} (stat_date, module, event, object_id, count) VALUES (%s, %s, %s, %d, %d)
            ON DUPLICATE KEY UPDATE count = count + %d",
            current_time('Y-m-d'),
            $module,
            $event,
            $object_id,
            $count,
            $count
        ));
    }

    /**
     * =================================================================
     * STOREFRONT
     * =================================================================
     */

    /**
     * The small tracker every module reports to (includes/js/wise-track.js).
     */
    public function enqueue_tracker()
    {
        if (!$this->should_track_current_user()) {
            return;
        }
        wp_enqueue_script('wisecampaign-track', WISECAMPAIGN_DIR_URL . 'includes/js/wise-track.js', [], WISECAMPAIGN_VERSION, true);
        wp_localize_script('wisecampaign-track', 'wiseTrackConfig', [
            'url'    => rest_url('wisecampaign/v1/analytics/track'),
            'cookie' => self::TOUCH_COOKIE,
            'days'   => self::ATTRIBUTION_DAYS,
            'touch'  => self::TOUCH_EVENTS,
        ]);
    }

    /**
     * Public: the storefront reports a batch of [module, event, object id?] events. sendBeacon posts JSON as text/plain.
     */
    public function track(WP_REST_Request $request)
    {
        $data = $request->get_json_params();
        if (empty($data)) {
            $data = json_decode($request->get_body(), true);
        }
        if (!is_array($data) || !is_array($data['events'] ?? null) || $this->is_bot() || !$this->get_settings()['enabled']) {
            return new WP_REST_Response(null, 204);
        }

        $counts = [];
        foreach (array_slice($data['events'], 0, 30) as $item) {
            $module = is_array($item) ? sanitize_key($item[0] ?? '') : '';
            $event = is_array($item) ? sanitize_key($item[1] ?? '') : '';
            // Only modules with objects may send one, so the table can't be filled with made-up ids
            $object_id = in_array($module, self::OBJECT_MODULES, true) ? absint($item[2] ?? 0) : 0;
            if (in_array($event, self::CLIENT_EVENTS[$module] ?? [], true) && Modules::is_enabled($module)) {
                $counts["{$module}|{$event}|{$object_id}"] = ($counts["{$module}|{$event}|{$object_id}"] ?? 0) + 1;
            }
        }
        foreach ($counts as $key => $count) {
            [$module, $event, $object_id] = explode('|', $key);
            $this->increment($module, $event, $count, (int) $object_id);
        }

        return new WP_REST_Response(null, 204);
    }

    /**
     * Remembers which module put a cart item in the cart. Modules send wisecampaign_source (or
     * wisecampaign_assist) with the add to cart request; the first module to add an item keeps the credit.
     */
    public function tag_cart_item($cart_item_key, $product_id, $quantity, $variation_id = 0)
    {
        $source = sanitize_key(wp_unslash($_REQUEST['wisecampaign_source'] ?? ''));
        $assist = sanitize_key(wp_unslash($_REQUEST['wisecampaign_assist'] ?? ''));
        $source = in_array($source, self::SOURCES, true) && Modules::is_enabled($source) ? $source : '';
        $assist = in_array($assist, self::ASSISTS, true) && Modules::is_enabled($assist) ? $assist : '';
        if ((!$source && !$assist) || !WC()->session) {
            return;
        }

        $object_id = in_array($source, self::OBJECT_MODULES, true) ? absint($_REQUEST['wisecampaign_object'] ?? 0) : 0;

        $map = (array) WC()->session->get(self::CART_SESSION, []);
        $entry = $map[$cart_item_key] ?? [];
        if ($source && empty($entry['source'])) {
            $entry['source'] = $source;
            $entry['object'] = $object_id;
        }
        if ($assist) {
            $entry['assist'] = $assist;
        }
        $map[$cart_item_key] = $entry;
        WC()->session->set(self::CART_SESSION, $map);

        if ($source && !$this->is_bot() && $this->should_track_current_user()) {
            $this->increment($source, 'add_to_cart', max(1, (int) $quantity), $object_id);
        }
    }

    public function forget_cart_sources()
    {
        if (function_exists('WC') && WC()->session) {
            WC()->session->set(self::CART_SESSION, null);
        }
    }

    /**
     * Copies the cart item's module onto the order line (classic and block checkout both use this hook).
     */
    public function tag_order_item($item, $cart_item_key, $values, $order)
    {
        $map = WC()->session ? (array) WC()->session->get(self::CART_SESSION, []) : [];
        if (!empty($map[$cart_item_key]['source'])) {
            $item->add_meta_data(self::SOURCE_META, $map[$cart_item_key]['source'], true);
            if (!empty($map[$cart_item_key]['object'])) {
                $item->add_meta_data(self::OBJECT_META, (int) $map[$cart_item_key]['object'], true);
            }
        }
        if (!empty($map[$cart_item_key]['assist'])) {
            $item->add_meta_data(self::ASSIST_META, $map[$cart_item_key]['assist'], true);
        }
    }

    /**
     * Copies the modules the shopper used in the last 7 days (the touch cookie) onto the new order.
     *
     * @param \WC_Order $order
     */
    public function capture_touches($order)
    {
        $raw = isset($_COOKIE[self::TOUCH_COOKIE]) ? sanitize_text_field(wp_unslash($_COOKIE[self::TOUCH_COOKIE])) : '';
        $touches = [];
        // Cookie format: module.timestamp|module.timestamp
        foreach (explode('|', $raw) as $part) {
            if (preg_match('/^([a-z]+)\.(\d{9,11})$/', $part, $m)
                && isset(self::TOUCH_EVENTS[$m[1]])
                && (int) $m[2] >= time() - self::ATTRIBUTION_DAYS * DAY_IN_SECONDS) {
                $touches[$m[1]] = (int) $m[2];
            }
        }
        if (!$touches) {
            return;
        }

        $order->update_meta_data(self::TOUCH_META, $touches);
        // Block checkout orders already exist at this point; classic ones are saved right after
        if ($order->get_id()) {
            $order->save_meta_data();
        }
        // One visit's clicks count towards one order
        if (!headers_sent()) {
            setcookie(self::TOUCH_COOKIE, '', time() - HOUR_IN_SECONDS, COOKIEPATH ? COOKIEPATH : '/', COOKIE_DOMAIN, is_ssl());
        }
    }

    /**
     * =================================================================
     * ORDERS
     * =================================================================
     */

    public function forget_order($order_id)
    {
        global $wpdb;
        $wpdb->delete(self::orders_table(), ['order_id' => absint($order_id)], ['%d']);
    }

    /**
     * Rebuilds an order's rows. Only paid orders (processing, completed) count, minus refunds.
     *
     * @param int|\WC_Order $order
     */
    public function sync_order($order)
    {
        if (!function_exists('wc_get_order')) {
            return;
        }
        $order_id = is_object($order) ? $order->get_id() : absint($order);
        $order = wc_get_order($order_id);
        if (!$order || $order instanceof \WC_Order_Refund) {
            return;
        }

        global $wpdb;
        $this->maybe_create_tables();
        $this->forget_order($order_id);
        if (!$order->has_status(wc_get_is_paid_statuses())) {
            return;
        }

        $date = $order->get_date_paid() ?: $order->get_date_created();
        $order_date = $date ? $date->date('Y-m-d') : current_time('Y-m-d');
        $net = max(0, (float) $order->get_total() - (float) $order->get_total_refunded());

        // [module, type, object id, revenue, discount, items]
        $rows = [['store', 'order', 0, $net, 0, $order->get_item_count() - $order->get_item_count_refunded()]];
        $direct = [];
        $assisted = [];

        foreach ($order->get_items() as $item_id => $item) {
            $source = sanitize_key($item->get_meta(self::SOURCE_META));
            if ($source) {
                $key = $source . '|' . absint($item->get_meta(self::OBJECT_META));
                $direct[$key] = $direct[$key] ?? ['revenue' => 0.0, 'items' => 0];
                $direct[$key]['revenue'] += (float) $item->get_total() - (float) $order->get_total_refunded_for_item($item_id);
                // get_qty_refunded_for_item() is negative
                $direct[$key]['items'] += $item->get_quantity() + $order->get_qty_refunded_for_item($item_id);
            }
            $assist = sanitize_key($item->get_meta(self::ASSIST_META));
            if ($assist) {
                $assisted[$assist] = true;
            }
        }
        $touches = $order->get_meta(self::TOUCH_META);
        foreach (is_array($touches) ? $touches : [] as $module => $time) {
            if (isset(self::TOUCH_EVENTS[$module])) {
                $assisted[$module] = true;
            }
        }
        $banner = $order->get_meta(BannerAnalytics::ATTRIBUTION_META);
        if (!empty($banner['banner_id'])) {
            $assisted['banner'] = true;
        }

        foreach ($direct as $key => $d) {
            [$module, $object_id] = explode('|', $key);
            $rows[] = [$module, 'direct', (int) $object_id, max(0, $d['revenue']), 0, max(0, $d['items'])];
        }
        foreach (array_keys($assisted) as $module) {
            $rows[] = [$module, 'assisted', 0, $net, 0, 0];
        }
        // Saved by wiseCampaign Pro's Discount Manager at checkout: the total, and each rule's share of it
        $discount = (float) $order->get_meta('_wise_discount_amount');
        if ($discount > 0) {
            $rows[] = ['discountmanager', 'discount', 0, $net, $discount, 0];
            $by_rule = $order->get_meta('_wise_discount_breakdown');
            foreach (is_array($by_rule) ? $by_rule : [] as $rule_id => $amount) {
                if (absint($rule_id) && (float) $amount > 0) {
                    $rows[] = ['discountmanager', 'rule', absint($rule_id), $net, (float) $amount, 0];
                }
            }
        }

        foreach ($rows as [$module, $type, $object_id, $revenue, $discount_amount, $items]) {
            $wpdb->insert(self::orders_table(), [
                'order_id'   => $order_id,
                'module'     => $module,
                'type'       => $type,
                'object_id'  => $object_id,
                'order_date' => $order_date,
                'revenue'    => round($revenue, 4),
                'discount'   => round($discount_amount, 4),
                'items'      => (int) $items,
            ], ['%d', '%s', '%s', '%d', '%s', '%f', '%f', '%d']);
        }
    }

    /**
     * =================================================================
     * ADMIN
     * =================================================================
     */

    public function register_routes()
    {
        $can_manage = function () {
            return current_user_can('manage_options');
        };

        register_rest_route('wisecampaign/v1', '/analytics/track', [
            'methods'             => 'POST',
            'callback'            => [$this, 'track'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('wisecampaign/v1', '/analytics/report', [
            'methods'             => 'GET',
            'callback'            => [$this, 'rest_report'],
            'permission_callback' => $can_manage,
            'args'                => ['days' => ['default' => 30, 'sanitize_callback' => 'absint']],
        ]);
        // One module's numbers, for the card in that module's dashboard
        register_rest_route('wisecampaign/v1', '/analytics/module', [
            'methods'             => 'GET',
            'callback'            => [$this, 'rest_module'],
            'permission_callback' => $can_manage,
            'args'                => ['module' => ['required' => true, 'type' => 'string', 'enum' => array_keys(Modules::PAGES)]],
        ]);
        register_rest_route('wisecampaign/v1', '/analytics/settings', [
            'methods'             => 'POST',
            'callback'            => [$this, 'rest_save_settings'],
            'permission_callback' => $can_manage,
        ]);
    }

    public function rest_save_settings(WP_REST_Request $request)
    {
        $params = (array) $request->get_json_params();
        $settings = $this->get_settings();
        foreach (['enabled', 'excludeAdmins'] as $key) {
            if (isset($params[$key])) {
                $settings[$key] = (bool) $params[$key];
            }
        }
        update_option(self::SETTINGS_OPTION, $settings);

        // wiseBanner keeps its own copy of this switch
        $banner = get_option(BannerAnalytics::SETTINGS_OPTION, []);
        $banner = is_array($banner) ? $banner : [];
        $banner['excludeAdmins'] = $settings['excludeAdmins'];
        update_option(BannerAnalytics::SETTINGS_OPTION, $banner);

        return rest_ensure_response(['success' => true, 'settings' => $settings]);
    }

    /**
     * The last $days days up to today, and the same number of days before that.
     */
    private function ranges($days)
    {
        $today = new \DateTimeImmutable('now', wp_timezone());
        return [
            [
                'from' => $today->modify('-' . ($days - 1) . ' days')->format('Y-m-d'),
                'to'   => $today->format('Y-m-d'),
            ],
            [
                'from' => $today->modify('-' . (2 * $days - 1) . ' days')->format('Y-m-d'),
                'to'   => $today->modify('-' . $days . ' days')->format('Y-m-d'),
            ],
        ];
    }

    // Free shows interactions only; orders and money need Pro
    private function hide_money(array $row)
    {
        foreach (['orders', 'revenue', 'directRevenue', 'discount'] as $key) {
            if (array_key_exists($key, $row)) {
                $row[$key] = null;
            }
        }
        return $row;
    }

    public function rest_report(WP_REST_Request $request)
    {
        $this->maybe_create_tables();
        $pro = $this->is_pro();
        $days = (int) $request->get_param('days');
        $days = in_array($days, self::RANGES, true) ? $days : 30;
        if (!$pro) {
            $days = self::FREE_RANGE;
        }
        [$range, $previous] = $this->ranges($days);

        $current = $this->summarize($range['from'], $range['to']);
        $before = $this->summarize($previous['from'], $previous['to']);
        $breakdowns = $this->breakdowns($range['from'], $range['to']);
        foreach ($current['modules'] as &$module) {
            $module['breakdown'] = $breakdowns[$module['id']] ?? null;
        }
        unset($module);

        if (!$pro) {
            $current['totals'] = array_map('__return_null', $current['totals']);
            $before['totals'] = array_map('__return_null', $before['totals']);
            foreach ($current['modules'] as &$module) {
                $module = $this->hide_money($module);
                if ($module['breakdown']) {
                    $module['breakdown'] = array_map(function ($row) {
                        return $this->hide_money($row);
                    }, $module['breakdown']);
                }
            }
            unset($module);
            foreach ($current['daily'] as &$day) {
                $day['storeRevenue'] = $day['revenue'] = null;
            }
            unset($day);
        }

        $response = rest_ensure_response([
            'days'          => $days,
            'range'         => $range,
            'isPro'         => $pro,
            'hasWc'         => function_exists('WC'),
            'since'         => get_option(self::SINCE_OPTION) ?: $range['to'],
            'attributionDays' => self::ATTRIBUTION_DAYS,
            'modules'       => $current['modules'],
            'enabled'       => Modules::get_states(),
            'totals'        => $current['totals'],
            'previous'      => $before['totals'],
            'interactions'  => $current['interactions'],
            'previousInteractions' => $before['interactions'],
            'daily'         => $current['daily'],
            'settings'      => $this->get_settings(),
            'currency'      => $this->get_currency(),
        ]);
        $response->header('Cache-Control', 'no-store');
        return $response;
    }

    /**
     * One module's last 30 days (7 without Pro) and the period before, for its dashboard card.
     */
    public function rest_module(WP_REST_Request $request)
    {
        $this->maybe_create_tables();
        $pro = $this->is_pro();
        $id = $request->get_param('module');
        $days = $pro ? 30 : self::FREE_RANGE;
        [$range, $previous] = $this->ranges($days);
        $since = get_option(self::SINCE_OPTION) ?: $range['to'];

        $pick = function ($summary) use ($id, $pro) {
            foreach ($summary['modules'] as $module) {
                if ($module['id'] === $id) {
                    return $pro ? $module : $this->hide_money($module);
                }
            }
            return null;
        };

        $response = rest_ensure_response([
            'module'     => $id,
            'days'       => $days,
            'isPro'      => $pro,
            'enabled'    => Modules::is_enabled($id),
            'tracking'   => $this->get_settings()['enabled'],
            // The previous period only compares fairly when it was tracked too
            'comparable' => $previous['from'] >= $since,
            'current'    => $pick($this->summarize($range['from'], $range['to'])),
            'previous'   => $pick($this->summarize($previous['from'], $previous['to'])),
            'currency'   => $this->get_currency(),
            'url'        => admin_url('admin.php?page=wisecampaign_analytics'),
        ]);
        $response->header('Cache-Control', 'no-store');
        return $response;
    }

    /**
     * Numbers per object inside a module: each Discount Manager rule and each product table.
     */
    private function breakdowns($from, $to)
    {
        global $wpdb;
        $stats = self::stats_table();
        $orders = self::orders_table();

        // Discount Manager rules, named from wiseCampaign Pro's rules table
        $rules = [];
        foreach ((array) $wpdb->get_results($wpdb->prepare(
            "SELECT object_id, COUNT(*) AS orders, SUM(revenue) AS revenue, SUM(discount) AS discount FROM {$orders}
            WHERE module = 'discountmanager' AND type = 'rule' AND order_date BETWEEN %s AND %s GROUP BY object_id",
            $from,
            $to
        ), ARRAY_A) as $row) {
            $rules[] = [
                'id'       => (int) $row['object_id'],
                'orders'   => (int) $row['orders'],
                'revenue'  => round((float) $row['revenue'], 2),
                'discount' => round((float) $row['discount'], 2),
            ];
        }
        $rules_table = $wpdb->prefix . 'wc_discounts';
        $rule_names = $rules && $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $rules_table)) === $rules_table
            ? $wpdb->get_results("SELECT id, name FROM {$rules_table}", OBJECT_K)
            : [];
        foreach ($rules as &$rule) {
            /* translators: %d: discount rule id */
            $rule['name'] = isset($rule_names[$rule['id']]) ? $rule_names[$rule['id']]->name : sprintf(__('Deleted rule #%d', 'wisecampaign'), $rule['id']);
        }
        unset($rule);
        usort($rules, function ($a, $b) {
            return $b['revenue'] <=> $a['revenue'];
        });

        // Product tables: every saved table, plus any that has numbers but was deleted since
        $tables = [];
        $saved = get_option('wisecampaign_product_table_settings', []);
        foreach ((array) ($saved['tables'] ?? []) as $table) {
            if (is_array($table) && !empty($table['id'])) {
                $tables[(int) $table['id']] = ['id' => (int) $table['id'], 'name' => (string) ($table['name'] ?? ''), 'views' => 0, 'addToCart' => 0, 'orders' => 0, 'revenue' => 0.0, 'items' => 0];
            }
        }
        $blank = function ($id) {
            /* translators: %d: product table id */
            return ['id' => $id, 'name' => $id ? sprintf(__('Deleted table #%d', 'wisecampaign'), $id) : __('Unknown table', 'wisecampaign'), 'views' => 0, 'addToCart' => 0, 'orders' => 0, 'revenue' => 0.0, 'items' => 0];
        };
        foreach ((array) $wpdb->get_results($wpdb->prepare(
            "SELECT object_id, event, SUM(count) AS total FROM {$stats}
            WHERE module = 'producttable' AND stat_date BETWEEN %s AND %s GROUP BY object_id, event",
            $from,
            $to
        ), ARRAY_A) as $row) {
            $id = (int) $row['object_id'];
            $tables[$id] = $tables[$id] ?? $blank($id);
            if ($row['event'] === 'view') {
                $tables[$id]['views'] += (int) $row['total'];
            } elseif ($row['event'] === 'add_to_cart') {
                $tables[$id]['addToCart'] += (int) $row['total'];
            }
        }
        foreach ((array) $wpdb->get_results($wpdb->prepare(
            "SELECT object_id, COUNT(DISTINCT order_id) AS orders, SUM(revenue) AS revenue, SUM(items) AS items FROM {$orders}
            WHERE module = 'producttable' AND type = 'direct' AND order_date BETWEEN %s AND %s GROUP BY object_id",
            $from,
            $to
        ), ARRAY_A) as $row) {
            $id = (int) $row['object_id'];
            $tables[$id] = $tables[$id] ?? $blank($id);
            $tables[$id]['orders'] = (int) $row['orders'];
            $tables[$id]['revenue'] = round((float) $row['revenue'], 2);
            $tables[$id]['items'] = (int) $row['items'];
        }

        return [
            'discountmanager' => $rules,
            'producttable'    => array_values($tables),
        ];
    }

    /**
     * Totals, a daily series and per-module numbers for one date range.
     */
    private function summarize($from, $to)
    {
        global $wpdb;
        $stats = self::stats_table();
        $orders = self::orders_table();

        // Events per module (wiseBanner's come from its own table)
        $events = [];
        foreach ((array) $wpdb->get_results($wpdb->prepare(
            "SELECT module, event, SUM(count) AS total FROM {$stats} WHERE stat_date BETWEEN %s AND %s GROUP BY module, event",
            $from,
            $to
        ), ARRAY_A) as $row) {
            $events[$row['module']][$row['event']] = (int) $row['total'];
        }
        $banner_table = BannerAnalytics::table_name();
        if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $banner_table)) === $banner_table) {
            foreach ((array) $wpdb->get_results($wpdb->prepare(
                "SELECT event, SUM(count) AS total FROM {$banner_table} WHERE stat_date BETWEEN %s AND %s AND event IN ('view', 'click') GROUP BY event",
                $from,
                $to
            ), ARRAY_A) as $row) {
                $events['banner'][$row['event']] = (int) $row['total'];
            }
        }

        // Orders each module took part in, valued at the whole order (minus refunds)
        $influence = [];
        foreach ((array) $wpdb->get_results($wpdb->prepare(
            "SELECT m.module, COUNT(*) AS orders, SUM(s.revenue) AS revenue
            FROM (SELECT DISTINCT order_id, module FROM {$orders} WHERE module <> 'store' AND order_date BETWEEN %s AND %s) m
            JOIN {$orders} s ON s.order_id = m.order_id AND s.module = 'store'
            GROUP BY m.module",
            $from,
            $to
        ), ARRAY_A) as $row) {
            $influence[$row['module']] = ['orders' => (int) $row['orders'], 'revenue' => (float) $row['revenue']];
        }
        $direct = [];
        foreach ((array) $wpdb->get_results($wpdb->prepare(
            "SELECT module, SUM(revenue) AS revenue, SUM(items) AS items, SUM(discount) AS discount, type
            FROM {$orders} WHERE type IN ('direct', 'discount') AND order_date BETWEEN %s AND %s GROUP BY module, type",
            $from,
            $to
        ), ARRAY_A) as $row) {
            $direct[$row['module']][$row['type']] = $row;
        }

        $modules = [];
        foreach (array_keys(Modules::PAGES) as $id) {
            $e = $events[$id] ?? [];
            $modules[] = [
                'id'            => $id,
                'events'        => (object) $e,
                'addToCart'     => $e['add_to_cart'] ?? 0,
                'orders'        => $influence[$id]['orders'] ?? 0,
                'revenue'       => round($influence[$id]['revenue'] ?? 0, 2),
                'directRevenue' => round((float) ($direct[$id]['direct']['revenue'] ?? 0), 2),
                'directItems'   => (int) ($direct[$id]['direct']['items'] ?? 0),
                'discount'      => round((float) ($direct[$id]['discount']['discount'] ?? 0), 2),
            ];
        }

        // Whole store compared with orders any module took part in
        $store = $wpdb->get_row($wpdb->prepare(
            "SELECT COUNT(*) AS orders, COALESCE(SUM(revenue), 0) AS revenue FROM {$orders}
            WHERE module = 'store' AND order_date BETWEEN %s AND %s",
            $from,
            $to
        ), ARRAY_A);
        $influenced_sql = "SELECT order_id FROM {$orders} WHERE module <> 'store' AND order_date BETWEEN %s AND %s";
        $wise = $wpdb->get_row($wpdb->prepare(
            "SELECT COUNT(*) AS orders, COALESCE(SUM(revenue), 0) AS revenue FROM {$orders}
            WHERE module = 'store' AND order_date BETWEEN %s AND %s AND order_id IN ({$influenced_sql})",
            $from,
            $to,
            $from,
            $to
        ), ARRAY_A);

        $store_orders = (int) $store['orders'];
        $store_revenue = (float) $store['revenue'];
        $wise_orders = (int) $wise['orders'];
        $wise_revenue = (float) $wise['revenue'];
        $other_orders = $store_orders - $wise_orders;

        $totals = [
            'storeRevenue' => round($store_revenue, 2),
            'storeOrders'  => $store_orders,
            'revenue'      => round($wise_revenue, 2),
            'orders'       => $wise_orders,
            'aov'          => $wise_orders ? round($wise_revenue / $wise_orders, 2) : 0,
            'aovOthers'    => $other_orders ? round(($store_revenue - $wise_revenue) / $other_orders, 2) : 0,
        ];

        // Daily series with every date present, so the chart has no gaps
        $daily = [];
        $cursor = new \DateTimeImmutable($from, wp_timezone());
        $end = new \DateTimeImmutable($to, wp_timezone());
        while ($cursor <= $end) {
            $daily[$cursor->format('Y-m-d')] = ['date' => $cursor->format('Y-m-d'), 'storeRevenue' => 0, 'revenue' => 0, 'orders' => 0, 'interactions' => 0];
            $cursor = $cursor->modify('+1 day');
        }
        foreach ((array) $wpdb->get_results($wpdb->prepare(
            "SELECT order_date, SUM(revenue) AS revenue FROM {$orders} WHERE module = 'store' AND order_date BETWEEN %s AND %s GROUP BY order_date",
            $from,
            $to
        ), ARRAY_A) as $row) {
            $daily[$row['order_date']]['storeRevenue'] = round((float) $row['revenue'], 2);
        }
        foreach ((array) $wpdb->get_results($wpdb->prepare(
            "SELECT order_date, COUNT(*) AS orders, SUM(revenue) AS revenue FROM {$orders}
            WHERE module = 'store' AND order_date BETWEEN %s AND %s AND order_id IN ({$influenced_sql}) GROUP BY order_date",
            $from,
            $to,
            $from,
            $to
        ), ARRAY_A) as $row) {
            $daily[$row['order_date']]['revenue'] = round((float) $row['revenue'], 2);
            $daily[$row['order_date']]['orders'] = (int) $row['orders'];
        }
        foreach ((array) $wpdb->get_results($wpdb->prepare(
            "SELECT stat_date, SUM(count) AS total FROM {$stats} WHERE stat_date BETWEEN %s AND %s GROUP BY stat_date",
            $from,
            $to
        ), ARRAY_A) as $row) {
            if (isset($daily[$row['stat_date']])) {
                $daily[$row['stat_date']]['interactions'] = (int) $row['total'];
            }
        }

        $interactions = 0;
        foreach ($events as $module_events) {
            $interactions += array_sum($module_events);
        }

        return [
            'modules'      => $modules,
            'totals'       => $totals,
            'interactions' => $interactions,
            'daily'        => array_values($daily),
        ];
    }

    private function get_currency()
    {
        return function_exists('get_woocommerce_currency_symbol') ? [
            // Some symbols come with a non-breaking space (৳&nbsp;); the position setting adds spacing
            'symbol'      => trim(html_entity_decode(get_woocommerce_currency_symbol(), ENT_QUOTES, 'UTF-8'), " \u{00A0}"),
            'position'    => get_option('woocommerce_currency_pos', 'left'),
            'decimals'    => wc_get_price_decimals(),
            'decimalSep'  => wc_get_price_decimal_separator(),
            'thousandSep' => wc_get_price_thousand_separator(),
        ] : ['symbol' => '$', 'position' => 'left', 'decimals' => 2, 'decimalSep' => '.', 'thousandSep' => ','];
    }
}
