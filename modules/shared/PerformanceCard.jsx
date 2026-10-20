import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BarChart3, Lock } from 'lucide-react';
import { ADDS_TO_CART, MODULE_EVENTS } from './moduleEvents.js';
import { change, formatMoney, formatNumber } from './format.js';

/**
 * A module's own numbers from WiseCampaign Analytics, for the sidebar of its dashboard:
 * the last 30 days (7 without Pro) next to the period before.
 * Data: GET wisecampaign/v1/analytics/module (includes/Classes/Analytics.php).
 */
export default function PerformanceCard({ module }) {
    const [data, setData] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const nonce = window.wiseModuleData?.nonce;
        fetch(`${window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/'}analytics/module?module=${module}`, {
            headers: nonce ? { 'X-WP-Nonce': nonce } : {},
            cache: 'no-store',
        })
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then(setData)
            .catch(() => setFailed(true));
    }, [module]);

    // Numbers are a bonus here; never get in the way of the settings
    if (failed) return null;

    const meta = MODULE_EVENTS[module];
    const now = data?.current;
    const before = data?.previous;
    const stats = [];
    if (meta.seen) {
        stats.push({ label: meta.seen.label, value: now?.events?.[meta.seen.event] ?? 0, before: before?.events?.[meta.seen.event] ?? 0 });
    }
    if (meta.engaged) {
        stats.push({ label: meta.engaged.label, value: now?.events?.[meta.engaged.event] ?? 0, before: before?.events?.[meta.engaged.event] ?? 0 });
    } else if (ADDS_TO_CART.includes(module)) {
        stats.push({ label: 'adds to cart', value: now?.addToCart ?? 0, before: before?.addToCart ?? 0 });
    }
    if (module === 'discountmanager') {
        stats.push({ label: 'discount given', value: now?.discount, before: before?.discount, money: true, pro: true });
    }
    stats.push({ label: 'orders', value: now?.orders, before: before?.orders, pro: true });
    stats.push({ label: 'revenue', value: now?.revenue, before: before?.revenue, money: true, pro: true });

    const empty = data && !stats.some((s) => s.value);

    return (
        <div className="mt-3 rounded-xl border border-solid border-slate-200 bg-white p-4 text-left">
            <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <BarChart3 size={13} className="text-blue-600" />
                    {data ? `Last ${data.days} days` : 'Performance'}
                </span>
                <a href={data?.url || 'admin.php?page=wisecampaign_analytics'} className="text-[11px] font-bold text-blue-600 no-underline hover:text-blue-700">
                    Analytics →
                </a>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                {stats.map((s, i) => {
                    const locked = data && s.pro && !data.isPro;
                    const delta = data?.comparable && !locked ? change(s.value, s.before) : null;
                    return (
                        <div key={s.label} className={`min-w-0 ${stats.length % 2 && i === stats.length - 1 ? 'col-span-2' : ''}`}>
                            {locked ? (
                                <a href={data.url} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider no-underline" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                                    <Lock size={10} /> Pro
                                </a>
                            ) : (
                                <div className={`text-lg font-black leading-tight truncate ${data ? 'text-[#0F172A]' : 'text-slate-300'}`}>
                                    {!data ? '…' : s.money ? formatMoney(s.value, data.currency) : formatNumber(s.value)}
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                                <span className="truncate">{s.label}</span>
                                {delta !== null && Number.isFinite(delta) && (
                                    <span className={`inline-flex items-center font-bold shrink-0 ${delta >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                        {delta >= 0 ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
                                        {Math.abs(delta).toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {data && !data.tracking && <p className="m-0 mt-3 text-[11px] text-amber-700">Analytics is paused, so new numbers are not counted.</p>}
            {data && data.tracking && empty && <p className="m-0 mt-3 text-[11px] text-slate-500">{meta.credit}. Numbers show up as shoppers use it.</p>}
        </div>
    );
}
