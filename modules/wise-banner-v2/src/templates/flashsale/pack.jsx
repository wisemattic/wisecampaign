import React from 'react';
import { Zap } from 'lucide-react';
import { SparkleField } from '../blackfriday/BlackFridayArt';
import { SpeedLines, LightningScene, RocketScene, StopwatchScene, Flame, Starburst } from './FlashSaleArt';

const SCENES = {
    lightning: {
        label: 'Lightning',
        icon: '⚡',
        Scene: LightningScene,
        fallbackBg: '#0A0A0A',
        bolt: '#FACC15',
        boltDeep: '#CA8A04',
        streak: 'rgba(250, 204, 21, 0.75)',
        sparkle: '#FEF08A',
        flameOuter: '#F97316',
        flameInner: '#FACC15',
        ctaIcon: '#0A0A0A',
        tileBg: 'rgba(250, 204, 21, 0.08)',
        tileBorder: 'rgba(250, 204, 21, 0.4)'
    },
    rocket: {
        label: 'Rocket',
        icon: '🚀',
        Scene: RocketScene,
        fallbackBg: '#1E1B4B',
        smoke: 'rgba(224, 231, 255, 0.35)',
        fin: '#F43F5E',
        window: '#67E8F9',
        flameOuter: '#F97316',
        flameInner: '#FDE047',
        streak: 'rgba(165, 180, 252, 0.8)',
        sparkle: '#C7D2FE',
        ctaIcon: '#E11D48',
        tileBg: 'rgba(255, 255, 255, 0.08)',
        tileBorder: 'rgba(165, 180, 252, 0.4)'
    },
    stopwatch: {
        label: 'Stopwatch',
        icon: '⏱️',
        Scene: StopwatchScene,
        fallbackBg: '#7C2D12',
        ring: '#1C1917',
        face: '#FFF7ED',
        ticks: '#1C1917',
        accent: '#EA580C',
        streak: 'rgba(254, 240, 138, 0.7)',
        sparkle: '#FEF08A',
        flameOuter: '#FDE047',
        flameInner: '#FFFFFF',
        ctaIcon: '#C2410C',
        tileBg: 'rgba(0, 0, 0, 0.22)',
        tileBorder: 'rgba(254, 240, 138, 0.4)'
    }
};

const Backdrop = ({ scene, sceneWidth, showSceneArt, isMobile }) => {
    const SceneArt = scene.Scene;
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <SpeedLines color={scene.streak} count={isMobile ? 5 : 8} />
            <SparkleField color={scene.sparkle} count={isMobile ? 5 : 10} />
            <div className="absolute left-0 top-0 bottom-0" style={{ width: sceneWidth, opacity: showSceneArt ? 1 : 0.45 }}>
                <SceneArt scene={scene} />
            </div>
        </div>
    );
};

/** Wobbling starburst sticker; the first word of the badge text is set large ("60%"), the rest below. */
const Badge = ({ config, width, displayClass, stacked }) => {
    const size = stacked ? width * 0.68 : Math.max(48, width * 0.52);
    const [lead, ...rest] = String(config.bogoText || '').split(' ');
    return (
        <div className="relative shrink-0 wb-season-anim" style={{ width: size, height: size, animation: 'wb-fs-burst 2.6s ease-in-out infinite' }}>
            <Starburst size={size} fill={config.badgeBgColor} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ color: config.badgeTextColor }}>
                {config.badgeTopText && (
                    <span className={displayClass} style={{ fontSize: size * 0.11, lineHeight: 1.1, letterSpacing: '0.12em' }}>{config.badgeTopText}</span>
                )}
                <span className={displayClass} style={{ fontSize: size * (lead.length > 4 ? 0.22 : 0.28), lineHeight: 1 }}>{lead}</span>
                {rest.length > 0 && (
                    <span className={displayClass} style={{ fontSize: size * 0.13, lineHeight: 1.1, letterSpacing: '0.08em' }}>{rest.join(' ')}</span>
                )}
            </div>
        </div>
    );
};

const Decoration = ({ scene, width }) => <Flame scene={scene} width={width * 0.8} />;

const CtaIcon = ({ scene, size }) => <Zap size={size * 0.8} strokeWidth={2.4} color={scene.ctaIcon} fill={scene.ctaIcon} />;

export const flashSalePack = {
    id: 'flashsale',
    label: 'Flash Sale',
    // Shares the condensed display font with the Black Friday pack.
    displayClass: 'wb-bf-display',
    timerStyle: 'tiles',
    scenes: SCENES,
    defaultScene: 'lightning',
    headlineShadow: (scene, offset) => `0 ${offset}px 0 rgba(0, 0, 0, 0.35)`,
    Backdrop,
    Badge,
    Decoration,
    CtaIcon
};
