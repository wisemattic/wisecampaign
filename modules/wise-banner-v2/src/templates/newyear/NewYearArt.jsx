import React, { useId } from 'react';

/*
 * Inline SVG / CSS artwork for the New Year banner pack.
 */

const STARS = [
    { x: 22, y: 16 }, { x: 34, y: 70 }, { x: 46, y: 24 }, { x: 55, y: 86 }, { x: 63, y: 12 },
    { x: 71, y: 60 }, { x: 78, y: 22 }, { x: 88, y: 76 }, { x: 94, y: 30 }, { x: 40, y: 48 }
];

export const TwinkleStars = ({ color, count = STARS.length }) => (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {STARS.slice(0, count).map((star, i) => (
            <span
                key={i}
                className="absolute rounded-full wb-season-anim"
                style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: 2,
                    height: 2,
                    backgroundColor: color,
                    boxShadow: `0 0 4px ${color}`,
                    animation: `wb-hw-twinkle 3s ease-in-out ${(i * 0.37) % 3}s infinite`
                }}
            />
        ))}
    </div>
);

// Positioned in the gaps between the timer, badge, headline and button.
const BURSTS = [
    { x: 50, y: 30, size: 60, color: 0, delay: 0 },
    { x: 79, y: 28, size: 54, color: 1, delay: 1.1 },
    { x: 37.5, y: 70, size: 40, color: 2, delay: 2 },
    { x: 52, y: 80, size: 36, color: 1, delay: 2.7 },
    { x: 99, y: 70, size: 46, color: 2, delay: 0.6 }
];
const PARTICLES = 14;

/** Looping firework bursts spread across the banner. */
export const Fireworks = ({ colors, scale = 1, count = BURSTS.length }) => (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.75 }} aria-hidden="true">
        {BURSTS.slice(0, count).map((burst, b) => {
            const color = colors[burst.color % colors.length];
            const radius = (burst.size * scale) / 2;
            return (
                <div key={b} className="absolute" style={{ left: `${burst.x}%`, top: `${burst.y}%`, width: 0, height: 0 }}>
                    {Array.from({ length: PARTICLES }).map((_, i) => (
                        <span
                            key={i}
                            className="absolute wb-season-anim"
                            style={{
                                left: 0,
                                top: -1,
                                width: Math.max(4, radius * 0.28),
                                height: 2,
                                borderRadius: 2,
                                backgroundColor: color,
                                boxShadow: `0 0 4px ${color}`,
                                transformOrigin: '0 50%',
                                opacity: 0,
                                '--wb-ny-angle': `${(360 / PARTICLES) * i}deg`,
                                '--wb-ny-distance': `${radius}px`,
                                animation: `wb-ny-burst 2.8s cubic-bezier(0.1, 0.8, 0.3, 1) ${burst.delay}s infinite`
                            }}
                        />
                    ))}
                </div>
            );
        })}
    </div>
);

const CONFETTI = [
    { x: 6, d: 0, t: 5.2, r: 0 }, { x: 14, d: 1.8, t: 6.4, r: 1 }, { x: 23, d: 0.9, t: 5.8, r: 2 },
    { x: 31, d: 3.1, t: 6.1, r: 0 }, { x: 40, d: 2.2, t: 5.5, r: 1 }, { x: 48, d: 0.4, t: 6.8, r: 2 },
    { x: 57, d: 2.8, t: 5.9, r: 0 }, { x: 65, d: 1.2, t: 6.3, r: 1 }, { x: 73, d: 3.6, t: 5.4, r: 2 },
    { x: 81, d: 0.7, t: 6.6, r: 0 }, { x: 89, d: 2.5, t: 5.7, r: 1 }, { x: 96, d: 1.5, t: 6.2, r: 2 }
];

/** Gold confetti drifting down through the banner. */
export const FallingConfetti = ({ colors, count = CONFETTI.length }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {CONFETTI.slice(0, count).map((piece, i) => (
            <span
                key={i}
                className="absolute wb-season-anim"
                style={{
                    left: `${piece.x}%`,
                    top: -12,
                    width: piece.r === 1 ? 5 : 7,
                    height: piece.r === 1 ? 5 : 3,
                    borderRadius: piece.r === 1 ? '50%' : 1,
                    backgroundColor: colors[i % colors.length],
                    animation: `wb-ny-fall ${piece.t}s linear ${piece.d}s infinite`
                }}
            />
        ))}
    </div>
);

