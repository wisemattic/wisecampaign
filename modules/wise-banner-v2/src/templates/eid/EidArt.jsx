import React, { useId } from 'react';

/*
 * Inline SVG artwork for the Eid banner pack.
 */

/** A glowing lantern (fanoos), drawn in a 30x56 box hanging from its top ring. */
export const Lantern = ({ width, body, light, frame, x, y }) => {
    const id = useId().replace(/:/g, '');
    return (
        <svg x={x} y={y} viewBox="0 0 30 56" width={width} height={(width * 56) / 30} aria-hidden="true" className="block overflow-visible">
            <defs>
                <radialGradient id={`${id}-glow`} cx="50%" cy="55%" r="60%">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="0.35" stopColor={light} />
                    <stop offset="1" stopColor={light} stopOpacity="0.55" />
                </radialGradient>
            </defs>
            <circle cx="15" cy="2.5" r="2" fill="none" stroke={frame} strokeWidth="1.2" />
            <path d="M8 13Q15 2 22 13Z" fill={body} />
            <rect x="7" y="12.5" width="16" height="2.5" rx="1" fill={frame} />
            <path d="M7.5 15h15l3 13-3 13h-15l-3-13Z" fill={`url(#${id}-glow)`} className="wb-season-anim" style={{ animation: 'wb-eid-glow 3s ease-in-out infinite' }} />
            <path d="M7.5 15h15l3 13-3 13h-15l-3-13Z" fill="none" stroke={frame} strokeWidth="1.3" />
            <path d="M15 15v26M4.5 28h21M10 15l-2.5 13 2.5 13M20 15l2.5 13-2.5 13" fill="none" stroke={frame} strokeWidth="0.8" strokeOpacity="0.85" />
            <rect x="7" y="41" width="16" height="2.5" rx="1" fill={frame} />
            <path d="M10 43.5h10l-3 6h-4Z" fill={body} />
            <path d="M15 49.5v5" stroke={frame} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
};

// Placed in the right part of the scene area, which every Eid scene leaves empty.
const HANGING = [{ x: 76, len: 10, w: 12, d: 0 }, { x: 87, len: 22, w: 10, d: 0.8 }, { x: 96, len: 4, w: 11, d: 1.5 }];

/** Lanterns hanging from the top edge, swaying slowly. */
export const HangingLanterns = ({ scene, count = HANGING.length, scale = 1 }) => (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {HANGING.slice(0, count).map((lantern, i) => (
            <div
                key={i}
                className="absolute top-0 flex flex-col items-center wb-season-anim"
                style={{ left: `${lantern.x}%`, transformOrigin: '50% 0%', animation: `wb-hw-swing ${3.4 + i * 0.5}s ease-in-out ${lantern.d}s infinite` }}
            >
                <span style={{ width: 1, height: lantern.len * scale, backgroundColor: scene.frame, opacity: 0.7 }} />
                <Lantern width={lantern.w * scale} body={scene.lanternBody} light={scene.lanternLight} frame={scene.frame} />
            </div>
        ))}
    </div>
);

// Eight-point star tile, repeated as a faint geometric pattern.
const patternUrl = (color) => `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><g fill="none" stroke="${color}" stroke-width="1"><rect x="10" y="10" width="16" height="16"/><rect x="10" y="10" width="16" height="16" transform="rotate(45 18 18)"/></g></svg>`
)}")`;

export const GeometricPattern = ({ color, opacity = 0.12 }) => (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ backgroundImage: patternUrl(color), backgroundSize: '36px 36px', opacity }} />
);

/** Crescent moon with a star, cut with an SVG mask so any background shows through. */
const Crescent = ({ cx, cy, r, fill, glow }) => {
    const id = useId().replace(/:/g, '');
    return (
        <g style={{ filter: `drop-shadow(0 0 ${r * 0.4}px ${glow})` }}>
            <mask id={`${id}-cut`}>
                <rect x={cx - r * 2} y={cy - r * 2} width={r * 4} height={r * 4} fill="#FFFFFF" />
                <circle cx={cx + r * 0.42} cy={cy - r * 0.22} r={r * 0.86} fill="#000000" />
            </mask>
            <circle cx={cx} cy={cy} r={r} fill={fill} mask={`url(#${id}-cut)`} />
        </g>
    );
};

