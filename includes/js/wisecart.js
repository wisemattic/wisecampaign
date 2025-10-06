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
        
        // Bind cart events for existing content
        bindCartEvents();
        
        // Only load cart content via AJAX if container is empty
        const $cartContainer = $('#wisecart-container');
        if ($cartContainer.find('.wisecart-inner').length === 0) {
            loadCartContent();
        }
        
        // Load checkout content if replace checkout is enabled
        if (wiseCartData?.replaceCheckout) {
            setTimeout(loadCheckoutContent, 500);
        }
    }

    /**
     * Close cart function
     */
    function closeCart() {
        isCartOpen = false;
        $('body').removeClass('wisecart-open');
        
        // Clear checkout content to prevent conflicts
        $('#wisecart-checkout-content').empty();
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
        // Close on overlay click
        $('.wisecart-overlay').off('click.wisecart').on('click.wisecart', closeCart);
        
        // Close on close button click
        $('.wisecart-close, .wisecart-close-btn').off('click.wisecart').on('click.wisecart', closeCart);
        
        // Close on escape key
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
        const $cartBody = $('.wisecart-body');
        
        // Use the full container if body is not found
        const $targetContainer = $cartBody.length ? $cartBody : $cartContainer;
        if (!$targetContainer.length) {
            return;
        }
        
        $targetContainer.html('<div class="wisecart-loading">Loading cart...</div>');
        
        $.ajax({
            url: wiseCartData?.ajax_url || '/wp-admin/admin-ajax.php',
            type: 'POST',
            data: {
                action: 'get_wisecart_content',
                nonce: wiseCartData?.nonce || wiseCartData?.update_cart_nonce
            },
            success: function(response) {
                if (response.success && response.data) {
                    $targetContainer.html(response.data);
                    bindCartEvents();
                } else {
                    $targetContainer.html('<div class="wisecart-error">Failed to load cart content</div>');
                }
            },
            error: function() {
                $targetContainer.html('<div class="wisecart-error">Network error. Please try again.</div>');
            }
        });
    }

    /**
     * Load checkout content
     */
    function loadCheckoutContent() {
        let $checkoutContainer = $('#wisecart-checkout-content');
        
        // Create checkout container if it doesn't exist
        if (!$checkoutContainer.length) {
            $('#wisecart-container').append('<div id="wisecart-checkout-content" class="wisecart-checkout-content" style="display: none;"></div>');
            $checkoutContainer = $('#wisecart-checkout-content');
        }
        
        $checkoutContainer.html('<div class="wisecart-loading">Loading checkout...</div>');
        
        $.ajax({
            url: wiseCartData?.ajax_url || '/wp-admin/admin-ajax.php',
            type: 'POST',
            data: {
                action: 'wisecart_load_checkout',
                nonce: wiseCartData?.loadCheckoutNonce || wiseCartData?.nonce
            },
            timeout: 15000,
            success: function(response) {
                if (response.success && response.data) {
                    // Handle both response formats
                    const checkoutHtml = response.data.html || response.data;
                    
                    // Add a back button to the checkout content
                    const backButton = '<div class="wisecart-checkout-header"><button class="wisecart-back-btn" type="button">← Back to Cart</button></div>';
                    $checkoutContainer.html(backButton + checkoutHtml);
                    
                    // Hide cart content and show checkout content
                    $('.wisecart-inner').hide();
                    $checkoutContainer.show();
                    
                    bindCheckoutEvents();
                } else {
                    $checkoutContainer.html('<div class="wisecart-error">Failed to load checkout form</div>');
                }
            },
            error: function() {
                $checkoutContainer.html('<div class="wisecart-error">Failed to load checkout form</div>');
            }
        });
    }

    /**
     * Bind cart events (quantity updates, remove items, etc.)
     */
    function bindCartEvents() {
        // Checkout button click
        $(document).off('click.wisecart', '.wisecart-checkout-button')
                  .on('click.wisecart', '.wisecart-checkout-button', function(e) {
            if (wiseCartData?.replaceCheckout) {
                e.preventDefault();
                loadCheckoutContent();
            }
        });
        
        // Quantity change events
        $(document).off('change.wisecart', '.wisecart-body input[name*="[qty]"]')
                  .on('change.wisecart', '.wisecart-body input[name*="[qty]"]', function() {
            updateCartItem($(this));
        });
        
        // Remove item events
        $(document).off('click.wisecart', '.wisecart-body .remove, .wisecart-body [data-product_id]')
                  .on('click.wisecart', '.wisecart-body .remove, .wisecart-body [data-product_id]', function(e) {
            e.preventDefault();
            removeCartItem($(this));
        });
        
        // Apply coupon
        $(document).off('click.wisecart', '.wisecart-body .wisecart-apply-coupon-btn')
                  .on('click.wisecart', '.wisecart-body .wisecart-apply-coupon-btn', function(e) {
            e.preventDefault();
            applyCoupon();
        });
        
        // Continue shopping (close cart)
        $(document).off('click.wisecart', '.wisecart-continue-button')
                  .on('click.wisecart', '.wisecart-continue-button', function(e) {
            e.preventDefault();
            closeCart();
        });
        
        // Back to cart from checkout
        $(document).off('click.wisecart', '.wisecart-back-btn')
                  .on('click.wisecart', '.wisecart-back-btn', function(e) {
            e.preventDefault();
            showCartView();
        });
    }

    /**
     * Bind checkout events
     */
    function bindCheckoutEvents() {
        // Prevent form submission and handle via AJAX
        $(document).off('submit.wisecart', '#wisecart-checkout-content form.checkout, #wisecart-checkout-content form.woocommerce-checkout')
                  .on('submit.wisecart', '#wisecart-checkout-content form.checkout, #wisecart-checkout-content form.woocommerce-checkout', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            
            if (checkoutInProgress) {
                return false;
            }
            
            handleCheckoutSubmission($(this));
            return false;
        });
        
        // Also prevent place order button default behavior
        $(document).off('click.wisecart', '#wisecart-checkout-content #place_order')
                  .on('click.wisecart', '#wisecart-checkout-content #place_order', function(e) {
            const $form = $(this).closest('form');
            if ($form.length) {
                e.preventDefault();
                e.stopImmediatePropagation();
                
                // Trigger our custom form submission
                setTimeout(() => {
                    $form.trigger('submit.wisecart');
                }, 10);
                
                return false;
            }
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
        
        // Show loading state
        const $submitButton = $form.find('#place_order');
        const originalText = $submitButton.text();
        $submitButton.prop('disabled', true).text('Processing...');
        
        // Remove previous error messages
        $('.woocommerce-error, .woocommerce-message, .woocommerce-info').remove();
        
        // Prepare form data
        const formData = $form.serialize() + '&wc-ajax=checkout';
        
        // Submit via AJAX to WooCommerce checkout endpoint
        $.ajax({
            type: 'POST',
            url: wiseCartData?.checkoutUrl ? wiseCartData.checkoutUrl + '?wc-ajax=checkout' : '/checkout/?wc-ajax=checkout',
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.result === 'success') {
                    // Order successful
                    orderSuccess = true;
                    sessionStorage.setItem('wisecart_order_success', 'true');
                    
                    // Show success message immediately
                    showSuccessMessage();
                    
                    // Optional redirect after delay
                    if (response.redirect) {
                        const delay = (wiseCartData?.successSettings?.redirectDelay || 5) * 1000;
                        setTimeout(() => {
                            window.location.href = response.redirect;
                        }, delay);
                    }
                    
                } else if (response.result === 'failure') {
                    // Handle checkout errors
                    if (response.messages) {
                        $form.prepend('<div class="woocommerce-error">' + response.messages + '</div>');
                    }
                    
                    // Re-enable submit button
                    $submitButton.prop('disabled', false).text(originalText);
                } else {
                    // Unknown response
                    $form.prepend('<div class="woocommerce-error">An error occurred. Please try again.</div>');
                    $submitButton.prop('disabled', false).text(originalText);
                }
            },
            error: function(xhr, status, error) {
                log('Checkout AJAX error:', error);
                $form.prepend('<div class="woocommerce-error">Network error. Please try again.</div>');
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
        if (!wiseCartData?.successSettings?.enabled) {
            return;
        }
        
        const title = wiseCartData.successSettings.title || 'Order Placed Successfully!';
        const message = wiseCartData.successSettings.message || 'Thank you for your order!';
        
        // Create success message HTML
        const successHtml = `
            <div class="wisecart-success-message">
                <div class="wisecart-success-icon">✓</div>
                <div class="wisecart-success-content">
                    <h3 class="wisecart-success-title">${title}</h3>
                    <p class="wisecart-success-text">${message}</p>
                </div>
            </div>
        `;
        
        // Find appropriate container
        let $container = $('#wisecart-checkout-content');
        if (!$container.length) {
            $container = $('.wisecart-body');
        }
        
        if ($container.length) {
            $container.html(successHtml);
            
            // Add success class to body
            $('body').addClass('wisecart-success-shown');
            
            // Animate success message
            $('.wisecart-success-message').hide().fadeIn(500);
        }
    }

    /**
     * Update cart item quantity
     */
    function updateCartItem($input) {
        const cartKey = $input.data('cart-key') || $input.attr('name').match(/\[([^\]]+)\]/)[1];
        const quantity = parseInt($input.val()) || 0;
        
        $.ajax({
            url: wiseCartData?.ajax_url,
            type: 'POST',
            data: {
                action: 'wisecart_update_quantity',
                cart_key: cartKey,
                quantity: quantity,
                nonce: wiseCartData?.update_cart_nonce
            },
            success: function(response) {
                if (response.success) {
                    loadCartContent(); // Reload cart content
                }
            }
        });
    }

    /**
     * Remove cart item
     */
    function removeCartItem($link) {
        const cartKey = $link.data('cart-key') || $link.attr('href').split('remove_item=')[1].split('&')[0];
        
        $.ajax({
            url: wiseCartData?.ajax_url,
            type: 'POST', 
            data: {
                action: 'wisecart_update_quantity',
                cart_key: cartKey,
                quantity: 0,
                nonce: wiseCartData?.update_cart_nonce
            },
            success: function(response) {
                if (response.success) {
                    loadCartContent(); // Reload cart content
                }
            }
        });
    }

    /**
     * Apply coupon
     */
    function applyCoupon() {
        const $couponField = $('.wisecart-body input[name="coupon_code"]');
        const couponCode = $couponField.val();
        
        if (!couponCode) {
            return;
        }
        
        $.ajax({
            url: wiseCartData?.ajax_url,
            type: 'POST',
            data: {
                action: 'wisecart_apply_coupon',
                coupon_code: couponCode,
                nonce: wiseCartData?.apply_coupon_nonce
            },
            success: function() {
                loadCartContent();
            }
        });
    }

    // Auto-open cart if configured
    if (wiseCartData?.autoOpen) {
        setTimeout(openCart, 1000);
    }

    // Initialize cart trigger
    initCartTrigger();

    // Make functions globally accessible
    window.wiseCartOpenCart = openCart;
    window.wiseCartCloseCart = closeCart;
});