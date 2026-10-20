import React, { useState, useEffect } from 'react';
import {
    Monitor,
    Smartphone,
    Eye,
    Save,
    ChevronLeft,
    Type,
    Palette,
    Settings as SettingsIcon,
    Layout,
    Flame,
    CheckCircle2,
    X,
    TrendingUp,
    AlertCircle,
    Zap,
    Star,
    ShoppingBag,
    Search,
    Clock,
    MousePointer2,
    Image as ImageIcon,
    Bold,
    Italic,
    Underline,
    Calendar,
    ArrowRight,
    Link as LinkIcon,
    Power,
    Crown,
    Sparkles,
    Check,
    Lock,
    BarChart3
} from 'lucide-react';
import SeasonalBanner from './templates/seasonal/SeasonalBanner';
import { SEASONAL_PACKS } from './templates/seasonal/packs';
import { HalloweenSwatch } from './templates/halloween/HalloweenArt';
import ScaledPreview from './components/ScaledPreview';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import { getTimeLeft, getUpcomingHalloween, getUpcomingBlackFriday, getUpcomingNewYear } from './utils/countdown';
import { copyText } from './utils/clipboard';
import { createTracker } from './utils/analytics';

const DEFAULT_CONFIG = {
    id: 'holiday-gradient',
    name: 'Holiday Sale Gradient',
    layout: 'classic',
    bgType: 'gradient',
    bgSolid: '#0F172A',
    bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    bgImage: '',
    bgEffect: 'none',
    bgEffectOpacity: 60,
    headline: 'Black Friday Mega Sale!',
    headlineHighlight: '',
    highlightColor: '#FCD34D',

    headlineSize: '16px',
    headlineColor: '#FFFFFF',
    headlineWeight: '900',
    subHeadline: 'Use code: SAVE50 for 50% off everything',
    subHeadlineSize: '12px',
    subHeadlineColor: '#E2E8F0',
    subHeadlineWeight: '500',
    showSubHeadline: true,
    showTimer: true,
    endDate: '2025-12-31',
    endTime: '23:59',
    timerLabel: 'OFFER ENDS IN:',
    timerTextColor: '#FFFFFF',
    timerBgColor: 'rgba(255, 255, 255, 0.1)',
    showCTA: true,
    ctaText: 'SHOP NOW',
    ctaUrl: 'https://myshop.com/sale',
    ctaBg: '#FCD34D',
    ctaTextColor: '#111827',
    ctaRadius: '12px',
    ctaAnimation: 'none',
    showBogoBadge: false,

    badgeType: 'text',
    badgeImage: '',
    badgeTopText: '',
    bogoText: '50% OFF',
    badgeBgColor: '#EF4444',
    badgeTextColor: '#FFFFFF',
    badgeRotation: '-12deg',
    badgePosition: 'left',
    badgeVerticalPosition: 'middle',
    timerLabelPosition: 'left',


    daysLabel: 'D',
    hoursLabel: 'H',
    minutesLabel: 'M',
    secondsLabel: 'S',
    enableRecursion: false,
    recurrenceUnit: 'hours',
    showCouponCode: false,
    couponCode: 'SAVE10',
    couponPlacement: 'bottom',
    scene: '',
    showClose: false,
    position: 'top',
    isSticky: false,
    hideBranding: false,
    isActive: true
};

// Design keys that belong to a layout. They reset to defaults when switching
// between layouts so e.g. seasonal sizing doesn't leak into a classic template.
const LAYOUT_STYLE_KEYS = [
    'headlineSize', 'headlineWeight', 'subHeadlineSize', 'subHeadlineWeight', 'highlightColor',
    'timerLabel', 'timerLabelPosition', 'timerTextColor', 'timerBgColor',
    'daysLabel', 'hoursLabel', 'minutesLabel', 'secondsLabel',
    'ctaRadius', 'ctaAnimation', 'bgEffect', 'bgEffectOpacity',
    'badgeType', 'badgeTopText', 'badgeRotation', 'badgePosition', 'badgeVerticalPosition',
    'badgeBgColor', 'badgeTextColor', 'scene', 'hwScene', 'showClose'
];

const TEMPLATE_CATEGORIES = [
    { id: 'all', label: 'All Templates' },
    { id: 'basic', label: 'Basic' },
    { id: 'halloween', label: 'Halloween', icon: '🎃' },
    { id: 'blackfriday', label: 'Black Friday', icon: '🛍️' },
    { id: 'newyear', label: 'New Year', icon: '🎆' }
];

const NEW_YEAR = getUpcomingNewYear();

// Shared settings for every seasonal (pack-based) template.
const SEASONAL_BASE = {
    bgType: 'gradient',
    headlineSize: '34px',
    subHeadlineSize: '22px',
    showSubHeadline: true,
    showTimer: true,
    endTime: '23:59',
    enableRecursion: false,
    timerLabel: '',
    daysLabel: 'Days',
    hoursLabel: 'Hours',
    minutesLabel: 'Mins',
    secondsLabel: 'Secs',
    showCTA: true,
    ctaRadius: '40px',
    ctaAnimation: 'glow',
    showBogoBadge: true,
    badgeType: 'text',
    showClose: true
};

const HALLOWEEN_BASE = {
    ...SEASONAL_BASE,
    layout: 'halloween',
    endDate: getUpcomingHalloween(),
    badgeBgColor: '#B97A3E',
    badgeTextColor: '#FFF4D6'
};

const BLACK_FRIDAY_BASE = {
    ...SEASONAL_BASE,
    layout: 'blackfriday',
    endDate: getUpcomingBlackFriday(),
    headlineSize: '38px',
    subHeadlineSize: '20px',
    daysLabel: 'Days',
    hoursLabel: 'Hrs',
    minutesLabel: 'Min',
    secondsLabel: 'Sec',
    ctaAnimation: 'shimmer'
};

const NEW_YEAR_BASE = {
    ...SEASONAL_BASE,
    layout: 'newyear',
    endDate: NEW_YEAR.endDate,
    headlineSize: '32px',
    subHeadlineSize: '20px'
};

const EmojiSwatch = ({ background, emoji }) => (
    <div className="w-full h-full rounded-lg flex items-center justify-center text-base leading-none" style={{ background }}>
        {emoji}
    </div>
);

