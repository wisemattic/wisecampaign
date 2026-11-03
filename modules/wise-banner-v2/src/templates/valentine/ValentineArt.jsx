import React, { useId } from 'react';

/*
 * Inline SVG artwork for the Valentine's Day banner pack.
 */

// Heart drawn in a 24x24 box.
export const HEART_PATH = 'M12 21.3s-7.6-4.7-9.7-9.3C.8 8.6 2.6 4.6 6.4 4.2c2.3-.2 4.1 1 5.6 3 1.5-2 3.3-3.2 5.6-3 3.8.4 5.6 4.4 4.1 7.8-2.1 4.6-9.7 9.3-9.7 9.3Z';

const HEARTS = [
    { x: 6, s: 9, d: 0, t: 6 }, { x: 15, s: 6, d: 2.2, t: 5.2 }, { x: 26, s: 11, d: 1.1, t: 6.8 },
    { x: 37, s: 7, d: 3.4, t: 5.6 }, { x: 48, s: 9, d: 0.6, t: 6.2 }, { x: 59, s: 6, d: 2.8, t: 5 },
    { x: 69, s: 10, d: 1.7, t: 6.6 }, { x: 79, s: 7, d: 3.9, t: 5.4 }, { x: 88, s: 9, d: 0.9, t: 6 },
    { x: 96, s: 6, d: 2.5, t: 5.8 }
];

/** Small hearts floating up from the bottom edge. */
export const FloatingHearts = ({ color, count = HEARTS.length }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {HEARTS.slice(0, count).map((heart, i) => (
            <svg
                key={i}
                viewBox="0 0 24 24"
                width={heart.s}
                height={heart.s}
                className="absolute wb-season-anim"
                style={{ left: `${heart.x}%`, bottom: -12, opacity: 0, animation: `wb-ny-rise ${heart.t}s ease-in ${heart.d}s infinite` }}
            >
                <path d={HEART_PATH} fill={color} />
            </svg>
        ))}
    </div>
);

const HeartShape = ({ x, y, size, fill, shine = true }) => (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}>
        <path d={HEART_PATH} fill={fill} />
        {shine && <path d="M6.5 7.2c-1.6.3-2.4 1.8-2 3.3" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />}
    </g>
);

export const BalloonsScene = ({ scene }) => {
    const balloons = [[70, 30, 40, 0, 0], [112, 22, 46, 1, 0.8], [150, 38, 36, 2, 1.6], [42, 52, 30, 1, 2.2]];
    return (
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
            {balloons.map(([x, y, size, color, delay], i) => (
                <g key={i} className="wb-season-anim" style={{ animation: `wb-hw-bob ${3 + i * 0.4}s ease-in-out ${delay}s infinite` }}>
                    <path d={`M${x} ${y + size * 0.42} C${x - 8} ${y + size * 0.9}, ${x + 10} ${y + size * 1.2}, 100 112`} fill="none" stroke={scene.string} strokeWidth="1" />
                    <HeartShape x={x} y={y} size={size} fill={scene.balloons[color]} />
                    <path d={`M${x - 2} ${y + size * 0.4}l2 3 2-3Z`} fill={scene.balloons[color]} />
                </g>
            ))}
            <HeartShape x={210} y={88} size={14} fill={scene.balloons[1]} shine={false} />
            <HeartShape x={232} y={70} size={9} fill={scene.balloons[0]} shine={false} />
        </svg>
    );
};

export const LetterScene = ({ scene }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
        <ellipse cx="116" cy="108" rx="78" ry="4" fill="#000000" opacity="0.18" />
        <polygon points="56,52 116,20 176,52" fill={scene.paperShade} />
        <rect x="70" y="26" width="92" height="58" rx="3" fill={scene.card} transform="rotate(-3 116 55)" />
        <g transform="rotate(-3 116 55)">
            <rect x="80" y="38" width="48" height="3" rx="1.5" fill={scene.ink} opacity="0.5" />
            <rect x="80" y="46" width="64" height="3" rx="1.5" fill={scene.ink} opacity="0.35" />
            <HeartShape x={146} y={40} size={12} fill={scene.seal} shine={false} />
        </g>
        <rect x="56" y="52" width="120" height="56" rx="3" fill={scene.paper} />
        <path d="M56 52 116 86 176 52V108H56Z" fill={scene.paper} />
        <path d="M56 108 108 76M176 108 124 76" stroke={scene.paperShade} strokeWidth="1.5" />
        <path d="M56 52 116 86 176 52" fill="none" stroke={scene.paperShade} strokeWidth="1.5" />
        <circle cx="116" cy="85" r="10" fill={scene.seal} style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />
        <HeartShape x={116} y={85} size={11} fill="#FFFFFF" shine={false} />
        {[[94, 18, 9, 0], [140, 10, 7, 0.9], [118, 4, 11, 1.8]].map(([x, y, size, delay], i) => (
            <g key={i} className="wb-season-anim" style={{ animation: `wb-hw-bubble 2.8s ease-out ${delay}s infinite`, transformBox: 'fill-box', transformOrigin: 'center' }}>
                <HeartShape x={x} y={y} size={size} fill={scene.seal} shine={false} />
            </g>
        ))}
    </svg>
);

