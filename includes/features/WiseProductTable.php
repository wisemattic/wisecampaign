<?php

namespace WISECAMPAIGN\Features;

use WISECAMPAIGN\Traits\SingletonTrait;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * WiseProductTable Feature (PRO)
 *
 * Saved product tables shown with [product_table id="N"]. The admin editor is the React module
 * modules/wise-product-table; the storefront table is that module's storefront.jsx bundle.
 */
class WiseProductTable {
    use SingletonTrait;

    private $option_name = 'wisecampaign_product_table_settings';

    public function __construct() {
        add_action('rest_api_init', [$this, 'register_api_routes']);
        add_shortcode('product_table', [$this, 'render_product_table_shortcode']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_styles']);
        // Storefront add to cart: ?wc-ajax=wise_product_table_add
        add_action('wc_ajax_wise_product_table_add', [$this, 'ajax_add_to_cart']);
    }

    private function is_license_active() {
        return class_exists('\WISECAMPAIGNPRO\Classes\ProPluginLicense')
            && \WISECAMPAIGNPRO\Classes\ProPluginLicense::getInstance()->is_activated();
    }

    /**
     * =================================================================
     * SETTINGS
     * =================================================================
     */

    /**
     * Look of every table. Keep in sync with DESIGN_DEFAULTS in modules/wise-product-table/src/options.js.
     */
    private function get_design_defaults() {
        return [
            'headerBg'        => '#f8fafc',
            'headerText'      => '#1e293b',
            'rowBg'           => '#ffffff',
            'rowAltBg'        => '#f8fafc',
            'striped'         => true,
            'text'            => '#475569',
            'link'            => '#2563eb',
            'border'          => '#e2e8f0',
            'verticalBorders' => false,
            'accent'          => '#0f172a',
            'accentText'      => '#ffffff',
            'radius'          => 'rounded',
            'density'         => 'comfortable',
            'fontSize'        => 14,
            'headerFontSize'  => 12,
            'uppercaseHeader' => true,
        ];
    }

    private function get_label_defaults() {
        return [
            'addToCart'         => __('Add to cart', 'wisecampaign'),
            'added'             => __('Added', 'wisecampaign'),
            'selectOptions'     => __('Select options', 'wisecampaign'),
            'viewProduct'       => __('View product', 'wisecampaign'),
            'bulkSingular'      => __('Add 1 item for {total}', 'wisecampaign'),
            'bulkPlural'        => __('Add {items} items for {total}', 'wisecampaign'),
            'bulkHint'          => __('Tick products to add several at once', 'wisecampaign'),
            'searchPlaceholder' => __('Search products…', 'wisecampaign'),
            'noProducts'        => __('No products found.', 'wisecampaign'),
            'noResults'         => __('No products match your search.', 'wisecampaign'),
        ];
    }

    /**
     * A new table. Keep in sync with newTable() in modules/wise-product-table/src/options.js.
     */
    private function get_table_defaults() {
        return [
            'id'          => 1,
            'name'        => 'All Products',
            'source'      => 'all',
            'categories'  => [],
            'tags'        => [],
            'products'    => [],
            'inStockOnly' => false,
            'columns'     => ['image', 'name', 'summary', 'price', 'buy'],
            'showQty'     => true,
            'bulkCart'    => 'above',
            'showSearch'  => true,
            'showFilters' => true,
            'sortBy'      => 'menu_order',
            'perPage'     => 10,
            'limit'       => 100,
        ];
    }

    private function get_columns() {
        return ['image', 'name', 'sku', 'summary', 'categories', 'tags', 'stock', 'price', 'buy'];
    }

    private function get_default_settings() {
        return [
            'isActive'  => false,
            'template'  => 'default',
            'design'    => $this->get_design_defaults(),
            'labels'    => $this->get_label_defaults(),
            'customCss' => '',
            'tables'    => [$this->get_table_defaults()],
        ];
    }

    /**
     * Saved settings over the defaults. Without a Pro license the module always reads as inactive.
     */
    public function get_settings() {
        $saved = get_option($this->option_name, []);
        $saved = is_array($saved) ? $saved : [];
        if (!isset($saved['tables']) && (isset($saved['savedTablesList']) || isset($saved['designState']))) {
            $saved = $this->migrate_legacy_settings($saved);
        }

        $defaults = $this->get_default_settings();
        $settings = array_merge($defaults, $saved);
        $settings['design'] = array_merge($defaults['design'], is_array($saved['design'] ?? null) ? $saved['design'] : []);
        $settings['labels'] = array_merge($defaults['labels'], is_array($saved['labels'] ?? null) ? $saved['labels'] : []);
        $settings['tables'] = array_values(array_map(function ($table) {
            return array_merge($this->get_table_defaults(), is_array($table) ? $table : []);
        }, is_array($settings['tables']) && $settings['tables'] ? $settings['tables'] : $defaults['tables']));

        if (!$this->is_license_active()) {
            $settings['isActive'] = false;
        }
        return $settings;
    }

    /**
     * Settings saved by the first version of the editor (designState, advSettings, savedTablesList).
     */
    private function migrate_legacy_settings($old) {
        $design = $old['designState'] ?? [];
        $adv = $old['advSettings'] ?? [];
        $map = [
            'headerBgColor' => 'headerBg', 'fontHeaderColor' => 'headerText', 'cellBgColor' => 'rowBg',
            'fontCellColor' => 'text', 'fontHyperlinkColor' => 'link', 'borderHorizontalColor' => 'border',
            'btnMainBgColor' => 'accent', 'fontMainBtnColor' => 'accentText',
        ];
        $new_design = [];
        foreach ($map as $from => $to) {
            if (!empty($design[$from])) {
                $new_design[$to] = $design[$from];
            }
        }
        if (isset($design['cellBgStyle'])) {
            $new_design['striped'] = $design['cellBgStyle'] !== 'no-alternate';
        }
        if (isset($design['cornerStyle'])) {
            $new_design['radius'] = ['square' => 'square', 'fully-rounded' => 'pill'][$design['cornerStyle']] ?? 'rounded';
        }

        $locations = ['Above table' => 'above', 'Below table' => 'below', 'Both' => 'both', 'None' => 'none'];
        $tables = [];
        foreach ((array) ($old['savedTablesList'] ?? []) as $index => $old_table) {
            preg_match('/id="(\d+)"/', (string) ($old_table['shortcode'] ?? ''), $m);
            $tables[] = [
                'id'          => isset($m[1]) ? (int) $m[1] : $index + 1,
                'name'        => (string) ($old_table['name'] ?? 'Product Table'),
                'showQty'     => ($old_table['showQty'] ?? true) !== false,
                'showSearch'  => ($old_table['showSearch'] ?? true) !== false,
                'showFilters' => ($old_table['showFilters'] ?? true) !== false,
                'bulkCart'    => $locations[$adv['advMultiCartLocation'] ?? ''] ?? 'above',
                'perPage'     => (int) ($adv['advProductsPerPage'] ?? 10),
            ];
        }

        return [
            'isActive'  => !empty($old['isActive']),
            'design'    => $new_design,
            'labels'    => array_filter([
                'addToCart'    => $adv['advAddToCartBtn'] ?? '',
                'bulkSingular' => $adv['advSingularText'] ?? '',
                'bulkPlural'   => $adv['advPluralText'] ?? '',
                'noProducts'   => $adv['advNoProductsMsg'] ?? '',
                'noResults'    => $adv['advNoProductsFilteredMsg'] ?? '',
            ]),
            'customCss' => (string) ($adv['advCustomCss'] ?? ''),
            'tables'    => $tables,
        ];
    }

    private function sanitize_color($value, $default) {
        $value = is_string($value) ? trim($value) : '';
        return $value === 'transparent' ? $value : (sanitize_hex_color($value) ?: $default);
    }

    private function sanitize_ids($value) {
        return is_array($value) ? array_values(array_unique(array_filter(array_map('absint', array_filter($value, 'is_scalar'))))) : [];
    }

    private function sanitize_settings($input) {
        $input = is_array($input) ? $input : [];
        $defaults = $this->get_default_settings();
        $settings = [
            // Template ids match TEMPLATES in modules/wise-product-table/src/options.js; 'custom' means edited colors
            'template'  => in_array($input['template'] ?? '', ['default', 'royal-blue', 'lilac-rose', 'mint', 'midnight', 'custom'], true) ? $input['template'] : 'custom',
            'customCss' => isset($input['customCss']) && is_string($input['customCss']) ? wp_strip_all_tags($input['customCss']) : '',
        ];

        $design = [];
        $in = is_array($input['design'] ?? null) ? $input['design'] : [];
        foreach ($defaults['design'] as $key => $default) {
            $value = $in[$key] ?? $default;
            if (is_bool($default)) {
                $design[$key] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            } elseif (is_int($default)) {
                $design[$key] = max(10, min(24, (int) $value));
            } elseif ($key === 'radius') {
                $design[$key] = in_array($value, ['square', 'rounded', 'pill'], true) ? $value : $default;
            } elseif ($key === 'density') {
                $design[$key] = in_array($value, ['compact', 'comfortable', 'spacious'], true) ? $value : $default;
            } else {
                $design[$key] = $this->sanitize_color($value, $default);
            }
        }
        $settings['design'] = $design;

        $labels = [];
        $in = is_array($input['labels'] ?? null) ? $input['labels'] : [];
        foreach ($defaults['labels'] as $key => $default) {
            $text = isset($in[$key]) && is_scalar($in[$key]) ? sanitize_text_field((string) $in[$key]) : '';
            $labels[$key] = $text !== '' ? $text : $default;
        }
        $settings['labels'] = $labels;

        $tables = [];
        $used_ids = [];
        foreach ((array) ($input['tables'] ?? []) as $in) {
            if (!is_array($in)) {
                continue;
            }
            $t = $this->get_table_defaults();
            $id = absint($in['id'] ?? 0);
            if (!$id || in_array($id, $used_ids, true)) {
                $id = $used_ids ? max($used_ids) + 1 : 1;
            }
            $used_ids[] = $id;
            $columns = array_values(array_intersect(array_map('strval', array_filter((array) ($in['columns'] ?? []), 'is_scalar')), $this->get_columns()));

            $tables[] = [
                'id'          => $id,
                'name'        => sanitize_text_field((string) ($in['name'] ?? '')) ?: sprintf(__('Product Table %d', 'wisecampaign'), $id),
                'source'      => in_array($in['source'] ?? '', ['all', 'categories', 'tags', 'products'], true) ? $in['source'] : 'all',
                'categories'  => $this->sanitize_ids($in['categories'] ?? []),
                'tags'        => $this->sanitize_ids($in['tags'] ?? []),
                'products'    => $this->sanitize_ids($in['products'] ?? []),
                'inStockOnly' => filter_var($in['inStockOnly'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'columns'     => array_values(array_unique($columns)) ?: $t['columns'],
                'showQty'     => filter_var($in['showQty'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'bulkCart'    => in_array($in['bulkCart'] ?? '', ['above', 'below', 'both', 'none'], true) ? $in['bulkCart'] : 'above',
                'showSearch'  => filter_var($in['showSearch'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'showFilters' => filter_var($in['showFilters'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'sortBy'      => in_array($in['sortBy'] ?? '', ['menu_order', 'name', 'date', 'price-asc', 'price-desc', 'popularity'], true) ? $in['sortBy'] : 'menu_order',
                'perPage'     => max(5, min(100, (int) ($in['perPage'] ?? 10))),
                'limit'       => max(1, min(500, (int) ($in['limit'] ?? 100))),
            ];
        }
        $settings['tables'] = $tables ?: $defaults['tables'];

        return $settings;
    }

    /**
     * =================================================================
     * REST API (admin only)
     * =================================================================
     */

    public function register_api_routes() {
        $permission = function () {
            return current_user_can('manage_options');
        };

        register_rest_route('wisecampaign/v1', '/product-table/settings', [
            ['methods' => 'GET', 'callback' => [$this, 'get_settings_callback'], 'permission_callback' => $permission],
            ['methods' => 'POST', 'callback' => [$this, 'update_settings_callback'], 'permission_callback' => $permission],
        ]);
        register_rest_route('wisecampaign/v1', '/product-table/status', [
            'methods'             => 'POST',
            'callback'            => [$this, 'update_status_callback'],
            'permission_callback' => $permission,
        ]);
        register_rest_route('wisecampaign/v1', '/product-table/preview', [
            'methods'             => 'POST',
            'callback'            => [$this, 'preview_products_callback'],
            'permission_callback' => $permission,
        ]);
    }

    /**
     * Settings plus the store's categories, tags and products for the table editor.
     */
    public function get_settings_callback() {
        $terms = function ($taxonomy) {
            $found = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false]);
            return is_wp_error($found) ? [] : array_map(function ($t) {
                return ['id' => $t->term_id, 'name' => html_entity_decode($t->name), 'count' => $t->count];
            }, $found);
        };
        $products = function_exists('wc_get_products') ? array_map(function ($p) {
            return ['id' => $p->get_id(), 'name' => $p->get_name()];
        }, wc_get_products(['status' => 'publish', 'limit' => 500, 'orderby' => 'title', 'order' => 'ASC'])) : [];

        $response = new \WP_REST_Response([
            'settings'      => $this->get_settings(),
            'licenseActive' => $this->is_license_active(),
            'hasWc'         => function_exists('WC'),
            'store'         => [
                'categories' => $terms('product_cat'),
                'tags'       => $terms('product_tag'),
                'products'   => $products,
            ],
            'currency'      => $this->get_currency(),
        ], 200);
        // Some hosts cache REST responses; settings and license status must always be fresh.
        $response->header('Cache-Control', 'no-store');
        return $response;
    }

    public function update_settings_callback($request) {
        $settings = $this->sanitize_settings($request->get_json_params());
        // On/off has its own endpoint, so saving the editor never flips it.
        $settings['isActive'] = $this->get_settings()['isActive'];
        update_option($this->option_name, $settings);

        return new \WP_REST_Response(['success' => true, 'settings' => $this->get_settings()], 200);
    }

    public function update_status_callback($request) {
        $enable = filter_var($request->get_param('enabled'), FILTER_VALIDATE_BOOLEAN);
        if ($enable && !$this->is_license_active()) {
            return new \WP_REST_Response(['message' => 'Cannot activate: an active Pro license is required.'], 403);
        }
        $saved = get_option($this->option_name, []);
        $saved = is_array($saved) ? $saved : [];
        $saved['isActive'] = $enable;
        update_option($this->option_name, $saved);

        return new \WP_REST_Response(['success' => true, 'isActive' => $enable], 200);
    }

    /**
     * Products for a table that is still being edited, so the preview shows the real result.
     */
    public function preview_products_callback($request) {
        $table = $this->sanitize_settings(['tables' => [$request->get_json_params()]])['tables'][0];
        return new \WP_REST_Response(['products' => $this->get_table_products($table)], 200);
    }

    /**
     * =================================================================
     * PRODUCTS
     * =================================================================
     */

    private function term_slugs($ids, $taxonomy) {
        $slugs = [];
        foreach ($ids as $id) {
            $term = get_term($id, $taxonomy);
            if ($term && !is_wp_error($term)) {
                $slugs[] = $term->slug;
            }
        }
        return $slugs;
    }

    /**
     * Why a table has no products, in words for the admin note on the storefront.
     */
    private function empty_table_reason($table) {
        $name = $table['name'] !== '' ? $table['name'] : sprintf(__('Table %d', 'wisecampaign'), $table['id']);
        $sources = [
            'categories' => [$table['categories'], 'product_cat', __('Categories', 'wisecampaign')],
            'tags'       => [$table['tags'], 'product_tag', __('Tags', 'wisecampaign')],
        ];
        if (isset($sources[$table['source']]) && !$this->term_slugs($sources[$table['source']][0], $sources[$table['source']][1])) {
            /* translators: 1: table name, 2: "Categories" or "Tags" */
            return sprintf(__('Product table "%1$s" shows no products: its products come from %2$s, but none are picked.', 'wisecampaign'), $name, $sources[$table['source']][2]);
        }
        if ($table['source'] === 'products' && !$table['products']) {
            /* translators: %s: table name */
            return sprintf(__('Product table "%s" shows no products: its products are chosen one by one, but none are picked.', 'wisecampaign'), $name);
        }
        if ($table['inStockOnly'] && $this->get_table_products(['inStockOnly' => false] + $table)) {
            /* translators: %s: table name */
            return sprintf(__('Product table "%s" shows no products: none of its products are in stock, and "Only products in stock" is on.', 'wisecampaign'), $name);
        }
        /* translators: %s: table name */
        return sprintf(__('Product table "%s" shows no products: no published products match its settings.', 'wisecampaign'), $name);
    }

    /**
     * The published products a table shows, in its default order.
     */
    public function get_table_products($table) {
        if (!function_exists('wc_get_products')) {
            return [];
        }

        $args = [
            'status'     => 'publish',
            'limit'      => $table['limit'],
            'visibility' => 'catalog',
            'orderby'    => ['menu_order' => 'ASC', 'title' => 'ASC'],
        ];
        if ($table['sortBy'] === 'name') {
            $args['orderby'] = 'title';
            $args['order'] = 'ASC';
        } elseif ($table['sortBy'] === 'date') {
            $args['orderby'] = 'date';
            $args['order'] = 'DESC';
        }
        if ($table['inStockOnly']) {
            $args['stock_status'] = 'instock';
        }

        if ($table['source'] === 'categories') {
            $args['category'] = $this->term_slugs($table['categories'], 'product_cat');
            if (!$args['category']) {
                return [];
            }
        } elseif ($table['source'] === 'tags') {
            $args['tag'] = $this->term_slugs($table['tags'], 'product_tag');
            if (!$args['tag']) {
                return [];
            }
        } elseif ($table['source'] === 'products') {
            if (!$table['products']) {
                return [];
            }
            $args['include'] = $table['products'];
        }

        $products = array_map([$this, 'format_product'], wc_get_products($args));

        // Orders WooCommerce can't sort by in the query
        if ($table['sortBy'] === 'price-asc' || $table['sortBy'] === 'price-desc') {
            usort($products, function ($a, $b) use ($table) {
                return $table['sortBy'] === 'price-asc' ? $a['price'] <=> $b['price'] : $b['price'] <=> $a['price'];
            });
        } elseif ($table['sortBy'] === 'popularity') {
            usort($products, function ($a, $b) {
                return $b['sales'] <=> $a['sales'];
            });
        }

        return $products;
    }

    /**
     * Everything one table row needs, including the variations of variable products.
     */
    private function format_product($p) {
        $image_id = $p->get_image_id();
        $summary = $p->get_short_description() ?: $p->get_description();

        $attributes = [];
        foreach ($p->get_attributes() as $attribute) {
            if (!$attribute->get_visible() && !$attribute->get_variation()) {
                continue;
            }
            $values = $attribute->is_taxonomy()
                ? wp_list_pluck($attribute->get_terms() ?: [], 'name')
                : $attribute->get_options();
            if ($values) {
                $attributes[wc_attribute_label($attribute->get_name())] = array_values(array_map('html_entity_decode', $values));
            }
        }

        $data = [
            'id'         => $p->get_id(),
            'name'       => $p->get_name(),
            'url'        => $p->get_permalink(),
            'image'      => $image_id ? wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail') : wc_placeholder_img_src('woocommerce_thumbnail'),
            'sku'        => $p->get_sku(),
            'summary'    => wp_trim_words(wp_strip_all_tags(strip_shortcodes($summary)), 18),
            'priceHtml'  => $p->get_price_html(),
            'price'      => (float) wc_get_price_to_display($p),
            'type'       => $p->get_type(),
            'inStock'    => $p->is_in_stock(),
            'stockText'  => wp_strip_all_tags(wc_get_stock_html($p)) ?: ($p->is_in_stock() ? __('In stock', 'woocommerce') : __('Out of stock', 'woocommerce')),
            'categories' => array_values(array_map('html_entity_decode', wp_list_pluck(get_the_terms($p->get_id(), 'product_cat') ?: [], 'name'))),
            'tags'       => array_values(array_map('html_entity_decode', wp_list_pluck(get_the_terms($p->get_id(), 'product_tag') ?: [], 'name'))),
            'attributes' => $attributes,
            'canAdd'     => $p->is_type('simple') && $p->is_purchasable() && $p->is_in_stock(),
            'maxQty'     => $p->get_max_purchase_quantity(),
            'sales'      => (int) $p->get_total_sales(),
            'buttonText' => $p->add_to_cart_text(),
            'buttonUrl'  => $p->is_type('external') ? $p->add_to_cart_url() : $p->get_permalink(),
        ];

        if ($p->is_type('variable')) {
            $data['variationAttributes'] = [];
            foreach ($p->get_variation_attributes() as $name => $options) {
                $terms = taxonomy_exists($name) ? wc_get_product_terms($p->get_id(), $name, ['fields' => 'all']) : [];
                $labels = [];
                foreach ($options as $option) {
                    $term = null;
                    foreach ($terms as $t) {
                        if ($t->slug === $option) {
                            $term = $t;
                            break;
                        }
                    }
                    $labels[] = ['value' => $option, 'label' => html_entity_decode($term ? $term->name : $option)];
                }
                $data['variationAttributes'][] = [
                    'key'     => 'attribute_' . sanitize_title($name),
                    'label'   => wc_attribute_label($name, $p),
                    'options' => $labels,
                ];
            }
            $data['variations'] = array_values(array_map(function ($v) {
                return [
                    'id'         => $v['variation_id'],
                    'attributes' => $v['attributes'],
                    'price'      => (float) $v['display_price'],
                    'priceHtml'  => $v['price_html'],
                    'inStock'    => (bool) $v['is_in_stock'],
                    'canAdd'     => (bool) $v['is_purchasable'] && (bool) $v['is_in_stock'],
                    'maxQty'     => $v['max_qty'] === '' ? -1 : (int) $v['max_qty'],
                ];
            }, $p->get_available_variations()));
            $data['canAdd'] = (bool) array_filter($data['variations'], function ($v) {
                return $v['canAdd'];
            });
        }

        return $data;
    }

    /**
     * =================================================================
     * STOREFRONT
     * =================================================================
     */

    /**
     * Shortcode renderer: [product_table id="5"]
     */
    public function render_product_table_shortcode($atts) {
        $atts = shortcode_atts(['id' => ''], $atts, 'product_table');
        $settings = $this->get_settings();

        if (!$settings['isActive']) {
            // Only admins see why the table is missing
            return current_user_can('manage_options')
                ? '<p class="wpt-admin-note">' . esc_html__('Product Table is turned off. Turn it on in WiseCampaign → Product Table.', 'wisecampaign') . '</p>'
                : '';
        }

        $table = null;
        foreach ($settings['tables'] as $candidate) {
            if ((string) $candidate['id'] === (string) $atts['id'] || ($atts['id'] === '' && $table === null)) {
                $table = $candidate;
                if ($atts['id'] !== '') {
                    break;
                }
            }
        }
        if (!$table) {
            return current_user_can('manage_options')
                ? '<p class="wpt-admin-note">' . esc_html(sprintf(__('No product table with id %s.', 'wisecampaign'), $atts['id'])) . '</p>'
                : '';
        }

        if (!$this->enqueue_frontend_assets()) {
            return '';
        }

        $data = [
            'table'    => $table,
            'products' => $this->get_table_products($table),
            'design'   => $settings['design'],
            'labels'   => $settings['labels'],
        ];
        static $instance = 0;
        $instance++;

        // An empty table on the storefront is easy to miss; tell admins why
        $note = !$data['products'] && current_user_can('manage_options')
            ? '<p class="wpt-admin-note">' . esc_html($this->empty_table_reason($table)) . ' <a href="' . esc_url(admin_url('admin.php?page=wise_product_table')) . '">' . esc_html__('Edit the table', 'wisecampaign') . '</a> ' . esc_html__('(Only admins see this note.)', 'wisecampaign') . '</p>'
            : '';

        // JSON_HEX_TAG keeps "</script>" in product data from closing the script tag
        return $note . '<div class="wpt-root" data-wpt-instance="' . esc_attr($instance) . '"></div>'
            . '<script type="application/json" class="wpt-data" data-wpt-instance="' . esc_attr($instance) . '">'
            . wp_json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT)
            . '</script>';
    }

    private function get_currency() {
        return function_exists('get_woocommerce_currency_symbol') ? [
            'symbol'      => html_entity_decode(get_woocommerce_currency_symbol()),
            'position'    => get_option('woocommerce_currency_pos', 'left'),
            'decimals'    => wc_get_price_decimals(),
            'decimalSep'  => wc_get_price_decimal_separator(),
            'thousandSep' => wc_get_price_thousand_separator(),
        ] : ['symbol' => '$', 'position' => 'left', 'decimals' => 2, 'decimalSep' => '.', 'thousandSep' => ','];
    }

    /**
     * Adds one product or variation to the cart. Unlike WooCommerce's own add_to_cart AJAX it takes the
     * chosen attributes, so variations set to "Any ..." work too. Replies with the cart fragments.
     */
    public function ajax_add_to_cart() {
        $product_id = absint($_POST['product_id'] ?? 0);
        $quantity = wc_stock_amount(wp_unslash($_POST['quantity'] ?? 1)) ?: 1;
        $variation_id = absint($_POST['variation_id'] ?? 0);
        $variation = [];
        foreach ((array) ($_POST['variation'] ?? []) as $key => $value) {
            if (is_string($key) && strpos($key, 'attribute_') === 0 && is_scalar($value)) {
                $variation[sanitize_title(wp_unslash($key))] = wc_clean(wp_unslash($value));
            }
        }

        $passed = $product_id && apply_filters('woocommerce_add_to_cart_validation', true, $product_id, $quantity, $variation_id, $variation);
        if ($passed && WC()->cart->add_to_cart($product_id, $quantity, $variation_id, $variation) !== false) {
            do_action('woocommerce_ajax_added_to_cart', $product_id);
            \WC_AJAX::get_refreshed_fragments(); // Sends { fragments, cart_hash } and exits
        }

        $messages = wp_list_pluck(wc_get_notices('error'), 'notice');
        wc_clear_notices();
        wp_send_json([
            'error'       => true,
            // Notices are HTML (&quot; and links); the table shows plain text
            'message'     => $messages ? html_entity_decode(wp_strip_all_tags(implode(' ', $messages)), ENT_QUOTES, 'UTF-8') : __('Could not add this product to the cart.', 'wisecampaign'),
            'product_url' => get_permalink($product_id),
        ]);
    }

    /**
     * Product table styles, used by the storefront and the admin preview.
     */
    private function enqueue_styles() {
        wp_enqueue_style('wise-product-table', WISECAMPAIGN_DIR_URL . 'includes/css/product-table.css', [], WISECAMPAIGN_VERSION);
        $css = $this->get_settings()['customCss'];
        if ($css !== '') {
            wp_add_inline_style('wise-product-table', $css);
        }
    }

    public function enqueue_admin_styles($hook) {
        if (strpos($hook, 'wise_product_table') !== false) {
            $this->enqueue_styles();
        }
    }

    /**
     * The storefront bundle (modules/wise-product-table/src/storefront.jsx) from the Vite manifest.
     */
    public function enqueue_frontend_assets() {
        static $done = null;
        if ($done !== null) {
            return $done;
        }

        $dist = WISECAMPAIGN_DIR_PATH . 'modules/wise-product-table/dist/';
        $manifest_path = file_exists($dist . '.vite/manifest.json') ? $dist . '.vite/manifest.json' : $dist . 'manifest.json';
        $manifest = file_exists($manifest_path) ? json_decode(file_get_contents($manifest_path), true) : null;
        if (!isset($manifest['src/storefront.jsx']['file'])) {
            return $done = false;
        }

        $this->enqueue_styles();
        wp_enqueue_script('wise-product-table-frontend', WISECAMPAIGN_DIR_URL . 'modules/wise-product-table/dist/' . $manifest['src/storefront.jsx']['file'], ['jquery'], null, true);
        wp_localize_script('wise-product-table-frontend', 'wiseProductTable', [
            'addToCartUrl' => class_exists('WC_AJAX') ? \WC_AJAX::get_endpoint('wise_product_table_add') : '',
            'cartUrl'      => function_exists('wc_get_cart_url') ? wc_get_cart_url() : '',
            'currency'     => $this->get_currency(),
        ]);
        add_filter('script_loader_tag', function ($tag, $handle, $src) {
            if ($handle === 'wise-product-table-frontend') {
                return '<script type="module" src="' . esc_url($src) . '"></script>';
            }
            return $tag;
        }, 10, 3);

        return $done = true;
    }
}
