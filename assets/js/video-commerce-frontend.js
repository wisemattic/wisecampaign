/**
 * WiseVideo Commerce storefront: gallery thumbnails, the product card's Buy Now button,
 * reels that play while in view, and the reels lightbox.
 */
(function () {
    'use strict';

    // WiseCampaign Analytics (includes/js/wise-track.js)
    function track(event) {
        (window.wiseTrackQueue = window.wiseTrackQueue || []).push(['wisevideo', event]);
    }

    // Credits what the shopper adds to the cart from here to WiseVideo in WiseCampaign Analytics
    function tagForm(form) {
        var input = form.querySelector('input[name="wisecampaign_source"]');
        if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'wisecampaign_source';
            form.appendChild(input);
        }
        input.value = 'wisevideo';
        return input;
    }

    // -----------------------------------------------------------------
    // Gallery: clicking a thumbnail shows that video or image on the stage
    // -----------------------------------------------------------------
    document.querySelectorAll('.wcvc-gallery').forEach(function (gallery) {
        var stage = gallery.querySelector('.wcvc-stage');
        var video = stage.querySelector('.wcvc-stage__video');
        var image = stage.querySelector('.wcvc-stage__image');

        gallery.querySelectorAll('.wcvc-thumb').forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                gallery.querySelectorAll('.wcvc-thumb').forEach(function (t) {
                    t.classList.toggle('is-active', t === thumb);
                });

                var isVideo = thumb.dataset.type === 'video';
                stage.classList.toggle('is-video', isVideo);
                if (isVideo) {
                    image.hidden = true;
                    video.hidden = false;
                    if (video.getAttribute('src') !== thumb.dataset.src) {
                        video.src = thumb.dataset.src;
                    }
                    track('play');
                    // The click lets the video play with sound
                    var playing = video.play();
                    if (playing && playing.catch) {
                        playing.catch(function () {});
                    }
                } else {
                    video.pause();
                    video.hidden = true;
                    image.hidden = false;
                    image.src = thumb.dataset.src;
                    image.alt = thumb.querySelector('img') ? thumb.querySelector('img').alt : '';
                }
            });
        });
    });

    // -----------------------------------------------------------------
    // Buy Now on the product card
    // -----------------------------------------------------------------
    document.addEventListener('click', function (e) {
        var button = e.target.closest('[data-wcvc-buy]');
        if (!button) {
            return;
        }
        e.preventDefault();

        var form = document.querySelector('form.cart');
        if (!form) {
            return;
        }
        track('click');
        var source = tagForm(form);

        // Variable and other products need options picked first: show the form
        if (button.dataset.wcvcBuy !== 'add') {
            closeLightbox();
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var firstField = form.querySelector('select, input[type="number"]');
            if (firstField) {
                firstField.focus({ preventScroll: true });
            }
            return;
        }

        var addButton = form.querySelector('.single_add_to_cart_button');
        if (addButton) {
            button.disabled = true;
            button.dataset.label = button.textContent;
            button.textContent = '…';
            addButton.click();
            setTimeout(function () {
                button.disabled = false;
                button.textContent = button.dataset.label;
                // Themes that add to the cart without leaving the page: later adds are the shopper's own
                source.remove();
            }, 2500);
        }
    });

    // -----------------------------------------------------------------
    // Reels: autoplay only while visible, so a page of reels stays light
    // -----------------------------------------------------------------
    var reelsBlock = document.querySelector('.wcvc-reels');
    var reels = reelsBlock ? Array.prototype.slice.call(reelsBlock.querySelectorAll('.wcvc-reel')) : [];

    if (reelsBlock && reelsBlock.classList.contains('is-autoplay') && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var v = entry.target.querySelector('video');
                if (entry.isIntersecting) {
                    var p = v.play();
                    if (p && p.then) {
                        p.then(function () {
                            entry.target.classList.add('is-playing');
                        }).catch(function () {});
                    }
                } else {
                    v.pause();
                    entry.target.classList.remove('is-playing');
                }
            });
        }, { threshold: 0.5 });
        reels.forEach(function (reel) {
            observer.observe(reel);
        });
    }

    // -----------------------------------------------------------------
    // Lightbox
    // -----------------------------------------------------------------
    var lightbox = document.querySelector('.wcvc-lightbox');
    var lightboxVideo = lightbox ? lightbox.querySelector('.wcvc-lightbox__video') : null;
    var current = 0;
    var lastFocus = null;

    function show(index) {
        current = (index + reels.length) % reels.length;
        lightboxVideo.src = reels[current].dataset.src;
        var p = lightboxVideo.play();
        if (p && p.catch) {
            p.catch(function () {});
        }
    }

    function openLightbox(index) {
        if (!lightbox) {
            return;
        }
        lastFocus = document.activeElement;
        lightbox.hidden = false;
        document.body.classList.add('wcvc-lightbox-open');
        lightboxVideo.muted = false;
        lightbox.classList.remove('is-muted');
        track('play');
        show(index);
        lightbox.querySelector('.wcvc-lightbox__close').focus();
    }

    function closeLightbox() {
        if (!lightbox || lightbox.hidden) {
            return;
        }
        lightboxVideo.pause();
        lightboxVideo.removeAttribute('src');
        lightboxVideo.load();
        lightbox.hidden = true;
        document.body.classList.remove('wcvc-lightbox-open');
        if (lastFocus) {
            lastFocus.focus();
        }
    }

    reels.forEach(function (reel, index) {
        reel.addEventListener('click', function () {
            openLightbox(index);
        });
    });

    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox || e.target.closest('.wcvc-lightbox__close')) {
                closeLightbox();
            } else if (e.target.closest('.wcvc-lightbox__prev')) {
                show(current - 1);
            } else if (e.target.closest('.wcvc-lightbox__next')) {
                show(current + 1);
            } else if (e.target.closest('.wcvc-lightbox__sound')) {
                lightboxVideo.muted = !lightboxVideo.muted;
                lightbox.classList.toggle('is-muted', lightboxVideo.muted);
            } else if (e.target === lightboxVideo) {
                if (lightboxVideo.paused) {
                    lightboxVideo.play();
                } else {
                    lightboxVideo.pause();
                }
            }
        });

        document.addEventListener('keydown', function (e) {
            if (lightbox.hidden) {
                return;
            }
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft' && reels.length > 1) {
                show(current - 1);
            } else if (e.key === 'ArrowRight' && reels.length > 1) {
                show(current + 1);
            }
        });
    }
})();
