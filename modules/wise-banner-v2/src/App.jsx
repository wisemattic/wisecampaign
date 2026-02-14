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
    Link as LinkIcon
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
        showTimer: true,
        timerLabel: 'OFFER ENDS IN:',
        timerTextColor: '#FFFFFF',
        timerBgColor: 'rgba(255,255,255,0.1)',
        endDate: '2024-11-30',
        endTime: '23:59',
        showCTA: true,
        ctaText: 'Shop Now',
        ctaUrl: 'https://myshop.com/sale',
        ctaBg: '#FCD34D',
        ctaTextColor: '#111827',
        ctaRadius: '12px',
        isActive: true
    });

    const [displaySettings, setDisplaySettings] = useState({
        displayOnShopPage: true,
        displayOnProductPage: true,
        displayOnHomePage: true
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isStorefront = window.wiseBannerData?.isStorefront || false;

    useEffect(() => {
        if (!isStorefront) {
            fetchSettings();
        } else {
            // If storefront, we already have data in window.wiseBannerData.config
            if (window.wiseBannerData?.config) {
                setConfig(window.wiseBannerData.config);
                setSelectedTemplateId(window.wiseBannerData.config.id || 'holiday-gradient');
            }
            setIsLoading(false);
        }
    }, []);

    const fetchSettings = async () => {
        try {
            const baseUrl = window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/';

            // Fetch Banner Design
            const resBanner = await fetch(`${baseUrl}banner-v2`);
            const bannerData = await resBanner.json();
            if (bannerData && bannerData.id) {
                setConfig(bannerData);
                setSelectedTemplateId(bannerData.id);
            }

            // Fetch Display Settings
            const resSettings = await fetch(`${baseUrl}banner-v2/settings`);
            const settings = await resSettings.json();
            if (settings) {
                setDisplaySettings(settings);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const baseUrl = window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/';
            const nonce = window.wiseModuleData?.nonce;

            const headers = {
                'Content-Type': 'application/json',
                ...(nonce ? { 'X-WP-Nonce': nonce } : {})
            };

            // Save Banner Design
            const resBanner = await fetch(`${baseUrl}banner-v2`, {
                method: 'POST',
                headers,
                body: JSON.stringify(config)
            });

            // Save Display Settings
            const resDisplay = await fetch(`${baseUrl}banner-v2/settings`, {
                method: 'POST',
                headers,
                body: JSON.stringify(displaySettings)
            });

            if (resBanner.ok && resDisplay.ok) {
                alert("Settings saved successfully!");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];


    const CountdownTimer = ({ endDate, endTime, textColor, bgColor, label }) => {
        const [timeLeft, setTimeLeft] = useState({ days: '00', hrs: '00', min: '00' });

        useEffect(() => {
            const calculateTime = () => {
                const target = new Date(`${endDate}T${endTime}:00`);
                const now = new Date();
                const diff = target - now;

                if (diff <= 0) {
                    return { days: '00', hrs: '00', min: '00' };
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const min = Math.floor((diff / 1000 / 60) % 60);

                return {
                    days: days.toString().padStart(2, '0'),
                    hrs: hrs.toString().padStart(2, '0'),
                    min: min.toString().padStart(2, '0')
                };
            };

            const timer = setInterval(() => {
                setTimeLeft(calculateTime());
            }, 1000);

            setTimeLeft(calculateTime());
            return () => clearInterval(timer);
        }, [endDate, endTime]);

        return (
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <span className="text-[7px] sm:text-[9px] font-black tracking-[0.1em] sm:tracking-[0.2em] opacity-60 uppercase" style={{ color: textColor }}>{label}</span>
                <div className="flex gap-1 sm:gap-2">
                    {[
                        { val: timeLeft.days, label: 'D' },
                        { val: timeLeft.hrs, label: 'H' },
                        { val: timeLeft.min, label: 'M' }
                    ].map((t, idx) => (
                        <React.Fragment key={idx}>
                            <div
                                className="flex flex-col items-center backdrop-blur-md rounded-lg px-1.5 sm:px-2 py-0.5 min-w-[28px] sm:min-w-[34px] border border-white/10 shadow-sm"
                                style={{
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    borderColor: `${textColor}22`
                                }}
                            >
                                <span className="text-[10px] sm:text-xs font-black drop-shadow-sm leading-tight">{t.val}</span>
                                <span className="text-[6px] sm:text-[7px] font-black opacity-50 leading-none mt-0.5 tracking-tighter">{t.label}</span>
                            </div>
                            {idx < 2 && <span className="text-[10px] sm:text-xs font-black self-center opacity-30" style={{ color: textColor }}>:</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    const BannerContent = () => {
        if (isLoading) return null;

        return (
            <div
                className="w-full py-4 sm:py-5 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 relative transition-all duration-300"
                style={{
                    backgroundColor: config.bgType === 'solid' ? config.bgSolid : undefined,
                    backgroundImage: config.bgType === 'gradient' ? config.bgGradient : (config.bgType === 'image' ? `url(${config.bgImage})` : undefined),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 9999
                }}
            >
                <div className="flex flex-col text-center md:text-left flex-1 w-full md:w-auto">
                    <span
                        className="tracking-tight drop-shadow-sm line-clamp-2 md:line-clamp-1"
                        style={{
                            color: config.headlineColor,
                            fontSize: `clamp(14px, 1.2vw, ${config.headlineSize})`,
                            fontWeight: config.headlineWeight
                        }}
                    >
                        {config.headline}
                    </span>
                    <span
                        className="font-bold tracking-tight mt-0.5 line-clamp-2 md:line-clamp-1 opacity-90"
                        style={{
                            color: config.subHeadlineColor,
                            fontSize: `clamp(11px, 1vw, ${config.subHeadlineSize})`,
                            fontWeight: config.subHeadlineWeight
                        }}
                    >
                        {config.subHeadline}
                    </span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 sm:gap-8 md:gap-10 w-full md:w-auto">
                    {config.showTimer && (
                        <CountdownTimer
                            endDate={config.endDate}
                            endTime={config.endTime}
                            textColor={config.timerTextColor}
                            bgColor={config.timerBgColor}
                            label={config.timerLabel}
                        />
                    )}

                    {config.showCTA && (
                        <a
                            href={config.ctaUrl}
                            className="px-4 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black shadow-xl flex items-center gap-2 group cursor-pointer transition-all hover:brightness-105 active:scale-95 shrink-0 no-underline whitespace-nowrap"
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
            </div>
        );
    };

    if (isStorefront) {
        return <BannerContent />;
    }

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-[#0F172A]">Select Template</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Choose a visual style for your stock bar</p>
                            </div>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {TEMPLATES.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        setSelectedTemplateId(template.id);
                                        setConfig(prev => ({ ...prev, ...template.config, id: template.id, name: template.name }));
                                        setShowTemplateModal(false);
                                    }}
                                    className={`group flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${selectedTemplateId === template.id ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 hover:border-blue-200 bg-white'}`}
                                >
                                    <div className="w-full aspect-[2/1] bg-slate-100 rounded-xl overflow-hidden mb-4 relative drop-shadow-sm border border-slate-100">
                                        <div className="absolute inset-0 flex items-center justify-center p-2">
                                            {template.icon}
                                        </div>
                                    </div>
                                    <h3 className="font-black text-sm text-[#0F172A] mb-1">{template.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-tighter">{template.style}</p>
                                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium">{template.description}</p>
                                </button>
                            ))}
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
                    <div className="flex bg-slate-100 p-1 rounded-xl">
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
                            onClick={handleSave}
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
                <aside className="w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
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
                            className="p-3 border border-slate-200 rounded-xl flex items-center gap-3 bg-white hover:border-blue-200 transition-colors cursor-pointer group"
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
                        <div className="flex bg-slate-100 p-1 rounded-xl">
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
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sub-headline / Promo Code</label>
                                            <input
                                                type="text"
                                                value={config.subHeadline}
                                                onChange={(e) => setConfig(prev => ({ ...prev, subHeadline: e.target.value }))}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                            />
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
                                                <div className="flex gap-3">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="date"
                                                            value={config.endDate}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
                                                            className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                                        />
                                                        <Calendar size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    </div>
                                                    <div className="relative w-[130px]">
                                                        <input
                                                            type="time"
                                                            value={config.endTime}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
                                                            className="w-full bg-white border border-slate-200 pl-4 pr-10 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm rounded-xl"
                                                        />
                                                        <Clock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    </div>
                                                </div>
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
                            <div className="space-y-6 animate-fade-in">
                                {/* Background Styling */}
                                <section className="space-y-6">
                                    <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Background Styling</h3>
                                    {config.bgType === 'solid' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Fill Color</label>
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                    <input
                                                        type="color"
                                                        value={config.bgSolid}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, bgSolid: e.target.value }))}
                                                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                                                    />
                                                    <span className="text-xs font-bold font-mono uppercase">{config.bgSolid}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {config.bgType === 'gradient' && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gradient Value</label>
                                                <input
                                                    type="text"
                                                    value={config.bgGradient}
                                                    onChange={(e) => setConfig(prev => ({ ...prev, bgGradient: e.target.value }))}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[10px] font-mono font-bold outline-none focus:border-blue-500 shadow-sm"
                                                />
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
                                                        className="w-8 h-8 rounded-lg border-2 border-white shadow-sm ring-1 ring-black/5"
                                                        style={{ background: grad }}
                                                    />
                                                ))}
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-slate-400 pl-1">Font Size</label>
                                                <select
                                                    value={config.headlineSize}
                                                    onChange={(e) => setConfig(prev => ({ ...prev, headlineSize: e.target.value }))}
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none"
                                                >
                                                    <option value="12px">12px</option>
                                                    <option value="14px">14px</option>
                                                    <option value="16px">16px</option>
                                                    <option value="18px">18px</option>
                                                    <option value="20px">20px</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 pl-1">Text Color</label>
                                                <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl">
                                                    <input
                                                        type="color"
                                                        value={config.headlineColor}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, headlineColor: e.target.value }))}
                                                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0"
                                                    />
                                                    <span className="text-[9px] font-mono font-bold uppercase">{config.headlineColor}</span>
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 pl-1">Font Size</label>
                                                <select
                                                    value={config.subHeadlineSize}
                                                    onChange={(e) => setConfig(prev => ({ ...prev, subHeadlineSize: e.target.value }))}
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none"
                                                >
                                                    <option value="10px">10px</option>
                                                    <option value="11px">11px</option>
                                                    <option value="12px">12px</option>
                                                    <option value="13px">13px</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 pl-1">Text Color</label>
                                                <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl">
                                                    <input
                                                        type="color"
                                                        value={config.subHeadlineColor}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, subHeadlineColor: e.target.value }))}
                                                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0"
                                                    />
                                                    <span className="text-[9px] font-mono font-bold uppercase">{config.subHeadlineColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[1px] bg-slate-50" />
                                </section>

                                {/* Timer Design */}
                                {config.showTimer && (
                                    <section className="space-y-6 animate-fade-in">
                                        <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Timer Components</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 pl-1">Timer Digits</label>
                                                <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl">
                                                    <input
                                                        type="color"
                                                        value={config.timerTextColor}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, timerTextColor: e.target.value }))}
                                                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0"
                                                    />
                                                    <span className="text-[9px] font-mono font-bold uppercase">{config.timerTextColor}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 pl-1">Unit Labels</label>
                                                <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl">
                                                    <div className="w-6 h-6 rounded-md bg-white/20 border border-slate-100" />
                                                    <span className="text-[9px] font-bold text-slate-400">Fixed Opacity</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* CTA Design */}
                                {config.showCTA && (
                                    <section className="space-y-6 animate-fade-in">
                                        <h3 className="text-sm font-black text-[#0F172A] tracking-tight text-left">Button Styling</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 pl-1">Background</label>
                                                <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl">
                                                    <input
                                                        type="color"
                                                        value={config.ctaBg}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, ctaBg: e.target.value }))}
                                                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0"
                                                    />
                                                    <span className="text-[9px] font-mono font-bold uppercase">{config.ctaBg}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 pl-1">Text Color</label>
                                                <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl">
                                                    <input
                                                        type="color"
                                                        value={config.ctaTextColor}
                                                        onChange={(e) => setConfig(prev => ({ ...prev, ctaTextColor: e.target.value }))}
                                                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0"
                                                    />
                                                    <span className="text-[9px] font-mono font-bold uppercase">{config.ctaTextColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Corner Radius</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="24"
                                                    value={parseInt(config.ctaRadius)}
                                                    onChange={(e) => setConfig(prev => ({ ...prev, ctaRadius: `${e.target.value}px` }))}
                                                    className="flex-1 accent-blue-600"
                                                />
                                                <span className="text-xs font-black text-[#0F172A] w-8">{config.ctaRadius}</span>
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6 animate-fade-in text-left">
                                <h3 className="text-sm font-black text-[#0F172A] tracking-tight mb-4">Display Locations</h3>
                                <div className="space-y-3">
                                    {[
                                        { id: 'displayOnHomePage', label: 'Home Page' },
                                        { id: 'displayOnShopPage', label: 'Shop/Catalog Page' },
                                        { id: 'displayOnProductPage', label: 'Product Pages' }
                                    ].map(item => (
                                        <label key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group text-left shadow-sm">
                                            <span className="text-xs font-black text-slate-600 group-hover:text-blue-600">{item.label}</span>
                                            <button
                                                onClick={() => setDisplaySettings(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                                className={`w-10 h-5 rounded-full transition-all relative ${displaySettings[item.id] ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${displaySettings[item.id] ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Preview Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col relative group">

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

                            {/* Banner Preview (LIVE) */}
                            <div
                                className="w-full py-5 px-8 flex items-center justify-between gap-4 relative transition-all duration-300 animate-in slide-in-from-top-4"
                                style={{
                                    background: config.bgType === 'gradient' ? config.bgGradient : config.bgSolid,
                                    backgroundImage: config.bgType === 'image' ? `url(${config.bgImage})` : undefined,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="flex flex-col flex-1">
                                    <span
                                        className="tracking-tight drop-shadow-sm line-clamp-1"
                                        style={{
                                            color: config.headlineColor,
                                            fontSize: config.headlineSize,
                                            fontWeight: config.headlineWeight
                                        }}
                                    >
                                        {config.headline}
                                    </span>
                                    <span
                                        className="font-bold tracking-tight mt-0.5 line-clamp-1"
                                        style={{
                                            color: config.subHeadlineColor,
                                            fontSize: config.subHeadlineSize,
                                            fontWeight: config.subHeadlineWeight
                                        }}
                                    >
                                        {config.subHeadline}
                                    </span>
                                </div>

                                <div className="flex items-center gap-10">
                                    {config.showTimer && (
                                        <CountdownTimer
                                            endDate={config.endDate}
                                            endTime={config.endTime}
                                            textColor={config.timerTextColor}
                                            bgColor={config.timerBgColor}
                                            label={config.timerLabel}
                                        />
                                    )}

                                    {config.showCTA && (
                                        <div
                                            className="px-6 py-2.5 text-xs font-black shadow-xl flex items-center gap-2 group cursor-pointer transition-all hover:brightness-105 active:scale-95 shrink-0"
                                            style={{
                                                backgroundColor: config.ctaBg,
                                                color: config.ctaTextColor,
                                                borderRadius: config.ctaRadius
                                            }}
                                        >
                                            {config.ctaText}
                                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    )}
                                </div>
                                <button className="absolute right-4 opacity-20 hover:opacity-100 transition-opacity" style={{ color: config.headlineColor }}><X size={18} /></button>
                            </div>

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
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                        <div className="w-6 h-6 rounded-md bg-white/40 animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Product title skeleton */}
                                            <div className="space-y-2">
                                                <div className="h-4 w-3/4 rounded-full bg-slate-100 animate-pulse" />
                                                <div className="h-4 w-1/2 rounded-full bg-slate-50 animate-pulse" />
                                            </div>
                                            {/* Product price skeleton */}
                                            <div className="h-4 w-1/3 rounded-full bg-slate-100 animate-pulse" />
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
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] pointer-events-none opacity-40">
                        <span className="w-8 h-[2px] bg-slate-300" />
                        Previewing desktop version at 100% scale
                        <span className="w-8 h-[2px] bg-slate-300" />
                    </div>
                </main>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
        </div>
    );
}


export default App;
