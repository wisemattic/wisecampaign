/**
 * wiseRewards on classic pages: the points message follows the chosen variation, and the points
 * box in the cart and checkout uses or removes points (includes/Rewards/Storefront.php).
 */
(function ($) {
    'use strict';
    var data = window.wiseRewards;
    if (!data) {
        return;
    }

    var label = function (n) {
        return Number(n).toLocaleString() + ' ' + (n === 1 ? data.pointLabel : data.pointsLabel);
    };

    // Product page: "Earn 50–120 points" becomes the chosen variation's points
    var messageFor = function (form) {
        var box = $(form).siblings('.wiserewards-product[data-variations]');
        return box.length ? box : $(form).closest('.product, .summary, .wp-block-group, body').find('.wiserewards-product[data-variations]').first();
    };
    $(document).on('found_variation', 'form.variations_form', function (event, variation) {
        var box = messageFor(this);
        if (!box.length) {
            return;
        }
        var points = (box.data('variations') || {})[variation.variation_id];
        if (box.data('original') === undefined) {
            box.data('original', box.find('.wiserewards-product-text').html());
        }
        if (points > 0) {
            box.show().find('.wiserewards-points').text(label(points));
        } else {
            box.hide();
        }
    });
    $(document).on('reset_data', 'form.variations_form', function () {
        var box = messageFor(this);
        if (box.length && box.data('original') !== undefined) {
            box.show().find('.wiserewards-product-text').html(box.data('original'));
        }
    });

    // Cart and checkout: use points, or take them off again
    var send = function (box, points) {
        var error = box.find('.wiserewards-error');
        error.prop('hidden', true).text('');
        box.addClass('is-loading').find('button').prop('disabled', true);
        $.post(data.ajaxUrl, { action: 'wiserewards_redeem', nonce: data.nonce, points: points })
            .done(function (res) {
                if (!res || !res.success) {
                    error.text((res && res.data && res.data.message) || data.i18n.error).prop('hidden', false);
                    return;
                }
                if (box.data('where') === 'checkout') {
                    $(document.body).trigger('update_checkout');
                } else if ($('.woocommerce-cart-form').length) {
                    $(document.body).trigger('wc_update_cart');
                } else {
                    window.location.reload();
                }
            })
            .fail(function () {
                error.text(data.i18n.error).prop('hidden', false);
            })
            .always(function () {
                box.removeClass('is-loading').find('button').prop('disabled', false);
            });
    };

    $(document.body).on('click', '.wiserewards-apply', function () {
        var box = $(this).closest('.wiserewards-box');
        send(box, parseInt(box.find('.wiserewards-input').val(), 10) || 0);
    });
    $(document.body).on('click', '.wiserewards-remove', function () {
        send($(this).closest('.wiserewards-box'), 0);
    });
    // Enter would place the order on the checkout page
    $(document.body).on('keydown', '.wiserewards-input', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            $(this).closest('.wiserewards-box').find('.wiserewards-apply').trigger('click');
        }
    });
})(jQuery);
