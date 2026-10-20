/**
 * StockBar countdown: ticks every [data-wsb-expiry] timer (Unix seconds) and removes the
 * whole stock bar once the sale has ended. Loaded only with the Flash Sale Timer template.
 */
(function () {
    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function tick() {
        var now = Date.now() / 1000;
        document.querySelectorAll('[data-wsb-expiry]').forEach(function (timer) {
            var left = Math.floor(parseInt(timer.getAttribute('data-wsb-expiry'), 10) - now);
            if (left <= 0) {
                var bar = timer.closest('.wise-sb');
                if (bar) {
                    bar.remove();
                }
                return;
            }
            timer.querySelector('[data-wsb-h]').textContent = pad(Math.floor(left / 3600));
            timer.querySelector('[data-wsb-m]').textContent = pad(Math.floor((left % 3600) / 60));
            timer.querySelector('[data-wsb-s]').textContent = pad(left % 60);
        });
    }

    tick();
    setInterval(tick, 1000);
})();