const BUBBLES = [
    { x: 8, s: 6, d: 0, t: 5 }, { x: 18, s: 4, d: 1.6, t: 4.2 }, { x: 29, s: 8, d: 0.8, t: 5.6 },
    { x: 41, s: 5, d: 2.4, t: 4.6 }, { x: 52, s: 7, d: 1.1, t: 5.2 }, { x: 63, s: 4, d: 3, t: 4.4 },
    { x: 74, s: 6, d: 0.3, t: 5.8 }, { x: 85, s: 5, d: 2, t: 4.8 }, { x: 94, s: 7, d: 1.4, t: 5.4 }
];

/** Champagne bubbles rising from the bottom edge. */
export const RisingBubbles = ({ color, count = BUBBLES.length }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {BUBBLES.slice(0, count).map((bubble, i) => (
            <span
                key={i}
                className="absolute rounded-full wb-season-anim"
                style={{
                    left: `${bubble.x}%`,
                    bottom: -10,
                    width: bubble.s,
                    height: bubble.s,
                    border: `1.5px solid ${color}`,
                    backgroundColor: `${color}22`,
                    animation: `wb-ny-rise ${bubble.t}s ease-in ${bubble.d}s infinite`
                }}
            />
        ))}
    </div>
);

const BUILDINGS = [
    [0, 26, 46], [24, 20, 64], [42, 30, 40], [70, 22, 72], [90, 28, 52], [132, 34, 58],
    [164, 22, 70], [184, 30, 44], [212, 20, 60], [230, 26, 36], [254, 18, 50], [270, 30, 30], [298, 42, 22]
];

export const SkylineScene = ({ scene }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block">
        <g fill={scene.silhouette}>
            {BUILDINGS.map(([x, w, h]) => <rect key={x} x={x} y={110 - h} width={w} height={h} />)}
            <rect x="114" y="34" width="20" height="76" />
            <polygon points="112,35 124,8 136,35" />
        </g>
        <circle cx="124" cy="48" r="7" fill={scene.windows} opacity="0.95" style={{ filter: `drop-shadow(0 0 4px ${scene.windows})` }} />
        <path d="M124 48v-5M124 48l3-2" stroke={scene.silhouette} strokeWidth="1.3" strokeLinecap="round" />
        <g fill={scene.windows} opacity="0.75">
            {BUILDINGS.flatMap(([x, w, h], b) => {
                const cols = Math.floor((w - 6) / 7);
                const rows = Math.floor((h - 10) / 9);
                const lit = [];
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if ((b * 7 + r * 3 + c * 5) % 4 === 0) {
                            lit.push(<rect key={`${b}-${r}-${c}`} x={x + 4 + c * 7} y={110 - h + 6 + r * 9} width="3" height="4" rx="0.5" />);
                        }
                    }
                }
                return lit;
            })}
        </g>
    </svg>
);

export const ClockScene = ({ scene }) => {
    const id = useId().replace(/:/g, '');
    const cx = 150;
    const cy = 58;
    return (
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
            <defs>
                <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FFF3C4" />
                    <stop offset="0.5" stopColor={scene.accent} />
                    <stop offset="1" stopColor="#8A6A16" />
                </linearGradient>
            </defs>
            <circle cx={cx} cy={cy} r="50" fill={scene.face} stroke={`url(#${id}-ring)`} strokeWidth="5" style={{ filter: `drop-shadow(0 0 10px ${scene.glow})` }} />
            <circle cx={cx} cy={cy} r="43" fill="none" stroke={scene.accent} strokeOpacity="0.35" strokeWidth="1" />
            {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                const long = i % 3 === 0;
                const r1 = long ? 33 : 37;
                return (
                    <line
                        key={i}
                        x1={cx + Math.sin(a) * r1}
                        y1={cy - Math.cos(a) * r1}
                        x2={cx + Math.sin(a) * 41}
                        y2={cy - Math.cos(a) * 41}
                        stroke={scene.accent}
                        strokeWidth={long ? 3 : 1.5}
                        strokeLinecap="round"
                    />
                );
            })}
            <text x={cx} y={cy - 20} textAnchor="middle" fontFamily="'WiseCampaign Serif', Georgia, serif" fontSize="11" fill={scene.accent}>XII</text>
            <line x1={cx} y1={cy} x2={cx - 1} y2={cy - 22} stroke={scene.accent} strokeWidth="4" strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={cx - 7} y2={cy - 33} stroke={scene.accent} strokeWidth="2.5" strokeLinecap="round" />
            <g className="wb-season-anim" style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'wb-bf-spin 60s linear infinite' }}>
                <line x1={cx} y1={cy + 6} x2={cx} y2={cy - 38} stroke="#F87171" strokeWidth="1.2" strokeLinecap="round" />
            </g>
            <circle cx={cx} cy={cy} r="3.5" fill={scene.accent} />
        </svg>
    );
};

