import React from 'react';
import { Gift } from 'lucide-react';
import { Snowfall, Garland, VillageScene, TreeScene, SleighScene, Snowman, Bauble } from './ChristmasArt';

const SCENES = {
    village: {
        label: 'Snowy Village',
        icon: '🏘️',
        Scene: VillageScene,
        fallbackBg: '#0B1E3F',
        snow: '#F1F5FF',
        snowShade: '#C7D7F0',
        snowflake: '#FFFFFF',
        pine: '#0F3B2E',
        house: '#7C2D12',
        roof: '#3F1D0B',
        door: '#3F1D0B',
        windows: '#FFD166',
        lights: ['#F87171', '#FDE047', '#4ADE80', '#60A5FA'],
        trim: '#FDE68A',
        hat: '#111827',
        scarf: '#DC2626',
        ctaIcon: '#B91C1C',
        tileBg: 'rgba(255, 255, 255, 0.10)',
        tileBorder: 'rgba(255, 255, 255, 0.28)'
    },
    tree: {
        label: 'Christmas Tree',
        icon: '🎄',
        Scene: TreeScene,
        fallbackBg: '#7F1D1D',
        snowflake: '#FFE4E6',
        pine: '#14532D',
        pineLight: '#22A05A',
        star: '#FCD34D',
        ornaments: ['#FDE047', '#60A5FA', '#F9FAFB'],
        gifts: ['#FCD34D', '#16A34A', '#F9FAFB'],
        ribbon: '#B91C1C',
        lights: ['#FDE047', '#FFFFFF', '#4ADE80'],
        trim: '#FCD34D',
        hat: '#111827',
        scarf: '#16A34A',
        ctaIcon: '#B91C1C',
        tileBg: 'rgba(0, 0, 0, 0.18)',
        tileBorder: 'rgba(252, 211, 77, 0.45)'
    },
    sleigh: {
        label: "Santa's Sleigh",
        icon: '🛷',
        Scene: SleighScene,
        fallbackBg: '#052E2B',
        moon: '#FDF6E3',
        moonGlow: 'rgba(253, 246, 227, 0.55)',
        silhouette: '#04201D',
        forest: '#031A17',
        snow: '#E6F4EF',
        snowflake: '#FFFFFF',
        lights: ['#F87171', '#FDE047', '#FFFFFF'],
        trim: '#F5C542',
        hat: '#111827',
        scarf: '#DC2626',
        ctaIcon: '#065F46',
        tileBg: 'rgba(255, 255, 255, 0.08)',
        tileBorder: 'rgba(245, 197, 66, 0.4)'
    }
};

const Backdrop = ({ scene, sceneWidth, showSceneArt, isMobile }) => {
    const SceneArt = scene.Scene;
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <Snowfall color={scene.snowflake} count={isMobile ? 10 : 18} />
            <Garland colors={scene.lights} count={isMobile ? 9 : 18} />
            <div className="absolute left-0 top-0 bottom-0" style={{ width: sceneWidth, opacity: showSceneArt ? 1 : 0.45 }}>
                <SceneArt scene={scene} />
            </div>
        </div>
    );
};

/** A swinging glass bauble; the first word of the badge text is set large ("50%"), the rest below. */
const Badge = ({ config, scene, width, displayClass, stacked }) => {
    const size = stacked ? width * 0.62 : Math.max(44, width * 0.5);
    const [lead, ...rest] = String(config.bogoText || '').split(' ');
    return (
        <div className="relative shrink-0 wb-season-anim" style={{ width: size, animation: 'wb-hw-swing 3.6s ease-in-out infinite', transformOrigin: '50% 0%' }}>
            <Bauble size={size} fill={config.badgeBgColor} trim={scene.trim} />
            <div
                className="absolute left-0 flex flex-col items-center justify-center text-center"
                style={{ top: size * 0.21, width: size, height: size * 0.94, color: config.badgeTextColor }}
            >
                {config.badgeTopText && (
                    <span style={{ fontSize: size * 0.1, fontWeight: 800, letterSpacing: '0.14em', lineHeight: 1.1 }}>{config.badgeTopText}</span>
                )}
                <span className={displayClass} style={{ fontSize: size * (lead.length > 4 ? 0.2 : 0.26), lineHeight: 1 }}>{lead}</span>
                {rest.length > 0 && (
                    <span className={displayClass} style={{ fontSize: size * 0.13, lineHeight: 1.1, letterSpacing: '0.06em' }}>{rest.join(' ')}</span>
                )}
            </div>
        </div>
    );
};

const Decoration = ({ scene, width }) => <Snowman scene={scene} width={width * 0.9} />;

const CtaIcon = ({ scene, size }) => <Gift size={size * 0.85} strokeWidth={2.4} color={scene.ctaIcon} />;

export const christmasPack = {
    id: 'christmas',
    label: 'Christmas',
    // Shares the rounded display font with the Halloween pack.
    displayClass: 'wb-hw-display',
    timerStyle: 'tiles',
    scenes: SCENES,
    defaultScene: 'village',
    headlineShadow: (scene, offset) => `0 ${offset}px 0 rgba(0, 0, 0, 0.28)`,
    Backdrop,
    Badge,
    Decoration,
    CtaIcon
};
