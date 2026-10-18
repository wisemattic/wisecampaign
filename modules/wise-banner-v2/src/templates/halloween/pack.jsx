import React from 'react';
import {
    CastleScene,
    GraveyardScene,
    WebScene,
    FlyingBat,
    Moon,
    StarField,
    WitchPumpkin,
    JackIcon
} from './HalloweenArt';

const SCENES = {
    castle: {
        label: 'Haunted Castle',
        icon: '🏰',
        Scene: CastleScene,
        fallbackBg: '#2B1270',
        moonLight: '#F6EAD3',
        moonShade: '#B9A5E4',
        moonGlow: 'rgba(214, 196, 255, 0.35)',
        silhouette: '#170C3E',
        windows: '#FFC94A',
        hill: '#4C35AC',
        fog: 'rgba(186, 166, 255, 0.30)',
        star: '#FFFFFF',
        bat: '#1A0F3D',
        hatColor: '#2A1A63',
        bandColor: '#7C3AED'
    },
    graveyard: {
        label: 'Spooky Graveyard',
        icon: '🪦',
        Scene: GraveyardScene,
        fallbackBg: '#160A06',
        moonLight: '#FFEBC2',
        moonShade: '#F2A04E',
        moonGlow: 'rgba(255, 150, 40, 0.28)',
        silhouette: '#080302',
        windows: '#FFB547',
        hill: '#4A200B',
        fog: 'rgba(255, 120, 30, 0.16)',
        star: '#FFE8C2',
        bat: '#0B0503',
        hat: false
    },
    web: {
        label: "Witch's Lair",
        icon: '🕸️',
        Scene: WebScene,
        fallbackBg: '#06201A',
        moonLight: '#FBFFF2',
        moonShade: '#C7EE8A',
        moonGlow: 'rgba(190, 242, 100, 0.20)',
        silhouette: '#020B07',
        windows: '#A3E635',
        hill: '#14503B',
        fog: 'rgba(163, 230, 53, 0.12)',
        star: '#ECFCCB',
        bat: '#020B07',
        webColor: 'rgba(236, 252, 203, 0.45)',
        hatColor: '#3B1F6E',
        bandColor: '#84CC16'
    }
};

const Backdrop = ({ scene, sceneWidth, showSceneArt, isMobile, px }) => {
    const SceneArt = scene.Scene;
    const moonSize = sceneWidth * 0.5;
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <StarField color={scene.star} count={isMobile ? 10 : 18} />
            <div className="absolute left-0 top-0 bottom-0" style={{ width: sceneWidth, opacity: showSceneArt ? 1 : 0.5 }}>
                <Moon
                    size={moonSize}
                    light={scene.moonLight}
                    shade={scene.moonShade}
                    glow={scene.moonGlow}
                    style={{ left: sceneWidth * 0.44, top: -moonSize * 0.4 }}
                />
                <div className="absolute inset-0">
                    <SceneArt silhouette={scene.silhouette} windows={scene.windows} hill={scene.hill} webColor={scene.webColor} />
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-0" style={{ height: '55%', background: `linear-gradient(180deg, transparent, ${scene.fog})` }} />
            <FlyingBat color={scene.bat} size={isMobile ? 18 : px(30, 18)} top="3%" duration={18} />
            {!isMobile && <FlyingBat color={scene.bat} size={px(20, 14)} top="60%" duration={26} delay={8} />}
        </div>
    );
};

/** Swinging wooden sign. */
const Badge = ({ config, width, displayClass }) => {
    const outline = '#5A3112';
    return (
        <div className="relative shrink-0 wb-season-anim" style={{ animation: 'wb-hw-swing 3.4s ease-in-out infinite', transformOrigin: '50% 12%' }}>
            <div
                className="relative flex flex-col items-center justify-center"
                style={{
                    minWidth: width,
                    padding: `${width * 0.05}px ${width * 0.09}px ${width * 0.06}px`,
                    backgroundColor: config.badgeBgColor,
                    backgroundImage: 'repeating-linear-gradient(176deg, rgba(0,0,0,0.07) 0 2px, transparent 2px 10px), linear-gradient(180deg, rgba(255,255,255,0.20), rgba(0,0,0,0.14))',
                    border: `${Math.max(2, width * 0.018)}px solid #4A260C`,
                    borderRadius: width * 0.07,
                    boxShadow: `inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -3px 0 rgba(0,0,0,0.18), 0 ${width * 0.03}px 0 #3A1D08, 0 ${width * 0.07}px ${width * 0.1}px rgba(0,0,0,0.35)`
                }}
            >
                {['left', 'right'].map((side) => (
                    <span
                        key={side}
                        className="absolute rounded-full"
                        style={{
                            top: width * 0.06,
                            [side]: width * 0.05,
                            width: width * 0.04,
                            height: width * 0.04,
                            backgroundColor: '#3B2210',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)'
                        }}
                    />
                ))}
                {config.badgeTopText && (
                    <span className={displayClass} style={{ fontSize: width * 0.085, color: '#4A260C', lineHeight: 1.1, letterSpacing: '0.08em' }}>
                        {config.badgeTopText}
                    </span>
                )}
                <span
                    className={`${displayClass} whitespace-nowrap`}
                    style={{
                        fontSize: width * 0.215,
                        color: config.badgeTextColor,
                        lineHeight: 1,
                        marginTop: width * 0.01,
                        textShadow: `2px 2px 0 ${outline}, -1px -1px 0 ${outline}, 1px -1px 0 ${outline}, -1px 1px 0 ${outline}, 0 ${width * 0.025}px 0 ${outline}`
                    }}
                >
                    {config.bogoText}
                </span>
            </div>
        </div>
    );
};

const Decoration = ({ scene, width }) => (
    <WitchPumpkin hat={scene.hat !== false} hatColor={scene.hatColor} bandColor={scene.bandColor} width={width} />
);

const CtaIcon = ({ size }) => <JackIcon size={size} />;

export const halloweenPack = {
    id: 'halloween',
    label: 'Halloween',
    displayClass: 'wb-hw-display',
    timerStyle: 'plain',
    scenes: SCENES,
    defaultScene: 'castle',
    headlineShadow: (scene, offset) => `0 ${offset}px 0 rgba(20, 8, 60, 0.45)`,
    Backdrop,
    Badge,
    Decoration,
    CtaIcon
};
