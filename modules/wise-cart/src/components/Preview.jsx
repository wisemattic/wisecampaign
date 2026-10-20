import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ImageIcon, Search } from 'lucide-react';

const isColor = (value) => /^#[0-9a-f]{3,8}$/i.test(String(value));

// Formats an amount like wc_price(), from the store's currency settings.
const formatMoney = (amount, c) => {
    const [whole, cents] = Math.abs(Number(amount)).toFixed(c.decimals).split('.');
    const number = (cents ? `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, c.thousandSep)}${c.decimalSep}${cents}` : whole.replace(/\B(?=(\d{3})+(?!\d))/g, c.thousandSep));
    const signed = Number(amount) < 0 ? '-' : '';
    switch (c.position) {
        case 'right': return `${signed}${number}${c.symbol}`;
        case 'left_space': return `${signed}${c.symbol} ${number}`;
        case 'right_space': return `${signed}${number} ${c.symbol}`;
        default: return `${signed}${c.symbol}${number}`;
    }
};

const GOAL_ICONS = { truck: '🚚', gift: '🎁', tag: '🏷️' };

/**
 * Same markup as WiseCart::render_progress_bar(). Without real goals it shows an example one.
 */
function ProgressBar({ goals, subtotal, currency }) {
    const list = (goals.length ? goals : [{ id: 'example', label: 'Free shipping (example)', threshold: Math.ceil((subtotal * 1.6 || 100) / 10) * 10, icon: 'truck' }])
        .map((g) => ({ ...g, reached: (g.current ?? subtotal) >= g.threshold }))
        .sort((a, b) => a.threshold - b.threshold);
    const max = list[list.length - 1].threshold;
    const next = list.find((g) => !g.reached);

    return (
        <div className={`wisecart-progress${next ? '' : ' is-complete'}`}>
            <p className="wisecart-progress-message">
                {next ? (
                    <>
                        {GOAL_ICONS[next.icon]} Add <span className="wisecart-progress-amount">{formatMoney(next.threshold - (next.current ?? subtotal), currency)}</span> more to get <strong>{next.label}</strong>
                    </>
                ) : (
                    <>🎉 You unlocked <strong>{list.map((g) => g.label).join(', ')}</strong>!</>
                )}
            </p>
            <div className="wisecart-progress-track">
                <span className="wisecart-progress-fill" style={{ width: `${Math.min(100, (subtotal / max) * 100)}%` }} />
                {list.map((g) => (
                    <span key={g.id} className={`wisecart-progress-marker${g.reached ? ' is-reached' : ''}`} style={{ left: `${(g.threshold / max) * 100}%` }} title={g.label}>
                        {GOAL_ICONS[g.icon]}
                    </span>
                ))}
            </div>
            {list.length > 1 && (
                <div className="wisecart-progress-goals">
                    {list.map((g) => (
                        <span key={g.id} className={`wisecart-progress-goal${g.reached ? ' is-reached' : ''}`}>
                            {g.reached ? '✓' : GOAL_ICONS[g.icon]} {g.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Same markup as WiseCart::render_totals_adjustments(), with an example discount line.
 */
function Adjustments({ subtotal, currency }) {
    const discount = Number((subtotal * 0.1).toFixed(currency.decimals));
    return (
        <div className="wisecart-adjustments">
            <div className="wisecart-adjustment is-saving">
                <span>Discount (example)</span>
                <span>{formatMoney(-discount, currency)}</span>
            </div>
            <div className="wisecart-grand-total">
                <strong>Total</strong>
                <strong>{formatMoney(subtotal - discount, currency)}</strong>
            </div>
            <div className="wisecart-savings">🎉 You save {formatMoney(discount, currency)} on this order</div>
            <p className="wisecart-shipping-note">Shipping is calculated at checkout.</p>
        </div>
    );
}

/**
 * A transparent iframe that loads only the storefront stylesheet (includes/css/wisecart.css).
 * Inside it, the cart's fixed positioning and its 480px phone rule behave like on a real page,
 * and WordPress admin styles (such as .button) can't leak into the preview.
 */
function StoreFrame({ cssUrl, open, children }) {
    const frameRef = useRef(null);
    const [mount, setMount] = useState(null);

    // The small base style stands in for the theme: almost every theme uses border-box sizing and pads its buttons.
    const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0;height:100%;background:transparent;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}a{color:inherit}button,input{font:inherit}button{border:0;padding:.618em 1.41575em;line-height:1.6;cursor:pointer}</style><link rel="stylesheet" href="${cssUrl}"></head><body></body></html>`;

    useEffect(() => {
        mount?.classList.toggle('wisecart-open', open);
    }, [mount, open]);

    return (
        <>
            <iframe
                ref={frameRef}
                title="wiseCart preview"
                srcDoc={srcDoc}
                onLoad={() => setMount(frameRef.current?.contentDocument?.body || null)}
                className="absolute inset-0 w-full h-full border-0 bg-transparent"
            />
            {mount && createPortal(children, mount)}
        </>
    );
}

const Bar = ({ className = '' }) => <div className={`rounded-full bg-slate-100 ${className}`} />;

function StorePage({ isMobile }) {
    if (isMobile) {
        return (
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-0 border-b border-solid border-slate-100">
                    <div className="w-5 h-3 flex flex-col justify-between">
                        <span className="w-full h-0.5 bg-slate-800 rounded-full" />
                        <span className="w-full h-0.5 bg-slate-800 rounded-full" />
                        <span className="w-3/4 h-0.5 bg-slate-800 rounded-full" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-900" />
                    <div className="w-6 h-6 rounded-lg bg-slate-100" />
                </div>
                <div className="aspect-[16/9] bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl" />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-100 rounded-xl" />
                            <Bar className="h-2.5 w-3/4" />
                            <Bar className="h-2 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-10">
            <div className="flex items-center justify-between mb-10">
                <div className="w-10 h-10 rounded-full bg-slate-900" />
                <div className="flex gap-10">
                    <Bar className="w-16 h-3" />
                    <Bar className="w-16 h-3" />
                    <Bar className="w-16 h-3" />
                </div>
                <div className="w-20 h-8 rounded-full bg-slate-100" />
            </div>
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                    <div className="w-44 h-7 rounded-lg bg-slate-200" />
                    <Bar className="w-28 h-2.5" />
                </div>
                <div className="w-36 h-9 rounded-lg border border-solid border-slate-200" />
            </div>
            <div className="grid grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-3">
                        <div className="aspect-[4/3] bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl flex items-center justify-center">
                            <ImageIcon size={28} className="text-white" strokeWidth={1.5} />
                        </div>
                        <Bar className="h-3 w-2/3" />
                        <Bar className="h-3 w-1/3" />
                        <div className="h-9 rounded-md bg-slate-800/90" />
                    </div>
                ))}
            </div>
        </div>
    );
}

const CartIcon = () => (
    <svg className="wisecart-trigger-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

const EmptyIcon = () => (
    <svg className="wisecart-empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

const Header = ({ onClose }) => (
    <div className="wisecart-header">
        <h3 className="wisecart-title">Your Cart</h3>
        <button type="button" className="wisecart-close-btn" aria-label="Close cart" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
    </div>
);

/**
 * The cart drawer and floating button with the same markup as
 * includes/features/templates/wise-cart-content.php and WiseCart::render_cart_components().
 */
function CartMarkup({ s, sample, goals, currency, couponsEnabled, view, onOpen, onClose }) {
    const on = (key) => s[key] === 'yes';
    const prevent = (e) => e.preventDefault();
    const count = view === 'empty' ? 0 : sample.count;
    const style = s.wc_button_style;

    let content;
    if (view === 'success') {
        // Same markup wisecart.js shows after an order is placed
        content = (
            <div className="wisecart-success-message">
                <div className="wisecart-success-icon">✓</div>
                <div className="wisecart-success-content">
                    <h3 className="wisecart-success-title">{s.wc_success_message_title}</h3>
                    <p className="wisecart-success-text">{s.wc_success_message_text}</p>
                </div>
            </div>
        );
    } else if (view === 'empty') {
        content = (
            <div className="wisecart-inner">
                <Header onClose={onClose} />
                <div className="wisecart-body wisecart-empty">
                    <EmptyIcon />
                    <h3>Your cart is empty</h3>
                    <a href="#" onClick={prevent} className="button wisecart-shop-button">Return to Shop</a>
                </div>
            </div>
        );
    } else {
        content = (
            <div className="wisecart-inner">
                <Header onClose={onClose} />
                {on('wc_show_progress_bar') && <ProgressBar goals={goals} subtotal={sample.subtotal} currency={currency} />}
                <form className="wisecart-form" onSubmit={prevent}>
                    <div className="wisecart-body">
                        {sample.items.map((item) => (
                            <div className="wisecart-item" key={item.name}>
                                {on('wc_show_product_images') && (
                                    <div className="wisecart-item-image">
                                        <a href="#" onClick={prevent}><img src={item.image} alt="" /></a>
                                    </div>
                                )}
                                <div className="wisecart-item-details">
                                    <a href="#" onClick={prevent} className="wisecart-item-name">{item.name}</a>
                                    <div className="wisecart-item-quantity-wrapper">
                                        {on('wc_show_quantity_pickers') && (
                                            <div className="quantity">
                                                <input type="number" className="input-text qty text" value={item.qty} readOnly aria-label="Quantity" />
                                            </div>
                                        )}
                                        {on('wc_show_product_prices') && (
                                            <span className="wisecart-item-price" dangerouslySetInnerHTML={{ __html: item.priceHtml }} />
                                        )}
                                    </div>
                                </div>
                                {on('wc_show_delete_buttons') && (
                                    <div className="wisecart-item-remove">
                                        <a href="#" onClick={prevent} className="remove" aria-label="Remove this item">&times;</a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="wisecart-footer">
                        {couponsEnabled && on('wc_show_coupons') && (
                            <div className="wisecart-coupon-container">
                                <div className="wisecart-coupon-notices" style={{ marginBottom: '1rem' }} />
                                <div className="wisecart-coupon-form">
                                    <input type="text" name="coupon_code" className="input-text" placeholder="Coupon code" />
                                    <button type="button" className="button wisecart-apply-coupon-btn">Apply</button>
                                </div>
                            </div>
                        )}
                        {on('wc_show_order_subtotal') && (
                            <div className="wisecart-totals">
                                <strong>Subtotal:</strong>
                                <span dangerouslySetInnerHTML={{ __html: sample.subtotalHtml }} />
                            </div>
                        )}
                        {on('wc_show_discounts') && <Adjustments subtotal={sample.subtotal} currency={currency} />}
                        <div className="wisecart-actions">
                            <a href="#" onClick={prevent} className="button wisecart-checkout-button">Checkout</a>
                            {on('wc_show_keep_shopping') && (
                                <button type="button" className="wisecart-continue-button" onClick={onClose}>Continue Shopping</button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <>
            <style>{`:root{
                --wc-button-bg:${isColor(s.wc_button_background) ? s.wc_button_background : '#1d1d1d'};
                --wc-icon-color:${isColor(s.wc_icon_color) ? s.wc_icon_color : '#ffffff'};
                --wc-button-radius:${parseInt(s.wc_border_radius, 10) || 0}px;
                --wc-count-bg:${isColor(s.wc_count_background) ? s.wc_count_background : '#d63638'};
                --wc-count-text:${isColor(s.wc_count_text_color) ? s.wc_count_text_color : '#ffffff'};
                --wc-checkout-bg:${isColor(s.wc_checkout_btn_background) ? s.wc_checkout_btn_background : '#28a745'};
                --wc-checkout-text:${isColor(s.wc_checkout_text_color) ? s.wc_checkout_text_color : '#ffffff'};
                --wc-continue-bg:${isColor(s.wc_continue_btn_background) ? s.wc_continue_btn_background : '#e9ecef'};
                --wc-continue-text:${isColor(s.wc_continue_btn_text_color) ? s.wc_continue_btn_text_color : '#343a40'};
            }`}</style>
            <button
                type="button"
                className={`wisecart-trigger wisecart-trigger--${s.wc_icon_position.replaceAll('_', '-')} wisecart-trigger--${style}`}
                aria-label="Open Cart"
                onClick={onOpen}
            >
                {style !== 'text_only' && <CartIcon />}
                {style !== 'icon_only' && <span className="wisecart-trigger-text">{s.wc_button_text}</span>}
                <span className={`wisecart-trigger-count${count > 0 ? '' : ' wisecart-count-hidden'}`}>{count}</span>
            </button>
            <div id="wisecart-container" className="wisecart-container">{content}</div>
            <div className="wisecart-overlay" onClick={onClose} />
        </>
    );
}

export default function Preview({ settings, sample, goals, currency, couponsEnabled, cssUrl, device, view, onViewChange, enabled, onEnable }) {
    const isMobile = device === 'mobile';
    const hidden = settings.wc_icon_position === 'hidden';
    const open = view !== 'button';

    const stage = (
        <>
            <StorePage isMobile={isMobile} />
            {hidden ? (
                <div className="absolute inset-x-0 bottom-6 flex justify-center px-6 z-10">
                    <div className="flex items-start gap-2 max-w-md px-4 py-3 rounded-xl bg-amber-50 border border-solid border-amber-200 text-amber-700 text-xs font-bold shadow-sm">
                        <AlertCircle size={15} className="shrink-0 mt-px" />
                        <span>The cart button is hidden. wiseCart then leaves the cart drawer off your pages too, so shoppers can't open it.</span>
                    </div>
                </div>
            ) : (
                <StoreFrame cssUrl={cssUrl} open={open} key={device}>
                    <CartMarkup
                        s={settings}
                        sample={sample}
                        goals={goals}
                        currency={currency}
                        couponsEnabled={couponsEnabled}
                        view={view}
                        onOpen={() => onViewChange('cart')}
                        onClose={() => onViewChange('button')}
                    />
                </StoreFrame>
            )}
        </>
    );

    return (
        <div className="relative flex-1 flex justify-center items-start p-6 sm:p-8 pt-2">
            {!enabled && (
                <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-slate-900/10">
                    <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-solid border-white flex flex-col items-center gap-4 max-w-sm text-center wct-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="m-0 text-xl font-black text-[#0F172A] tracking-tight">wiseCart Is Off</h3>
                        <p className="m-0 text-slate-500 text-xs font-medium leading-relaxed">
                            Shoppers get the regular WooCommerce cart. Turn wiseCart on to show the side cart.
                        </p>
                        <button
                            type="button"
                            onClick={onEnable}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 text-xs"
                        >
                            Turn On wiseCart
                        </button>
                    </div>
                </div>
            )}

            {isMobile ? (
                <div className="w-[375px] max-w-full bg-slate-900 rounded-[44px] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.3)] border-4 border-solid border-slate-800 flex flex-col my-2">
                    <div className="px-5 pt-1 pb-2 flex items-center justify-between text-white text-[11px] font-semibold select-none">
                        <span>9:41</span>
                        <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-slate-800 ml-auto mr-1.5" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] opacity-80">
                            <span>5G</span>
                            <span>100%</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-[32px] overflow-hidden flex flex-col">
                        <div className="bg-slate-100 px-3 py-1.5 border-0 border-b border-solid border-slate-200">
                            <div className="bg-white h-6 rounded-full flex items-center px-3 gap-2 border border-solid border-slate-200 text-[10px] text-slate-600 font-medium justify-center">
                                <Search size={10} className="text-slate-400" />
                                <span>mysite.com/shop</span>
                            </div>
                        </div>
                        <div className="relative h-[680px] overflow-hidden">{stage}</div>
                        <div className="py-2 bg-white flex justify-center">
                            <div className="w-28 h-1 bg-slate-300 rounded-full" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-[1100px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-solid border-slate-200 overflow-hidden flex flex-col">
                    <div className="bg-[#F8FAFC] px-6 py-2.5 border-0 border-b border-solid border-slate-200 flex items-center gap-4 shrink-0">
                        <div className="flex gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                        </div>
                        <div className="flex-1 max-w-3xl mx-auto bg-white h-7 rounded-lg flex items-center px-4 gap-3 border border-solid border-slate-200/60 shadow-sm">
                            <Search size={12} className="text-slate-300" />
                            <span className="text-[11px] font-medium text-slate-500 tracking-tight">mysite.com/shop</span>
                        </div>
                    </div>
                    <div className="relative h-[760px] overflow-hidden">{stage}</div>
                </div>
            )}
        </div>
    );
}
