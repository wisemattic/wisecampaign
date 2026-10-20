import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    CheckCircle2,
    ChevronDown,
    Crown,
    Info,
    Loader2,
    Lock,
    RefreshCw,
    Settings2,
    Sparkles,
    X,
} from 'lucide-react';
import TrendChart from './TrendChart.jsx';
import { MODULES } from './modules.js';
import { ADDS_TO_CART } from '../../shared/moduleEvents.js';
import { change, compactMoney, compactNumber, formatDate, formatMoney, formatNumber } from '../../shared/format.js';

const PRICING_URL = 'https://wisemattic.com/wisecampaign/pricing';
const RANGES = [7, 30, 90];
// Chart colors: the series the chart is about, and the context it sits in
const ACCENT = '#2a78d6';
const CONTEXT = '#898781';

const api = (path) => `${window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/'}analytics/${path}`;
const headers = (json = false) => ({
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(window.wiseModuleData?.nonce ? { 'X-WP-Nonce': window.wiseModuleData.nonce } : {}),
});
const adminUrl = (page) => `admin.php?page=${page}`;

const daysBefore = (iso, days) => {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d - days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const Delta = ({ value, period }) => {
    if (value === null || !Number.isFinite(value)) return null;
    const up = value >= 0;
    const Icon = up ? ArrowUpRight : ArrowDownRight;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? 'text-emerald-700' : 'text-rose-600'}`}>
            <Icon size={14} strokeWidth={2.5} />
            {up ? '+' : ''}{value.toFixed(Math.abs(value) < 10 ? 1 : 0)}%
            <span className="font-medium text-slate-400 ml-1">vs previous {period} days</span>
        </span>
    );
};

// A blurred stand-in number, so free sites see where the figure goes
const LockedValue = ({ onUnlock, compact = false, placeholder = '88,888' }) => (
    <button type="button" onClick={onUnlock} className="group flex items-center gap-2 text-left">
        <span className={`font-black text-slate-300 blur-[5px] select-none ${compact ? 'text-2xl' : 'text-5xl'}`} aria-hidden="true">
            {placeholder}
        </span>
        <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
            <Lock size={11} /> Pro
        </span>
    </button>
);

const Tile = ({ label, children, note }) => (
    <div className="bg-white rounded-2xl border border-solid border-slate-200 p-5 shadow-sm flex flex-col gap-2 min-w-0">
        <div className="text-xs font-bold text-slate-500">{label}</div>
        {children}
        {note && <div className="text-xs text-slate-500 leading-relaxed mt-auto">{note}</div>}
    </div>
);

const Toggle = ({ on, onClick, label }) => (
    <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onClick}
        className={`relative w-10 h-[22px] rounded-full transition-all shrink-0 ${on ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
        <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-[21px]' : 'left-[3px]'}`} />
    </button>
);

export default function App() {
    const [days, setDays] = useState(30);
    const [data, setData] = useState(null);
    const [status, setStatus] = useState('loading');
    const [refreshing, setRefreshing] = useState(false);
    const [view, setView] = useState('chart');
    const [showProModal, setShowProModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [toast, setToast] = useState(null);
    const [expanded, setExpanded] = useState({});
    const settingsRef = useRef(null);

    const load = useCallback(async (range) => {
        setRefreshing(true);
        try {
            const res = await fetch(`${api('report')}?days=${range}`, { headers: headers(), cache: 'no-store' });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message);
            setData(payload);
            setStatus('ready');
        } catch (e) {
            setStatus((s) => (s === 'ready' ? s : 'error'));
            setToast({ type: 'error', message: 'Could not load analytics. Please try again.' });
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        load(days);
    }, [days, load]);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        if (!showSettings) return undefined;
        const close = (e) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [showSettings]);

    const saveSetting = async (key, value) => {
        const previous = data.settings;
        setData((d) => ({ ...d, settings: { ...d.settings, [key]: value } }));
        try {
            const res = await fetch(api('settings'), { method: 'POST', headers: headers(true), body: JSON.stringify({ [key]: value }) });
            if (!res.ok) throw new Error();
            setToast({ type: 'success', message: 'Settings saved.' });
        } catch (e) {
            setData((d) => ({ ...d, settings: previous }));
            setToast({ type: 'error', message: 'Could not save. Please try again.' });
        }
    };

    const pickRange = (range) => {
        if (range !== 7 && data && !data.isPro) {
            setShowProModal(true);
            return;
        }
        setDays(range);
    };

    if (status !== 'ready') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-32px)] bg-[#F8FAFC] text-slate-500 gap-4">
                {status === 'loading' ? (
                    <>
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                        <span className="text-sm font-bold">Loading analytics…</span>
                    </>
                ) : (
                    <>
                        <AlertCircle size={28} className="text-rose-500" />
                        <span className="text-sm font-bold">Could not load analytics.</span>
                        <button type="button" onClick={() => { setStatus('loading'); load(days); }} className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold">
                            <RefreshCw size={14} /> Try Again
                        </button>
                    </>
                )}
            </div>
        );
    }

    const { totals, previous, currency, isPro } = data;
    const shownDays = data.days;
    // Deltas only mean something when the previous period was tracked too
    const comparable = daysBefore(data.range.from, shownDays) >= data.since;
    const delta = (now, before) => (comparable ? change(now, before) : null);
    const money = (v, opts) => formatMoney(v, currency, opts);
    const share = isPro && totals.storeRevenue ? (totals.revenue / totals.storeRevenue) * 100 : 0;
    const aovLift = isPro ? change(totals.aov, totals.aovOthers) : null;
    const hasData = data.interactions > 0 || (isPro && totals.storeOrders > 0);
    const dates = data.daily.map((d) => d.date);

    const rows = data.modules
        .map((m) => ({ ...m, meta: MODULES[m.id], on: !!data.enabled[m.id] }))
        .filter((m) => m.meta)
        .sort((a, b) => (b.on - a.on) || ((b.revenue || 0) - (a.revenue || 0)) || ((b.events[b.meta.seen?.event] || 0) - (a.events[a.meta.seen?.event] || 0)));

    const lock = <Lock size={13} className="inline text-amber-500" aria-label="Pro" />;
    const proOnly = (content) => (isPro ? content : lock);

    // Share of all paid orders' revenue, as a meter
    const shareCell = (revenue) => {
        if (!isPro) {
            return <button type="button" onClick={() => setShowProModal(true)} className="text-[11px] font-bold text-amber-600 hover:text-amber-700">Unlock with Pro</button>;
        }
        const pct = totals.storeRevenue ? (revenue / totals.storeRevenue) * 100 : 0;
        return (
            <div className="flex items-center gap-2 pt-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-blue-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: ACCENT }} />
                </div>
                <span className="text-xs font-bold text-slate-600 w-10 text-right">{pct.toFixed(pct && pct < 10 ? 1 : 0)}%</span>
            </div>
        );
    };

    // Discount Manager rules and product tables, shown under their module row
    const breakdownRows = (m) => {
        const items = m.breakdown || [];
        if (m.id === 'discountmanager') {
            return items.map((r) => ({
                key: `rule-${r.id}`,
                name: r.name,
                note: `Rule #${r.id}`,
                seen: null,
                added: null,
                orders: r.orders,
                revenue: r.revenue,
                sub: r.discount > 0 ? `${money(r.discount)} discount given` : null,
            }));
        }
        if (m.id === 'producttable') {
            return items.map((t) => ({
                key: `table-${t.id}`,
                name: t.name || `Table ${t.id}`,
                note: t.id ? `[product_table id="${t.id}"]` : 'Added before tables were told apart',
                seen: t.views,
                added: t.addToCart,
                orders: t.orders,
                revenue: t.revenue,
                sub: t.items ? `${formatNumber(t.items)} ${t.items === 1 ? 'item' : 'items'} from this table` : null,
            }));
        }
        return [];
    };

    return (
        <div className="flex flex-col h-[calc(100vh-32px)] bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {showProModal && (
                <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/60 backdrop-blur-md wa-fade-in p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 flex flex-col items-center text-center border border-solid border-slate-100 relative">
                        <button type="button" onClick={() => setShowProModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" aria-label="Close">
                            <X size={18} />
                        </button>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-200" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                            <Crown size={32} />
                        </div>
                        <h2 className="m-0 text-2xl font-black text-[#0F172A] tracking-tight mb-2">See the money WiseCampaign makes</h2>
                        <p className="m-0 text-slate-500 text-sm font-medium leading-relaxed mb-8">
                            Pro shows the revenue and orders each module brings in, how much bigger those orders are, and up to 90 days of history.
                        </p>
                        <a
                            href={window.wiseModuleData?.pro?.isInstalled ? window.wiseModuleData?.pro?.licensePageUrl : PRICING_URL}
                            target={window.wiseModuleData?.pro?.isInstalled ? undefined : '_blank'}
                            rel="noopener noreferrer"
                            className="w-full px-5 py-3 font-bold text-sm rounded-xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 no-underline"
                            style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
                        >
                            <span className="font-bold" style={{ color: '#FFFFFF' }}>{window.wiseModuleData?.pro?.isInstalled ? 'Activate License' : 'Upgrade to Pro'}</span>
                            <Sparkles size={16} style={{ color: '#FFFFFF' }} />
                        </a>
                    </div>
                </div>
            )}

            {/* Top Header */}
            <header className="pt-3 pb-3 bg-white border-0 border-b border-solid border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 shrink-0">W</div>
                    <span className="font-bold text-lg tracking-tight text-[#0F172A]">WiseCampaign</span>
                    <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs font-bold text-blue-600">
                        <BarChart3 size={14} />
                        Analytics
                    </div>
                    {isPro ? (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-solid border-emerald-100">
                            <CheckCircle2 size={12} /> Pro Active
                        </span>
                    ) : (
                        <button type="button" onClick={() => setShowProModal(true)} className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                            Free · Upgrade
                        </button>
                    )}
                </div>

                <div className="relative" ref={settingsRef}>
                    <button
                        type="button"
                        onClick={() => setShowSettings((v) => !v)}
                        aria-expanded={showSettings}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-solid border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-slate-300"
                    >
                        <Settings2 size={16} /> Tracking
                        <ChevronDown size={14} className={`transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                    </button>
                    {showSettings && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-solid border-slate-200 shadow-xl p-4 space-y-4 wa-fade-in">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Collect analytics</div>
                                    <div className="text-xs text-slate-500 leading-relaxed">Counts views, clicks and orders. No personal data is stored.</div>
                                </div>
                                <Toggle on={data.settings.enabled} label="Collect analytics" onClick={() => saveSetting('enabled', !data.settings.enabled)} />
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Skip admin visits</div>
                                    <div className="text-xs text-slate-500 leading-relaxed">Your own browsing as an admin is not counted.</div>
                                </div>
                                <Toggle on={data.settings.excludeAdmins} label="Skip admin visits" onClick={() => saveSetting('excludeAdmins', !data.settings.excludeAdmins)} />
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className={`max-w-[1240px] mx-auto px-6 py-6 space-y-5 transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
                    {/* Filter row: scopes everything below */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-white p-1 rounded-xl border border-solid border-slate-200 shadow-sm" role="group" aria-label="Date range">
                            {RANGES.map((r) => {
                                const locked = !isPro && r !== 7;
                                return (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => pickRange(r)}
                                        aria-pressed={shownDays === r}
                                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${shownDays === r ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                    >
                                        Last {r} days
                                        {locked && <Lock size={11} className="text-amber-500" />}
                                    </button>
                                );
                            })}
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                            {formatDate(data.range.from, { month: 'short', day: 'numeric', year: 'numeric' })} – {formatDate(data.range.to, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {refreshing && <Loader2 size={14} className="animate-spin text-slate-400" />}
                        <span className="ml-auto text-xs text-slate-400">Tracking since {formatDate(data.since, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    {!data.settings.enabled && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-solid border-amber-200 text-sm text-amber-800">
                            <AlertCircle size={18} className="shrink-0" />
                            <span className="flex-1">Analytics is paused, so new visits and orders are not counted.</span>
                            <button type="button" onClick={() => saveSetting('enabled', true)} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold">Resume</button>
                        </div>
                    )}

                    {!hasData && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-solid border-blue-100 text-sm text-blue-900">
                            <Info size={18} className="shrink-0 mt-0.5 text-blue-600" />
                            <span>
                                No numbers yet for this period. They appear as shoppers visit your store, and orders count once they are paid.
                                {data.settings.excludeAdmins && ' Your own visits as an admin are not counted.'}
                            </span>
                        </div>
                    )}

                    {/* KPI row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                        <div className="sm:col-span-2 bg-white rounded-2xl border border-solid border-slate-200 p-6 shadow-sm flex flex-col gap-3 min-w-0">
                            <div className="text-xs font-bold text-slate-500">Revenue with WiseCampaign</div>
                            {isPro ? (
                                <>
                                    <div className="text-5xl font-black tracking-tight text-[#0F172A] leading-none">{money(totals.revenue, { whole: totals.revenue >= 1000 })}</div>
                                    <Delta value={delta(totals.revenue, previous.revenue)} period={shownDays} />
                                    <div className="mt-auto space-y-1.5">
                                        <div className="h-2 rounded-full bg-blue-100 overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, share)}%`, background: ACCENT }} />
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            <span className="font-bold text-slate-700">{share.toFixed(share && share < 10 ? 1 : 0)}%</span> of all paid orders ({money(totals.storeRevenue, { whole: totals.storeRevenue >= 1000 })})
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <LockedValue onUnlock={() => setShowProModal(true)} placeholder={money(88888, { whole: true })} />
                                    <div className="text-xs text-slate-500 mt-auto">See how much of your revenue comes from orders WiseCampaign took part in.</div>
                                </>
                            )}
                        </div>

                        <Tile
                            label="Orders with WiseCampaign"
                            note={isPro ? `of ${formatNumber(totals.storeOrders)} paid orders` : 'Orders each module took part in'}
                        >
                            {isPro ? (
                                <>
                                    <div className="text-3xl font-black text-[#0F172A] leading-none">{formatNumber(totals.orders)}</div>
                                    <Delta value={delta(totals.orders, previous.orders)} period={shownDays} />
                                </>
                            ) : <LockedValue compact onUnlock={() => setShowProModal(true)} />}
                        </Tile>

                        <Tile
                            label="Average order with WiseCampaign"
                            note={isPro ? (totals.aovOthers ? `Other orders: ${money(totals.aovOthers)}` : 'No other orders to compare with yet') : 'Compared with orders without it'}
                        >
                            {isPro ? (
                                <>
                                    <div className="text-3xl font-black text-[#0F172A] leading-none">{money(totals.aov)}</div>
                                    {aovLift !== null && Number.isFinite(aovLift) && (
                                        <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${aovLift >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                            {aovLift >= 0 ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
                                            {aovLift >= 0 ? '+' : ''}{aovLift.toFixed(Math.abs(aovLift) < 10 ? 1 : 0)}%
                                            <span className="font-medium text-slate-400 ml-1">vs other orders</span>
                                        </span>
                                    )}
                                </>
                            ) : <LockedValue compact onUnlock={() => setShowProModal(true)} />}
                        </Tile>

                        <Tile label="Shopper interactions" note="Views, clicks and adds to cart across modules">
                            <div className="text-3xl font-black text-[#0F172A] leading-none">{formatNumber(data.interactions)}</div>
                            <Delta value={delta(data.interactions, data.previousInteractions)} period={shownDays} />
                        </Tile>
                    </div>

                    {/* Trend */}
                    <section className="bg-white rounded-2xl border border-solid border-slate-200 p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div>
                                <h2 className="m-0 text-base font-black text-[#0F172A]">{isPro ? 'Revenue per day' : 'Shopper interactions per day'}</h2>
                                {isPro ? (
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                                        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: ACCENT }} />Orders with WiseCampaign</span>
                                        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: CONTEXT }} />All paid orders</span>
                                    </div>
                                ) : (
                                    <p className="m-0 mt-1 text-xs text-slate-500">Revenue per day is a Pro feature.</p>
                                )}
                            </div>
                            <div className="flex bg-slate-100 p-0.5 rounded-lg" role="group" aria-label="Show as">
                                {['chart', 'table'].map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setView(v)}
                                        aria-pressed={view === v}
                                        className={`px-3 py-1 rounded-md text-[11px] font-bold capitalize ${view === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {view === 'chart' ? (
                            <TrendChart
                                dates={dates}
                                label={isPro ? 'Revenue per day: orders with WiseCampaign and all paid orders' : 'Shopper interactions per day'}
                                series={isPro ? [
                                    { key: 'revenue', label: 'with WiseCampaign', color: ACCENT, values: data.daily.map((d) => d.revenue) },
                                    { key: 'store', label: 'all paid orders', color: CONTEXT, values: data.daily.map((d) => d.storeRevenue) },
                                ] : [
                                    { key: 'interactions', label: 'interactions', color: ACCENT, values: data.daily.map((d) => d.interactions) },
                                ]}
                                formatValue={isPro ? (v) => money(v) : (v) => formatNumber(v)}
                                formatAxis={isPro ? (v) => compactMoney(v, currency) : compactNumber}
                            />
                        ) : (
                            <div className="max-h-[260px] overflow-y-auto border border-solid border-slate-100 rounded-xl">
                                <table className="w-full text-sm border-collapse">
                                    <thead className="sticky top-0 bg-slate-50">
                                        <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                                            <th className="px-4 py-2 font-bold">Date</th>
                                            {isPro && <th className="px-4 py-2 font-bold text-right">With WiseCampaign</th>}
                                            {isPro && <th className="px-4 py-2 font-bold text-right">All paid orders</th>}
                                            {isPro && <th className="px-4 py-2 font-bold text-right">Orders</th>}
                                            <th className="px-4 py-2 font-bold text-right">Interactions</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {[...data.daily].reverse().map((d) => (
                                            <tr key={d.date} className="border-0 border-t border-solid border-slate-100">
                                                <td className="px-4 py-2 text-slate-600">{formatDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                                                {isPro && <td className="px-4 py-2 text-right font-semibold text-slate-900">{money(d.revenue)}</td>}
                                                {isPro && <td className="px-4 py-2 text-right text-slate-600">{money(d.storeRevenue)}</td>}
                                                {isPro && <td className="px-4 py-2 text-right text-slate-600">{formatNumber(d.orders)}</td>}
                                                <td className="px-4 py-2 text-right text-slate-600">{formatNumber(d.interactions)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Modules */}
                    <section className="bg-white rounded-2xl border border-solid border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 pt-6 pb-4">
                            <h2 className="m-0 text-base font-black text-[#0F172A]">By module</h2>
                            <p className="m-0 mt-1 text-xs text-slate-500">
                                An order can count for more than one module, so the rows add up to more than the total above.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse min-w-[880px]">
                                <thead>
                                    <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50">
                                        <th className="px-6 py-2.5 font-bold">Module</th>
                                        <th className="px-4 py-2.5 font-bold text-right">Seen</th>
                                        <th className="px-4 py-2.5 font-bold text-right">Engaged</th>
                                        <th className="px-4 py-2.5 font-bold text-right">Added to cart</th>
                                        <th className="px-4 py-2.5 font-bold text-right">Orders</th>
                                        <th className="px-4 py-2.5 font-bold text-right">Revenue</th>
                                        <th className="px-6 py-2.5 font-bold w-[180px]">Share of revenue</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {rows.map((m) => {
                                        const Icon = m.meta.icon;
                                        const seen = m.meta.seen ? m.events[m.meta.seen.event] || 0 : null;
                                        const engaged = m.meta.engaged ? m.events[m.meta.engaged.event] || 0 : null;
                                        const canAdd = ADDS_TO_CART.includes(m.id);
                                        const parts = breakdownRows(m);
                                        const open = !!expanded[m.id];
                                        return (
                                            <React.Fragment key={m.id}>
                                                <tr className={`border-0 border-t border-solid border-slate-100 ${m.on ? '' : 'bg-slate-50/60'}`}>
                                                    <td className="px-6 py-3.5">
                                                        <div className={`flex items-center gap-3 ${m.on ? '' : 'opacity-60'}`}>
                                                            <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${m.meta.tint}`}><Icon size={16} /></span>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    {m.on && (m.id !== 'discountmanager' || isPro) ? (
                                                                        <a href={adminUrl(m.meta.page)} className="font-bold text-slate-900 no-underline hover:text-blue-600">{m.meta.name}</a>
                                                                    ) : (
                                                                        <span className="font-bold text-slate-900">{m.meta.name}</span>
                                                                    )}
                                                                    {!m.on && (
                                                                        <a href={adminUrl('wisecampaign_getting_started')} className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 no-underline">Off</a>
                                                                    )}
                                                                    {parts.length > 0 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setExpanded((e) => ({ ...e, [m.id]: !open }))}
                                                                            aria-expanded={open}
                                                                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600"
                                                                        >
                                                                            {parts.length} {m.id === 'discountmanager' ? (parts.length === 1 ? 'rule' : 'rules') : (parts.length === 1 ? 'table' : 'tables')}
                                                                            <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="text-[11px] text-slate-500">{m.meta.credit}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right align-top">
                                                        <div className="font-semibold text-slate-900">{seen === null ? '—' : formatNumber(seen)}</div>
                                                        {m.meta.seen && <div className="text-[11px] text-slate-500">{m.meta.seen.label}</div>}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right align-top">
                                                        <div className="font-semibold text-slate-900">{engaged === null ? '—' : formatNumber(engaged)}</div>
                                                        {m.meta.engaged && <div className="text-[11px] text-slate-500">{m.meta.engaged.label}</div>}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right align-top font-semibold text-slate-900">{canAdd ? formatNumber(m.addToCart) : '—'}</td>
                                                    <td className="px-4 py-3.5 text-right align-top font-semibold text-slate-900">{proOnly(formatNumber(m.orders))}</td>
                                                    <td className="px-4 py-3.5 text-right align-top">
                                                        {proOnly(
                                                            <>
                                                                <div className="font-bold text-slate-900">{money(m.revenue)}</div>
                                                                {m.directRevenue > 0 && <div className="text-[11px] text-slate-500">{money(m.directRevenue)} added directly</div>}
                                                                {m.discount > 0 && <div className="text-[11px] text-slate-500">{money(m.discount)} discount given</div>}
                                                            </>,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3.5 align-top">{shareCell(m.revenue)}</td>
                                                </tr>
                                                {open && parts.map((p) => (
                                                    <tr key={p.key} className="border-0 border-t border-solid border-slate-100 bg-slate-50/50">
                                                        <td className="pl-[72px] pr-6 py-2.5">
                                                            <div className="text-[13px] font-semibold text-slate-800">{p.name}</div>
                                                            <div className="text-[11px] text-slate-500">{p.note}</div>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right align-top">
                                                            <div className="font-semibold text-slate-700">{p.seen === null ? '—' : formatNumber(p.seen)}</div>
                                                            {p.seen !== null && <div className="text-[11px] text-slate-500">views</div>}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right align-top text-slate-700">—</td>
                                                        <td className="px-4 py-2.5 text-right align-top font-semibold text-slate-700">{p.added === null ? '—' : formatNumber(p.added)}</td>
                                                        <td className="px-4 py-2.5 text-right align-top font-semibold text-slate-700">{proOnly(formatNumber(p.orders))}</td>
                                                        <td className="px-4 py-2.5 text-right align-top">
                                                            {proOnly(
                                                                <>
                                                                    <div className="font-bold text-slate-800">{money(p.revenue)}</div>
                                                                    {p.sub && <div className="text-[11px] text-slate-500">{p.sub}</div>}
                                                                </>,
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-2.5 align-top">{shareCell(p.revenue)}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* How it is counted */}
                    <details className="group bg-white rounded-2xl border border-solid border-slate-200 shadow-sm">
                        <summary className="flex items-center justify-between gap-3 px-6 py-4 cursor-pointer list-none">
                            <span className="flex items-center gap-2 text-sm font-black text-[#0F172A]"><Info size={16} className="text-blue-600" /> How WiseCampaign counts</span>
                            <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <ul className="m-0 px-6 pb-5 pl-11 space-y-2 text-sm text-slate-600 leading-relaxed list-disc">
                            <li><strong>Added directly:</strong> the product went into the cart through the module (Product Table, Buy Now, a video's add to cart button).</li>
                            <li><strong>Took part:</strong> the shopper used the module in the {data.attributionDays} days before buying, for example clicked a banner or a sales popup, or added a product next to the stock bar.</li>
                            <li><strong>Discount Manager:</strong> orders that got one of your discounts, and how much the discounts came to.</li>
                            <li>Only paid orders (processing or completed) count, and refunds are taken off. Revenue is the order total.</li>
                            <li>No names, emails or IP addresses are stored, only daily counts. Search engines and bots are ignored{data.settings.excludeAdmins ? ', and so are admins' : ''}.</li>
                        </ul>
                    </details>
                </div>
            </main>

            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100002] wa-slide-up">
                    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold text-white ${toast.type === 'error' ? 'bg-rose-600' : 'bg-[#0F172A]'}`}>
                        {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-emerald-400" />}
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
}
