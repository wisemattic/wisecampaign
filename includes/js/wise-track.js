/**
 * WiseCampaign storefront analytics (includes/Classes/Analytics.php).
 *
 * Modules report events through a queue, so they never wait for this script:
 *     (window.wiseTrackQueue = window.wiseTrackQueue || []).push(['socialproof', 'click']);
 * An optional third item names the part of the module, such as the product table id.
 * Events go to the server in small batches. Clicks that can lead to a sale are kept in a
 * first-party cookie for the attribution window; the order picks them up at checkout.
 * No personal data is sent.
 */
(function () {
    var config = window.wiseTrackConfig;
    if (!config || !config.url) {
        return;
    }

    // View-like events count once per page
    var ONCE = ['view', 'open', 'play'];
    var pending = [];
    var seen = {};
    var timer = null;

    function send() {
        clearTimeout(timer);
        if (!pending.length) {
            return;
        }
        var body = JSON.stringify({ events: pending.splice(0, 30) });
        // sendBeacon survives the page being left, which is when most clicks are reported
        if (navigator.sendBeacon && navigator.sendBeacon(config.url, body)) {
            return;
        }
        if (window.fetch) {
            fetch(config.url, { method: 'POST', body: body, keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'text/plain' } }).catch(function () {});
        }
    }

    // Cookie format: module.timestamp|module.timestamp
    function remember(module) {
        var now = Math.floor(Date.now() / 1000);
        var oldest = now - config.days * 86400;
        var match = document.cookie.match(new RegExp('(?:^|; )' + config.cookie + '=([^;]*)'));
        var parts = (match ? decodeURIComponent(match[1]) : '').split('|').filter(function (part) {
            var bits = part.split('.');
            return bits.length === 2 && bits[0] !== module && Number(bits[1]) >= oldest;
        });
        parts.push(module + '.' + now);
        document.cookie = config.cookie + '=' + encodeURIComponent(parts.join('|'))
            + '; max-age=' + config.days * 86400 + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    }

    function track(module, event, object) {
        var key = module + ':' + event + ':' + (object || 0);
        if (ONCE.indexOf(event) !== -1) {
            if (seen[key]) {
                return;
            }
            seen[key] = true;
        }
        pending.push(object ? [module, event, object] : [module, event]);
        if (config.touch[module] === event) {
            remember(module);
        }
        clearTimeout(timer);
        timer = setTimeout(send, 1500);
    }

    var queued = Array.isArray(window.wiseTrackQueue) ? window.wiseTrackQueue : [];
    window.wiseTrackQueue = {
        push: function (item) {
            track(item[0], item[1], item[2]);
        },
    };
    queued.forEach(window.wiseTrackQueue.push);

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            send();
        }
    });
    window.addEventListener('pagehide', send);

    // Modules rendered on the server are counted here instead of in each module
    function scan() {
        if (document.querySelector('.wise-sb')) {
            track('stockbar', 'view');
            // Products added to the cart from a page showing the stock bar count as helped by it
            document.querySelectorAll('form.cart').forEach(function (form) {
                if (!form.querySelector('input[name="wisecampaign_assist"]')) {
                    var input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'wisecampaign_assist';
                    input.value = 'stockbar';
                    form.appendChild(input);
                }
            });
        }
        if (document.querySelector('.wisecampaign-buy-now-button')) {
            track('checkout', 'view');
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scan);
    } else {
        scan();
    }

    document.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.wisecampaign-buy-now-button')) {
            track('checkout', 'click');
            send();
        }
    }, true);
})();
