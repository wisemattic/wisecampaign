const getDevice = () => {
    const width = window.innerWidth || document.documentElement.clientWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

/**
 * Creates the storefront event reporter for one banner. Events are sent with
 * sendBeacon so clicks are still recorded when the visitor navigates away.
 * Returns a no-op when tracking is disabled (e.g. for site administrators).
 */
export const createTracker = (tracking, bannerId) => {
    if (!tracking || !tracking.enabled || !tracking.url || !bannerId) {
        return () => {};
    }

    const device = getDevice();

    const send = (event) => {
        const body = JSON.stringify({ event, bannerId, device });
        try {
            if (navigator.sendBeacon && navigator.sendBeacon(tracking.url, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) {
                return;
            }
        } catch (err) {
            // Fall back to fetch below.
        }
        fetch(tracking.url, {
            method: 'POST',
            body,
            keepalive: true,
            credentials: 'same-origin',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
        }).catch(() => {});
    };

    return (event) => {
        // A click starts the order attribution window (read server-side at checkout).
        if (event === 'click' && tracking.cookie) {
            const maxAge = (parseInt(tracking.attributionDays, 10) || 7) * 86400;
            const value = encodeURIComponent(`${bannerId}|${device}|${Math.floor(Date.now() / 1000)}`);
            const secure = window.location.protocol === 'https:' ? '; Secure' : '';
            document.cookie = `${tracking.cookie}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
        }
        send(event);
    };
};
