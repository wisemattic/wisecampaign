import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Crown,
    Eye,
    Lock,
    MousePointerClick,
    RefreshCw,
    Settings2,
    ShieldCheck,
    Table2,
    TrendingUp
} from 'lucide-react';
import { CHART_COLORS, DeviceSplit, Funnel, Sparkline, TrendChart } from './charts';

const RANGES = [
    { days: 7, label: '7 days' },
    { days: 30, label: '30 days' },
    { days: 90, label: '90 days' },
    { days: 365, label: '12 months' }
];

const DEVICES = [
    { key: 'desktop', label: 'Desktop' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'tablet', label: 'Tablet' }
];

const ratio = (part, whole) => (whole ? part / whole : 0);

const makeFormatters = (currency) => {
    const compact = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });
    const whole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

    const formatNumber = (value) => (Math.abs(value) >= 10000 ? compact.format(value) : whole.format(value));
    const formatPercent = (value) => {
        const pct = value * 100;
        return `${pct > 0 && pct < 1 ? pct.toFixed(2) : pct.toFixed(1)}%`;
    };
    const formatMoney = (value, short = false) => {
        if (!currency) return whole.format(value);
        const decimals = short ? 0 : currency.decimals;
        const amount = short && Math.abs(value) >= 10000
            ? compact.format(value)
            : new Intl.NumberFormat(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
        switch (currency.position) {
            case 'right': return `${amount}${currency.symbol}`;
            case 'right_space': return `${amount} ${currency.symbol}`;
            case 'left_space': return `${currency.symbol} ${amount}`;
            default: return `${currency.symbol}${amount}`;
        }
    };
    return { formatNumber, formatPercent, formatMoney };
};

/** Change vs the previous period of the same length. */
const getDelta = (current, previous) => {
    if (!previous && !current) return null;
    if (!previous) return { label: 'New', direction: 'up' };
    const change = (current - previous) / previous;
    if (Math.abs(change) < 0.0005) return { label: '0%', direction: 'flat' };
    return { label: `${Math.abs(change * 100).toFixed(1)}%`, direction: change > 0 ? 'up' : 'down' };
};

const DeltaBadge = ({ delta, invert = false, days }) => {
    if (!delta) return <span className="text-[11px] text-slate-400">No data in previous {days} days</span>;
    const good = delta.direction === 'flat' ? null : (delta.direction === 'up') !== invert;
    const color = good === null ? '#64748B' : good ? '#047857' : '#D03B3B';
    const Icon = delta.direction === 'down' ? ArrowDownRight : ArrowUpRight;
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color }}>
            {delta.direction !== 'flat' && <Icon size={13} strokeWidth={2.5} />}
            {delta.label}
            <span className="font-medium text-slate-400">vs previous {days} days</span>
        </span>
    );
};

const ProLockOverlay = ({ onUnlock, message }) => (
    <button
        type="button"
        onClick={onUnlock}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/70 backdrop-blur-[3px] text-center px-4 cursor-pointer group"
    >
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
            <Crown size={11} /> Pro
        </span>
        <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{message}</span>
    </button>
);

const StatTile = ({ label, value, delta, invert, days, spark, hint, size = 'lg', locked, onUnlock, lockMessage }) => (
    <div className={`relative bg-white rounded-xl border border-slate-200 ${size === 'lg' ? 'p-5' : 'p-4'}`}>
        {locked && <ProLockOverlay onUnlock={onUnlock} message={lockMessage} />}
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500" title={hint}>{label}</div>
                <div className={`font-bold text-slate-900 tracking-tight mt-1.5 ${size === 'lg' ? 'text-[28px] leading-8' : 'text-xl'}`}>
                    {locked ? '•••' : value}
                </div>
            </div>
            {spark && !locked && <Sparkline values={spark} />}
        </div>
        <div className="mt-2.5 min-h-[16px]">
            {!locked && <DeltaBadge delta={delta} invert={invert} days={days} />}
        </div>
    </div>
);

const Card = ({ title, subtitle, actions, children, className = '' }) => (
    <section className={`bg-white rounded-xl border border-slate-200 ${className}`}>
        <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
            <div>
                <h3 className="m-0 text-sm font-bold text-slate-900">{title}</h3>
                {subtitle && <p className="m-0 mt-0.5 text-xs text-slate-500">{subtitle}</p>}
            </div>
            {actions}
        </header>
        <div className="px-5 pb-5">{children}</div>
    </section>
);

