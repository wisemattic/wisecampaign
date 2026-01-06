interface TextStyle {
    text: string;
    color: string;
    align: 'left' | 'center' | 'right';
    fontSize: string;
    fontFamily: string;
    fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | string;
    fontStyle: string;
    show: boolean;
}

interface Bogo {
    imgSrc: File | string | null;
    alt: string;
    width: string;
    height: string;
    show: boolean;
}

interface Countdown {
    component: string | null,
    text: string;
    timer: string;
    color: string;
    fontSize: string;
    fontFamily: string;
    fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | string;
    fontStyle: string;
    show: boolean;
}

interface Button {
    width: string;
    height: string;
    text: string;
    padding: string;
    color: string | null;
    bgColor: string | null;
    borderColor: string;
    borderRadius: string;
    hoverBgColor: string;
    hoverBorderColor: string;
    hoverTextColor: string;
    link: string;
    fontSize: string;
    fontFamily: string;
    fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | string;
    fontStyle: string;
    show: boolean;
}

interface General {
    width: string;
    height: string;
    bgImage: File | string | null;
    bannerColor: string;
}



interface FormValues {
    id: number | null,
    banner: {
        general: General,
        headline: TextStyle;
        subHeadline: TextStyle;
        bogo: Bogo;
        countdown: Countdown;
        button: Button;
    },
    isActive: boolean | null,
    maxHeadlineWith: string | null
}

interface DbColumns {
    id: number;
    height: string;
    width: string;
    bg_image: File | string | null;
    banner_color: string;
    headline_text: string;
    headline_text_color: string;
    headline_text_align: 'left' | 'center' | 'right' ;
    headline_font_size: string;
    headline_font_family: string;
    headline_font_weight: string;
    headline_font_style: string;
    sub_headline_text: string;
    sub_headline_text_color: string;
    sub_headline_text_align: 'left' | 'center' | 'right' ;
    sub_headline_font_size: string;
    sub_headline_font_family: string;
    sub_headline_font_weight: string;
    sub_headline_font_style: string;
    bogo_img_src: File | string | null;
    bogo_alt: string;
    bogo_width: string;
    bogo_height: string;
    countdown_component: string | null;
    countdown_text: string;
    countdown_timer: string;
    countdown_color: string;
    countdown_font_size: string;
    countdown_font_family: string;
    countdown_font_weight: string;
    countdown_font_style: string;
    button_width: string;
    button_padding: string;
    button_height: string;
    button_text: string;
    button_text_color: string;
    button_bg_color: string;
    button_border_radius: string;
    button_border_color: string;
    button_hover_bg_color: string;
    button_hover_border_color: string;
    button_hover_text_color: string;
    button_link: string;
    button_font_size: string;
    button_font_family: string;
    button_font_weight: string;
    button_font_style: string;
    is_selected: boolean;
    show_button_section: boolean;
    show_bogo_section: boolean;
    show_countdown_section: boolean;
    show_headline_section: boolean;
    show_sub_headline_section: boolean;
}
