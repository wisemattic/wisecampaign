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
    Package,
    Timer,
    Gauge,
    Sparkles,
    Target
} from 'lucide-react';

const TEMPLATES = [
    {
        id: 'linear',
        name: 'High Demand Flow',
        style: 'Linear Progress',
        description: 'Classic progress bar with real-time stock reduction visualization.',
        icon: <div className="w-8 h-1 bg-pink-400 rounded-full" />,
        config: {
            progressBarColor: '#EC4899',
            stockBarBg: '#FFFFFF',
            textColor: '#111827',
            borderColor: '#F1F5F9'
        }
    },
    {
        id: 'pulse',
        name: 'Urgent Alert',
        style: 'Pulsing Badge',
        description: 'Minimalist design with a pulsing alert icon for high urgency.',
        icon: <div className="w-5 h-5 rounded-full bg-red-500 animate-pulse flex items-center justify-center text-[10px] text-white">!</div>,
        config: {
            progressBarColor: '#EF4444',
            stockBarBg: '#FEF2F2',
            textColor: '#991B1B',
            borderColor: '#FEE2E2'
        }
    },
    {
        id: 'minimal',
        name: 'Modern Minimal',
        style: 'Simple Counter',
        description: 'Clean typography focus, perfect for high-end fashion or tech stores.',
        icon: <TrendingUp size={16} className="text-slate-800" />,
        config: {
            progressBarColor: '#3B82F6',
            stockBarBg: '#F8FAFC',
            textColor: '#1E293B',
            borderColor: '#E2E8F0'
        }
    },
    {
        id: 'countdown',
        name: 'Flash Sale Timer',
        style: 'Countdown Clock',
        description: 'Creates urgency with a countdown timer showing when stock might run out.',
        icon: <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white"><Clock size={12} /></div>,
        config: {
            progressBarColor: '#F59E0B',
            stockBarBg: '#FFFBEB',
            textColor: '#92400E',
            borderColor: '#FEF3C7'
        }
    },
    {
        id: 'badge',
        name: 'Low Stock Badge',
        style: 'Status Badge',
        description: 'Simple badge indicator for low stock items with optional text.',
        icon: <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white"><Package size={12} /></div>,
        config: {
            progressBarColor: '#10B981',
            stockBarBg: '#F0FDF4',
            textColor: '#065F46',
            borderColor: '#DCFCE7'
        }
    }
];

const ICON_MAP = {
    Flame,
    AlertCircle,
    TrendingUp,
    Zap,
    Star,
    ShoppingBag,
    CheckCircle2,
    Clock,
    Package,
    Timer,
    Gauge,
    Sparkles,
    Target
};

