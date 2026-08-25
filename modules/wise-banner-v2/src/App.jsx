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
    Sparkles
} from 'lucide-react';

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
    }
];

function App() {
    const [activeTab, setActiveTab] = useState('design');
    const [device, setDevice] = useState('desktop');
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState('holiday-gradient');

    const [config, setConfig] = useState({
        id: 'holiday-gradient',
        name: 'Holiday Sale Gradient',
        bgType: 'gradient',
        bgSolid: '#0F172A',
        bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        bgImage: '',
        headline: 'Black Friday Mega Sale!',
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
        showBogoBadge: false,
        badgeType: 'text',
        badgeImage: '',
        bogoText: '50% OFF',
        badgeBgColor: '#EF4444',
        badgeTextColor: '#FFFFFF',
        badgeRotation: '-12deg',
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
        position: 'top',
        isSticky: false,
        isActive: true
    });

    const [displaySettings, setDisplaySettings] = useState({
        displayOnAllPages: true,
        displayOnHomePage: false,
        selectedPages: []
    });

    const [isPro, setIsPro] = useState(window.wiseBannerData?.isPro || false);
    const [availablePages, setAvailablePages] = useState([]);

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [showDisabledOverlay, setShowDisabledOverlay] = useState(true);
    const [showProModal, setShowProModal] = useState(false);
    const [proModalReason, setProModalReason] = useState('');
    const [globalToast, setGlobalToast] = useState(null);

    const isStorefront = window.wiseBannerData?.isStorefront || false;

    useEffect(() => {
        if (!config.isActive) {
            setShowDisabledOverlay(true);
        }
    }, [config.isActive]);

    useEffect(() => {
        if (!isStorefront) {
            fetchSettings();
        } else {
            // If storefront, we already have data in window.wiseBannerData.config
            if (window.wiseBannerData?.config) {
                setConfig(window.wiseBannerData.config);
                setSelectedTemplateId(window.wiseBannerData.config.id || 'holiday-gradient');
            }
            if (window.wiseBannerData?.isPro !== undefined) {
                setIsPro(!!window.wiseBannerData.isPro);
            }
            setIsLoading(false);
        }
    }, []);

    const fetchSettings = async () => {
        try {
            const baseUrl = window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/';
            const nonce = window.wiseModuleData?.nonce;
            const headers = nonce ? { 'X-WP-Nonce': nonce } : {};

            // Fetch Banner Design
            const resBanner = await fetch(`${baseUrl}banner-v2`, { headers });
            const bannerData = await resBanner.json();
            if (bannerData && bannerData.id) {
                setConfig(bannerData);
                setSelectedTemplateId(bannerData.id);
            }

            // Fetch Display Settings
            const resSettings = await fetch(`${baseUrl}banner-v2/settings`, { headers });
            const settings = await resSettings.json();
            if (settings) {
                setDisplaySettings(prev => ({ ...prev, ...settings }));
            }

            // Fetch License Status
            const resLicense = await fetch(`${baseUrl}banner-v2/license`, { headers });
            const licenseData = await resLicense.json();
            if (licenseData && licenseData.valid) {
                setIsPro(true);
                // Fetch Available Pages if Pro
                const resPages = await fetch(`${baseUrl}banner-v2/pages`, { headers });
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


    const CountdownTimer = ({ endDate, endTime, textColor, bgColor, label, labelPosition = 'left', daysLabel = 'D', hoursLabel = 'H', minutesLabel = 'M', secondsLabel = 'S', enableRecursion = false, recurrenceAmount = 24, recurrenceUnit = 'hours', isMobileMode = false }) => {
        const [timeLeft, setTimeLeft] = useState({ days: '00', hrs: '00', min: '00', sec: '00' });

        useEffect(() => {
            const calculateTime = () => {
                let target = new Date(`${endDate}T${endTime}:00`);
                let now = new Date();
                let diff = target.getTime() - now.getTime();

                // Handle Recurring Mode (Evergreen Loop after fixed end)
                if (enableRecursion && diff <= 0) {
                    const amount = parseInt(recurrenceAmount) || 24;
                    const msPerUnit = recurrenceUnit === 'days' ? 86400000 : (recurrenceUnit === 'hours' ? 3600000 : 60000);
                    const intervalMs = amount * msPerUnit;

                    // Add intervals until target is in the future
                    const intervalsPassed = Math.floor(Math.abs(diff) / intervalMs) + 1;
                    target = new Date(target.getTime() + (intervalsPassed * intervalMs));
                    diff = target.getTime() - now.getTime();
                }

                if (diff <= 0) {
                    return { days: '00', hrs: '00', min: '00', sec: '00' };
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const min = Math.floor((diff / (1000 * 60)) % 60);
                const sec = Math.floor((diff / 1000) % 60);

                return {
                    days: days.toString().padStart(2, '0'),
                    hrs: hrs.toString().padStart(2, '0'),
                    min: min.toString().padStart(2, '0'),
                    sec: sec.toString().padStart(2, '0')
                };
            };

            const timer = setInterval(() => {
                setTimeLeft(calculateTime());
            }, 1000);

            setTimeLeft(calculateTime());
            return () => clearInterval(timer);
        }, [endDate, endTime, enableRecursion, recurrenceAmount, recurrenceUnit]);

        const getFlexDirection = () => {
            switch (labelPosition) {
                case 'top': return 'flex-col items-center';
                case 'bottom': return 'flex-col-reverse items-center';
                case 'right': return 'flex-row-reverse items-center';
                case 'left':
                default: return 'flex-row items-center';
            }
        };

        return (
            <div className={`flex gap-2 shrink-0 ${getFlexDirection()} ${!isMobileMode ? 'sm:gap-4' : ''}`}>
                <span className={`text-[7px] font-black tracking-[0.1em] opacity-60 uppercase whitespace-nowrap ${!isMobileMode ? 'sm:text-[9px] sm:tracking-[0.2em]' : ''}`} style={{ color: textColor }}>{label}</span>
                <div className={`flex gap-1 ${!isMobileMode ? 'sm:gap-2' : ''}`}>
                    {[
                        { val: timeLeft.days, label: daysLabel },
                        { val: timeLeft.hrs, label: hoursLabel },
                        { val: timeLeft.min, label: minutesLabel },
                        { val: timeLeft.sec, label: secondsLabel }
                    ].map((t, idx) => (
                        <React.Fragment key={idx}>
                            <div
                                className={`flex flex-col items-center backdrop-blur-md rounded-lg px-1.5 py-0.5 min-w-[28px] border border-white/10 shadow-sm ${!isMobileMode ? 'sm:px-2 sm:min-w-[34px]' : ''}`}
                                style={{
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    borderColor: `${textColor}22`
                                }}
                            >
                                <span className={`text-[10px] font-black drop-shadow-sm leading-tight ${!isMobileMode ? 'sm:text-xs' : ''}`}>{t.val}</span>
                                <span className={`text-[6px] font-black opacity-50 leading-none mt-0.5 tracking-tighter ${!isMobileMode ? 'sm:text-[7px]' : ''}`}>{t.label}</span>
                            </div>
                            {idx < 3 && <span className={`text-[10px] font-black self-center opacity-30 ${!isMobileMode ? 'sm:text-xs' : ''}`} style={{ color: textColor }}>:</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    const BannerContent = ({ isMobileMode = false }) => {
        const [copied, setCopied] = useState(false);
        if (isLoading) return null;

        const handleCopyCode = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const code = config.couponCode;

            try {
                // Try modern Clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(code);
                } else {
                    // Fallback to execCommand('copy')
                    const textArea = document.createElement("textarea");
                    textArea.value = code;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-9999px";
                    textArea.style.top = "0";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    if (!successful) throw new Error('execCommand failed');
                }

                setCopied(true);
                setGlobalToast(`Coupon code "${code}" copied to clipboard!`);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
                setGlobalToast('Failed to copy code. Please copy it manually.');
            }
        };

        const getCouponLayout = () => {
            switch (config.couponPlacement) {
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

        return (
            <div
                className={`w-full py-4 px-6 flex flex-col items-center justify-between gap-4 relative transition-all duration-300 ${!isMobileMode ? 'sm:py-5 sm:px-12 md:px-32 md:flex-row' : ''}`}
                style={{
                    backgroundColor: config.bgType === 'solid' ? config.bgSolid : undefined,
                    backgroundImage: config.bgType === 'gradient' ? config.bgGradient : (config.bgType === 'image' ? `url(${config.bgImage})` : undefined),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {config.showBogoBadge && (
                    <div className="absolute left-1 top-2 z-[10000] animate-bounce-subtle pointer-events-none">
                        <div className="relative group">
                            {config.badgeType === 'image' && config.badgeImage ? (
                                <img
                                    src={config.badgeImage}
                                    alt="Badge"
                                    className={`w-16 object-contain drop-shadow-xl hover:scale-105 transition-transform ${!isMobileMode ? 'sm:w-20' : ''}`}
                                />
                            ) : (
                                <>
                                    <div
                                        className="absolute inset-0 rounded-full blur-[8px] opacity-40 group-hover:opacity-60 transition-opacity"
                                        style={{ backgroundColor: config.badgeBgColor }}
                                    />
                                    <div
                                        className={`relative font-black text-[10px] px-3 py-1.5 rounded-full border border-white/20 shadow-xl flex items-center justify-center tracking-tighter ${!isMobileMode ? 'sm:text-xs sm:px-4 sm:py-2' : ''}`}
                                        style={{
                                            backgroundColor: config.badgeBgColor,
                                            color: config.badgeTextColor,
                                            transform: `rotate(${config.badgeRotation || '-12deg'})`
                                        }}
                                    >
                                        {config.bogoText}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className={`flex flex-1 w-full gap-3 ${getCouponLayout()} ${getCouponAlign()} ${!isMobileMode && getCouponLayout().includes('row') ? 'md:justify-start' : ''}`}>
                    <div className={`flex flex-col text-center ${!isMobileMode ? 'md:text-left md:w-auto' : 'w-full'}`}>
                        <span
                            className={`tracking-tight drop-shadow-sm line-clamp-2 ${!isMobileMode ? 'md:line-clamp-1' : ''}`}
                            style={{
                                color: config.headlineColor,
                                fontSize: `clamp(14px, 4vw, ${config.headlineSize})`,
                                fontWeight: config.headlineWeight
                            }}
                        >
                            {config.headline}
                        </span>
                        {config.showSubHeadline && (
                            <span
                                className={`font-bold tracking-tight mt-0.5 line-clamp-2 opacity-90 ${!isMobileMode ? 'md:line-clamp-1' : ''}`}
                                style={{
                                    color: config.subHeadlineColor,
                                    fontSize: `clamp(11px, 3vw, ${config.subHeadlineSize})`,
                                    fontWeight: config.subHeadlineWeight
                                }}
                            >
                                {config.subHeadline}
                            </span>
                        )}
                    </div>

                    {config.showCouponCode && (
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
                                className="px-3 py-1 rounded-lg border-2 border-dashed flex items-center gap-1.5 transition-all duration-300 group-hover:bg-opacity-20"
                                style={{
                                    borderColor: copied ? '#22c55e' : `${config.headlineColor}44`,
                                    backgroundColor: copied ? '#22c55e22' : `${config.headlineColor}11`,
                                    color: copied ? '#16a34a' : config.headlineColor
                                }}
                            >
                                <span className={`text-[10px] uppercase font-black tracking-widest opacity-50`}>CODE:</span>
                                <span className={`text-xs font-black tracking-tight`}>{config.couponCode}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex flex-wrap items-center justify-center gap-4 w-full ${!isMobileMode ? 'md:justify-end sm:gap-8 md:gap-10 md:w-auto' : ''}`}>
                    {config.showTimer && (
                        <CountdownTimer
                            endDate={config.endDate}
                            endTime={config.endTime}
                            textColor={config.timerTextColor}
                            bgColor={config.timerBgColor}
                            label={config.timerLabel}
                            labelPosition={config.timerLabelPosition}
                            daysLabel={config.daysLabel}
                            hoursLabel={config.hoursLabel}
                            secondsLabel={config.secondsLabel}
                            enableRecursion={config.enableRecursion}
                            recurrenceAmount={config.recurrenceAmount}
                            recurrenceUnit={config.recurrenceUnit}
                            isMobileMode={isMobileMode}
                        />
                    )}

                    {config.showCTA && (
                        <a
                            href={config.ctaUrl}
                            className={`px-4 py-2 text-[10px] font-black shadow-xl flex items-center gap-2 group cursor-pointer transition-all hover:brightness-105 active:scale-95 shrink-0 no-underline whitespace-nowrap ${!isMobileMode ? 'sm:px-6 sm:py-2.5 sm:text-xs' : ''}`}
                            style={{
                                backgroundColor: config.ctaBg,
                                color: config.ctaTextColor,
                                borderRadius: config.ctaRadius
                            }}
                        >
                            {config.ctaText}
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </a>
                    )}
                </div>

                {(!isPro || !config.hideBranding) && (
                    <a
                        href="https://wisemattic.com/wisecampaign"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 bottom-0.5 sm:right-6 sm:bottom-0.5 text-[7.5px] font-medium opacity-75 hover:opacity-100 transition-opacity no-underline shrink-0 whitespace-nowrap flex items-center gap-1 z-[100]"
                        style={{ color: config.headlineColor }}
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
        const isSticky = isPro && config.isSticky;
        const isBottom = isPro && config.position === 'bottom';

        let positionClasses = 'relative w-full z-[100]';
        if (isSticky) {
            positionClasses = isBottom
                ? 'fixed bottom-0 left-0 right-0 z-[99999] shadow-[0_-4px_20px_rgba(0,0,0,0.15)]'
                : 'fixed top-0 left-0 right-0 z-[99999] shadow-[0_4px_20px_rgba(0,0,0,0.15)]';
        }

        return (
            <div className={positionClasses}>
                <BannerContent />
                {globalToast && <Toast message={globalToast} onClose={() => setGlobalToast(null)} />}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {/* Pro Upgrade Modal */}
            {showProModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4">
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
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4">
                    <div className="bg-white w-full max-w-md rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden scale-in max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Select Template</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1 opacity-70">Choose a visual style for your banner</p>
                            </div>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400 flex-shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <div className="flex flex-col gap-4">
                                {TEMPLATES.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => {
                                            setSelectedTemplateId(template.id);
                                            setConfig(prev => ({ ...prev, ...template.config, id: template.id, name: template.name }));
                                            setShowTemplateModal(false);
                                        }}
                                        className={`group flex flex-col items-start p-2 rounded-md border-2 transition-all text-left ${selectedTemplateId === template.id ? 'border-blue-600 bg-blue-50/10' : 'border-slate-100 hover:border-blue-200 bg-white shadow-sm hover:shadow-md'}`}
                                    >
                                        <div className="w-full aspect-[3/1] bg-slate-50 rounded-xl overflow-hidden mb-3 border border-slate-100 flex items-center justify-center p-1 group-hover:bg-slate-100 transition-colors">
                                            {template.icon}
                                        </div>
                                        <div className="w-full space-y-1">
                                            <div className="flex items-center justify-between w-full">
                                                <h3 className="text-xs font-black text-[#0F172A] tracking-tight">{template.name}</h3>
                                                <span className="text-[8px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded-full">{template.style}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2">{template.description}</p>
                                        </div>
                                    </button>
                                ))}
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
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 shrink-0">
                            W
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-left">
                                <span className="font-bold text-lg tracking-tight text-[#0F172A]">WiseCampaign</span>
                                {/* <span className="px-1.5 py-0.5 bg-blue-50 text-[10px] font-black text-blue-600 rounded-md border border-blue-100 uppercase tracking-tighter">Pro</span> */}
                            </div>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Wise Banner Editor</span>
                    </div>
                </div>

                {/* Center: Device Switcher */}
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

                {/* Right: Actions */}
                <div className="flex items-center gap-6">
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
                                                                maxLength={3}
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
                                                                maxLength={3}
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
                                                                maxLength={3}
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
                                                            max="24"
                                                            value={parseInt(config.ctaRadius)}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, ctaRadius: `${e.target.value}px` }))}
                                                            className="w-32 accent-blue-600"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold text-slate-400 w-8">{config.ctaRadius}</span>
                                                    </div>
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

                    {/* Mock Browser Frame */}
                    <div className="flex-1 flex justify-center items-start p-24 pt-4">
                        <div className={`w-full transition-all duration-700 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden flex flex-col ${device === 'mobile' ? 'max-w-[375px]' : 'max-w-6xl'}`}>
                            {/* Browser Address Bar */}
                            <div className="bg-[#F8FAFC] px-6 py-2 border-b border-slate-200 flex items-center gap-4 shrink-0">
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
                                </div>
                                <div className="flex-1 max-w-4xl mx-auto bg-white h-7 rounded-lg flex items-center px-4 gap-3 border border-slate-200/60 shadow-sm">
                                    <Search size={12} className="text-slate-300" />
                                    <span className="text-[11px] font-medium text-slate-500 tracking-tight">mysite.com/home</span>
                                </div>
                            </div>

                            {/* Top Banner Preview (LIVE) */}
                            {config.position !== 'bottom' && (
                                <BannerContent isMobileMode={device === 'mobile'} />
                            )}

                            {/* Page Content Skeleton */}
                            <div className="flex-1 bg-white overflow-y-auto p-12 custom-scrollbar">
                                {/* Navigation Skeleton */}
                                <div className="flex items-center justify-between mb-16">
                                    <div className="w-10 h-10 rounded-full bg-slate-900" />
                                    <div className="flex gap-10">
                                        <div className="w-16 h-3 rounded-full bg-slate-100" />
                                        <div className="w-16 h-3 rounded-full bg-slate-100" />
                                        <div className="w-16 h-3 rounded-full bg-slate-100" />
                                    </div>
                                    <div className="w-20 h-8 rounded-full bg-slate-100" />
                                </div>

                                {/* Hero Area - All skeletons, no images */}
                                <div className="flex items-center gap-16 mb-24">
                                    <div className="flex-1 space-y-8">
                                        <div className="w-24 h-4 rounded-full bg-blue-100" />
                                        <div className="space-y-4">
                                            <div className="w-full h-12 rounded-2xl bg-slate-100" />
                                            <div className="w-3/4 h-12 rounded-2xl bg-slate-100" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="w-2/3 h-4 rounded-full bg-slate-50" />
                                            <div className="w-1/2 h-4 rounded-full bg-slate-50" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-32 h-12 rounded-2xl bg-slate-900" />
                                            <div className="w-32 h-12 rounded-2xl border border-slate-200" />
                                        </div>
                                    </div>
                                    {/* Hero image replaced with skeleton */}
                                    <div className="w-[450px] aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-lg bg-white/40 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Grid - All skeletons, no images */}
                                <div className="grid grid-cols-3 gap-10">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="space-y-4">
                                            {/* Product image skeleton */}
                                            <div className="aspect-[4/3] bg-slate-100 rounded-2xl relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-2/3 rounded-full bg-slate-100 animate-pulse" />
                                                <div className="h-4 w-1/3 rounded-full bg-slate-100 animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add a second row of products for more realism */}
                                <div className="grid grid-cols-3 gap-10 mt-10">
                                    {[4, 5, 6].map(i => (
                                        <div key={i} className="space-y-4 opacity-75">
                                            <div className="aspect-[4/3] bg-slate-50 rounded-2xl relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-2/3 rounded-full bg-slate-50 animate-pulse" />
                                                <div className="h-4 w-1/3 rounded-full bg-slate-50 animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom Banner Preview (LIVE) */}
                            {config.position === 'bottom' && (
                                <BannerContent isMobileMode={device === 'mobile'} />
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] pointer-events-none opacity-40">
                        <span className="w-8 h-[2px] bg-slate-300" />
                        Previewing desktop version at 100% scale
                        <span className="w-8 h-[2px] bg-slate-300" />
                    </div>
                </main>
            </div >

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
