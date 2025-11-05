jQuery(document).ready(function ($) {
    'use strict';

    $('.wisecart-color-picker').wpColorPicker();

    $('#wisecart-settings-form').on('submit', function (e) {
        e.preventDefault();

        var form = $(this);
        var saveButton = $('#wisecart-save-btn');
        var feedbackSpan = form.find('.wisecart-save-feedback');
        var spinner = form.find('.spinner');
        
        var formData = form.serialize();
        
        var data = formData + '&action=wisecart_save_settings';

        $.ajax({
            type: 'POST',
            url: wiseCartAdmin.ajax_url,
            data: data,
            beforeSend: function () {
                saveButton.prop('disabled', true);
                spinner.addClass('is-active');
                feedbackSpan.text('').removeClass('success error');
            },
            success: function (response) {
                if (response.success) {
                    feedbackSpan.text(response.data.message).addClass('success');
                } else {
                    var errorMessage = response.data.message || 'An unknown error occurred.';
                    feedbackSpan.text(errorMessage).addClass('error');
                }
            },
            error: function () {
                feedbackSpan.text('Request failed. Please try again.').addClass('error');
            },
            complete: function () {
                spinner.removeClass('is-active');
                saveButton.prop('disabled', false);

                setTimeout(function () {
                    feedbackSpan.fadeOut(300, function () {
                        $(this).text('').removeClass('success error').show();
                    });
                }, 3000);
            }
        });
    });
});