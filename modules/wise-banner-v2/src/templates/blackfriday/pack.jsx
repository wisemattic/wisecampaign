import React from 'react';
import { ShoppingBag } from 'lucide-react';
import {
    SparkleField,
    Sunburst,
    NeonGrid,
    Sheen,
    BagsScene,
    MegaphoneScene,
    NeonScene,
    ShoppingBagIllustration,
    NeonCart
} from './BlackFridayArt';

const SCENES = {
    bags: {
        label: 'Gold Bags',
        icon: '🛍️',
        Scene: BagsScene,
        fallbackBg: '#0A0A0A',
        accent: '#FACC15',
        sparkle: '#FDE68A',
        sheen: 'rgba(250, 204, 21, 0.10)',
        tagBorder: '#7A5A0B',
        tagTopText: '#3F2E05',
        holeColor: '#0A0A0A',
        decoration: 'bag',
        bagLight: '#F87171',
        bagBody: '#B91C1C',
        bagShade: '#7F1D1D',
        bagHandle: '#FACC15',
        ctaIcon: '#0A0A0A',
        tileBg: 'rgba(250, 204, 21, 0.08)',
        tileBorder: 'rgba(250, 204, 21, 0.35)'
    },
    burst: {
        label: 'Megaphone',
        icon: '📣',
        Scene: MegaphoneScene,
        fallbackBg: '#991B1B',
        accent: '#DC2626',
        sparkle: '#FEF08A',
        rays: 'rgba(255, 255, 255, 0.09)',
        tagBorder: '#FACC15',
        tagTopText: '#FACC15',
        holeColor: '#B91C1C',
        decoration: 'bag',
        bagLight: '#3F3F46',
        bagBody: '#0A0A0A',
        bagShade: '#000000',
        bagHandle: '#FACC15',
        ctaIcon: '#B91C1C',
        tileBg: 'rgba(0, 0, 0, 0.25)',
        tileBorder: 'rgba(255, 255, 255, 0.25)'
    },
    neon: {
        label: 'Cyber Neon',
        icon: '⚡',
        Scene: NeonScene,
        fallbackBg: '#07071F',
        neon: true,
        neonA: '#22D3EE',
        neonB: '#E879F9',
        sparkle: '#A5F3FC',
        gridX: 'rgba(232, 121, 249, 0.35)',
        gridY: 'rgba(34, 211, 238, 0.30)',
        tagBorder: '#22D3EE',
        tagTopText: '#22D3EE',
        tagGlow: 'rgba(34, 211, 238, 0.7)',
        holeColor: '#22D3EE',
        decoration: 'cart',
        ctaIcon: '#07071F',
        tileBg: 'rgba(34, 211, 238, 0.06)',
        tileBorder: 'rgba(34, 211, 238, 0.5)',
        tileGlow: '0 0 12px rgba(34, 211, 238, 0.25), inset 0 0 10px rgba(232, 121, 249, 0.12)'
    }
};

const Backdrop = ({ scene, sceneWidth, showSceneArt, isMobile }) => {
    const SceneArt = scene.Scene;
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {scene.rays && <Sunburst color={scene.rays} centerX={sceneWidth * 0.45} size={sceneWidth * 3.2} />}
            {scene.gridX && <NeonGrid lineX={scene.gridX} lineY={scene.gridY} />}
            {scene.sheen && <Sheen color={scene.sheen} />}
            <SparkleField color={scene.sparkle} count={isMobile ? 8 : 16} />
            <div className="absolute left-0 top-0 bottom-0" style={{ width: sceneWidth, opacity: showSceneArt ? 1 : 0.45 }}>
                <SceneArt scene={scene} />
            </div>
        </div>
    );
};

const TAG_SHAPE = 'polygon(16% 0, 100% 0, 100% 100%, 16% 100%, 0 50%)';

/** Hanging price tag. */
const Badge = ({ config, scene, width, displayClass }) => {
    const border = Math.max(2, width * 0.016);
    const shadow = `drop-shadow(0 ${width * 0.04}px ${width * 0.06}px rgba(0, 0, 0, 0.45))`;
    return (
        <div
            className="relative shrink-0 wb-season-anim"
            style={{
                animation: 'wb-bf-tag 3.2s ease-in-out infinite',
                transformOrigin: '8% 50%',
                filter: scene.tagGlow ? `${shadow} drop-shadow(0 0 ${width * 0.04}px ${scene.tagGlow})` : shadow
            }}
        >
            <div style={{ clipPath: TAG_SHAPE, backgroundColor: scene.tagBorder, padding: border, minWidth: width }}>
                <div
                    className="relative flex flex-col items-center justify-center"
                    style={{
                        clipPath: TAG_SHAPE,
                        backgroundColor: config.badgeBgColor,
                        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.12))',
                        minHeight: width * 0.4,
                        padding: `${width * 0.04}px ${width * 0.08}px ${width * 0.04}px ${width * 0.22}px`
                    }}
                >
                    <span
                        className="absolute rounded-full"
                        style={{
                            left: width * 0.075,
                            top: '50%',
                            width: width * 0.06,
                            height: width * 0.06,
                            marginTop: -width * 0.03,
                            backgroundColor: scene.holeColor,
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
                        }}
                    />
                    {config.badgeTopText && (
                        <span className={displayClass} style={{ fontSize: width * 0.09, color: scene.tagTopText, lineHeight: 1.1, letterSpacing: '0.14em' }}>
                            {config.badgeTopText}
                        </span>
                    )}
                    <span className={`${displayClass} whitespace-nowrap`} style={{ fontSize: width * 0.2, color: config.badgeTextColor, lineHeight: 1 }}>
                        {config.bogoText}
                    </span>
                </div>
            </div>
        </div>
    );
};

const Decoration = ({ scene, width }) => (
    scene.decoration === 'cart'
        ? <NeonCart scene={scene} width={width} />
        : <ShoppingBagIllustration scene={scene} width={width * 0.92} />
);

const CtaIcon = ({ scene, size }) => <ShoppingBag size={size * 0.9} strokeWidth={2.4} color={scene.ctaIcon} />;

export const blackFridayPack = {
    id: 'blackfriday',
    label: 'Black Friday',
    displayClass: 'wb-bf-display',
    timerStyle: 'tiles',
    scenes: SCENES,
    defaultScene: 'bags',
    headlineShadow: (scene, offset) => (scene.neon ? 'none' : `0 ${offset}px 0 rgba(0, 0, 0, 0.35)`),
    highlightStyle: (color, scene) => ({
        color,
        textShadow: scene.neon ? `0 0 10px ${color}, 0 0 24px ${color}` : 'none'
    }),
    Backdrop,
    Badge,
    Decoration,
    CtaIcon
};
