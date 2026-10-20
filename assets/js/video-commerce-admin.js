/**
 * WiseVideo Commerce boxes on the product edit screen: the main product video,
 * the gallery videos and the reels. Ids are kept in hidden inputs as "1,2,3".
 */
jQuery(function ($) {
    'use strict';

    // Primary Product Video
    let videoFrame;
    $('#wisecampaign-set-product-video, #wisecampaign-video-placeholder').on('click', function (e) {
        e.preventDefault();

        if (!videoFrame) {
            videoFrame = wp.media({
                title: 'Select Product Video',
                button: { text: 'Use this video' },
                library: { type: 'video' },
                multiple: false
            });

            videoFrame.on('select', function () {
                const attachment = videoFrame.state().get('selection').first().toJSON();
                $('#wisecampaign-product-video-id').val(attachment.id);
                $('#wisecampaign-video-preview video').attr('src', attachment.url);
                $('#wisecampaign-video-preview').prop('hidden', false);
                $('#wisecampaign-video-placeholder').prop('hidden', true);
                $('#wisecampaign-remove-product-video').prop('hidden', false);
                $('#wisecampaign-set-product-video').text('Update product video');
            });
        }

        videoFrame.open();
    });

    $('#wisecampaign-remove-product-video').on('click', function (e) {
        e.preventDefault();
        $('#wisecampaign-product-video-id').val('');
        $('#wisecampaign-video-preview video').removeAttr('src');
        $('#wisecampaign-video-preview').prop('hidden', true);
        $('#wisecampaign-video-placeholder').prop('hidden', false);
        $(this).prop('hidden', true);
        $('#wisecampaign-set-product-video').text('Set product video');
    });

    /**
     * A sortable list of videos (gallery or reels) backed by a hidden input.
     */
    function videoList(listSel, inputSel, addSel, removeClass, frameTitle, buttonText) {
        const $list = $(listSel);
        const $input = $(inputSel);
        let frame;

        // The input always follows the order of the list
        function sync() {
            $input.val($list.children('li').map(function () {
                return $(this).data('id');
            }).get().join(','));
        }

        function addItem(attachment) {
            if ($list.children('li[data-id="' + attachment.id + '"]').length) {
                return;
            }
            const $video = $('<video muted preload="metadata"></video>').attr('src', attachment.url + '#t=0.5');
            const $remove = $('<button type="button" aria-label="Remove video"><span class="dashicons dashicons-no-alt"></span></button>').addClass(removeClass);
            $('<li></li>').attr('data-id', attachment.id).append($video, $remove).appendTo($list);
        }

        $(addSel).on('click', function (e) {
            e.preventDefault();
            if (!frame) {
                frame = wp.media({
                    title: frameTitle,
                    button: { text: buttonText },
                    library: { type: 'video' },
                    multiple: true
                });
                frame.on('select', function () {
                    frame.state().get('selection').each(function (model) {
                        addItem(model.toJSON());
                    });
                    sync();
                });
            }
            frame.open();
        });

        $list.on('click', '.' + removeClass, function (e) {
            e.preventDefault();
            $(this).closest('li').remove();
            sync();
        });

        if ($.fn.sortable) {
            $list.sortable({ items: 'li', tolerance: 'pointer', update: sync });
        }
    }

    videoList('#wisecampaign-video-gallery-list', '#wisecampaign-product-video-gallery-ids', '#wisecampaign-add-video-gallery', 'remove-gallery-video', 'Add Videos to Gallery', 'Add to gallery');
    videoList('#wisecampaign-reels-list', '#wisecampaign-product-reels-ids', '#wisecampaign-add-reels', 'remove-reel-video', 'Add Videos to Reels', 'Add to reels');
});
