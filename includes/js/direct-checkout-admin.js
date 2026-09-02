jQuery(document).ready(function ($) {
    // 1. Color Pickers with Live Preview
    $('.wisecampaign-color-picker').wpColorPicker();

    $('#dc_button_color').wpColorPicker({
        change: function (e, ui) {
            const color = ui.color.toString();
            $('#preview-button').css({
                'backgroundColor': color,
                'borderColor': color
            });
        }
    });

    $('#dc_button_text_color').wpColorPicker({
        change: function (e, ui) {
            const color = ui.color.toString();
            $('#preview-button').css('color', color);
            $('#preview-button .wisecampaign-dc-icon svg').css('fill', color);
        }
    });

    // 2. Button Text Live Update
    $('#dc_button_text').on('input keyup', function () {
        $('#preview-button-text').text($(this).val() || 'Buy Now');
    });

    // 3. Custom Icons Live Preview
    function updateIconPreview() {
        const iconKey = $('#dc_button_icon').val();
        const iconPos = $('input[name="wisecampaign_dc_settings[dc_icon_position]"]:checked').val() || 'left';
        const iconSvg = (wiseCampaignDcAdmin.icons && wiseCampaignDcAdmin.icons[iconKey]) ? wiseCampaignDcAdmin.icons[iconKey] : '';

        const $leftIcon = $('#preview-icon-left');
        const $rightIcon = $('#preview-icon-right');

        $leftIcon.empty().hide();
        $rightIcon.empty().hide();

        if (iconSvg && iconKey !== 'none') {
            if (iconPos === 'right') {
                $rightIcon.html(iconSvg).show();
            } else {
                $leftIcon.html(iconSvg).show();
            }
            // Ensure color inheritance
            const textColor = $('#dc_button_text_color').val() || '#ffffff';
            $('#preview-button .wisecampaign-dc-icon svg').css('fill', textColor);
        }
    }

    $('#dc_button_icon').on('change', updateIconPreview);
    $('input[name="wisecampaign_dc_settings[dc_icon_position]"]').on('change', updateIconPreview);

    // 4. Button Animations Live Preview
    function updateAnimationPreview() {
        const animKey = $('#dc_button_animation').val();
        const $btn = $('#preview-button');

        // Remove all previous animation classes
        $btn.removeClass('wc-anim-pulse wc-anim-shimmer wc-anim-shake wc-anim-bounce');

        if (animKey && animKey !== 'none') {
            // Re-trigger animation cleanly
            void $btn[0].offsetWidth;
            $btn.addClass('wc-anim-' + animKey);
        }
    }

    $('#dc_button_animation').on('change', updateAnimationPreview);

    // 5. Redirect Destination Toggle
    $('#dc_redirect_to').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#dc_redirect_custom_url').slideDown(150);
        } else {
            $('#dc_redirect_custom_url').slideUp(150);
        }
    }).trigger('change');

    // 6. AJAX Save Handler
    $('#wisecampaign-dc-settings-form').on('submit', function (e) {
        e.preventDefault();

        const $form = $(this);
        const $submitButton = $('#wisecampaign-dc-save-btn, .wisecampaign-form-footer input[type="submit"]');
        const $feedback = $('#wisecampaign-dc-feedback');
        const originalButtonText = $submitButton.val();

        // Show "Saving..." status
        $submitButton.val('Saving Changes...');
        $submitButton.prop('disabled', true);
        $feedback.removeClass('show error').text('');

        $.ajax({
            url: wiseCampaignDcAdmin.ajax_url,
            type: 'POST',
            data: {
                action: 'wisecampaign_dc_save_settings',
                nonce: wiseCampaignDcAdmin.save_nonce,
                form_data: $form.serialize()
            },
            success: function (response) {
                if (response.success) {
                    $feedback.text(response.data.message || 'Settings Saved!').addClass('show');
                    setTimeout(() => $feedback.removeClass('show'), 3500);
                } else {
                    const errorMessage = (response.data && response.data.message) ? response.data.message : 'An unknown error occurred.';
                    $feedback.text(errorMessage).addClass('show error');
                }
            },
            error: function () {
                $feedback.text('Request failed. Please try again.').addClass('show error');
            },
            complete: function () {
                $submitButton.val(originalButtonText);
                $submitButton.prop('disabled', false);
            }
        });
    });
});