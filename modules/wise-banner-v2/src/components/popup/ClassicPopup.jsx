import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
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

const CLASSIC_ANIMATIONS = { ...CTA_ANIMATION_CLASSES, glow: 'animate-glow-pulse' };

/** Popup card for the basic templates: the banner's colors in a centered, stacked layout. */
const ClassicPopup = ({ config: c, isPro, isMobileMode = false, isPreview = false, onTrack, onClose, effectLayer = null, showBranding = false, titleId }) => {
    const { timeLeft, expired } = usePopupCountdown(c);
    const { copied, copy } = useCopyCode(c.couponCode, { isPreview, onCopied: () => onTrack && onTrack('copy') });
    const cta = useCtaAction({ config: c, isPreview, onTrack, onClose, copy });

    const headlineSize = parseInt(c.headlineSize, 10) || 30;
    const subSize = parseInt(c.subHeadlineSize, 10) || 15;
    const highlightColor = c.highlightColor || '#FCD34D';
    const ctaAnimation = isPro ? (c.ctaAnimation || 'none') : 'none';
    // An ended countdown would only show zeros, so it is hidden instead.
    const showTimer = c.showTimer && !(expired && !c.enableRecursion && !isPreview);

    return (
        <div
            className="relative overflow-hidden text-center"
            style={{
                ...getBackgroundStyle(c),
                borderRadius: isMobileMode ? 20 : 24,
                boxShadow: '0 30px 80px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                color: c.headlineColor
            }}
        >
            {effectLayer}
            {/* Soft light from the top keeps flat colors from looking dull. */}
            <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{ background: 'radial-gradient(120% 70% at 50% 0%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 60%)' }}
            />

            <div
                className="relative z-10 flex flex-col items-center"
                style={{ padding: isMobileMode ? '40px 22px 20px' : '48px 40px 22px' }}
            >
                {c.showBogoBadge && (
                    <div className="mb-5">
                        {c.badgeType === 'image' && c.badgeImage ? (
                            <img src={c.badgeImage} alt="" className="object-contain drop-shadow-xl" style={{ width: isMobileMode ? 64 : 76, height: 'auto' }} />
                        ) : (
                            <span
                                className="inline-flex items-center justify-center font-black rounded-full shadow-xl"
                                style={{
                                    minWidth: isMobileMode ? 64 : 76,
                                    height: isMobileMode ? 64 : 76,
                                    padding: '0 10px',
                                    fontSize: isMobileMode ? 15 : 17,
                                    lineHeight: 1,
                                    letterSpacing: '-0.02em',
                                    backgroundColor: c.badgeBgColor,
                                    color: c.badgeTextColor,
                                    border: '3px solid rgba(255,255,255,0.25)',
                                    transform: `rotate(${c.badgeRotation || '-12deg'})`
                                }}
                            >
                                {c.bogoText}
                            </span>
                        )}
                    </div>
                )}

                <div
                    id={titleId}
                    style={{
                        color: c.headlineColor,
                        fontSize: isMobileMode ? Math.min(headlineSize, 26) : headlineSize,
                        fontWeight: c.headlineWeight || 900,
                        lineHeight: 1.12,
                        letterSpacing: '-0.025em',
                        textWrap: 'balance',
                        maxWidth: '100%'
                    }}
                >
                    {c.headline}
                    {c.headlineHighlight && (
                        <span className="block" style={{ color: highlightColor }}>{c.headlineHighlight}</span>
                    )}
                </div>

                {c.showSubHeadline && c.subHeadline && (
                    <div
                        style={{
                            color: c.subHeadlineColor,
                            fontSize: isMobileMode ? Math.min(subSize, 14) : subSize,
                            fontWeight: c.subHeadlineWeight || 500,
                            lineHeight: 1.5,
                            marginTop: 12,
                            opacity: 0.92,
                            maxWidth: 340,
                            textWrap: 'pretty'
                        }}
                    >
                        {c.subHeadline}
                    </div>
                )}

                {c.showCouponCode && c.couponCode && (
                    <div className="w-full flex justify-center" style={{ marginTop: 24 }}>
                        <CouponTicket
                            code={c.couponCode}
                            copied={copied}
                            onCopy={copy}
                            textColor={c.headlineColor}
                            codeColor={highlightColor}
                            isMobileMode={isMobileMode}
                        />
                    </div>
                )}

                {showTimer && (
                    <div className="flex flex-col items-center" style={{ marginTop: 22, gap: 8 }}>
                        {c.timerLabel && (
                            <span style={{ color: c.timerTextColor, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.75 }}>
                                {c.timerLabel}
                            </span>
                        )}
                        <div className="flex items-start" style={{ gap: isMobileMode ? 6 : 8, color: c.timerTextColor }}>
                            {timerUnits(c, timeLeft).map((unit, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center"
                                    style={{
                                        minWidth: isMobileMode ? 54 : 60,
                                        padding: '9px 4px 7px',
                                        borderRadius: 12,
                                        backgroundColor: c.timerBgColor,
                                        border: `1px solid color-mix(in srgb, ${c.timerTextColor} 16%, transparent)`
                                    }}
                                >
                                    <span style={{ fontSize: isMobileMode ? 20 : 22, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                                        {unit.value}
                                    </span>
                                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 5, opacity: 0.7 }}>
                                        {unit.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {c.showCTA && (
                    <a
                        href={c.ctaUrl || '#'}
                        onClick={cta.onClick}
                        className={`w-full flex items-center justify-center gap-2 no-underline cursor-pointer transition-all hover:brightness-105 active:scale-[0.98] ${CLASSIC_ANIMATIONS[ctaAnimation] || ''}`}
                        style={{
                            maxWidth: 320,
                            marginTop: 24,
                            height: isMobileMode ? 50 : 54,
                            padding: '0 22px',
                            backgroundColor: c.ctaBg,
                            color: c.ctaTextColor,
                            borderRadius: c.ctaRadius,
                            fontSize: 15,
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            textDecoration: 'none',
                            boxShadow: '0 12px 28px rgba(2, 6, 23, 0.28)'
                        }}
                    >
                        {cta.done ? (
                            <>
                                <Check size={17} strokeWidth={3} />
                                <span>Code copied!</span>
                            </>
                        ) : (
                            <>
                                <span className="truncate">{c.ctaText}</span>
                                <ArrowRight size={17} strokeWidth={2.5} className="shrink-0" />
                            </>
                        )}
                    </a>
                )}

                {c.showDecline !== false && c.declineText && (
                    <div style={{ marginTop: 16 }}>
                        <DeclineLink text={c.declineText} color={c.headlineColor} onClick={() => !isPreview && onClose && onClose('decline')} />
                    </div>
                )}

                {showBranding && (
                    <div style={{ marginTop: 16 }}>
                        <Branding color={c.headlineColor} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassicPopup;
