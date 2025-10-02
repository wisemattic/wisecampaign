<?php
/**
 * wiseCart Content Template - WordPress Native Design
 *
 * @package WISECAMPAIGN
 */

if (!defined('ABSPATH')) {
    exit;
}
$wiseCart = \WISECAMPAIGN\Features\WiseCart::getInstance();
$cart = WC()->cart;
?>
<div class="wisecart-inner">
    <div class="wisecart-header">
        <h3 class="wisecart-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; display: inline-block; vertical-align: middle;">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <?php esc_html_e('Your Cart', 'wisecampaign'); ?>
        </h3>
        <button class="wisecart-close-btn" aria-label="<?php esc_attr_e('Close cart', 'wisecampaign'); ?>">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
    </div>

    <?php if ($cart && !$cart->is_empty()): ?>
        <form class="wisecart-form">
            <div class="wisecart-body">
                <?php
                foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
                    $_product = apply_filters('woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key);
                    if (!$_product || !$_product->exists() || $cart_item['quantity'] <= 0)
                        continue;
                    $product_permalink = apply_filters('woocommerce_cart_item_permalink', $_product->is_visible() ? $_product->get_permalink($cart_item) : '', $cart_item, $cart_item_key);
                    ?>
                    <div class="wisecart-item">
                        <?php if ($wiseCart->get_option('wc_show_product_images') === 'yes'): ?>
                            <div class="wisecart-item-image">
                                <a href="<?php echo esc_url($product_permalink); ?>">
                                    <?php echo $_product->get_image('thumbnail'); ?>
                                </a>
                            </div>
                        <?php endif; ?>

                        <div class="wisecart-item-details">
                            <a href="<?php echo esc_url($product_permalink); ?>"
                                class="wisecart-item-name"><?php echo wp_kses_post($_product->get_name()); ?></a>
                            <?php echo wc_get_formatted_cart_item_data($cart_item); ?>
                            <div class="wisecart-item-quantity-wrapper">
                                <?php if ($wiseCart->get_option('wc_show_quantity_pickers') === 'yes'): ?>
                                    <?php
                                    echo woocommerce_quantity_input([
                                        'input_name' => "cart[{$cart_item_key}][qty]",
                                        'input_value' => $cart_item['quantity'],
                                        'max_value' => $_product->get_max_purchase_quantity(),
                                        'min_value' => '0',
                                        'product_name' => $_product->get_name(),
                                    ], $_product, false);
                                    ?>
                                <?php endif; ?>
                                <?php if ($wiseCart->get_option('wc_show_product_prices') === 'yes'): ?>
                                    <span class="wisecart-item-price"><?php echo WC()->cart->get_product_price($_product); ?></span>
                                <?php endif; ?>
                            </div>
                        </div>

                        <?php if ($wiseCart->get_option('wc_show_delete_buttons') === 'yes'): ?>
                            <div class="wisecart-item-remove">
                                <?php
                                echo apply_filters('woocommerce_cart_item_remove_link', sprintf(
                                    '<a href="%s" class="remove" aria-label="%s" data-product_id="%s">&times;</a>',
                                    esc_url(wc_get_cart_remove_url($cart_item_key)),
                                    esc_attr__('Remove this item', 'woocommerce'),
                                    esc_attr($_product->get_id())
                                ), $cart_item_key);
                                ?>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php } ?>
            </div>
            <div class="wisecart-footer">
                <?php if (wc_coupons_enabled() && $wiseCart->get_option('wc_show_coupons') === 'yes'): ?>
                    <div class="wisecart-coupon-container">
                        <div class="wisecart-coupon-notices" style="margin-bottom: 16px;"></div>
                        <div class="wisecart-coupon-form">
                            <input type="text" name="coupon_code" class="input-text"
                                placeholder="<?php esc_attr_e('Enter coupon code', 'woocommerce'); ?>" />
                            <button type="button"
                                class="button wisecart-apply-coupon-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                                    <path d="M9 12l2 2 4-4"/>
                                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                                </svg>
                                <?php esc_html_e('Apply', 'wisecampaign'); ?>
                            </button>
                        </div>
                    </div>
                <?php endif; ?>

                <?php if ($wiseCart->get_option('wc_show_order_subtotal') === 'yes'): ?>
                    <div class="wisecart-totals">
                        <strong><?php esc_html_e('Subtotal:', 'woocommerce'); ?></strong>
                        <span class="amount"><?php wc_cart_totals_subtotal_html(); ?></span>
                    </div>
                <?php endif; ?>

                <div class="wisecart-actions">
                    <a href="<?php echo esc_url(wc_get_checkout_url()); ?>"
                        class="button wisecart-checkout-button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                            <path d="M5 12h14"/>
                            <path d="M12 5l7 7-7 7"/>
                        </svg>
                        <?php esc_html_e('Checkout', 'woocommerce'); ?>
                    </a>
                    <?php if ($wiseCart->get_option('wc_show_keep_shopping') === 'yes'): ?>
                        <button type="button"
                            class="button wisecart-continue-button wisecart-close-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                                <path d="M19 12H5"/>
                                <path d="M12 19l-7-7 7-7"/>
                            </svg>
                            <?php esc_html_e('Continue Shopping', 'wisecampaign'); ?>
                        </button>
                    <?php endif; ?>
                </div>
            </div>
        </form>
    <?php else: ?>
        <div class="wisecart-body wisecart-empty">
            <div class="wisecart-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
            </div>
            <h3><?php esc_html_e('Your cart is empty', 'wisecampaign'); ?></h3>
            <p><?php esc_html_e('Looks like you haven\'t added any products to your cart yet. Start shopping to see them here!', 'wisecampaign'); ?></p>
            <a href="<?php echo esc_url(get_permalink(wc_get_page_id('shop'))); ?>"
                class="button wisecart-shop-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
                </svg>
                <?php esc_html_e('Start Shopping', 'wisecampaign'); ?>
            </a>
        </div>
    <?php endif; ?>
</div>