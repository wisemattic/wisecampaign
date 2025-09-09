jQuery(function ($) {
    'use strict';

    if (!$('#wisecart-container').length) {
        return;
    }

    const $body = $('body');
    let quantityUpdateTimeout;

    const openCart = () => { $body.addClass('wisecart-open'); };
    const closeCart = () => { $body.removeClass('wisecart-open'); };

    const showLoader = () => {
        const $cartInner = $('#wisecart-container .wisecart-inner');
        if ($cartInner.length && !$cartInner.find('.wisecart-loader').length) {
            $cartInner.prepend('<div class="wisecart-loader"></div>');
        }
    };

    const hideLoader = () => {
        $('#wisecart-container .wisecart-loader').remove();
    };

    const updateCartContent = (data) => {
        if (data.html) {
            $('#wisecart-container').html(data.html);
        }
        if (typeof data.item_count !== 'undefined') {
            const $count = $('.wisecart-trigger-count');
            $count.html(data.item_count);
            if (data.item_count > 0) {
                $count.removeClass('wisecart-count-hidden');
            } else {
                $count.addClass('wisecart-count-hidden');
            }
        }
        hideLoader();
    };

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('open-wisecart')) {
        openCart();
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
    }

    $body.on('click', '.wisecart-trigger, .wisecart-overlay, .wisecart-close-btn', (e) => {
        e.preventDefault();
        $body.toggleClass('wisecart-open');
    });

    $(document).on('keyup', (e) => { if (e.key === "Escape") closeCart(); });

    $body.on('added_to_cart', (event, fragments, cart_hash) => {
        $(document.body).trigger('wc_fragments_refreshed');
        if (window.wiseCartData && window.wiseCartData.autoOpen) {
            openCart();
        }
    });

    $(document.body).on('wc_fragments_refreshing', showLoader);
    $(document.body).on('wc_fragments_refreshed', hideLoader);
    $body.on('click', '#wisecart-container a.remove', () => { showLoader(); });

    $body.on('change', '#wisecart-container .quantity .qty', function () {
        clearTimeout(quantityUpdateTimeout);
        showLoader();

        const $form = $(this).closest('.wisecart-form');

        quantityUpdateTimeout = setTimeout(() => {
            $.ajax({
                type: 'POST',
                url: wiseCartData.ajax_url,
                data: {
                    action: 'wisecart_update_quantity',
                    nonce: wiseCartData.update_cart_nonce,
                    cart_data: $form.serialize()
                },
                success: function (response) {
                    if (response.success) {
                        updateCartContent(response.data);
                    } else {
                        console.error('Cart update failed');
                        hideLoader();
                    }
                },
                error: function () {
                    console.error('AJAX error on cart update.');
                    hideLoader();
                }
            });
        }, 800);
    });

    $body.on('click', '.wisecart-apply-coupon-btn', function (e) {
        e.preventDefault();
        const $form = $(this).closest('.wisecart-coupon-form');
        const $couponField = $form.find('input[name="coupon_code"]');
        const couponCode = $couponField.val();
        const $noticeContainer = $('.wisecart-coupon-notices');

        $noticeContainer.empty().hide();
        if (!couponCode) {
            $couponField.focus();
            return;
        }
        showLoader();

        $.ajax({
            type: 'POST',
            url: wiseCartData.ajax_url,
            data: {
                action: 'wisecart_apply_coupon',
                coupon_code: couponCode,
                nonce: wiseCartData.apply_coupon_nonce
            },
            success: function (response) {
                if (response.success) {
                    updateCartContent(response.data);
                } else {
                    $noticeContainer.html(response.data.message).show();
                    hideLoader();
                }
            },
            error: function () {
                $noticeContainer.html('<div class="woocommerce-error">An unexpected error occurred. Please try again.</div>').show();
                hideLoader();
            },
            complete: function () {
                $couponField.val('');
            }
        });
    });
});