<?php

namespace WISECAMPAIGN\Rewards;

if (!defined('ABSPATH')) {
    exit;
}

use WISECAMPAIGN\Traits\SingletonTrait;

/**
 * wiseRewards: points for signups, purchases and reviews that shoppers spend at checkout.
 *
 * Loaded when the module is on (Getting Started) and WooCommerce is active. The program itself
 * stays off until it is switched on in its dashboard, so updating never starts giving points.
 * wiseCampaign Pro adds referrals, birthdays, tiers, campaigns and analytics through the hooks
 * documented in Earning, Ledger and Storefront.
 */
class Rewards
{
    use SingletonTrait;

    public function __construct()
    {
        new Admin();
        new Redemption();
        new Earning();
        new Storefront();
        new Privacy();

        $register = function ($registry) {
            if (Settings::is_active() && !$registry->is_registered('wiserewards')) {
                $registry->register(new BlocksIntegration());
            }
        };
        add_action('woocommerce_blocks_cart_block_registration', $register);
        add_action('woocommerce_blocks_checkout_block_registration', $register);
    }
}
