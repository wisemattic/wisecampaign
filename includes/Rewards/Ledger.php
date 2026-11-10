<?php

namespace WISECAMPAIGN\Rewards;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Every points change, one row each, in {prefix}wiserewards_ledger. A customer's balance is the sum
 * of their rows; it is cached in user meta, and refreshed after every change.
 *
 * Types:   earn (+), reverse (− an earn), redeem (−), restore (+ a redeem), expire (−), adjust (±).
 * Sources: order, signup, review, admin, expiry, and from wiseCampaign Pro: referral, friend, birthday.
 * object_id is what the row is about (order, comment, user), ref_id a second reference (a review's product).
 */
class Ledger
{
    const DB_VERSION = '1.0.0';
    const DB_OPTION = 'wiserewards_db_version';

    const BALANCE_META = '_wiserewards_balance';
    const LIFETIME_META = '_wiserewards_lifetime';   // points earned, minus reversals (for tiers)
    const ACTIVITY_META = '_wiserewards_activity';   // last earn or spend, as a timestamp (for expiry)

    const TYPES = ['earn', 'reverse', 'redeem', 'restore', 'expire', 'adjust'];

    /**
     * Customer values are kept per site (user options, prefixed like the ledger table), so on a
     * multisite network one store's points never show up in another.
     */
    public static function get_value($user_id, $key)
    {
        $value = get_user_option($key, absint($user_id));
        return $value === false ? '' : $value;
    }

    public static function set_value($user_id, $key, $value)
    {
        update_user_option(absint($user_id), $key, $value);
    }

    public static function delete_value($user_id, $key)
    {
        delete_user_option(absint($user_id), $key);
    }

    /** The meta_key a value is stored under on this site, for queries. */
    public static function meta_key($key)
    {
        global $wpdb;
        return $wpdb->get_blog_prefix() . $key;
    }

    public static function table()
    {
        global $wpdb;
        return $wpdb->prefix . 'wiserewards_ledger';
    }

    public static function maybe_create_table()
    {
        if (get_option(self::DB_OPTION) === self::DB_VERSION) {
            return;
        }
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $table = self::table();
        dbDelta("CREATE TABLE {$table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            points int(11) NOT NULL,
            balance int(11) NOT NULL DEFAULT 0,
            type varchar(16) NOT NULL,
            source varchar(20) NOT NULL,
            object_id bigint(20) unsigned NOT NULL DEFAULT 0,
            ref_id bigint(20) unsigned NOT NULL DEFAULT 0,
            note varchar(255) NOT NULL DEFAULT '',
            created_by bigint(20) unsigned NOT NULL DEFAULT 0,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY source_object (source,object_id),
            KEY created_at (created_at)
        ) {$wpdb->get_charset_collate()};");
        update_option(self::DB_OPTION, self::DB_VERSION);
    }

    /**
     * Adds a row and refreshes the customer's balance.
     *
     * @return int|false The row id.
     */
    public static function add($user_id, $points, $type, $source, $object_id = 0, $note = '', $ref_id = 0, $created_by = 0)
    {
        global $wpdb;
        $user_id = absint($user_id);
        $points = (int) $points;
        if (!$user_id || $points === 0 || !in_array($type, self::TYPES, true)) {
            return false;
        }
        self::maybe_create_table();

        $ok = $wpdb->insert(self::table(), [
            'user_id'    => $user_id,
            'points'     => $points,
            'type'       => $type,
            'source'     => sanitize_key($source),
            'object_id'  => absint($object_id),
            'ref_id'     => absint($ref_id),
            'note'       => mb_substr(sanitize_text_field((string) $note), 0, 255),
            'created_by' => absint($created_by),
            'created_at' => current_time('mysql', true),
        ], ['%d', '%d', '%s', '%s', '%d', '%d', '%s', '%d', '%s']);
        if (!$ok) {
            return false;
        }
        $id = (int) $wpdb->insert_id;

        $balance = self::refresh($user_id);
        $wpdb->update(self::table(), ['balance' => $balance], ['id' => $id], ['%d'], ['%d']);
        if ($type !== 'expire') {
            self::set_value($user_id, self::ACTIVITY_META, time());
        }

        /**
         * Fires after a customer's points change.
         *
         * @param int    $user_id
         * @param int    $points  Change, negative when points were taken.
         * @param string $type
         * @param string $source
         * @param int    $object_id
         */
        do_action('wiserewards_points_changed', $user_id, $points, $type, $source, absint($object_id));
        return $id;
    }

    /**
     * Recomputes and caches a customer's balance and lifetime points.
     */
    public static function refresh($user_id)
    {
        global $wpdb;
        $table = self::table();
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT COALESCE(SUM(points), 0) AS balance,
                COALESCE(SUM(CASE WHEN type IN ('earn', 'reverse') THEN points ELSE 0 END), 0) AS lifetime
            FROM {$table} WHERE user_id = %d",
            $user_id
        ), ARRAY_A);
        $balance = (int) ($row['balance'] ?? 0);
        self::set_value($user_id, self::BALANCE_META, $balance);
        self::set_value($user_id, self::LIFETIME_META, max(0, (int) ($row['lifetime'] ?? 0)));
        return $balance;
    }

    public static function balance($user_id)
    {
        $user_id = absint($user_id);
        if (!$user_id) {
            return 0;
        }
        $cached = self::get_value($user_id, self::BALANCE_META);
        return $cached === '' ? (get_option(self::DB_OPTION) ? self::refresh($user_id) : 0) : (int) $cached;
    }

    public static function lifetime($user_id)
    {
        $cached = self::get_value($user_id, self::LIFETIME_META);
        return $cached === '' ? 0 : (int) $cached;
    }

    /**
     * Sum of the rows about one thing, such as the points an order earned so far.
     */
    public static function sum_for($source, $object_id, array $types, $user_id = 0)
    {
        global $wpdb;
        if (!get_option(self::DB_OPTION)) {
            return 0;
        }
        $types = array_values(array_intersect($types, self::TYPES));
        if (!$types) {
            return 0;
        }
        $sql = $wpdb->prepare(
            'SELECT COALESCE(SUM(points), 0) FROM ' . self::table() . ' WHERE source = %s AND object_id = %d AND type IN (' . implode(',', array_fill(0, count($types), '%s')) . ')',
            array_merge([$source, $object_id], $types)
        );
        if ($user_id) {
            $sql .= $wpdb->prepare(' AND user_id = %d', $user_id);
        }
        return (int) $wpdb->get_var($sql);
    }

    /**
     * Whether a customer already has a row from this source about this reference (a review's product).
     */
    public static function has_ref($user_id, $source, $ref_id)
    {
        global $wpdb;
        if (!get_option(self::DB_OPTION)) {
            return false;
        }
        return (bool) $wpdb->get_var($wpdb->prepare(
            'SELECT 1 FROM ' . self::table() . " WHERE user_id = %d AND source = %s AND ref_id = %d AND type = 'earn' LIMIT 1",
            $user_id,
            $source,
            $ref_id
        ));
    }

    /**
     * A customer's rows, newest first.
     */
    public static function history($user_id, $page = 1, $per_page = 20)
    {
        global $wpdb;
        if (!get_option(self::DB_OPTION)) {
            return ['rows' => [], 'total' => 0];
        }
        $table = self::table();
        $per_page = max(1, min(100, (int) $per_page));
        $offset = (max(1, (int) $page) - 1) * $per_page;
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT id, points, balance, type, source, object_id, ref_id, note, created_by, created_at FROM {$table}
            WHERE user_id = %d ORDER BY id DESC LIMIT %d OFFSET %d",
            $user_id,
            $per_page,
            $offset
        ), ARRAY_A);
        $total = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE user_id = %d", $user_id));
        return ['rows' => array_map([__CLASS__, 'describe'], (array) $rows), 'total' => $total];
    }

    /**
     * A row with a readable description and its date in the site's time zone.
     */
    public static function describe(array $row)
    {
        $object_id = (int) $row['object_id'];
        switch ($row['source']) {
            case 'order':
                $what = [
                    'earn'    => __('Order #%s', 'wisecampaign'),
                    'reverse' => __('Order #%s refunded or cancelled', 'wisecampaign'),
                    'redeem'  => __('Used on order #%s', 'wisecampaign'),
                    'restore' => __('Returned from order #%s', 'wisecampaign'),
                ][$row['type']] ?? __('Order #%s', 'wisecampaign');
                $text = sprintf($what, $object_id);
                break;
            case 'signup':
                $text = __('Welcome bonus for signing up', 'wisecampaign');
                break;
            case 'review':
                $product = get_the_title((int) $row['ref_id']);
                $text = $row['type'] === 'reverse'
                    ? __('Review removed', 'wisecampaign')
                    /* translators: %s: product name */
                    : ($product ? sprintf(__('Review of %s', 'wisecampaign'), $product) : __('Product review', 'wisecampaign'));
                break;
            case 'expiry':
                $text = __('Points expired', 'wisecampaign');
                break;
            case 'referral':
                $text = __('A friend you referred placed an order', 'wisecampaign');
                break;
            case 'friend':
                $text = __('Welcome bonus from a friend’s referral', 'wisecampaign');
                break;
            case 'birthday':
                $text = __('Happy birthday!', 'wisecampaign');
                break;
            case 'admin':
                $text = __('Adjusted by the store', 'wisecampaign');
                break;
            default:
                $text = __('Points', 'wisecampaign');
        }
        if ($row['note'] !== '' && $row['source'] === 'admin') {
            $text .= ': ' . $row['note'];
        }
        /** Filters the description of a points history row. */
        $text = apply_filters('wiserewards_history_text', $text, $row);

        $date = get_date_from_gmt($row['created_at'], 'Y-m-d H:i:s');
        return [
            'id'       => (int) $row['id'],
            'points'   => (int) $row['points'],
            'balance'  => (int) $row['balance'],
            'type'     => $row['type'],
            'source'   => $row['source'],
            'objectId' => $object_id,
            'text'     => $text,
            'date'     => $date,
            'dateText' => date_i18n(get_option('date_format'), strtotime($date)),
        ];
    }

    /**
     * Customers with points, for the admin list. $search matches name and email.
     */
    public static function customers($search = '', $page = 1, $per_page = 20, $orderby = 'balance')
    {
        global $wpdb;
        if (!get_option(self::DB_OPTION)) {
            return ['rows' => [], 'total' => 0];
        }
        $table = self::table();
        $per_page = max(1, min(100, (int) $per_page));
        $offset = (max(1, (int) $page) - 1) * $per_page;
        $order = [
            'balance'  => 'balance DESC',
            'earned'   => 'earned DESC',
            'redeemed' => 'redeemed DESC',
            'recent'   => 'last_at DESC',
        ][$orderby] ?? 'balance DESC';

        $where = '';
        $args = [];
        if ($search !== '') {
            $like = '%' . $wpdb->esc_like($search) . '%';
            $where = 'WHERE u.user_email LIKE %s OR u.display_name LIKE %s OR u.user_login LIKE %s';
            $args = [$like, $like, $like];
        }
        $base = "FROM (
                SELECT user_id, SUM(points) AS balance,
                    SUM(CASE WHEN type IN ('earn', 'reverse') THEN points ELSE 0 END) AS earned,
                    -SUM(CASE WHEN type IN ('redeem', 'restore') THEN points ELSE 0 END) AS redeemed,
                    MAX(created_at) AS last_at
                FROM {$table} GROUP BY user_id
            ) l JOIN {$wpdb->users} u ON u.ID = l.user_id {$where}";

        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT l.*, u.display_name, u.user_email {$base} ORDER BY {$order}, l.user_id DESC LIMIT %d OFFSET %d",
            array_merge($args, [$per_page, $offset])
        ), ARRAY_A);
        $total = (int) ($args ? $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) {$base}", $args)) : $wpdb->get_var("SELECT COUNT(*) {$base}"));

        return [
            'rows'  => array_map(function ($r) {
                $last = get_date_from_gmt($r['last_at'], 'Y-m-d H:i:s');
                return [
                    'id'       => (int) $r['user_id'],
                    'name'     => $r['display_name'],
                    'email'    => $r['user_email'],
                    'avatar'   => get_avatar_url((int) $r['user_id'], ['size' => 64]),
                    'balance'  => (int) $r['balance'],
                    'earned'   => max(0, (int) $r['earned']),
                    'redeemed' => max(0, (int) $r['redeemed']),
                    'lastText' => date_i18n(get_option('date_format'), strtotime($last)),
                    'editUrl'  => get_edit_user_link((int) $r['user_id']),
                ];
            }, (array) $rows),
            'total' => $total,
        ];
    }

    /**
     * Points given, used and expired over the last $days days, and what customers hold now.
     */
    public static function stats($days = 30)
    {
        global $wpdb;
        $empty = ['issued' => 0, 'redeemed' => 0, 'expired' => 0, 'outstanding' => 0, 'members' => 0, 'days' => $days];
        if (!get_option(self::DB_OPTION)) {
            return $empty;
        }
        $table = self::table();
        $since = gmdate('Y-m-d H:i:s', time() - $days * DAY_IN_SECONDS);
        $period = $wpdb->get_row($wpdb->prepare(
            "SELECT
                COALESCE(SUM(CASE WHEN type IN ('earn', 'reverse') OR (type = 'adjust' AND points > 0) THEN points ELSE 0 END), 0) AS issued,
                -COALESCE(SUM(CASE WHEN type IN ('redeem', 'restore') THEN points ELSE 0 END), 0) AS redeemed,
                -COALESCE(SUM(CASE WHEN type = 'expire' THEN points ELSE 0 END), 0) AS expired
            FROM {$table} WHERE created_at >= %s",
            $since
        ), ARRAY_A);
        $now = $wpdb->get_row(
            "SELECT COALESCE(SUM(b), 0) AS outstanding, COUNT(*) AS members FROM (SELECT SUM(points) AS b FROM {$table} GROUP BY user_id) t WHERE b > 0",
            ARRAY_A
        );
        return [
            'issued'      => max(0, (int) $period['issued']),
            'redeemed'    => max(0, (int) $period['redeemed']),
            'expired'     => max(0, (int) $period['expired']),
            'outstanding' => (int) $now['outstanding'],
            'members'     => (int) $now['members'],
            'days'        => $days,
        ];
    }
}
