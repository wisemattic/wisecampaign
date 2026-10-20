<?php
namespace WISECAMPAIGN\Classes;

use WISECAMPAIGN\Traits\SingletonTrait;
use WP_REST_Request;

if (!defined('ABSPATH')) {
    exit;
}

class StockBar
{

    use SingletonTrait;

    public function __construct()
    {
        // Register REST routes
        add_action('rest_api_init', [$this, 'stockbar_register_rest_routes']);

        // Load frontend hooks only when appropriate
        add_action('wp', [$this, 'load_on_page']);

        // The admin preview draws the stock bar with the storefront stylesheet
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_preview_styles']);
    }

    public function enqueue_admin_preview_styles($hook)
    {
        if (strpos($hook, 'wise_stock_bar') !== false) {
            wp_enqueue_style('wise-stock-bar', WISECAMPAIGN_DIR_URL . 'includes/css/stock-bar.css', [], WISECAMPAIGN_VERSION);
        }
    }

    public function load_on_page()
    {
        // Don't load on admin or if WooCommerce functions aren't available
        if (is_admin() || !function_exists('is_product')) {
            return;
        }

        $defaultStatus = ['stockBarEnabled' => true]; // Default to true if not set for testing
        $status = get_option('wc-stockbar-status', $defaultStatus);
        if (isset($status['stockBarEnabled']) && $status['stockBarEnabled'] == false) {
            return;
        }

        $setting = get_option('wc-stockbar-setting', []);

        // Ensure keys exist before accessing
        $displayOnProductPage = isset($setting['displayOnProductPage']) ? filter_var($setting['displayOnProductPage'], FILTER_VALIDATE_BOOLEAN) : true;
        $displayOnShopPage = isset($setting['displayOnShopPage']) ? filter_var($setting['displayOnShopPage'], FILTER_VALIDATE_BOOLEAN) : false;

        $shows = false;

        // Display stock bar on **Product Page**, outside the add to cart form so it gets the full width
        if ($displayOnProductPage && is_product()) {
            $positions = $this->get_product_positions();
            $position = $setting['productPosition'] ?? 'before_form';
            list($hook, $priority) = $positions[$position] ?? $positions['before_form'];
            add_action($hook, function () {
                $this->cspe_custom_content('single');
            }, $priority);
            $shows = true;

            // On by default: the stock bar already says how many are left
            if (!isset($setting['hideDefaultStock']) || filter_var($setting['hideDefaultStock'], FILTER_VALIDATE_BOOLEAN)) {
                add_filter('woocommerce_get_stock_html', [$this, 'maybe_hide_default_stock'], 10, 2);
            }
        }

        // Display stock bar on **Shop Page**, after the price and before the Add to Cart button
        if ($displayOnShopPage && (is_shop() || is_product_category() || is_product_tag())) {
            add_action('woocommerce_after_shop_loop_item_title', function () {
                $this->cspe_custom_content('loop');
            }, 15);
            $shows = true;
        }

        if ($shows) {
            add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
        }
    }

    /**
     * Removes WooCommerce's "X in stock" text where the stock bar shows the count instead.
     * Other messages, such as "Out of stock", stay.
     */
    public function maybe_hide_default_stock($html, $product)
    {
        if (!$product || !$product->managing_stock() || (int) $product->get_stock_quantity() <= 0) {
            return $html;
        }

        // An ended countdown hides the stock bar, so keep WooCommerce's text then
        $design = $this->get_active_design();
        if ($design['id'] === 'countdown') {
            $expiry = $this->get_timer_expiry($design['config']['timerExpiry'] ?? '');
            if ($expiry !== null && $expiry <= time()) {
                return $html;
            }
        }

        return '';
    }

    /**
     * Product page placements: setting value => [WooCommerce hook, priority].
     */
    private function get_product_positions()
    {
        return [
            'after_price' => ['woocommerce_single_product_summary', 15],
            'before_form' => ['woocommerce_before_add_to_cart_form', 10],
            'after_form'  => ['woocommerce_after_add_to_cart_form', 10],
        ];
    }

    public function enqueue_frontend_assets()
    {
        wp_enqueue_style('wise-stock-bar', WISECAMPAIGN_DIR_URL . 'includes/css/stock-bar.css', [], WISECAMPAIGN_VERSION);
        if ($this->get_active_design()['id'] === 'countdown') {
            wp_enqueue_script('wise-stock-bar', WISECAMPAIGN_DIR_URL . 'includes/js/stock-bar.js', [], WISECAMPAIGN_VERSION, true);
        }
    }

