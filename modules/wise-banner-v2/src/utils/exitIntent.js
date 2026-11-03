import { useEffect, useRef } from 'react';

/*
 * Exit-intent triggers and "how often" memory for the wiseBanner popup.
 *
 * Desktop: the cursor leaves the window through the top edge (towards the tabs,
 * address bar or close button). Touch devices have no cursor, so they use a fast
 * upward scroll after reading down the page, or a plain delay.
 */

// Ignore exits in the first seconds: the cursor often leaves while the page is still loading.
const ARM_DELAY_MS = 3000;
// How close to the top edge (px) the cursor must be when it leaves the window.
const EXIT_EDGE_PX = 20;
// A fast scroll up: at least this far (px, or a fifth of the screen if larger) within this time.
const SCROLL_UP_MIN_PX = 120;
const SCROLL_UP_WINDOW_MS = 350;
// The visitor must have scrolled at least half a screen down before a scroll up counts.
const MIN_SCROLL_DEPTH = 0.5;
// After a click or a copied code the visitor has what they came for; stay quiet this long.
const CONVERTED_DAYS = 30;

const DAY_MS = 86400000;
const delaySeconds = (value) => Math.min(120, Math.max(3, parseInt(value, 10) || 10));
const STORE_PREFIX = 'wise-banner-v2-popup:';

export const POPUP_TRACKING_PREFIX = 'popup-';

/** Analytics id for a popup, so its numbers stay apart from the bar's. */
export const popupTrackingId = (templateId) => (templateId ? `${POPUP_TRACKING_PREFIX}${templateId}` : '');

export const isTouchDevice = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
};

const storageGet = (type, key) => {
    try {
        return window[type].getItem(key);
    } catch (e) {
        return null;
    }
};

const storageSet = (type, key, value) => {
    try {
        window[type].setItem(key, value);
    } catch (e) {
        // Storage blocked (private mode, cookie settings): the popup may show again next visit.
    }
};

// A new campaign (template or end date) starts with a clean slate.
const memoryKey = (config) => `${STORE_PREFIX}${config?.id || ''}:${config?.endDate || ''}`;

/** Whether the popup may open for this visitor, given when they last saw it. */
export const canShowPopup = (config) => {
    const key = memoryKey(config);
    if (storageGet('sessionStorage', key) === '1') return false;
    const until = parseInt(storageGet('localStorage', key), 10);
    return !(until && until > Date.now());
};

const rememberFor = (config, days) => {
    const key = memoryKey(config);
    storageSet('sessionStorage', key, '1');
    if (days > 0) {
        storageSet('localStorage', key, String(Date.now() + days * DAY_MS));
    }
};

/** Call when the popup opens. `frequencyDays` 0 means "once per visit". */
export const rememberPopupShown = (config) => {
    rememberFor(config, Math.max(0, parseInt(config?.frequencyDays, 10) || 0));
};

/** Call when the visitor clicks the button or copies the code. */
export const rememberPopupConverted = (config) => {
    rememberFor(config, Math.max(CONVERTED_DAYS, parseInt(config?.frequencyDays, 10) || 0));
};

/**
 * Calls `onTrigger` once when the visitor shows intent to leave.
 * `touch` picks the touch triggers: `mobileTrigger` is 'scroll-up' or 'delay' (seconds in `mobileDelay`).
 */
export const useExitIntent = ({ enabled, touch, mobileTrigger = 'scroll-up', mobileDelay = 10, onTrigger }) => {
    const triggerRef = useRef(onTrigger);
    triggerRef.current = onTrigger;

    useEffect(() => {
        if (!enabled) return undefined;

        const armedAt = Date.now() + ARM_DELAY_MS;
        const cleanups = [];
        let fired = false;

        const fire = () => {
            if (fired) return;
            fired = true;
            cleanups.forEach((cleanup) => cleanup());
            triggerRef.current();
        };

        if (!touch) {
            const onMouseOut = (e) => {
                // A related target means the cursor moved to another element on the page.
                if (e.relatedTarget || Date.now() < armedAt || e.clientY > EXIT_EDGE_PX) return;
                fire();
            };
            document.addEventListener('mouseout', onMouseOut);
            cleanups.push(() => document.removeEventListener('mouseout', onMouseOut));
        } else if (mobileTrigger === 'delay') {
            const timer = setTimeout(fire, delaySeconds(mobileDelay) * 1000);
            cleanups.push(() => clearTimeout(timer));
        } else {
            // A page too short to scroll can never show a scroll up; open after the delay instead.
            const shortPageTimer = setTimeout(() => {
                const viewport = window.innerHeight || 600;
                const scrollable = document.documentElement.scrollHeight - viewport;
                if (scrollable < viewport * MIN_SCROLL_DEPTH) fire();
            }, delaySeconds(mobileDelay) * 1000);
            cleanups.push(() => clearTimeout(shortPageTimer));

            let lastY = window.scrollY;
            let maxY = lastY;
            let burst = null;

            const onScroll = () => {
                const y = window.scrollY;
                const now = Date.now();
                const viewport = window.innerHeight || 600;
                maxY = Math.max(maxY, y);

                if (y >= lastY) {
                    burst = null;
                } else {
                    if (!burst || now - burst.startedAt > SCROLL_UP_WINDOW_MS) {
                        burst = { startY: lastY, startedAt: now };
                    }
                    const distance = burst.startY - y;
                    const minDistance = Math.max(SCROLL_UP_MIN_PX, viewport * 0.2);
                    if (now >= armedAt && maxY >= viewport * MIN_SCROLL_DEPTH && distance >= minDistance) {
                        fire();
                        return;
                    }
                }
                lastY = y;
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            cleanups.push(() => window.removeEventListener('scroll', onScroll));
        }

        return () => cleanups.forEach((cleanup) => cleanup());
    }, [enabled, touch, mobileTrigger, mobileDelay]);
};
