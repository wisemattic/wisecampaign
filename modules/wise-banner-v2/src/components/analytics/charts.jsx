import React, { useLayoutEffect, useRef, useState } from 'react';

/*
 * Small dependency-free SVG charts for the analytics dashboard.
 * Palette: categorical slots validated for CVD separation (blue, orange, aqua)
 * and a single-hue ordinal ramp for the funnel; chrome uses the editor's slate grays.
 */

export const CHART_COLORS = {
    series: ['#2a78d6', '#eb6834', '#1baf7a'],
    funnel: ['#86b6ef', '#3987e5', '#1c5cab'],
    grid: '#E2E8F0',
    baseline: '#CBD5E1',
    muted: '#94A3B8',
    secondary: '#475569',
    primary: '#0F172A',
    surface: '#FFFFFF'
};

const useWidth = (ref) => {
    const [width, setWidth] = useState(0);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const update = () => setWidth(el.clientWidth);
        update();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return width;
};

/** Rounds a rough step up to 1, 2 or 5 × 10^n so axis ticks land on clean numbers. */
const niceStep = (rough) => {
    if (rough <= 0) return 1;
    const power = Math.pow(10, Math.floor(Math.log10(rough)));
    const fraction = rough / power;
    const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
    return nice * power;
};

const formatDay = (date, options) => new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', ...options });

/**
 * Single-series trend chart (area + 2px line) with a crosshair tooltip that
 * lists every metric for the hovered day. Arrow keys move the crosshair.
 */
