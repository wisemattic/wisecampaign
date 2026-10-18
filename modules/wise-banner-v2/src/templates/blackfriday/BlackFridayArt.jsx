import React, { useId } from 'react';

/*
 * Inline SVG artwork for the Black Friday banner pack.
 */

const SPARKLES = [
    { x: 24, y: 20, s: 9, d: 0 }, { x: 31, y: 74, s: 6, d: 1.3 }, { x: 37, y: 34, s: 7, d: 0.5 },
    { x: 44, y: 82, s: 5, d: 2.2 }, { x: 52, y: 16, s: 8, d: 1.7 }, { x: 58, y: 64, s: 5, d: 0.2 },
    { x: 63, y: 26, s: 6, d: 2.6 }, { x: 69, y: 84, s: 7, d: 1 }, { x: 74, y: 14, s: 5, d: 1.9 },
    { x: 79, y: 70, s: 8, d: 0.7 }, { x: 87, y: 24, s: 6, d: 2.4 }, { x: 93, y: 78, s: 5, d: 1.5 },
    { x: 13, y: 46, s: 6, d: 0.9 }, { x: 48, y: 48, s: 4, d: 2.9 }, { x: 84, y: 50, s: 4, d: 0.4 },
    { x: 97, y: 40, s: 5, d: 1.1 }
];

const SPARKLE_PATH = 'M10 0C11 6 14 9 20 10 14 11 11 14 10 20 9 14 6 11 0 10 6 9 9 6 10 0Z';

export const SparkleField = ({ color, count = SPARKLES.length }) => (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {SPARKLES.slice(0, count).map((sparkle, i) => (
            <svg
                key={i}
                viewBox="0 0 20 20"
                width={sparkle.s}
                height={sparkle.s}
                className="absolute wb-season-anim"
                style={{
                    left: `${sparkle.x}%`,
                    top: `${sparkle.y}%`,
                    filter: `drop-shadow(0 0 3px ${color})`,
                    animation: `wb-hw-twinkle 2.8s ease-in-out ${sparkle.d}s infinite`
                }}
            >
                <path d={SPARKLE_PATH} fill={color} />
            </svg>
        ))}
    </div>
);

/** Slowly rotating light rays, centred behind the left artwork. */
export const Sunburst = ({ color, centerX, size }) => (
    <div
        className="absolute pointer-events-none wb-season-anim"
        aria-hidden="true"
        style={{
            left: centerX - size / 2,
            top: '50%',
            width: size,
            height: size,
            marginTop: -size / 2,
            background: `repeating-conic-gradient(${color} 0deg 9deg, transparent 9deg 20deg)`,
            WebkitMaskImage: 'radial-gradient(circle, #000 18%, transparent 62%)',
            maskImage: 'radial-gradient(circle, #000 18%, transparent 62%)',
            animation: 'wb-bf-spin 40s linear infinite'
        }}
    />
);

/** Neon perspective grid "floor". */
export const NeonGrid = ({ lineX, lineY }) => (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden" style={{ height: '60%' }} aria-hidden="true">
        <div
            className="absolute wb-season-anim"
            style={{
                left: '-50%',
                right: '-50%',
                top: 0,
                bottom: '-40%',
                backgroundImage: `repeating-linear-gradient(90deg, ${lineX} 0 1px, transparent 1px 46px), repeating-linear-gradient(0deg, ${lineY} 0 1px, transparent 1px 18px)`,
                transform: 'perspective(160px) rotateX(58deg)',
                transformOrigin: '50% 0',
                WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 45%)',
                maskImage: 'linear-gradient(180deg, transparent, #000 45%)',
                animation: 'wb-bf-grid 2.4s linear infinite'
            }}
        />
    </div>
);

/** Diagonal light sweep across the banner. */
export const Sheen = ({ color }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
            className="absolute inset-y-0 w-1/4 wb-season-anim"
            style={{
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                animation: 'wb-bf-sheen 7s ease-in-out infinite'
            }}
        />
    </div>
);

