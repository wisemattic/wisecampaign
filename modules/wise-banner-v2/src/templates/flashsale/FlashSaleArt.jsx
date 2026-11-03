import React, { useId } from 'react';

/*
 * Inline SVG artwork for the Flash Sale banner pack (evergreen, not tied to a date).
 */

const STREAKS = [
    { y: 14, w: 18, t: 1.6, d: 0 }, { y: 28, w: 10, t: 1.2, d: 0.7 }, { y: 44, w: 24, t: 1.9, d: 0.3 },
    { y: 58, w: 12, t: 1.3, d: 1.1 }, { y: 72, w: 20, t: 1.7, d: 0.5 }, { y: 86, w: 14, t: 1.4, d: 1.4 },
    { y: 36, w: 8, t: 1.1, d: 1.8 }, { y: 66, w: 16, t: 1.5, d: 2.1 }
];

/** Speed streaks racing across the banner. */
export const SpeedLines = ({ color, count = STREAKS.length }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {STREAKS.slice(0, count).map((streak, i) => (
            <span
                key={i}
                className="absolute left-0 wb-season-anim"
                style={{
                    top: `${streak.y}%`,
                    width: `${streak.w}%`,
                    height: 2,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, transparent, ${color})`,
                    opacity: 0,
                    animation: `wb-fs-speed ${streak.t}s linear ${streak.d}s infinite`
                }}
            />
        ))}
    </div>
);

const BOLT = 'M30 0 4 50h20L12 96 50 36H28L40 0Z';

export const LightningScene = ({ scene }) => {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
            <defs>
                <linearGradient id={`${id}-bolt`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FFFFFF" />
                    <stop offset="0.35" stopColor={scene.bolt} />
                    <stop offset="1" stopColor={scene.boltDeep} />
                </linearGradient>
                <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
                    <stop offset="0" stopColor={scene.bolt} stopOpacity="0.45" />
                    <stop offset="1" stopColor={scene.bolt} stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx="116" cy="56" r="56" fill={`url(#${id}-halo)`} />
            <g className="wb-season-anim" style={{ animation: 'wb-bf-flicker 2.6s linear infinite' }}>
                <path d={BOLT} transform="translate(92 8)" fill={`url(#${id}-bolt)`} style={{ filter: `drop-shadow(0 0 8px ${scene.bolt})` }} />
            </g>
            <path d={BOLT} transform="translate(48 50) scale(0.48)" fill={scene.bolt} opacity="0.75" />
            <path d={BOLT} transform="translate(176 44) scale(0.4) rotate(12)" fill={scene.bolt} opacity="0.6" />
            <g fill="none" stroke={scene.bolt} strokeWidth="1.6" strokeLinecap="round" opacity="0.8">
                <path d="M70 30l8 4-6 4 9 3" />
                <path d="M160 24l-7 5 6 3-8 5" />
                <path d="M150 86l9-2-4 6 9-1" />
            </g>
        </svg>
    );
};

export const RocketScene = ({ scene }) => {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
            <defs>
                <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#CBD5E1" />
                    <stop offset="0.45" stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#94A3B8" />
                </linearGradient>
            </defs>
            <g fill={scene.smoke}>
                {[[22, 98, 16], [46, 102, 13], [66, 96, 11], [12, 104, 12], [84, 88, 8], [100, 80, 6]].map(([x, y, r], i) => (
                    <circle key={i} cx={x} cy={y} r={r} className="wb-season-anim" style={{ animation: `wb-hw-moon ${2 + i * 0.3}s ease-in-out infinite` }} />
                ))}
            </g>
            <g transform="translate(150 50) rotate(45)">
                <g className="wb-season-anim" style={{ animation: 'wb-fs-shake 0.35s linear infinite' }}>
                    <g className="wb-season-anim" style={{ transformOrigin: '0px 34px', animation: 'wb-fs-flame 0.5s ease-in-out infinite' }}>
                        <path d="M-9 30C-9 46 0 58 0 58S9 46 9 30Z" fill={scene.flameOuter} />
                        <path d="M-5 30C-5 40 0 48 0 48S5 40 5 30Z" fill={scene.flameInner} />
                    </g>
                    <path d="M-12 12-24 30h12ZM12 12l12 18H12Z" fill={scene.fin} />
                    <path d="M0-40C14-28 14 0 12 30H-12C-14 0-14-28 0-40Z" fill={`url(#${id}-body)`} />
                    <path d="M0-40C6-35 9-28 10-22H-10C-9-28-6-35 0-40Z" fill={scene.fin} />
                    <circle cx="0" cy="-6" r="6.5" fill={scene.window} stroke={scene.fin} strokeWidth="2.5" />
                    <path d="M-4 30H4V36H-4Z" fill={scene.fin} />
                </g>
            </g>
        </svg>
    );
};

export const StopwatchScene = ({ scene }) => {
    const cx = 120;
    const cy = 62;
    return (
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
            <g fill="none" stroke={scene.accent} strokeWidth="3" strokeLinecap="round" opacity="0.6">
                <path d="M44 48h26M34 62h34M48 76h22" />
            </g>
            <rect x={cx - 7} y={cy - 56} width="14" height="9" rx="2" fill={scene.ring} />
            <rect x={cx - 3} y={cy - 49} width="6" height="6" fill={scene.ring} />
            <path d={`M${cx + 30} ${cy - 38}l9-9`} stroke={scene.ring} strokeWidth="6" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="45" fill={scene.ring} />
            <circle cx={cx} cy={cy} r="38" fill={scene.face} />
            {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                const long = i % 3 === 0;
                return (
                    <line
                        key={i}
                        x1={cx + Math.sin(a) * (long ? 28 : 31)}
                        y1={cy - Math.cos(a) * (long ? 28 : 31)}
                        x2={cx + Math.sin(a) * 35}
                        y2={cy - Math.cos(a) * 35}
                        stroke={scene.ticks}
                        strokeWidth={long ? 3 : 1.5}
                        strokeLinecap="round"
                    />
                );
            })}
            <path d={`M${cx} ${cy} L${cx} ${cy - 30} A30 30 0 0 1 ${cx + 26} ${cy - 15} Z`} fill={scene.accent} opacity="0.35" />
            <g className="wb-season-anim" style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'wb-bf-spin 4s steps(60) infinite' }}>
                <line x1={cx} y1={cy + 6} x2={cx} y2={cy - 32} stroke={scene.accent} strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx={cx} cy={cy} r="4" fill={scene.accent} />
        </svg>
    );
};

