import React, { useId } from 'react';

/*
 * Inline SVG artwork for the Christmas banner pack. Scenes are drawn on the
 * shared 340x110 canvas and anchored bottom-left like the other packs.
 */

const FLAKES = [
    { x: 4, s: 4, d: 0, t: 7 }, { x: 11, s: 3, d: 2.4, t: 8.5 }, { x: 18, s: 5, d: 1.1, t: 6.5 },
    { x: 26, s: 3, d: 3.6, t: 9 }, { x: 33, s: 4, d: 0.6, t: 7.5 }, { x: 41, s: 3, d: 2.9, t: 8 },
    { x: 48, s: 5, d: 1.7, t: 6.8 }, { x: 56, s: 3, d: 4.1, t: 9.2 }, { x: 63, s: 4, d: 0.3, t: 7.2 },
    { x: 70, s: 3, d: 2.1, t: 8.4 }, { x: 77, s: 5, d: 3.3, t: 6.6 }, { x: 84, s: 3, d: 1.4, t: 8.8 },
    { x: 91, s: 4, d: 2.6, t: 7.4 }, { x: 97, s: 3, d: 0.9, t: 8.2 }, { x: 8, s: 2, d: 4.6, t: 9.6 },
    { x: 52, s: 2, d: 5.2, t: 9.8 }, { x: 73, s: 2, d: 4.4, t: 10 }, { x: 37, s: 2, d: 5.8, t: 9.4 }
];

/** Soft snow drifting down across the whole banner. */
export const Snowfall = ({ color = '#FFFFFF', count = FLAKES.length }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {FLAKES.slice(0, count).map((flake, i) => (
            <span
                key={i}
                className="absolute rounded-full wb-season-anim"
                style={{
                    left: `${flake.x}%`,
                    top: -8,
                    width: flake.s,
                    height: flake.s,
                    backgroundColor: color,
                    opacity: 0,
                    boxShadow: `0 0 ${flake.s}px ${color}`,
                    animation: `wb-xm-snow ${flake.t}s linear ${flake.d}s infinite`
                }}
            />
        ))}
    </div>
);

/** A string of twinkling lights hanging along the top edge. */
export const Garland = ({ colors, count = 16 }) => (
    <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: 16 }} aria-hidden="true">
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" width="100%" height="100%" className="absolute inset-0 block overflow-visible">
            <path
                d={Array.from({ length: count }, (_, i) => {
                    const step = 100 / count;
                    return `${i === 0 ? 'M0 1' : ''} Q ${(i + 0.5) * step} 9 ${(i + 1) * step} 1`;
                }).join(' ')}
                fill="none"
                stroke="rgba(0, 0, 0, 0.45)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
        {Array.from({ length: count }, (_, i) => {
            const color = colors[i % colors.length];
            return (
                <span
                    key={i}
                    className="absolute wb-season-anim"
                    style={{
                        left: `${((i + 0.5) * 100) / count}%`,
                        top: 7,
                        width: 5,
                        height: 8,
                        marginLeft: -2.5,
                        borderRadius: '50% 50% 45% 45%',
                        backgroundColor: color,
                        boxShadow: `0 0 6px 1px ${color}`,
                        animation: `wb-hw-twinkle 2.4s ease-in-out ${(i * 0.43) % 2.4}s infinite`
                    }}
                />
            );
        })}
    </div>
);

// Three-tier pine tree, its trunk sitting on `base`.
const pinePoints = (x, base, h) => {
    const w = h * 0.7;
    return [
        [x, base - h],
        [x - w * 0.28, base - h * 0.6], [x - w * 0.15, base - h * 0.6],
        [x - w * 0.4, base - h * 0.28], [x - w * 0.25, base - h * 0.28],
        [x - w * 0.5, base - h * 0.04], [x + w * 0.5, base - h * 0.04],
        [x + w * 0.25, base - h * 0.28], [x + w * 0.4, base - h * 0.28],
        [x + w * 0.15, base - h * 0.6], [x + w * 0.28, base - h * 0.6]
    ].map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
};

const Pine = ({ x, base, h, color, snow }) => (
    <g>
        <rect x={x - h * 0.04} y={base - h * 0.08} width={h * 0.08} height={h * 0.1} fill="#3B2314" />
        <polygon points={pinePoints(x, base, h)} fill={color} />
        {snow && <polygon points={`${x},${base - h} ${x - h * 0.12},${base - h * 0.78} ${x + h * 0.12},${base - h * 0.78}`} fill={snow} opacity="0.9" />}
    </g>
);

// Five-point star outline as SVG polygon points.
export const starPoints = (cx, cy, outer, inner, points = 5) => Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    return `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`;
}).join(' ');

