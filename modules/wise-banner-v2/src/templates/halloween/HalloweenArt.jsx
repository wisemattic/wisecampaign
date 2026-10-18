import React, { useId } from 'react';

/*
 * Inline SVG artwork for the Halloween banner layout. Everything is vector so
 * it stays crisp at any banner size and needs no extra image requests.
 */

const STARS = [
    { x: 21, y: 18, s: 2, d: 0 }, { x: 27, y: 72, s: 1.5, d: 1.2 }, { x: 33, y: 30, s: 2.5, d: 0.6 },
    { x: 38, y: 84, s: 1.5, d: 2.1 }, { x: 41, y: 12, s: 2, d: 1.6 }, { x: 47, y: 58, s: 1.5, d: 0.3 },
    { x: 52, y: 88, s: 2, d: 2.6 }, { x: 55, y: 22, s: 1.5, d: 1.9 }, { x: 61, y: 66, s: 2, d: 0.9 },
    { x: 66, y: 16, s: 1.5, d: 2.4 }, { x: 71, y: 80, s: 2.5, d: 1.1 }, { x: 76, y: 38, s: 1.5, d: 0.2 },
    { x: 81, y: 90, s: 2, d: 1.7 }, { x: 86, y: 20, s: 1.5, d: 2.9 }, { x: 91, y: 70, s: 2, d: 0.5 },
    { x: 96, y: 34, s: 1.5, d: 2.2 }, { x: 12, y: 40, s: 1.5, d: 1.4 }, { x: 64, y: 92, s: 1.5, d: 0.8 }
];

export const StarField = ({ color = '#FFFFFF', count = STARS.length }) => (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {STARS.slice(0, count).map((star, i) => (
            <span
                key={i}
                className="absolute rounded-full wb-season-anim"
                style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: star.s,
                    height: star.s,
                    backgroundColor: color,
                    boxShadow: `0 0 4px ${color}`,
                    animation: `wb-hw-twinkle 3.2s ease-in-out ${star.d}s infinite`
                }}
            />
        ))}
    </div>
);

export const BatShape = ({ color = '#1B1035', width = 28 }) => (
    <svg viewBox="0 0 64 28" width={width} height={width * 0.44} aria-hidden="true" className="block">
        <path
            fill={color}
            d="M32 8.6 30.3 4.6 29.4 9.3C25.8 6.6 19.6 3.1 2 6.2c4 1.8 6.2 4.6 7 8.1 2.7-2.3 5.8-2.6 8.2-.6 1.5-2.6 4.8-3.3 7.6-1.1.9-1.5 3-2.2 5.4-.4L32 22l1.8-9.8c2.4-1.8 4.5-1.1 5.4.4 2.8-2.2 6.1-1.5 7.6 1.1 2.4-2 5.5-1.7 8.2.6.8-3.5 3-6.3 7-8.1-17.6-3.1-23.8.4-27.4 3.1L33.7 4.6Z"
        />
    </svg>
);

/** A bat that flies across the full banner width. */
export const FlyingBat = ({ color, size = 28, top = '8%', duration = 16, delay = 0 }) => (
    <div
        className="absolute pointer-events-none wb-season-anim"
        style={{ top, left: '-8%', animation: `wb-hw-fly ${duration}s linear ${delay}s infinite` }}
        aria-hidden="true"
    >
        <div className="wb-season-anim" style={{ animation: 'wb-hw-bob 2.4s ease-in-out infinite' }}>
            <div className="wb-season-anim" style={{ animation: 'wb-hw-flap 0.32s ease-in-out infinite', transformOrigin: '50% 40%' }}>
                <BatShape color={color} width={size} />
            </div>
        </div>
    </div>
);

export const Moon = ({ size, light, shade, glow, style }) => (
    <div
        className="absolute rounded-full pointer-events-none wb-season-anim"
        aria-hidden="true"
        style={{
            width: size,
            height: size,
            background: `radial-gradient(circle at 62% 38%, ${light} 0%, ${shade} 78%)`,
            boxShadow: `0 0 ${size * 0.35}px ${size * 0.12}px ${glow}`,
            animation: 'wb-hw-moon 6s ease-in-out infinite',
            ...style
        }}
    />
);

