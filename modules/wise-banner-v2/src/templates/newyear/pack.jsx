import React from 'react';
import { PartyPopper } from 'lucide-react';
import {
    TwinkleStars,
    Fireworks,
    FallingConfetti,
    RisingBubbles,
    SkylineScene,
    ClockScene,
    ChampagneScene,
    ChampagneFlutes,
    RosetteSeal
} from './NewYearArt';

const SCENES = {
    fireworks: {
        label: 'Fireworks',
        icon: '🎆',
        Scene: SkylineScene,
        fallbackBg: '#0B1030',
        silhouette: '#050818',
        windows: '#FCD34D',
        star: '#E0E7FF',
        fireworks: ['#F5C542', '#F472B6', '#60A5FA'],
        accent: '#F5C542',
        wine: '#F5C542',
        wineDeep: '#C9971C',
        ribbon: '#B91C1C',
        sealTopText: '#5A3F06',
        ctaIcon: '#1A1405'
    },
    clock: {
        label: 'Midnight Clock',
        icon: '🕛',
        Scene: ClockScene,
        fallbackBg: '#0F0D07',
        accent: '#E9C46A',
        face: '#120F08',
        glow: 'rgba(233, 196, 106, 0.35)',
        star: '#FDE68A',
        confetti: ['#E9C46A', '#FFF3C4', '#C9971C'],
        wine: '#E9C46A',
        wineDeep: '#B8860B',
        ribbon: '#1F1F1F',
        sealTopText: '#4A3608',
        ctaIcon: '#1A1405'
    },
    champagne: {
        label: 'Champagne',
        icon: '🥂',
        Scene: ChampagneScene,
        fallbackBg: '#3A1224',
        accent: '#F7D9A8',
        bottle: '#123B2C',
        bottleLabel: '#F8EBD3',
        foam: '#FFF7E6',
        star: '#FBCFE8',
        bubbles: '#F7D9A8',
        wine: '#F7D9A8',
        wineDeep: '#E2B670',
        ribbon: '#9D174D',
        sealTopText: '#6B2340',
        ctaIcon: '#4A1730'
    }
};

const Backdrop = ({ scene, sceneWidth, showSceneArt, isMobile, px }) => {
    const SceneArt = scene.Scene;
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <TwinkleStars color={scene.star} count={isMobile ? 6 : 10} />
            {scene.fireworks && <Fireworks colors={scene.fireworks} scale={isMobile ? 0.7 : px(100) / 100} count={isMobile ? 3 : 5} />}
            {scene.confetti && <FallingConfetti colors={scene.confetti} count={isMobile ? 7 : 12} />}
            {scene.bubbles && <RisingBubbles color={scene.bubbles} count={isMobile ? 6 : 9} />}
            <div className="absolute left-0 top-0 bottom-0" style={{ width: sceneWidth, opacity: showSceneArt ? 1 : 0.45 }}>
                <SceneArt scene={scene} />
            </div>
        </div>
    );
};

/** Rosette seal; the first word of the badge text is set large ("40%"), the rest below ("OFF"). */
const Badge = ({ config, scene, width, displayClass, stacked }) => {
    // Single-row banners have little height to spare; stacked ones can show a bigger seal.
    const size = stacked ? width * 0.62 : Math.max(40, width * 0.38);
    const [lead, ...rest] = String(config.bogoText || '').split(' ');
    return (
        <div className="relative shrink-0 wb-season-anim" style={{ width: size, animation: 'wb-ny-seal 4s ease-in-out infinite' }}>
            <RosetteSeal size={size} fill={config.badgeBgColor} ribbon={scene.ribbon} />
            <div className="absolute left-0 top-0 flex flex-col items-center justify-center text-center" style={{ width: size, height: size, color: config.badgeTextColor }}>
                {config.badgeTopText && (
                    <span style={{ fontSize: size * 0.1, fontWeight: 800, letterSpacing: '0.14em', lineHeight: 1.1, color: scene.sealTopText }}>
                        {config.badgeTopText}
                    </span>
                )}
                <span className={displayClass} style={{ fontSize: size * (lead.length > 4 ? 0.2 : 0.26), lineHeight: 1 }}>{lead}</span>
                {rest.length > 0 && (
                    <span style={{ fontSize: size * 0.11, fontWeight: 800, letterSpacing: '0.16em', lineHeight: 1.2 }}>{rest.join(' ')}</span>
                )}
            </div>
        </div>
    );
};

const Decoration = ({ scene, width }) => <ChampagneFlutes scene={scene} width={width} />;

const CtaIcon = ({ scene, size }) => <PartyPopper size={size * 0.9} strokeWidth={2.2} color={scene.ctaIcon} />;

export const newYearPack = {
    id: 'newyear',
    label: 'New Year',
    displayClass: 'wb-ny-display',
    timerStyle: 'plain',
    scenes: SCENES,
    defaultScene: 'fireworks',
    headlineShadow: () => '0 2px 14px rgba(0, 0, 0, 0.35)',
    // Gold shimmer sweeping across the highlighted words.
    highlightStyle: (color) => ({
        color,
        backgroundImage: `linear-gradient(100deg, ${color} 20%, #FFFFFF 45%, ${color} 70%)`,
        backgroundSize: '220% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'wb-ny-shine 4.5s linear infinite'
    }),
    Backdrop,
    Badge,
    Decoration,
    CtaIcon
};