export const ChampagneScene = ({ scene }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block overflow-visible">
        <g transform="rotate(-30 130 78)">
            <path d="M58 62c0-8 6-14 14-14h70c10 0 14 8 24 8h22v24h-22c-10 0-14 8-24 8H72c-8 0-14-6-14-14Z" fill={scene.bottle} />
            <path d="M166 56h24v24h-24Z" fill={scene.accent} />
            <rect x="82" y="54" width="44" height="28" rx="3" fill={scene.bottleLabel} />
            <rect x="88" y="60" width="32" height="2.5" rx="1" fill={scene.accent} />
            <rect x="92" y="66" width="24" height="7" rx="1" fill={scene.bottle} opacity="0.8" />
            <path d="M72 52h60" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
            <g className="wb-season-anim" style={{ animation: 'wb-ny-cork 2.6s ease-out infinite' }}>
                <rect x="192" y="60" width="14" height="16" rx="4" fill="#D6B48A" />
            </g>
            {[[198, 54, 3], [204, 64, 4], [200, 74, 2.5], [210, 58, 2.5], [212, 70, 3.5]].map(([x, y, r], i) => (
                <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={r}
                    fill={scene.foam}
                    className="wb-season-anim"
                    style={{ animation: `wb-ny-spray 1.4s ease-out ${i * 0.18}s infinite`, transformBox: 'fill-box', transformOrigin: 'center' }}
                />
            ))}
        </g>
    </svg>
);

/** Two champagne flutes clinking. */
export const ChampagneFlutes = ({ scene, width }) => {
    const id = useId().replace(/:/g, '');
    const glass = (
        <>
            <path d="M30 8h20l-3 52c-1 6-13 6-14 0Z" fill={`url(#${id}-wine)`} stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.6" />
            <path d="M31.5 8h17" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="1.6" />
            <path d="M40 64v38" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="2" />
            <ellipse cx="40" cy="104" rx="11" ry="3" fill="none" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="2" />
            <circle cx="38" cy="44" r="1.3" fill="#FFFFFF" opacity="0.8" />
            <circle cx="42" cy="34" r="1" fill="#FFFFFF" opacity="0.8" />
            <circle cx="39" cy="26" r="1.2" fill="#FFFFFF" opacity="0.7" />
        </>
    );
    return (
        <svg viewBox="0 0 100 120" width={width} height={width * 1.2} aria-hidden="true" className="block overflow-visible">
            <defs>
                <linearGradient id={`${id}-wine`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.12" />
                    <stop offset="0.28" stopColor="#FFFFFF" stopOpacity="0.12" />
                    <stop offset="0.3" stopColor={scene.wine} stopOpacity="0.95" />
                    <stop offset="1" stopColor={scene.wineDeep} stopOpacity="0.95" />
                </linearGradient>
            </defs>
            <g transform="translate(-6 10) rotate(-14 40 104)">{glass}</g>
            <g transform="translate(26 10) rotate(14 40 104)">{glass}</g>
            <path
                d="M50 0c.8 4.8 3.2 7.2 8 8-4.8.8-7.2 3.2-8 8-.8-4.8-3.2-7.2-8-8 4.8-.8 7.2-3.2 8-8Z"
                fill={scene.accent}
                className="wb-season-anim"
                style={{ filter: `drop-shadow(0 0 4px ${scene.accent})`, animation: 'wb-hw-twinkle 1.8s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'center' }}
            />
        </svg>
    );
};

const SEAL_POINTS = Array.from({ length: 56 }, (_, i) => {
    const a = (i * Math.PI * 2) / 56;
    const r = i % 2 === 0 ? 48 : 43.5;
    return `${(50 + Math.sin(a) * r).toFixed(2)},${(50 - Math.cos(a) * r).toFixed(2)}`;
}).join(' ');

/** Gold rosette seal with ribbon tails. */
export const RosetteSeal = ({ size, fill, ribbon }) => {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 100 118" width={size} height={size * 1.18} aria-hidden="true" className="block overflow-visible">
            <defs>
                <radialGradient id={`${id}-seal`} cx="38%" cy="32%" r="75%">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
                    <stop offset="0.35" stopColor={fill} />
                    <stop offset="1" stopColor={fill} />
                </radialGradient>
            </defs>
            <path d="M32 72 22 116l11-7 9 9 8-42Z" fill={ribbon} />
            <path d="M68 72l10 44-11-7-9 9-8-42Z" fill={ribbon} />
            <polygon points={SEAL_POINTS} fill="#000000" opacity="0.25" transform="translate(0 2)" />
            <polygon points={SEAL_POINTS} fill={`url(#${id}-seal)`} />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#000000" strokeOpacity="0.2" strokeWidth="1.2" />
            <circle cx="50" cy="50" r="35.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.8" />
        </svg>
    );
};