const TEMPLATES = [
    {
        id: 'holiday-gradient',
        name: 'Ocean Gradient',
        style: 'Gradient',
        description: 'A vibrant blue gradient perfect for tech and electronics.',
        config: {
            bgType: 'gradient',
            bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            headlineColor: '#FFFFFF',
            subHeadlineColor: '#FFFFFF',
            ctaBg: '#FCD34D',
            ctaTextColor: '#111827'
        },
        icon: <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-400 to-blue-700" />
    },
    {
        id: 'midnight-solid',
        name: 'Midnight Premium',
        style: 'Solid',
        description: 'Deep navy professional look for high-end brands.',
        config: {
            bgType: 'solid',
            bgSolid: '#0F172A',
            headlineColor: '#FFFFFF',
            subHeadlineColor: '#FFFFFF',
            ctaBg: '#3B82F6',
            ctaTextColor: '#FFFFFF'
        },
        icon: <div className="w-full h-full rounded-lg bg-[#0F172A]" />
    },
    {
        id: 'sunset-glow',
        name: 'Sunset Glow',
        style: 'Gradient',
        description: 'Warm colors to drive urgency and excitement.',
        config: {
            bgType: 'gradient',
            bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
            headlineColor: '#FFFFFF',
            subHeadlineColor: '#FFFFFF',
            ctaBg: '#FFFFFF',
            ctaTextColor: '#EF4444'
        },
        icon: <div className="w-full h-full rounded-lg bg-gradient-to-br from-orange-400 to-red-600" />
    },
    {
        id: 'bogo-special',
        name: 'BOGO Special',
        style: 'Promo',
        description: 'Features a high-contrast BOGO badge to grab attention.',
        config: {
            bgType: 'solid',
            bgSolid: '#000000',
            headlineColor: '#FFFFFF',
            subHeadlineColor: '#FCD34D',
            ctaBg: '#FCD34D',
            ctaTextColor: '#000000',
            showBogoBadge: true,
            bogoText: '50% OFF'
        },
        icon: (
            <div className="w-full h-full rounded-lg bg-black flex items-center justify-center overflow-hidden relative">
                <div className="absolute -right-1 -top-1 w-6 h-6 bg-red-600 rounded-full border border-white/20 flex items-center justify-center text-[6px] font-black text-white rotate-12">BOGO</div>
                <div className="w-1/2 h-0.5 bg-yellow-400" />
            </div>
        )
    },
    {
        id: 'hosting-promo',
        name: 'Hosting Promo',
        style: 'Badge Left',
        description: 'High conversion design with prominent badge and timer.',
        config: {
            bgType: 'gradient',
            bgGradient: 'linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)',
            headline: 'Get 10% Off Hosting: on 12 months plans & Longer!',
            headlineColor: '#FFFFFF',
            headlineSize: '16px',
            subHeadline: 'Promocode: RECHARGE100',
            subHeadlineColor: '#E0F2FE',
            subHeadlineSize: '12px',
            showSubHeadline: true,
            showTimer: true,
            timerTextColor: '#FFFFFF',
            timerBgColor: 'rgba(255, 255, 255, 0.2)',
            timerLabel: '',
            timerLabelPosition: 'top',
            daysLabel: 'DAYS',
            hoursLabel: 'HOURS',
            minutesLabel: 'MIN',
            secondsLabel: 'SEC',
            showCTA: true,
            ctaText: 'Claim Offer >',
            ctaBg: '#FACC15',
            ctaTextColor: '#000000',
            ctaRadius: '4px',
            showBogoBadge: true,
            badgeType: 'text',
            bogoText: '50% OFF',
            badgeBgColor: '#FACC15',
            badgeTextColor: '#000000',
            badgeRotation: '0deg'
        },
        icon: (
            <div className="w-full h-full rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 flex items-center px-4 justify-between relative overflow-hidden">
                <div className="absolute -left-1 -top-1 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[5px] font-black text-black shadow-sm">50%</div>
                <div className="flex-1 ml-6 h-2 bg-white/20 rounded-sm"></div>
                <div className="w-10 h-3 bg-yellow-400 rounded-sm ml-2"></div>
            </div>
        )
    },
    {
        id: 'halloween-haunted-night',
        name: 'Haunted Night',
        style: 'Halloween',
        category: 'halloween',
        isPro: true,
        description: 'Moonlit castle, flying bats, a witch-hat pumpkin and a swinging wooden offer sign.',
        config: {
            ...HALLOWEEN_BASE,
            scene: 'castle',
            bgGradient: 'linear-gradient(90deg, #2A1468 0%, #4321A8 36%, #5230C6 68%, #4C29B8 100%)',
            subHeadline: 'Halloween Sale is Live 🎃',
            subHeadlineColor: '#D8CCFF',
            headline: 'Spooky Savings on',
            headlineHighlight: 'All Products',
            headlineColor: '#FFFFFF',
            highlightColor: '#FFD43B',
            timerTextColor: '#FFFFFF',
            badgeTopText: 'FLAT',
            bogoText: '35% OFF',
            ctaText: 'Grab the Deal',
            ctaBg: '#FF8A1F',
            ctaTextColor: '#FFFFFF',
            bgEffect: 'none'
        },
        icon: <HalloweenSwatch background="linear-gradient(135deg, #2A1468 0%, #5230C6 100%)" />
    },
    {
        id: 'halloween-pumpkin-patch',
        name: 'Pumpkin Patch',
        style: 'Halloween',
        category: 'halloween',
        isPro: true,
        description: 'Dark graveyard under a harvest moon with rising embers and a fiery orange call to action.',
        config: {
            ...HALLOWEEN_BASE,
            scene: 'graveyard',
            bgGradient: 'linear-gradient(90deg, #0E0806 0%, #231009 42%, #3A1708 100%)',
            subHeadline: 'Trick or Treat Sale 🍬',
            subHeadlineColor: '#FDBA74',
            headline: 'Wickedly Good Deals on',
            headlineHighlight: 'Everything',
            headlineColor: '#FFF7ED',
            highlightColor: '#FF9F1C',
            timerTextColor: '#FFF7ED',
            badgeTopText: 'UP TO',
            bogoText: '40% OFF',
            ctaText: 'Shop the Sale',
            ctaBg: '#FF6B00',
            ctaTextColor: '#FFFFFF',
            bgEffect: 'embers',
            bgEffectOpacity: 55
        },
        icon: <HalloweenSwatch background="linear-gradient(135deg, #0E0806 0%, #3A1708 100%)" />
    },
    {
        id: 'halloween-witching-hour',
        name: 'Witching Hour',
        style: 'Halloween',
        category: 'halloween',
        isPro: true,
        description: 'Spider webs, a bubbling cauldron and toxic-green highlights for a bewitching sale.',
        config: {
            ...HALLOWEEN_BASE,
            scene: 'web',
            bgGradient: 'linear-gradient(90deg, #03140F 0%, #0A2A22 45%, #0F3A2E 100%)',
            subHeadline: 'The Witching Hour Has Begun 🕸️',
            subHeadlineColor: '#BBF7D0',
            headline: 'Bewitching Deals on',
            headlineHighlight: 'All Products',
            headlineColor: '#F0FDF4',
            highlightColor: '#A3E635',
            timerTextColor: '#F0FDF4',
            badgeTopText: 'SAVE',
            bogoText: '30% OFF',
            ctaText: 'Claim Offer',
            ctaBg: '#A3E635',
            ctaTextColor: '#0A1F14',
            bgEffect: 'none'
        },
        icon: <HalloweenSwatch background="linear-gradient(135deg, #03140F 0%, #0F3A2E 100%)" />
    },
    {
        id: 'blackfriday-gold-rush',
        name: 'Gold Rush',
        style: 'Black Friday',
        category: 'blackfriday',
        isPro: true,
        description: 'Black and gold luxury look with shopping bags, a light sweep and a swinging price tag.',
        config: {
            ...BLACK_FRIDAY_BASE,
            scene: 'bags',
            bgGradient: 'linear-gradient(90deg, #050505 0%, #111111 50%, #1C1606 100%)',
            subHeadline: 'Our Biggest Sale of the Year',
            subHeadlineColor: '#D4D4D4',
            headline: 'Black Friday',
            headlineHighlight: 'Mega Sale',
            headlineColor: '#FFFFFF',
            highlightColor: '#FACC15',
            timerTextColor: '#FFFFFF',
            badgeTopText: 'UP TO',
            bogoText: '70% OFF',
            badgeBgColor: '#FACC15',
            badgeTextColor: '#0A0A0A',
            ctaText: 'Shop Now',
            ctaBg: '#FACC15',
            ctaTextColor: '#0A0A0A',
            bgEffect: 'none'
        },
        icon: <EmojiSwatch background="linear-gradient(135deg, #050505 0%, #3A2F0B 100%)" emoji="🛍️" />
    },
    {
        id: 'blackfriday-red-alert',
        name: 'Red Alert',
        style: 'Black Friday',
        category: 'blackfriday',
        isPro: true,
        description: 'Loud red doorbuster banner with a shouting megaphone and spinning light rays.',
        config: {
            ...BLACK_FRIDAY_BASE,
            scene: 'burst',
            bgGradient: 'linear-gradient(90deg, #7F0A0A 0%, #B91C1C 50%, #DC2626 100%)',
            subHeadline: 'Doorbuster Deals 🔥',
            subHeadlineColor: '#FECACA',
            headline: 'Black Friday',
            headlineHighlight: 'Starts Now',
            headlineColor: '#FFFFFF',
            highlightColor: '#FDE047',
            timerTextColor: '#FFFFFF',
            badgeTopText: 'SAVE',
            bogoText: '50% OFF',
            badgeBgColor: '#0A0A0A',
            badgeTextColor: '#FFFFFF',
            ctaText: 'Grab the Deal',
            ctaBg: '#0A0A0A',
            ctaTextColor: '#FFFFFF',
            ctaAnimation: 'pulse',
            bgEffect: 'none'
        },
        icon: <EmojiSwatch background="linear-gradient(135deg, #7F0A0A 0%, #DC2626 100%)" emoji="📣" />
    },
    {
        id: 'blackfriday-cyber-neon',
        name: 'Cyber Monday',
        style: 'Black Friday',
        category: 'blackfriday',
        isPro: true,
        description: 'Neon cyber look with a glowing grid, lightning bolt and a neon price tag.',
        config: {
            ...BLACK_FRIDAY_BASE,
            scene: 'neon',
            endDate: getUpcomingBlackFriday(3),
            bgGradient: 'linear-gradient(90deg, #05051A 0%, #0B0B2E 50%, #170A36 100%)',
            subHeadline: 'Cyber Monday Exclusive 💻',
            subHeadlineColor: '#A5B4FC',
            headline: 'Cyber Week',
            headlineHighlight: 'Deals',
            headlineColor: '#F5F3FF',
            highlightColor: '#22D3EE',
            timerTextColor: '#E0F2FE',
            badgeTopText: 'FLASH',
            bogoText: '60% OFF',
            badgeBgColor: '#0B0B2E',
            badgeTextColor: '#F0ABFC',
            ctaText: 'Shop Cyber Deals',
            ctaBg: '#22D3EE',
            ctaTextColor: '#05051A',
            ctaAnimation: 'glow',
            bgEffect: 'none'
        },
        icon: <EmojiSwatch background="linear-gradient(135deg, #05051A 0%, #3B0764 100%)" emoji="⚡" />
    },
    {
        id: 'newyear-midnight-fireworks',
        name: 'Midnight Fireworks',
        style: 'New Year',
        category: 'newyear',
        isPro: true,
        description: 'City skyline at midnight with fireworks bursting, gold accents and a rosette seal.',
        config: {
            ...NEW_YEAR_BASE,
            scene: 'fireworks',
            bgGradient: 'linear-gradient(90deg, #070B24 0%, #121A4A 50%, #1E1457 100%)',
            subHeadline: `Happy New Year ${NEW_YEAR.year} ✨`,
            subHeadlineColor: '#C7D2FE',
            headline: 'New Year,',
            headlineHighlight: 'New Deals',
            headlineColor: '#FFFFFF',
            highlightColor: '#F5C542',
            timerTextColor: '#FFFFFF',
            badgeTopText: 'SAVE',
            bogoText: '40% OFF',
            badgeBgColor: '#F5C542',
            badgeTextColor: '#3B2A05',
            ctaText: 'Shop the Sale',
            ctaBg: '#F5C542',
            ctaTextColor: '#1A1405',
            bgEffect: 'none'
        },
        icon: <EmojiSwatch background="linear-gradient(135deg, #070B24 0%, #1E1457 100%)" emoji="🎆" />
    },
    {
        id: 'newyear-golden-countdown',
        name: 'Golden Countdown',
        style: 'New Year',
        category: 'newyear',
        isPro: true,
        description: 'Black and gold midnight clock with falling gold confetti for an elegant countdown.',
        config: {
            ...NEW_YEAR_BASE,
            scene: 'clock',
            bgGradient: 'linear-gradient(90deg, #0A0A0A 0%, #1A1608 55%, #2A2109 100%)',
            subHeadline: 'The Countdown Is On ⏳',
            subHeadlineColor: '#E7D7A5',
            headline: 'Countdown to',
            headlineHighlight: String(NEW_YEAR.year),
            headlineColor: '#FFFFFF',
            highlightColor: '#E9C46A',
            timerTextColor: '#F5E6B8',
            badgeTopText: 'FLAT',
            bogoText: '30% OFF',
            badgeBgColor: '#E9C46A',
            badgeTextColor: '#2A1F05',
            ctaText: 'Celebrate & Save',
            ctaBg: '#E9C46A',
            ctaTextColor: '#1A1405',
            bgEffect: 'none'
        },
        icon: <EmojiSwatch background="linear-gradient(135deg, #0A0A0A 0%, #2A2109 100%)" emoji="🕛" />
    },
    {
        id: 'newyear-champagne-toast',
        name: 'Champagne Toast',
        style: 'New Year',
        category: 'newyear',
        isPro: true,
        description: 'Warm burgundy and champagne tones with a popping bottle, clinking flutes and bubbles.',
        config: {
            ...NEW_YEAR_BASE,
            scene: 'champagne',
            bgGradient: 'linear-gradient(90deg, #2B0F1C 0%, #4A1730 50%, #5E1F3A 100%)',
            subHeadline: 'Cheers to the New Year 🥂',
            subHeadlineColor: '#FBCFE8',
            headline: 'Pop the Bubbly,',
            headlineHighlight: 'Save Big',
            headlineColor: '#FFF7ED',
            highlightColor: '#F7D9A8',
            timerTextColor: '#FFF7ED',
            badgeTopText: 'UP TO',
            bogoText: '50% OFF',
            badgeBgColor: '#F7D9A8',
            badgeTextColor: '#5A1A33',
            ctaText: 'Toast to Savings',
            ctaBg: '#F7D9A8',
            ctaTextColor: '#4A1730',
            bgEffect: 'none'
        },
        icon: <EmojiSwatch background="linear-gradient(135deg, #2B0F1C 0%, #5E1F3A 100%)" emoji="🥂" />
    }
];

const buildTemplateConfig = (current, template) => {
    const nextLayout = template.config.layout || 'classic';
    const layoutChanged = (current.layout || 'classic') !== nextLayout;
    const styleDefaults = layoutChanged
        ? LAYOUT_STYLE_KEYS.reduce((acc, key) => ({ ...acc, [key]: DEFAULT_CONFIG[key] }), {})
        : {};

    return {
        ...current,
        ...styleDefaults,
        ...template.config,
        id: template.id,
        name: template.name,
        layout: nextLayout
    };
};