export const CastleScene = ({ silhouette, windows, hill }) => {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block">
            <defs>
                <linearGradient id={`${id}-hill`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={hill} stopOpacity="0.9" />
                    <stop offset="1" stopColor={hill} stopOpacity="0.35" />
                </linearGradient>
            </defs>
            <path d="M258 110C264 84 284 70 300 70s34 14 40 40Z" fill={`url(#${id}-hill)`} />
            <g fill={silhouette}>
                <rect x="0" y="70" width="202" height="40" />
                <rect x="32" y="44" width="20" height="30" />
                <polygon points="30,45 42,22 54,45" />
                <rect x="65" y="48" width="18" height="24" />
                <rect x="65" y="41" width="4.5" height="8" />
                <rect x="71.8" y="41" width="4.5" height="8" />
                <rect x="78.5" y="41" width="4.5" height="8" />
                <rect x="96" y="50" width="28" height="22" />
                <polygon points="94,51 110,26 126,51" />
                <rect x="131" y="58" width="7" height="14" />
                <rect x="146" y="30" width="32" height="42" />
                <polygon points="144,31 162,4 180,31" />
                <rect x="178" y="64" width="24" height="8" />
                <rect x="186" y="58" width="6" height="7" />
                <rect x="210" y="82" width="50" height="28" />
                <rect x="221" y="76" width="7" height="7" />
                <rect x="240" y="58" width="20" height="26" />
                <polygon points="238,59 250,42 262,59" />
            </g>
            <g fill={windows} style={{ filter: `drop-shadow(0 0 2.5px ${windows})` }}>
                <rect x="40" y="49" width="4" height="7" rx="2" />
                <rect x="87" y="62" width="4" height="7" rx="2" />
                <rect x="158" y="40" width="4" height="7" rx="2" />
                <rect x="166" y="76" width="4" height="7" rx="2" />
                <rect x="247" y="70" width="4" height="7" rx="2" />
                <rect x="58" y="84" width="4" height="7" rx="2" />
            </g>
        </svg>
    );
};

export const GraveyardScene = ({ silhouette, windows, hill }) => (
    <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" aria-hidden="true" className="block">
        <path d="M200 110c10-22 40-34 70-34s58 12 70 34Z" fill={hill} opacity="0.55" />
        <g stroke={silhouette} strokeLinecap="round" fill="none">
            <path d="M58 110C58 88 54 70 60 46" strokeWidth="8" />
            <path d="M59 66C48 58 40 50 34 36" strokeWidth="4" />
            <path d="M40 46C32 44 26 40 22 32" strokeWidth="2" />
            <path d="M60 52C70 42 76 32 78 20" strokeWidth="4" />
            <path d="M74 30C82 28 88 22 92 14" strokeWidth="2" />
            <path d="M60 46C60 34 56 24 50 16" strokeWidth="3" />
            <path d="M57 74C70 70 80 64 88 56" strokeWidth="3" />
            <path d="M82 60C90 60 96 56 100 50" strokeWidth="1.6" />
        </g>
        <g fill={silhouette}>
            <path d="M0 110V94c50-8 110-6 170-2s120 2 170 4v14Z" />
            <path d="M106 96V74a13 13 0 0 1 26 0v22Z" />
            <rect x="148" y="64" width="6" height="32" />
            <rect x="140" y="72" width="22" height="6" />
            <path d="M176 98V82a11 11 0 0 1 22 0v16Z" />
            <path d="M266 100V88a9 9 0 0 1 18 0v12Z" />
            <rect x="206" y="88" width="132" height="2.5" />
            <rect x="206" y="97" width="132" height="2.5" />
            {Array.from({ length: 12 }).map((_, i) => (
                <path key={i} d={`M${210 + i * 11} 104V84l1.6-4 1.6 4v20Z`} />
            ))}
        </g>
        <g fill={windows} opacity="0.85" style={{ filter: `drop-shadow(0 0 2px ${windows})` }}>
            <rect x="115" y="78" width="8" height="1.6" rx="0.8" />
            <rect x="115" y="83" width="8" height="1.6" rx="0.8" />
        </g>
    </svg>
);

const WEB_ANGLES = [0, 15, 30, 45, 60, 75, 90];
const WEB_RINGS = [16, 32, 50, 70, 92];