export const TrendChart = ({ rows, metric, color = CHART_COLORS.series[0], formatAxis, tooltipRows, height = 240, ariaLabel }) => {
    const wrapRef = useRef(null);
    const width = useWidth(wrapRef);
    const [activeIndex, setActiveIndex] = useState(null);

    const padding = { top: 12, right: 16, bottom: 30, left: 48 };
    const plotWidth = Math.max(0, width - padding.left - padding.right);
    const plotHeight = height - padding.top - padding.bottom;
    const values = rows.map(row => metric.value(row));
    const max = Math.max(0, ...values);
    // Counts get whole-number ticks; rates and money can step in fractions.
    const step = metric.integer ? Math.max(1, niceStep(max / 4)) : niceStep(max / 4 || 0.25);
    const yMax = Math.max(step * 4, step);
    const ticks = [0, 1, 2, 3, 4].map(i => (yMax / 4) * i);

    const x = (i) => padding.left + (rows.length <= 1 ? plotWidth / 2 : (i / (rows.length - 1)) * plotWidth);
    const y = (v) => padding.top + plotHeight - (v / yMax) * plotHeight;

    const linePath = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const areaPath = values.length
        ? `${linePath} L${x(values.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`
        : '';

    const labelEvery = Math.max(1, Math.ceil(rows.length / Math.max(2, Math.floor(plotWidth / 90))));
    const xLabelFormat = rows.length > 120 ? { month: 'short' } : { month: 'short', day: 'numeric' };

    const indexFromEvent = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const offset = event.clientX - rect.left - padding.left;
        const ratio = plotWidth ? offset / plotWidth : 0;
        return Math.min(rows.length - 1, Math.max(0, Math.round(ratio * (rows.length - 1))));
    };

    const handleKeyDown = (event) => {
        if (!rows.length) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            const delta = event.key === 'ArrowLeft' ? -1 : 1;
            setActiveIndex(current => Math.min(rows.length - 1, Math.max(0, (current ?? rows.length - 1) + delta)));
        } else if (event.key === 'Escape') {
            setActiveIndex(null);
        }
    };

    const active = activeIndex !== null ? rows[activeIndex] : null;
    const tooltipLeft = activeIndex !== null ? x(activeIndex) : 0;
    const tooltipOnLeft = tooltipLeft > width * 0.62;

    return (
        <div
            ref={wrapRef}
            className="relative w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            tabIndex={0}
            role="img"
            aria-label={ariaLabel}
            onKeyDown={handleKeyDown}
            onFocus={() => setActiveIndex(i => i ?? rows.length - 1)}
            onBlur={() => setActiveIndex(null)}
        >
            {width > 0 && (
                <svg width={width} height={height} className="block overflow-visible">
                    {ticks.map((tick) => (
                        <g key={tick}>
                            <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? CHART_COLORS.baseline : CHART_COLORS.grid} strokeWidth="1" />
                            <text x={padding.left - 10} y={y(tick)} dy="0.32em" textAnchor="end" fontSize="11" fill={CHART_COLORS.muted} style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatAxis(tick)}
                            </text>
                        </g>
                    ))}
                    {rows.map((row, i) => (i % labelEvery === 0 || i === rows.length - 1) && (rows.length - 1 - i >= labelEvery / 2 || i === rows.length - 1) ? (
                        <text key={row.date} x={x(i)} y={height - 8} textAnchor={i === 0 ? 'start' : i === rows.length - 1 ? 'end' : 'middle'} fontSize="11" fill={CHART_COLORS.muted}>
                            {formatDay(row.date, xLabelFormat)}
                        </text>
                    ) : null)}
                    <path d={areaPath} fill={color} fillOpacity="0.1" />
                    <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                    {active && (
                        <g pointerEvents="none">
                            <line x1={tooltipLeft} x2={tooltipLeft} y1={padding.top} y2={y(0)} stroke={CHART_COLORS.secondary} strokeOpacity="0.5" strokeWidth="1" />
                            <circle cx={tooltipLeft} cy={y(values[activeIndex])} r="4.5" fill={color} stroke={CHART_COLORS.surface} strokeWidth="2" />
                        </g>
                    )}
                    <rect
                        x={padding.left}
                        y={padding.top}
                        width={plotWidth}
                        height={plotHeight}
                        fill="transparent"
                        onPointerMove={(e) => setActiveIndex(indexFromEvent(e))}
                        onPointerLeave={() => setActiveIndex(null)}
                    />
                </svg>
            )}
            {active && (
                <div
                    className="absolute top-2 z-10 pointer-events-none bg-white rounded-lg border border-slate-200 shadow-xl px-3 py-2.5 min-w-[170px]"
                    style={tooltipOnLeft ? { right: width - tooltipLeft + 12 } : { left: tooltipLeft + 12 }}
                >
                    <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                        {formatDay(active.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="space-y-1">
                        {tooltipRows(active).map((item) => (
                            <div key={item.label} className="flex items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                    <span className="inline-block w-2.5 h-[2px] rounded-full" style={{ backgroundColor: item.key === metric.key ? color : CHART_COLORS.baseline }} />
                                    {item.label}
                                </span>
                                <span className="text-xs font-bold text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/** Tiny trend line for stat tiles: de-emphasis gray with the latest point in the accent. */
export const Sparkline = ({ values, color = CHART_COLORS.series[0], width = 96, height = 28 }) => {
    if (!values.length) return null;
    const max = Math.max(...values) || 1;
    const x = (i) => (values.length <= 1 ? width / 2 : (i / (values.length - 1)) * (width - 6) + 3);
    const y = (v) => height - 3 - (v / max) * (height - 6);
    const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const last = values.length - 1;
    return (
        <svg width={width} height={height} className="block" aria-hidden="true">
            <path d={path} fill="none" stroke={CHART_COLORS.baseline} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(last)} cy={y(values[last])} r="3" fill={color} stroke={CHART_COLORS.surface} strokeWidth="1.5" />
        </svg>
    );
};

/**
 * Part-to-whole bar of impressions by device (2px surface gaps between segments),
 * with a labelled row per device so identity never relies on color alone.
 */
export const DeviceSplit = ({ items, formatNumber, formatPercent }) => {
    const total = items.reduce((sum, item) => sum + item.views, 0);
    return (
        <div>
            <div className="flex h-3 w-full rounded overflow-hidden gap-[2px] bg-white" role="img" aria-label="Impressions by device">
                {total > 0 ? items.filter(item => item.views > 0).map((item) => (
                    <div
                        key={item.key}
                        title={`${item.label}: ${formatNumber(item.views)} impressions`}
                        style={{ width: `${(item.views / total) * 100}%`, backgroundColor: item.color }}
                    />
                )) : <div className="w-full bg-slate-100" />}
            </div>
            <table className="w-full mt-4 text-xs">
                <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="text-left font-bold pb-2">Device</th>
                        <th className="text-right font-bold pb-2">Share</th>
                        <th className="text-right font-bold pb-2">Impr.</th>
                        <th className="text-right font-bold pb-2">Clicks</th>
                        <th className="text-right font-bold pb-2">CTR</th>
                    </tr>
                </thead>
                <tbody style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {items.map((item) => (
                        <tr key={item.key} className="border-t border-slate-100">
                            <td className="py-2.5">
                                <span className="flex items-center gap-2 font-semibold text-slate-700">
                                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                                    {item.label}
                                </span>
                            </td>
                            <td className="py-2.5 text-right text-slate-500">{total ? formatPercent(item.views / total) : '—'}</td>
                            <td className="py-2.5 text-right font-semibold text-slate-900">{formatNumber(item.views)}</td>
                            <td className="py-2.5 text-right text-slate-700">{formatNumber(item.clicks)}</td>
                            <td className="py-2.5 text-right text-slate-700">{item.views ? formatPercent(item.clicks / item.views) : '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/** Impressions → clicks → orders, as bars scaled to the first stage. Hidden stages show no value. */
export const Funnel = ({ stages, formatNumber, formatPercent }) => {
    const top = Math.max(stages[0]?.value || 0, 1);
    return (
        <div className="space-y-3">
            {stages.map((stage, i) => {
                const share = stage.value / top;
                const rate = !stage.hidden && i > 0 && stages[i - 1].value ? stage.value / stages[i - 1].value : null;
                return (
                    <div key={stage.label}>
                        <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-xs font-semibold text-slate-600">{stage.label}</span>
                            <span className="text-xs text-slate-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                <span className="font-bold text-slate-900">{stage.hidden ? '•••' : formatNumber(stage.value)}</span>
                                {rate !== null && <span className="ml-1.5">· {formatPercent(rate)} of previous</span>}
                            </span>
                        </div>
                        <div className="h-3 w-full bg-slate-100" style={{ borderRadius: '0 4px 4px 0' }}>
                            <div
                                className="h-3"
                                style={{
                                    width: stage.hidden ? '25%' : `${Math.max(stage.value ? 1.5 : 0, share * 100)}%`,
                                    backgroundColor: stage.hidden ? CHART_COLORS.baseline : (CHART_COLORS.funnel[i] || CHART_COLORS.funnel[2]),
                                    borderRadius: '0 4px 4px 0'
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