const House = ({ x, base, w, h, scene, chimney = false }) => {
    const roofTop = base - h - w * 0.42;
    return (
        <g>
            {chimney && <rect x={x + w * 0.62} y={roofTop + w * 0.08} width={w * 0.12} height={w * 0.3} fill={scene.roof} />}
            <rect x={x} y={base - h} width={w} height={h} fill={scene.house} />
            <polygon points={`${x - 4},${base - h + 1} ${x + w / 2},${roofTop} ${x + w + 4},${base - h + 1}`} fill={scene.roof} />
            <path d={`M${x - 4} ${base - h + 1} L${x + w / 2} ${roofTop} L${x + w + 4} ${base - h + 1} L${x + w + 1} ${base - h + 4} L${x + w / 2} ${roofTop + 4} L${x - 1} ${base - h + 4} Z`} fill={scene.snow} />
            <g fill={scene.windows} style={{ filter: `drop-shadow(0 0 3px ${scene.windows})` }}>
                <rect x={x + w * 0.16} y={base - h * 0.72} width={w * 0.2} height={h * 0.26} rx="1" />
                <rect x={x + w * 0.64} y={base - h * 0.72} width={w * 0.2} height={h * 0.26} rx="1" />
            </g>
            <rect x={x + w * 0.42} y={base - h * 0.46} width={w * 0.16} height={h * 0.46} rx="1" fill={scene.door} />
        </g>
    );
};

export const VillageScene = ({ scene }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block">
        <path d="M0 82C60 70 120 74 186 82C240 88 280 94 316 110H0Z" fill={scene.snowShade} />
        <Pine x={14} base={86} h={44} color={scene.pine} snow={scene.snow} />
        <Pine x={226} base={88} h={52} color={scene.pine} snow={scene.snow} />
        <Pine x={252} base={90} h={36} color={scene.pine} snow={scene.snow} />
        <House x={34} base={100} w={40} h={26} scene={scene} />
        <House x={88} base={102} w={56} h={36} scene={scene} chimney />
        <House x={160} base={101} w={42} h={24} scene={scene} />
        <Pine x={146} base={104} h={30} color={scene.pine} snow={scene.snow} />
        <path d="M0 98C70 90 150 94 230 100C270 103 300 106 330 110H0Z" fill={scene.snow} />
    </svg>
);

