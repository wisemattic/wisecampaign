import React from 'react';
import { Heart } from 'lucide-react';
import { SparkleField } from '../blackfriday/BlackFridayArt';
import { FloatingHearts, BalloonsScene, LetterScene, RosesScene, ArrowHeart, HeartBadge } from './ValentineArt';

const SCENES = {
    balloons: {
        label: 'Heart Balloons',
        icon: '🎈',
        Scene: BalloonsScene,
        fallbackBg: '#9D174D',
        balloons: ['#FFFFFF', '#FB7185', '#FDE047'],
        string: 'rgba(255, 255, 255, 0.6)',
        hearts: 'rgba(255, 255, 255, 0.55)',
        sparkle: '#FFE4E6',
        accent: '#FFFFFF',
        arrow: '#FDE68A',
        feather: '#FFFFFF',
        ctaIcon: '#BE185D',
        shadow: 'rgba(80, 7, 36, 0.35)'
    },
    letter: {
        label: 'Love Letter',
        icon: '💌',
        Scene: LetterScene,
        fallbackBg: '#4C0D26',
        paper: '#FCE7EF',
        paperShade: '#E9B8C9',
        card: '#FFFFFF',
        ink: '#9F1239',
        seal: '#F43F5E',
        hearts: 'rgba(249, 168, 212, 0.6)',
        sparkle: '#FBCFE8',
        accent: '#F43F5E',
        arrow: '#F9A8D4',
        feather: '#FCE7EF',
        ctaIcon: '#E11D48',
        shadow: 'rgba(0, 0, 0, 0.35)'
    },
    roses: {
        label: 'Rose Garden',
        icon: '🌹',
        Scene: RosesScene,
        fallbackBg: '#FFE4E6',
        rose: '#E11D48',
        roseDeep: '#9F1239',
        stem: '#15803D',
        leaf: '#16A34A',
        hearts: 'rgba(225, 29, 72, 0.35)',
        sparkle: '#FB7185',
        accent: '#E11D48',
        arrow: '#9F1239',
        feather: '#FDA4AF',
        ctaIcon: '#BE123C',
        // Light background: a soft glow reads better than a dark drop shadow.
        shadow: 'rgba(255, 255, 255, 0.6)',
        lightBg: true
    }
};

const Backdrop = ({ scene, sceneWidth, showSceneArt, isMobile }) => {
    const SceneArt = scene.Scene;
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <SparkleField color={scene.sparkle} count={isMobile ? 6 : 12} />
            <FloatingHearts color={scene.hearts} count={isMobile ? 6 : 10} />
            <div className="absolute left-0 top-0 bottom-0" style={{ width: sceneWidth, opacity: showSceneArt ? 1 : 0.45 }}>
                <SceneArt scene={scene} />
            </div>
        </div>
    );
};

/** A beating heart; the first word of the badge text is set large ("30%"), the rest below. */
const Badge = ({ config, width, displayClass, stacked }) => {
    const size = stacked ? width * 0.68 : Math.max(48, width * 0.52);
    const [lead, ...rest] = String(config.bogoText || '').split(' ');
    return (
        <div className="relative shrink-0 wb-season-anim" style={{ width: size, height: size, animation: 'wb-vd-beat 1.8s ease-in-out infinite' }}>
            <HeartBadge size={size} fill={config.badgeBgColor} />
            <div
                className="absolute left-0 flex flex-col items-center justify-center text-center"
                style={{ top: size * 0.24, width: size, height: size * 0.5, color: config.badgeTextColor }}
            >
                {config.badgeTopText && (
                    <span style={{ fontSize: size * 0.075, fontWeight: 800, letterSpacing: '0.14em', lineHeight: 1.1 }}>{config.badgeTopText}</span>
                )}
                <span className={displayClass} style={{ fontSize: size * (lead.length > 4 ? 0.15 : 0.19), lineHeight: 1 }}>{lead}</span>
                {rest.length > 0 && (
                    <span style={{ fontSize: size * 0.08, fontWeight: 800, letterSpacing: '0.14em', lineHeight: 1.2 }}>{rest.join(' ')}</span>
                )}
            </div>
        </div>
    );
};

const Decoration = ({ scene, width }) => <ArrowHeart scene={scene} width={width} />;

const CtaIcon = ({ scene, size }) => <Heart size={size * 0.8} strokeWidth={2.4} color={scene.ctaIcon} fill={scene.ctaIcon} />;

export const valentinePack = {
    id: 'valentine',
    label: "Valentine's Day",
    // Shares the serif display font with the New Year pack.
    displayClass: 'wb-ny-display',
    timerStyle: 'plain',
    scenes: SCENES,
    defaultScene: 'balloons',
    headlineShadow: (scene) => `0 2px 12px ${scene.shadow}`,
    Backdrop,
    Badge,
    Decoration,
    CtaIcon
};