const AnalyticsDashboard = ({ apiUrl, nonce, isPro, templates, onUpgrade }) => {
    const [days, setDays] = useState(30);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [metricKey, setMetricKey] = useState('view');
    const [showTable, setShowTable] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const settingsRef = useRef(null);

    const headers = useMemo(() => (nonce ? { 'X-WP-Nonce': nonce } : {}), [nonce]);

    const load = useCallback(async (range) => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${apiUrl}banner-v2/analytics?days=${range}`, { headers, cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setData(await res.json());
        } catch (err) {
            setError('Could not load analytics. Please refresh the page and try again.');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, headers]);

    useEffect(() => {
        load(days);
    }, [days, load]);

    useEffect(() => {
        if (!showSettings) return undefined;
        const onClick = (e) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setShowSettings(false);
                setConfirmReset(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [showSettings]);

    // Optimistic: flip the switch right away, roll back if saving fails.
    const updateSettings = async (changes) => {
        const before = data?.settings;
        setData(prev => (prev ? { ...prev, settings: { ...prev.settings, ...changes } } : prev));
        try {
            const res = await fetch(`${apiUrl}banner-v2/analytics/settings`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(changes)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (err) {
            setData(prev => (prev ? { ...prev, settings: before } : prev));
            setError('Could not save the setting. Please try again.');
        }
    };

    const resetData = async () => {
        await fetch(`${apiUrl}banner-v2/analytics`, { method: 'DELETE', headers });
        setConfirmReset(false);
        setShowSettings(false);
        load(days);
    };

    const { formatNumber, formatPercent, formatMoney } = useMemo(() => makeFormatters(data?.currency), [data?.currency]);

    const templateInfo = useMemo(() => {
        const map = {};
        templates.forEach((t) => { map[t.id] = t; });
        return map;
    }, [templates]);

    const proUnlock = (feature) => () => onUpgrade(`${feature} is part of wiseCampaign Pro. Upgrade to see which banners turn into orders.`);

    /* ---------- Loading / error / empty ---------- */
    if (!data && isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                    <span className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                    Loading analytics…
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-md">
                    <p className="m-0 text-sm text-slate-600">{error}</p>
                    <button type="button" onClick={() => load(days)} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Try again</button>
                </div>
            </div>
        );
    }

    const { totals, previous, daily, devices, settings, hasWooCommerce } = data;
    const ctr = ratio(totals.click, totals.view);
    const prevCtr = ratio(previous.click, previous.view);
    const conversionRate = ratio(totals.conversion, totals.click);
    const hasAnyData = !!data.trackingSince;
    const lockOrders = !isPro;
    const needsWoo = !hasWooCommerce;

    const metrics = [
        { key: 'view', label: 'Impressions', value: r => r.view, axis: formatNumber, display: v => formatNumber(v), integer: true },
        { key: 'click', label: 'Clicks', value: r => r.click, axis: formatNumber, display: v => formatNumber(v), integer: true },
        { key: 'ctr', label: 'CTR', value: r => ratio(r.click, r.view) * 100, axis: v => `${Number(v.toFixed(1))}%`, display: v => `${v.toFixed(1)}%` },
        { key: 'revenue', label: 'Revenue', value: r => r.revenue, axis: v => formatMoney(v, true), display: v => formatMoney(v), pro: true }
    ];
    const metric = metrics.find(m => m.key === metricKey) || metrics[0];

    const tooltipRows = (row) => {
        const rows = [
            { key: 'view', label: 'Impressions', value: formatNumber(row.view) },
            { key: 'click', label: 'Clicks', value: formatNumber(row.click) },
            { key: 'ctr', label: 'CTR', value: row.view ? formatPercent(row.click / row.view) : '—' },
            { key: 'copy', label: 'Coupon copies', value: formatNumber(row.copy) }
        ];
        if (isPro && hasWooCommerce) {
            rows.push({ key: 'conversion', label: 'Orders', value: formatNumber(row.conversion) });
            rows.push({ key: 'revenue', label: 'Revenue', value: formatMoney(row.revenue) });
        }
        return rows;
    };

    const spark = (fn) => daily.map(fn);
    const deviceItems = DEVICES.map((d, i) => ({
        ...d,
        color: CHART_COLORS.series[i],
        views: devices[d.key]?.view || 0,
        clicks: devices[d.key]?.click || 0
    }));
    const maxTemplateViews = Math.max(1, ...data.templates.map(t => t.view));

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
            <div className={`max-w-[1280px] mx-auto px-6 sm:px-8 py-6 space-y-5 transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
                {/* Header + filters */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="m-0 text-xl font-black text-[#0F172A] tracking-tight">Banner Analytics</h2>
                        <p className="m-0 mt-1 text-xs text-slate-500">
                            How visitors interact with your wiseBanner{data.trackingSince ? ` · tracking since ${new Date(`${data.trackingSince}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-white border border-slate-200 p-1 rounded-lg" role="group" aria-label="Date range">
                            {RANGES.map((range) => (
                                <button
                                    key={range.days}
                                    type="button"
                                    onClick={() => setDays(range.days)}
                                    aria-pressed={days === range.days}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${days === range.days ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => load(days)}
                            aria-label="Refresh"
                            className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <div className="relative" ref={settingsRef}>
                            <button
                                type="button"
                                onClick={() => setShowSettings(v => !v)}
                                aria-label="Analytics settings"
                                aria-expanded={showSettings}
                                className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                <Settings2 size={15} />
                            </button>
                            {showSettings && (
                                <div className="absolute right-0 top-full mt-2 z-30 w-72 bg-white rounded-xl border border-slate-200 shadow-xl p-2">
                                    <button
                                        type="button"
                                        onClick={() => updateSettings({ excludeAdmins: !settings.excludeAdmins })}
                                        className="w-full flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-left"
                                    >
                                        <span>
                                            <span className="block text-xs font-bold text-slate-700">Count administrator visits</span>
                                            <span className="block text-[11px] text-slate-400 mt-0.5">Off keeps your own testing out of the numbers</span>
                                        </span>
                                        <span className={`w-9 h-5 rounded-full relative shrink-0 transition-all ${!settings.excludeAdmins ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                            <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${!settings.excludeAdmins ? 'right-1' : 'left-1'}`} />
                                        </span>
                                    </button>
                                    <div className="h-px bg-slate-100 my-1.5" />
                                    {!confirmReset ? (
                                        <button type="button" onClick={() => setConfirmReset(true)} className="w-full p-2.5 rounded-lg hover:bg-red-50 text-left text-xs font-bold text-red-600">
                                            Reset analytics data
                                        </button>
                                    ) : (
                                        <div className="p-2.5">
                                            <p className="m-0 text-[11px] text-slate-600">Delete all banner analytics? This can't be undone.</p>
                                            <div className="flex gap-2 mt-2.5">
                                                <button type="button" onClick={() => setConfirmReset(false)} className="flex-1 py-1.5 rounded-md bg-slate-100 text-xs font-bold text-slate-600">Cancel</button>
                                                <button type="button" onClick={resetData} className="flex-1 py-1.5 rounded-md bg-red-600 text-xs font-bold text-white">Delete data</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-700">{error}</div>}

                {settings.excludeAdmins && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <ShieldCheck size={14} className="text-slate-400" />
                        Visits from administrators aren't counted. To test tracking, open your store in a private window.
                    </div>
                )}

                {!hasAnyData ? (
                    <div className="bg-white rounded-xl border border-slate-200 px-6 py-16 text-center">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                            <BarChart3 size={24} />
                        </div>
                        <h3 className="m-0 mt-4 text-base font-bold text-slate-900">No banner activity yet</h3>
                        <p className="m-0 mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Analytics start as soon as visitors see your active banner. Impressions, clicks and coupon copies will appear here.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Primary KPIs */}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                            <StatTile label="Impressions" value={formatNumber(totals.view)} delta={getDelta(totals.view, previous.view)} days={days} spark={spark(r => r.view)} hint="Page views that showed the banner" />
                            <StatTile label="Clicks" value={formatNumber(totals.click)} delta={getDelta(totals.click, previous.click)} days={days} spark={spark(r => r.click)} hint="Clicks on the banner button" />
                            <StatTile label="Click-through rate" value={formatPercent(ctr)} delta={getDelta(ctr, prevCtr)} days={days} spark={spark(r => ratio(r.click, r.view))} hint="Clicks ÷ impressions" />
                            <StatTile
                                label="Revenue"
                                value={needsWoo ? '—' : formatMoney(totals.revenue)}
                                delta={needsWoo ? null : getDelta(totals.revenue, previous.revenue)}
                                days={days}
                                spark={needsWoo ? null : spark(r => r.revenue)}
                                hint={`Paid orders placed within 7 days of a banner click`}
                                locked={lockOrders}
                                onUnlock={proUnlock('Revenue tracking')}
                                lockMessage="Track revenue from banner clicks"
                            />
                        </div>

                        {/* Secondary KPIs */}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                            <StatTile size="sm" label="Unique visitors" value={formatNumber(totals.visitor)} delta={getDelta(totals.visitor, previous.visitor)} days={days} hint="Counted once per browser session" />
                            <StatTile size="sm" label="Coupon copies" value={formatNumber(totals.copy)} delta={getDelta(totals.copy, previous.copy)} days={days} hint="Times the coupon code was copied" />
                            <StatTile size="sm" label="Dismissals" value={formatNumber(totals.close)} delta={getDelta(totals.close, previous.close)} invert days={days} hint="Times visitors closed the banner" />
                            <StatTile
                                size="sm"
                                label="Orders"
                                value={needsWoo ? '—' : `${formatNumber(totals.conversion)} · ${formatPercent(conversionRate)}`}
                                delta={needsWoo ? null : getDelta(totals.conversion, previous.conversion)}
                                days={days}
                                hint="Attributed paid orders · conversion rate from clicks"
                                locked={lockOrders}
                                onUnlock={proUnlock('Order attribution')}
                                lockMessage="See orders from banner clicks"
                            />
                        </div>

                        {/* Trend */}
                        <Card
                            title={`${metric.label} over time`}
                            subtitle={`Daily, last ${days} days`}
                            actions={(
                                <div className="flex items-center gap-2">
                                    <div className="flex bg-slate-100 p-0.5 rounded-lg" role="group" aria-label="Chart metric">
                                        {metrics.map((m) => {
                                            const locked = m.pro && (lockOrders || needsWoo);
                                            return (
                                                <button
                                                    key={m.key}
                                                    type="button"
                                                    onClick={() => (locked ? (lockOrders ? proUnlock('Revenue tracking')() : null) : setMetricKey(m.key))}
                                                    disabled={locked && !lockOrders}
                                                    aria-pressed={metric.key === m.key}
                                                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${metric.key === m.key ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'} ${locked && !lockOrders ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                >
                                                    {m.label}
                                                    {locked && lockOrders && <Lock size={10} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowTable(v => !v)}
                                        aria-pressed={showTable}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${showTable ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <Table2 size={12} /> Table
                                    </button>
                                </div>
                            )}
                        >
                            {showTable ? (
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-white">
                                            <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                                                <th className="text-left font-bold py-2">Date</th>
                                                <th className="text-right font-bold py-2">Impressions</th>
                                                <th className="text-right font-bold py-2">Visitors</th>
                                                <th className="text-right font-bold py-2">Clicks</th>
                                                <th className="text-right font-bold py-2">CTR</th>
                                                <th className="text-right font-bold py-2">Copies</th>
                                                <th className="text-right font-bold py-2">Dismissals</th>
                                                {isPro && hasWooCommerce && <th className="text-right font-bold py-2">Orders</th>}
                                                {isPro && hasWooCommerce && <th className="text-right font-bold py-2">Revenue</th>}
                                            </tr>
                                        </thead>
                                        <tbody style={{ fontVariantNumeric: 'tabular-nums' }}>
                                            {[...daily].reverse().map((row) => (
                                                <tr key={row.date} className="border-t border-slate-100 text-slate-700">
                                                    <td className="py-2 text-left font-semibold">{new Date(`${row.date}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                    <td className="py-2 text-right">{formatNumber(row.view)}</td>
                                                    <td className="py-2 text-right">{formatNumber(row.visitor)}</td>
                                                    <td className="py-2 text-right">{formatNumber(row.click)}</td>
                                                    <td className="py-2 text-right">{row.view ? formatPercent(row.click / row.view) : '—'}</td>
                                                    <td className="py-2 text-right">{formatNumber(row.copy)}</td>
                                                    <td className="py-2 text-right">{formatNumber(row.close)}</td>
                                                    {isPro && hasWooCommerce && <td className="py-2 text-right">{formatNumber(row.conversion)}</td>}
                                                    {isPro && hasWooCommerce && <td className="py-2 text-right">{formatMoney(row.revenue)}</td>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <TrendChart
                                    rows={daily}
                                    metric={metric}
                                    formatAxis={metric.axis}
                                    tooltipRows={tooltipRows}
                                    ariaLabel={`${metric.label} per day for the last ${days} days. Use the arrow keys to read daily values, or switch to the table view.`}
                                />
                            )}
                        </Card>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                            {/* Template performance */}
                            <Card title="Template performance" subtitle="Compare the banner designs you have run" className="xl:col-span-2">
                                {data.templates.length === 0 ? (
                                    <p className="m-0 py-6 text-center text-xs text-slate-400">No template activity in this period.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                                                    <th className="text-left font-bold pb-2">Template</th>
                                                    <th className="text-left font-bold pb-2 pl-4">Impressions</th>
                                                    <th className="text-right font-bold pb-2">Clicks</th>
                                                    <th className="text-right font-bold pb-2">CTR</th>
                                                    <th className="text-right font-bold pb-2">Orders</th>
                                                    <th className="text-right font-bold pb-2">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                {data.templates.map((row) => {
                                                    const info = templateInfo[row.id];
                                                    const isLive = row.id === data.activeBannerId;
                                                    return (
                                                        <tr key={row.id} className="border-t border-slate-100">
                                                            <td className="py-3 pr-3">
                                                                <div className="flex items-center gap-2.5 min-w-[160px]">
                                                                    <span className="flex w-9 h-7 rounded-md overflow-hidden shrink-0 border border-slate-100">{info?.icon}</span>
                                                                    <span className="font-semibold text-slate-800">{info?.name || row.id}</span>
                                                                    {isLive && (
                                                                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 pl-4">
                                                                <div className="flex items-center gap-2.5">
                                                                    <span className="w-24 h-1.5 rounded-full bg-slate-100 shrink-0">
                                                                        <span className="block h-1.5 rounded-full" style={{ width: `${(row.view / maxTemplateViews) * 100}%`, backgroundColor: CHART_COLORS.series[0] }} />
                                                                    </span>
                                                                    <span className="font-semibold text-slate-900">{formatNumber(row.view)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 text-right text-slate-700">{formatNumber(row.click)}</td>
                                                            <td className="py-3 text-right text-slate-700">{row.view ? formatPercent(row.click / row.view) : '—'}</td>
                                                            <td className="py-3 text-right text-slate-700">{lockOrders || needsWoo ? <Lock size={11} className="inline text-slate-300" /> : formatNumber(row.conversion)}</td>
                                                            <td className="py-3 text-right text-slate-700">{lockOrders || needsWoo ? <Lock size={11} className="inline text-slate-300" /> : formatMoney(row.revenue)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>

                            {/* Devices */}
                            <Card title="Devices" subtitle="Share of impressions">
                                <DeviceSplit items={deviceItems} formatNumber={formatNumber} formatPercent={formatPercent} />
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                            {/* Funnel */}
                            <Card title="Conversion funnel" subtitle="From seeing the banner to placing an order" className="xl:col-span-2 relative">
                                {lockOrders && <ProLockOverlay onUnlock={proUnlock('The conversion funnel')} message="Unlock the full impressions → orders funnel" />}
                                {needsWoo && !lockOrders ? (
                                    <p className="m-0 py-6 text-center text-xs text-slate-400">Order tracking needs WooCommerce.</p>
                                ) : (
                                    <Funnel
                                        stages={[
                                            { label: 'Impressions', value: totals.view },
                                            { label: 'Clicks', value: totals.click },
                                            { label: 'Orders', value: lockOrders ? 0 : totals.conversion, hidden: lockOrders }
                                        ]}
                                        formatNumber={formatNumber}
                                        formatPercent={formatPercent}
                                    />
                                )}
                            </Card>

                            <Card title="How it's measured">
                                <ul className="m-0 p-0 list-none space-y-2.5 text-[11px] text-slate-500 leading-relaxed">
                                    <li className="flex gap-2"><Eye size={14} className="text-slate-400 shrink-0 mt-0.5" /> An impression is a page view that showed the banner. Bots are ignored.</li>
                                    <li className="flex gap-2"><MousePointerClick size={14} className="text-slate-400 shrink-0 mt-0.5" /> Clicks count the banner button. Orders count when a visitor buys within 7 days of clicking.</li>
                                    <li className="flex gap-2"><TrendingUp size={14} className="text-slate-400 shrink-0 mt-0.5" /> Only daily totals are stored on your own server. No personal data, no third-party services.</li>
                                </ul>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