    /**
     * Initialize stock bar defaults during plugin activation.
     */
    public function initialize_stockbar_defaults()
    {
        $default_config = $this->get_template_defaults();

        $defaults = [
            'wc-stockbar-1' => array_merge($default_config, [
                'id' => 'linear',
                'name' => 'High Demand Flow',
                'isActive' => true
            ]),
            'wc-stockbar-2' => array_merge($default_config, [
                'id' => 'pulse',
                'name' => 'Urgent Alert',
                'isActive' => false
            ])
        ];

        // Save each default stock bar design
        foreach ($defaults as $key => $settings) {
            if (get_option($key) === false) {
                update_option($key, $settings);
            }
        }

        if (get_option('activeWiseStockbarId') === false) {
            update_option('activeWiseStockbarId', 'wc-stockbar-1');
        }

        $default_setting = [
            'displayOnShopPage' => false,
            'displayOnProductPage' => true,
            'productPosition' => 'before_form',
            'hideDefaultStock' => true
        ];
        // Only set default if the option doesn't exist yet
        if (get_option('wc-stockbar-setting') === false) {
            update_option('wc-stockbar-setting', $default_setting);
        }
    }

    /**
     * Default look and text of each template. Keep in sync with TEMPLATES in modules/wise-stock-bar/src/App.jsx.
     * Texts take {stock} (items left), {sold} and {total}.
     */
    private function get_template_defaults()
    {
        return [
            'linear' => [
                'progressBarColor' => '#EC4899',
                'stockBarBg' => '#FFFFFF',
                'textColor' => '#111827',
                'borderColor' => '#F1F5F9',
                'fontSize' => '13px',
                'fontWeight' => 'Bold',
                'mainText' => "Hurry! Selling fast",
                'icon' => "Flame",
                'subText' => "{stock} left"
            ],
            'pulse' => [
                'progressBarColor' => '#EF4444',
                'stockBarBg' => '#FEF2F2',
                'textColor' => '#991B1B',
                'borderColor' => '#FEE2E2',
                'fontSize' => '14px',
                'fontWeight' => 'Bold',
                'mainText' => "Extremely limited stock!",
                'icon' => "AlertCircle",
                'subText' => "Only {stock} left in stock"
            ],
            'minimal' => [
                'progressBarColor' => '#3B82F6',
                'stockBarBg' => '#F8FAFC',
                'textColor' => '#1E293B',
                'borderColor' => '#E2E8F0',
                'fontSize' => '13px',
                'fontWeight' => 'Medium',
                'mainText' => "Popular product",
                'icon' => "TrendingUp",
                'subText' => "{stock} available"
            ],
            'countdown' => [
                'progressBarColor' => '#F59E0B',
                'stockBarBg' => '#FFFBEB',
                'textColor' => '#92400E',
                'borderColor' => '#FEF3C7',
                'fontSize' => '13px',
                'fontWeight' => 'Bold',
                'mainText' => "Flash sale ends in",
                'icon' => "Clock",
                'subText' => "left",
                'labelPosition' => "top",
                'hoursLabel' => "h",
                'minutesLabel' => "m",
                'secondsLabel' => "s",
                'timerExpiry' => ""
            ],
            'badge' => [
                'progressBarColor' => '#10B981',
                'stockBarBg' => '#F0FDF4',
                'textColor' => '#065F46',
                'borderColor' => '#DCFCE7',
                'fontSize' => '12px',
                'fontWeight' => 'Bold',
                'mainText' => "Limited stock",
                'icon' => "Package",
                'subText' => "{stock} left"
            ]
        ];
    }

    function get_status()
    {
        $defaultStatus = ['stockBarEnabled' => true];
        $status = get_option('wc-stockbar-status', $defaultStatus);
        return rest_ensure_response($status);
    }

    function update_status(WP_REST_Request $request)
    {
        if ($request->has_param('stockBarEnabled')) {
            update_option('wc-stockbar-status', ['stockBarEnabled' => rest_sanitize_boolean($request['stockBarEnabled'])]);
        }

        $defaultStatus = ['stockBarEnabled' => true];
        $status = get_option('wc-stockbar-status', $defaultStatus);
        return rest_ensure_response($status);
    }


