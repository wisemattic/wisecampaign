/*
 * Exit-intent popup versions of the banner templates. Each popup keeps its
 * banner's colors, scene and badge; only the sizing and the "before you go"
 * copy below change. The coupon code and button link are never replaced, so
 * switching templates keeps the merchant's own code and URL.
 */

const inDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Popup-only settings, on top of the banner defaults. */
export const POPUP_DEFAULTS = {
    isActive: false,
    showSubHeadline: true,
    showCouponCode: true,
    couponCode: 'SAVE10',
    showTimer: true,
    endDate: inDays(7),
    endTime: '23:59',
    // An empty link copies the code and closes the popup, so the visitor stays on the page.
    ctaUrl: '',
    showDecline: true,
    declineText: "No thanks, I'll pay full price",
    showClose: true,
    // Behavior
    showOnMobile: true,
    mobileTrigger: 'scroll-up',
    mobileDelay: 10,
    frequencyDays: 1
};

// Sizes that suit a popup card rather than a thin bar.
const CLASSIC_POPUP_STYLE = {
    headlineSize: '30px',
    subHeadlineSize: '15px',
    timerLabel: 'Offer ends in',
    daysLabel: 'Days',
    hoursLabel: 'Hrs',
    minutesLabel: 'Min',
    secondsLabel: 'Sec'
};

const SEASONAL_POPUP_STYLE = {
    halloween: { headlineSize: '38px', subHeadlineSize: '17px' },
    blackfriday: { headlineSize: '44px', subHeadlineSize: '16px' },
    newyear: { headlineSize: '36px', subHeadlineSize: '17px' },
    christmas: { headlineSize: '38px', subHeadlineSize: '17px' },
    valentine: { headlineSize: '36px', subHeadlineSize: '17px' },
    eid: { headlineSize: '36px', subHeadlineSize: '17px' },
    flashsale: { headlineSize: '44px', subHeadlineSize: '16px' }
};

