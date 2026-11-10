<?php

namespace WISECAMPAIGN\Rewards;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * wiseRewards settings: one option, read through get() and written through save().
 *
 * The Pro keys (referral, birthday, tiers, campaigns) live here too, so the admin app saves
 * everything in one request; only wiseCampaign Pro acts on them.
 */
class Settings
{
    const OPTION = 'wiserewards_settings';

    private static $cache = null;

    public static function defaults()
    {
        return [
            'enabled'            => false,
            'programName'        => __('Reward Points', 'wisecampaign'),
            'pointLabel'         => __('point', 'wisecampaign'),
            'pointsLabel'        => __('points', 'wisecampaign'),

            // Earn
            'earnPurchase'       => true,
            'earnPoints'         => 1,
            'earnAmount'         => 1,
            'earnStatus'         => 'completed',
            'earnSignup'         => true,
            'signupPoints'       => 100,
            'signupNeedsOrder'   => true,
            'earnReview'         => true,
            'reviewPoints'       => 50,
            'reviewVerifiedOnly' => true,

            // Redeem
            'redeemEnabled'      => true,
            'redeemPoints'       => 100,
            'redeemAmount'       => 1,
            'redeemMinPoints'    => 0,
            'redeemMaxPercent'   => 100,
            'redeemOnCart'       => true,
            'redeemOnCheckout'   => true,

            // Storefront
            'showProductMessage' => true,
            /* translators: {points} is replaced with the number of points, such as "120 points" */
            'productMessage'     => __('Earn {points} with this purchase', 'wisecampaign'),
            'showCartMessage'    => true,
            /* translators: {points} is replaced with the number of points, such as "120 points" */
            'cartMessage'        => __("You'll earn {points} with this order", 'wisecampaign'),
            'showGuestMessage'   => true,
            /* translators: {points} is replaced with the number of points, such as "120 points" */
            'guestMessage'       => __('Sign in or create an account to earn {points} with this order', 'wisecampaign'),
            'accountTab'         => true,

            // Expiry: the balance expires after this many months without earning or spending
            'expiryEnabled'      => false,
            'expiryMonths'       => 12,

            // Pro
            'referralEnabled'    => false,
            'referrerPoints'     => 500,
            'friendPoints'       => 200,
            'birthdayEnabled'    => false,
            'birthdayPoints'     => 200,
            'tiersEnabled'       => false,
            'tiers'              => [
                ['name' => __('Bronze', 'wisecampaign'), 'min' => 0, 'multiplier' => 1],
                ['name' => __('Silver', 'wisecampaign'), 'min' => 1000, 'multiplier' => 1.25],
                ['name' => __('Gold', 'wisecampaign'), 'min' => 5000, 'multiplier' => 1.5],
            ],
            'campaigns'          => [],
        ];
    }

    /**
     * All settings, or one of them.
     */
    public static function get($key = null)
    {
        if (self::$cache === null) {
            $saved = get_option(self::OPTION, []);
            self::$cache = array_merge(self::defaults(), is_array($saved) ? $saved : []);
        }
        return $key === null ? self::$cache : (self::$cache[$key] ?? null);
    }

    /**
     * Saves a full settings payload. "enabled" keeps its saved value unless $with_status.
     */
    public static function save($input, $with_status = false)
    {
        $settings = self::sanitize(is_array($input) ? $input : []);
        if (!$with_status) {
            $settings['enabled'] = (bool) self::get('enabled');
        }
        update_option(self::OPTION, $settings);
        self::$cache = null;
        return self::get();
    }

    public static function set_enabled($enabled)
    {
        $settings = self::get();
        $settings['enabled'] = (bool) $enabled;
        update_option(self::OPTION, $settings);
        self::$cache = null;
    }