/** A flickering flame: a "hot deal" mark. */
export const Flame = ({ scene, width }) => (
    <svg viewBox="0 0 100 120" width={width} height={width * 1.2} aria-hidden="true" className="block overflow-visible">
        <g className="wb-season-anim" style={{ transformOrigin: '50px 116px', animation: 'wb-fs-flame 0.9s ease-in-out infinite' }}>
            <path d="M50 2C58 26 86 40 86 76c0 22-16 40-36 40S14 98 14 76c0-18 10-26 16-38 4 10 8 14 14 16C44 34 40 18 50 2Z" fill={scene.flameOuter} />
            <path d="M50 44c6 16 22 24 22 44 0 14-10 24-22 24S28 102 28 88c0-10 6-16 10-24 2 6 6 8 10 9 0-10-2-20 2-29Z" fill={scene.flameInner} />
            <path d="M50 76c3 8 10 12 10 20 0 7-4 12-10 12s-10-5-10-12c0-6 5-10 10-20Z" fill="#FFFBEB" />
        </g>
    </svg>
);

const BURST_POINTS = Array.from({ length: 32 }, (_, i) => {
    const a = (i * Math.PI * 2) / 32;
    const r = i % 2 === 0 ? 49 : 40;
    return `${(50 + Math.sin(a) * r).toFixed(2)},${(50 - Math.cos(a) * r).toFixed(2)}`;
}).join(' ');

/** Starburst sticker for the offer. */
export const Starburst = ({ size, fill }) => (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="block overflow-visible">
        <polygon points={BURST_POINTS} fill="#000000" opacity="0.28" transform="translate(1.5 2.5)" />
        <polygon points={BURST_POINTS} fill={fill} stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
);
