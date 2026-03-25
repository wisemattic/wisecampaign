/**
 * WiseCart Frontend JavaScript
 *
 * @package WISECAMPAIGN
 */

jQuery(document).ready(function($) {
    'use strict';

    // State management
    let isCartOpen = false;
    let checkoutInProgress = false;
    let orderSuccess = false;

    // Check if success message should be displayed on page load
    if (sessionStorage.getItem('wisecart_order_success') === 'true') {
        sessionStorage.removeItem('wisecart_order_success');
        setTimeout(() => {
            if (wiseCartData?.successSettings?.enabled) {
                showSuccessMessage();
            }
        }, 500);
    }

    /**
     * Initialize cart trigger functionality
     */
    function initCartTrigger() {
        $(document).on('click', '.wisecart-trigger', function(e) {
            e.preventDefault();
            openCart();
        });
    }

    /**
     * Open cart function
     */
    function openCart() {
        if (isCartOpen) {
            return;
        }

        isCartOpen = true;
        $('body').addClass('wisecart-open');

        // Bind close events
        bindCloseEvents();

        // Load cart content fresh every time
        loadCartContent();
    }

    /**
     * Close cart function
     */
    function closeCart() {
        isCartOpen = false;
        $('body').removeClass('wisecart-open');

        // Hide checkout content to prevent conflicts
        $('#wisecart-checkout-content').hide();
        $('.wisecart-inner').show(); // Ensure cart view is restored
    }

    /**
     * Show cart view (hide checkout, show cart)
     */
    function showCartView() {
        $('#wisecart-checkout-content').hide();
        $('.wisecart-inner').show();
    }

    /**
     * Bind close events
     */
    function bindCloseEvents() {
        $(document).off('click.wisecart', '.wisecart-overlay').on('click.wisecart', '.wisecart-overlay', closeCart);
        $(document).off('click.wisecart', '.wisecart-close, .wisecart-close-btn').on('click.wisecart', '.wisecart-close, .wisecart-close-btn', closeCart);
        $(document).off('keydown.wisecart').on('keydown.wisecart', function(e) {
            if (e.keyCode === 27 && isCartOpen) {
                closeCart();
            }
        });
    }

    /**
     * Load cart content via AJAX
     */
    function loadCartContent() {
        const $cartContainer = $('#wisecart-container');
        $cartContainer.html('<div class="wisecart-loading">Loading cart...</div>');

        $.ajax({
            url: wiseCartData.ajax_url,
            type: 'POST',
            data: {
                action: 'get_wisecart_content',
                nonce: wiseCartData.nonce
            },
            success: function(response) {
                if (response.success && response.data.data) {
                    $cartContainer.html(response.data.data);
                    bindCartEvents();
                } else {
                    $cartContainer.html('<div class="wisecart-error">Failed to load cart content</div>');
                }
            },
            error: function() {
                $cartContainer.html('<div class="wisecart-error">Network error. Please try again.</div>');
            }
        });
    }

    /**
     * Load checkout content via AJAX
     */
    function loadCheckoutContent() {
        let $checkoutContainer = $('#wisecart-checkout-content');

        if (!$checkoutContainer.length) {
            $('#wisecart-container').append('<div id="wisecart-checkout-content" style="display: none;"></div>');
            $checkoutContainer = $('#wisecart-checkout-content');
        }

        $('.wisecart-inner').hide();
        $checkoutContainer.html('<div class="wisecart-loading">Loading checkout...</div>').show();

        $.ajax({
            url: wiseCartData.ajax_url,
            type: 'POST',
            data: {
                action: 'wisecart_load_checkout',
                nonce: wiseCartData.loadCheckoutNonce
            },
            timeout: 15000,
            success: function(response) {
                if (response.success && response.data.html) {
                    const backButton = '<div class="wisecart-checkout-header"><button class="wisecart-back-btn" type="button">← Back to Cart</button></div>';
                    $checkoutContainer.html(backButton + response.data.html);
                    bindCheckoutEvents();
                } else {
                    $checkoutContainer.html('<div class="wisecart-error">Failed to load checkout form</div>');
                    showCartView();
                }
            },
            error: function() {
                $checkoutContainer.html('<div class="wisecart-error">Failed to load checkout form</div>');
                showCartView();
            }
        });
    }

    /**
     * Bind cart events
     */
    function bindCartEvents() {
        $(document).off('click.wisecart', '.wisecart-checkout-button').on('click.wisecart', '.wisecart-checkout-button', function(e) {
            if (wiseCartData.replaceCheckout) {
                e.preventDefault();
                loadCheckoutContent();
            }
        });

        $(document).off('change.wisecart', '.wisecart-body input.qty').on('change.wisecart', '.wisecart-body input.qty', function() {
            updateCartItem($(this));
        });

        $(document).off('click.wisecart', '.wisecart-body a.remove').on('click.wisecart', '.wisecart-body a.remove', function(e) {
            e.preventDefault();
            removeCartItem($(this));
        });

        $(document).off('submit.wisecart', '.wisecart-coupon-form').on('submit.wisecart', '.wisecart-coupon-form', function(e) {
            e.preventDefault();
            applyCoupon($(this));
        });

        $(document).off('click.wisecart', '.wisecart-continue-button').on('click.wisecart', '.wisecart-continue-button', closeCart);
        $(document).off('click.wisecart', '.wisecart-back-btn').on('click.wisecart', '.wisecart-back-btn', showCartView);
    }

    /**
     * Bind checkout events
     */
    function bindCheckoutEvents() {
        $(document).off('submit.wisecart', '#wisecart-checkout-content form.checkout').on('submit.wisecart', '#wisecart-checkout-content form.checkout', function(e) {
            e.preventDefault();
            handleCheckoutSubmission($(this));
        });
    }

    /**
     * Handle checkout form submission
     */
    function handleCheckoutSubmission($form) {
        if (checkoutInProgress) {
            return;
        }

        checkoutInProgress = true;
        const $submitButton = $form.find('#place_order');
        const originalText = $submitButton.text();
        $submitButton.prop('disabled', true).text('Processing...');

        $('.woocommerce-error, .woocommerce-message, .woocommerce-info').remove();
        
        const formData = $form.serialize();

        $.ajax({
            type: 'POST',
            url: wc_checkout_params.checkout_url,
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.result === 'success') {
                    orderSuccess = true;
                    sessionStorage.setItem('wisecart_order_success', 'true');
                    showSuccessMessage();

                    if (response.redirect) {
                        const delay = (wiseCartData.successSettings.redirectDelay || 5) * 1000;
                        setTimeout(() => {
                            window.location.href = response.redirect;
                        }, delay);
                    }
                } else if (response.result === 'failure') {
                    if (response.messages) {
                        $form.prepend('<div class="woocommerce-error">' + response.messages + '</div>');
                    }
                    $submitButton.prop('disabled', false).text(originalText);
                }
            },
            error: function(xhr, status, error) {
                console.error('Checkout AJAX error:', error);
                $form.prepend('<div class="woocommerce-error">An unexpected error occurred. Please try again.</div>');
                $submitButton.prop('disabled', false).text(originalText);
            },
            complete: function() {
                checkoutInProgress = false;
            }
        });
    }

    /**
     * Show success message
     */
    function showSuccessMessage() {
        if (!wiseCartData.successSettings.enabled) {
            return;
        }

        const title = wiseCartData.successSettings.title || 'Order Placed Successfully!';
        const message = wiseCartData.successSettings.message || 'Thank you for your order!';

        const successHtml = `
            <div class="wisecart-success-message">
                <div class="wisecart-success-icon">✓</div>
                <div class="wisecart-success-content">
                    <h3 class="wisecart-success-title">${title}</h3>
                    <p class="wisecart-success-text">${message}</p>
                </div>
            </div>
        `;
        
        let $container = $('#wisecart-checkout-content');
        if (!$container.is(':visible')) {
            $container = $('#wisecart-container');
        }
        $container.html(successHtml);
    }

    /**
     * Update cart item quantity
     */
    function updateCartItem($input) {
        const cartKey = $input.attr('name').match(/cart\[(.*?)\]/)[1];
        const quantity = parseInt($input.val(), 10);

        if (isNaN(quantity)) {
            return;
        }
        
        // Show loader
        const $item = $input.closest('.wisecart-item');
        $item.addClass('loading');

        $.ajax({
            url: wiseCartData.ajax_url,
            type: 'POST',
            data: {
                action: 'wisecart_update_quantity',
                cart_key: cartKey,
                quantity: quantity,
                nonce: wiseCartData.update_cart_nonce
            },
            success: function(response) {
                if (response.success) {
                    $('#wisecart-container').html(response.data.html);
                    bindCartEvents();
                     // Trigger update of other cart fragments
                    $(document.body).trigger('wc_fragment_refresh');
                }
            },
            complete: function() {
                $item.removeClass('loading');
            }
        });
    }

    /**
     * Remove cart item
     */
    function removeCartItem($link) {
        const cartKey = $link.data('cart_item_key');
        
        const $item = $link.closest('.wisecart-item');
        $item.addClass('loading');

        $.ajax({
            url: wiseCartData.ajax_url,
            type: 'POST',
            data: {
                action: 'wisecart_update_quantity',
                cart_key: cartKey,
                quantity: 0,
                nonce: wiseCartData.update_cart_nonce
            },
            success: function(response) {
                if (response.success) {
                    $('#wisecart-container').html(response.data.html);
                    bindCartEvents();
                    $(document.body).trigger('wc_fragment_refresh');
                }
            }
        });
    }

    /**
     * Apply coupon
     */
    function applyCoupon($form) {
        const $couponField = $form.find('input[name="coupon_code"]');
        const couponCode = $couponField.val();

        if (!couponCode) {
            return;
        }

        const $button = $form.find('.button');
        $button.prop('disabled', true).text('Applying...');

        $.ajax({
            url: wiseCartData.ajax_url,
            type: 'POST',
            data: {
                action: 'wisecart_apply_coupon',
                coupon_code: couponCode,
                nonce: wiseCartData.apply_coupon_nonce
            },
            success: function(response) {
                if (response.success) {
                    $('#wisecart-container').html(response.data.html);
                    bindCartEvents();
                } else {
                    const $notices = $('.wisecart-coupon-notices');
                    $notices.html(response.data.message).show();
                }
            },
            complete: function() {
                $button.prop('disabled', false).text('Apply');
            }
        });
    }

    // Auto-open cart after a product is added
    $(document.body).on('added_to_cart', function() {
        if (wiseCartData.autoOpen) {
            setTimeout(openCart, 250);
        }
    });

    // Initialize cart trigger
    initCartTrigger();

    // Make functions globally accessible
    window.wiseCartOpenCart = openCart;
    window.wiseCartCloseCart = closeCart;
});