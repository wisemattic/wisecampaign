import React, { useEffect, useState } from 'react';
import { AlertCircle, BarChart3, Coins, Crown, Loader2, Lock, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { api, label, money, UPGRADE_URL } from '../points.jsx';
import { compactNumber, formatDate } from '../../../shared/format.js';

const SOURCE_NAMES = {
    order: 'Purchases',
    signup: 'Signups',
    review: 'Reviews',
    referral: 'Referrals',
    friend: 'Referred friends',
    birthday: 'Birthdays',
    admin: 'Given by you',
};

const Kpi = ({ icon, title, value, sub, tint = 'bg-violet-50 text-violet-600' }) => (
    <div className="p-4 rounded-2xl bg-white border border-solid border-slate-200 space-y-2">
        <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${tint}`}>{icon}</span>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{title}</span>
        </div>
        <div className="text-2xl font-black text-[#0F172A] leading-tight">{value}</div>
        {sub && <div className="text-[11px] font-medium text-slate-500">{sub}</div>}
    </div>
);

// Points given and used per day, as paired bars
const Bars = ({ daily }) => {
    const max = Math.max(1, ...daily.map((d) => Math.max(d.issued, d.redeemed)));
    const w = 100 / daily.length;
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500" />Given</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />Used</span>
                <span className="ml-auto text-slate-400">max {compactNumber(max)} a day</span>
            </div>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-40" role="img" aria-label="Points given and used per day">
                {daily.map((d, i) => (
                    <g key={d.date}>
                        <title>{`${formatDate(d.date)}: ${d.issued} given, ${d.redeemed} used`}</title>
                        <rect x={i * w + w * 0.12} y={40 - (d.issued / max) * 38} width={w * 0.36} height={(d.issued / max) * 38} fill="#8b5cf6" rx="0.4" />
                        <rect x={i * w + w * 0.52} y={40 - (d.redeemed / max) * 38} width={w * 0.36} height={(d.redeemed / max) * 38} fill="#34d399" rx="0.4" />
                    </g>
                ))}
            </svg>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>{formatDate(daily[0].date)}</span>
                <span>{formatDate(daily[daily.length - 1].date)}</span>
            </div>
        </div>
    );
};

export default function Analytics({ isPro, settings, currency }) {
    const [days, setDays] = useState(30);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isPro) return;
        setData(null);
        setError('');
        api(`/analytics?days=${days}`)
            .then(setData)
            .catch((e) => setError(e.message));
    }, [isPro, days]);

    if (!isPro) {
        return (
            <div className="max-w-4xl mx-auto w-full px-8 py-10">
                <div className="relative rounded-3xl bg-white border border-solid border-slate-200 p-10 text-center overflow-hidden">
                    <div className="absolute inset-x-10 top-6 h-24 rounded-xl bg-gradient-to-r from-violet-100 via-indigo-50 to-emerald-50 blur-sm opacity-80" />
                    <div className="relative space-y-3">
                        <div className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-600"><Lock size={22} /></div>
                        <h2 className="m-0 text-xl font-black text-[#0F172A]">See what your points bring in</h2>
                        <p className="m-0 mx-auto max-w-lg text-sm text-slate-500">
                            Revenue from orders paid partly with points, average order value next to other orders, points given and used every day,
                            what you owe in unused points, where points come from, and your most loyal customers.
                        </p>
                        <a href={UPGRADE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-black no-underline shadow-lg shadow-amber-200">
                            Unlock with Pro
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
                <AlertCircle size={24} className="text-rose-500" />
                <div className="text-sm font-bold text-slate-600">{error}</div>
                <div className="text-xs text-slate-400">Update wiseCampaign Pro to the latest version for wiseRewards analytics.</div>
            </div>
        );
    }

    if (!data) {
        return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-blue-600" /></div>;
    }

    const t = data.totals;
    const totalSources = data.sources.reduce((a, s) => a + s.points, 0) || 1;
    return (
        <div className="max-w-6xl mx-auto w-full px-8 py-6 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="m-0 text-lg font-black text-[#0F172A]">wiseRewards analytics</h2>
                    <p className="m-0 text-xs text-slate-500">{formatDate(data.range.from)} – {formatDate(data.range.to)}</p>
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-solid border-slate-200">
                    {[7, 30, 90].map((d) => (
                        <button key={d} type="button" onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-md text-xs font-bold ${days === d ? 'bg-slate-100 text-blue-600' : 'text-slate-500'}`}>
                            {d} days
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Kpi icon={<ShoppingBag size={14} />} title="Orders with points" value={t.ordersWithPoints.toLocaleString()} sub={`${money(t.revenueWithPoints, currency)} revenue`} tint="bg-blue-50 text-blue-600" />
                <Kpi
                    icon={<TrendingUp size={14} />}
                    title="Average order"
                    value={money(t.aovWithPoints, currency)}
                    sub={t.aovOthers ? `${money(t.aovOthers, currency)} for orders without points` : 'With points used'}
                    tint="bg-emerald-50 text-emerald-600"
                />
                <Kpi icon={<Coins size={14} />} title="Points given" value={compactNumber(t.issued)} sub={`${compactNumber(t.redeemed)} used · ${compactNumber(t.expired)} expired`} />
                <Kpi icon={<Wallet size={14} />} title="Unused points" value={compactNumber(t.outstanding)} sub={`${money(t.liability, currency)} you owe · ${t.members.toLocaleString()} ${t.members === 1 ? 'customer' : 'customers'}`} tint="bg-amber-50 text-amber-600" />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 p-5 rounded-2xl bg-white border border-solid border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-black text-[#0F172A]"><BarChart3 size={15} className="text-violet-600" /> Points per day</div>
                    <Bars daily={data.daily} />
                </div>
                <div className="p-5 rounded-2xl bg-white border border-solid border-slate-200 space-y-3">
                    <div className="text-sm font-black text-[#0F172A]">Where points come from</div>
                    {data.sources.length === 0 && <div className="text-xs text-slate-400">No points given in this period.</div>}
                    {data.sources.map((s) => (
                        <div key={s.source} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                                <span>{SOURCE_NAMES[s.source] || s.source}</span>
                                <span>{s.points.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full bg-violet-500" style={{ width: `${(s.points / totalSources) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                    {t.redeemRate !== null && <div className="pt-2 text-[11px] text-slate-500">{t.redeemRate}% of all points given so far have been used.</div>}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 p-5 rounded-2xl bg-white border border-solid border-slate-200 space-y-3">
                    <div className="text-sm font-black text-[#0F172A]">Most loyal customers</div>
                    {data.top.length === 0 ? (
                        <div className="text-xs text-slate-400">No customers with points yet.</div>
                    ) : (
                        <table className="w-full text-xs border-collapse">
                            <tbody>
                                {data.top.map((c, i) => (
                                    <tr key={c.id} className={i ? 'border-0 border-t border-solid border-slate-100' : ''}>
                                        <td className="py-2 w-6 font-black text-slate-300">{i + 1}</td>
                                        <td className="py-2">
                                            <div className="font-black text-[#0F172A]">{c.name}</div>
                                            <div className="text-[11px] text-slate-500">{c.email}</div>
                                        </td>
                                        <td className="py-2 text-right font-bold text-emerald-600">{label(settings, c.earned)} earned</td>
                                        <td className="py-2 text-right font-bold text-slate-500">{c.redeemed.toLocaleString()} used</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-5 rounded-2xl bg-white border border-solid border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-black text-[#0F172A]"><Crown size={15} className="text-amber-500" /> Tiers</div>
                    {!data.tiers ? (
                        <div className="text-xs text-slate-400">Tiers are off (Settings → Boost).</div>
                    ) : (
                        data.tiers.map((tier) => (
                            <div key={tier.name} className="flex justify-between text-xs font-bold text-slate-600">
                                <span>{tier.name} <span className="text-slate-400">{tier.multiplier}×</span></span>
                                <span>{tier.members.toLocaleString()} {tier.members === 1 ? 'customer' : 'customers'}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
