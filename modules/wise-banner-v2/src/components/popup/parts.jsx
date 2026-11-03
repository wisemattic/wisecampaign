import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { getTimeLeft } from '../../utils/countdown';
import { copyText } from '../../utils/clipboard';

/*
 * Pieces shared by the classic and seasonal popup cards. Storefront themes style
 * buttons, links and headings freely, so everything here sets its own inline
 * resets instead of relying on the theme's defaults.
 */

export const BUTTON_RESET = {
    background: 'transparent',
    border: 0,
    padding: 0,
    margin: 0,
    boxShadow: 'none',
    minWidth: 0,
    minHeight: 0,
    lineHeight: 1,
    textTransform: 'none',
    letterSpacing: 'normal',
    fontFamily: 'inherit'
};

export const CTA_ANIMATION_CLASSES = {
    pulse: 'animate-pulse-subtle',
    shake: 'animate-shake-subtle',
    bounce: 'animate-bounce-btn',
    heartbeat: 'animate-heartbeat',
    shimmer: 'relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent'
};

export const getBackgroundStyle = (config, fallback = '#0F172A') => ({
    backgroundColor: config.bgType === 'solid' ? config.bgSolid : fallback,
    backgroundImage: config.bgType === 'gradient'
        ? config.bgGradient
        : (config.bgType === 'image' && config.bgImage ? `url(${config.bgImage})` : undefined),
    backgroundSize: 'cover',
    backgroundPosition: 'center'
});

/** Live countdown. `expired` is true once a fixed end date has passed. */
export const usePopupCountdown = (config) => {
    const { endDate, endTime, enableRecursion, recurrenceAmount, recurrenceUnit } = config;
    const read = () => getTimeLeft({ endDate, endTime, enableRecursion, recurrenceAmount, recurrenceUnit });
    const [timeLeft, setTimeLeft] = useState(read);

    useEffect(() => {
        setTimeLeft(read());
        const timer = setInterval(() => setTimeLeft(read()), 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endDate, endTime, enableRecursion, recurrenceAmount, recurrenceUnit]);

    const expired = ['days', 'hrs', 'min', 'sec'].every((unit) => timeLeft[unit] === '00');
    return { timeLeft, expired };
};

export const timerUnits = (config, timeLeft) => [
    { value: timeLeft.days, label: config.daysLabel },
    { value: timeLeft.hrs, label: config.hoursLabel },
    { value: timeLeft.min, label: config.minutesLabel },
    { value: timeLeft.sec, label: config.secondsLabel }
];

/** Copies the coupon code; reports success so the caller can track it. */
export const useCopyCode = (code, { isPreview, onCopied }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return undefined;
        const timer = setTimeout(() => setCopied(false), 2200);
        return () => clearTimeout(timer);
    }, [copied]);

    const copy = async () => {
        if (isPreview || !code) return false;
        const ok = await copyText(code);
        if (ok) {
            setCopied(true);
            if (onCopied) onCopied();
        }
        return ok;
    };

    return { copied, copy };
};

/** Dashed "ticket" with the code; click anywhere on it to copy. */
export const CouponTicket = ({ code, copied, onCopy, textColor, codeColor, isMobileMode = false, fontClass = '' }) => (
    <button
        type="button"
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCopy();
        }}
        aria-label={copied ? 'Coupon code copied' : `Copy coupon code ${code}`}
        className="group w-full flex items-center justify-between cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{
            ...BUTTON_RESET,
            maxWidth: 320,
            gap: 12,
            padding: isMobileMode ? '11px 14px' : '13px 16px',
            borderRadius: 14,
            border: `2px dashed ${copied ? '#4ADE80' : `color-mix(in srgb, ${textColor} 50%, transparent)`}`,
            backgroundColor: copied ? 'rgba(74, 222, 128, 0.14)' : 'rgba(255, 255, 255, 0.10)',
            color: textColor
        }}
    >
        <span className="flex flex-col items-start min-w-0" style={{ gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7 }}>
                Your code
            </span>
            {/* Plain font so the code shows its exact letter case. */}
            <span
                className={`truncate ${fontClass}`}
                style={{ fontSize: isMobileMode ? 20 : 23, fontWeight: 900, letterSpacing: '0.08em', color: copied ? '#4ADE80' : codeColor, lineHeight: 1.05 }}
            >
                {code}
            </span>
        </span>
        <span
            className="flex items-center shrink-0 rounded-full transition-colors"
            style={{
                gap: 6,
                padding: '7px 11px',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                backgroundColor: copied ? '#4ADE80' : `color-mix(in srgb, ${textColor} 16%, transparent)`,
                color: copied ? '#052E16' : textColor
            }}
        >
            {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} strokeWidth={2.5} />}
            {copied ? 'Copied' : 'Copy'}
        </span>
    </button>
);

export const DeclineLink = ({ text, color, onClick }) => (
    <button
        type="button"
        onClick={(e) => {
            e.preventDefault();
            onClick();
        }}
        className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        style={{ ...BUTTON_RESET, color, fontSize: 13, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, lineHeight: 1.3 }}
    >
        {text}
    </button>
);

export const Branding = ({ color }) => (
    <a
        href="https://wisemattic.com/wisecampaign"
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline whitespace-nowrap flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity"
        style={{ fontSize: 9, fontWeight: 500, color, textDecoration: 'none' }}
    >
        <span>Made with</span>
        <span className="font-bold underline">wiseCampaign</span>
    </a>
);

/**
 * Button behavior shared by both cards. With a link it navigates as usual. Without one it
 * copies the code, shows "copied" for a moment and closes, so the visitor keeps shopping.
 * `done` is true while that confirmation shows.
 */
export const useCtaAction = ({ config, isPreview, onTrack, onClose, copy }) => {
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!done) return undefined;
        const timer = setTimeout(() => onClose && onClose('cta'), 900);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [done]);

    const onClick = async (e) => {
        if (isPreview) {
            e.preventDefault();
            return;
        }
        if (onTrack) onTrack('click');
        if (config.ctaUrl) return;

        e.preventDefault();
        if (config.showCouponCode && config.couponCode) {
            // If the browser blocks copying, stay open so the visitor can still read the code.
            if (await copy()) setDone(true);
            return;
        }
        if (onClose) onClose('cta');
    };

    return { onClick, done };
};