export const TreeScene = ({ scene }) => {
    const id = useId().replace(/:/g, '');
    const ornaments = [[106, 46, 0], [130, 40, 1], [96, 66, 2], [120, 62, 0], [144, 70, 1], [84, 88, 1], [108, 84, 2], [134, 90, 0], [156, 92, 2]];
    return (
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
            <defs>
                <linearGradient id={`${id}-tree`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={scene.pineLight} />
                    <stop offset="1" stopColor={scene.pine} />
                </linearGradient>
            </defs>
            <ellipse cx="120" cy="108" rx="110" ry="4" fill={scene.star} opacity="0.18" />
            <rect x="113" y="96" width="14" height="12" fill="#5B3A1E" />
            <polygon points={pinePoints(120, 100, 86)} fill={`url(#${id}-tree)`} />
            <path d="M92 58C108 64 130 62 148 52M84 80C104 88 136 86 158 74" fill="none" stroke={scene.star} strokeWidth="1.6" strokeOpacity="0.7" strokeDasharray="2 3" />
            {ornaments.map(([x, y, c], i) => (
                <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3.6"
                    fill={scene.ornaments[c]}
                    className="wb-season-anim"
                    style={{ filter: `drop-shadow(0 0 2.5px ${scene.ornaments[c]})`, animation: `wb-hw-twinkle 2.6s ease-in-out ${i * 0.31}s infinite`, transformBox: 'fill-box', transformOrigin: 'center' }}
                />
            ))}
            <polygon
                points={starPoints(120, 12, 10, 4.2)}
                fill={scene.star}
                className="wb-season-anim"
                style={{ filter: `drop-shadow(0 0 6px ${scene.star})`, animation: 'wb-hw-moon 3s ease-in-out infinite' }}
            />
            {[[38, 90, 30, 20, 0], [64, 96, 24, 14, 1], [176, 92, 32, 18, 2], [206, 98, 22, 12, 0]].map(([x, y, w, h, c], i) => (
                <g key={i}>
                    <rect x={x} y={y} width={w} height={110 - y} rx="1.5" fill={scene.gifts[c]} />
                    <rect x={x + w / 2 - 2.5} y={y} width="5" height={110 - y} fill={scene.ribbon} />
                    <rect x={x} y={y + 3} width={w} height="3.5" fill={scene.ribbon} opacity="0.85" />
                    <path d={`M${x + w / 2} ${y}c-6-7-12-3-5 0M${x + w / 2} ${y}c6-7 12-3 5 0`} fill="none" stroke={scene.ribbon} strokeWidth="2.2" strokeLinecap="round" />
                </g>
            ))}
        </svg>
    );
};

// A galloping reindeer facing right, drawn around (0,0).
const Reindeer = ({ x, y, color }) => (
    <g transform={`translate(${x} ${y})`} fill={color} stroke={color} strokeLinecap="round">
        <ellipse cx="12" cy="10" rx="9" ry="4" stroke="none" />
        <path d="M19 9 24 3" strokeWidth="3" />
        <ellipse cx="25.5" cy="2.5" rx="3.4" ry="2" stroke="none" />
        <path d="M24 1 22-4M22-2l-3-1M25 0l2-5M26-3l2-1" strokeWidth="1" fill="none" />
        <path d="M6 13 2 19M9 13l-1 7M16 13l4 5M19 12l5 3" strokeWidth="1.6" fill="none" />
    </g>
);

export const SleighScene = ({ scene }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
        <circle cx="118" cy="40" r="32" fill={scene.moon} style={{ filter: `drop-shadow(0 0 14px ${scene.moonGlow})` }} />
        <g transform="translate(56 26) rotate(-9)">
            <g className="wb-season-anim" style={{ animation: 'wb-hw-bob 3s ease-in-out infinite' }}>
                <path d="M22 18H48M48 18 66 12M66 12 84 6M84 6 102 0" stroke={scene.silhouette} strokeWidth="0.8" />
                <Reindeer x={46} y={10} color={scene.silhouette} />
                <Reindeer x={66} y={4} color={scene.silhouette} />
                <Reindeer x={86} y={-2} color={scene.silhouette} />
                <g fill={scene.silhouette}>
                    <path d="M0 12h26l-3 10H5Z" />
                    <path d="M-2 26h30c3 0 4-3 3-5" fill="none" stroke={scene.silhouette} strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="13" cy="6" r="4" />
                    <path d="M10 3 14-4 17 3Z" />
                    <path d="M2 12c0-8 6-9 8-4Z" />
                </g>
            </g>
        </g>
        <g fill={scene.forest}>
            {[[8, 40], [28, 54], [50, 36], [72, 48], [96, 34], [182, 46], [204, 58], [228, 40], [250, 30]].map(([x, h], i) => (
                <polygon key={i} points={pinePoints(x, 106, h)} />
            ))}
        </g>
        <path d="M0 100C80 94 160 98 240 102C280 104 310 107 330 110H0Z" fill={scene.snow} />
    </svg>
);

/** Snowman with a top hat and a scarf. */
export const Snowman = ({ scene, width }) => {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 100 120" width={width} height={width * 1.2} aria-hidden="true" className="block overflow-visible">
            <defs>
                <radialGradient id={`${id}-snow`} cx="38%" cy="32%" r="70%">
                    <stop offset="0" stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#D6E4F5" />
                </radialGradient>
            </defs>
            <ellipse cx="50" cy="117" rx="34" ry="3.5" fill="#000000" opacity="0.2" />
            <circle cx="50" cy="92" r="25" fill={`url(#${id}-snow)`} />
            <circle cx="50" cy="56" r="18" fill={`url(#${id}-snow)`} />
            <circle cx="50" cy="28" r="14" fill={`url(#${id}-snow)`} />
            <path d="M33 54 14 42M67 54l19-14M18 45l-4-6M82 43l5-5" stroke="#6B4423" strokeWidth="2.4" strokeLinecap="round" />
            <rect x="34" y="16" width="32" height="4" rx="1" fill={scene.hat} />
            <rect x="39" y="-4" width="22" height="21" rx="2" fill={scene.hat} />
            <rect x="39" y="11" width="22" height="4" fill={scene.scarf} />
            <path d="M35 40c10 5 20 5 30 0v6c-10 5-20 5-30 0Z" fill={scene.scarf} />
            <path d="M58 45l4 18h-7l-3-16Z" fill={scene.scarf} />
            <circle cx="45" cy="25" r="1.8" fill="#1F2937" />
            <circle cx="55" cy="25" r="1.8" fill="#1F2937" />
            <path d="M50 30 62 33 50 34Z" fill="#F97316" />
            {[56, 66, 86, 98].map((y) => <circle key={y} cx="50" cy={y} r="2" fill="#1F2937" />)}
        </svg>
    );
};

/** A glass bauble hanging from its cap; the badge text sits on the ball. */
export const Bauble = ({ size, fill, trim }) => {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 100 118" width={size} height={size * 1.18} aria-hidden="true" className="block overflow-visible">
            <defs>
                <radialGradient id={`${id}-ball`} cx="35%" cy="38%" r="75%">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
                    <stop offset="0.3" stopColor={fill} />
                    <stop offset="1" stopColor={fill} />
                </radialGradient>
                <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#8A6A16" />
                    <stop offset="0.5" stopColor="#FFF3C4" />
                    <stop offset="1" stopColor="#8A6A16" />
                </linearGradient>
            </defs>
            <path d="M50 0c-5 0-5 8 0 8s5-8 0-8" fill="none" stroke={trim} strokeWidth="1.6" />
            <rect x="40" y="8" width="20" height="11" rx="2" fill={`url(#${id}-cap)`} />
            <circle cx="50" cy="68" r="47" fill="#000000" opacity="0.25" transform="translate(0 2)" />
            <circle cx="50" cy="68" r="47" fill={`url(#${id}-ball)`} />
            <path d="M6 54c28 8 60 8 88 0M6 82c28 8 60 8 88 0" fill="none" stroke={trim} strokeWidth="2" strokeOpacity="0.8" />
            <circle cx="50" cy="68" r="47" fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1" />
        </svg>
    );
};
