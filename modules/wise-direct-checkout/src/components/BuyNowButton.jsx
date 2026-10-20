import React from 'react';

/**
 * Renders the Buy Now button with the same classes the storefront prints, so the
 * storefront stylesheet (includes/css/direct-checkout.css) draws it identically.
 * `button` holds the effective settings (free users already reset to defaults).
 */
export default function BuyNowButton({ button, icons, template, animation, hover, className = '', style = {}, label }) {
    const tpl = template ?? button.dc_button_template;
    const anim = animation ?? button.dc_button_animation;
    const hov = hover ?? button.dc_button_hover;
    const iconSvg = button.dc_button_icon !== 'none' ? icons[button.dc_button_icon] : '';

    const classes = [
        'wisecampaign-buy-now-button',
        tpl !== 'classic' && `wc-tpl-${tpl}`,
        anim !== 'none' && `wc-anim-${anim}`,
        hov !== 'none' && `wc-hover-${hov.replace('_', '-')}`,
        className,
    ].filter(Boolean).join(' ');

    const icon = iconSvg ? <span className="wisecampaign-dc-icon" dangerouslySetInnerHTML={{ __html: iconSvg }} /> : null;

    return (
        <span
            className={classes}
            style={{ '--wc-dc-bg': button.dc_button_color, '--wc-dc-text': button.dc_button_text_color, ...style }}
        >
            {button.dc_icon_position !== 'right' && icon}
            <span>{label ?? (button.dc_button_text || 'Buy Now')}</span>
            {button.dc_icon_position === 'right' && icon}
        </span>
    );
}