export const BagsScene = ({ scene }) => {
    const id = useId().replace(/:/g, '');
    const gold = scene.accent;
    return (
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block">
            <defs>
                <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FEF3C7" />
                    <stop offset="0.45" stopColor={gold} />
                    <stop offset="1" stopColor="#B7791F" />
                </linearGradient>
                <linearGradient id={`${id}-red`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#EF4444" />
                    <stop offset="1" stopColor="#991B1B" />
                </linearGradient>
                <linearGradient id={`${id}-black`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2B2B2B" />
                    <stop offset="1" stopColor="#0A0A0A" />
                </linearGradient>
            </defs>
            <ellipse cx="130" cy="109" rx="130" ry="5" fill={gold} opacity="0.22" />

            <path d="M80 38c0-24 42-24 42 0" fill="none" stroke={gold} strokeWidth="3.5" />
            <rect x="64" y="36" width="74" height="74" rx="3" fill={`url(#${id}-black)`} stroke={gold} strokeWidth="1.5" />
            <rect x="64" y="36" width="74" height="9" fill="#000" opacity="0.35" />
            <text x="101" y="88" textAnchor="middle" fontFamily="'WiseCampaign Condensed', Impact, sans-serif" fontSize="22" letterSpacing="1" fill={gold}>SALE</text>

            <path d="M38 62c0-18 28-18 28 0" fill="none" stroke="#3A2A05" strokeWidth="3" />
            <rect x="22" y="60" width="58" height="50" rx="3" fill={`url(#${id}-gold)`} />
            <rect x="22" y="60" width="58" height="7" fill="#000" opacity="0.12" />
            <text x="51" y="96" textAnchor="middle" fontFamily="'WiseCampaign Condensed', Impact, sans-serif" fontSize="24" fill="#111111">%</text>

            <path d="M138 64c0-16 28-16 28 0" fill="none" stroke={gold} strokeWidth="3" />
            <rect x="124" y="62" width="56" height="48" rx="3" fill={`url(#${id}-red)`} />
            <rect x="124" y="62" width="56" height="7" fill="#000" opacity="0.15" />

            <rect x="190" y="78" width="44" height="32" rx="2" fill={`url(#${id}-black)`} stroke={gold} strokeWidth="1" />
            <rect x="188" y="71" width="48" height="9" rx="1.5" fill="#1C1C1C" stroke={gold} strokeWidth="1" />
            <rect x="209" y="71" width="6" height="39" fill={gold} />
            <path d="M212 71c-8-11-17-7-9 0M212 71c8-11 17-7 9 0" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" />

            <path d="M121 31 133 44" stroke={gold} strokeWidth="1" />
            <g transform="rotate(22 138 50)">
                <path d="M131 44h19v12h-19l-5-6Z" fill={gold} />
                <circle cx="130.5" cy="50" r="1.4" fill="#111111" />
            </g>
        </svg>
    );
};

export const MegaphoneScene = ({ scene }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block">
        <ellipse cx="120" cy="108" rx="110" ry="5" fill="#000" opacity="0.25" />
        <g transform="rotate(-10 120 64)">
            <path d="M86 84 94 106h10l-6-22Z" fill="#111111" />
            <rect x="56" y="50" width="26" height="30" rx="6" fill="#111111" />
            <path d="M78 50 170 22v84L78 80Z" fill="#FFFFFF" />
            <path d="M104 42v46" stroke={scene.accent} strokeWidth="9" />
            <path d="M132 34v62" stroke={scene.accent} strokeWidth="9" />
            <ellipse cx="170" cy="64" rx="11" ry="43" fill="#F5F5F5" stroke="#111111" strokeWidth="3" />
            <ellipse cx="170" cy="64" rx="6" ry="35" fill="#1F1F1F" />
        </g>
        <g stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round">
            {['M198 38q14 22 0 44', 'M214 28q22 32 0 64', 'M230 18q30 42 0 84'].map((d, i) => (
                <path key={d} d={d} className="wb-season-anim" style={{ animation: `wb-bf-wave 1.6s ease-in-out ${i * 0.25}s infinite` }} />
            ))}
        </g>
    </svg>
);

export const NeonScene = ({ scene }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
        <g stroke={scene.neonB} strokeWidth="1.6" fill="none" opacity="0.85" strokeLinecap="round">
            <path d="M14 88h40l12-12h26M20 30h32l12 12h24M206 20h30l12 12h26M200 94h42l12-12h34" />
        </g>
        <g fill={scene.neonB}>
            {[[92, 76], [88, 42], [274, 32], [288, 82], [14, 88], [20, 30], [206, 20], [200, 94]].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" />
            ))}
        </g>
        <path
            d="M152 6 110 60h30l-22 44 66-62h-32l22-36Z"
            fill={`${scene.neonA}22`}
            stroke={scene.neonA}
            strokeWidth="3"
            strokeLinejoin="round"
            className="wb-season-anim"
            style={{ filter: `drop-shadow(0 0 6px ${scene.neonA})`, animation: 'wb-bf-flicker 3.6s linear infinite' }}
        />
    </svg>
);

export const ShoppingBagIllustration = ({ scene, width }) => {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 100 120" width={width} height={width * 1.2} aria-hidden="true" className="block overflow-visible">
            <defs>
                <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={scene.bagLight} />
                    <stop offset="1" stopColor={scene.bagBody} />
                </linearGradient>
            </defs>
            <path d="M34 36c0-26 32-26 32 0" fill="none" stroke={scene.bagHandle} strokeWidth="5" strokeLinecap="round" />
            <path d="M82 32 92 38l4 74-8 4Z" fill={scene.bagShade} />
            <path d="M18 32h64l6 84H12Z" fill={`url(#${id}-body)`} />
            <path d="M18 32h64l.7 9H17.3Z" fill="#000" opacity="0.15" />
            <circle cx="50" cy="76" r="17" fill="#FFFFFF" />
            <text x="50" y="85" textAnchor="middle" fontFamily="'WiseCampaign Condensed', Impact, sans-serif" fontSize="24" fill={scene.bagBody}>%</text>
        </svg>
    );
};

export const NeonCart = ({ scene, width }) => (
    <svg
        viewBox="0 0 110 100"
        width={width}
        height={width * 0.9}
        aria-hidden="true"
        className="block overflow-visible"
        style={{ filter: `drop-shadow(0 0 6px ${scene.neonA})` }}
    >
        <path d="M6 14h16l12 52h54l12-36H28" fill="none" stroke={scene.neonA} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="42" cy="82" r="7" fill="none" stroke={scene.neonB} strokeWidth="4" />
        <circle cx="80" cy="82" r="7" fill="none" stroke={scene.neonB} strokeWidth="4" />
        <path d="m50 46 8 8 18-16" fill="none" stroke={scene.neonB} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
