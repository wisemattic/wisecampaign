jQuery(document).ready(function ($) {

    const form = $('#wisecampaign-settings-form');
    const preview = $('#wisecampaign-notification-preview');

    // --- Main Update Function ---
    function updatePreview() {
        const root = document.documentElement;

        // Update CSS variables for live styling from each form field
        root.style.setProperty('--notification-bg-color', form.find('[name*="[background_color]"]').val());
        root.style.setProperty('--notification-border-color', form.find('[name*="[border_color]"]').val());
        root.style.setProperty('--notification-border-width', form.find('[name*="[border_width]"]').val() + 'px');
        root.style.setProperty('--notification-border-radius', form.find('[name*="[border_radius]"]').val() + 'px');
        root.style.setProperty('--notification-font-family', "'" + form.find('[name*="[font_family]"]').val() + "'");
        preview.find('img').css('border-radius', form.find('[name*="[image_radius]"]').val() + 'px');

        // Update template style attribute
        const selectedTemplate = form.find('input[name*="[template]"]:checked').val();
        preview.attr('data-template', selectedTemplate);

        // Truncate product name if necessary
        const productNameElem = preview.find('.product-name');
        let productName = productNameElem.text();
        const maxLength = 20; // Adjust as needed for your design

        if (productName.length > maxLength) {
            productName = productName.substring(0, maxLength - 1) + '…';
        }
        productNameElem.text(productName);
    }

    const templatePresets = {
        'template_1': {
            'background_color': '#FFFFFF',
            'border_color': '#ffffffff', 
            'border_width': 0,
            'border_radius': 10,
            'image_radius': 10
        },
        'template_2': {
            'background_color': '#E0E5EC', 
            'border_color': '#E0E5EC', 
            'border_width': 0,
            'border_radius': 50, 
            'image_radius': 50 
        }
    };

    // --- Event Handlers ---

    // Tab Switching
    $('.wisecampaign-tabs-nav a').on('click', function (e) {
        e.preventDefault();
        const target = $(this).attr('href');

        $('.wisecampaign-tabs-nav a').removeClass('nav-tab-active');
        $(this).addClass('nav-tab-active');

        $('.tab-content').removeClass('active');
        $(target).addClass('active');

        window.history.pushState(null, '', target);
    });

    // Handle back/forward browser buttons for tabs
    $(window).on('popstate', function () {
        const hash = window.location.hash || '#templates';
        $('.wisecampaign-tabs-nav a[href="' + hash + '"]').click();
    });

    // Activate tab based on URL hash on page load
    if (window.location.hash) {
        $('.wisecampaign-tabs-nav a[href="' + window.location.hash + '"]').click();
    }

    // Modern tab switching for new layout
    $('.wisecampaign-tab').on('click', function () {
        var tab = $(this).data('tab');
        $('.wisecampaign-tab').removeClass('active').attr('aria-selected', 'false');
        $(this).addClass('active').attr('aria-selected', 'true');
        $('.wisecampaign-tab-content').hide();
        $('#wisecampaign-tab-' + tab).show();
    });
    // Show first tab by default
    $('.wisecampaign-tab.active').trigger('click');
    
    // Settings Card Toggle
    $('.wisecampaign-settings-card-header').on('click', function() {
        const card = $(this).closest('.wisecampaign-settings-card');
        const toggle = $(this).find('.wisecampaign-settings-card-toggle');
        
        card.toggleClass('collapsed');
        
        if (card.hasClass('collapsed')) {
            toggle.html('&#9650;'); // Up arrow
        } else {
            toggle.html('&#9660;'); // Down arrow
        }
    });
    
    // Initialize all toggle buttons to expanded state
    $('.wisecampaign-settings-card-toggle').html('&#9660;');

    // Template Selection
    $('.template-card').on('click', function () {
        const card = $(this);
        const templateId = card.data('template');
        const presets = templatePresets[templateId];

        // Update the selected radio button and apply the "selected" class
        card.find('input[type="radio"]').prop('checked', true);
        $('.template-card').removeClass('selected');
        card.addClass('selected');

        // If presets exist, apply them to the form fields
        if (presets) {
            form.find('[name*="[background_color]"]').wpColorPicker('color', presets.background_color);
            form.find('[name*="[border_color]"]').wpColorPicker('color', presets.border_color);

            form.find('[name*="[border_width]"]').prev('.slider-input').val(presets.border_width);
            form.find('[name*="[border_width]"]').val(presets.border_width);

            form.find('[name*="[border_radius]"]').prev('.slider-input').val(presets.border_radius);
            form.find('[name*="[border_radius]"]').val(presets.border_radius);

            form.find('[name*="[image_radius]"]').prev('.slider-input').val(presets.image_radius);
            form.find('[name*="[image_radius]"]').val(presets.image_radius);
        }

        // Trigger the live preview to reflect all new settings
        updatePreview();
    });

    // Conditional field for Order Source
    function toggleOrderSourceFields() {
        const source = $('#wisecampaign_order_source_select').val();
        const $selectOrdersField = $('.wisecampaign-field-group').has('#wisecampaign-selected-orders-select');

        if (source === 'selected_orders') {
            $selectOrdersField.show();
        } else {
            $selectOrdersField.hide();
        }
    }
    toggleOrderSourceFields(); // Run on page load
    $('#wisecampaign_order_source_select').on('change', toggleOrderSourceFields);

    // Conditional field for Visibility
    function toggleVisibilityFields() {
        const visibility = $('#wisecampaign_visibility_select').val();
        const $selectPagesField = $('.wisecampaign-field-group').has('#wisecampaign-specific-pages-select');

        if (visibility === 'specific_pages') {
            $selectPagesField.show();
        } else {
            $selectPagesField.hide();
        }
    }
    toggleVisibilityFields(); // Run on page load
    $('#wisecampaign_visibility_select').on('change', toggleVisibilityFields);

    // Live preview updates for sliders
    $('.slider-input').on('input', function () {
        $(this).next('.slider-value').val($(this).val());
        updatePreview();
    });
    $('.slider-value').on('input', function () {
        $(this).prev('.slider-input').val($(this).val());
        updatePreview();
    });

    // Live preview updates for other form inputs
    form.on('change', 'select, input[type="checkbox"]', updatePreview);

    // Initialize Color Pickers with live update callback
    $('.wp-color-picker-field').wpColorPicker({
        change: function (event, ui) {
            updatePreview();
        },
        clear: function () {
            updatePreview();
        }
    });

    // Function to toggle visibility of all sales notification content
    function toggleAllSalesNotificationContent() {
        const isEnabled = $('#wisecampaign-toggle-enabled').is(':checked');
        const $allContent = $('.wisecampaign-admin-sidebar, .wisecampaign-admin-preview');
        
        if (isEnabled) {
            $allContent.removeClass('hidden');
        } else {
            $allContent.addClass('hidden');
        }
    }
    
    // --- Initial Load ---
    updatePreview();
    toggleAllSalesNotificationContent(); // Run on page load

    // --- AJAX Handlers ---

    // Enable/Disable Toggle
    $(document).on('change', '#wisecampaign-toggle-enabled', function (e) {
        e.preventDefault();

        const $toggle = $(this);
        const isChecked = $toggle.is(':checked');
        const newStatus = isChecked ? '1' : '0';
        const $feedback = $('#wisecampaign-status-feedback');

        $feedback.removeClass('show error').text('');
        
        // Toggle visibility of all content immediately for better UX
        toggleAllSalesNotificationContent();

        $.ajax({
            url: wiseCampaignAdmin.ajax_url,
            type: 'POST',
            data: {
                action: 'wisecampaign_toggle_status',
                nonce: wiseCampaignAdmin.toggle_nonce,
                status: newStatus,
            },
            success: function (response) {
                if (response.success) {
                    $feedback.text('Saved!').addClass('show');
                    setTimeout(() => $feedback.removeClass('show'), 2000);
                } else {
                    $feedback.text('Error!').addClass('show error');
                    $toggle.prop('checked', !isChecked); 
                    toggleAllSalesNotificationContent(); // Revert UI if there was an error
                    setTimeout(() => $feedback.removeClass('show error'), 3000);
                }
            },
            error: function () {
                $feedback.text('Failed!').addClass('show error');
                $toggle.prop('checked', !isChecked); 
                setTimeout(() => $feedback.removeClass('show error'), 3000);
            }
        });
    });

    // Save All Settings Button
    form.on('submit', function (e) {
        e.preventDefault();

        const $form = $(this);
        const $submitButton = $('#wisecampaign-set-now-button');
        const $feedback = $('#wisecampaign-form-feedback');
        const originalButtonText = $submitButton.val();

        $submitButton.val('Saving...').prop('disabled', true);
        $feedback.removeClass('show error').text('');

        $.ajax({
            url: wiseCampaignAdmin.ajax_url,
            type: 'POST',
            data: {
                action: 'wisecampaign_save_all_settings',
                nonce: wiseCampaignAdmin.save_nonce,
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
                $submitButton.val(originalButtonText).prop('disabled', false);
            }
        });
    });

    // Reset All Settings Button
    $('#wisecampaign-reset-button').on('click', function (e) {
        e.preventDefault();

        if (!confirm('Are you sure you want to reset all settings to their default values? This cannot be undone.')) {
            return;
        }

        const $button = $(this);
        const $feedback = $('#wisecampaign-form-feedback');
        const originalButtonText = $button.text();

        $button.text('Resetting...').prop('disabled', true);
        $feedback.removeClass('show error').text('');

        $.ajax({
            url: wiseCampaignAdmin.ajax_url,
            type: 'POST',
            data: {
                action: 'wisecampaign_reset_settings',
                nonce: wiseCampaignAdmin.reset_nonce
            },
            success: function (response) {
                if (response.success) {
                    updateFormFields(response.data); // Update UI with default settings
                    updatePreview(); // Refresh the live preview
                    $feedback.text('Settings Reset!').addClass('show');
                    setTimeout(() => $feedback.removeClass('show'), 3000);
                } else {
                    $feedback.text('Reset failed.').addClass('show error');
                }
            },
            error: function () {
                $feedback.text('Request failed.').addClass('show error');
            },
            complete: function () {
                $button.text(originalButtonText).prop('disabled', false);
            }
        });
    });

    /**
     * Helper function to populate all form fields from a settings object.
     * @param {object} settings The settings object from the server.
     */
    function updateFormFields(settings) {
        // Toggles
        $('#wisecampaign-toggle-enabled').prop('checked', settings.enabled === '1');
        $('#wisecampaign-toggle-random_show').prop('checked', settings.random_show === '1');
        $('#wisecampaign-toggle-loop').prop('checked', (typeof settings.loop === 'undefined' || settings.loop === '1'));

        // Selects
        form.find('[name*="[template]"][value="' + settings.template + '"]').prop('checked', true);
        form.find('[name*="[position]"]').val(settings.position);
        form.find('[name*="[font_family]"]').val(settings.font_family);
        form.find('[name*="[source]"]').val(settings.source).trigger('change');
        form.find('[name*="[visibility]"]').val(settings.visibility).trigger('change');

        // Multi-selects
        $('#wisecampaign-selected-orders-select').val(settings.selected_orders || []);
        $('#wisecampaign-specific-pages-select').val(settings.specific_pages || []);

        // Colors
        form.find('[name*="[background_color]"]').wpColorPicker('color', settings.background_color);
        form.find('[name*="[border_color]"]').wpColorPicker('color', settings.border_color);

        // Sliders & Numbers
        form.find('[name*="[border_width]"]').val(settings.border_width).prev('.slider-input').val(settings.border_width);
        form.find('[name*="[border_radius]"]').val(settings.border_radius).prev('.slider-input').val(settings.border_radius);
        form.find('[name*="[image_radius]"]').val(settings.image_radius).prev('.slider-input').val(settings.image_radius);
        form.find('[name*="[display_time]"]').val(settings.display_time);
        form.find('[name*="[delay_time]"]').val(settings.delay_time);

        // Update template card visual
        $('.template-card').removeClass('selected');
        $('.template-card[data-template="' + settings.template + '"]').addClass('selected');
    }

    // --- Collapsible Settings Cards ---
    $('.wisecampaign-settings-card-header').on('click', function (e) {
        // Only toggle if not clicking on a button (like the toggle)
        if ($(e.target).is('button')) return;
        var $card = $(this).closest('.wisecampaign-settings-card');
        $card.toggleClass('collapsed');
        
        // Update the toggle button text/icon
        var $toggle = $card.find('.wisecampaign-card-toggle');
        if ($card.hasClass('collapsed')) {
            $toggle.html('&#9650;');
        } else {
            $toggle.html('&#9660;');
        }
    });
    
    $('.wisecampaign-card-toggle').on('click', function (e) {
        e.stopPropagation();
        var $card = $(this).closest('.wisecampaign-settings-card');
        $card.toggleClass('collapsed');
        
        // Update the toggle button text/icon
        if ($card.hasClass('collapsed')) {
            $(this).html('&#9650;');
        } else {
            $(this).html('&#9660;');
        }
    });
    
    // Start with all expanded
    $('.wisecampaign-settings-card').removeClass('collapsed');
    $('.wisecampaign-card-toggle').html('&#9660;');

});