function App() {
    const [activeTab, setActiveTab] = useState('design');
    const [device, setDevice] = useState('desktop');
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState('linear');
    const [config, setConfig] = useState({
        progressBarColor: '#EC4899',
        progressBg: '#F1F5F9',
        stockBarBg: '#FFFFFF',
        textColor: '#111827',
        borderColor: '#F1F5F9',
        fontSize: '12px',
        fontWeight: 'Bold',
        content: {
            linear: { mainText: "Hurry! Selling fast!", icon: "Flame", subText: "items left" },
            pulse: { mainText: "Extremely Limited Stock!", icon: "AlertCircle", subText: "Only 12 items remaining" },
            minimal: { mainText: "Popular Product", icon: "TrendingUp", subText: "Pieces available" },
            countdown: { mainText: "Flash Sale Ends In", icon: "Clock", subText: "left" },
            badge: { mainText: "Limited Stock", icon: "Package", subText: "left" }
        }
    });

    const [displaySettings, setDisplaySettings] = useState({
        displayOnShopPage: false,
        displayOnProductPage: true
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isStorefront = window.wiseStockbarData?.isStorefront || false;

    useEffect(() => {
        if (!isStorefront) {
            fetchSettings();
        } else {
            // If storefront, we already have data in window.wiseStockbarData.config
            if (window.wiseStockbarData?.config) {
                setConfig(window.wiseStockbarData.config);
                setSelectedTemplateId(window.wiseStockbarData.config.id || 'linear');
            }
            setIsLoading(false);
        }
    }, []);

    const fetchSettings = async () => {
        try {
            const baseUrl = window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/';

            // Fetch Stockbars (designs)
            const resBars = await fetch(`${baseUrl}stockbars`);
            const stockbars = await resBars.json();

            // Find active one
            const activeBar = stockbars.find(b => b.isActive) || stockbars[0];
            if (activeBar) {
                const { db_id, name, isActive, ...restConfig } = activeBar;
                setConfig(prev => ({ ...prev, ...restConfig, db_id }));
                setSelectedTemplateId(activeBar.id || 'linear');
            }

            // Fetch Display Settings
            const resSettings = await fetch(`${baseUrl}stockbars/setting`);
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

            // Save Design
            const designToSave = {
                ...config,
                id: selectedTemplateId,
                isActive: true
            };

            const resDesign = await fetch(`${baseUrl}stockbars`, {
                method: 'POST',
                headers,
                body: JSON.stringify(designToSave)
            });

            // Save Display Settings
            const resDisplay = await fetch(`${baseUrl}stockbars/setting`, {
                method: 'POST',
                headers,
                body: JSON.stringify(displaySettings)
            });

            if (resDesign.ok && resDisplay.ok) {
                // Success notification could go here
                alert("Settings saved successfully!");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplateId);

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleContentChange = (key, value) => {
        setConfig(prev => ({
            ...prev,
            content: {
                ...prev.content,
                [selectedTemplateId]: {
                    ...prev.content[selectedTemplateId],
                    [key]: value
                }
            }
        }));
    };

    const getFontSizeClass = (size) => {
        if (typeof size === 'string' && size.endsWith('px')) {
            return `text-[${size}]`;
        }
        // Fallback for legacy data
        switch (size) {
            case 'S': return 'text-[10px]';
            case 'L': return 'text-[14px]';
            default: return 'text-[12px]';
        }
    };

    const getFontWeightClass = (weight) => {
        return weight === 'Bold' ? 'font-black' : 'font-medium';
    };

    const stockInfo = window.wiseStockbarData?.stockInfo || {
        totalSold: 21,
        availableItems: 12,
        totalItems: 33,
        percentage: 63
    };

    const ActiveIcon = ({ size = 20, className = '', fill = 'none' }) => {
        const iconName = config.content[selectedTemplateId]?.icon;
        const IconComp = ICON_MAP[iconName] || ICON_MAP.Flame;
        return <IconComp size={size} className={className} fill={fill} />;
    };

    const StockBarContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-8 bg-slate-50 rounded-2xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        return (
            <div
                className={`w-full overflow-hidden transition-all duration-500`}
                style={{
                    backgroundColor: config.stockBarBg,
                    color: config.textColor,
                    border: `1px solid ${config.borderColor}`,
                    borderRadius: '16px',
                    padding: '20px'
                }}
            >
                {selectedTemplateId === 'linear' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between text-left">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-sm">
                                    <ActiveIcon size={14} fill="currentColor" />
                                </div>
                                <span className={`${getFontSizeClass(config.fontSize)} ${getFontWeightClass(config.fontWeight)} uppercase tracking-tight`}>
                                    {config.content.linear.mainText}
                                </span>
                            </div>
                            <span className="text-[10px] font-black opacity-50 uppercase tracking-widest text-right">
                                {stockInfo.availableItems} {config.content.linear.subText}
                            </span>
                        </div>
                        <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                            <div
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
                                style={{
                                    width: `${stockInfo.percentage}%`,
                                    background: config.progressBarColor,
                                    boxShadow: `0 0 20px ${config.progressBarColor}40`
                                }}
                            >
                                <div className="w-1 h-1 bg-white rounded-full animate-pulse opacity-50"></div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTemplateId === 'pulse' && (
                    <div className="flex flex-col items-center gap-3 py-2">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse relative shrink-0">
                                <ActiveIcon size={20} />
                                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className={`${getFontSizeClass(config.fontSize)} ${getFontWeightClass(config.fontWeight)} uppercase tracking-tighter leading-none mb-1`}>
                                    {config.content.pulse.mainText}
                                </span>
                                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                                    {stockInfo.availableItems} {config.content.pulse.subText}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTemplateId === 'minimal' && (
                    <div className="flex items-center justify-center gap-4 py-1">
                        <div className="flex items-center gap-2 text-left">
                            <ActiveIcon size={16} className="text-blue-500" />
                            <span className={`${getFontSizeClass(config.fontSize)} ${getFontWeightClass(config.fontWeight)} uppercase tracking-widest border-r pr-4 border-slate-200`}>
                                {config.content.minimal.mainText}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-left">
                            <span className="text-xl font-black text-red-500">{stockInfo.availableItems}</span>
                            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{config.content.minimal.subText}</span>
                        </div>
                    </div>
                )}

                {selectedTemplateId === 'countdown' && (
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 relative shrink-0">
                                <ActiveIcon size={18} />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className={`${getFontSizeClass(config.fontSize)} ${getFontWeightClass(config.fontWeight)} uppercase tracking-tight`}>
                                    {config.content.countdown?.mainText || "Flash Sale"}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex gap-1">
                                        <div className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-black">15</div>
                                        <span className="text-[8px] font-black opacity-40">h</span>
                                        <div className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-black">30</div>
                                        <span className="text-[8px] font-black opacity-40">m</span>
                                        <div className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-black">45</div>
                                        <span className="text-[8px] font-black opacity-40">s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-black text-amber-600">{stockInfo.availableItems}</span>
                            <span className="text-[8px] font-black opacity-40 block">{config.content.countdown?.subText || "left"}</span>
                        </div>
                    </div>
                )}

                {selectedTemplateId === 'badge' && (
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 relative shrink-0">
                                <ActiveIcon size={16} />
                            </div>
                            <span className={`${getFontSizeClass(config.fontSize)} ${getFontWeightClass(config.fontWeight)} uppercase tracking-tight`}>
                                {config.content.badge?.mainText || "Limited Stock"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                {stockInfo.availableItems} {config.content.badge?.subText || "left"}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (isStorefront) {
        return <StockBarContent />;
    }

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden scale-in max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Select Template</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1 opacity-70">Choose a visual style for your stock bar</p>
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
                                            // Apply template's default config if available
                                            if (template.config) {
                                                setConfig(prev => ({
                                                    ...prev,
                                                    ...template.config
                                                }));
                                            }
                                            setShowTemplateModal(false);
                                        }}
                                        className={`group flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left ${selectedTemplateId === template.id ? 'border-blue-600 bg-blue-50/10' : 'border-slate-100 hover:border-blue-200 bg-white shadow-sm hover:shadow-md'}`}
                                    >
                                        {/* Large Stock Bar Design Preview */}
                                        <div className="w-full aspect-[2.5/1] bg-slate-50 rounded-xl overflow-hidden mb-3 border border-slate-100 flex items-center justify-center p-4 group-hover:bg-slate-100 transition-colors">
                                            <div className="w-full scale-100">
                                                {template.id === 'linear' && (
                                                    <div className="w-full h-full flex flex-col justify-center gap-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-sm">
                                                                    <Flame size={12} fill="currentColor" />
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Hurry! Selling Fast!</span>
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">12 Items Left</span>
                                                        </div>
                                                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-300/30">
                                                            <div className="h-full bg-pink-500 w-3/4 rounded-full" />
                                                        </div>
                                                    </div>
                                                )}
                                                {template.id === 'pulse' && (
                                                    <div className="w-full flex items-center gap-4 px-2 py-3 bg-red-50 rounded-xl border border-red-100">
                                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse relative flex-shrink-0">
                                                            <AlertCircle size={18} />
                                                            <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5 w-full">
                                                            <span className="text-[10px] font-black text-red-900 uppercase tracking-tighter leading-none">Limited Stock!</span>
                                                            <span className="text-[8px] font-bold text-red-700/60 uppercase">Only 12 items remaining</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {template.id === 'minimal' && (
                                                    <div className="w-full flex flex-col items-center gap-2 py-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
                                                        <div className="flex items-center gap-2">
                                                            <TrendingUp size={14} className="text-blue-500 font-black" />
                                                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Popular Product</span>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pieces available</span>
                                                    </div>
                                                )}
                                                {template.id === 'countdown' && (
                                                    <div className="w-full flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                                <Clock size={16} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-amber-900 uppercase">Flash Sale Ends In</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-5 h-4 bg-white/80 rounded shadow-sm text-[8px] flex items-center justify-center font-black">15</div>
                                                                <span className="text-[5px] font-black text-amber-900/40 uppercase mt-0.5">h</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-5 h-4 bg-white/80 rounded shadow-sm text-[8px] flex items-center justify-center font-black">30</div>
                                                                <span className="text-[5px] font-black text-amber-900/40 uppercase mt-0.5">m</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {template.id === 'badge' && (
                                                    <div className="w-full flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                                <Package size={14} />
                                                            </div>
                                                            <span className="text-[11px] font-black text-emerald-900 uppercase tracking-tight">Status Badge</span>
                                                        </div>
                                                        <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-wider">
                                                            12 Left
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Text content below preview */}
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
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Stock Bar Editor</span>
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
                        {/* <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-bold text-slate-400">Last saved just now</span>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
                        <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all text-sm font-bold border border-slate-100 shadow-sm">
                            <Eye size={16} />
                            Preview
                        </button> */}
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
                <aside className="w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
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
                    <div className="px-6 py-4 space-y-8 pb-10 text-left overflow-y-auto custom-scrollbar flex-1">
                        {activeTab === 'design' && (
                            <div className="space-y-8">
                                {/* Color Settings */}
                                <section className="pb-8 border-b border-slate-100">
                                    <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                                        <Palette size={16} className="text-blue-600" />
                                        Color Settings
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'progressBarColor', label: 'Progress Bar Color' },
                                            { id: 'progressBg', label: 'Progress Background' },
                                            { id: 'stockBarBg', label: 'Stock Bar Background' },
                                            { id: 'textColor', label: 'Text Color' },
                                            { id: 'borderColor', label: 'Border Color' }
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors group">
                                                <span className="text-xs font-bold text-slate-600">{item.label}</span>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={config[item.id]}
                                                        onChange={(e) => handleConfigChange(item.id, e.target.value)}
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
                                                            onChange={(e) => handleConfigChange(item.id, e.target.value)}
                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Typography */}
                                <section className="pt-2">
                                    <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                                        <Type size={16} className="text-blue-600" />
                                        Typography
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group bg-slate-50/30">
                                            <span className="text-xs font-bold text-slate-600">Font Size</span>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="5"
                                                    max="50"
                                                    value={parseInt(config.fontSize)}
                                                    onChange={(e) => handleConfigChange('fontSize', `${e.target.value}px`)}
                                                    className="w-32 accent-blue-600 cursor-pointer"
                                                />
                                                <span className="text-[10px] font-mono font-bold text-slate-400 w-8">{config.fontSize}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group bg-slate-50/30">
                                            <span className="text-xs font-bold text-slate-600">Font Weight</span>
                                            <div className="flex bg-slate-100 p-1 rounded-lg w-[120px]">
                                                {['Reg', 'Bold'].map(w => (
                                                    <button
                                                        key={w}
                                                        onClick={() => handleConfigChange('fontWeight', w)}
                                                        className={`flex-1 py-1 text-[10px] font-black rounded-md transition-all ${config.fontWeight === w ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {w}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <section className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                                        <SettingsIcon size={16} className="text-blue-600" />
                                        Content Icon
                                    </h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {Object.keys(ICON_MAP).map(iconName => {
                                            const IconComp = ICON_MAP[iconName];
                                            const isActive = config.content[selectedTemplateId]?.icon === iconName;
                                            return (
                                                <button
                                                    key={iconName}
                                                    onClick={() => handleContentChange('icon', iconName)}
                                                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${isActive ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-100 hover:border-slate-200 text-slate-400'}`}
                                                >
                                                    <IconComp size={20} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Main Message</label>
                                        <input
                                            type="text"
                                            value={config.content[selectedTemplateId]?.mainText}
                                            onChange={(e) => handleContentChange('mainText', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                            placeholder="Enter message..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            {selectedTemplateId === 'pulse' ? 'Subtext Message' : 'Counter Label'}
                                        </label>
                                        <input
                                            type="text"
                                            value={config.content[selectedTemplateId]?.subText}
                                            onChange={(e) => handleContentChange('subText', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                            placeholder="e.g. items left"
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'settings' && (
                            <section>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-black">Display Settings</h3>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">Configure where the stock bar appears on your store.</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-black">Display on Shop Page</div>
                                            <div className="text-[10px] text-slate-400 font-medium">Show in product catalogs</div>
                                        </div>
                                        <div
                                            onClick={() => setDisplaySettings(prev => ({ ...prev, displayOnShopPage: !prev.displayOnShopPage }))}
                                            className={`w-10 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${displaySettings.displayOnShopPage ? 'bg-blue-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${displaySettings.displayOnShopPage ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-black">Display on Product Page</div>
                                            <div className="text-[10px] text-slate-400 font-medium">Show on single product pages</div>
                                        </div>
                                        <div
                                            onClick={() => setDisplaySettings(prev => ({ ...prev, displayOnProductPage: !prev.displayOnProductPage }))}
                                            className={`w-10 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${displaySettings.displayOnProductPage ? 'bg-blue-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${displaySettings.displayOnProductPage ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </aside>

                {/* Preview Area */}
                <main className="flex-1 overflow-y-auto p-12 flex justify-center items-start">
                    <div className={`transition-all duration-300 w-full max-w-5xl ${device === 'mobile' ? 'max-w-[375px]' : ''}`}>
                        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                            {/* Browser UI */}
                            <div className="bg-[#F8FAFC] px-6 py-2 border-b border-slate-200 flex items-center gap-4">
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
                                </div>
                                <div className="flex-1 max-w-4xl mx-auto bg-white h-6 rounded-lg flex items-center px-3 gap-2 border border-slate-200/60 shadow-sm">
                                    <div className="w-4 h-4 rounded-full bg-slate-100 shrink-0 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-500 flex-1 truncate text-center">
                                        mysite.com/products/ergonomic-chair
                                    </span>
                                    <div className="w-4 h-4 shrink-0 flex items-center justify-center opacity-30">
                                        <Search size={10} className="text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Storefront Preview */}
                            <div className="p-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    {/* Product Image Skeleton */}
                                    <div className="space-y-6">
                                        <div className="relative aspect-square bg-slate-100 rounded-[32px] overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-50 animate-pulse shimmer"></div>
                                        </div>
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4].map(id => (
                                                <div key={id} className="flex-1 aspect-square bg-slate-100 rounded-2xl animate-pulse"></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Product Info Skeletons */}
                                    <div className="space-y-8 text-left">
                                        <nav className="flex items-center gap-2">
                                            <div className="h-4 w-16 bg-slate-100 rounded-lg animate-pulse"></div>
                                            <span className="text-slate-200">/</span>
                                            <div className="h-4 w-12 bg-slate-100 rounded-lg animate-pulse"></div>
                                        </nav>

                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="h-12 w-3/4 bg-slate-100 rounded-xl animate-pulse"></div>
                                                <div className="w-12 h-12 bg-slate-100 rounded-full animate-pulse"></div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-4 bg-slate-100 rounded-full animate-pulse"></div>)}
                                                </div>
                                                <div className="h-4 w-24 bg-slate-100 rounded-lg animate-pulse"></div>
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-4">
                                            <div className="h-12 w-36 bg-slate-100 rounded-xl animate-pulse"></div>
                                            <div className="h-6 w-24 bg-slate-50 rounded-lg animate-pulse"></div>
                                        </div>

                                        {/* DYNAMIC STOCK BAR PREVIEW */}
                                        <div
                                            className="p-1 rounded-3xl transition-all duration-300 shadow-sm"
                                            style={{
                                                backgroundColor: config.stockBarBg,
                                                borderColor: config.borderColor,
                                                color: config.textColor
                                            }}
                                        >
                                            <StockBarContent
                                                config={config}
                                                selectedTemplateId={selectedTemplateId}
                                                isStorefront={false}
                                            />
                                        </div>

                                        <div className="space-y-6 pt-4">
                                            <div className="space-y-4">
                                                <div className="h-5 w-24 bg-slate-100 rounded-lg animate-pulse"></div>
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 bg-slate-200 rounded-full ring-4 ring-slate-100 ring-offset-2 animate-pulse"></div>
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse"></div>
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse"></div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 items-center">
                                                <div className="w-32 h-14 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse"></div>
                                                <div className="flex-1 h-14 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Logos Footer */}
                            <div className="p-12 bg-slate-50 border-t border-slate-100">
                                <div className="flex items-center justify-center gap-16 grayscale opacity-20">
                                    {['VOGUE', 'FORBES', 'WIRED', 'GQ'].map(brand => (
                                        <span key={brand} className="text-2xl font-black italic tracking-tighter animate-pulse">{brand}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-slate-400 font-bold mt-10 flex items-center justify-center gap-2 opacity-60 uppercase tracking-widest">
                            <Monitor size={14} />
                            Previewing Live Experience Mode
                        </p>
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
