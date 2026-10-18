import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { getTimeLeft } from '../../utils/countdown';
import { copyText } from '../../utils/clipboard';
import { SEASONAL_PACKS } from './packs';

/*
 * Shared layout for seasonal templates (Halloween, Black Friday, New Year...).
 * The layout, sizing, timer, headline, coupon and CTA live here; each pack in
 * ./packs supplies its own artwork, badge, decoration, CTA icon and font.
 */

const CTA_ANIMATION_CLASSES = {
    pulse: 'animate-pulse-subtle',
    shake: 'animate-shake-subtle',
    bounce: 'animate-bounce-btn',
    heartbeat: 'animate-heartbeat',
    shimmer: 'relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent'
};

// Inline resets so theme button styles can't leak into the close button.
const BUTTON_RESET = {
    background: 'transparent',
    border: 0,
    padding: 0,
    margin: 0,
    boxShadow: 'none',
    minWidth: 0,
    minHeight: 0,
    lineHeight: 0
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * The layout adapts to the banner's own width (not the viewport), so it renders
 * the same in the storefront, the editor preview and the template gallery.
 * All sizes are authored against a 1920px wide banner and scaled by `s`.
 */
const getLayout = (width, isMobileMode) => {
    if (isMobileMode || width < 640) return { tier: 'mobile', s: 1 };
    if (width < 1000) return { tier: 'compact', s: clamp(width / 1150, 0.56, 0.8) };
    if (width < 1280) return { tier: 'mid', s: clamp(width / 1500, 0.66, 0.85) };
    return { tier: 'full', s: clamp(width / 1920, 0.66, 1) };
};

const MIN_HEADLINE_FIT = 0.7;

/**
 * Shrinks a single-line headline (down to MIN_HEADLINE_FIT) so it fits the space
 * left between the timer/sign and the button. Returns the font scale to apply.
 */
const useHeadlineFit = (ref, enabled, deps) => {
    const [fit, setFit] = useState(1);

    useLayoutEffect(() => {
        if (!enabled) {
            setFit(1);
            return undefined;
        }
        const el = ref.current;
        if (!el || !el.parentElement) return undefined;

        const measure = () => {
            // Measure the unwrapped width even if the headline is currently wrapping.
            const { whiteSpace, textWrap } = el.style;
            el.style.whiteSpace = 'nowrap';
            el.style.textWrap = 'nowrap';
            const renderedWidth = el.scrollWidth;
            el.style.whiteSpace = whiteSpace;
            el.style.textWrap = textWrap;
            const available = el.parentElement.clientWidth;

            setFit((current) => {
                const natural = renderedWidth / current;
                if (!natural || !available) return current;
                const next = clamp(available / natural, MIN_HEADLINE_FIT, 1);
                return Math.abs(next - current) > 0.01 ? next : current;
            });
        };
        measure();

        // Re-measure once the display font has loaded, since it changes the text width.
        let cancelled = false;
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => !cancelled && measure());
        }
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, ...deps]);

    return fit;
};

const useElementWidth = (ref) => {
    const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return undefined;

        const update = () => setWidth(el.offsetWidth);
        update();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', update);
            return () => window.removeEventListener('resize', update);
        }

        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);

    return width;
};

const useCountdown = ({ endDate, endTime, enableRecursion, recurrenceAmount, recurrenceUnit }) => {
    const options = { endDate, endTime, enableRecursion, recurrenceAmount, recurrenceUnit };
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(options));

    useEffect(() => {
        setTimeLeft(getTimeLeft(options));
        const timer = setInterval(() => setTimeLeft(getTimeLeft(options)), 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endDate, endTime, enableRecursion, recurrenceAmount, recurrenceUnit]);

    return timeLeft;
};