const webPoint = (r, deg) => {
    const a = (deg * Math.PI) / 180;
    return [r * Math.cos(a), r * Math.sin(a)];
};

const SpiderWeb = ({ color, size = 92 }) => (
    <svg viewBox="0 0 96 96" width={size} height={typeof size === 'number' ? size : undefined} aria-hidden="true" className="block">
        <g stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round">
            {WEB_ANGLES.map((deg) => {
                const [x, y] = webPoint(96, deg);
                return <line key={deg} x1="0" y1="0" x2={x} y2={y} />;
            })}
            {WEB_RINGS.map((r) => {
                let d = '';
                WEB_ANGLES.forEach((deg, i) => {
                    const [x, y] = webPoint(r, deg);
                    if (i === 0) {
                        d += `M${x} ${y}`;
                        return;
                    }
                    const [cx, cy] = webPoint(r * 0.86, deg - 7.5);
                    d += ` Q${cx} ${cy} ${x} ${y}`;
                });
                return <path key={r} d={d} />;
            })}
        </g>
    </svg>
);

const Spider = ({ color, eyes }) => (
    <svg viewBox="0 0 30 26" width="22" height="19" aria-hidden="true" className="block">
        <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round">
            <path d="M12 12 6 6 1 9M12 14 5 12 0 16M18 12l6-6 5 3M18 14l7-2 5 4M12 16l-5 4-3 5M18 16l5 4 3 5M13 17l-3 6M17 17l3 6" />
        </g>
        <ellipse cx="15" cy="15" rx="5" ry="6" fill={color} />
        <circle cx="15" cy="8.5" r="3.4" fill={color} />
        <circle cx="13.8" cy="8" r="0.9" fill={eyes} />
        <circle cx="16.2" cy="8" r="0.9" fill={eyes} />
    </svg>
);

export const WebScene = ({ silhouette, windows, hill, webColor }) => (
    <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute left-0 top-0 w-[38%] max-w-[110px]">
            <SpiderWeb color={webColor} size="100%" />
        </div>
        <div className="absolute top-0 wb-season-anim" style={{ left: '46%', animation: 'wb-hw-dangle 4.5s ease-in-out infinite' }}>
            <div className="mx-auto" style={{ width: 1, height: 26, backgroundColor: webColor }} />
            <div style={{ marginLeft: -10.5, marginTop: -2 }}>
                <Spider color={silhouette} eyes={windows} />
            </div>
        </div>
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMinYMax meet" width="100%" height="100%" className="absolute inset-0 block">
            <path d="M150 110c14-24 44-36 76-36s62 12 76 36Z" fill={hill} opacity="0.5" />
            <g fill={silhouette}>
                <path d="M0 110V90c24-10 52-12 78-6 18-12 44-14 64-4 20-6 40-4 58 6v24Z" />
                <path d="M222 74h56c0 4-2 6-4 7 6 6 9 13 9 19 0 6-3 10-8 10h-50c-5 0-8-4-8-10 0-6 3-13 9-19-2-1-4-3-4-7Z" />
                <rect x="226" y="104" width="6" height="6" />
                <rect x="268" y="104" width="6" height="6" />
            </g>
            <ellipse cx="250" cy="75" rx="25" ry="3.2" fill={windows} opacity="0.9" style={{ filter: `drop-shadow(0 0 5px ${windows})` }} />
        </svg>
        {[{ x: '70%', d: 0 }, { x: '74%', d: 1.1 }, { x: '72%', d: 2.2 }].map((b, i) => (
            <span
                key={i}
                className="absolute rounded-full wb-season-anim"
                style={{
                    left: b.x,
                    bottom: '30%',
                    width: 6,
                    height: 6,
                    border: `1.5px solid ${windows}`,
                    animation: `wb-hw-bubble 3.3s ease-in ${b.d}s infinite`
                }}
            />
        ))}
    </div>
);

