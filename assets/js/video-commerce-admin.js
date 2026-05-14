jQuery(document).ready(function($) {
    // Primary Product Video
    let videoFrame;
    $('#wisecampaign-set-product-video, #wisecampaign-video-placeholder').on('click', function(e) {
        e.preventDefault();

        if (videoFrame) {
            videoFrame.open();
            return;
        }

        videoFrame = wp.media({
            title: 'Select Product Video',
            button: { text: 'Use this video' },
            library: { type: 'video' },
            multiple: false
        });

        videoFrame.on('select', function() {
            const attachment = videoFrame.state().get('selection').first().toJSON();
            $('#wisecampaign-product-video-id').val(attachment.id);
            $('#wisecampaign-video-preview video').attr('src', attachment.url);
            $('#wisecampaign-video-preview').show();
            $('#wisecampaign-video-placeholder').hide();
            $('#wisecampaign-remove-product-video').show();
            $('#wisecampaign-set-product-video').text('Update product video');
        });

        videoFrame.open();
    });

    $('#wisecampaign-remove-product-video').on('click', function(e) {
        e.preventDefault();
        $('#wisecampaign-product-video-id').val('');
        $('#wisecampaign-video-preview').hide();
        $('#wisecampaign-video-placeholder').show();
        $('#wisecampaign-remove-product-video').hide();
        $('#wisecampaign-set-product-video').text('Set product video');
    });

    // Video Gallery
    let galleryFrame;
    $('#wisecampaign-add-video-gallery, #plus-video-placeholder').on('click', function(e) {
        e.preventDefault();

        if (galleryFrame) {
            galleryFrame.open();
            return;
        }

        galleryFrame = wp.media({
            title: 'Add Videos to Gallery',
            button: { text: 'Add to gallery' },
            library: { type: 'video' },
            multiple: true
        });

        galleryFrame.on('select', function() {
            const selections = galleryFrame.state().get('selection');
            const idsInput = $('#wisecampaign-product-video-gallery-ids');
            let currentIds = idsInput.val() ? idsInput.val().split(',') : [];

            selections.map(function(attachment) {
                attachment = attachment.toJSON();
                if (!currentIds.includes(attachment.id.toString())) {
                    currentIds.push(attachment.id);
                    $('#wisecampaign-video-gallery-list').prepend(`
                        <li data-id="${attachment.id}" style="position: relative; width: 60px; height: 60px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; background: #eee; display: flex; align-items: center; justify-content: center;">
                            <video src="${attachment.url}" style="width: 100%; height: 100%; object-fit: cover;"></video>
                            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: #fff;">
                                <span class="dashicons dashicons-video-alt3" style="font-size: 16px;"></span>
                            </div>
                            <a href="#" class="remove-gallery-video" style="position: absolute; top: -5px; right: -5px; background: #fff; border-radius: 50%; color: #f00; font-size: 10px;"><span class="dashicons dashicons-dismiss"></span></a>
                        </li>
                    `);
                }
            });

            idsInput.val(currentIds.join(','));
        });

        galleryFrame.open();
    });

    $(document).on('click', '.remove-gallery-video', function(e) {
        e.preventDefault();
        const li = $(this).closest('li');
        const id = li.data('id').toString();
        const idsInput = $('#wisecampaign-product-video-gallery-ids');
        let currentIds = idsInput.val().split(',');

        currentIds = currentIds.filter(cid => cid !== id);
        idsInput.val(currentIds.join(','));
        li.remove();
    });

    // Sorting (basic)
    if ($.fn.sortable) {
        $('#wisecampaign-video-gallery-list').sortable({
            items: 'li:not(#plus-video-placeholder)',
            update: function() {
                let ids = [];
                $('#wisecampaign-video-gallery-list li:not(#plus-video-placeholder)').each(function() {
                    ids.push($(this).data('id'));
                });
                $('#wisecampaign-product-video-gallery-ids').val(ids.join(','));
            }
        });
    }

    // Product Reels
    let reelsFrame;
    $('#wisecampaign-add-reels, #plus-reel-placeholder').on('click', function(e) {
        e.preventDefault();

        if (reelsFrame) {
            reelsFrame.open();
            return;
        }

        reelsFrame = wp.media({
            title: 'Add Videos to Reels',
            button: { text: 'Add to reels' },
            library: { type: 'video' },
            multiple: true
        });

        reelsFrame.on('select', function() {
            const selections = reelsFrame.state().get('selection');
            const idsInput = $('#wisecampaign-product-reels-ids');
            let currentIds = idsInput.val() ? idsInput.val().split(',') : [];

            selections.map(function(attachment) {
                attachment = attachment.toJSON();
                if (!currentIds.includes(attachment.id.toString())) {
                    currentIds.push(attachment.id);
                    $('#wisecampaign-reels-list').prepend(`
                        <li data-id="${attachment.id}" style="position: relative; width: 60px; height: 100px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; background: #eee; display: flex; align-items: center; justify-content: center;">
                            <video src="${attachment.url}" style="width: 100%; height: 100%; object-fit: cover;"></video>
                            <a href="#" class="remove-reel-video" style="position: absolute; top: -5px; right: -5px; background: #fff; border-radius: 50%; color: #f00; font-size: 10px;"><span class="dashicons dashicons-dismiss"></span></a>
                        </li>
                    `);
                }
            });

            idsInput.val(currentIds.join(','));
        });

        reelsFrame.open();
    });

    $(document).on('click', '.remove-reel-video', function(e) {
        e.preventDefault();
        const li = $(this).closest('li');
        const id = li.data('id').toString();
        const idsInput = $('#wisecampaign-product-reels-ids');
        let currentIds = idsInput.val().split(',');

        currentIds = currentIds.filter(cid => cid !== id);
        idsInput.val(currentIds.join(','));
        li.remove();
    });

    // Sorting (basic)
    if ($.fn.sortable) {
        $('#wisecampaign-video-gallery-list').sortable({
            items: 'li:not(#plus-video-placeholder)',
            update: function() {
                let ids = [];
                $('#wisecampaign-video-gallery-list li:not(#plus-video-placeholder)').each(function() {
                    ids.push($(this).data('id'));
                });
                $('#wisecampaign-product-video-gallery-ids').val(ids.join(','));
            }
        });

        $('#wisecampaign-reels-list').sortable({
            items: 'li:not(#plus-reel-placeholder)',
            update: function() {
                let ids = [];
                $('#wisecampaign-reels-list li:not(#plus-reel-placeholder)').each(function() {
                    ids.push($(this).data('id'));
                });
                $('#wisecampaign-product-reels-ids').val(ids.join(','));
            }
        });
    }
});
