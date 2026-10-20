<?php

namespace WISECAMPAIGN\Classes;

if (!defined('ABSPATH')) {
    exit;
}

use WISECAMPAIGN\Traits\SingletonTrait;

/**
 * Turns whole modules on and off from the Getting Started page.
 *
 * A module that is off is not loaded at all: it has no admin menu item, no REST routes and no
 * storefront output. Every module is on until the store owner turns it off. This is separate from
 * each module's own on/off switch inside its dashboard, which keeps the settings screen available.
 */
class Modules
{
    use SingletonTrait;

    const OPTION = 'wisecampaign_modules';

    /**
     * Module ids (as used by modules/getting-started) and their admin page slugs, in admin menu order.
     */
    const PAGES = [
        'banner'          => 'wise_banner_v2',
        'checkout'        => 'wisecampaign_checkout',
        'socialproof'     => 'wisecampaign_notification',
        'wisecart'        => 'wisecampaign_cart',
        'stockbar'        => 'wise_stock_bar',
        'wisevideo'       => 'wise_video_commerce',
        'producttable'    => 'wise_product_table',
        'discountmanager' => 'wisecampaign_discount_manager',
    ];

    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    /**
     * Whether a module is on. Unknown ids and modules never switched read as on.
     */
    public static function is_enabled($id)
    {
        $saved = get_option(self::OPTION, []);
        return !is_array($saved) || !array_key_exists($id, $saved) || (bool) $saved[$id];
    }

    /**
     * On/off for every module, for the Getting Started page.
     */
    public static function get_states()
    {
        $states = [];
        foreach (array_keys(self::PAGES) as $id) {
            $states[$id] = self::is_enabled($id);
        }
        return $states;
    }

    public function register_rest_routes()
    {
        register_rest_route('wisecampaign/v1', '/modules', [
            [
                'methods'             => 'GET',
                'callback'            => function () {
                    return rest_ensure_response(['modules' => self::get_states()]);
                },
                'permission_callback' => [$this, 'can_manage'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'rest_set_module'],
                'permission_callback' => [$this, 'can_manage'],
                'args'                => [
                    'id'      => ['required' => true, 'type' => 'string', 'enum' => array_keys(self::PAGES)],
                    'enabled' => ['required' => true, 'type' => 'boolean'],
                ],
            ],
        ]);
    }

    public function can_manage()
    {
        return current_user_can('manage_options');
    }

    public function rest_set_module(\WP_REST_Request $request)
    {
        $saved = get_option(self::OPTION, []);
        $saved = is_array($saved) ? $saved : [];
        $saved[$request['id']] = (bool) $request['enabled'];
        update_option(self::OPTION, array_intersect_key($saved, self::PAGES));

        $response = rest_ensure_response(['success' => true, 'modules' => self::get_states()]);
        $response->header('Cache-Control', 'no-store');
        return $response;
    }
}
