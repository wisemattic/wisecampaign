import React, { useEffect, useRef, useState } from 'react';
import { formatDate } from '../../shared/format.js';

// Clean axis steps: 1, 2, 2.5 or 5 times a power of ten
const niceTicks = (max, count = 4) => {
    if (max <= 0) return [0];
    const raw = max / count;
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const residual = raw / magnitude;
    const step = (residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 2.5 ? 2.5 : residual <= 5 ? 5 : 10) * magnitude;
    const ticks = [];
    for (let v = 0; v <= max + step * 0.999; v += step) ticks.push(+v.toFixed(10));
    return ticks;
};

const PAD = { top: 14, right: 18, bottom: 30, left: 56 };

/**
 * Line chart over days with a crosshair tooltip. Series share one axis (same unit).
 * The first series is the one the chart is about: it gets the area wash and the end dot.
 *
 * series: [{ key, label, color, values: number[] }]
 */
export default function TrendChart({ dates, series, formatValue, formatAxis, height = 260, label }) {
    const wrapRef = useRef(null);
    const [width, setWidth] = useState(720);
    const [active, setActive] = useState(null);

    useEffect(() => {
        if (!wrapRef.current || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
        observer.observe(wrapRef.current);
        return () => observer.disconnect();
    }, []);

    const n = dates.length;
    const plotW = width - PAD.left - PAD.right;
    const plotH = height - PAD.top - PAD.bottom;
    const ticks = niceTicks(Math.max(0, ...series.flatMap((s) => s.values)));
    const top = ticks[ticks.length - 1] || 1;
    const x = (i) => PAD.left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    const y = (v) => PAD.top + plotH - (v / top) * plotH;
    const baseline = PAD.top + plotH;

    const linePath = (values) => values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    const main = series[0];

    // About six date labels, always including the last day
    const every = Math.max(1, Math.ceil(n / 6));
    const labelled = dates.map((d, i) => i).filter((i) => (n - 1 - i) % every === 0);

    const pick = (clientX) => {
        const rect = wrapRef.current.getBoundingClientRect();
        const ratio = (clientX - rect.left - PAD.left) / plotW;
        setActive(Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1)))));
    };

    const onKeyDown = (e) => {
        const moves = { ArrowLeft: -1, ArrowRight: 1 };
        if (moves[e.key] !== undefined) {
            e.preventDefault();
            setActive((i) => Math.max(0, Math.min(n - 1, (i ?? n - 1) + moves[e.key])));
        } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            setActive(e.key === 'Home' ? 0 : n - 1);
        }
    };

    const tipLeft = active === null ? 0 : x(active);
    const flip = tipLeft > width - 220;

    return (
        <div ref={wrapRef} className="relative select-none" style={{ height }}>
            <svg
                width={width}
                height={height}
                role="img"
                aria-label={label}
                tabIndex={0}
                className="block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
                onPointerMove={(e) => pick(e.clientX)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive((i) => i ?? n - 1)}
                onBlur={() => setActive(null)}
                onKeyDown={onKeyDown}
            >
                {/* Grid: solid hairlines, recessive */}
                {ticks.map((t) => (
                    <g key={t}>
                        <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? '#cbd5e1' : '#eef2f6'} strokeWidth="1" />
                        <text x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="#94a3b8" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {formatAxis(t)}
                        </text>
                    </g>
                ))}
                {labelled.map((i) => (
                    <text key={dates[i]} x={x(i)} y={height - 8} textAnchor={i === n - 1 && n > 1 ? 'end' : i === 0 && n > 1 ? 'start' : 'middle'} fontSize="11" fill="#94a3b8">
                        {formatDate(dates[i])}
                    </text>
                ))}

                {/* The series the chart is about gets a 10% wash under its line */}
                {main && n > 1 && (
                    <path d={`${linePath(main.values)}L${x(n - 1).toFixed(1)},${baseline}L${x(0).toFixed(1)},${baseline}Z`} fill={main.color} opacity="0.1" />
                )}
                {[...series].reverse().map((s) => (
                    <path key={s.key} d={linePath(s.values)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                ))}

                {active !== null && (
                    <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={baseline} stroke="#94a3b8" strokeWidth="1" />
                )}
                {(active === null ? (main ? [{ s: main, i: n - 1 }] : []) : series.map((s) => ({ s, i: active }))).map(({ s, i }) => (
                    <circle key={s.key} cx={x(i)} cy={y(s.values[i] || 0)} r="4" fill={s.color} stroke="#ffffff" strokeWidth="2" />
                ))}
            </svg>

            {active !== null && (
                <div
                    className="pointer-events-none absolute top-1 z-10 min-w-[180px] rounded-xl border border-solid border-slate-200 bg-white px-3 py-2.5 shadow-lg"
                    style={flip ? { right: width - tipLeft + 12 } : { left: tipLeft + 12 }}
                >
                    <div className="text-[11px] font-semibold text-slate-500 mb-1.5">{formatDate(dates[active], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    {series.map((s) => (
                        <div key={s.key} className="flex items-center gap-2 py-0.5">
                            <span className="inline-block h-0.5 w-3 rounded-full shrink-0" style={{ background: s.color }} />
                            <span className="text-sm font-bold text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatValue(s.values[active] || 0)}</span>
                            <span className="text-[11px] text-slate-500">{s.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
