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
    Target,
    Power
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
            borderColor: '#F1F5F9',
            fontSize: '12px',
            fontWeight: 'Bold',
            mainText: "Hurry! Selling fast!",
            icon: "Flame",
            subText: "items left"
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
            borderColor: '#FEE2E2',
            fontSize: '13px',
            fontWeight: 'Bold',
            mainText: "Extremely Limited Stock!",
            icon: "AlertCircle",
            subText: "Only 12 items remaining"
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
            borderColor: '#E2E8F0',
            fontSize: '11px',
            fontWeight: 'Medium',
            mainText: "Popular Product",
            icon: "TrendingUp",
            subText: "Pieces available"
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
            borderColor: '#FEF3C7',
            fontSize: '12px',
            fontWeight: 'Bold',
            mainText: "Flash Sale Ends In",
            icon: "Clock",
            subText: "left",
            labelPosition: "top",
            hoursLabel: "h",
            minutesLabel: "m",
            secondsLabel: "s",
            timerExpiry: ""
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
            borderColor: '#DCFCE7',
            fontSize: '12px',
            fontWeight: 'Bold',
            mainText: "Limited Stock",
            icon: "Package",
            subText: "left"
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
    const [config, setConfig] = useState(() => {
        const initialConfig = {};
        TEMPLATES.forEach(t => {
            initialConfig[t.id] = { ...t.config };
        });
        return initialConfig;
    });

    const [displaySettings, setDisplaySettings] = useState({
        displayOnShopPage: false,
        displayOnProductPage: true
    });

    const [isEnabled, setIsEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [showDisabledOverlay, setShowDisabledOverlay] = useState(true);

    const isStorefront = window.wiseStockbarData?.isStorefront || false;

    useEffect(() => {
        if (!isEnabled) {
            setShowDisabledOverlay(true);
        }
    }, [isEnabled]);

    useEffect(() => {
        if (!isStorefront) {
            fetchSettings();
        } else {
            // If storefront, we already have data in window.wiseStockbarData.config
            if (window.wiseStockbarData?.config) {
                const incoming = window.wiseStockbarData.config;
                const id = incoming.id || 'linear';

                // Detection: if top level has colors, it might be legacy
                if (incoming.progressBarColor && !incoming[id]) {
                    setConfig(prev => ({
                        ...prev,
                        [id]: { ...prev[id], ...incoming }
                    }));
                } else {
                    setConfig(incoming);
                }
                setSelectedTemplateId(id);
            }
            setIsLoading(false);
        }
    }, []);

    const fetchSettings = async () => {
        try {
            const baseUrl = window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/';
            const nonce = window.wiseModuleData?.nonce;
            const headers = nonce ? { 'X-WP-Nonce': nonce } : {};

            // Fetch Stockbars (designs)
            const resBars = await fetch(`${baseUrl}stockbars`, { headers });
            const stockbars = await resBars.json();

            // Find active one
            const activeBar = stockbars.find(b => b.isActive) || stockbars[0];
            if (activeBar) {
                const { db_id, name, isActive, id: barId, ...restConfig } = activeBar;
                const id = barId || 'linear';

                // Detection: if restConfig has colors at top level, it's legacy
                if (restConfig.progressBarColor && !restConfig[id]) {
                    setConfig(prev => ({
                        ...prev,
                        [id]: { ...prev[id], ...restConfig },
                        db_id
                    }));
                } else {
                    setConfig(prev => ({ ...prev, ...restConfig, db_id }));
                }
                setSelectedTemplateId(id);
            }

            // Fetch Display Settings
            const resSettings = await fetch(`${baseUrl}stockbars/setting`, { headers });
            const settings = await resSettings.json();
            if (settings) {
                setDisplaySettings(settings);
            }

            // Fetch Status
            const resStatus = await fetch(`${baseUrl}stockbar-status`, { headers });
            const statusData = await resStatus.json();
            if (statusData) {
                setIsEnabled(statusData.stockBarEnabled !== false);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (statusOverride = null) => {
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

            // Save Status
            const targetEnabled = statusOverride !== null ? statusOverride : isEnabled;
            const resStatus = await fetch(`${baseUrl}stockbar-status`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ stockBarEnabled: targetEnabled })
            });

            if (resDesign.ok && resDisplay.ok && resStatus.ok) {
                if (statusOverride === null || typeof statusOverride === 'boolean') {
                    if (statusOverride === null) {
                        alert("Settings saved successfully!");
                    }
                }
                return true;
            } else {
                const errorText = !resDesign.ok ? "Design save failed" : (!resDisplay.ok ? "Display settings save failed" : "Status save failed");
                console.error(errorText, resDesign.status, resDisplay.status, resStatus.status);
                if (statusOverride === null || typeof statusOverride === 'boolean') {
                    alert(`${errorText}. Please try again.`);
                }
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            if (statusOverride === null || typeof statusOverride === 'boolean') {
                alert("Failed to save settings: " + error.message);
            }
        } finally {
            setIsSaving(false);
        }
        return false;
    };

    const confirmStatusChange = async () => {
        const nextStatus = !isEnabled;
        const success = await handleSave(nextStatus);
        if (success) {
            setIsEnabled(nextStatus);
            setShowStatusConfirm(false);
            alert(`Stock Bar ${nextStatus ? 'activated' : 'deactivated'} successfully!`);
        }
    };

    const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
    const activeConfig = { ...activeTemplate.config, ...(config[selectedTemplateId] || {}) };

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({
            ...prev,
            [selectedTemplateId]: {
                ...prev[selectedTemplateId],
                [key]: value
            }
        }));
    };

    const handleContentChange = handleConfigChange; // Unify handlers

    const getFontSizeClass = (size) => {
        if (typeof size === 'string' && size.endsWith('px')) {
            return `text-[${size}]`;
        }
        return 'text-[12px]';
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
        const iconName = activeConfig.icon;
        const IconComp = ICON_MAP[iconName] || ICON_MAP.Flame;
        return <IconComp size={size} className={className} fill={fill} />;
    };

    const CountdownTimer = ({ expiryDate, textColor, hoursLabel = 'h', minutesLabel = 'm', secondsLabel = 's' }) => {
        const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00', expired: false });

        useEffect(() => {
            if (!expiryDate) return;

            const calculateTimeLeft = () => {
                const difference = +new Date(expiryDate) - +new Date();
                let timeLeft = {};

                if (difference > 0) {
                    timeLeft = {
                        hours: Math.floor((difference / (1000 * 60 * 60))).toString().padStart(2, '0'),
                        minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
                        seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
                        expired: false
                    };
                } else {
                    timeLeft = { hours: '00', minutes: '00', seconds: '00', expired: true };
                }
                return timeLeft;
            };

            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);

            setTimeLeft(calculateTimeLeft());

            return () => clearInterval(timer);
        }, [expiryDate]);

        if (timeLeft.expired && isStorefront) return null;

        return (
            <div className="flex gap-1">
                <div className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-black" style={{ backgroundColor: `${textColor}10`, color: textColor }}>{timeLeft.hours}</div>
                <span className="text-[8px] font-black opacity-40">{hoursLabel}</span>
                <div className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-black" style={{ backgroundColor: `${textColor}10`, color: textColor }}>{timeLeft.minutes}</div>
                <span className="text-[8px] font-black opacity-40">{minutesLabel}</span>
                <div className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-black" style={{ backgroundColor: `${textColor}10`, color: textColor }}>{timeLeft.seconds}</div>
                <span className="text-[8px] font-black opacity-40">{secondsLabel}</span>
            </div>
        );
    };

    const StockBarContent = () => {
        const [isExpired, setIsExpired] = useState(false);

        useEffect(() => {
            if (selectedTemplateId === 'countdown' && activeConfig.timerExpiry) {
                const checkExpiry = () => {
                    const difference = +new Date(activeConfig.timerExpiry) - +new Date();
                    if (difference <= 0) {
                        setIsExpired(true);
                        return true;
                    }
                    setIsExpired(false);
                    return false;
                };

                if (!checkExpiry()) {
                    const timer = setInterval(() => {
                        if (checkExpiry()) {
                            clearInterval(timer);
                        }
                    }, 1000);
                    return () => clearInterval(timer);
                }
            } else {
                setIsExpired(false);
            }
        }, [selectedTemplateId, activeConfig.timerExpiry]);

        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-8 bg-slate-50 rounded-2xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (isExpired && selectedTemplateId === 'countdown' && isStorefront) {
            return null;
        }

        return (
            <div
                className={`w-full overflow-hidden transition-all duration-500`}
                style={{
                    backgroundColor: activeConfig.stockBarBg,
                    color: activeConfig.textColor,
                    border: `1px solid ${activeConfig.borderColor}`,
                    borderRadius: '16px',
                    padding: '20px'
                }}
            >
                {selectedTemplateId === 'linear' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between text-left">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-sm" style={{ backgroundColor: `${activeConfig.progressBarColor}20`, color: activeConfig.progressBarColor }}>
                                    <ActiveIcon size={14} fill="currentColor" />
                                </div>
                                <span className={`${getFontSizeClass(activeConfig.fontSize)} ${getFontWeightClass(activeConfig.fontWeight)} uppercase tracking-tight`}>
                                    {activeConfig.mainText}
                                </span>
                            </div>
                            <span className="text-[10px] font-black opacity-50 uppercase tracking-widest text-right">
                                {stockInfo.availableItems} {activeConfig.subText}
                            </span>
                        </div>
                        <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                            <div
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
                                style={{
                                    width: `${stockInfo.percentage}%`,
                                    background: activeConfig.progressBarColor,
                                    boxShadow: `0 0 20px ${activeConfig.progressBarColor}40`
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
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse relative shrink-0" style={{ backgroundColor: `${activeConfig.progressBarColor}20`, color: activeConfig.progressBarColor }}>
                                <ActiveIcon size={20} />
                                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20" style={{ backgroundColor: activeConfig.progressBarColor }}></div>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className={`${getFontSizeClass(activeConfig.fontSize)} ${getFontWeightClass(activeConfig.fontWeight)} uppercase tracking-tighter leading-none mb-1`}>
                                    {activeConfig.mainText}
                                </span>
                                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                                    {activeConfig.subText}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTemplateId === 'minimal' && (
                    <div className="flex flex-col items-center gap-2 py-2">
                        <div className="flex items-center gap-2.5">
                            <div className="text-blue-600" style={{ color: activeConfig.progressBarColor }}>
                                <ActiveIcon size={18} />
                            </div>
                            <span className={`${getFontSizeClass(activeConfig.fontSize)} ${getFontWeightClass(activeConfig.fontWeight)} uppercase tracking-tight`}>
                                {activeConfig.mainText}
                            </span>
                        </div>
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] scale-90">
                            {stockInfo.availableItems} {activeConfig.subText}
                        </span>
                    </div>
                )}

                {selectedTemplateId === 'countdown' && (
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 relative shrink-0" style={{ backgroundColor: `${activeConfig.progressBarColor}20`, color: activeConfig.progressBarColor }}>
                                <ActiveIcon size={18} />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-pulse" style={{ backgroundColor: activeConfig.progressBarColor }}></div>
                            </div>
                            <div className={`flex ${activeConfig.labelPosition === 'below' ? 'flex-col-reverse' :
                                activeConfig.labelPosition === 'right' ? 'flex-row-reverse items-center gap-3' :
                                    activeConfig.labelPosition === 'left' ? 'flex-row items-center gap-3' :
                                        'flex-col'
                                }`}>
                                <span className={`${getFontSizeClass(activeConfig.fontSize)} ${getFontWeightClass(activeConfig.fontWeight)} uppercase tracking-tight`}>
                                    {activeConfig.mainText}
                                </span>
                                <div className={`flex items-center gap-2 ${(activeConfig.labelPosition === 'top' || activeConfig.labelPosition === 'below' || !activeConfig.labelPosition) ? 'mt-1' : ''
                                    }`}>
                                    <CountdownTimer
                                        expiryDate={activeConfig.timerExpiry}
                                        textColor={activeConfig.textColor}
                                        hoursLabel={activeConfig.hoursLabel}
                                        minutesLabel={activeConfig.minutesLabel}
                                        secondsLabel={activeConfig.secondsLabel}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-black" style={{ color: activeConfig.progressBarColor }}>{stockInfo.availableItems}</span>
                            <span className="text-[8px] font-black opacity-40 block">{activeConfig.subText}</span>
                        </div>
                    </div>
                )}

                {selectedTemplateId === 'badge' && (
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 relative shrink-0" style={{ backgroundColor: `${activeConfig.progressBarColor}20`, color: activeConfig.progressBarColor }}>
                                <ActiveIcon size={16} />
                            </div>
                            <span className={`${getFontSizeClass(activeConfig.fontSize)} ${getFontWeightClass(activeConfig.fontWeight)} uppercase tracking-tight`}>
                                {activeConfig.mainText}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-white px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider" style={{ backgroundColor: activeConfig.progressBarColor }}>
                                {stockInfo.availableItems} {activeConfig.subText}
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
            {/* Status Confirmation Modal */}
            {showStatusConfirm && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden scale-in p-8 flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isEnabled ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            {isEnabled ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
                        </div>
                        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">
                            {isEnabled ? 'Deactivate Stock Bar?' : 'Activate Stock Bar?'}
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">
                            {isEnabled
                                ? 'Are you sure you want to deactivate the stock bar? It will no longer be visible to your customers.'
                                : 'Are you sure you want to activate the stock bar? It will become visible to your customers based on your settings.'}
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
                                className={`flex-1 px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isEnabled ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'}`}
                            >
                                {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {isEnabled ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4">
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
                                                    [template.id]: { ...template.config }
                                                }));
                                            }
                                            setShowTemplateModal(false);
                                        }}
                                        className={`group flex flex-col items-start p-2 rounded-2xl border-2 transition-all text-left ${selectedTemplateId === template.id ? 'border-blue-600 bg-blue-50/10' : 'border-slate-100 hover:border-blue-200 bg-white shadow-sm hover:shadow-md'}`}
                                    >
                                        {/* Large Stock Bar Design Preview */}
                                        <div className="w-full aspect-[2.5/1] bg-slate-50 rounded-xl overflow-hidden mb-3 border border-slate-100 flex items-center justify-center p-2 group-hover:bg-slate-100 transition-colors">
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
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Power size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-700 uppercase tracking-tight">Stock Bar Status</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        {isEnabled ? <span className="text-emerald-500">Currently Active</span> : 'Feature Disabled'}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-all relative ${isEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    </div>

                    <div className={`flex flex-col flex-1 transition-all duration-300 ${!isEnabled ? 'opacity-40 grayscale pointer-events-none select-none filter blur-[1px]' : ''}`}>
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
                                        <div className="space-y-4">
                                            {[
                                                { id: 'progressBarColor', label: 'Primary Color' },
                                                { id: 'stockBarBg', label: 'Background' },
                                                { id: 'textColor', label: 'Text Color' },
                                                { id: 'borderColor', label: 'Border Color' },
                                            ].map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group bg-white">
                                                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="text"
                                                            value={activeConfig[item.id]}
                                                            onChange={(e) => handleConfigChange(item.id, e.target.value)}
                                                            className="text-[10px] font-mono text-slate-400 bg-transparent border-none w-14 outline-none p-0 focus:text-slate-900"
                                                        />
                                                        <div className="relative group/color cursor-pointer">
                                                            <div
                                                                className="w-6 h-6 rounded-md border border-slate-200 shadow-sm"
                                                                style={{ backgroundColor: activeConfig[item.id] }}
                                                            />
                                                            <input
                                                                type="color"
                                                                value={activeConfig[item.id]}
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
                                                        value={parseInt(activeConfig.fontSize)}
                                                        onChange={(e) => handleConfigChange('fontSize', `${e.target.value}px`)}
                                                        className="w-32 accent-blue-600 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] font-mono font-bold text-slate-400 w-8">{activeConfig.fontSize}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-2 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group bg-slate-50/30">
                                                <span className="text-xs font-bold text-slate-600">Font Weight</span>
                                                <div className="flex bg-slate-100 p-1 rounded-lg w-[120px]">
                                                    {['Reg', 'Bold'].map(w => (
                                                        <button
                                                            key={w}
                                                            onClick={() => handleConfigChange('fontWeight', w)}
                                                            className={`flex-1 py-1 text-[10px] font-black rounded-md transition-all ${activeConfig.fontWeight === w ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
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
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Main Message</label>
                                            <input
                                                type="text"
                                                value={activeConfig.mainText}
                                                onChange={(e) => handleConfigChange('mainText', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Subtext (Value)</label>
                                            <input
                                                type="text"
                                                value={activeConfig.subText}
                                                onChange={(e) => handleConfigChange('subText', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                            />
                                        </div>

                                        {selectedTemplateId === 'countdown' && (
                                            <div className="space-y-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                                                <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                    <Timer size={12} /> Timer Configuration
                                                </label>

                                                <div className="space-y-1 mb-2">
                                                    <span className="text-[9px] font-bold text-slate-400 ml-1">Label Position</span>
                                                    <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                                        {['left', 'top', 'right', 'below'].map(pos => (
                                                            <button
                                                                key={pos}
                                                                onClick={() => handleConfigChange('labelPosition', pos)}
                                                                className={`flex-1 py-1 text-[10px] font-black uppercase rounded transition-all ${activeConfig.labelPosition === pos ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                                            >
                                                                {pos}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold text-slate-400 ml-1">Expiry Date & Time</span>
                                                    <input
                                                        type="datetime-local"
                                                        value={activeConfig.timerExpiry || ""}
                                                        onChange={(e) => handleConfigChange('timerExpiry', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-amber-400"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold text-slate-400 ml-1">Unit Labels</span>
                                                    <div className="flex gap-2">
                                                        <div className="space-y-1 flex-1">
                                                            <span className="text-[8px] font-bold text-slate-400 ml-1">Hours</span>
                                                            <input
                                                                type="text"
                                                                value={activeConfig.hoursLabel || 'h'}
                                                                onChange={(e) => handleConfigChange('hoursLabel', e.target.value)}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-center outline-none focus:border-amber-400"
                                                                maxLength={2}
                                                            />
                                                        </div>
                                                        <div className="space-y-1 flex-1">
                                                            <span className="text-[8px] font-bold text-slate-400 ml-1">Mins</span>
                                                            <input
                                                                type="text"
                                                                value={activeConfig.minutesLabel || 'm'}
                                                                onChange={(e) => handleConfigChange('minutesLabel', e.target.value)}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-center outline-none focus:border-amber-400"
                                                                maxLength={2}
                                                            />
                                                        </div>
                                                        <div className="space-y-1 flex-1">
                                                            <span className="text-[8px] font-bold text-slate-400 ml-1">Secs</span>
                                                            <input
                                                                type="text"
                                                                value={activeConfig.secondsLabel || 's'}
                                                                onChange={(e) => handleConfigChange('secondsLabel', e.target.value)}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-center outline-none focus:border-amber-400"
                                                                maxLength={2}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between px-1 mb-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content Icon</label>
                                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{activeConfig.icon}</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {Object.keys(ICON_MAP).map(iconName => (
                                                    <button
                                                        key={iconName}
                                                        onClick={() => handleConfigChange('icon', iconName)}
                                                        className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${activeConfig.icon === iconName ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-50 bg-white text-slate-400 hover:border-slate-200'}`}
                                                    >
                                                        {React.createElement(ICON_MAP[iconName], { size: 18 })}
                                                    </button>
                                                ))}
                                            </div>
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
                    </div>
                </aside>

                {/* Preview Area */}
                <main className="flex-1 overflow-y-auto p-12 flex justify-center items-start relative">
                    {!isEnabled && showDisabledOverlay && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-slate-900/10 transition-all duration-500">
                            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white flex flex-col items-center gap-4 max-w-sm text-center animate-in fade-in zoom-in duration-300 relative">
                                <button
                                    onClick={() => setShowDisabledOverlay(false)}
                                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                                >
                                    <X size={18} />
                                </button>
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Power size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Feature Disabled</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Stock bars will not be visible on your storefront until activated.</p>
                                </div>
                                <button
                                    onClick={() => setShowStatusConfirm(true)}
                                    className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95"
                                >
                                    Activate Now
                                </button>
                            </div>
                        </div>
                    )}
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
                            <div className={`transition-all duration-300 ${device === 'mobile' ? 'p-6' : 'p-12'}`}>
                                <div className={`grid grid-cols-1 ${device === 'mobile' ? 'gap-8' : 'md:grid-cols-2 gap-16'}`}>
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
            </div >

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .scale-in {
                    animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .zoom-in {
                    animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
