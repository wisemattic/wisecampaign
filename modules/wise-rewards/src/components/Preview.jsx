import React from 'react';
import { Gift } from 'lucide-react';
import { label, money, pointValue, pointsFor, renderMessage } from '../points.jsx';

// Example shopper for the previews
const BALANCE = 1250;

const Frame = ({ title, active, children }) => (
    <div className={`rounded-2xl bg-white border border-solid shadow-sm overflow-hidden transition-all ${active ? 'border-violet-300 ring-4 ring-violet-100' : 'border-slate-200'}`}>
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-0 border-b border-solid border-slate-100 bg-slate-50/70">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
            <span className="ml-2 text-[11px] font-bold text-slate-400">{title}</span>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const Line = ({ children }) => (
    <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-[13px] leading-snug text-slate-700" style={{ background: 'rgba(124,58,237,.07)' }}>
        <Gift size={16} className="shrink-0 mt-px" style={{ color: '#7c3aed' }} />
        <span>{children}</span>
    </div>
);

export default function Preview({ settings: s, currency, sample, focus, enabled }) {
    const product = sample || { name: 'Leather Weekender Bag', price: 120, image: '' };
    const productPoints = pointsFor(s, product.price);
    const cartTotal = product.price * 2;
    const cartPoints = pointsFor(s, cartTotal);
    const max = Math.min(BALANCE, Math.floor((cartTotal * s.redeemMaxPercent) / 100 / pointValue(s) + 1e-6));
    const moneyOf = (points) => money(points * pointValue(s), currency);

    return (
        <div className="space-y-5">
            {!enabled && (
                <div className="px-4 py-3 rounded-xl bg-amber-50 border border-solid border-amber-200 text-amber-800 text-xs font-bold">
                    wiseRewards is off: customers don't see or earn points until you turn it on.
                </div>
            )}

            <Frame title="Product page" active={focus === 'product'}>
                <div className="flex gap-5">
                    <div className="w-28 h-28 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                        {product.image && <img src={product.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="text-base font-black text-[#0F172A] truncate">{product.name}</div>
                        <div className="text-lg font-black text-slate-700">{money(product.price, currency)}</div>
                        {s.showProductMessage && productPoints > 0 ? (
                            <Line>{renderMessage(s.productMessage, s, productPoints)}</Line>
                        ) : (
                            <div className="text-[11px] font-medium text-slate-400">{s.showProductMessage ? 'Purchases earn no points.' : 'The product page message is off.'}</div>
                        )}
                        <div className="flex gap-2 pt-1">
                            <span className="w-14 h-9 rounded-lg border border-solid border-slate-200" />
                            <span className="flex-1 h-9 rounded-lg bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center">Add to cart</span>
                        </div>
                    </div>
                </div>
            </Frame>

            <Frame title="Cart and checkout" active={focus === 'cart'}>
                <div className="grid grid-cols-[1fr_260px] gap-5 items-start">
                    <div className="space-y-2 text-xs font-bold text-slate-500">
                        <div className="flex justify-between"><span>{product.name} × 2</span><span>{money(cartTotal, currency)}</span></div>
                        <div className="h-px bg-slate-100" />
                        <div className="flex justify-between text-slate-700"><span>Total</span><span>{money(cartTotal, currency)}</span></div>
                    </div>
                    <div className="rounded-xl p-3 space-y-2 text-[12px] leading-snug text-slate-700" style={{ background: 'rgba(124,58,237,.07)', border: '1px solid rgba(124,58,237,.22)' }}>
                        {s.showCartMessage && cartPoints > 0 && (
                            <div className="flex items-start gap-2">
                                <Gift size={15} className="shrink-0 mt-px" style={{ color: '#7c3aed' }} />
                                <span>{renderMessage(s.cartMessage, s, cartPoints)}</span>
                            </div>
                        )}
                        {s.redeemEnabled && (s.redeemOnCart || s.redeemOnCheckout) && max > 0 ? (
                            <>
                                <div>You have <strong>{label(s, BALANCE)}</strong> worth {moneyOf(BALANCE)}.</div>
                                <div className="flex gap-1.5">
                                    <span className="flex-1 h-8 rounded-md bg-white border border-solid border-slate-200 px-2 flex items-center font-bold">{max.toLocaleString()}</span>
                                    <span className="h-8 px-3 rounded-md bg-[#0F172A] text-white font-bold flex items-center">Use points</span>
                                </div>
                                <div className="text-[11px] text-slate-500">Up to {label(s, max)} ({moneyOf(max)}) on this order.</div>
                            </>
                        ) : (
                            !s.redeemEnabled && <div className="text-[11px] text-slate-500">Paying with points is off.</div>
                        )}
                    </div>
                </div>
                {s.showGuestMessage && cartPoints > 0 && (
                    <div className="mt-3 text-[11px] font-medium text-slate-400">
                        Shoppers who aren't signed in see: “{renderMessage(s.guestMessage, s, cartPoints)}” with a Sign in link.
                    </div>
                )}
            </Frame>

            <Frame title="My Account" active={focus === 'account'}>
                {s.accountTab ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <span className="px-2 py-1 rounded-md bg-slate-100">Orders</span>
                            <span className="px-2 py-1 rounded-md bg-violet-100 text-violet-700">{s.programName}</span>
                            <span className="px-2 py-1 rounded-md bg-slate-100">Account details</span>
                        </div>
                        <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Your balance</div>
                            <div className="text-2xl font-black">{label(s, BALANCE)}</div>
                            {s.redeemEnabled && <div className="text-xs opacity-90">Worth {moneyOf(BALANCE)} off your next order</div>}
                        </div>
                        <ul className="m-0 pl-4 text-xs text-slate-600 space-y-1">
                            {s.earnPurchase && <li><strong>{label(s, s.earnPoints)}</strong> for every {money(s.earnAmount, currency)} you spend</li>}
                            {s.earnReview && s.reviewPoints > 0 && <li><strong>{label(s, s.reviewPoints)}</strong> for reviewing a product you bought</li>}
                            {s.referralEnabled && <li><strong>{label(s, s.referrerPoints)}</strong> when a friend you refer places an order</li>}
                            {s.birthdayEnabled && <li><strong>{label(s, s.birthdayPoints)}</strong> on your birthday</li>}
                        </ul>
                    </div>
                ) : (
                    <div className="text-[11px] font-medium text-slate-400">The My Account page is off.</div>
                )}
            </Frame>
        </div>
    );
}
