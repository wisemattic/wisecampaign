<?php

namespace WISECAMPAIGN\Rewards;

if (!defined('ABSPATH')) {
    exit;
}

use Automattic\WooCommerce\Blocks\Integrations\IntegrationInterface;

/**
 * Loads includes/js/wiserewards-blocks.js in the Cart and Checkout blocks. The script reads the
 * cart's "wiserewards" data (Redemption::store_api_data) and sends the points to use back with
 * extensionCartUpdate.
 */
class BlocksIntegration implements IntegrationInterface
{
    public function get_name()
    {
        return 'wiserewards';
    }

    public function initialize()
    {
        $file = WISECAMPAIGN_DIR_PATH . 'includes/js/wiserewards-blocks.js';
        wp_register_script(
            'wiserewards-blocks',
            WISECAMPAIGN_DIR_URL . 'includes/js/wiserewards-blocks.js',
            ['wp-element', 'wp-data', 'wp-plugins', 'wp-i18n', 'wc-blocks-checkout', 'wc-blocks-data-store', 'wc-settings'],
            file_exists($file) ? filemtime($file) : WISECAMPAIGN_VERSION,
            true
        );
        $css = WISECAMPAIGN_DIR_PATH . 'includes/css/wiserewards.css';
        wp_enqueue_style('wiserewards', WISECAMPAIGN_DIR_URL . 'includes/css/wiserewards.css', [], file_exists($css) ? filemtime($css) : WISECAMPAIGN_VERSION);
    }

    public function get_script_handles()
    {
        return ['wiserewards-blocks'];
    }

    public function get_editor_script_handles()
    {
        return [];
    }

    public function get_script_data()
    {
        return [
            'i18n' => [
                'have'    => __('You have %1$s worth %2$s.', 'wisecampaign'),
                'upTo'    => __('Up to %1$s (%2$s) on this order.', 'wisecampaign'),
                'using'   => __('Using %1$s (−%2$s)', 'wisecampaign'),
                'use'     => __('Use points', 'wisecampaign'),
                'remove'  => __('Remove', 'wisecampaign'),
                'signIn'  => __('Sign in', 'wisecampaign'),
                'label'   => __('Points to use', 'wisecampaign'),
                'error'   => __('Your points could not be used. Please try again.', 'wisecampaign'),
            ],
        ];
    }
}
