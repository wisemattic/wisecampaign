jQuery(document).ready(function ($) {
    // Live preview functionality
    $('.wisecampaign-color-picker').wpColorPicker();

    $('#dc_button_color').wpColorPicker({
        change: function (e, ui) {
            $('#preview-button').css({ 'backgroundColor': ui.color.toString(), 'borderColor': ui.color.toString() });
        }
    });

    $('#dc_button_text_color').wpColorPicker({
        change: function (e, ui) {
            $('#preview-button').css('color', ui.color.toString());
        }
    });

    $('#dc_button_text').on('keyup', function () {
        $('#preview-button').text($(this).val() || 'Buy Now');
    });

    $('#dc_redirect_to').on('change', function () {
        $(this).val() === 'custom' ? $('#dc_redirect_custom_url').show() : $('#dc_redirect_custom_url').hide();
    }).trigger('change');

    // --- AJAX Save Handler ---
    $('#wisecampaign-dc-settings-form').on('submit', function (e) {
        e.preventDefault(); // Stop page from reloading

        const $form = $(this);
        const $submitButton = $form.find('.button-primary');
        const $feedback = $('#wisecampaign-dc-feedback');
        const originalButtonText = $submitButton.val();

        // Show "Saving..." status
        $submitButton.val('Saving...');
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
                    $feedback.text('Settings Saved!').addClass('show');
                    setTimeout(() => $feedback.removeClass('show'), 3000);
                } else {
                    const errorMessage = response.data.message || 'An unknown error occurred.';
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