const Rose = ({ x, y, r, scene }) => (
    <g>
        <circle cx={x} cy={y} r={r} fill={scene.rose} />
        <path d={`M${x - r * 0.9} ${y + r * 0.1}c${r * 0.3} ${r * 0.9} ${r * 1.5} ${r * 0.9} ${r * 1.8} 0`} fill="none" stroke={scene.roseDeep} strokeWidth="1.4" />
        <circle cx={x + r * 0.08} cy={y - r * 0.1} r={r * 0.62} fill={scene.roseDeep} />
        <path d={`M${x - r * 0.4} ${y - r * 0.1}c0-${r * 0.5} ${r * 0.8}-${r * 0.5} ${r * 0.8} 0s-${r * 0.6} ${r * 0.4}-${r * 0.3} ${r * 0.1}`} fill="none" stroke={scene.rose} strokeWidth="1.3" strokeLinecap="round" />
        <circle cx={x + r * 0.1} cy={y - r * 0.12} r={r * 0.18} fill={scene.rose} />
    </g>
);

export const RosesScene = ({ scene }) => {
    const roses = [[40, 62, 11], [70, 48, 13], [100, 64, 11], [128, 52, 12], [156, 70, 10], [86, 80, 9]];
    return (
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block">
            <g stroke={scene.stem} strokeWidth="2.2" fill="none" strokeLinecap="round">
                {roses.map(([x, y], i) => <path key={i} d={`M${x} ${y + 8}C${x + 4} ${y + 30} ${x - 6} ${y + 40} ${x + (i % 2 ? 6 : -4)} 112`} />)}
            </g>
            <g fill={scene.leaf}>
                {[[48, 88, -30], [74, 76, 25], [112, 90, -20], [140, 84, 30], [60, 100, 20], [160, 96, -25]].map(([x, y, a], i) => (
                    <ellipse key={i} cx={x} cy={y} rx="9" ry="3.6" transform={`rotate(${a} ${x} ${y})`} />
                ))}
            </g>
            {roses.map(([x, y, r], i) => <Rose key={i} x={x} y={y} r={r} scene={scene} />)}
            {[[196, 96, 20], [214, 104, -35], [232, 92, 50]].map(([x, y, a], i) => (
                <ellipse key={i} cx={x} cy={y} rx="5" ry="3" fill={scene.rose} opacity="0.8" transform={`rotate(${a} ${x} ${y})`} />
            ))}
        </svg>
    );
};

/** A heart pierced by Cupid's arrow. */
export const ArrowHeart = ({ scene, width }) => (
    <svg viewBox="0 0 100 120" width={width} height={width * 1.2} aria-hidden="true" className="block overflow-visible">
        <path d="M8 96 92 28" stroke={scene.arrow} strokeWidth="3" strokeLinecap="round" />
        <g transform="translate(14 22) scale(3)">
            <path d={HEART_PATH} fill={scene.accent} />
            <path d="M6.5 7.2c-1.6.3-2.4 1.8-2 3.3" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="0.8" strokeLinecap="round" />
        </g>
        <path d="M70 46 92 28" stroke={scene.arrow} strokeWidth="3" strokeLinecap="round" />
        <path d="M92 28 80 30 90 40Z" fill={scene.arrow} />
        <path d="M8 96l-2-12 8 6ZM8 96l12 2-6-8Z" fill={scene.feather} />
    </svg>
);

/** Heart-shaped badge with a soft highlight. */
export const HeartBadge = ({ size, fill }) => {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="block overflow-visible">
            <defs>
                <radialGradient id={`${id}-heart`} cx="35%" cy="30%" r="80%">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
                    <stop offset="0.35" stopColor={fill} />
                    <stop offset="1" stopColor={fill} />
                </radialGradient>
            </defs>
            <path d={HEART_PATH} fill="#000000" opacity="0.22" transform="translate(0 0.6)" />
            <path d={HEART_PATH} fill={`url(#${id}-heart)`} stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="0.5" />
        </svg>
    );
};
