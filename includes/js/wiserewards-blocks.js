/**
 * wiseRewards in the Cart and Checkout blocks: what the cart earns, and using points.
 * Data comes from the cart's "wiserewards" extension (Redemption::store_api_data); the points to
 * use go back through extensionCartUpdate. No build step: plain wp.element calls.
 */
(function () {
    'use strict';
    var wc = window.wc || {};
    var wp = window.wp || {};
    if (!wc.blocksCheckout || !wp.plugins || !wp.element) {
        return;
    }
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var sprintf = wp.i18n.sprintf;
    var checkout = wc.blocksCheckout;
    var settings = (wc.wcSettings && wc.wcSettings.getSetting('wiserewards_data', {})) || {};
    var i18n = settings.i18n || {};

    var GiftIcon = function () {
        return el('svg', { className: 'wiserewards-icon', viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
            el('path', { d: 'M20 12v10H4V12' }),
            el('path', { d: 'M2 7h20v5H2z' }),
            el('path', { d: 'M12 22V7' }),
            el('path', { d: 'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z' }),
            el('path', { d: 'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' })
        );
    };

    var Box = function (props) {
        var data = props.extensions && props.extensions.wiserewards;
        var redeem = data && data.redeem;
        var initial = redeem ? redeem.max : 0;
        var points = useState(initial);
        var busy = useState(false);
        var error = useState('');
        useEffect(function () {
            points[1](initial);
        }, [initial]);

        if (!data || !data.active) {
            return null;
        }
        var onCheckout = props.context === 'woocommerce/checkout';
        var redeemHere = onCheckout ? data.redeemOnCheckout : data.redeemOnCart;
        var showRedeem = redeemHere && redeem && redeem.canRedeem && (redeem.applied > 0 || redeem.max > 0);
        var showEarn = !!data.earnHtml && (data.loggedIn || data.showGuest);
        if (!showEarn && !showRedeem) {
            return null;
        }

        var update = function (value) {
            busy[1](true);
            error[1]('');
            checkout.extensionCartUpdate({ namespace: 'wiserewards', data: { points: value } })
                .catch(function (err) {
                    error[1]((err && err.message) || i18n.error);
                })
                .finally(function () {
                    busy[1](false);
                });
        };

        var children = [];
        if (showEarn) {
            children.push(el('p', { key: 'earn', className: 'wiserewards-earn' },
                el(GiftIcon),
                el('span', null,
                    el('span', { dangerouslySetInnerHTML: { __html: data.earnHtml } }),
                    !data.loggedIn ? el('a', { className: 'wiserewards-login', href: data.loginUrl }, ' ' + i18n.signIn) : null
                )
            ));
        }
        if (showRedeem) {
            if (redeem.applied > 0) {
                children.push(el('p', { key: 'applied', className: 'wiserewards-applied' },
                    el('span', null, sprintf(i18n.using, redeem.appliedText, redeem.appliedValueText)),
                    el('button', { type: 'button', className: 'wiserewards-remove', disabled: busy[0], onClick: function () { update(0); } }, i18n.remove)
                ));
            } else {
                children.push(el('p', { key: 'balance', className: 'wiserewards-balance' }, sprintf(i18n.have, redeem.balanceText, redeem.balanceValueText)));
                children.push(el('div', { key: 'form', className: 'wiserewards-form' },
                    el('input', {
                        type: 'number',
                        className: 'wiserewards-input',
                        'aria-label': i18n.label,
                        min: redeem.min,
                        max: redeem.max,
                        step: 1,
                        value: points[0],
                        onChange: function (e) { points[1](e.target.value); },
                        onKeyDown: function (e) {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                update(parseInt(points[0], 10) || 0);
                            }
                        },
                    }),
                    el('button', { type: 'button', className: 'wiserewards-apply wc-block-components-button wp-element-button contained', disabled: busy[0], onClick: function () { update(parseInt(points[0], 10) || 0); } },
                        el('span', { className: 'wc-block-components-button__text' }, i18n.use))
                ));
                children.push(el('p', { key: 'hint', className: 'wiserewards-hint' }, sprintf(i18n.upTo, redeem.maxText, redeem.maxValueText)));
            }
            if (error[0]) {
                children.push(el('p', { key: 'error', className: 'wiserewards-error', role: 'alert' }, error[0]));
            }
        }
        return el('div', { className: 'wiserewards-box is-block' + (busy[0] ? ' is-loading' : '') }, children);
    };

    wp.plugins.registerPlugin('wiserewards', {
        scope: 'woocommerce-checkout',
        render: function () {
            return el(checkout.ExperimentalDiscountsMeta, null, el(Box));
        },
    });

    // The points line reads "Reward Points (500 points)", not the coupon code. The filter gets no
    // extension data, so it is read from the cart store.
    if (checkout.registerCheckoutFilters) {
        checkout.registerCheckoutFilters('wiserewards', {
            coupons: function (coupons) {
                var store = wp.data && wp.data.select('wc/store/cart');
                var cart = store && store.getCartData ? store.getCartData() : null;
                var data = cart && cart.extensions && cart.extensions.wiserewards;
                if (!data || !data.code) {
                    return coupons;
                }
                return coupons.map(function (coupon) {
                    return coupon.code === data.code ? Object.assign({}, coupon, { label: data.couponLabel }) : coupon;
                });
            },
        });
    }
})();
