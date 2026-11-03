import React from 'react';
import { Check } from 'lucide-react';
import { SEASONAL_PACKS } from '../../templates/seasonal/packs';
import {
    CTA_ANIMATION_CLASSES,
    getBackgroundStyle,
    usePopupCountdown,
    timerUnits,
    useCopyCode,
    useCtaAction,
    CouponTicket,
    DeclineLink,
    Branding
} from './parts';

// Popup widths the artwork is laid out for (the mobile card fills the phone instead).
export const SEASONAL_POPUP_WIDTH = 480;
const MOBILE_CARD_WIDTH = 343;
// The scene artwork is drawn on a 340x110 canvas.
const SCENE_RATIO = 110 / 340;

/**
 * Popup card for the seasonal templates. It reuses the template pack's own artwork:
 * the scene, offer badge, decoration, display font and button icon, so the popup
 * matches its banner. The scene fills an illustrated header above the offer.
 */
const SeasonalPopup = ({ config, isPro, isMobileMode = false, isPreview = false, onTrack, onClose, effectLayer = null, showBranding = false, titleId }) => {
    const pack = SEASONAL_PACKS[config.layout] || SEASONAL_PACKS.halloween;
    const scene = pack.scenes[config.scene || config.hwScene] || pack.scenes[pack.defaultScene];
    const { Backdrop, Badge, Decoration, CtaIcon } = pack;

    const { timeLeft, expired } = usePopupCountdown(config);
    const { copied, copy } = useCopyCode(config.couponCode, { isPreview, onCopied: () => onTrack && onTrack('copy') });
    const cta = useCtaAction({ config, isPreview, onTrack, onClose, copy });

    const cardWidth = isMobileMode ? MOBILE_CARD_WIDTH : SEASONAL_POPUP_WIDTH;
    const scale = isMobileMode ? 0.72 : 0.9;
    const px = (value, min = 0) => Math.round(Math.max(min, value * scale));

    const hasSign = config.showBogoBadge;
    const signWidth = isMobileMode ? 112 : 150;
    // The scene sits on the left of the header, the offer badge on the right.
    const sceneWidth = Math.round(cardWidth * (hasSign ? (isMobileMode ? 0.5 : 0.54) : 1));
    const heroHeight = Math.max(isMobileMode ? 128 : 160, Math.round(sceneWidth * SCENE_RATIO) + (isMobileMode ? 28 : 40));

    const headlineSize = parseInt(config.headlineSize, 10) || 38;
    const subSize = parseInt(config.subHeadlineSize, 10) || 17;
    const highlightColor = config.highlightColor || '#FFD43B';
    const ctaAnimation = isPro ? (config.ctaAnimation || 'none') : 'none';
    const showTimer = config.showTimer && !(expired && !config.enableRecursion && !isPreview);
    const isTiles = pack.timerStyle === 'tiles';

    const sign = hasSign && (
        config.badgeType === 'image' && config.badgeImage
            ? <img src={config.badgeImage} alt="" className="object-contain shrink-0" style={{ width: signWidth, height: 'auto' }} />
            : <Badge config={config} scene={scene} width={signWidth} displayClass={pack.displayClass} stacked />
    );

    /* ---------- Countdown ---------- */
    const digitSize = isMobileMode ? 24 : 30;
    const timer = showTimer && (
        <div className="flex items-center justify-center" style={{ color: config.timerTextColor, gap: isTiles ? 8 : 0 }}>
            {timerUnits(config, timeLeft).map((unit, i) => (
                <React.Fragment key={i}>
                    {i > 0 && !isTiles && (
                        <span className="shrink-0" style={{ width: 1, height: isMobileMode ? 30 : 36, backgroundColor: config.timerTextColor, opacity: 0.25 }} />
                    )}
                    <div
                        className="flex flex-col items-center"
                        style={isTiles ? {
                            minWidth: isMobileMode ? 56 : 64,
                            padding: '9px 4px 7px',
                            borderRadius: 10,
                            backgroundColor: scene.tileBg || 'rgba(255, 255, 255, 0.08)',
                            border: `1px solid ${scene.tileBorder || 'rgba(255, 255, 255, 0.18)'}`,
                            boxShadow: scene.tileGlow || 'none'
                        } : { minWidth: isMobileMode ? 58 : 70 }}
                    >
                        <span style={{ fontSize: digitSize, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                            {unit.value}
                        </span>
                        <span
                            style={{
                                fontSize: isTiles ? 10 : 12,
                                fontWeight: isTiles ? 700 : 500,
                                lineHeight: 1.2,
                                marginTop: 5,
                                opacity: 0.85,
                                textTransform: isTiles ? 'uppercase' : 'none',
                                letterSpacing: isTiles ? '0.1em' : 'normal'
                            }}
                        >
                            {unit.label}
                        </span>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );

    /* ---------- Call to action ---------- */
    const ctaHeight = isMobileMode ? 50 : 56;
    const ctaButton = config.showCTA && (
        <a
            href={config.ctaUrl || '#'}
            onClick={cta.onClick}
            className={`relative w-full inline-flex items-center justify-between no-underline whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98] ${CTA_ANIMATION_CLASSES[ctaAnimation] || ''}`}
            style={{
                maxWidth: 330,
                height: ctaHeight,
                paddingLeft: ctaHeight * 0.5,
                paddingRight: ctaHeight * 0.12,
                gap: 12,
                backgroundColor: config.ctaBg,
                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.08) 100%)',
                color: config.ctaTextColor,
                borderRadius: config.ctaRadius,
                fontSize: isMobileMode ? 17 : 18,
                fontWeight: 800,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                boxShadow: '0 0 0 5px rgba(0, 0, 0, 0.12), 0 10px 24px rgba(0, 0, 0, 0.3)',
                '--wb-season-glow': config.ctaBg,
                animation: ctaAnimation === 'glow' ? 'wb-season-glow 2.2s ease-in-out infinite' : undefined
            }}
        >
            <span className="truncate">{cta.done ? 'Code copied!' : config.ctaText}</span>
            <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: ctaHeight * 0.76, height: ctaHeight * 0.76, backgroundColor: '#FFFFFF' }}>
                {cta.done ? <Check size={ctaHeight * 0.4} strokeWidth={3} color="#16A34A" /> : <CtaIcon scene={scene} size={ctaHeight * 0.5} />}
            </span>
        </a>
    );

    return (
        <div
            className="relative overflow-hidden text-center wb-season-banner"
            style={{
                ...getBackgroundStyle(config, scene.fallbackBg || '#111827'),
                borderRadius: isMobileMode ? 20 : 24,
                boxShadow: '0 30px 80px rgba(2, 6, 23, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
            }}
        >
            {effectLayer}

            {/* Illustrated header: the template's scene with its offer badge. */}
            <div className="relative" style={{ height: heroHeight }}>
                <Backdrop scene={scene} sceneWidth={sceneWidth} showSceneArt isMobile={isMobileMode} px={px} />
                {(sign || Decoration) && (
                    // Kept clear of the close button in the top-right corner, since tall badges reach it.
                    <div className="absolute top-0 bottom-0 flex items-center z-10" style={{ right: isMobileMode ? 46 : 52 }}>
                        {!isMobileMode && Decoration && (
                            <div className="shrink-0 relative z-0" style={{ alignSelf: 'flex-end', marginBottom: 6, marginRight: sign ? -12 : 0 }}>
                                <Decoration scene={scene} width={hasSign ? 70 : 96} />
                            </div>
                        )}
                        {sign && <div className="relative z-10" style={{ marginTop: isMobileMode ? 10 : 14 }}>{sign}</div>}
                    </div>
                )}
                {/* Fade the header into the card so the offer reads on a calm background (dark scenes only: on a light one it looks like a grey band). */}
                {!scene.lightBg && (
                    <div
                        className="absolute inset-x-0 bottom-0 pointer-events-none"
                        aria-hidden="true"
                        style={{ height: 36, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)' }}
                    />
                )}
            </div>

            <div
                className="relative z-10 flex flex-col items-center"
                style={{ padding: isMobileMode ? '18px 22px 20px' : '22px 36px 22px', gap: 0 }}
            >
                {config.showSubHeadline && config.subHeadline && (
                    <span style={{ color: config.subHeadlineColor, fontSize: isMobileMode ? Math.min(subSize, 15) : subSize, fontWeight: 700, lineHeight: 1.2 }}>
                        {config.subHeadline}
                    </span>
                )}

                <div
                    id={titleId}
                    className={pack.displayClass}
                    style={{
                        color: config.headlineColor,
                        fontSize: isMobileMode ? Math.min(headlineSize, 30) : headlineSize,
                        lineHeight: 1.06,
                        marginTop: 8,
                        textWrap: 'balance',
                        maxWidth: '100%',
                        textShadow: pack.headlineShadow ? pack.headlineShadow(scene, 3) : 'none'
                    }}
                >
                    {config.headline}
                    {config.headlineHighlight && (
                        <span className="block" style={pack.highlightStyle ? pack.highlightStyle(highlightColor, scene) : { color: highlightColor }}>
                            {config.headlineHighlight}
                        </span>
                    )}
                </div>

                {config.showCouponCode && config.couponCode && (
                    <div className="w-full flex justify-center" style={{ marginTop: 20 }}>
                        <CouponTicket
                            code={config.couponCode}
                            copied={copied}
                            onCopy={copy}
                            textColor={config.headlineColor}
                            codeColor={highlightColor}
                            isMobileMode={isMobileMode}
                        />
                    </div>
                )}

                {timer && <div style={{ marginTop: 20 }}>{timer}</div>}

                {ctaButton && <div className="w-full flex justify-center" style={{ marginTop: 22 }}>{ctaButton}</div>}

                {config.showDecline !== false && config.declineText && (
                    <div style={{ marginTop: 16 }}>
                        <DeclineLink text={config.declineText} color={config.headlineColor} onClick={() => !isPreview && onClose && onClose('decline')} />
                    </div>
                )}

                {showBranding && (
                    <div style={{ marginTop: 14 }}>
                        <Branding color={config.headlineColor} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeasonalPopup;
