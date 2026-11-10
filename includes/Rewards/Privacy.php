<?php

namespace WISECAMPAIGN\Rewards;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Personal data tools (Tools → Export / Erase Personal Data): a customer's points history is
 * exported with their data, and erasing it removes their points.
 */
class Privacy
{
    public function __construct()
    {
        add_filter('wp_privacy_personal_data_exporters', [$this, 'register_exporter']);
        add_filter('wp_privacy_personal_data_erasers', [$this, 'register_eraser']);
    }

    public function register_exporter($exporters)
    {
        $exporters['wiserewards'] = [
            'exporter_friendly_name' => __('wiseRewards points', 'wisecampaign'),
            'callback'               => [$this, 'export'],
        ];
        return $exporters;
    }

    public function register_eraser($erasers)
    {
        $erasers['wiserewards'] = [
            'eraser_friendly_name' => __('wiseRewards points', 'wisecampaign'),
            'callback'             => [$this, 'erase'],
        ];
        return $erasers;
    }

    public function export($email, $page = 1)
    {
        $user = get_user_by('email', $email);
        if (!$user) {
            return ['data' => [], 'done' => true];
        }
        $history = Ledger::history($user->ID, $page, 100);
        $items = [];
        foreach ($history['rows'] as $row) {
            $items[] = [
                'group_id'    => 'wiserewards',
                'group_label' => __('Points history', 'wisecampaign'),
                'item_id'     => 'wiserewards-' . $row['id'],
                'data'        => [
                    ['name' => __('Date', 'wisecampaign'), 'value' => $row['date']],
                    ['name' => __('Activity', 'wisecampaign'), 'value' => $row['text']],
                    ['name' => __('Points', 'wisecampaign'), 'value' => (string) $row['points']],
                    ['name' => __('Balance', 'wisecampaign'), 'value' => (string) $row['balance']],
                ],
            ];
        }
        /**
         * More points data to export, as name/value pairs (wiseCampaign Pro adds the birthday and referral link).
         *
         * @param array $data
         * @param int   $user_id
         */
        $extra = $page === 1 ? (array) apply_filters('wiserewards_export_extra', [], $user->ID) : [];
        if ($extra) {
            $items[] = [
                'group_id'    => 'wiserewards',
                'group_label' => __('Points history', 'wisecampaign'),
                'item_id'     => 'wiserewards-profile',
                'data'        => $extra,
            ];
        }
        return ['data' => $items, 'done' => $page * 100 >= $history['total']];
    }

    public function erase($email, $page = 1)
    {
        global $wpdb;
        $user = get_user_by('email', $email);
        if (!$user) {
            return ['items_removed' => false, 'items_retained' => false, 'messages' => [], 'done' => true];
        }
        $removed = get_option(Ledger::DB_OPTION) ? (int) $wpdb->delete(Ledger::table(), ['user_id' => $user->ID], ['%d']) : 0;
        foreach ([Ledger::BALANCE_META, Ledger::LIFETIME_META, Ledger::ACTIVITY_META, Earning::SIGNUP_PENDING_META] as $key) {
            Ledger::delete_value($user->ID, $key);
        }
        /** Fires after a customer's points data is erased, so wiseCampaign Pro can remove its own. */
        do_action('wiserewards_erase_customer', $user->ID);
        return ['items_removed' => $removed > 0, 'items_retained' => false, 'messages' => [], 'done' => true];
    }
}