function App() {
    const [activeTab, setActiveTab] = useState('design');
    const [appView, setAppView] = useState('editor');
    const [device, setDevice] = useState('desktop');
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateCategory, setTemplateCategory] = useState('all');
    const [selectedTemplateId, setSelectedTemplateId] = useState('holiday-gradient');

    const [config, setConfig] = useState(DEFAULT_CONFIG);

    const [displaySettings, setDisplaySettings] = useState({
        displayOnAllPages: true,
        displayOnHomePage: false,
        selectedPages: []
    });

    // Storefront gets isPro from wiseBannerData; the admin editor starts from the license state the server checked on page load.
    const [isPro, setIsPro] = useState(Boolean(window.wiseBannerData?.isPro || window.wiseModuleData?.pro?.isLicenseActive));
    const [availablePages, setAvailablePages] = useState([]);

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [showDisabledOverlay, setShowDisabledOverlay] = useState(true);
    const [showProModal, setShowProModal] = useState(false);
    const [proModalReason, setProModalReason] = useState('');
    const [globalToast, setGlobalToast] = useState(null);
    const bannerContainerRef = React.useRef(null);

    const isStorefront = window.wiseBannerData?.isStorefront || false;

    // Visitors can close banners that show a close button; remembered for the browser session.
    const getDismissKey = (cfg) => `wise-banner-v2-dismissed:${cfg?.id || ''}:${cfg?.endDate || ''}`;
    const [isDismissed, setIsDismissed] = useState(() => {
        if (!isStorefront) return false;
        try {
            return window.sessionStorage.getItem(getDismissKey(window.wiseBannerData?.config)) === '1';
        } catch (e) {
            return false;
        }
    });

    // Storefront analytics reporter (no-op in the editor and for excluded users).
    const track = React.useMemo(
        () => (isStorefront ? createTracker(window.wiseBannerData?.tracking, window.wiseBannerData?.config?.id) : null),
        [isStorefront]
    );

    const handleDismiss = () => {
        if (track) track('close');
        try {
            window.sessionStorage.setItem(getDismissKey(config), '1');
        } catch (e) {
            // Storage unavailable (private mode); still hide for this page view.
        }
        setIsDismissed(true);
    };

    useEffect(() => {
        if (!config.isActive) {
            setShowDisabledOverlay(true);
        }
    }, [config.isActive]);

    // One impression per page view, plus one unique visitor per browser session.
    const viewTrackedRef = React.useRef(false);
    useEffect(() => {
        if (!track || isLoading || isDismissed || !config.isActive || viewTrackedRef.current) return;
        viewTrackedRef.current = true;
        track('view');
        try {
            const visitorKey = `wise-banner-v2-visitor:${config.id}`;
            if (!window.sessionStorage.getItem(visitorKey)) {
                window.sessionStorage.setItem(visitorKey, '1');
                track('visitor');
            }
        } catch (e) {
            // Without session storage we can't tell repeat views apart; skip the visitor count.
        }
    }, [track, isLoading, isDismissed, config.isActive, config.id]);

    useEffect(() => {
        if (!showTemplateModal) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setShowTemplateModal(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showTemplateModal]);

    useEffect(() => {
        if (!isStorefront) {
            fetchSettings();
        } else {
            // If storefront, we already have data in window.wiseBannerData.config
            if (window.wiseBannerData?.config) {
                setConfig({ ...DEFAULT_CONFIG, ...window.wiseBannerData.config });
                setSelectedTemplateId(window.wiseBannerData.config.id || 'holiday-gradient');
            }
            if (window.wiseBannerData?.isPro !== undefined) {
                setIsPro(!!window.wiseBannerData.isPro);
            }
            setIsLoading(false);
        }
    }, []);

    // Dynamically adjust webpage body padding & placement to prevent header overflow
    useEffect(() => {
        if (!isStorefront || isDismissed) return;

        const isSticky = isPro && config.isSticky;
        const isBottom = isPro && config.position === 'bottom';

        // Auto move #wise-banner-v2-app to top of body if needed
        const rootElement = document.getElementById('wise-banner-v2-app');
        if (rootElement) {
            if (isBottom) {
                if (rootElement.parentElement !== document.body || document.body.lastChild !== rootElement) {
                    document.body.appendChild(rootElement);
                }
            } else {
                if (rootElement.parentElement !== document.body || document.body.firstChild !== rootElement) {
                    document.body.prepend(rootElement);
                }
            }
        }

        // Some themes (e.g. Blockify) ship `body { padding: 0 !important }`, so the offset needs !important too.
        const setBodyPadding = (side, value) => {
            if (value) {
                document.body.style.setProperty(side, value, 'important');
            } else {
                document.body.style.removeProperty(side);
            }
        };

        const updateBodyOffset = () => {
            if (!bannerContainerRef.current) return;
            const height = bannerContainerRef.current.offsetHeight;

            setBodyPadding('padding-top', isSticky && !isBottom ? `${height}px` : '');
            setBodyPadding('padding-bottom', isSticky && isBottom ? `${height}px` : '');
        };

        const timer = setTimeout(updateBodyOffset, 50);
        window.addEventListener('resize', updateBodyOffset);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateBodyOffset);
            setBodyPadding('padding-top', '');
            setBodyPadding('padding-bottom', '');
        };
    }, [isStorefront, isPro, config.isSticky, config.position, config.isActive, isDismissed]);


    const fetchSettings = async () => {
        try {
            const baseUrl = window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/';
            const nonce = window.wiseModuleData?.nonce;
            const headers = nonce ? { 'X-WP-Nonce': nonce } : {};
            // Some hosts replace WordPress' no-cache headers with "max-age=600", so the
            // browser would serve stale settings and license status. Always hit the server.
            const noStore = { headers, cache: 'no-store' };

            // Fetch Banner Design
            const resBanner = await fetch(`${baseUrl}banner-v2`, noStore);
            const bannerData = await resBanner.json();
            if (bannerData && bannerData.id) {
                setConfig({ ...DEFAULT_CONFIG, ...bannerData });
                setSelectedTemplateId(bannerData.id);
            }

            // Fetch Display Settings
            const resSettings = await fetch(`${baseUrl}banner-v2/settings`, noStore);
            const settings = await resSettings.json();
            if (settings) {
                setDisplaySettings(prev => ({ ...prev, ...settings }));
            }

            // Fetch License Status
            const resLicense = await fetch(`${baseUrl}banner-v2/license`, noStore);
            const licenseData = await resLicense.json();
            if (licenseData && licenseData.valid) {
                setIsPro(true);
                // Fetch Available Pages if Pro
                const resPages = await fetch(`${baseUrl}banner-v2/pages`, noStore);
                const pagesData = await resPages.json();
                if (Array.isArray(pagesData)) {
                    setAvailablePages(pagesData);
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (configOverride = null) => {
        setIsSaving(true);
        try {
            const baseUrl = window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/';
            const nonce = window.wiseModuleData?.nonce;

            const headers = {
                'Content-Type': 'application/json',
                ...(nonce ? { 'X-WP-Nonce': nonce } : {})
            };

            const bannerToSave = configOverride || config;

            // Save Banner Design
            const resBanner = await fetch(`${baseUrl}banner-v2`, {
                method: 'POST',
                headers,
                body: JSON.stringify(bannerToSave)
            });

            // Save Display Settings
            const resDisplay = await fetch(`${baseUrl}banner-v2/settings`, {
                method: 'POST',
                headers,
                body: JSON.stringify(displaySettings)
            });

            if (resBanner.ok && resDisplay.ok) {
                if (!configOverride) {
                    alert("Settings saved successfully!");
                }
                return true;
            } else {
                const errorText = !resBanner.ok ? "Banner save failed" : "Display settings save failed";
                console.error(errorText, resBanner.status, resDisplay.status);
                if (!configOverride) {
                    alert(`${errorText}. Please try again.`);
                }
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            if (!configOverride) {
                alert("Failed to save settings: " + error.message);
            }
        } finally {
            setIsSaving(false);
        }
        return false;
    };

    const confirmStatusChange = async () => {
        const newStatus = !config.isActive;
        const newConfig = { ...config, isActive: newStatus };

        // Show loading state or similar if needed
        const success = await handleSave(newConfig);
        if (success) {
            setConfig(newConfig);
            setShowStatusConfirm(false);
            // alert("Banner status updated successfully!"); // Optional, handleSave handles success if not override, wait I changed it
            alert(`Banner ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        }
    };

    const handleImageUpload = () => {
        if (window.wp && window.wp.media) {
            const mediaFrame = window.wp.media({
                frame: 'select',
                title: 'Select Badge Image',
                multiple: false,
                library: {
                    type: 'image',
                    uploadedTo: null // Show all images, not just those 'uploaded to this post'
                },
                button: {
                    text: 'Use this image'
                }
            });

            mediaFrame.on('select', () => {
                const attachment = mediaFrame.state().get('selection').first().toJSON();
                setConfig(prev => ({ ...prev, badgeImage: attachment.url }));
            });

            mediaFrame.open();
        } else {
            alert('WordPress Media Library not available. Please ensure you are logged in as admin.');
        }
    };

    const handleBgImageUpload = () => {
        if (window.wp && window.wp.media) {
            const mediaFrame = window.wp.media({
                frame: 'select',
                title: 'Select Background Image',
                multiple: false,
                library: {
                    type: 'image',
                    uploadedTo: null
                },
                button: {
                    text: 'Use this image'
                }
            });

            mediaFrame.on('select', () => {
                const attachment = mediaFrame.state().get('selection').first().toJSON();
                setConfig(prev => ({ ...prev, bgImage: attachment.url }));
            });

            mediaFrame.open();
        } else {
            alert('WordPress Media Library not available. Please ensure you are logged in as admin.');
        }
    };

    const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
    const seasonalPack = SEASONAL_PACKS[config.layout] || null;
    const isSeasonalLayout = !!seasonalPack;
    const activeSceneId = seasonalPack
        ? (seasonalPack.scenes[config.scene || config.hwScene] ? (config.scene || config.hwScene) : seasonalPack.defaultScene)
        : null;
    const visibleTemplates = templateCategory === 'all'
        ? TEMPLATES
        : TEMPLATES.filter(t => (t.category || 'basic') === templateCategory);

    const applyTemplate = (template) => {
        if (template.isPro && !isPro) {
            setProModalReason(`The "${template.name}" template is part of wiseCampaign Pro. Upgrade to unlock all seasonal templates.`);
            setShowProModal(true);
            return;
        }
        setSelectedTemplateId(template.id);
        setConfig(prev => buildTemplateConfig(prev, template));
        setShowTemplateModal(false);
    };


    const CountdownTimer = ({ endDate, endTime, textColor, bgColor, label, labelPosition = 'left', daysLabel = 'D', hoursLabel = 'H', minutesLabel = 'M', secondsLabel = 'S', enableRecursion = false, recurrenceAmount = 24, recurrenceUnit = 'hours', isMobileMode = false }) => {
        const [timeLeft, setTimeLeft] = useState({ days: '00', hrs: '00', min: '00', sec: '00' });

        useEffect(() => {
            const calculateTime = () => getTimeLeft({ endDate, endTime, enableRecursion, recurrenceAmount, recurrenceUnit });

            const timer = setInterval(() => {
                setTimeLeft(calculateTime());
            }, 1000);

            setTimeLeft(calculateTime());
            return () => clearInterval(timer);
        }, [endDate, endTime, enableRecursion, recurrenceAmount, recurrenceUnit]);

        const getFlexDirection = () => {
            if (isMobileMode) return 'flex-col items-center';
            switch (labelPosition) {
                case 'top': return 'flex-col items-center';
                case 'bottom': return 'flex-col-reverse items-center';
                case 'right': return 'flex-row-reverse items-center';
                case 'left':
                default: return 'flex-row items-center';
            }
        };

        return (
            <div className={`flex gap-1.5 shrink-0 ${getFlexDirection()} ${!isMobileMode ? 'sm:gap-3' : ''}`}>
                {label && (
                    <span
                        className={`font-black tracking-[0.12em] opacity-70 uppercase whitespace-nowrap ${
                            isMobileMode ? 'text-[8px]' : 'text-[9px] sm:tracking-[0.2em]'
                        }`}
                        style={{ color: textColor }}
                    >
                        {label}
                    </span>
                )}
                <div className={`flex items-center gap-1 ${!isMobileMode ? 'sm:gap-1.5' : ''}`}>
                    {[
                        { val: timeLeft.days, label: daysLabel },
                        { val: timeLeft.hrs, label: hoursLabel },
                        { val: timeLeft.min, label: minutesLabel },
                        { val: timeLeft.sec, label: secondsLabel }
                    ].map((t, idx) => (
                        <React.Fragment key={idx}>
                            <div
                                className={`flex flex-col items-center backdrop-blur-md rounded-lg shadow-sm border border-white/10 ${
                                    isMobileMode ? 'px-1.5 py-0.5 min-w-[28px]' : 'px-2 py-1 min-w-[34px]'
                                }`}
                                style={{
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    borderColor: `${textColor}22`
                                }}
                            >
                                <span className={`font-black drop-shadow-sm leading-tight ${isMobileMode ? 'text-[11px]' : 'text-xs'}`}>
                                    {t.val}
                                </span>
                                <span className={`font-black opacity-60 leading-none mt-0.5 tracking-tighter ${isMobileMode ? 'text-[7px]' : 'text-[8px]'}`}>
                                    {t.label}
                                </span>
                            </div>
                            {idx < 3 && (
                                <span
                                    className={`font-black self-center opacity-40 ${isMobileMode ? 'text-[10px]' : 'text-xs'}`}
                                    style={{ color: textColor }}
                                >
                                    :
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    const BackgroundEffectLayer = ({ effect, opacity = 60 }) => {
        if (!effect || effect === 'none') return null;
        const op = opacity / 100;

        if (effect === 'snow') {
            const snowflakes = [
                { left: '6%', delay: '0s', duration: '3.5s', size: '6px' },
                { left: '16%', delay: '1.2s', duration: '4s', size: '8px' },
                { left: '26%', delay: '0.4s', duration: '3.2s', size: '5px' },
                { left: '36%', delay: '2s', duration: '4.5s', size: '7px' },
                { left: '46%', delay: '0.8s', duration: '3.8s', size: '9px' },
                { left: '56%', delay: '1.6s', duration: '3.4s', size: '6px' },
                { left: '66%', delay: '0.2s', duration: '4.2s', size: '8px' },
                { left: '76%', delay: '1.8s', duration: '3.6s', size: '5px' },
                { left: '86%', delay: '0.6s', duration: '4.8s', size: '7px' },
                { left: '95%', delay: '1.4s', duration: '3.3s', size: '6px' }
            ];
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ opacity: op }}>
                    {snowflakes.map((s, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white shadow-sm"
                            style={{
                                left: s.left,
                                top: '-10px',
                                width: s.size,
                                height: s.size,
                                animation: `snow-fall ${s.duration} ease-in-out infinite`,
                                animationDelay: s.delay
                            }}
                        />
                    ))}
                </div>
            );
        }

        if (effect === 'embers') {
            const embers = [
                { left: '8%', delay: '0s', duration: '2.8s', size: '4px', color: '#F59E0B' },
                { left: '20%', delay: '1.1s', duration: '3.2s', size: '5px', color: '#EF4444' },
                { left: '33%', delay: '0.5s', duration: '2.5s', size: '3px', color: '#F97316' },
                { left: '46%', delay: '1.7s', duration: '3.5s', size: '6px', color: '#FBBF24' },
                { left: '60%', delay: '0.2s', duration: '2.9s', size: '4px', color: '#EF4444' },
                { left: '72%', delay: '1.4s', duration: '3.1s', size: '5px', color: '#F59E0B' },
                { left: '84%', delay: '0.8s', duration: '2.6s', size: '3px', color: '#F97316' },
                { left: '94%', delay: '1.9s', duration: '3.4s', size: '5px', color: '#EF4444' }
            ];
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ opacity: op }}>
                    {embers.map((e, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full shadow-[0_0_8px_currentColor]"
                            style={{
                                left: e.left,
                                bottom: '0px',
                                width: e.size,
                                height: e.size,
                                backgroundColor: e.color,
                                color: e.color,
                                animation: `ember-rise ${e.duration} ease-out infinite`,
                                animationDelay: e.delay
                            }}
                        />
                    ))}
                </div>
            );
        }

        if (effect === 'confetti') {
            const confetti = [
                { left: '10%', delay: '0s', duration: '3.2s', color: '#EC4899', width: '8px', height: '5px' },
                { left: '22%', delay: '0.9s', duration: '3.6s', color: '#3B82F6', width: '6px', height: '6px' },
                { left: '36%', delay: '1.6s', duration: '3.1s', color: '#FACC15', width: '9px', height: '4px' },
                { left: '50%', delay: '0.3s', duration: '4s', color: '#10B981', width: '7px', height: '5px' },
                { left: '64%', delay: '1.2s', duration: '3.4s', color: '#8B5CF6', width: '6px', height: '6px' },
                { left: '78%', delay: '0.6s', duration: '3.7s', color: '#F97316', width: '8px', height: '4px' },
                { left: '92%', delay: '1.8s', duration: '3.3s', color: '#EC4899', width: '7px', height: '5px' }
            ];
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ opacity: op }}>
                    {confetti.map((c, i) => (
                        <div
                            key={i}
                            className="absolute rounded-sm"
                            style={{
                                left: c.left,
                                top: '-10px',
                                width: c.width,
                                height: c.height,
                                backgroundColor: c.color,
                                animation: `confetti-drift ${c.duration} ease-in-out infinite`,
                                animationDelay: c.delay
                            }}
                        />
                    ))}
                </div>
            );
        }

        if (effect === 'aurora') {
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ opacity: op }}>
                    <div
                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-lg"
                        style={{
                            animation: 'aurora-sweep 6s ease-in-out infinite'
                        }}
                    />
                </div>
            );
        }

        if (effect === 'orbs') {
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ opacity: op }}>
                    <div
                        className="absolute -top-6 left-1/4 w-32 h-32 rounded-full bg-white/25 blur-xl"
                        style={{ animation: 'orb-drift 4s ease-in-out infinite' }}
                    />
                    <div
                        className="absolute -bottom-6 right-1/4 w-36 h-36 rounded-full bg-amber-300/20 blur-xl"
                        style={{ animation: 'orb-drift 5s ease-in-out infinite 1.5s' }}
                    />
                </div>
            );
        }

        if (effect === 'grid') {
            return (
                <div
                    className="absolute inset-0 effect-grid-pattern pointer-events-none z-0"
                    style={{ opacity: op }}
                />
            );
        }

        return null;
    };

    // `cfg` renders a specific config (template previews); otherwise the live config is used.
    const BannerContent = ({ isMobileMode = false, cfg = null, forcePro = false, isPreview = false, onClose = null, onTrack = null }) => {
        const [copied, setCopied] = useState(false);
        const c = cfg || config;
        const pro = forcePro || isPro;
        if (isLoading && !cfg) return null;

        if (SEASONAL_PACKS[c.layout] && pro) {
            return (
                <SeasonalBanner
                    config={c}
                    isPro={pro}
                    isMobileMode={isMobileMode}
                    isPreview={isPreview}
                    onClose={onClose}
                    onTrack={onTrack}
                    showBranding={!pro || !c.hideBranding}
                    effectLayer={
                        <BackgroundEffectLayer
                            effect={c.bgEffect}
                            opacity={c.bgEffectOpacity !== undefined ? c.bgEffectOpacity : 60}
                        />
                    }
                />
            );
        }

        const handleCopyCode = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isPreview) return;

            const code = c.couponCode;

            if (await copyText(code)) {
                if (onTrack) onTrack('copy');
                setCopied(true);
                setGlobalToast(`Coupon code "${code}" copied to clipboard!`);
                setTimeout(() => setCopied(false), 2000);
            } else {
                setGlobalToast('Failed to copy code. Please copy it manually.');
            }
        };

        const getCouponLayout = () => {
            switch (c.couponPlacement) {
                case 'top': return 'flex-col-reverse';
                case 'left': return 'flex-row-reverse';
                case 'right': return 'flex-row';
                case 'bottom':
                default: return 'flex-col';
            }
        };

        const getCouponAlign = () => {
            const layout = getCouponLayout();
            if (layout.includes('col')) return isMobileMode ? 'items-center' : 'md:items-start';
            return 'items-center';
        };

        const badgePosition = c.badgePosition || 'left';
        const isBadgeRight = badgePosition === 'right';
        const badgeVPos = c.badgeVerticalPosition || 'middle';

        let vPosClass = 'top-1/2 -translate-y-1/2';
        if (badgeVPos === 'top') {
            vPosClass = isMobileMode ? 'top-1' : 'top-1.5 sm:top-2';
        } else if (badgeVPos === 'bottom') {
            vPosClass = isMobileMode ? 'bottom-1' : 'bottom-1.5 sm:bottom-2';
        }

        const hPosClass = isBadgeRight
            ? (isMobileMode ? 'right-2' : 'right-3 sm:right-5')
            : (isMobileMode ? 'left-2' : 'left-3 sm:left-5');

        const badgePositionClass = `${hPosClass} ${vPosClass}`;

        return (
            <div
                className={`w-full relative overflow-hidden transition-all duration-300 ${
                    isMobileMode
                        ? 'py-3 px-4 flex flex-col items-center text-center gap-2.5'
                        : 'py-3.5 px-6 sm:px-8 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4'
                }`}
                style={{
                    backgroundColor: c.bgType === 'solid' ? c.bgSolid : undefined,
                    backgroundImage: c.bgType === 'gradient' ? c.bgGradient : (c.bgType === 'image' ? `url(${c.bgImage})` : undefined),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <BackgroundEffectLayer
                    effect={pro ? c.bgEffect : 'none'}
                    opacity={c.bgEffectOpacity !== undefined ? c.bgEffectOpacity : 60}
                />

                {c.showBogoBadge && (
                    <div className={`absolute z-[10000] animate-bounce-subtle pointer-events-none ${badgePositionClass}`}>
                        <div className="relative group">
                            {c.badgeType === 'image' && c.badgeImage ? (
                                <img
                                    src={c.badgeImage}
                                    alt="Badge"
                                    className={`object-contain drop-shadow-xl hover:scale-105 transition-transform ${isMobileMode ? 'w-10' : 'w-14 sm:w-16'}`}
                                />
                            ) : (
                                <>
                                    <div
                                        className="absolute inset-0 rounded-full blur-[6px] opacity-40 group-hover:opacity-60 transition-opacity"
                                        style={{ backgroundColor: c.badgeBgColor }}
                                    />
                                    <div
                                        className={`relative font-black rounded-full border border-white/20 shadow-xl flex items-center justify-center tracking-tighter ${
                                            isMobileMode
                                                ? 'text-[8px] px-2 py-0.5'
                                                : 'text-[10px] px-2.5 py-1 sm:text-xs sm:px-3.5 sm:py-1.5'
                                        }`}
                                        style={{
                                            backgroundColor: c.badgeBgColor,
                                            color: c.badgeTextColor,
                                            transform: `rotate(${c.badgeRotation || (isBadgeRight ? '12deg' : '-12deg')})`
                                        }}
                                    >
                                        {c.bogoText}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className={`flex ${c.showBogoBadge && (c.badgePosition || 'left') === 'left' ? (isMobileMode ? 'pl-8' : 'pl-14 sm:pl-20') : ''} ${isMobileMode ? 'flex-col items-center text-center gap-1.5 w-full' : `flex-1 w-full gap-3.5 ${getCouponLayout()} ${getCouponAlign()} ${getCouponLayout().includes('row') ? 'md:justify-start' : ''}`}`}>
                    <div className={`flex flex-col ${isMobileMode ? 'text-center w-full px-2' : 'md:text-left md:w-auto w-full'}`}>


                        <span
                            className={`tracking-tight drop-shadow-sm ${isMobileMode ? 'whitespace-normal leading-snug' : 'whitespace-nowrap'}`}
                            style={{
                                color: c.headlineColor,
                                fontSize: isMobileMode
                                    ? `clamp(13px, 4vw, 17px)`
                                    : `clamp(14px, 2.5vw, ${c.headlineSize})`,
                                fontWeight: c.headlineWeight
                            }}
                        >
                            {c.headline}
                            {c.headlineHighlight && (
                                <>
                                    {' '}
                                    <span style={{ color: c.highlightColor || '#FFD43B' }}>{c.headlineHighlight}</span>
                                </>
                            )}
                        </span>
                        {c.showSubHeadline && (
                            <span
                                className={`font-medium tracking-tight mt-0.5 opacity-90 ${isMobileMode ? 'whitespace-normal text-xs leading-tight' : 'whitespace-nowrap'}`}
                                style={{
                                    color: c.subHeadlineColor,
                                    fontSize: isMobileMode
                                        ? `clamp(10px, 3vw, 12px)`
                                        : `clamp(11px, 1.8vw, ${c.subHeadlineSize})`,
                                    fontWeight: c.subHeadlineWeight
                                }}
                            >
                                {c.subHeadline}
                            </span>
                        )}
                    </div>

                    {c.showCouponCode && (
                        <div
                            onClick={handleCopyCode}
                            title="Click to copy code"
                            className="shrink-0 group cursor-pointer active:scale-95 transition-all select-none relative"
                        >
                            {/* Floating Notification */}
                            {copied && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl animate-bounce-subtle z-[10001] whitespace-nowrap">
                                    Copied!
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                </div>
                            )}

                            <div
                                className={`rounded-lg border-2 border-dashed flex items-center gap-1.5 transition-all duration-300 group-hover:bg-opacity-20 ${
                                    isMobileMode ? 'px-2.5 py-0.5' : 'px-3 py-1'
                                }`}
                                style={{
                                    borderColor: copied ? '#22c55e' : `${c.headlineColor}44`,
                                    backgroundColor: copied ? '#22c55e22' : `${c.headlineColor}11`,
                                    color: copied ? '#16a34a' : c.headlineColor
                                }}
                            >
                                <span className="text-[9px] uppercase font-black tracking-widest opacity-60">CODE:</span>
                                <span className="text-xs font-black tracking-tight">{c.couponCode}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex items-center justify-center ${c.showBogoBadge && (c.badgePosition || 'left') === 'right' ? (isMobileMode ? 'pr-8' : 'pr-14 sm:pr-20') : ''} ${isMobileMode ? 'flex-col gap-2 w-full mt-1' : 'flex-wrap gap-4 w-full md:justify-end sm:gap-6 md:gap-8 md:w-auto shrink-0'}`}>

                    {c.showTimer && (
                        <CountdownTimer
                            endDate={c.endDate}
                            endTime={c.endTime}
                            textColor={c.timerTextColor}
                            bgColor={c.timerBgColor}
                            label={c.timerLabel}
                            labelPosition={c.timerLabelPosition}
                            daysLabel={c.daysLabel}
                            hoursLabel={c.hoursLabel}
                            minutesLabel={c.minutesLabel}
                            secondsLabel={c.secondsLabel}
                            enableRecursion={c.enableRecursion}
                            recurrenceAmount={c.recurrenceAmount}
                            recurrenceUnit={c.recurrenceUnit}
                            isMobileMode={isMobileMode}
                        />
                    )}

                    {c.showCTA && (() => {
                        const buttonAnim = pro && c.ctaAnimation ? c.ctaAnimation : 'none';
                        let animClass = '';
                        if (buttonAnim === 'pulse') animClass = 'animate-pulse-subtle';
                        else if (buttonAnim === 'shake') animClass = 'animate-shake-subtle';
                        else if (buttonAnim === 'bounce') animClass = 'animate-bounce-btn';
                        else if (buttonAnim === 'heartbeat') animClass = 'animate-heartbeat';
                        else if (buttonAnim === 'glow') animClass = 'animate-glow-pulse';
                        else if (buttonAnim === 'shimmer') animClass = 'relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent';

                        return (
                            <a
                                href={c.ctaUrl}
                                onClick={() => onTrack && onTrack('click')}
                                className={`font-black shadow-xl flex items-center justify-center gap-1.5 group cursor-pointer transition-all hover:brightness-105 active:scale-95 no-underline whitespace-nowrap ${animClass} ${
                                    isMobileMode
                                        ? 'w-full py-2 px-4 text-xs'
                                        : 'px-4 py-2 text-[10px] sm:px-5 sm:py-2 sm:text-xs shrink-0'
                                }`}
                                style={{
                                    backgroundColor: c.ctaBg,
                                    color: c.ctaTextColor,
                                    borderRadius: c.ctaRadius
                                }}
                            >
                                <span>{c.ctaText}</span>
                                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        );
                    })()}
                </div>


                {(!pro || !c.hideBranding) && (
                    <a
                        href="https://wisemattic.com/wisecampaign"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-[7.5px] font-medium opacity-75 hover:opacity-100 transition-opacity no-underline shrink-0 whitespace-nowrap flex items-center gap-0.5 z-[100] ${
                            isMobileMode
                                ? 'mt-1 self-center'
                                : 'absolute right-3 bottom-0.5 sm:right-6 sm:bottom-0.5'
                        }`}
                        style={{ color: c.headlineColor }}
                    >
                        <span>Made with</span>
                        <span className="font-bold underline">wiseCampaign</span>
                    </a>
                )}
            </div>
        );
    };

    const Toast = ({ message, onClose }) => {
        useEffect(() => {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }, [onClose]);

        return (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100000] animate-slide-up">
                <div className="bg-[#0F172A] text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center gap-3 border border-white/10 backdrop-blur-xl">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-black tracking-tight uppercase opacity-50 leading-none mb-0.5">Success</p>
                        <p className="text-sm font-bold tracking-tight">{message}</p>
                    </div>
                    <button onClick={onClose} className="ml-2 text-white/30 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>
        );
    };

    if (isStorefront) {
        if (isDismissed) return null;

        const isSticky = isPro && config.isSticky;
        const isBottom = isPro && config.position === 'bottom';

        let positionClasses = 'relative w-full z-[99990]';
        let customStyle = {};

        if (isSticky) {
            positionClasses = isBottom
                ? 'fixed bottom-0 left-0 right-0 z-[99999] shadow-[0_-4px_20px_rgba(0,0,0,0.15)]'
                : 'fixed top-0 left-0 right-0 z-[99999] shadow-[0_4px_20px_rgba(0,0,0,0.15)]';

            // Check if WordPress admin bar is present
            const adminBar = typeof document !== 'undefined' ? document.getElementById('wpadminbar') : null;
            if (adminBar && !isBottom) {
                const adminBarHeight = adminBar.offsetHeight || 32;
                customStyle.top = `${adminBarHeight}px`;
            }
        }

        return (
            <div ref={bannerContainerRef} className={positionClasses} style={customStyle}>
                <BannerContent onClose={handleDismiss} onTrack={track} />
                {globalToast && <Toast message={globalToast} onClose={() => setGlobalToast(null)} />}
            </div>
        );
    }


    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {/* Pro Upgrade Modal (above the template modal, which can open it) */}
            {showProModal && (
                <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden scale-in p-8 flex flex-col items-center text-center border border-slate-100">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-amber-200" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                            <Crown size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">
                            Unlock Pro Feature
                        </h2>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                            {proModalReason || 'Removing the "Made with wiseCampaign" branding requires a wiseCampaign Pro license.'}
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowProModal(false)}
                                className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all active:scale-95 border border-slate-200/60"
                            >
                                Cancel
                            </button>
                            <a
                                href="https://wisemattic.com/wisecampaign/pricing"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowProModal(false)}
                                className="flex-1 px-5 py-3 bg-amber-500 hover:bg-amber-600 font-bold text-sm rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center justify-center gap-2 no-underline"
                                style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
                            >
                                <span className="font-bold" style={{ color: '#FFFFFF' }}>Upgrade Now</span>
                                <Sparkles size={16} style={{ color: '#FFFFFF' }} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Confirmation Modal */}
            {showStatusConfirm && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden scale-in p-8 flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${config.isActive ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            {config.isActive ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
                        </div>
                        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">
                            {config.isActive ? 'Deactivate Banner?' : 'Activate Banner?'}
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">
                            {config.isActive
                                ? 'Are you sure you want to deactivate this banner? It will no longer be visible to your customers.'
                                : 'Are you sure you want to activate this banner? It will become visible to your customers based on your display settings.'}
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowStatusConfirm(false)}
                                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                disabled={isSaving}
                                className={`flex-1 px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${config.isActive ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'}`}
                            >
                                {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {config.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4 sm:p-6"
                    onClick={() => setShowTemplateModal(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="wise-template-modal-title"
                        className="bg-white w-full max-w-[1180px] h-[min(880px,92vh)] rounded-2xl shadow-[0_30px_80px_rgba(15,23,42,0.35)] overflow-hidden scale-in flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 sm:px-8 pt-6 pb-5 flex items-start justify-between gap-6 shrink-0">
                            <div className="flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <Layout size={20} />
                                </div>
                                <div>
                                    <h2 id="wise-template-modal-title" className="m-0 p-0 text-xl font-black text-[#0F172A] tracking-tight leading-tight">Choose a Template</h2>
                                    <p className="m-0 text-xs text-slate-500 font-medium mt-1">
                                        Live previews of each design. Click a template to apply it, then fine-tune it in the editor.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Close"
                                onClick={() => setShowTemplateModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 flex-shrink-0"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Category Tabs */}
                        <div className="px-6 sm:px-8 pb-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0">
                            {TEMPLATE_CATEGORIES.map((category) => {
                                const count = category.id === 'all'
                                    ? TEMPLATES.length
                                    : TEMPLATES.filter(t => (t.category || 'basic') === category.id).length;
                                const isCurrent = templateCategory === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => setTemplateCategory(category.id)}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${isCurrent ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        {category.icon && <span className="text-sm leading-none">{category.icon}</span>}
                                        <span>{category.label}</span>
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Template List */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/70 px-6 sm:px-8 py-6 custom-scrollbar">
                            <div className="grid grid-cols-1 gap-5">
                                {visibleTemplates.map((template) => {
                                    const isSelected = selectedTemplateId === template.id;
                                    const isLocked = template.isPro && !isPro;
                                    return (
                                        <div
                                            key={template.id}
                                            className={`group relative bg-white rounded-xl border transition-all duration-200 ${isSelected ? 'border-blue-600 ring-4 ring-blue-600/10 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'}`}
                                        >
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                aria-label={`Use ${template.name} template`}
                                                onClick={() => applyTemplate(template)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        applyTemplate(template);
                                                    }
                                                }}
                                                className="block p-3 pb-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t-xl"
                                            >
                                                <div className="rounded-lg overflow-hidden border border-slate-200 bg-white relative">
                                                    {/* Mini browser chrome */}
                                                    <div className="h-6 px-3 flex items-center gap-1.5 bg-slate-100 border-b border-slate-200">
                                                        <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                                                        <span className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                                                        <span className="w-2 h-2 rounded-full bg-[#28C840]" />
                                                        <span className="ml-3 h-3 w-40 max-w-[40%] rounded bg-white border border-slate-200" />
                                                    </div>

                                                    <ScaledPreview width={1440} lazy>
                                                        <BannerContent cfg={buildTemplateConfig(config, template)} forcePro isPreview />
                                                    </ScaledPreview>

                                                    {/* Page skeleton under the banner */}
                                                    <div className="px-4 py-3 flex items-center gap-3 bg-white">
                                                        <span className="h-2 w-16 rounded-full bg-slate-100" />
                                                        <span className="h-2 w-10 rounded-full bg-slate-100" />
                                                        <span className="h-2 w-12 rounded-full bg-slate-100" />
                                                        <span className="ml-auto h-2 w-20 rounded-full bg-slate-100" />
                                                    </div>

                                                    {isLocked && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 group-hover:bg-slate-900/45 transition-colors">
                                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black shadow-xl" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                                                                <Lock size={14} />
                                                                Unlock with Pro
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="m-0 p-0 text-sm font-black text-[#0F172A] tracking-tight">{template.name}</h3>
                                                        <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">{template.style}</span>
                                                        {template.isPro && (
                                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                                                                <Crown size={10} />
                                                                Pro
                                                            </span>
                                                        )}
                                                        {isSelected && (
                                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                                                <Check size={10} strokeWidth={3} />
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="m-0 text-xs text-slate-500 font-medium mt-1 truncate">{template.description}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => applyTemplate(template)}
                                                    disabled={isSelected}
                                                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${isSelected ? 'bg-slate-100 text-slate-400 cursor-default' : (isLocked ? 'shadow-sm hover:brightness-105' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200')}`}
                                                    style={isLocked && !isSelected ? { backgroundColor: '#F59E0B', color: '#FFFFFF' } : undefined}
                                                >
                                                    {isSelected ? <><Check size={14} /> Applied</> : (isLocked ? <><Crown size={14} /> Unlock Pro</> : 'Use Template')}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Header */}
            <header className="h-auto pt-3 pb-3 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm text-left">
                {/* Left: Branding */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <img
                            src={`${window.wiseModuleData?.pluginUrl || '/wp-content/plugins/wisecampaign/'}images/fe/wisecampaign-icon.png`}
                            alt=""
                            className="w-9 h-9 rounded-xl object-contain shrink-0"
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-left">
                                <span className="font-bold text-lg tracking-tight text-[#0F172A]">WiseCampaign</span>
                                {/* <span className="px-1.5 py-0.5 bg-blue-50 text-[10px] font-black text-blue-600 rounded-md border border-blue-100 uppercase tracking-tighter">Pro</span> */}
                            </div>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
                        <div className="flex bg-slate-100 p-1 rounded-md" role="tablist" aria-label="wiseBanner views">
                            {[
                                { id: 'editor', label: 'Editor', icon: <Layout size={14} /> },
                                { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} /> }
                            ].map((view) => (
                                <button
                                    key={view.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={appView === view.id}
                                    onClick={() => setAppView(view.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${appView === view.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {view.icon}
                                    {view.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Device Switcher */}
                {appView === 'editor' && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex bg-slate-100 p-1 rounded-md">
                        <button
                            onClick={() => setDevice('desktop')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${device === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Monitor size={16} />
                            {device === 'desktop' && <span className="text-xs font-bold">Desktop</span>}
                        </button>
                        <button
                            onClick={() => setDevice('mobile')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${device === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Smartphone size={16} />
                            {device === 'mobile' && <span className="text-xs font-bold">Mobile</span>}
                        </button>
                    </div>
                </div>
                )}

                {/* Right: Actions */}
                <div className={`flex items-center gap-6 ${appView === 'editor' ? '' : 'invisible'}`}>
                    <div className="flex items-center gap-3 pr-2">
                        <button
                            onClick={() => handleSave()}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-bold shadow-lg shadow-slate-200 active:scale-95 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <Save size={18} className={isSaving ? 'animate-spin' : ''} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </header>

            {appView === 'analytics' && (
                <AnalyticsDashboard
                    apiUrl={window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/'}
                    nonce={window.wiseModuleData?.nonce}
                    isPro={isPro}
                    templates={TEMPLATES}
                    onUpgrade={(reason) => {
                        setProModalReason(reason);
                        setShowProModal(true);
                    }}
                />
            )}

            {appView === 'editor' && (
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto relative">
                    {/* Master Activation Toggle */}
                    <div className="p-5 border-b-4 border-slate-50 bg-slate-50/30">
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all cursor-pointer group"
                            onClick={() => setShowStatusConfirm(true)}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${config.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Power size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-700 uppercase tracking-tight">Banner Status</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        {config.isActive ? <span className="text-emerald-500">Currently Active</span> : 'Feature Disabled'}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-all relative ${config.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isActive ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    </div>

                    <div className={`flex flex-col flex-1 transition-all duration-300 ${!config.isActive ? 'opacity-40 grayscale pointer-events-none select-none filter blur-[1px]' : ''}`}>
                        <div className="p-4 border-b border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Template</span>
                                <button
                                    onClick={() => setShowTemplateModal(true)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                >
                                    Change Template
                                </button>
                            </div>
                            <div
                                onClick={() => setShowTemplateModal(true)}
                                className="p-3 border border-slate-200 rounded-md flex items-center gap-3 bg-white hover:border-blue-200 transition-colors cursor-pointer group"
                            >
                                <div className="w-12 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all text-left">
                                    {activeTemplate.icon}
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold group-hover:text-blue-600 transition-colors">{activeTemplate.name}</div>
                                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Style: {activeTemplate.style}</div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="px-4 py-4">
                            <div className="flex bg-slate-100 p-1 rounded-md">
                                {['design', 'content', 'settings'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-white shadow-sm text-[#0F172A]' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <div className="px-6 py-4 space-y-8 pb-10 text-left overflow-y-auto custom-scrollbar">
                            {activeTab === 'content' && (
                                <div className="space-y-10 animate-fade-in">
                                    {/* Banner Text */}
                                    <section className="space-y-6">
                                        <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Banner Text</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Headline</label>
                                                <input
                                                    type="text"
                                                    value={config.headline}
                                                    onChange={(e) => setConfig(prev => ({ ...prev, headline: e.target.value }))}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Highlighted Words (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={config.headlineHighlight || ''}
                                                    onChange={(e) => setConfig(prev => ({ ...prev, headlineHighlight: e.target.value }))}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                                    placeholder="Shown after the headline in the highlight color"
                                                />
                                            </div>


                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between pb-1">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sub-headline / Promo Code</label>
                                                    <button
                                                        onClick={() => setConfig(prev => ({ ...prev, showSubHeadline: !prev.showSubHeadline }))}
                                                        className={`w-8 h-4 rounded-full transition-all relative ${config.showSubHeadline ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${config.showSubHeadline ? 'right-0.5' : 'left-0.5'}`} />
                                                    </button>
                                                </div>
                                                {config.showSubHeadline && (
                                                    <input
                                                        type="text"
                                                        value={config.subHeadline}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, subHeadline: e.target.value }))}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                                    />
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between pb-1">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Coupon code</label>
                                                    <button
                                                        onClick={() => setConfig(prev => ({ ...prev, showCouponCode: !prev.showCouponCode }))}
                                                        className={`w-8 h-4 rounded-full transition-all relative ${config.showCouponCode ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${config.showCouponCode ? 'right-0.5' : 'left-0.5'}`} />
                                                    </button>
                                                </div>
                                                {config.showCouponCode && (
                                                    <div className="space-y-4 animate-fade-in pl-1">
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                value={config.couponCode}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, couponCode: e.target.value }))}
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none focus:border-blue-500 transition-all shadow-sm tracking-widest uppercase"
                                                                placeholder="ENTER CODE"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black text-slate-400 opacity-60 uppercase tracking-widest pl-1">Placement</label>
                                                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                                                                {['top', 'bottom', 'left', 'right'].map((pos) => (
                                                                    <button
                                                                        key={pos}
                                                                        onClick={() => setConfig(prev => ({ ...prev, couponPlacement: pos }))}
                                                                        className={`flex-1 py-1 text-[10px] font-black rounded-md transition-all capitalize ${config.couponPlacement === pos ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                                    >
                                                                        {pos}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="h-[1px] bg-slate-50" />
                                    </section>

                                    {/* Countdown Timer */}
                                    <section className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Countdown Timer</h3>
                                            <button
                                                onClick={() => setConfig(prev => ({ ...prev, showTimer: !prev.showTimer }))}
                                                className={`w-10 h-5 rounded-full transition-all relative ${config.showTimer ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.showTimer ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        {config.showTimer && (
                                            <div className="space-y-4 animate-fade-in">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">End Date & Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={config.endDate && config.endTime ? `${config.endDate}T${config.endTime}` : (config.endDate || "")}
                                                        onChange={(e) => {
                                                            const [date, time] = e.target.value.split('T');
                                                            setConfig(prev => ({ ...prev, endDate: date || '', endTime: time || '' }));
                                                        }}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all"
                                                    />
                                                </div>

                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                                                <Clock size={14} />
                                                            </div>
                                                            <span className="text-xs font-black text-[#0F172A]">Restart Countdown</span>
                                                        </div>
                                                        <button
                                                            onClick={() => setConfig(prev => ({ ...prev, enableRecursion: !prev.enableRecursion }))}
                                                            className={`w-8 h-4 rounded-full transition-all relative ${config.enableRecursion ? 'bg-blue-600' : 'bg-slate-300'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${config.enableRecursion ? 'right-0.5' : 'left-0.5'}`} />
                                                        </button>
                                                    </div>

                                                    {config.enableRecursion && (
                                                        <div className="space-y-3 animate-fade-in">
                                                            <div className="flex gap-2">
                                                                <div className="flex-1 space-y-1">
                                                                    <span className="text-[9px] font-black text-slate-400 ml-1">Restart Every</span>
                                                                    <input
                                                                        type="number"
                                                                        value={config.recurrenceAmount}
                                                                        onChange={(e) => setConfig(prev => ({ ...prev, recurrenceAmount: e.target.value }))}
                                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all"
                                                                        min="1"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 space-y-1">
                                                                    <span className="text-[9px] font-black text-slate-400 ml-1">Basis</span>
                                                                    <select
                                                                        value={config.recurrenceUnit}
                                                                        onChange={(e) => setConfig(prev => ({ ...prev, recurrenceUnit: e.target.value }))}
                                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                                                    >
                                                                        <option value="days">Days</option>
                                                                        <option value="hours">Hours</option>
                                                                        <option value="minutes">Minutes</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                                                                <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                                                                <p className="text-[9px] text-amber-700 font-bold leading-tight uppercase tracking-tight">
                                                                    Once the initial countdown ends, it will restart automatically every {config.recurrenceAmount} {config.recurrenceUnit}.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {!isSeasonalLayout && (<>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Label Text (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={config.timerLabel}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, timerLabel: e.target.value }))}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Label Position</label>
                                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                                        {['left', 'top', 'right', 'bottom'].map((pos) => (
                                                            <button
                                                                key={pos}
                                                                onClick={() => setConfig(prev => ({ ...prev, timerLabelPosition: pos }))}
                                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${config.timerLabelPosition === pos ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                            >
                                                                {pos}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                </>)}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Unit Labels</label>
                                                    <div className="flex gap-2">
                                                        <div className="space-y-1 flex-1">
                                                            <span className="text-[9px] font-bold text-slate-400 ml-1">Days</span>
                                                            <input
                                                                type="text"
                                                                value={config.daysLabel}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, daysLabel: e.target.value }))}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-center outline-none focus:border-blue-500 transition-all shadow-sm"
                                                                placeholder="D"
                                                                maxLength={8}
                                                            />
                                                        </div>
                                                        <div className="space-y-1 flex-1">
                                                            <span className="text-[9px] font-bold text-slate-400 ml-1">Hours</span>
                                                            <input
                                                                type="text"
                                                                value={config.hoursLabel}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, hoursLabel: e.target.value }))}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-center outline-none focus:border-blue-500 transition-all shadow-sm"
                                                                placeholder="H"
                                                                maxLength={8}
                                                            />
                                                        </div>
                                                        <div className="space-y-1 flex-1">
                                                            <span className="text-[9px] font-bold text-slate-400 ml-1">Mins</span>
                                                            <input
                                                                type="text"
                                                                value={config.minutesLabel}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, minutesLabel: e.target.value }))}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-center outline-none focus:border-blue-500 transition-all shadow-sm"
                                                                placeholder="M"
                                                                maxLength={8}
                                                            />
                                                        </div>
                                                        <div className="space-y-1 flex-1">
                                                            <span className="text-[9px] font-bold text-slate-400 ml-1">Secs</span>
                                                            <input
                                                                type="text"
                                                                value={config.secondsLabel}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, secondsLabel: e.target.value }))}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-center outline-none focus:border-blue-500 transition-all shadow-sm"
                                                                placeholder="S"
                                                                maxLength={8}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="h-[1px] bg-slate-50" />
                                    </section>

                                    {/* Call to Action */}
                                    <section className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Call to Action</h3>
                                            <button
                                                onClick={() => setConfig(prev => ({ ...prev, showCTA: !prev.showCTA }))}
                                                className={`w-10 h-5 rounded-full transition-all relative ${config.showCTA ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.showCTA ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        {config.showCTA && (
                                            <div className="space-y-4 animate-fade-in">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Button Text</label>
                                                    <input
                                                        type="text"
                                                        value={config.ctaText}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, ctaText: e.target.value }))}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Button Link</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={config.ctaUrl}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, ctaUrl: e.target.value }))}
                                                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm text-blue-600"
                                                        />
                                                        <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="h-[1px] bg-slate-50" />
                                    </section>

                                    {/* Promotional Badge */}
                                    <section className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Promotional Badge</h3>
                                            <button
                                                onClick={() => setConfig(prev => ({ ...prev, showBogoBadge: !prev.showBogoBadge }))}
                                                className={`w-10 h-5 rounded-full transition-all relative ${config.showBogoBadge ? 'bg-red-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.showBogoBadge ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        {config.showBogoBadge && (
                                            <div className="space-y-4 animate-fade-in">
                                                {/* Badge Type Selector */}
                                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                                    <button
                                                        onClick={() => setConfig(prev => ({ ...prev, badgeType: 'text' }))}
                                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${config.badgeType === 'text' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        Badge Text
                                                    </button>
                                                    <button
                                                        onClick={() => setConfig(prev => ({ ...prev, badgeType: 'image' }))}
                                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${config.badgeType === 'image' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        Badge Image
                                                    </button>
                                                </div>

                                                {config.badgeType === 'text' && isSeasonalLayout && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Badge Top Line</label>
                                                        <input
                                                            type="text"
                                                            value={config.badgeTopText || ''}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, badgeTopText: e.target.value }))}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 transition-all shadow-sm"
                                                            placeholder="e.g. FLAT"
                                                        />
                                                    </div>
                                                )}
                                                {config.badgeType === 'text' ? (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Badge Text</label>
                                                        <input
                                                            type="text"
                                                            value={config.bogoText}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, bogoText: e.target.value }))}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 transition-all shadow-sm"
                                                            placeholder="e.g. 50% OFF"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Badge Image URL</label>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type="text"
                                                                    value={config.badgeImage}
                                                                    onChange={(e) => setConfig(prev => ({ ...prev, badgeImage: e.target.value }))}
                                                                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                                                    placeholder="https://..."
                                                                />
                                                                <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                            </div>
                                                            <button
                                                                onClick={handleImageUpload}
                                                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-3 rounded-xl border border-slate-200 transition-colors whitespace-nowrap"
                                                                type="button"
                                                            >
                                                                Upload
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {!isSeasonalLayout && (<>
                                                {/* Badge Horizontal Position */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Horizontal Position</label>
                                                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                                                        {[
                                                            { id: 'left', name: 'Left' },
                                                            { id: 'right', name: 'Right' }
                                                        ].map((pos) => (
                                                            <button
                                                                key={pos.id}
                                                                type="button"
                                                                onClick={() => setConfig(prev => ({ ...prev, badgePosition: pos.id }))}
                                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${(config.badgePosition || 'left') === pos.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                            >
                                                                {pos.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Badge Vertical Position */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vertical Position</label>
                                                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                                                        {[
                                                            { id: 'top', name: 'Top' },
                                                            { id: 'middle', name: 'Middle' },
                                                            { id: 'bottom', name: 'Bottom' }
                                                        ].map((pos) => (
                                                            <button
                                                                key={pos.id}
                                                                type="button"
                                                                onClick={() => setConfig(prev => ({ ...prev, badgeVerticalPosition: pos.id }))}
                                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${(config.badgeVerticalPosition || 'middle') === pos.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                            >
                                                                {pos.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                </>)}
                                            </div>
                                        )}
                                        <div className="h-[1px] bg-slate-50" />
                                    </section>



                                    {/* Banner Background */}
                                    <section className="space-y-6">
                                        <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Banner Background</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'gradient', name: 'Gradient', color: 'bg-gradient-to-r from-blue-700 to-blue-500' },
                                                { id: 'solid', name: 'Solid Color', color: 'bg-[#111827]' }
                                            ].map(bg => (
                                                <button
                                                    key={bg.id}
                                                    onClick={() => setConfig(prev => ({ ...prev, bgType: bg.id }))}
                                                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all gap-3 ${config.bgType === bg.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                                >
                                                    <div className={`w-full h-8 rounded-lg ${bg.color} relative`}>
                                                        {config.bgType === bg.id && (
                                                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white">
                                                                <CheckCircle2 size={10} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`text-[11px] font-black ${config.bgType === bg.id ? 'text-blue-600' : 'text-slate-400'}`}>{bg.name}</span>
                                                </button>
                                            ))}
                                            {/* Image Option */}
                                            <button
                                                onClick={() => setConfig(prev => ({ ...prev, bgType: 'image' }))}
                                                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all gap-3 col-span-1 ${config.bgType === 'image' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                            >
                                                <div className="w-full h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 relative">
                                                    <ImageIcon size={16} />
                                                    {config.bgType === 'image' && (
                                                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white">
                                                            <CheckCircle2 size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`text-[11px] font-black ${config.bgType === 'image' ? 'text-blue-600' : 'text-slate-400'}`}>Image</span>
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'design' && (
                                <div className="space-y-4 animate-fade-in">
                                    {isSeasonalLayout && (
                                        <section className="space-y-2">
                                            <h3 className="text-sm font-black text-[#0F172A] tracking-tight">{seasonalPack.label} Scene</h3>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {Object.entries(seasonalPack.scenes).map(([sceneId, scene]) => (
                                                    <button
                                                        key={sceneId}
                                                        type="button"
                                                        onClick={() => setConfig(prev => ({ ...prev, scene: sceneId }))}
                                                        className={`flex flex-col items-center gap-1 py-2.5 px-1 text-[11px] font-bold rounded-lg border transition-all ${activeSceneId === sceneId ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'}`}
                                                    >
                                                        <span className="text-lg leading-none">{scene.icon}</span>
                                                        <span className="truncate max-w-full">{scene.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="h-[1px] bg-slate-50" />
                                        </section>
                                    )}
                                    {/* Background Styling */}
                                    <section className="space-y-2">
                                        <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Background Styling</h3>

                                        {config.bgType === 'solid' && (
                                            <div className="space-y-2">
                                                {/* Fill Color */}
                                                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                                                    <span className="text-xs font-bold text-slate-600">Fill Color</span>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="text"
                                                            value={config.bgSolid}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, bgSolid: e.target.value }))}
                                                            className="text-[10px] font-mono text-slate-400 bg-transparent border-none w-14 outline-none p-0 focus:text-slate-900"
                                                        />
                                                        <div className="relative group/color cursor-pointer">
                                                            <div
                                                                className="w-6 h-6 rounded-md border border-slate-200 shadow-sm"
                                                                style={{ backgroundColor: config.bgSolid }}
                                                            />
                                                            <input
                                                                type="color"
                                                                value={config.bgSolid}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, bgSolid: e.target.value }))}
                                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {config.bgType === 'gradient' && (
                                            <div className="space-y-2">
                                                {/* Gradient Value */}
                                                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                                                    <span className="text-xs font-bold text-slate-600">Gradient Value</span>
                                                    <input
                                                        type="text"
                                                        value={config.bgGradient}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, bgGradient: e.target.value }))}
                                                        className="text-[10px] font-mono text-slate-400 bg-transparent border-none w-40 text-right outline-none p-0 focus:text-slate-900"
                                                    />
                                                </div>

                                                {/* Gradient Presets */}
                                                <div className="p-2 border border-slate-200 rounded-md hover:border-slate-300 transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-slate-600">Presets</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {[
                                                            'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                                            'linear-gradient(135deg, #111827 0%, #374151 100%)',
                                                            'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                                                            'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                                        ].map(grad => (
                                                            <button
                                                                key={grad}
                                                                onClick={() => setConfig(prev => ({ ...prev, bgGradient: grad }))}
                                                                className="w-8 h-8 rounded-lg border-2 border-white shadow-sm ring-1 ring-black/5 hover:scale-110 transition-transform"
                                                                style={{ background: grad }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {config.bgType === 'image' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Background Image URL</label>
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                value={config.bgImage}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, bgImage: e.target.value }))}
                                                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                                                placeholder="https://..."
                                                            />
                                                            <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                        </div>
                                                        <button
                                                            onClick={handleBgImageUpload}
                                                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-3 rounded-xl border border-slate-200 transition-colors whitespace-nowrap"
                                                            type="button"
                                                        >
                                                            Upload
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* Background Effects (PRO) */}
                                        <div className="space-y-2 pt-3 border-t border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-slate-600">Background Effect</span>
                                                    {!isPro && (
                                                        <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-amber-500 text-white rounded shadow-sm" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                                                            PRO
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {[
                                                    { id: 'none', label: 'None', icon: '🚫' },
                                                    { id: 'snow', label: 'Snowflakes', icon: '❄️' },
                                                    { id: 'confetti', label: 'Confetti', icon: '🎉' },
                                                    { id: 'embers', label: 'Fire Embers', icon: '🔥' },
                                                    { id: 'aurora', label: 'Light Sweep', icon: '✨' },
                                                    { id: 'orbs', label: 'Floating Orbs', icon: '🫧' },
                                                    { id: 'grid', label: 'Dot Matrix', icon: '📐' }
                                                ].map((eff) => (
                                                    <button
                                                        key={eff.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (eff.id !== 'none' && !isPro) {
                                                                setProModalReason('Dynamic background effects require a wiseCampaign Pro license.');
                                                                setShowProModal(true);
                                                                return;
                                                            }
                                                            setConfig(prev => ({ ...prev, bgEffect: eff.id }));
                                                        }}
                                                        className={`py-2 px-2.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-between text-left cursor-pointer ${
                                                            (config.bgEffect || 'none') === eff.id
                                                                ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm font-black'
                                                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            <span className="text-sm">{eff.icon}</span>
                                                            <span className="truncate">{eff.label}</span>
                                                        </div>
                                                        {eff.id !== 'none' && !isPro && (
                                                            <span className="text-[7px] font-black uppercase tracking-wider bg-amber-100 text-amber-600 px-1 py-0.5 rounded ml-1">
                                                                PRO
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Effect Intensity Slider */}
                                            {config.bgEffect && config.bgEffect !== 'none' && (
                                                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group mt-2">
                                                    <span className="text-xs font-bold text-slate-600">Effect Intensity</span>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="10"
                                                            max="100"
                                                            value={config.bgEffectOpacity !== undefined ? parseInt(config.bgEffectOpacity) : 60}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, bgEffectOpacity: parseInt(e.target.value) }))}
                                                            className="w-28 accent-blue-600"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold text-slate-400 w-8">{config.bgEffectOpacity || 60}%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="h-[1px] bg-slate-50" />
                                    </section>


                                    {/* Typography Design */}
                                    <section className="space-y-2">
                                        <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Typography Design</h3>

                                        {/* Headline Design */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Type size={14} className="text-blue-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Headline Style</span>
                                            </div>
                                            <div className="space-y-2">
                                                {/* Font Size */}
                                                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md hover:border-slate-300 transition-colors group">
                                                    <span className="text-xs font-bold text-slate-600">Font Size</span>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="10"
                                                            max="48"
                                                            value={parseInt(config.headlineSize)}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, headlineSize: `${e.target.value}px` }))}
                                                            className="w-32 accent-blue-600"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold text-slate-400 w-8">{config.headlineSize}</span>
                                                    </div>
                                                </div>

                                                {/* Text Color */}
                                                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md hover:border-slate-300 transition-colors group">
                                                    <span className="text-xs font-bold text-slate-600">Text Color</span>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="text"
                                                            value={config.headlineColor}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, headlineColor: e.target.value }))}
                                                            className="text-[10px] font-mono text-slate-400 bg-transparent border-none w-14 outline-none p-0 focus:text-slate-900"
                                                        />
                                                        <div className="relative group/color cursor-pointer">
                                                            <div
                                                                className="w-6 h-6 rounded-md border border-slate-200 shadow-sm"
                                                                style={{ backgroundColor: config.headlineColor }}
                                                            />
                                                            <input
                                                                type="color"
                                                                value={config.headlineColor}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, headlineColor: e.target.value }))}
                                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Highlight Color */}
                                                {config.headlineHighlight && (
                                                    <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md hover:border-slate-300 transition-colors group">
                                                        <span className="text-xs font-bold text-slate-600">Highlight Color</span>
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="text"
                                                                value={config.highlightColor}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, highlightColor: e.target.value }))}
                                                                className="text-[10px] font-mono text-slate-400 bg-transparent border-none w-14 outline-none p-0 focus:text-slate-900"
                                                            />
                                                            <div className="relative group/color cursor-pointer">
                                                                <div
                                                                    className="w-6 h-6 rounded-md border border-slate-200 shadow-sm"
                                                                    style={{ backgroundColor: config.highlightColor }}
                                                                />
                                                                <input
                                                                    type="color"
                                                                    value={config.highlightColor}
                                                                    onChange={(e) => setConfig(prev => ({ ...prev, highlightColor: e.target.value }))}
                                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sub-headline Design */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Type size={14} className="text-blue-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sub-headline Style</span>
                                            </div>
                                            <div className="space-y-2">
                                                {/* Font Size */}
                                                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md hover:border-slate-300 transition-colors group">
                                                    <span className="text-xs font-bold text-slate-600">Font Size</span>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="8"
                                                            max="32"
                                                            value={parseInt(config.subHeadlineSize)}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, subHeadlineSize: `${e.target.value}px` }))}
                                                            className="w-32 accent-blue-600"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold text-slate-400 w-8">{config.subHeadlineSize}</span>
                                                    </div>
                                                </div>

                                                {/* Text Color */}
                                                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md hover:border-slate-300 transition-colors group">
                                                    <span className="text-xs font-bold text-slate-600">Text Color</span>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="text"
                                                            value={config.subHeadlineColor}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, subHeadlineColor: e.target.value }))}
                                                            className="text-[10px] font-mono text-slate-400 bg-transparent border-none w-14 outline-none p-0 focus:text-slate-900"
                                                        />
                                                        <div className="relative group/color cursor-pointer">
                                                            <div
                                                                className="w-6 h-6 rounded-md border border-slate-200 shadow-sm"
                                                                style={{ backgroundColor: config.subHeadlineColor }}
                                                            />
                                                            <input
                                                                type="color"
                                                                value={config.subHeadlineColor}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, subHeadlineColor: e.target.value }))}
                                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-[1px] bg-slate-50" />
                                    </section>

                                    {/* Timer Design */}
                                    {config.showTimer && (
                                        <section className="space-y-2 animate-fade-in">
                                            <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Timer Components</h3>

                                            {/* Timer Colors */}
                                            <div className="space-y-2">
                                                {/* Timer Digits */}
                                                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                                                    <span className="text-xs font-bold text-slate-600">Timer Digits</span>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="text"
                                                            value={config.timerTextColor}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, timerTextColor: e.target.value }))}
                                                            className="text-[10px] font-mono text-slate-400 bg-transparent border-none w-14 outline-none p-0 focus:text-slate-900"
                                                        />
                                                        <div className="relative group/color cursor-pointer">
                                                            <div
                                                                className="w-6 h-6 rounded-md border border-slate-200 shadow-sm"
                                                                style={{ backgroundColor: config.timerTextColor }}
                                                            />
                                                            <input
                                                                type="color"
                                                                value={config.timerTextColor}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, timerTextColor: e.target.value }))}
                                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Unit Labels - Special case with fixed opacity display */}
                                                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                                                    <span className="text-xs font-bold text-slate-600">Unit Labels</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-mono font-bold text-slate-400">Fixed Opacity</span>
                                                        <div className="w-6 h-6 rounded-md bg-white/20 border border-slate-200 shadow-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {/* CTA Design */}
                                    {config.showCTA && (
                                        <section className="space-y-2 animate-fade-in">
                                            <h3 className="text-sm font-black text-[#0F172A] tracking-tight text-left">Button Styling</h3>

                                            {/* Button Colors */}
                                            <div className="space-y-2">
                                                {[
                                                    { id: 'ctaBg', label: 'Background' },
                                                    { id: 'ctaTextColor', label: 'Text Color' }
                                                ].map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                                                        <span className="text-xs font-bold text-slate-600">{item.label}</span>
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="text"
                                                                value={config[item.id]}
                                                                onChange={(e) => setConfig(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                                className="text-[10px] font-mono text-slate-400 bg-transparent border-none w-14 outline-none p-0 focus:text-slate-900"
                                                            />
                                                            <div className="relative group/color cursor-pointer">
                                                                <div
                                                                    className="w-6 h-6 rounded-md border border-slate-200 shadow-sm"
                                                                    style={{ backgroundColor: config[item.id] }}
                                                                />
                                                                <input
                                                                    type="color"
                                                                    value={config[item.id]}
                                                                    onChange={(e) => setConfig(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Corner Radius */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                                                    <span className="text-xs font-bold text-slate-600">Corner Radius</span>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="40"
                                                            value={parseInt(config.ctaRadius)}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, ctaRadius: `${e.target.value}px` }))}
                                                            className="w-32 accent-blue-600"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold text-slate-400 w-8">{config.ctaRadius}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Button Animation (PRO) */}
                                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold text-slate-600">Button Animation</span>
                                                        {!isPro && (
                                                            <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-amber-500 text-white rounded shadow-sm" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                                                                PRO
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {[
                                                        { id: 'none', label: 'None' },
                                                        { id: 'pulse', label: 'Pulse' },
                                                        { id: 'shake', label: 'Wobble' },
                                                        { id: 'bounce', label: 'Bounce' },
                                                        { id: 'heartbeat', label: 'Heartbeat' },
                                                        { id: 'shimmer', label: 'Shimmer Glow' },
                                                        { id: 'glow', label: 'Radiant Glow' }
                                                    ].map((anim) => (
                                                        <button
                                                            key={anim.id}
                                                            type="button"
                                                            onClick={() => {
                                                                if (anim.id !== 'none' && !isPro) {
                                                                    setProModalReason('Eye-catching button animations require a wiseCampaign Pro license.');
                                                                    setShowProModal(true);
                                                                    return;
                                                                }
                                                                setConfig(prev => ({ ...prev, ctaAnimation: anim.id }));
                                                            }}
                                                            className={`py-2 px-2.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-between text-left cursor-pointer ${
                                                                (config.ctaAnimation || 'none') === anim.id
                                                                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm font-black'
                                                                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                                                            }`}
                                                        >
                                                            <span className="truncate">{anim.label}</span>
                                                            {anim.id !== 'none' && !isPro && (
                                                                <span className="text-[7px] font-black uppercase tracking-wider bg-amber-100 text-amber-600 px-1 py-0.5 rounded ml-1">
                                                                    PRO
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </section>
                                    )}


                                    {/* Badge Styling */}
                                    {config.showBogoBadge && config.badgeType === 'text' && (
                                        <section className="space-y-4 animate-fade-in">
                                            <div className="h-[1px] bg-slate-50" />
                                            <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Badge Styling</h3>

                                            {/* Badge Background */}
                                            <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                                                <span className="text-xs font-bold text-slate-600">Background</span>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={config.badgeBgColor}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, badgeBgColor: e.target.value }))}
                                                        className="text-[10px] font-mono text-slate-400 bg-transparent border-none w-14 outline-none p-0 focus:text-slate-900"
                                                    />
                                                    <div className="relative group/color cursor-pointer">
                                                        <div
                                                            className="w-6 h-6 rounded-md border border-slate-200 shadow-sm"
                                                            style={{ backgroundColor: config.badgeBgColor }}
                                                        />
                                                        <input
                                                            type="color"
                                                            value={config.badgeBgColor}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, badgeBgColor: e.target.value }))}
                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Badge Text Color */}
                                            <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                                                <span className="text-xs font-bold text-slate-600">Text Color</span>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={config.badgeTextColor}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, badgeTextColor: e.target.value }))}
                                                        className="text-[10px] font-mono text-slate-400 bg-transparent border-none w-14 outline-none p-0 focus:text-slate-900"
                                                    />
                                                    <div className="relative group/color cursor-pointer">
                                                        <div
                                                            className="w-6 h-6 rounded-md border border-slate-200 shadow-sm"
                                                            style={{ backgroundColor: config.badgeTextColor }}
                                                        />
                                                        <input
                                                            type="color"
                                                            value={config.badgeTextColor}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, badgeTextColor: e.target.value }))}
                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-4 animate-fade-in text-left">
                                    <h3 className="text-sm font-black text-[#0F172A] tracking-tight mb-4">Display Locations</h3>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'displayOnAllPages', label: 'All Pages' }
                                        ].map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    setDisplaySettings(prev => {
                                                        const newValue = !prev[item.id];
                                                        let newState = { ...prev, [item.id]: newValue };

                                                        if (item.id === 'displayOnAllPages') {
                                                            if (newValue) {
                                                                newState.displayOnHomePage = true;
                                                                newState.selectedPages = availablePages.map(p => p.id);
                                                            }
                                                        }
                                                        return newState;
                                                    });
                                                }}
                                                className="flex items-center justify-between p-4 bg-white rounded-md border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group text-left shadow-sm"
                                            >
                                                <span className="text-xs font-black text-slate-600 group-hover:text-blue-600">{item.label}</span>
                                                <div
                                                    className={`w-10 h-5 rounded-full transition-all relative ${displaySettings[item.id] ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${displaySettings[item.id] ? 'right-1' : 'left-1'}`} />
                                                </div>
                                            </div>
                                        ))}
                                        {isPro && (
                                            <div className="space-y-3 pt-4 border-t border-slate-100 animate-fade-in">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Specific Pages</h4>
                                                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                                    {/* Home Page as a specific page option */}
                                                    <div
                                                        onClick={() => {
                                                            setDisplaySettings(prev => {
                                                                const newValue = !prev.displayOnHomePage;
                                                                let newState = { ...prev, displayOnHomePage: newValue };
                                                                if (!newValue) newState.displayOnAllPages = false;
                                                                return newState;
                                                            });
                                                        }}
                                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group ${displaySettings.displayOnHomePage ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                                    >
                                                        <span className={`text-[11px] font-black ${displaySettings.displayOnHomePage ? 'text-blue-600' : 'text-slate-500'}`}>Home Page</span>
                                                        <div
                                                            className={`w-8 h-4 rounded-full transition-all relative ${displaySettings.displayOnHomePage ? 'bg-blue-600 shadow-md shadow-blue-100' : 'bg-slate-200'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${displaySettings.displayOnHomePage ? 'right-0.5' : 'left-0.5'}`} />
                                                        </div>
                                                    </div>

                                                    {availablePages.map(page => {
                                                        const isSelected = displaySettings.selectedPages?.some(id => String(id) === String(page.id));
                                                        return (
                                                            <div
                                                                key={page.id}
                                                                onClick={() => {
                                                                    const currentSelected = displaySettings.selectedPages || [];
                                                                    const isRemoving = isSelected;
                                                                    const newSelected = isRemoving
                                                                        ? currentSelected.filter(id => String(id) !== String(page.id))
                                                                        : [...currentSelected, page.id];

                                                                    setDisplaySettings(prev => {
                                                                        let newState = { ...prev, selectedPages: newSelected };
                                                                        if (isRemoving) {
                                                                            newState.displayOnAllPages = false;
                                                                        }
                                                                        return newState;
                                                                    });
                                                                }}
                                                                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group ${isSelected ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                                            >
                                                                <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>{page.title}</span>
                                                                <div
                                                                    className={`w-8 h-4 rounded-full transition-all relative ${isSelected ? 'bg-blue-600 shadow-md shadow-blue-100' : 'bg-slate-200'}`}
                                                                >
                                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isSelected ? 'right-0.5' : 'left-0.5'}`} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-slate-100">
                                        <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Banner Position</h3>
                                        <p className="text-[10px] text-slate-400 font-medium -mt-1">
                                            Select whether the banner displays at the top or bottom of your store.
                                        </p>
                                        <div className="bg-slate-100/80 p-1 rounded-xl flex items-center gap-1 border border-slate-200/50">
                                            <button
                                                type="button"
                                                onClick={() => setConfig(prev => ({ ...prev, position: 'top' }))}
                                                className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${config.position !== 'bottom' ? 'bg-white shadow-sm text-[#0F172A] border border-slate-200/40' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Top
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!isPro) {
                                                        setProModalReason('Setting the banner position to Bottom requires a wiseCampaign Pro license.');
                                                        setShowProModal(true);
                                                        return;
                                                    }
                                                    setConfig(prev => ({ ...prev, position: 'bottom' }));
                                                }}
                                                className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${config.position === 'bottom' && isPro ? 'bg-white shadow-sm text-[#0F172A] border border-slate-200/40' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                <span>Bottom</span>
                                                {!isPro && (
                                                    <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-amber-500 text-white rounded shadow-sm" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                                                        PRO
                                                    </span>
                                                )}
                                            </button>
                                        </div>

                                        <div
                                            onClick={() => {
                                                if (!isPro) {
                                                    setProModalReason('Enabling sticky / floating banner placement requires a wiseCampaign Pro license.');
                                                    setShowProModal(true);
                                                    return;
                                                }
                                                setConfig(prev => ({ ...prev, isSticky: !prev.isSticky }));
                                            }}
                                            className="flex items-center justify-between p-3.5 bg-white rounded-md border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group text-left shadow-sm mt-3"
                                        >
                                            <div className="flex flex-col pr-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-slate-600 group-hover:text-blue-600">
                                                        Sticky (Floating) Banner
                                                    </span>
                                                    {!isPro && (
                                                        <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-amber-500 text-white rounded shadow-sm" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                                                            PRO
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    Keep banner fixed while scrolling
                                                </span>
                                            </div>
                                            <div
                                                className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${config.isSticky && isPro ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.isSticky && isPro ? 'right-1' : 'left-1'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {isSeasonalLayout && (
                                        <div
                                            onClick={() => setConfig(prev => ({ ...prev, showClose: prev.showClose === false }))}
                                            className="flex items-center justify-between p-3.5 bg-white rounded-md border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group text-left shadow-sm"
                                        >
                                            <div className="flex flex-col pr-2">
                                                <span className="text-xs font-black text-slate-600 group-hover:text-blue-600">Close Button</span>
                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    Let visitors dismiss the banner for their session
                                                </span>
                                            </div>
                                            <div className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${config.showClose !== false ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.showClose !== false ? 'right-1' : 'left-1'}`} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3 pt-6 border-t border-slate-100">
                                        <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Branding Settings</h3>
                                        <div
                                            onClick={() => {
                                                if (!isPro) {
                                                    setProModalReason('Removing the "Made with wiseCampaign" branding requires a wiseCampaign Pro license.');
                                                    setShowProModal(true);
                                                    return;
                                                }
                                                setConfig(prev => ({ ...prev, hideBranding: !prev.hideBranding }));
                                            }}
                                            className="flex items-center justify-between p-4 bg-white rounded-md border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group text-left shadow-sm"
                                        >
                                            <div className="flex flex-col pr-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-slate-600 group-hover:text-blue-600">
                                                        Hide "Made with wiseCampaign"
                                                    </span>
                                                    {!isPro && (
                                                        <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white rounded shadow-sm" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                                                            PRO
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    Remove branding badge from banner
                                                </span>
                                            </div>
                                            <div
                                                className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${config.hideBranding && isPro ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.hideBranding && isPro ? 'right-1' : 'left-1'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Preview Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col relative group">
                    {!config.isActive && showDisabledOverlay && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-slate-900/10 transition-all duration-500">
                            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white flex flex-col items-center gap-4 max-w-sm text-center animate-in fade-in zoom-in duration-300 relative">
                                <button
                                    onClick={() => setShowDisabledOverlay(false)}
                                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                                >
                                    <X size={18} />
                                </button>
                                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Banner Disabled</h3>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                    This banner is currently inactive and hidden from storefront visitors.
                                </p>
                                <button
                                    onClick={() => setShowStatusConfirm(true)}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 text-xs"
                                >
                                    Activate Banner Now
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mock Browser / Phone Frame */}
                    <div className="flex-1 flex justify-center items-start p-6 sm:p-8 pt-4 overflow-x-auto custom-scrollbar">
                        {device === 'mobile' ? (
                            /* Mobile Phone Shell */
                            <div className="w-[375px] max-w-full bg-slate-900 rounded-[44px] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.3)] border-4 border-slate-800 flex flex-col transition-all duration-500 my-2">
                                {/* Top Dynamic Island & Status Bar */}
                                <div className="px-5 pt-1 pb-2 flex items-center justify-between text-white text-[11px] font-semibold select-none">
                                    <span>9:41</span>
                                    <div className="w-20 h-4 bg-black rounded-full shadow-inner flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-slate-800 ml-auto mr-1.5" />
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] opacity-80">
                                        <span>5G</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                {/* Phone Inner Screen */}
                                <div className="bg-white rounded-[32px] overflow-hidden flex flex-col flex-1 shadow-inner">
                                    {/* Mobile Browser Address Bar */}
                                    <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between gap-2">
                                        <div className="flex-1 bg-white h-6 rounded-full flex items-center px-3 gap-2 border border-slate-200 shadow-sm text-[10px] text-slate-600 font-medium justify-center">
                                            <Search size={10} className="text-slate-400" />
                                            <span>mysite.com</span>
                                        </div>
                                    </div>

                                    {/* Top Banner (LIVE) */}
                                    {config.position !== 'bottom' && (
                                        <BannerContent isMobileMode={true} />
                                    )}

                                    {/* Mobile Storefront Skeleton */}
                                    <div className="flex-1 bg-white p-4 space-y-4 overflow-y-auto max-h-[460px] custom-scrollbar">
                                        {/* Mobile Nav Header */}
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <div className="w-5 h-3 flex flex-col justify-between">
                                                <span className="w-full h-0.5 bg-slate-800 rounded-full" />
                                                <span className="w-full h-0.5 bg-slate-800 rounded-full" />
                                                <span className="w-3/4 h-0.5 bg-slate-800 rounded-full" />
                                            </div>
                                            <div className="w-7 h-7 rounded-full bg-slate-900" />
                                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                                            </div>
                                        </div>

                                        {/* Mobile Hero Banner */}
                                        <div className="aspect-[16/9] bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl relative overflow-hidden flex flex-col justify-end p-3 animate-pulse">
                                            <div className="w-2/3 h-3 bg-white/80 rounded-full mb-1.5" />
                                            <div className="w-1/2 h-2.5 bg-white/60 rounded-full" />
                                        </div>

                                        {/* Horizontal Category Pills */}
                                        <div className="flex gap-2 overflow-hidden py-1">
                                            <div className="w-16 h-5 rounded-full bg-slate-900 shrink-0" />
                                            <div className="w-14 h-5 rounded-full bg-slate-100 shrink-0" />
                                            <div className="w-16 h-5 rounded-full bg-slate-100 shrink-0" />
                                            <div className="w-14 h-5 rounded-full bg-slate-100 shrink-0" />
                                        </div>

                                        {/* Mobile 2-Column Product Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="space-y-2">
                                                    <div className="aspect-square bg-slate-100 rounded-xl relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="h-2.5 w-3/4 rounded-full bg-slate-100 animate-pulse" />
                                                        <div className="h-2 w-1/2 rounded-full bg-slate-100 animate-pulse" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bottom Banner (LIVE) */}
                                    {config.position === 'bottom' && (
                                        <BannerContent isMobileMode={true} />
                                    )}

                                    {/* Home Indicator Bar */}
                                    <div className="py-2 bg-white flex justify-center border-t border-slate-50">
                                        <div className="w-28 h-1 bg-slate-300 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Desktop Browser Shell (80% scale) */
                            <div
                                className="w-full max-w-[1240px] transition-all duration-500 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden flex flex-col"
                                style={{ zoom: 0.8 }}
                            >
                                {/* Browser Address Bar */}
                                <div className="bg-[#F8FAFC] px-6 py-2.5 border-b border-slate-200 flex items-center gap-4 shrink-0">
                                    <div className="flex gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
                                    </div>
                                    <div className="flex-1 max-w-3xl mx-auto bg-white h-7 rounded-lg flex items-center px-4 gap-3 border border-slate-200/60 shadow-sm">
                                        <Search size={12} className="text-slate-300" />
                                        <span className="text-[11px] font-medium text-slate-500 tracking-tight">mysite.com/home</span>
                                    </div>
                                </div>

                                {/* Top Banner Preview (LIVE) */}
                                {config.position !== 'bottom' && (
                                    <BannerContent isMobileMode={false} />
                                )}

                                {/* Page Content Skeleton */}
                                <div className="flex-1 bg-white overflow-y-auto p-10 custom-scrollbar">
                                    {/* Navigation Skeleton */}
                                    <div className="flex items-center justify-between mb-12">
                                        <div className="w-10 h-10 rounded-full bg-slate-900" />
                                        <div className="flex gap-10">
                                            <div className="w-16 h-3 rounded-full bg-slate-100" />
                                            <div className="w-16 h-3 rounded-full bg-slate-100" />
                                            <div className="w-16 h-3 rounded-full bg-slate-100" />
                                        </div>
                                        <div className="w-20 h-8 rounded-full bg-slate-100" />
                                    </div>

                                    {/* Hero Area - All skeletons, no images */}
                                    <div className="flex items-center gap-12 mb-16">
                                        <div className="flex-1 space-y-6">
                                            <div className="w-24 h-4 rounded-full bg-blue-100" />
                                            <div className="space-y-3">
                                                <div className="w-full h-10 rounded-2xl bg-slate-100" />
                                                <div className="w-3/4 h-10 rounded-2xl bg-slate-100" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="w-2/3 h-3.5 rounded-full bg-slate-50" />
                                                <div className="w-1/2 h-3.5 rounded-full bg-slate-50" />
                                            </div>
                                            <div className="flex gap-4 pt-2">
                                                <div className="w-28 h-10 rounded-2xl bg-slate-900" />
                                                <div className="w-28 h-10 rounded-2xl border border-slate-200" />
                                            </div>
                                        </div>
                                        {/* Hero image replaced with skeleton */}
                                        <div className="w-[420px] aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 relative shrink-0">
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <div className="w-8 h-8 rounded-lg bg-white/40 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Grid - All skeletons */}
                                    <div className="grid grid-cols-3 gap-8">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="space-y-3">
                                                {/* Product image skeleton */}
                                                <div className="aspect-[4/3] bg-slate-100 rounded-2xl relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-3.5 w-2/3 rounded-full bg-slate-100 animate-pulse" />
                                                    <div className="h-3.5 w-1/3 rounded-full bg-slate-100 animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Second row of products */}
                                    <div className="grid grid-cols-3 gap-8 mt-8">
                                        {[4, 5, 6].map(i => (
                                            <div key={i} className="space-y-3 opacity-75">
                                                <div className="aspect-[4/3] bg-slate-50 rounded-2xl relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-3.5 w-2/3 rounded-full bg-slate-50 animate-pulse" />
                                                    <div className="h-3.5 w-1/3 rounded-full bg-slate-50 animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom Banner Preview (LIVE) */}
                                {config.position === 'bottom' && (
                                    <BannerContent isMobileMode={false} />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] pointer-events-none opacity-40">
                        <span className="w-8 h-[2px] bg-slate-300" />
                        Previewing {device === 'mobile' ? 'mobile' : 'desktop'} version at {device === 'mobile' ? '100%' : '80%'} scale
                        <span className="w-8 h-[2px] bg-slate-300" />
                    </div>
                </main>
            </div >
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                .animate-slide-up {
                    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes bounceSubtle {
                    0%, 100% { transform: translate(-50%, 0); }
                    50% { transform: translate(-50%, -5px); }
                }
                .animate-bounce-subtle {
                    animation: bounceSubtle 2s infinite ease-in-out;
                }
                .shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite linear;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div >
    );
}


export default App;
