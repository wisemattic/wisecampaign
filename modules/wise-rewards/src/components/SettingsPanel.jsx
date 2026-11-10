import React from 'react';
import { Cake, CalendarClock, Crown, Gift, Hourglass, Megaphone, Plus, ShoppingBag, Star, Store, Trash2, UserPlus, Wallet } from 'lucide-react';
import { Card, Field, Hint, NumberInput, Notice, TextInput, Toggle, ToggleRow } from './ui.jsx';
import { UPGRADE_URL, backPercent, label } from '../points.jsx';

export const TABS = [
    { id: 'earn', label: 'Earn' },
    { id: 'redeem', label: 'Redeem' },
    { id: 'display', label: 'Display' },
    { id: 'boost', label: 'Boost', pro: true },
];

const Sentence = ({ children }) => <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">{children}</div>;

export default function SettingsPanel({ tab, settings, update, isPro, currency, couponsEnabled, accountUrl, onPreview }) {
    const s = settings;
    const flip = (key) => update(key, !s[key]);
    const symbol = currency?.symbol || '$';
    const locked = !isPro;

    if (tab === 'earn') {
        return (
            <div className="space-y-3 wct-fade-in" onFocus={() => onPreview('product')}>
                <Card
                    title="Purchases"
                    desc="Points come from the products' price after discounts, without tax and shipping."
                    icon={<ShoppingBag size={14} />}
                    aside={<Toggle on={s.earnPurchase} onClick={() => flip('earnPurchase')} label="Points for purchases" />}
                >
                    <div className={`space-y-3 ${s.earnPurchase ? '' : 'opacity-40 pointer-events-none'}`}>
                        <Sentence>
                            Earn
                            <NumberInput value={s.earnPoints} min={1} onChange={(v) => update('earnPoints', v)} suffix={s.pointsLabel} width="w-16" label="Points earned" />
                            for every
                            <NumberInput value={s.earnAmount} min={0.01} step={0.01} onChange={(v) => update('earnAmount', v)} prefix={symbol} width="w-20" label="Amount spent" />
                            spent
                        </Sentence>
                        <Field label="Give the points when the order is">
                            <div className="grid grid-cols-2 gap-1.5">
                                {[
                                    { id: 'completed', label: 'Completed', hint: 'Safest: after delivery' },
                                    { id: 'processing', label: 'Paid', hint: 'Processing or completed' },
                                ].map((o) => (
                                    <button
                                        key={o.id}
                                        type="button"
                                        onClick={() => update('earnStatus', o.id)}
                                        className={`p-2.5 rounded-lg border border-solid text-left transition-all ${s.earnStatus === o.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                    >
                                        <div className={`text-xs font-black ${s.earnStatus === o.id ? 'text-blue-600' : 'text-slate-700'}`}>{o.label}</div>
                                        <div className="text-[10px] font-medium text-slate-400">{o.hint}</div>
                                    </button>
                                ))}
                            </div>
                        </Field>
                        <Hint>Refunds take back their share of the points; cancelled orders take back all of them.</Hint>
                    </div>
                </Card>

                <Card title="Signup bonus" desc="Welcome points for creating an account." icon={<Gift size={14} />} aside={<Toggle on={s.earnSignup} onClick={() => flip('earnSignup')} label="Signup bonus" />}>
                    <div className={`space-y-2 ${s.earnSignup ? '' : 'opacity-40 pointer-events-none'}`}>
                        <Sentence>
                            Give
                            <NumberInput value={s.signupPoints} onChange={(v) => update('signupPoints', v)} suffix={s.pointsLabel} label="Signup points" />
                        </Sentence>
                        <ToggleRow title="Unlock with the first order" desc="Stops fake accounts from collecting points" on={s.signupNeedsOrder} onClick={() => flip('signupNeedsOrder')} />
                    </div>
                </Card>

                <Card title="Product reviews" desc="Once per product, when the review is approved." icon={<Star size={14} />} aside={<Toggle on={s.earnReview} onClick={() => flip('earnReview')} label="Points for reviews" />}>
                    <div className={`space-y-2 ${s.earnReview ? '' : 'opacity-40 pointer-events-none'}`}>
                        <Sentence>
                            Give
                            <NumberInput value={s.reviewPoints} onChange={(v) => update('reviewPoints', v)} suffix={s.pointsLabel} label="Review points" />
                            per review
                        </Sentence>
                        <ToggleRow title="Only customers who bought it" desc="Verified owners, like WooCommerce's badge" on={s.reviewVerifiedOnly} onClick={() => flip('reviewVerifiedOnly')} />
                    </div>
                </Card>

                <Card
                    title="Refer a friend"
                    desc="A link in My Account. The friend gets points when they sign up; you get yours after their first order."
                    icon={<UserPlus size={14} />}
                    locked={locked}
                    upgradeUrl={UPGRADE_URL}
                    aside={!locked && <Toggle on={s.referralEnabled} onClick={() => flip('referralEnabled')} label="Referrals" />}
                >
                    <div className={`space-y-2 ${s.referralEnabled || locked ? '' : 'opacity-40 pointer-events-none'}`}>
                        <Sentence>
                            Referrer gets
                            <NumberInput value={s.referrerPoints} onChange={(v) => update('referrerPoints', v)} suffix={s.pointsLabel} label="Referrer points" />
                        </Sentence>
                        <Sentence>
                            Friend gets
                            <NumberInput value={s.friendPoints} onChange={(v) => update('friendPoints', v)} suffix={s.pointsLabel} label="Friend points" />
                        </Sentence>
                    </div>
                </Card>

                <Card
                    title="Birthday"
                    desc="Customers add their birthday in My Account and get points on the day."
                    icon={<Cake size={14} />}
                    locked={locked}
                    upgradeUrl={UPGRADE_URL}
                    aside={!locked && <Toggle on={s.birthdayEnabled} onClick={() => flip('birthdayEnabled')} label="Birthday points" />}
                >
                    <div className={s.birthdayEnabled || locked ? '' : 'opacity-40 pointer-events-none'}>
                        <Sentence>
                            Give
                            <NumberInput value={s.birthdayPoints} onChange={(v) => update('birthdayPoints', v)} suffix={s.pointsLabel} label="Birthday points" />
                        </Sentence>
                    </div>
                </Card>
            </div>
        );
    }

    if (tab === 'redeem') {
        const back = backPercent(s);
        return (
            <div className="space-y-3 wct-fade-in" onFocus={() => onPreview('cart')}>
                <Card title="Pay with points" desc="Customers use points in the cart and at checkout." icon={<Wallet size={14} />} aside={<Toggle on={s.redeemEnabled} onClick={() => flip('redeemEnabled')} label="Pay with points" />}>
                    <div className={`space-y-3 ${s.redeemEnabled ? '' : 'opacity-40 pointer-events-none'}`}>
                        <Sentence>
                            <NumberInput value={s.redeemPoints} min={1} onChange={(v) => update('redeemPoints', v)} suffix={s.pointsLabel} label="Points" />
                            =
                            <NumberInput value={s.redeemAmount} min={0.01} step={0.01} onChange={(v) => update('redeemAmount', v)} prefix={symbol} width="w-20" label="Amount off" />
                            off
                        </Sentence>
                        {s.earnPurchase && back > 0 && (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                                Customers get {back.toFixed(back < 1 ? 2 : 1).replace(/\.0+$/, '')}% of what they spend back in points.
                                {back > 10 && ' That is generous; most stores give 1–5%.'}
                            </div>
                        )}
                        <Sentence>
                            Use at least
                            <NumberInput value={s.redeemMinPoints} onChange={(v) => update('redeemMinPoints', v)} suffix={s.pointsLabel} label="Minimum points" />
                            at a time
                        </Sentence>
                        <Sentence>
                            Points pay up to
                            <NumberInput value={s.redeemMaxPercent} min={1} max={100} onChange={(v) => update('redeemMaxPercent', v)} suffix="%" width="w-14" label="Most of an order" />
                            of an order
                        </Sentence>
                        <ToggleRow title="In the cart" icon={<ShoppingBag size={14} />} on={s.redeemOnCart} onClick={() => flip('redeemOnCart')} />
                        <ToggleRow title="At checkout" icon={<Store size={14} />} on={s.redeemOnCheckout} onClick={() => flip('redeemOnCheckout')} />
                        {!couponsEnabled && <Notice>Coupons are off in WooCommerce (Settings → General). Points are used like a coupon, so turn coupons on.</Notice>}
                    </div>
                </Card>

                <Card title="Points expire" desc="Unused points are a cost on your books; expiry keeps them in check." icon={<Hourglass size={14} />} aside={<Toggle on={s.expiryEnabled} onClick={() => flip('expiryEnabled')} label="Points expire" />}>
                    <div className={`space-y-2 ${s.expiryEnabled ? '' : 'opacity-40 pointer-events-none'}`}>
                        <Sentence>
                            After
                            <NumberInput value={s.expiryMonths} min={1} max={120} onChange={(v) => update('expiryMonths', v)} suffix="months" width="w-14" label="Months" />
                            without earning or using points
                        </Sentence>
                        <Hint>Customers see the date in My Account; any activity moves it forward.</Hint>
                    </div>
                </Card>
            </div>
        );
    }

    if (tab === 'display') {
        return (
            <div className="space-y-3 wct-fade-in">
                <Card title="Program name" desc="What customers see; your store's name for its points." icon={<Gift size={14} />}>
                    <div className="space-y-2" onFocus={() => onPreview('account')}>
                        <TextInput value={s.programName} onChange={(v) => update('programName', v)} maxLength={60} placeholder="Reward Points" />
                        <div className="grid grid-cols-2 gap-2">
                            <Field label="One">
                                <TextInput value={s.pointLabel} onChange={(v) => update('pointLabel', v)} maxLength={30} placeholder="point" />
                            </Field>
                            <Field label="Many">
                                <TextInput value={s.pointsLabel} onChange={(v) => update('pointsLabel', v)} maxLength={30} placeholder="points" />
                            </Field>
                        </div>
                        <Hint>For example "star" and "stars", or "coin" and "coins".</Hint>
                    </div>
                </Card>

                <Card title="Messages" desc="{points} becomes the number, such as 120 points." icon={<Megaphone size={14} />}>
                    <div className="space-y-3">
                        <div className="space-y-1.5" onFocus={() => onPreview('product')}>
                            <ToggleRow title="Product pages" on={s.showProductMessage} onClick={() => flip('showProductMessage')} />
                            {s.showProductMessage && <TextInput value={s.productMessage} onChange={(v) => update('productMessage', v)} maxLength={160} />}
                        </div>
                        <div className="space-y-1.5" onFocus={() => onPreview('cart')}>
                            <ToggleRow title="Cart and checkout" on={s.showCartMessage} onClick={() => flip('showCartMessage')} />
                            {s.showCartMessage && <TextInput value={s.cartMessage} onChange={(v) => update('cartMessage', v)} maxLength={160} />}
                        </div>
                        <div className="space-y-1.5" onFocus={() => onPreview('cart')}>
                            <ToggleRow title="Shoppers who aren't signed in" desc="With a link to sign in" on={s.showGuestMessage} onClick={() => flip('showGuestMessage')} />
                            {s.showGuestMessage && <TextInput value={s.guestMessage} onChange={(v) => update('guestMessage', v)} maxLength={160} />}
                        </div>
                    </div>
                </Card>

                <Card title="My Account" desc="Balance, ways to earn and history on a page of its own." icon={<Store size={14} />} aside={<Toggle on={s.accountTab} onClick={() => flip('accountTab')} label="My Account page" />}>
                    {accountUrl && s.accountTab && (
                        <a href={accountUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 no-underline hover:text-blue-700">
                            Open the page →
                        </a>
                    )}
                </Card>
            </div>
        );
    }

    // Boost (Pro): tiers and campaigns
    const tiers = s.tiers || [];
    const campaigns = s.campaigns || [];
    const setTier = (i, key, value) => update('tiers', tiers.map((t, j) => (j === i ? { ...t, [key]: value } : t)));
    const setCampaign = (i, key, value) => update('campaigns', campaigns.map((c, j) => (j === i ? { ...c, [key]: value } : c)));
    const today = new Date().toISOString().slice(0, 10);
    const inAWeek = new Date(Date.now() + 6 * 864e5).toISOString().slice(0, 10);

    return (
        <div className="space-y-3 wct-fade-in" onFocus={() => onPreview('account')}>
            <Card
                title="Tiers"
                desc="Customers move up by the points they earn and get more points on every purchase."
                icon={<Crown size={14} />}
                locked={locked}
                upgradeUrl={UPGRADE_URL}
                aside={!locked && <Toggle on={s.tiersEnabled} onClick={() => flip('tiersEnabled')} label="Tiers" />}
            >
                <div className={`space-y-2 ${s.tiersEnabled || locked ? '' : 'opacity-40 pointer-events-none'}`}>
                    {tiers.map((t, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="flex-1 min-w-0">
                                <TextInput value={t.name} onChange={(v) => setTier(i, 'name', v)} maxLength={40} placeholder="Tier name" />
                            </div>
                            <NumberInput value={i === 0 ? 0 : t.min} disabled={i === 0} onChange={(v) => setTier(i, 'min', v)} suffix="pts+" width="w-16" label={`${t.name} starts at`} />
                            <NumberInput value={t.multiplier} min={0.1} max={10} step={0.05} onChange={(v) => setTier(i, 'multiplier', v)} suffix="×" width="w-12" label={`${t.name} multiplier`} />
                            <button type="button" disabled={tiers.length <= 1} onClick={() => update('tiers', tiers.filter((_, j) => j !== i))} className="p-1.5 rounded-md text-slate-300 hover:text-rose-500 disabled:opacity-30" aria-label={`Remove ${t.name}`}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {tiers.length < 10 && (
                        <button
                            type="button"
                            onClick={() => update('tiers', [...tiers, { name: `Tier ${tiers.length + 1}`, min: (tiers[tiers.length - 1]?.min || 0) + 1000, multiplier: 1 }])}
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600"
                        >
                            <Plus size={13} /> Add a tier
                        </button>
                    )}
                    <Hint>Every point a customer earns counts toward their tier (points you add by hand don't); refunds take theirs back. A 1.5× tier gets {label(s, 15)} where others get {label(s, 10)}.</Hint>
                </div>
            </Card>

            <Card
                title="Campaigns"
                desc="Extra points between two dates, such as a double points weekend."
                icon={<CalendarClock size={14} />}
                locked={locked}
                upgradeUrl={UPGRADE_URL}
            >
                <div className="space-y-2">
                    {campaigns.length === 0 && <Hint>No campaigns yet.</Hint>}
                    {campaigns.map((c, i) => (
                        <div key={c.id || i} className="p-3 rounded-lg border border-solid border-slate-200 space-y-2">
                            <div className="flex items-center gap-1.5">
                                <div className="flex-1 min-w-0">
                                    <TextInput value={c.name} onChange={(v) => setCampaign(i, 'name', v)} maxLength={60} placeholder="Double points weekend" />
                                </div>
                                <Toggle on={c.active !== false} onClick={() => setCampaign(i, 'active', c.active === false)} label={`${c.name} on`} />
                                <button type="button" onClick={() => update('campaigns', campaigns.filter((_, j) => j !== i))} className="p-1.5 rounded-md text-slate-300 hover:text-rose-500" aria-label={`Remove ${c.name}`}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-600">
                                <NumberInput value={c.multiplier} min={1} max={10} step={0.5} onChange={(v) => setCampaign(i, 'multiplier', v)} suffix="× points" width="w-12" label="Multiplier" />
                                from
                                <input type="date" value={c.start} onChange={(e) => setCampaign(i, 'start', e.target.value)} className="!h-9 !min-h-0 !px-2 !text-xs font-bold !border !border-solid !border-slate-200 !rounded-lg" aria-label="Start date" />
                                to
                                <input type="date" value={c.end} onChange={(e) => setCampaign(i, 'end', e.target.value)} className="!h-9 !min-h-0 !px-2 !text-xs font-bold !border !border-solid !border-slate-200 !rounded-lg" aria-label="End date" />
                            </div>
                        </div>
                    ))}
                    {campaigns.length < 20 && (
                        <button
                            type="button"
                            onClick={() => update('campaigns', [...campaigns, { id: `c${Date.now().toString(36)}`, name: 'Double points weekend', multiplier: 2, start: today, end: inAWeek, active: true }])}
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600"
                        >
                            <Plus size={13} /> Add a campaign
                        </button>
                    )}
                    <Hint>Dates use your store's time zone and include the end day. With a tier bonus too, the two multiply.</Hint>
                </div>
            </Card>
        </div>
    );
}
