<?php

namespace WISECAMPAIGN\Rewards;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST routes for the wiseRewards dashboard (modules/wise-rewards), all under wisecampaign/v1/rewards.
 */
class Admin
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function can_manage()
    {
        return current_user_can('manage_options');
    }

    public function register_routes()
    {
        $ns = 'wisecampaign/v1';
        $perm = [$this, 'can_manage'];

        register_rest_route($ns, '/rewards', [
            ['methods' => 'GET', 'callback' => [$this, 'get_dashboard'], 'permission_callback' => $perm],
            ['methods' => 'POST', 'callback' => [$this, 'save_settings'], 'permission_callback' => $perm],
        ]);
        register_rest_route($ns, '/rewards/status', [
            'methods'             => 'POST',
            'callback'            => [$this, 'set_status'],
            'permission_callback' => $perm,
            'args'                => ['enabled' => ['required' => true, 'type' => 'boolean']],
        ]);
        register_rest_route($ns, '/rewards/customers', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_customers'],
            'permission_callback' => $perm,
            'args'                => [
                'search'  => ['default' => '', 'sanitize_callback' => 'sanitize_text_field'],
                'page'    => ['default' => 1, 'sanitize_callback' => 'absint'],
                'orderby' => ['default' => 'balance', 'enum' => ['balance', 'earned', 'redeemed', 'recent']],
            ],
        ]);
        register_rest_route($ns, '/rewards/customers/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_customer'],
                'permission_callback' => $perm,
                'args'                => ['page' => ['default' => 1, 'sanitize_callback' => 'absint']],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'adjust'],
                'permission_callback' => $perm,
                'args'                => [
                    'points' => ['required' => true, 'type' => 'integer'],
                    'note'   => ['default' => '', 'sanitize_callback' => 'sanitize_text_field'],
                ],
            ],
        ]);
        // Any account, to give points to someone who has none yet
        register_rest_route($ns, '/rewards/users', [
            'methods'             => 'GET',
            'callback'            => [$this, 'search_users'],
            'permission_callback' => $perm,
            'args'                => ['search' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field']],
        ]);
    }

    private function no_store($data)
    {
        $response = rest_ensure_response($data);
        $response->header('Cache-Control', 'no-store');
        return $response;
    }

    public function get_dashboard()
    {
        Ledger::maybe_create_table();
        $has_wc = function_exists('WC');
        return $this->no_store([
            'settings'       => Settings::get(),
            'defaults'       => Settings::defaults(),
            'stats'          => Ledger::stats(30),
            'isPro'          => Settings::is_pro(),
            'hasWc'          => $has_wc,
            'couponsEnabled' => $has_wc && wc_coupons_enabled(),
            'currency'       => $has_wc ? [
                'symbol'      => trim(html_entity_decode(get_woocommerce_currency_symbol(), ENT_QUOTES, 'UTF-8'), " \u{00A0}"),
                'position'    => get_option('woocommerce_currency_pos', 'left'),
                'decimals'    => wc_get_price_decimals(),
                'decimalSep'  => wc_get_price_decimal_separator(),
                'thousandSep' => wc_get_price_thousand_separator(),
            ] : ['symbol' => '$', 'position' => 'left', 'decimals' => 2, 'decimalSep' => '.', 'thousandSep' => ','],
            'accountUrl'     => $has_wc ? wc_get_account_endpoint_url(Storefront::ENDPOINT) : '',
            'sample'         => $has_wc ? $this->sample_product() : null,
        ]);
    }

    /**
     * A product for the dashboard's preview.
     */
    private function sample_product()
    {
        $products = wc_get_products(['limit' => 1, 'status' => 'publish', 'type' => ['simple'], 'orderby' => 'date', 'order' => 'DESC']);
        if (!$products) {
            return ['name' => __('Leather Weekender Bag', 'wisecampaign'), 'price' => 120.0, 'image' => wc_placeholder_img_src('woocommerce_thumbnail')];
        }
        $product = $products[0];
        return [
            'name'  => $product->get_name(),
            'price' => (float) wc_get_price_excluding_tax($product),
            'image' => wp_get_attachment_image_url($product->get_image_id(), 'woocommerce_thumbnail') ?: wc_placeholder_img_src('woocommerce_thumbnail'),
        ];
    }

    public function save_settings(\WP_REST_Request $request)
    {
        $settings = Settings::save((array) $request->get_json_params());
        return $this->no_store(['success' => true, 'settings' => $settings]);
    }

    public function set_status(\WP_REST_Request $request)
    {
        Settings::set_enabled((bool) $request['enabled']);
        if ($request['enabled']) {
            Ledger::maybe_create_table();
        }
        return $this->no_store(['success' => true, 'enabled' => (bool) Settings::get('enabled')]);
    }

    public function get_customers(\WP_REST_Request $request)
    {
        return $this->no_store(Ledger::customers((string) $request['search'], (int) $request['page'], 20, (string) $request['orderby']) + ['perPage' => 20]);
    }

    private function customer_payload($user_id, $page = 1)
    {
        $user = get_userdata($user_id);
        if (!$user) {
            return new \WP_Error('not_found', __('Customer not found.', 'wisecampaign'), ['status' => 404]);
        }
        $expires = Earning::expires_at($user_id);
        return [
            'customer' => [
                'id'            => $user_id,
                'name'          => $user->display_name,
                'email'         => $user->user_email,
                'avatar'        => get_avatar_url($user_id, ['size' => 96]),
                'balance'       => Ledger::balance($user_id),
                'lifetime'      => Ledger::lifetime($user_id),
                'pendingSignup' => Earning::pending_signup_bonus($user_id),
                'expiresText'   => $expires ? date_i18n(get_option('date_format'), $expires) : '',
                'editUrl'       => get_edit_user_link($user_id),
                /** Extra facts about the customer, such as their tier (wiseCampaign Pro). */
                'extra'         => (object) apply_filters('wiserewards_admin_customer', [], $user_id),
            ],
            'history'  => Ledger::history($user_id, $page, 20) + ['perPage' => 20],
        ];
    }

    public function get_customer(\WP_REST_Request $request)
    {
        $payload = $this->customer_payload((int) $request['id'], (int) $request['page']);
        return is_wp_error($payload) ? $payload : $this->no_store($payload);
    }

    public function adjust(\WP_REST_Request $request)
    {
        $user_id = (int) $request['id'];
        $points = (int) $request['points'];
        if (!get_userdata($user_id)) {
            return new \WP_Error('not_found', __('Customer not found.', 'wisecampaign'), ['status' => 404]);
        }
        if ($points === 0 || abs($points) > 10000000) {
            return new \WP_Error('invalid_points', __('Enter the points to add, or a negative number to take away.', 'wisecampaign'), ['status' => 400]);
        }
        Ledger::add($user_id, $points, 'adjust', 'admin', 0, (string) $request['note'], 0, get_current_user_id());
        return $this->no_store(['success' => true] + $this->customer_payload($user_id));
    }

    public function search_users(\WP_REST_Request $request)
    {
        $search = trim((string) $request['search']);
        if (mb_strlen($search) < 2) {
            return $this->no_store(['users' => []]);
        }
        $users = get_users([
            'search'         => '*' . $search . '*',
            'search_columns' => ['user_login', 'user_email', 'display_name'],
            'number'         => 8,
            'fields'         => ['ID', 'display_name', 'user_email'],
        ]);
        return $this->no_store(['users' => array_map(function ($u) {
            return [
                'id'      => (int) $u->ID,
                'name'    => $u->display_name,
                'email'   => $u->user_email,
                'avatar'  => get_avatar_url((int) $u->ID, ['size' => 64]),
                'balance' => Ledger::balance((int) $u->ID),
            ];
        }, $users)]);
    }
}