const SeasonalBanner = ({ config, isPro, isMobileMode = false, isPreview = false, onClose, onTrack, effectLayer = null, showBranding = false }) => {
    const rootRef = useRef(null);
    const headlineRef = useRef(null);
    const [couponCopied, setCouponCopied] = useState(false);
    const width = useElementWidth(rootRef);
    const timeLeft = useCountdown(config);
    const { tier, s } = getLayout(width, isMobileMode);
    const pack = SEASONAL_PACKS[config.layout] || SEASONAL_PACKS.halloween;
    // `hwScene` was the key before more seasonal packs existed.
    const scene = pack.scenes[config.scene || config.hwScene] || pack.scenes[pack.defaultScene];
    const { Backdrop, Badge, Decoration, CtaIcon } = pack;

    const isMobile = tier === 'mobile';
    const isCompact = tier === 'compact';
    const isStacked = isMobile || isCompact;
    const px = (value, min = 0) => Math.round(Math.max(min, value * s));
    const showSceneArt = tier === 'full';

    const headlineBase = parseInt(config.headlineSize) || 34;
    const subHeadlineBase = parseInt(config.subHeadlineSize) || 22;
    const highlightColor = config.highlightColor || '#FFD43B';

    const background = {
        backgroundColor: config.bgType === 'solid' ? config.bgSolid : (scene.fallbackBg || '#111827'),
        backgroundImage: config.bgType === 'gradient'
            ? config.bgGradient
            : (config.bgType === 'image' && config.bgImage ? `url(${config.bgImage})` : undefined),
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };

    /* ---------- Themed background art ---------- */
    const sceneWidth = isMobile ? 150 : px(340);
    const sceneLayer = <Backdrop scene={scene} sceneWidth={sceneWidth} showSceneArt={showSceneArt} isMobile={isMobile} px={px} />;

    /* ---------- Countdown ---------- */
    const timerUnits = [
        { value: timeLeft.days, label: config.daysLabel },
        { value: timeLeft.hrs, label: config.hoursLabel },
        { value: timeLeft.min, label: config.minutesLabel },
        { value: timeLeft.sec, label: config.secondsLabel }
    ];
    const isTiles = pack.timerStyle === 'tiles';
    const digitSize = isMobile ? 20 : px(isTiles ? 36 : 42, 18);
    const unitLabelSize = isMobile ? 10 : px(isTiles ? 12 : 17, 9);

    const timer = config.showTimer && (
        <div className="flex items-center shrink-0" style={{ color: config.timerTextColor, gap: isTiles ? (isMobile ? 6 : px(10, 5)) : 0 }}>
            {timerUnits.map((unit, i) => (
                <React.Fragment key={i}>
                    {i > 0 && !isTiles && (
                        <span
                            className="shrink-0"
                            style={{ width: 1, height: isMobile ? 30 : px(60, 28), backgroundColor: config.timerTextColor, opacity: 0.25 }}
                        />
                    )}
                    <div
                        className="flex flex-col items-center"
                        style={isTiles ? {
                            minWidth: isMobile ? 44 : px(72, 40),
                            padding: isMobile ? '6px 4px 5px' : `${px(10, 5)}px ${px(6, 3)}px ${px(8, 4)}px`,
                            borderRadius: isMobile ? 8 : px(10, 6),
                            backgroundColor: scene.tileBg || 'rgba(255, 255, 255, 0.08)',
                            border: `1px solid ${scene.tileBorder || 'rgba(255, 255, 255, 0.18)'}`,
                            boxShadow: scene.tileGlow || 'none'
                        } : { minWidth: isMobile ? 42 : px(78, 40) }}
                    >
                        <span style={{ fontSize: digitSize, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                            {unit.value}
                        </span>
                        <span
                            style={{
                                fontSize: unitLabelSize,
                                fontWeight: isTiles ? 700 : 500,
                                lineHeight: 1.2,
                                marginTop: isMobile ? 3 : px(isTiles ? 5 : 7, 3),
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

    /* ---------- Offer badge ---------- */
    const signWidth = isMobile ? 112 : px(184, 96);

    const sign = config.showBogoBadge && (
        config.badgeType === 'image' && config.badgeImage
            ? <img src={config.badgeImage} alt="" className="object-contain shrink-0" style={{ width: signWidth, height: 'auto' }} />
            : <Badge config={config} scene={scene} width={signWidth} displayClass={pack.displayClass} stacked={isStacked} />
    );

    // Decorative illustration beside the badge; only on full-width banners.
    const showDecoration = tier === 'full' && Decoration;
    const offerGroup = (showDecoration || sign) && (
        <div className="flex items-center shrink-0 self-stretch">
            {showDecoration && (
                <div className="shrink-0 relative z-0" style={{ alignSelf: 'flex-end', marginBottom: -px(14), marginTop: -px(13), marginRight: sign ? -px(14) : 0 }}>
                    <Decoration scene={scene} width={px(94, 54)} />
                </div>
            )}
            {sign && <div className="relative z-10">{sign}</div>}
        </div>
    );

    /* ---------- Coupon code ---------- */
    useEffect(() => {
        if (!couponCopied) return undefined;
        const timer = setTimeout(() => setCouponCopied(false), 2000);
        return () => clearTimeout(timer);
    }, [couponCopied]);

    const handleCopyCoupon = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isPreview) return;
        if (await copyText(config.couponCode)) {
            if (onTrack) onTrack('copy');
            setCouponCopied(true);
        }
    };

    const couponPlacement = config.couponPlacement || 'bottom';
    // Stacked layouts only have room above or below the headline.
    const couponInline = isStacked
        ? (couponPlacement === 'top' ? 'top' : 'bottom')
        : (['top', 'bottom'].includes(couponPlacement) ? couponPlacement : null);
    const couponSide = !isStacked && ['left', 'right'].includes(couponPlacement) ? couponPlacement : null;
    const couponCodeSize = isMobile ? 15 : px(19, 13);

    const couponChip = config.showCouponCode && config.couponCode && (
        <button
            type="button"
            onClick={handleCopyCoupon}
            title={couponCopied ? 'Copied!' : 'Click to copy code'}
            aria-label={`Copy coupon code ${config.couponCode}`}
            className="shrink-0 inline-flex items-center self-center cursor-pointer transition-transform hover:scale-[1.03] active:scale-95 whitespace-nowrap"
            style={{
                ...BUTTON_RESET,
                lineHeight: 1,
                gap: isMobile ? 6 : px(8, 5),
                padding: isMobile ? '6px 10px' : `${px(8, 5)}px ${px(14, 9)}px`,
                border: `2px dashed ${couponCopied ? '#4ADE80' : `color-mix(in srgb, ${config.headlineColor} 55%, transparent)`}`,
                borderRadius: isMobile ? 8 : px(10, 7),
                backgroundColor: couponCopied ? 'rgba(74, 222, 128, 0.16)' : 'rgba(255, 255, 255, 0.08)',
                color: config.headlineColor
            }}
        >
            <span style={{ fontSize: isMobile ? 10 : px(12, 9), fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>
                {couponCopied ? 'Copied!' : 'Code:'}
            </span>
            {/* Plain font so the code shows its exact letter case (the display font is caps-only). */}
            <span style={{ fontSize: couponCodeSize, fontWeight: 800, color: couponCopied ? '#4ADE80' : highlightColor, letterSpacing: '0.04em' }}>
                {config.couponCode}
            </span>
            {couponCopied
                ? <Check size={couponCodeSize * 0.85} strokeWidth={3} color="#4ADE80" />
                : <Copy size={couponCodeSize * 0.8} strokeWidth={2.5} style={{ opacity: 0.75 }} />}
        </button>
    );

    /* ---------- Headline ---------- */
    const headlineFit = useHeadlineFit(headlineRef, !isStacked, [width, config.headline, config.headlineHighlight, config.headlineSize, config.showTimer, config.showBogoBadge, config.showCTA, config.ctaText, config.bogoText, config.showCouponCode, config.couponCode, couponPlacement]);
    const headlineWraps = isStacked || headlineFit <= MIN_HEADLINE_FIT;

    const textBlock = (
        <div className="flex flex-col items-center text-center min-w-0" style={{ flex: isStacked ? 'none' : '1 1 auto', gap: isMobile ? 4 : px(6, 3) }}>
            {couponInline === 'top' && couponChip}
            {config.showSubHeadline && config.subHeadline && (
                <span style={{ color: config.subHeadlineColor, fontSize: isMobile ? 13 : px(subHeadlineBase, 12), fontWeight: 700, lineHeight: 1.15 }}>
                    {config.subHeadline}
                </span>
            )}
            <span
                ref={headlineRef}
                className={pack.displayClass}
                style={{
                    color: config.headlineColor,
                    fontSize: isMobile ? 22 : Math.max(14, Math.round(headlineBase * s * headlineFit)),
                    lineHeight: 1.08,
                    whiteSpace: headlineWraps ? 'normal' : 'nowrap',
                    // Always set explicitly: clearing the text-wrap shorthand would also reset the nowrap mode.
                    textWrap: headlineWraps ? 'balance' : 'nowrap',
                    maxWidth: '100%',
                    textShadow: pack.headlineShadow ? pack.headlineShadow(scene, isMobile ? 2 : px(3, 2)) : 'none'
                }}
            >
                {config.headline}
                {config.headlineHighlight && (
                    <>
                        {' '}
                        <span style={pack.highlightStyle ? pack.highlightStyle(highlightColor, scene) : { color: highlightColor }}>{config.headlineHighlight}</span>
                    </>
                )}
            </span>
            {couponInline === 'bottom' && couponChip && <div style={{ marginTop: isMobile ? 2 : px(4, 2) }}>{couponChip}</div>}
        </div>
    );

    /* ---------- Call to action ---------- */
    const ctaHeight = isMobile ? 42 : px(62, 38);
    const ctaAnimation = isPro ? (config.ctaAnimation || 'none') : 'none';

    const cta = config.showCTA && (
        <a
            href={config.ctaUrl || '#'}
            onClick={() => onTrack && onTrack('click')}
            className={`relative inline-flex items-center shrink-0 no-underline whitespace-nowrap transition-transform hover:scale-[1.03] active:scale-95 ${CTA_ANIMATION_CLASSES[ctaAnimation] || ''}`}
            style={{
                height: ctaHeight,
                paddingLeft: ctaHeight * 0.48,
                paddingRight: ctaHeight * 0.11,
                gap: ctaHeight * 0.26,
                backgroundColor: config.ctaBg,
                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.08) 100%)',
                color: config.ctaTextColor,
                borderRadius: config.ctaRadius,
                fontSize: ctaHeight * 0.37,
                fontWeight: 800,
                letterSpacing: '-0.01em',
                boxShadow: `0 0 0 ${isMobile ? 4 : px(7, 4)}px rgba(0, 0, 0, 0.12), 0 ${px(8, 4)}px ${px(22, 10)}px rgba(0, 0, 0, 0.25)`,
                '--wb-season-glow': config.ctaBg,
                animation: ctaAnimation === 'glow' ? 'wb-season-glow 2.2s ease-in-out infinite' : undefined
            }}
        >
            <span>{config.ctaText}</span>
            <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: ctaHeight * 0.76, height: ctaHeight * 0.76, backgroundColor: '#FFFFFF' }}>
                <CtaIcon scene={scene} size={ctaHeight * 0.5} />
            </span>
        </a>
    );

    /* ---------- Content per tier ---------- */
    let content;
    if (isMobile) {
        content = (
            <div className="relative z-10 flex flex-col items-center text-center" style={{ padding: '14px 34px 16px', gap: 10 }}>
                {textBlock}
                {(timer || sign) && (
                    <div className="flex items-center justify-center flex-wrap" style={{ gap: 14 }}>
                        {timer}
                        {sign}
                    </div>
                )}
                {cta}
            </div>
        );
    } else if (isCompact) {
        content = (
            <div className="relative z-10 flex flex-col items-center" style={{ padding: `${px(16, 10)}px ${px(64, 36)}px`, gap: px(14, 8) }}>
                {textBlock}
                <div className="flex items-center justify-center flex-wrap" style={{ gap: px(32, 16) }}>
                    {timer}
                    {sign}
                    {cta}
                </div>
            </div>
        );
    } else {
        content = (
            <div
                className="relative z-10 flex items-center"
                style={{
                    minHeight: px(110, 72),
                    padding: `${px(12, 8)}px ${px(72, 40)}px ${px(12, 8)}px ${showSceneArt ? sceneWidth + px(48, 20) : px(56, 32)}px`
                }}
            >
                <div className="flex items-center justify-between w-full mx-auto" style={{ maxWidth: px(1480), gap: px(36, 16) }}>
                    {timer}
                    {offerGroup}
                    {couponSide === 'left' && couponChip}
                    {textBlock}
                    {couponSide === 'right' && couponChip}
                    {cta}
                </div>
            </div>
        );
    }

    return (
        <div ref={rootRef} className="relative w-full overflow-hidden wb-season-banner" style={background}>
            {sceneLayer}
            {effectLayer}
            {content}

            {config.showClose !== false && (
                <button
                    type="button"
                    aria-label="Close banner"
                    onClick={(e) => {
                        e.preventDefault();
                        if (!isPreview && onClose) onClose();
                    }}
                    className="absolute z-20 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{
                        ...BUTTON_RESET,
                        top: isMobile ? 6 : px(12, 6),
                        right: isMobile ? 6 : px(16, 8),
                        width: isMobile ? 26 : px(30, 22),
                        height: isMobile ? 26 : px(30, 22),
                        color: config.headlineColor
                    }}
                >
                    <X size={isMobile ? 16 : px(20, 14)} strokeWidth={3} />
                </button>
            )}

            {showBranding && (
                <a
                    href="https://wisemattic.com/wisecampaign"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute z-20 no-underline whitespace-nowrap flex items-center gap-0.5 opacity-75 hover:opacity-100 transition-opacity"
                    style={{ right: isMobile ? 8 : px(18, 10), bottom: 2, fontSize: 7.5, fontWeight: 500, color: config.headlineColor }}
                >
                    <span>Made with</span>
                    <span className="font-bold underline">wiseCampaign</span>
                </a>
            )}
        </div>
    );
};

export default SeasonalBanner;
