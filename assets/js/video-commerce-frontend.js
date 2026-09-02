jQuery(document).ready(function($) {
    $('.video-thumb').on('click', function() {
        const videoUrl = $(this).data('video');
        const $container = $(this).closest('.wisecampaign-product-video-gallery');
        let $mainVideo = $container.find('.wisecampaign-main-video video');
        const $mainImage = $container.find('.wisecampaign-main-image-fallback');
        
        // Update active class
        $(this).siblings().removeClass('active');
        $(this).addClass('active');

        // If we have a video element, just update src
        if ($mainVideo.length) {
            $mainVideo.fadeOut(200, function() {
                $(this).attr('src', videoUrl);
                $(this).fadeIn(200);
                this.play();
            });
        } 
        // If we have an image fallback, replace it with a video element
        else if ($mainImage.length) {
            const radius = $mainImage.find('img').css('border-radius') || '8px';
            const videoHtml = `
                <div class="wisecampaign-main-video woocommerce-product-gallery__wrapper" style="margin-bottom: 20px; position: relative; display: none;">
                    <video id="wisecampaign-main-player" src="${videoUrl}" controls style="width: 100%; border-radius: ${radius}; box-shadow: 0 4px 30px rgba(0,0,0,0.15);"></video>
                </div>
            `;
            
            $mainImage.fadeOut(200, function() {
                $(this).replaceWith(videoHtml);
                const $newVideoWrap = $container.find('.wisecampaign-main-video');
                $newVideoWrap.fadeIn(200, function() {
                    $(this).find('video')[0].play();
                });
            });
        }
    });

    // Mark first thumb as active if main video matches
    const firstThumb = $('.video-thumb').first();
    const mainVideoSrc = $('.wisecampaign-main-video video').attr('src');
    if (firstThumb.length && mainVideoSrc === firstThumb.data('video')) {
        firstThumb.addClass('active');
    }

    // Mobile Add to Cart Overlay (using delegation for lightbox support)
    $(document).on('click', '.wisecampaign-mobile-add-to-cart', function(e) {
        e.preventDefault();
        // Find the main WooCommerce add to cart button and trigger it
        const $mainBtn = $('form.cart button.single_add_to_cart_button');
        if ($mainBtn.length) {
            $mainBtn.trigger('click');
            
            // Visual feedback
            const $this = $(this);
            const originalText = $this.text();
            $this.text('Adding...');
            setTimeout(() => {
                $this.text(originalText);
            }, 2000);
        }
    });

    // Product Reels Lightbox
    const $lightbox = $('#wisecampaign-reels-lightbox');
    const $lightboxVideo = $('#wisecampaign-lightbox-video');

    $('.wisecampaign-reel-item').on('click', function() {
        const videoUrl = $(this).data('video');
        $lightboxVideo.attr('src', videoUrl);
        $lightbox.addClass('active');
        $lightboxVideo[0].play();
    });

    $('.wisecampaign-lightbox-close, .wisecampaign-video-lightbox').on('click', function(e) {
        if (e.target !== this && !$(e.target).hasClass('dashicons')) return;
        $lightbox.removeClass('active');
        $lightboxVideo[0].pause();
        $lightboxVideo.attr('src', '');
    });
});