// "Before you go" copy per template. Seasonal popups show the sub-headline above the headline.
export const POPUP_TEMPLATE_COPY = {
    'holiday-gradient': {
        headline: "Wait! Don't Leave Yet",
        headlineHighlight: '',
        subHeadline: "Here's 10% off your order, just for you.",
        ctaText: 'Claim My Discount'
    },
    'midnight-solid': {
        headline: 'Before You Go…',
        headlineHighlight: 'Take 15% Off',
        subHeadline: 'Use your code at checkout before the timer runs out.',
        ctaText: 'Unlock My Offer'
    },
    'sunset-glow': {
        headline: 'Leaving So Soon?',
        headlineHighlight: 'Shipping Is on Us',
        subHeadline: 'Finish your order now and we cover the delivery.',
        ctaText: 'Get Free Shipping',
        // The default yellow highlight disappears on this orange background.
        highlightColor: '#7C2D12'
    },
    'bogo-special': {
        headline: 'Hold On!',
        headlineHighlight: 'Buy 1, Get 1 Free',
        subHeadline: 'Your favorites qualify for our BOGO deal, today only.',
        ctaText: 'Shop BOGO Deals',
        bogoText: 'BOGO'
    },
    'hosting-promo': {
        headline: 'Wait! Get 10% Off Hosting',
        headlineHighlight: '',
        subHeadline: 'On 12-month plans and longer. Your code is below.',
        ctaText: 'Claim Offer'
    },
    'halloween-haunted-night': {
        subHeadline: 'Leaving already? 🎃',
        headline: "Don't Get Spooked by",
        headlineHighlight: 'Full Price',
        ctaText: 'Grab the Deal'
    },
    'halloween-pumpkin-patch': {
        subHeadline: 'Wait! A treat before you go 🍬',
        headline: 'Take 40% Off',
        headlineHighlight: 'Everything',
        ctaText: 'Claim My Treat'
    },
    'halloween-witching-hour': {
        subHeadline: 'One last spell before you leave 🕸️',
        headline: 'Bewitching Savings',
        headlineHighlight: 'Just for You',
        ctaText: 'Claim Offer'
    },
    'blackfriday-gold-rush': {
        subHeadline: "Wait! Don't miss out",
        headline: 'Black Friday',
        headlineHighlight: 'Extra Savings',
        ctaText: 'Shop Now'
    },
    'blackfriday-red-alert': {
        subHeadline: 'Before you go 🔥',
        headline: 'Doorbusters End',
        headlineHighlight: 'Soon',
        ctaText: 'Grab the Deal'
    },
    'blackfriday-cyber-neon': {
        subHeadline: 'Logging off? 💻',
        headline: 'Cyber Deals',
        headlineHighlight: "Won't Wait",
        ctaText: 'Shop Cyber Deals'
    },
    'newyear-midnight-fireworks': {
        subHeadline: 'Wait! ✨',
        headline: 'Start the Year',
        headlineHighlight: 'With Savings',
        ctaText: 'Shop the Sale'
    },
    'newyear-golden-countdown': {
        subHeadline: 'Before the clock strikes ⏳',
        headline: "Don't Miss the",
        headlineHighlight: 'Countdown Deal',
        ctaText: 'Celebrate & Save'
    },
    'newyear-champagne-toast': {
        subHeadline: 'Leaving the party? 🥂',
        headline: 'Pop the Bubbly,',
        headlineHighlight: 'Save Big',
        ctaText: 'Toast to Savings'
    },
    'flashsale-lightning': {
        subHeadline: 'Wait! ⚡',
        headline: 'This Deal Ends',
        headlineHighlight: 'Tonight',
        ctaText: 'Grab It Now'
    },
    'flashsale-rocket': {
        subHeadline: 'Leaving already? 🚀',
        headline: 'Launch Your',
        headlineHighlight: 'Savings',
        ctaText: 'Blast Off'
    },
    'flashsale-stopwatch': {
        subHeadline: 'Hurry ⏱️',
        headline: "Time's Almost Up",
        headlineHighlight: 'Save Now',
        ctaText: 'Beat the Clock'
    },
    'christmas-snowy-village': {
        subHeadline: 'Wait! A gift before you go 🎁',
        headline: 'Unwrap',
        headlineHighlight: 'Extra Savings',
        ctaText: 'Unwrap My Gift'
    },
    'christmas-cozy-tree': {
        subHeadline: 'Leaving so soon? 🎄',
        headline: 'Your Holiday Deal',
        headlineHighlight: 'Is Waiting',
        ctaText: 'Claim My Deal'
    },
    'christmas-santa-sleigh': {
        subHeadline: "Don't miss the sleigh 🦌",
        headline: 'Last Call for',
        headlineHighlight: 'Christmas Savings',
        ctaText: 'Shop Before Santa'
    },
    'valentine-heart-balloons': {
        subHeadline: 'Before you go 💘',
        headline: 'A Little Love',
        headlineHighlight: 'From Us to You',
        ctaText: 'Claim My Gift'
    },
    'valentine-love-letter': {
        subHeadline: 'We wrote you a note 💌',
        headline: "Here's a Sweet",
        headlineHighlight: 'Discount',
        ctaText: 'Open My Offer'
    },
    'valentine-rose-garden': {
        subHeadline: 'Leaving already? 🌹',
        headline: "Don't Leave",
        headlineHighlight: 'Empty-Handed',
        ctaText: 'Get My Discount'
    },
    'eid-mosque-skyline': {
        subHeadline: 'Eid Mubarak 🌙',
        headline: 'A Special Gift',
        headlineHighlight: 'Before You Go',
        ctaText: 'Claim My Eid Gift'
    },
    'eid-lantern-night': {
        subHeadline: 'Wait! ✨',
        headline: 'Your Eid Offer',
        headlineHighlight: 'Is Still Glowing',
        ctaText: 'Shop the Eid Sale'
    },
    'eid-golden-crescent': {
        subHeadline: "Don't miss out 🤲",
        headline: 'Blessed Savings',
        headlineHighlight: 'Just for You',
        ctaText: 'Get My Discount'
    }
};

/** Popup sizing and copy for a template, applied over its banner design. */
export const getPopupTemplateOverrides = (template) => {
    const layout = template.config.layout || 'classic';
    return {
        ...(SEASONAL_POPUP_STYLE[layout] || CLASSIC_POPUP_STYLE),
        ...(POPUP_TEMPLATE_COPY[template.id] || {})
    };
};
