import React from 'react';
import { Moon } from 'lucide-react';
import { TwinkleStars } from '../newyear/NewYearArt';
import { HangingLanterns, GeometricPattern, MosqueScene, LanternScene, CrescentScene, Lantern, ArchBadge } from './EidArt';

const SCENES = {
    mosque: {
        label: 'Mosque Skyline',
        icon: '🕌',
        Scene: MosqueScene,
        fallbackBg: '#0A1F3D',
        moon: '#F5D78E',
        moonGlow: 'rgba(245, 215, 142, 0.55)',
        silhouette: '#06142A',
        windows: '#FCD34D',
        star: '#FDE68A',
        pattern: '#F5D78E',
        lanternBody: '#B7791F',
        lanternLight: '#FCD34D',
        frame: '#E9C46A',
        trim: '#7A5A0B',
        ctaIcon: '#0F2F57'
    },
    lanterns: {
        label: 'Lantern Night',
        icon: '🏮',
        Scene: LanternScene,
        fallbackBg: '#1E0B3B',
        moon: '#FDE68A',
        moonGlow: 'rgba(253, 230, 138, 0.5)',
        silhouette: '#12052A',
        star: '#E9D5FF',
        pattern: '#C4B5FD',
        lanternBody: '#7C2D12',
        lanternLight: '#FBBF24',
        frame: '#F59E0B',
        trim: '#78350F',
        ctaIcon: '#3B0F7A'
    },
    crescent: {
        label: 'Golden Crescent',
        icon: '🌙',
        Scene: CrescentScene,
        fallbackBg: '#022C22',
        moon: '#FDE68A',
        moonGlow: 'rgba(253, 230, 138, 0.6)',
        silhouette: '#011C16',
        dune: '#03382C',
        star: '#FEF3C7',
        pattern: '#FDE68A',
        lanternBody: '#065F46',
        lanternLight: '#FDE68A',
        frame: '#FCD34D',
        trim: '#065F46',
        ctaIcon: '#064E3B'
    }
};

const Backdrop = ({ scene, sceneWidth, showSceneArt, isMobile }) => {
    const SceneArt = scene.Scene;
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <GeometricPattern color={scene.pattern} opacity={0.1} />
            <TwinkleStars color={scene.star} count={isMobile ? 6 : 10} />
            <div className="absolute left-0 top-0 bottom-0" style={{ width: sceneWidth, opacity: showSceneArt ? 1 : 0.45 }}>
                <SceneArt scene={scene} />
                <HangingLanterns scene={scene} count={isMobile ? 2 : 3} />
            </div>
        </div>
    );
};

/** A gold-framed arch; the first word of the badge text is set large ("25%"), the rest below. */
const Badge = ({ config, scene, width, displayClass, stacked }) => {
    const size = stacked ? width * 0.6 : Math.max(42, width * 0.46);
    const [lead, ...rest] = String(config.bogoText || '').split(' ');
    return (
        <div className="relative shrink-0 wb-season-anim" style={{ width: size, animation: 'wb-hw-bob 4s ease-in-out infinite' }}>
            <ArchBadge width={size} fill={config.badgeBgColor} trim={scene.trim} />
            <div
                className="absolute left-0 flex flex-col items-center justify-center text-center"
                style={{ top: size * 0.4, width: size, height: size * 0.62, color: config.badgeTextColor }}
            >
                {config.badgeTopText && (
                    <span style={{ fontSize: size * 0.1, fontWeight: 800, letterSpacing: '0.14em', lineHeight: 1.1 }}>{config.badgeTopText}</span>
                )}
                <span className={displayClass} style={{ fontSize: size * (lead.length > 4 ? 0.19 : 0.25), lineHeight: 1 }}>{lead}</span>
                {rest.length > 0 && (
                    <span style={{ fontSize: size * 0.11, fontWeight: 800, letterSpacing: '0.16em', lineHeight: 1.2 }}>{rest.join(' ')}</span>
                )}
            </div>
        </div>
    );
};

const Decoration = ({ scene, width }) => (
    <div className="wb-season-anim" style={{ transformOrigin: '50% 0%', animation: 'wb-hw-swing 3.8s ease-in-out infinite' }}>
        <Lantern width={width * 0.62} body={scene.lanternBody} light={scene.lanternLight} frame={scene.frame} />
    </div>
);

const CtaIcon = ({ scene, size }) => <Moon size={size * 0.8} strokeWidth={2.4} color={scene.ctaIcon} fill={scene.ctaIcon} />;

export const eidPack = {
    id: 'eid',
    label: 'Eid',
    // Shares the serif display font with the New Year pack.
    displayClass: 'wb-ny-display',
    timerStyle: 'plain',
    scenes: SCENES,
    defaultScene: 'mosque',
    headlineShadow: () => '0 2px 14px rgba(0, 0, 0, 0.35)',
    highlightStyle: (color) => ({
        color,
        backgroundImage: `linear-gradient(100deg, ${color} 20%, #FFFFFF 45%, ${color} 70%)`,
        backgroundSize: '220% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'wb-ny-shine 5s linear infinite'
    }),
    Backdrop,
    Badge,
    Decoration,
    CtaIcon
};
