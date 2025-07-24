export const updateCssTopHeight = (height: string) => {
    // Set the --wpadminbar-top variable
    document.documentElement.style.setProperty('--wpadminbar-top', height);

    // Calculate the new height
    const heightValue = parseInt(height, 10);
    const newHeight = `${heightValue + 3}px`;

    // Set the --wpwrap-top variable
    document.documentElement.style.setProperty('--wpwrap-top', newHeight);
};

// Function to convert RGB to HEX
export const rgbToHex = (rgb: any) => {
    const result = rgb.match(/\d+/g); // Extract the RGB values
    return result
        ? `#${((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2]))
            .toString(16)
            .slice(1)
            .toUpperCase()}`
        : null;
};


export const mapDbColumnsToFormValues = (dbValues: DbColumns): FormValues => {

    return {
        id: dbValues.id,
        banner: {
            general: {
                width: dbValues.width,
                height: dbValues.height,
                bgImage: dbValues.bg_image,
                bannerColor: dbValues.banner_color
            },
            headline: {
                text: dbValues.headline_text,
                color: dbValues.headline_text_color,
                align: dbValues.headline_text_align,
                fontSize: dbValues.headline_font_size,
                fontFamily: dbValues.headline_font_family,
                fontWeight: dbValues.headline_font_weight,
                fontStyle: dbValues.headline_font_style,
            },
            subHeadline: {
                text: dbValues.sub_headline_text,
                color: dbValues.sub_headline_text_color,
                align: dbValues.sub_headline_text_align,
                fontSize: dbValues.sub_headline_font_size,
                fontFamily: dbValues.sub_headline_font_family,
                fontWeight: dbValues.sub_headline_font_weight,
                fontStyle: dbValues.sub_headline_font_style,
            },
            bogo: {
                imgSrc: dbValues.bogo_img_src,
                alt: dbValues.bogo_alt,
                width: dbValues.bogo_width,
                height: dbValues.bogo_height,
            },
            countdown: {
                component: dbValues.countdown_component,
                text: dbValues.countdown_text,
                timer: dbValues.countdown_timer,
                color: dbValues.countdown_color,
                fontSize: dbValues.countdown_font_size,
                fontFamily: dbValues.countdown_font_family,
                fontWeight: dbValues.countdown_font_weight,
                fontStyle: dbValues.countdown_font_style,
            },
            button: {
                width: dbValues.button_width,
                height: dbValues.button_height,
                text: dbValues.button_text,
                color: dbValues.button_text_color,
                bgColor: dbValues.button_bg_color,
                padding: dbValues.button_padding,
                borderRadius: dbValues.button_border_radius,
                borderColor: dbValues.button_border_color,
                hoverBgColor: dbValues.button_hover_bg_color,
                hoverBorderColor: dbValues.button_hover_border_color,
                hoverTextColor: dbValues.button_hover_text_color,
                link: dbValues.button_link,
                fontSize: dbValues.button_font_size,
                fontFamily: dbValues.button_font_family,
                fontWeight: dbValues.button_font_weight,
                fontStyle: dbValues.button_font_style,
            },
        },
    isActive: dbValues.is_selected
    };
};

export const mapFormValuesToDbColumns = (formValues: FormValues): DbColumns => {
    return {
        id: formValues.id,
        width: formValues.banner.general.width,
        height: formValues.banner.general.height,
        bg_image: formValues.banner.general.bgImage,
        banner_color: formValues.banner.general.bannerColor,
        headline_text: formValues.banner.headline.text,
        headline_text_color: formValues.banner.headline.color,
        headline_text_align: formValues.banner.headline.align,
        headline_font_size: formValues.banner.headline.fontSize,
        headline_font_family: formValues.banner.headline.fontFamily,
        headline_font_weight: formValues.banner.headline.fontWeight,
        headline_font_style: formValues.banner.headline.fontStyle,
        sub_headline_text: formValues.banner.subHeadline.text,
        sub_headline_text_color: formValues.banner.subHeadline.color,
        sub_headline_text_align: formValues.banner.subHeadline.align,
        sub_headline_font_size: formValues.banner.subHeadline.fontSize,
        sub_headline_font_family: formValues.banner.subHeadline.fontFamily,
        sub_headline_font_weight: formValues.banner.subHeadline.fontWeight,
        sub_headline_font_style: formValues.banner.subHeadline.fontStyle,
        bogo_img_src: formValues.banner.bogo.imgSrc,
        bogo_alt: formValues.banner.bogo.alt,
        bogo_width: formValues.banner.bogo.width,
        bogo_height: formValues.banner.bogo.height,
        countdown_component: formValues.banner.countdown.component,
        countdown_text: formValues.banner.countdown.text,
        countdown_timer: formValues.banner.countdown.timer,
        countdown_color: formValues.banner.countdown.color,
        countdown_font_size: formValues.banner.countdown.fontSize,
        countdown_font_family: formValues.banner.countdown.fontFamily,
        countdown_font_weight: formValues.banner.countdown.fontWeight,
        countdown_font_style: formValues.banner.countdown.fontStyle,
        button_width: formValues.banner.button.width,
        button_height: formValues.banner.button.height,
        button_text: formValues.banner.button.text,
        button_text_color: formValues.banner.button.color,
        button_padding: formValues.banner.button.padding,
        button_bg_color: formValues.banner.button.bgColor,
        button_border_radius: formValues.banner.button.borderRadius,
        button_border_color: formValues.banner.button.borderColor,
        button_hover_bg_color: formValues.banner.button.hoverBgColor,
        button_hover_border_color: formValues.banner.button.hoverBorderColor,
        button_hover_text_color: formValues.banner.button.hoverTextColor,
        button_link: formValues.banner.button.link,
        button_font_size: formValues.banner.button.fontSize,
        button_font_family: formValues.banner.button.fontFamily,
        button_font_weight: formValues.banner.button.fontWeight,
        button_font_style: formValues.banner.button.fontStyle,
    } as DbColumns
};