    private static function sanitize(array $in)
    {
        $d = self::defaults();
        $bool = function ($key) use ($in, $d) {
            return array_key_exists($key, $in) ? filter_var($in[$key], FILTER_VALIDATE_BOOLEAN) : $d[$key];
        };
        $int = function ($key, $min, $max) use ($in, $d) {
            $v = isset($in[$key]) && is_numeric($in[$key]) ? (int) round((float) $in[$key]) : $d[$key];
            return max($min, min($max, $v));
        };
        $num = function ($key, $min, $max) use ($in, $d) {
            $v = isset($in[$key]) && is_numeric($in[$key]) ? (float) $in[$key] : $d[$key];
            return round(max($min, min($max, $v)), 4);
        };
        $text = function ($key, $max = 160) use ($in, $d) {
            $v = isset($in[$key]) && is_scalar($in[$key]) ? trim(sanitize_text_field((string) $in[$key])) : '';
            return $v === '' ? $d[$key] : mb_substr($v, 0, $max);
        };

        $out = [
            'enabled'            => $bool('enabled'),
            'programName'        => $text('programName', 60),
            'pointLabel'         => $text('pointLabel', 30),
            'pointsLabel'        => $text('pointsLabel', 30),
            'earnPurchase'       => $bool('earnPurchase'),
            'earnPoints'         => $int('earnPoints', 1, 100000),
            'earnAmount'         => $num('earnAmount', 0.01, 1000000),
            'earnStatus'         => in_array($in['earnStatus'] ?? '', ['processing', 'completed'], true) ? $in['earnStatus'] : $d['earnStatus'],
            'earnSignup'         => $bool('earnSignup'),
            'signupPoints'       => $int('signupPoints', 0, 1000000),
            'signupNeedsOrder'   => $bool('signupNeedsOrder'),
            'earnReview'         => $bool('earnReview'),
            'reviewPoints'       => $int('reviewPoints', 0, 1000000),
            'reviewVerifiedOnly' => $bool('reviewVerifiedOnly'),
            'redeemEnabled'      => $bool('redeemEnabled'),
            'redeemPoints'       => $int('redeemPoints', 1, 1000000),
            'redeemAmount'       => $num('redeemAmount', 0.01, 1000000),
            'redeemMinPoints'    => $int('redeemMinPoints', 0, 1000000),
            'redeemMaxPercent'   => $int('redeemMaxPercent', 1, 100),
            'redeemOnCart'       => $bool('redeemOnCart'),
            'redeemOnCheckout'   => $bool('redeemOnCheckout'),
            'showProductMessage' => $bool('showProductMessage'),
            'productMessage'     => $text('productMessage'),
            'showCartMessage'    => $bool('showCartMessage'),
            'cartMessage'        => $text('cartMessage'),
            'showGuestMessage'   => $bool('showGuestMessage'),
            'guestMessage'       => $text('guestMessage'),
            'accountTab'         => $bool('accountTab'),
            'expiryEnabled'      => $bool('expiryEnabled'),
            'expiryMonths'       => $int('expiryMonths', 1, 120),
            'referralEnabled'    => $bool('referralEnabled'),
            'referrerPoints'     => $int('referrerPoints', 0, 1000000),
            'friendPoints'       => $int('friendPoints', 0, 1000000),
            'birthdayEnabled'    => $bool('birthdayEnabled'),
            'birthdayPoints'     => $int('birthdayPoints', 0, 1000000),
            'tiersEnabled'       => $bool('tiersEnabled'),
        ];

        // Tiers: unique names, sorted by the lifetime points they need; the first always starts at 0
        $tiers = [];
        foreach (array_slice((array) ($in['tiers'] ?? $d['tiers']), 0, 10) as $tier) {
            if (!is_array($tier)) {
                continue;
            }
            $name = mb_substr(trim(sanitize_text_field((string) ($tier['name'] ?? ''))), 0, 40);
            if ($name === '') {
                continue;
            }
            $tiers[] = [
                'name'       => $name,
                'min'        => max(0, min(100000000, (int) ($tier['min'] ?? 0))),
                'multiplier' => round(max(0.1, min(10, (float) ($tier['multiplier'] ?? 1))), 2),
            ];
        }
        usort($tiers, function ($a, $b) {
            return $a['min'] <=> $b['min'];
        });
        if ($tiers) {
            $tiers[0]['min'] = 0;
        }
        $out['tiers'] = $tiers ?: $d['tiers'];

        // Campaigns: a points multiplier between two dates (Y-m-d, store time zone, end inclusive)
        $campaigns = [];
        foreach (array_slice((array) ($in['campaigns'] ?? []), 0, 20) as $campaign) {
            if (!is_array($campaign)) {
                continue;
            }
            $start = self::date($campaign['start'] ?? '');
            $end = self::date($campaign['end'] ?? '');
            if (!$start || !$end || $end < $start) {
                continue;
            }
            $campaigns[] = [
                'id'         => sanitize_key($campaign['id'] ?? '') ?: 'c' . wp_generate_password(8, false, false),
                'name'       => mb_substr(trim(sanitize_text_field((string) ($campaign['name'] ?? ''))), 0, 60) ?: __('Bonus points', 'wisecampaign'),
                'multiplier' => round(max(1, min(10, (float) ($campaign['multiplier'] ?? 2))), 2),
                'start'      => $start,
                'end'        => $end,
                'active'     => filter_var($campaign['active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ];
        }
        $out['campaigns'] = $campaigns;

        return $out;
    }

    private static function date($value)
    {
        $value = is_string($value) ? trim($value) : '';
        $date = \DateTime::createFromFormat('!Y-m-d', $value);
        return $date && $date->format('Y-m-d') === $value ? $value : '';
    }

    /**
     * The program runs: switched on in its dashboard, with WooCommerce.
     */
    public static function is_active()
    {
        return (bool) self::get('enabled') && function_exists('WC');
    }

    public static function is_pro()
    {
        return class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')
            && \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
    }

    /**
     * Store currency per point when redeeming.
     */
    public static function point_value()
    {
        return (float) self::get('redeemAmount') / max(1, (int) self::get('redeemPoints'));
    }

    public static function points_to_value($points)
    {
        return round(max(0, (int) $points) * self::point_value(), wc_get_price_decimals());
    }

    /**
     * "1 point", "1,250 points".
     */
    public static function label($points)
    {
        $points = (int) $points;
        return number_format_i18n($points) . ' ' . (abs($points) === 1 ? self::get('pointLabel') : self::get('pointsLabel'));
    }

    /**
     * A storefront message with {points} filled in. The text is escaped; the points are bold.
     */
    public static function message($key, $points)
    {
        $text = esc_html((string) self::get($key));
        $points = '<strong class="wiserewards-points">' . esc_html(self::label($points)) . '</strong>';
        return str_replace(esc_html('{points}'), $points, $text);
    }
}