    /**
     * Register REST routes for stock bar settings.
     */
    public function stockbar_register_rest_routes()
    {
        $namespace = 'wisecampaign/v1';

        // Endpoint to get initialized stock bar designs
        register_rest_route($namespace, '/stockbar-status', [
            'methods' => 'GET',
            'callback' => [$this, 'get_status'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route($namespace, '/stockbar-status', [
            'methods' => 'POST',
            'callback' => [$this, 'update_status'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/stockbars', [
            'methods' => 'GET',
            'callback' => [$this, 'get_initialized_stockbars'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
        ]);

        register_rest_route($namespace, '/stockbars', [
            'methods' => 'POST',
            'callback' => [$this, 'save_stockbar_design'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/stockbars/setting', [
            'methods' => 'POST',
            'callback' => [$this, 'update_stockbar_setting'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        register_rest_route($namespace, '/stockbars/setting', [
            'methods' => 'GET',
            'callback' => [$this, 'get_stockbar_setting'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
        ]);

        register_rest_route($namespace, '/stockbars/set-active', [
            'methods' => 'POST',
            'callback' => [$this, 'set_active_stockbar_endpoint'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);
    }

    public function set_active_stockbar_endpoint(WP_REST_Request $request)
    {
        $params = $request->get_json_params();
        $stockbar_id = $params['id'] ?? '';

        if (!$stockbar_id) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Stock bar ID is required'
            ]);
        }

        // Update active stock bar
        $this->set_active_stockbar($stockbar_id);

        return rest_ensure_response([
            'success' => true,
            'message' => 'Active stock bar updated successfully'
        ]);
    }

    /**
     * Retrieve all initialized stock bars.
     */
    public function get_initialized_stockbars(WP_REST_Request $request)
    {
        $defaults = [
            'wc-stockbar-1',
            'wc-stockbar-2'
        ];

        $stockbars = [];
        $active_id = $this->get_active_stockbar();

        foreach ($defaults as $key) {
            $stockbar = get_option($key, []);
            if (empty($stockbar))
                continue;

            $stockbar['db_id'] = $key;
            $stockbar['isActive'] = ($key === $active_id);
            $stockbars[] = $stockbar;
        }

        return rest_ensure_response($stockbars);
    }

    /**
     * Save stock bar settings via REST API.
     */
    public function save_stockbar_design(WP_REST_Request $request)
    {
        try {
            $settings = $request->get_json_params();
            if (!is_array($settings)) {
                return rest_ensure_response(['success' => false, 'message' => 'Invalid JSON data']);
            }

            $design_id = $settings['db_id'] ?? $settings['id'] ?? '';

            if (!$design_id) {
                return rest_ensure_response(['success' => false, 'message' => 'ID not specified']);
            }

            $stockbar = get_option($design_id, []);
            if (!is_array($stockbar)) {
                $stockbar = [];
            }

            // Update fields from request
            $fields_to_save = [
                'id',
                'progressBarColor',
                'progressBg',
                'stockBarBg',
                'textColor',
                'borderColor',
                'fontSize',
                'fontWeight',
                'content',
                'linear',
                'pulse',
                'minimal',
                'countdown',
                'badge'
            ];

            foreach ($fields_to_save as $field) {
                if (isset($settings[$field])) {
                    $stockbar[$field] = $this->sanitize_design_value($settings[$field]);
                }
            }

            update_option($design_id, $stockbar);

            if (isset($settings['isActive']) && $settings['isActive']) {
                $this->set_active_stockbar($design_id);
            }

            return rest_ensure_response(['success' => true, 'message' => 'Stock bar settings updated successfully', 'data' => $stockbar]);
        } catch (\Throwable $e) {
            return new \WP_Error('server_error', $e->getMessage(), ['status' => 500]);
        }
    }

    /**
     * Template settings are plain text, colors and sizes; strip markup from every string.
     */
    private function sanitize_design_value($value)
    {
        if (is_array($value)) {
            return array_map([$this, 'sanitize_design_value'], $value);
        }
        return is_scalar($value) ? sanitize_text_field((string) $value) : '';
    }

    /**
     * Update stock bars setting.
     */
    public function update_stockbar_setting(WP_REST_Request $request)
    {
        try {
            $settings = get_option('wc-stockbar-setting', []);
            if (!is_array($settings)) {
                $settings = [];
            }
            $params = $request->get_json_params();
            if (!is_array($params)) {
                return rest_ensure_response(['success' => false, 'message' => 'Invalid JSON data']);
            }

            if (isset($params['displayOnShopPage'])) {
                $settings['displayOnShopPage'] = wp_validate_boolean($params['displayOnShopPage']);
            }

            if (isset($params['displayOnProductPage'])) {
                $settings['displayOnProductPage'] = wp_validate_boolean($params['displayOnProductPage']);
            }

            if (isset($params['productPosition']) && array_key_exists($params['productPosition'], $this->get_product_positions())) {
                $settings['productPosition'] = $params['productPosition'];
            }

            if (isset($params['hideDefaultStock'])) {
                $settings['hideDefaultStock'] = wp_validate_boolean($params['hideDefaultStock']);
            }

            update_option('wc-stockbar-setting', $settings);

            return rest_ensure_response(['success' => true, 'message' => 'Stock bar display settings updated successfully', 'settings' => $settings]);
        } catch (\Throwable $e) {
            return new \WP_Error('server_error', $e->getMessage(), ['status' => 500]);
        }
    }

    public function set_active_stockbar($stockbarId)
    {
        update_option('activeWiseStockbarId', $stockbarId);
    }

    public function get_active_stockbar()
    {
        return get_option('activeWiseStockbarId', 'wc-stockbar-1');
    }

    /**
     * Retrieve stock bars setting.
     */
    public function get_stockbar_setting(WP_REST_Request $request)
    {
        $settings = get_option('wc-stockbar-setting', []);
        $settings = array_merge([
            'displayOnShopPage' => false,
            'displayOnProductPage' => true,
            'productPosition' => 'before_form',
            'hideDefaultStock' => true
        ], is_array($settings) ? $settings : []);
        return rest_ensure_response($settings);
    }

    /**
     * Display stock bar on storefront
     */
    public function cspe_custom_content($context = 'single')
    {
        global $product;

        if (!$product || !$product->managing_stock() || $product->get_stock_quantity() === null) {
            return;
        }

        $stock = (int) $product->get_stock_quantity();
        if ($stock <= 0) {
            return;
        }

        echo $this->render_stock_bar($stock, (int) $product->get_total_sales(), $context === 'loop' ? 'loop' : 'single');
    }

    /**
     * The active template with its saved settings over the defaults.
     */
    private function get_active_design()
    {
        $design = get_option($this->get_active_stockbar(), []);
        $design = is_array($design) ? $design : [];
        $defaults = $this->get_template_defaults();
        $id = isset($design['id'], $defaults[$design['id']]) ? $design['id'] : 'linear';

        // Older saves kept the colors at the top level instead of per template
        $saved = isset($design[$id]) && is_array($design[$id]) ? $design[$id] : (isset($design['progressBarColor']) ? $design : []);

        return ['id' => $id, 'config' => array_merge($defaults[$id], $saved)];
    }

    /**
     * Fills {stock}, {sold} and {total} (numbers wrapped in <strong> when $strong). Texts saved before the
     * tokens existed get the stock count in front, which is how those templates showed it before.
     */
    private function fill_text($text, $stock, $sold, $prefix_count, $strong = true)
    {
        $text = (string) $text;
        // The old Urgent Alert default had a fixed number in it
        if ($text === 'Only 12 items remaining') {
            $text = 'Only {stock} left in stock';
        }

        $wrap = function ($number) use ($strong) {
            return $strong ? '<strong>' . esc_html($number) . '</strong>' : esc_html($number);
        };

        if (strpos($text, '{') === false) {
            return $prefix_count ? $wrap($stock) . ' ' . esc_html($text) : esc_html($text);
        }

        return strtr(esc_html($text), [
            '{stock}' => $wrap($stock),
            '{sold}'  => $wrap($sold),
            '{total}' => $wrap($stock + $sold),
        ]);
    }

    private function get_icon_svg($name)
    {
        static $icons = null;
        if ($icons === null) {
            $icons = require WISECAMPAIGN_DIR_PATH . 'includes/features/templates/stock-bar-icons.php';
        }
        return $icons[$name] ?? $icons['Flame'];
    }

    /**
     * Stock bar markup. modules/wise-stock-bar/src/StockBarMarkup.jsx draws the same markup for the
     * admin preview, so keep the two in sync.
     */
    private function render_stock_bar($stock, $sold, $context)
    {
        $design = $this->get_active_design();
        $id = $design['id'];
        $c = $design['config'];
        $defaults = $this->get_template_defaults()[$id];

        $color = function ($key) use ($c, $defaults) {
            return sanitize_hex_color($c[$key] ?? '') ?: $defaults[$key];
        };
        $total = $stock + $sold;
        // Never draw an empty bar: a product that has not sold yet still shows a sliver
        $fill = $total > 0 ? max(6, round($sold / $total * 100)) : 6;

        $style = sprintf(
            '--wsb-accent:%s;--wsb-bg:%s;--wsb-text:%s;--wsb-border:%s;--wsb-size:%dpx;--wsb-weight:%d;--wsb-fill:%d%%;',
            $color('progressBarColor'),
            $color('stockBarBg'),
            $color('textColor'),
            $color('borderColor'),
            max(9, min(40, (int) ($c['fontSize'] ?? 13))),
            (($c['fontWeight'] ?? 'Bold') === 'Bold') ? 700 : 500,
            $fill
        );

        $icon = '<span class="wise-sb__icon">' . $this->get_icon_svg($c['icon'] ?? 'Flame') . '</span>';
        $title = '<span class="wise-sb__title">' . $this->fill_text($c['mainText'] ?? '', $stock, $sold, false) . '</span>';
        $track = function ($thin = false) {
            return '<div class="wise-sb__track' . ($thin ? ' wise-sb__track--thin' : '') . '"><span class="wise-sb__fill"></span></div>';
        };

        switch ($id) {
            case 'pulse':
                $body = '<div class="wise-sb__row">' . $icon . '<div class="wise-sb__text">' . $title
                    . '<span class="wise-sb__sub">' . $this->fill_text($c['subText'] ?? '', $stock, $sold, false) . '</span></div></div>';
                break;

            case 'minimal':
                $body = '<div class="wise-sb__row">' . $icon . $title
                    . '<span class="wise-sb__sub">' . $this->fill_text($c['subText'] ?? '', $stock, $sold, true) . '</span></div>' . $track(true);
                break;

            case 'countdown':
                $timer = '';
                $expiry = $this->get_timer_expiry($c['timerExpiry'] ?? '');
                if ($expiry !== null) {
                    if ($expiry <= time()) {
                        return ''; // The sale is over
                    }
                    $left = $expiry - time();
                    $unit = function ($value, $attr, $label) {
                        return '<b ' . $attr . '>' . sprintf('%02d', $value) . '</b><i>' . esc_html($label) . '</i>';
                    };
                    $timer = '<span class="wise-sb__timer" data-wsb-expiry="' . esc_attr($expiry) . '">'
                        . $unit(floor($left / 3600), 'data-wsb-h', $c['hoursLabel'] ?? 'h')
                        . $unit(floor(($left % 3600) / 60), 'data-wsb-m', $c['minutesLabel'] ?? 'm')
                        . $unit($left % 60, 'data-wsb-s', $c['secondsLabel'] ?? 's')
                        . '</span>';
                }
                $position = in_array($c['labelPosition'] ?? 'top', ['left', 'top', 'right', 'below'], true) ? $c['labelPosition'] : 'top';
                $body = '<div class="wise-sb__row">' . $icon
                    . '<div class="wise-sb__text wise-sb__text--' . $position . '">' . $title . $timer . '</div>'
                    . '<div class="wise-sb__stock"><b>' . esc_html($stock) . '</b><span>' . $this->fill_text($c['subText'] ?? '', $stock, $sold, false, false) . '</span></div>'
                    . '</div>' . $track(true);
                break;

            case 'badge':
                $body = '<span class="wise-sb__dot"></span>' . $title
                    . '<span class="wise-sb__pill">' . $this->fill_text($c['subText'] ?? '', $stock, $sold, true, false) . '</span>';
                break;

            default: // linear
                $meta = $sold > 0
                    /* translators: 1: number of items sold, 2: percent of the stock already sold */
                    ? '<div class="wise-sb__meta"><span>' . esc_html(sprintf(__('%s sold', 'wisecampaign'), number_format_i18n($sold))) . '</span><span>' . esc_html(sprintf(__('%d%% claimed', 'wisecampaign'), round($sold / $total * 100))) . '</span></div>'
                    : '';
                $body = '<div class="wise-sb__head">' . $icon . $title
                    . '<span class="wise-sb__count">' . $this->fill_text($c['subText'] ?? '', $stock, $sold, true) . '</span></div>'
                    . $track() . $meta;
        }

        return '<div class="wise-sb wise-sb--' . esc_attr($id) . ' wise-sb--' . esc_attr($context) . '" style="' . esc_attr($style) . '" role="status">' . $body . '</div>';
    }

    /**
     * The countdown end ("2026-10-25T18:00" from the editor) in the site's timezone, as a Unix timestamp.
     */
    private function get_timer_expiry($value)
    {
        if (!is_string($value) || $value === '') {
            return null;
        }
        try {
            return (new \DateTimeImmutable($value, wp_timezone()))->getTimestamp();
        } catch (\Exception $e) {
            return null;
        }
    }
}