const star = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 === 0 ? r : r * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`;
}).join(' ');

export const MosqueScene = ({ scene }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
        <Crescent cx={46} cy={28} r={15} fill={scene.moon} glow={scene.moonGlow} />
        <polygon points={star(64, 22, 4.5)} fill={scene.moon} />
        <g fill={scene.silhouette}>
            <rect x="60" y="74" width="150" height="36" />
            <path d="M92 76c0-26 18-40 43-48 25 8 43 22 43 48Z" />
            <rect x="133" y="16" width="4" height="14" />
            <path d="M70 80c0-12 8-19 18-22 10 3 18 10 18 22Z" />
            <path d="M164 80c0-12 8-19 18-22 10 3 18 10 18 22Z" />
            <rect x="34" y="34" width="12" height="76" />
            <path d="M32 36h16l-8-16Z" />
            <rect x="30" y="52" width="20" height="4" />
            <rect x="224" y="40" width="11" height="70" />
            <path d="M222 42h15l-7.5-15Z" />
            <rect x="220" y="58" width="19" height="4" />
            <path d="M0 96H250C290 98 315 104 330 110H0Z" />
        </g>
        <Crescent cx={135} cy={13} r={3.6} fill={scene.windows} glow={scene.windows} />
        <g fill={scene.windows} style={{ filter: `drop-shadow(0 0 3px ${scene.windows})` }}>
            {[82, 102, 122, 142, 162, 182].map((x) => <path key={x} d={`M${x} 104v-12a5 5 0 0 1 10 0v12Z`} />)}
            <path d="M37 72v-6a3 3 0 0 1 6 0v6Z" />
            <path d="M227 74v-6a2.6 2.6 0 0 1 5.2 0v6Z" />
        </g>
    </svg>
);

export const LanternScene = ({ scene }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
        <Crescent cx={196} cy={26} r={12} fill={scene.moon} glow={scene.moonGlow} />
        {[[40, 34, 0], [84, 46, 1], [134, 30, 2]].map(([x, w, i]) => (
            <g key={i}>
                <ellipse cx={x + w / 2} cy="108" rx={w * 0.9} ry="3.5" fill={scene.lanternLight} opacity="0.3" />
                <Lantern x={x} y={108 - (w * 56) / 30} width={w} body={scene.lanternBody} light={scene.lanternLight} frame={scene.frame} />
            </g>
        ))}
        <path d="M0 106c60-6 140-6 220 0c40 2 80 4 110 4H0Z" fill={scene.silhouette} />
    </svg>
);

export const CrescentScene = ({ scene }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
        <Crescent cx={104} cy={46} r={36} fill={scene.moon} glow={scene.moonGlow} />
        <polygon points={star(150, 30, 9)} fill={scene.moon} className="wb-season-anim" style={{ filter: `drop-shadow(0 0 5px ${scene.moonGlow})`, animation: 'wb-hw-moon 3s ease-in-out infinite' }} />
        <path d="M0 96C50 80 110 82 160 94C220 104 280 100 330 110H0Z" fill={scene.dune} />
        <path d="M0 104C80 94 170 96 250 104C290 107 315 108 335 110H0Z" fill={scene.silhouette} />
        <g fill={scene.silhouette}>
            <path d="M226 104c2-18 1-30-3-42l3-1c4 12 6 25 4 43Z" />
            <path d="M224 62c-8-6-20-6-28 2 10-2 18 0 28 0ZM225 62c4-10 14-14 24-12-10 2-16 6-24 12ZM225 62c10-4 22 0 28 8-10-4-18-6-28-8ZM224 62c-6-8-6-18 0-24 0 8 0 16 0 24Z" />
        </g>
    </svg>
);

/** A pointed arch plaque, the shape of a mosque window, framed in gold. */
export const ArchBadge = ({ width, fill, trim }) => {
    const id = useId().replace(/:/g, '');
    const shape = 'M8 112V48C8 26 30 12 50 2 70 12 92 26 92 48V112Z';
    return (
        <svg viewBox="0 0 100 114" width={width} height={width * 1.14} aria-hidden="true" className="block overflow-visible">
            <defs>
                <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
                    <stop offset="0.3" stopColor={fill} stopOpacity="1" />
                    <stop offset="1" stopColor={fill} />
                </linearGradient>
            </defs>
            <path d={shape} fill="#000000" opacity="0.25" transform="translate(0 2)" />
            <path d={shape} fill={fill} />
            <path d={shape} fill={`url(#${id}-fill)`} />
            <path d="M15 106V50C15 32 33 20 50 11 67 20 85 32 85 50V106Z" fill="none" stroke={trim} strokeWidth="1.6" strokeOpacity="0.8" />
            <path d={shape} fill="none" stroke={trim} strokeWidth="2.5" />
            <polygon points={star(50, 24, 5)} fill={trim} />
        </svg>
    );
};
