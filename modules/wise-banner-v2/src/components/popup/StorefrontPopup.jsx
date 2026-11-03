import React, { useMemo, useState } from 'react';
import PopupShell from './PopupShell';
import PopupContent, { getPopupWidth } from './PopupContent';
import { createTracker } from '../../utils/analytics';
import {
    useExitIntent,
    isTouchDevice,
    canShowPopup,
    rememberPopupShown,
    rememberPopupConverted,
    popupTrackingId
} from '../../utils/exitIntent';

const TITLE_ID = 'wise-banner-v2-popup-title';

/**
 * Storefront exit-intent popup: waits for the visitor to head for the exit, opens once,
 * and remembers it for the configured number of days. Impressions are counted when the
 * popup opens, not on page load, so the click-through rate stays honest.
 */
const StorefrontPopup = ({ config, tracking, isPro, effectLayer = null }) => {
    const touch = useMemo(isTouchDevice, []);
    const allowed = useMemo(
        () => canShowPopup(config) && (!touch || config.showOnMobile !== false),
        // Decided once per page view.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);

    const track = useMemo(() => createTracker(tracking, popupTrackingId(config.id)), [tracking, config.id]);

    useExitIntent({
        enabled: allowed && !hasOpened,
        touch,
        mobileTrigger: config.mobileTrigger,
        mobileDelay: config.mobileDelay,
        onTrigger: () => {
            rememberPopupShown(config);
            setHasOpened(true);
            setIsOpen(true);
            track('view');
            try {
                const visitorKey = `wise-banner-v2-visitor:${popupTrackingId(config.id)}`;
                if (!window.sessionStorage.getItem(visitorKey)) {
                    window.sessionStorage.setItem(visitorKey, '1');
                    track('visitor');
                }
            } catch (e) {
                // Without session storage repeat views can't be told apart; skip the visitor count.
            }
        }
    });

    if (!isOpen) return null;

    const onTrack = (event) => {
        track(event);
        if (event === 'click' || event === 'copy') rememberPopupConverted(config);
    };

    const close = (reason) => {
        // The button closing the popup is a click, already counted.
        if (reason !== 'cta') track('close');
        setIsOpen(false);
    };

    // Layout follows the screen width; touch only decides the trigger (tablets get the full card).
    const isMobileMode = window.innerWidth < 640;

    return (
        <PopupShell
            onClose={close}
            isMobileMode={isMobileMode}
            maxWidth={getPopupWidth(config, isPro)}
            closeColor={config.headlineColor}
            labelledBy={TITLE_ID}
        >
            <PopupContent
                config={config}
                isPro={isPro}
                isMobileMode={isMobileMode}
                onTrack={onTrack}
                onClose={close}
                effectLayer={effectLayer}
                showBranding={!isPro || !config.hideBranding}
                titleId={TITLE_ID}
            />
        </PopupShell>
    );
};

export default StorefrontPopup;
