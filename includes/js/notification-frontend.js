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

        // Construct the notification HTML with inline styles from settings
        const popupHTML = `
      <div 
        class="wisecampaign-notification-popup" 
        data-template="${settings.template || 'template_1'}" 
        style="
          background-color: ${settings.background_color}; 
          border-color: ${settings.border_color}; 
          border-width: ${settings.border_width}px;
          border-style: solid;
          border-radius: ${settings.border_radius}px;
          font-family: '${settings.font_family}', sans-serif;
        "
      >
        <img 
          src="${notification.product_image}" 
          alt="${notification.product_name}"
          style="border-radius: ${settings.image_radius}px;" 
        >
        <div class="notification-content">
          <div class="notification-body">
            <p class="buyer-info">
              <span class="buyer-name">${notification.buyer}</span> just purchased
            </p>
            <p class="product-name">${notification.product_name}</p>
            <p class="location-info">From: <span class="location">${notification.location}</span></p>
          </div>
          <div class="notification-footer">
            <p class="timestamp">${notification.time}</p>
            <p class="brand-credit">
              <a 
                href="https://wisemattic.com/wisecampaign/" 
                target="_blank" 
                rel="noopener noreferrer"
                style="text-decoration: none; color: inherit;"
              >
                by <b>wiseCampaign</b>
              </a>
            </p>
          </div>
        </div>
      </div>`;

        container.innerHTML = popupHTML;
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