export const WitchPumpkin = ({ hat = true, hatColor = '#2E1C6B', bandColor = '#7C3AED', vineColor = '#3F8A24', width = 92 }) => {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 100 120" width={width} height={typeof width === 'number' ? width * 1.2 : undefined} aria-hidden="true" className="block overflow-visible">
            <defs>
                <radialGradient id={`${id}-body`} cx="42%" cy="38%" r="70%">
                    <stop offset="0" stopColor="#FFC15A" />
                    <stop offset="0.55" stopColor="#FA8A1E" />
                    <stop offset="1" stopColor="#D2520A" />
                </radialGradient>
                <radialGradient id={`${id}-lobe`} cx="50%" cy="40%" r="75%">
                    <stop offset="0" stopColor="#F99A2E" />
                    <stop offset="1" stopColor="#C4470A" />
                </radialGradient>
                <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="60%">
                    <stop offset="0" stopColor="#FFF6B8" />
                    <stop offset="1" stopColor="#FFB21A" />
                </radialGradient>
            </defs>
            <path d="M76 72c10-4 16 2 13 9-2 5-8 5-9 1" fill="none" stroke={vineColor} strokeWidth="3.6" strokeLinecap="round" />
            <ellipse cx="27" cy="84" rx="23" ry="30" fill={`url(#${id}-lobe)`} />
            <ellipse cx="73" cy="84" rx="23" ry="30" fill={`url(#${id}-lobe)`} />
            <ellipse cx="50" cy="82" rx="28" ry="33" fill={`url(#${id}-body)`} />
            <g fill="none" stroke="#9A3A06" strokeOpacity="0.35" strokeWidth="1.6">
                <path d="M36 54c-6 16-6 40 0 58" />
                <path d="M64 54c6 16 6 40 0 58" />
            </g>
            <g fill={`url(#${id}-glow)`} className="wb-season-anim" style={{ animation: 'wb-hw-flicker 2.6s ease-in-out infinite' }}>
                <path d="M28 74 40 64l5 12Z" />
                <path d="M72 74 60 64l-5 12Z" />
                <path d="M46.5 82 50 76.5l3.5 5.5Z" />
                <path d="M26 88c8 12 40 12 48 0l-3 7-5-3-4 7-5-4-5 4-4-7-5 3-3-7Z" />
            </g>
            {hat ? (
                <g transform="rotate(-8 50 50)">
                    <path d="M30 50C36 32 44 16 60 4c-2 12 4 30 10 46Z" fill={hatColor} />
                    <path d="M31.5 45c12 3.5 26 3.5 37 0l1.6 5c-12 3-27 3-40 0Z" fill={bandColor} />
                    <rect x="45" y="44" width="9" height="7.5" rx="1.6" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
                    <ellipse cx="50" cy="51" rx="41" ry="7.5" fill={hatColor} />
                    <ellipse cx="50" cy="50" rx="39" ry="5.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1.2" />
                </g>
            ) : (
                <path d="M48 52c-1-6 0-12 4-16 2 1 3 2 3 3-3 3-3 8-2 13Z" fill="#4B5D16" />
            )}
        </svg>
    );
};

export const JackIcon = ({ size = 26 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="block">
        <path d="M11.4 6.2c-.2-1.6.4-3 1.6-3.8l.9 1c-.9.6-1.2 1.6-1 2.8Z" fill="#3F8A24" />
        <ellipse cx="7.6" cy="14" rx="5.4" ry="7" fill="#EA6A0C" />
        <ellipse cx="16.4" cy="14" rx="5.4" ry="7" fill="#EA6A0C" />
        <ellipse cx="12" cy="13.6" rx="6.4" ry="7.6" fill="#FB8C1D" />
        <g fill="#5A1E04">
            <path d="m6.6 12.4 2.8-2.4 1 2.9Z" />
            <path d="m17.4 12.4-2.8-2.4-1 2.9Z" />
            <path d="M6.8 15.4c2 2.9 8.4 2.9 10.4 0l-.8 1.9-1.3-.8-1 1.8-1.5-1-1.2 1-1.1-1.8-1.3.8Z" />
        </g>
    </svg>
);

/** Small swatch used for the template's icon in the sidebar card. */
export const HalloweenSwatch = ({ background }) => (
    <div className="w-full h-full rounded-lg overflow-hidden relative flex items-end justify-center" style={{ background }}>
        <span className="absolute top-[18%] left-[18%] w-[30%] aspect-square rounded-full bg-[#F4E9D6] opacity-80" />
        <div className="relative w-[55%] max-w-[34px]">
            <WitchPumpkin width="100%" />
        </div>
    </div>
);
