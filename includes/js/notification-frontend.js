(function () {
    const data = window.wiseCampaignFrontend;
    if (!data || !data.notifications || data.notifications.length === 0) {
        return;
    }

    const { settings, notifications } = data;
    const container = document.getElementById('wisecampaign-notification-container');
    if (!container) {
        return;
    }

    let currentIndex = 0;
    let notificationQueue = [...notifications];

    // Buyer names come from checkout forms and product names from admins, so escape before using innerHTML.
    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    if (settings.position) {
        const positionClass = 'position-' + settings.position; // e.g., "position-bottom-left"
        container.classList.add(positionClass);
    }

    if (settings.random_show === '1') {
        notificationQueue.sort(() => Math.random() - 0.5);
    }

    function showNextNotification() {
        // Check if we need to loop or stop
        if (currentIndex >= notificationQueue.length) {
            if (settings.loop === '1') {
                currentIndex = 0;
                // Re-randomize if the option is enabled
                if (settings.random_show === '1') {
                    notificationQueue.sort(() => Math.random() - 0.5);
                }
            } else {
                return; // End of queue, no loop
            }
        }

        const notification = notificationQueue[currentIndex];

        const productUrl = notification.product_url && notification.product_url !== '#' ? notification.product_url : '';

        const randomTimes = [
            '3 minutes ago',
            '7 minutes ago',
            '15 minutes ago',
            '28 minutes ago',
            '45 minutes ago',
            '1 hour ago',
            '2 hours ago',
            '5 hours ago',
            '8 hours ago',
            '14 hours ago',
            '19 hours ago',
            '22 hours ago',
            '1 day ago',
            '2 days ago'
        ];

        let timeText = notification.time;
        if (!timeText || timeText === 'Just now') {
            timeText = randomTimes[Math.floor(Math.random() * randomTimes.length)];
        }

        // Construct the notification HTML with inline styles from settings
        const popupHTML = `
      <div 
        class="wisecampaign-notification-popup ${productUrl ? 'wisecampaign-clickable' : ''}" 
        data-template="${settings.template || 'template_1'}" 
        style="
          background-color: ${settings.background_color}; 
          border-color: ${settings.border_color}; 
          border-width: ${settings.border_width}px;
          border-style: solid;
          border-radius: ${settings.border_radius}px;
          font-family: '${settings.font_family}', sans-serif;
          cursor: ${productUrl ? 'pointer' : 'default'};
        "
      >
        <img
          src="${esc(notification.product_image)}"
          alt="${esc(notification.image_type === 'avatar' ? notification.buyer : notification.product_name)}"
          class="${notification.image_type ? 'is-' + esc(notification.image_type) : ''}"
          style="border-radius: ${settings.image_radius}px;"
        >
        <div class="notification-content">
          <div class="notification-body">
            <p class="buyer-info">
              <span class="buyer-name">${esc(notification.buyer)}</span> just purchased
            </p>
            <p class="product-name">${esc(notification.product_name)}</p>
            <p class="location-info">From: <span class="location">${esc(notification.location)}</span></p>
          </div>
          <div class="notification-footer">
            <p class="timestamp">${esc(timeText)}</p>

            ${settings.hide_branding === '1' ? '' : `
            <p class="brand-credit">
              <a 
                href="https://wisemattic.com/wisecampaign/" 
                target="_blank" 
                rel="noopener noreferrer"
                style="text-decoration: none; color: inherit;"
                onclick="event.stopPropagation();"
              >
                by <b>wiseCampaign</b>
              </a>
            </p>`}
          </div>

        </div>
      </div>`;


        container.innerHTML = popupHTML;
        if (productUrl) {
            container.firstElementChild.addEventListener('click', function () {
                window.location.href = productUrl;
            });
        }
        container.classList.add('show');

        const displayTime = (parseInt(settings.display_time, 10) || 5) * 1000;
        const delayTime = (parseInt(settings.delay_time, 10) || 5) * 1000;

        // Hide the notification after displayTime, then wait delayTime to show the next one
        setTimeout(() => {
            container.classList.remove('show');
            setTimeout(showNextNotification, delayTime);
        }, displayTime);

        currentIndex++;
    }

    // Initial delay before showing the first notification
    setTimeout(showNextNotification, 3000);

})();