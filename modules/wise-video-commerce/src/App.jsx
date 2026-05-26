import React, { useState, useEffect, useRef } from 'react';
import { 
    Video, 
    ShoppingBag, 
    Settings, 
    Layout, 
    Play, 
    Plus, 
    Trash2, 
    Save, 
    ExternalLink, 
    Monitor, 
    Smartphone,
    RotateCcw,
    RotateCw,
    Maximize,
    Volume2,
    Settings as SettingsIcon,
    ChevronLeft,
    ChevronRight,
    Type,
    Circle,
    CheckCircle2
} from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('design');
    const [device, setDevice] = useState('desktop');
    const [isEnabled, setIsEnabled] = useState(false);
    const isEnabledRef = useRef(false);
    
    // Keep ref in sync
    useEffect(() => {
        isEnabledRef.current = isEnabled;
    }, [isEnabled]);
    const [activeFeature, setActiveFeature] = useState('gallery'); // 'gallery' or 'reels'
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
    const [isGalleryEnabled, setIsGalleryEnabled] = useState(true);
    const [isReelsEnabled, setIsReelsEnabled] = useState(true);
    const [isReelsAutoplayEnabled, setIsReelsAutoplayEnabled] = useState(true);
    const [reelsTitle, setReelsTitle] = useState('Tagged with Reels');
    const [isMobileCartOverlay, setIsMobileCartOverlay] = useState(true);
    const [mobileCartBgColor, setMobileCartBgColor] = useState('rgba(30, 41, 59, 0.7)');
    const [mobileCartBgOpacity, setMobileCartBgOpacity] = useState(70);
    const [mobileCartTextColor, setMobileCartTextColor] = useState('#ffffff');
    const [mobileCartBtnColor, setMobileCartBtnColor] = useState('#ffffff');
    const [mobileCartBtnTextColor, setMobileCartBtnTextColor] = useState('#1E293B');
    const [mobileCartBtnOpacity, setMobileCartBtnOpacity] = useState(100);
    const [layoutStyle, setLayoutStyle] = useState('Carousel (Horizontal)');
    const [cornerRadius, setCornerRadius] = useState(8);
    const [titleSize, setTitleSize] = useState('16px');
    const [titleColor, setTitleColor] = useState('#000000');
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null); // { message, type: 'success'|'error' }
    const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const baseUrl = window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/';
            const res = await fetch(`${baseUrl}video-commerce/settings`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setIsEnabled(data.status === 'active');
                    setActiveFeature(data.activeFeature || 'gallery');
                    setIsGalleryEnabled(data.galleryEnabled !== false);
                    setIsReelsEnabled(data.reelsEnabled !== false);
                    setIsReelsAutoplayEnabled(data.reelsAutoplayEnabled !== false);
                    setReelsTitle(data.reelsTitle || 'Tagged with Reels');
                    setIsMobileCartOverlay(data.mobileCartOverlay === true);
                    setMobileCartBgColor(data.mobileCartBgColor || 'rgba(30, 41, 59, 0.7)');
                    setMobileCartBgOpacity(data.mobileCartBgOpacity !== undefined ? data.mobileCartBgOpacity : 70);
                    setMobileCartTextColor(data.mobileCartTextColor || '#ffffff');
                    setMobileCartBtnColor(data.mobileCartBtnColor || '#ffffff');
                    setMobileCartBtnTextColor(data.mobileCartBtnTextColor || '#1E293B');
                    setMobileCartBtnOpacity(data.mobileCartBtnOpacity !== undefined ? data.mobileCartBtnOpacity : 100);
                    setLayoutStyle(data.layoutStyle || 'Carousel (Horizontal)');
                    setCornerRadius(data.cornerRadius || 8);
                    setTitleSize(data.titleSize || '16px');
                    setTitleColor(data.titleColor || '#000000');
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handleSave = async (statusOverride = null) => {
        setIsSaving(true);
        console.log('WiseVideo: Saving settings...', { statusOverride });
        try {
            const baseUrl = window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/';
            const nonce = window.wiseModuleData?.nonce || window.wpApiSettings?.nonce || '';
            console.log('WiseVideo: nonce available:', !!nonce);

            const res = await fetch(`${baseUrl}video-commerce/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(nonce ? { 'X-WP-Nonce': nonce } : {})
                },
                body: JSON.stringify({
                    status: isEnabledRef.current ? 'active' : 'inactive',
                    activeFeature,
                    galleryEnabled: isGalleryEnabled,
                    reelsEnabled: isReelsEnabled,
                    reelsAutoplayEnabled: isReelsAutoplayEnabled,
                    reelsTitle: reelsTitle,
                    mobileCartOverlay: isMobileCartOverlay,
                    mobileCartBgColor: mobileCartBgColor,
                    mobileCartBgOpacity: mobileCartBgOpacity,
                    mobileCartTextColor: mobileCartTextColor,
                    mobileCartBtnColor: mobileCartBtnColor,
                    mobileCartBtnTextColor: mobileCartBtnTextColor,
                    mobileCartBtnOpacity: mobileCartBtnOpacity,
                    layoutStyle,
                    cornerRadius,
                    titleSize,
                    titleColor
                })
            });

            const data = await res.json();
            console.log('WiseVideo: Response received', data);

            if (res.ok) {
                setToast({ message: 'Settings saved successfully!', type: 'success' });
                setTimeout(() => setToast(null), 3000);
            } else {
                console.error('WiseVideo: API Error', data);
                setToast({ message: 'Failed to save settings.', type: 'error' });
                setTimeout(() => setToast(null), 3000);
            }
        } catch (error) {
            console.error("WiseVideo: Network Error", error);
            setToast({ message: 'Network error. Please try again.', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <React.Fragment>
            {/* License Activation Modal */}
            {isLicenseModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div 
                        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-blue-100/50">
                                <Video size={30} />
                            </div>
                            
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Pro License Required</h2>
                            
                            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                                WiseVideo Commerce is a premium feature. You must have the <strong>wiseCampaign Pro</strong> plugin installed and an active license key to enable this widget.
                            </p>
                            
                            <div className="mt-8 flex flex-col gap-3">
                                <a 
                                    href={window.wiseModuleData?.pro?.licensePageUrl || 'admin.php?page=wisecampaign_plugin_license'}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm text-center shadow-lg shadow-blue-100 hover:shadow-xl transition-all"
                                >
                                    Activate License Key
                                </a>
                                <button 
                                    onClick={() => setIsLicenseModalOpen(false)}
                                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Feature Selection Modal */}
            {isFeatureModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div 
                        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Select Active Feature</h2>
                                <p className="text-sm text-slate-500 mt-1">Choose the primary video commerce experience for your store.</p>
                            </div>
                            <button 
                                onClick={() => setIsFeatureModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <RotateCw size={18} className="rotate-45" />
                            </button>
                        </div>
                        
                        <div className="p-8 grid grid-cols-2 gap-6">
                            {/* Feature 1: Gallery */}
                            <div 
                                onClick={() => {
                                    setActiveFeature('gallery');
                                    setIsFeatureModalOpen(false);
                                }}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-xl group ${activeFeature === 'gallery' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200 bg-white'}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${activeFeature === 'gallery' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                                    <Layout size={28} />
                                </div>
                                <h3 className="font-black text-slate-900 mb-2">Product gallery videos</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                                    Replace standard product images with high-converting video galleries and shoppable overlays.
                                </p>
                                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeFeature === 'gallery' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {activeFeature === 'gallery' ? (
                                        <><span className="w-2 h-2 rounded-full bg-emerald-500" /> Active & Editing</>
                                    ) : (
                                        'Select to Activate'
                                    )}
                                </div>
                            </div>

                            {/* Feature 2: Reels */}
                            <div 
                                onClick={() => {
                                    setActiveFeature('reels');
                                    setIsFeatureModalOpen(false);
                                }}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-xl group ${activeFeature === 'reels' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200 bg-white'}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${activeFeature === 'reels' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                                    <Video size={28} />
                                </div>
                                <h3 className="font-black text-slate-900 mb-2">Product Reels (UGC)</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                                    Embed vertical customer UGC videos under the add to cart button to strengthen social proof.
                                </p>
                                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeFeature === 'reels' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {activeFeature === 'reels' ? (
                                        <><span className="w-2 h-2 rounded-full bg-emerald-500" /> Active & Editing</>
                                    ) : (
                                        'Select to Activate'
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 flex items-center justify-between px-8">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">More features coming soon...</p>
                            <button 
                                onClick={() => setIsFeatureModalOpen(false)}
                                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col h-[calc(100vh-32px)] bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden relative">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-100">
                            <Video size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-[#0F172A]">wiseCampaign</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-200 mx-4"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] ml-1">WiseVideo Commerce Editor</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setDevice('desktop')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${device === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                        >
                            <Monitor size={16} /> <span className="text-xs font-bold">Desktop</span>
                        </button>
                        <button 
                            onClick={() => setDevice('mobile')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${device === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                        >
                            <Smartphone size={16} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        {toast && (
                            <span 
                                className="animate-in fade-in slide-in-from-right-4 duration-300 text-xs font-bold mr-2 flex items-center gap-1.5"
                                style={{ 
                                    color: toast.type === 'success' ? '#10B981' : '#EF4444',
                                }}
                            >
                                {toast.type === 'success' ? <CheckCircle2 size={14} /> : <RotateCw size={14} className="rotate-45" />}
                                {toast.message}
                            </span>
                        )}
                        <button className="text-slate-500 font-bold text-sm hover:text-slate-700">Discard</button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1E293B] text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-bold shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Controls Sidebar */}
                <aside className="w-[320px] bg-white border-r border-slate-200 flex flex-col overflow-y-auto z-20">
                    <div className="p-4 space-y-6">
                        {/* Status Card */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-left">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                    <Play size={20} fill={isEnabled ? "currentColor" : "none"} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">Widget Status</h4>
                                    <p className={`text-xs font-bold ${isEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>{isEnabled ? 'Currently Active' : 'Deactivated'}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={isEnabled} 
                                    onChange={(e) => {
                                        const newVal = e.target.checked;
                                        const isLicenseActive = window.wiseModuleData?.pro?.isLicenseActive;
                                        if (newVal && !isLicenseActive) {
                                            setIsLicenseModalOpen(true);
                                            return;
                                        }
                                        setIsEnabled(newVal);
                                        isEnabledRef.current = newVal;
                                    }} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>

                        {/* Active Features */}
                        <div className="text-left">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Feature</h4>
                                <button 
                                    disabled={!isEnabled}
                                    onClick={() => isEnabled && setIsFeatureModalOpen(true)}
                                    className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isEnabled ? 'text-emerald-600 hover:text-emerald-700 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                                >
                                    Change Feature
                                </button>
                            </div>
                            <div 
                                onClick={() => isEnabled && setIsFeatureModalOpen(true)}
                                className={`p-3 border rounded-xl flex items-center gap-3 transition-all ${
                                    isEnabled 
                                        ? 'bg-white border-slate-100 shadow-sm group cursor-pointer hover:border-emerald-200' 
                                        : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                    isEnabled 
                                        ? (activeFeature === 'gallery' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500')
                                        : 'bg-slate-200 text-slate-400'
                                }`}>
                                    {activeFeature === 'gallery' ? <Layout size={20} /> : <Video size={20} />}
                                </div>
                                <div className="text-left flex-1">
                                    <h5 className={`text-xs font-black ${isEnabled ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                                        {activeFeature === 'gallery' ? 'Product gallery videos' : 'Product Reels'}
                                    </h5>
                                    <p className="text-[10px] text-slate-400 font-bold">
                                        {activeFeature === 'gallery' ? 'Style: Shoppable' : 'Embedded UGC Videos'}
                                    </p>
                                </div>
                                {isEnabled && (
                                    <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <RotateCw size={14} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        {isEnabled && (
                            <div className="bg-slate-100 p-1 rounded-xl flex transition-all">
                                {['Design', 'Content', 'Settings'].map((tab) => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${activeTab === tab.toLowerCase() ? 'bg-white shadow-sm text-[#0F172A]' : 'text-slate-400'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Settings Content */}
                        <div className="transition-all duration-300">
                            {isEnabled ? (
                                <div>
                                    {activeTab === 'design' && (
                                        <div className="space-y-8 pb-10 text-left">
                                            {/* WooCommerce Integration Section */}
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WooCommerce Integration</h4>
                                                </div>
                                                
                                                {activeFeature === 'gallery' ? (
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-[11px] font-black text-slate-700">Enable Product Video Gallery</label>
                                                                <label className="relative inline-flex items-center cursor-pointer">
                                                                    <input type="checkbox" checked={isGalleryEnabled} onChange={(e) => setIsGalleryEnabled(e.target.checked)} className="sr-only peer" />
                                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                                </label>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                                                Adds an option in the WooCommerce product edit page to upload product videos and galleries.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-[11px] font-black text-slate-700">Enable Product Reels</label>
                                                                <label className="relative inline-flex items-center cursor-pointer">
                                                                    <input type="checkbox" checked={isReelsEnabled} onChange={(e) => setIsReelsEnabled(e.target.checked)} className="sr-only peer" />
                                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                                </label>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                                                Displays vertical customer UGC videos under the Add to Cart button for social proof.
                                                            </p>
                                                        </div>

                                                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-[11px] font-black text-slate-700">Enable Reels Autoplay</label>
                                                                <label className="relative inline-flex items-center cursor-pointer">
                                                                    <input type="checkbox" checked={isReelsAutoplayEnabled} onChange={(e) => setIsReelsAutoplayEnabled(e.target.checked)} className="sr-only peer" />
                                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                                </label>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                                                Automatically play reel thumbnails in a muted loop on the product page.
                                                            </p>
                                                        </div>


                                                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Heading</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={reelsTitle}
                                                                    onChange={(e) => setReelsTitle(e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-emerald-500 transition-colors"
                                                                    placeholder="e.g. Tagged with Reels"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Mobile Add to Cart Overlay - Global Controls */}
                                                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-[11px] font-black text-slate-700">Enable Mobile Add to Cart Overlay</label>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input type="checkbox" checked={isMobileCartOverlay} onChange={(e) => setIsMobileCartOverlay(e.target.checked)} className="sr-only peer" />
                                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                        </label>
                                                    </div>
                                                    {isMobileCartOverlay && (
                                                        <div className="space-y-4 mt-4 pt-4 border-t border-slate-50">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: mobileCartBgColor }}></div>
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Card Background</span>
                                                                </div>
                                                                <input type="color" value={mobileCartBgColor.startsWith('rgba') ? '#1e293b' : mobileCartBgColor} onChange={(e) => setMobileCartBgColor(e.target.value)} className="w-10 h-8 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer" />
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: mobileCartTextColor }}></div>
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Text Color</span>
                                                                </div>
                                                                <input type="color" value={mobileCartTextColor} onChange={(e) => setMobileCartTextColor(e.target.value)} className="w-10 h-8 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer" />
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: mobileCartBtnColor }}></div>
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Btn Background</span>
                                                                </div>
                                                                <input type="color" value={mobileCartBtnColor} onChange={(e) => setMobileCartBtnColor(e.target.value)} className="w-10 h-8 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer" />
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: mobileCartBtnTextColor }}></div>
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Btn Text Color</span>
                                                                </div>
                                                                <input type="color" value={mobileCartBtnTextColor} onChange={(e) => setMobileCartBtnTextColor(e.target.value)} className="w-10 h-8 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer" />
                                                            </div>
                                                            <div className="space-y-3 pt-2">
                                                                <div className="flex items-center justify-between px-1">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Opacity</label>
                                                                    <span className="text-[10px] font-bold text-slate-400">{mobileCartBtnOpacity}%</span>
                                                                </div>
                                                                <input type="range" min="0" max="100" step="0.5" value={mobileCartBtnOpacity} onChange={(e) => setMobileCartBtnOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                                            </div>
                                                            <div className="space-y-3 pt-2">
                                                                <div className="flex items-center justify-between px-1">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Background Opacity</label>
                                                                    <span className="text-[10px] font-bold text-slate-400">{mobileCartBgOpacity}%</span>
                                                                </div>
                                                                <input type="range" min="0" max="100" step="0.5" value={mobileCartBgOpacity} onChange={(e) => setMobileCartBgOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Video Player - Only for Gallery */}
                                            {activeFeature === 'gallery' && (
                                                <div className="space-y-4 text-left">
                                                    <h4 className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider">Video Player</h4>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Layout Style</label>
                                                        <select 
                                                            value={layoutStyle} 
                                                            onChange={(e) => setLayoutStyle(e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-[#0F172A] outline-none"
                                                        >
                                                            <option>Carousel (Horizontal)</option>
                                                            <option>Grid (2 Columns)</option>
                                                            <option>Stacked (Vertical)</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Corner Radius</label>
                                                            <span className="text-[10px] font-bold text-slate-400">{cornerRadius}px</span>
                                                        </div>
                                                        <input 
                                                            type="range" 
                                                            min="0" 
                                                            max="30" 
                                                            value={cornerRadius} 
                                                            onChange={(e) => setCornerRadius(parseInt(e.target.value))}
                                                            className="w-full h-1 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Typography */}
                                            <div className="space-y-5">
                                                <h4 className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider">Typography</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 mb-1 pl-1">
                                                        <Type size={14} className="text-slate-400" />
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title Style</label>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <select 
                                                            value={titleSize}
                                                            onChange={(e) => setTitleSize(e.target.value)}
                                                            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-[#0F172A] outline-none"
                                                        >
                                                            <option>14px</option>
                                                            <option>16px</option>
                                                            <option>18px</option>
                                                            <option>20px</option>
                                                        </select>
                                                        <div className="relative group">
                                                            <input 
                                                                type="color" 
                                                                value={titleColor}
                                                                onChange={(e) => setTitleColor(e.target.value)}
                                                                className="w-12 h-10 p-1 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center px-4 space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                                        <SettingsIcon size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Module Hidden</h4>
                                        <p className="text-xs text-slate-400 font-bold max-w-[200px] mx-auto mt-2 leading-relaxed">
                                            The configuration panel is hidden because the widget is deactivated. 
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setIsEnabled(true)}
                                        className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                                    >
                                        Activate Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Preview Area */}
                <main className="flex-1 bg-[#F1F5F9] p-12 overflow-y-auto flex items-start justify-center">
                    <div className={`${device === 'mobile' ? 'w-[375px]' : 'w-full max-w-[1000px]'} transition-all duration-500`}>
                        {/* Browser Mockup */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative">
                            {/* Browser Bar */}
                            <div className="bg-slate-50 px-6 py-3 flex items-center gap-4 border-b border-slate-100">
                                <div className="flex gap-1.5 shrink-0">
                                    <Circle size={8} className="fill-red-400 text-red-400" />
                                    <Circle size={8} className="fill-amber-400 text-amber-400" />
                                    <Circle size={8} className="fill-emerald-400 text-emerald-400" />
                                </div>
                                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-1 flex items-center gap-2">
                                    <ExternalLink size={12} className="text-slate-300" />
                                    <span className="text-[10px] text-slate-400">mystore.com/products/bag</span>
                                </div>
                            </div>

                            {/* Page Content View */}
                            <div className="p-8">
                                <div className={`grid ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-[1.2fr,0.8fr]'} gap-12 text-left`}>
                                    {/* Left: Video & Gallery */}
                                    <div className="space-y-6">
                                        {activeFeature === 'gallery' && (
                                            <div 
                                                className={`relative ${device === 'mobile' ? 'aspect-[3/4]' : 'aspect-video'} bg-slate-100 overflow-hidden shadow-md group`}
                                                style={{ borderRadius: `${cornerRadius}px` }}
                                            >
                                                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Product" />
                                                {/* Video Overlays */}
                                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-100 group-hover:scale-110 transition-transform">
                                                        <Play size={32} fill="currentColor" className="ml-1" />
                                                    </div>
                                                </div>
                                                
                                                {/* Controls Overlays */}
                                                <div className="absolute top-1/2 -translate-y-1/2 left-4 w-9 h-9 rounded-full bg-black/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                                                    <RotateCcw size={18} />
                                                </div>
                                                <div className="absolute top-1/2 -translate-y-1/2 right-4 w-9 h-9 rounded-full bg-black/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                                                    <RotateCw size={18} />
                                                </div>
                                                
                                                {/* Bottom Controls Bar */}
                                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent flex items-center justify-between text-white">
                                                    <div className="flex items-center gap-3">
                                                        <Play size={16} fill="currentColor" />
                                                        <Volume2 size={16} />
                                                    </div>
                                                    <div className="flex-1 mx-4 h-[2px] bg-white/20 rounded-full relative">
                                                        <div className="absolute top-0 left-0 w-1/3 h-full bg-white rounded-full"></div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <SettingsIcon size={16} />
                                                        <Maximize size={16} />
                                                    </div>
                                                </div>

                                                {/* Mobile Add to Cart Overlay Preview */}
                                                {device === 'mobile' && isMobileCartOverlay && (
                                                    <div 
                                                        className="absolute bottom-4 left-2 right-2 z-20 animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-2xl p-3 flex items-center gap-3"
                                                        style={{ 
                                                            backgroundColor: mobileCartBgColor.startsWith('#') 
                                                                ? `${mobileCartBgColor}${Math.round(mobileCartBgOpacity * 2.55).toString(16).padStart(2, '0')}` 
                                                                : mobileCartBgColor.replace(/[\d.]+\)$/g, `${mobileCartBgOpacity/100})`),
                                                            backdropFilter: mobileCartBgOpacity > 0 ? 'blur(10px)' : 'none',
                                                            border: mobileCartBgOpacity > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                                            boxShadow: mobileCartBgOpacity > 0 ? '0 10px 30px rgba(0,0,0,0.3)' : 'none'
                                                        }}
                                                    >
                                                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                                            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-width-0 text-left">
                                                            <h4 className="text-[11px] font-black truncate leading-tight" style={{ color: mobileCartTextColor }}>The Rouge Carry</h4>
                                                            <p className="text-[10px] font-bold mt-0.5 opacity-70" style={{ color: mobileCartTextColor }}>$200.00</p>
                                                        </div>
                                                        <button 
                                                            className="px-4 py-2 rounded-lg font-black text-[10px] shadow-lg active:scale-95 transition-all whitespace-nowrap"
                                                            style={{ 
                                                                backgroundColor: mobileCartBtnColor.startsWith('#') 
                                                                    ? `${mobileCartBtnColor}${Math.round(mobileCartBtnOpacity * 2.55).toString(16).padStart(2, '0')}` 
                                                                    : mobileCartBtnColor.replace(/[\d.]+\)$/g, `${mobileCartBtnOpacity/100})`),
                                                                color: mobileCartBtnTextColor 
                                                            }}
                                                        >
                                                            Buy Now
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeFeature === 'gallery' && (
                                            /* Gallery Thumbnails */
                                            <div className="flex gap-3 overflow-x-auto pb-2">
                                                {[1,2,3,4,5].map((i) => (
                                                    <div 
                                                        key={i} 
                                                        className={`w-16 aspect-square bg-slate-50 flex-shrink-0 cursor-pointer overflow-hidden border-2 transition-all ${i === 1 ? 'border-emerald-500 shadow-lg shadow-emerald-50' : 'border-slate-100 border-dashed'}`}
                                                        style={{ borderRadius: `${cornerRadius/2}px` }}
                                                    >
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 relative">
                                                            <img src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100&index=${i}`} className="w-full h-full object-cover opacity-50" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Play size={14} fill="currentColor" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {activeFeature === 'reels' && (
                                            /* Static Placeholder for Reels in left col if needed, but they show under Add to Cart */
                                            <div className="aspect-[4/5] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                                <Video size={48} className="mb-4 opacity-20" />
                                                <p className="text-xs font-bold">Standard Gallery View Hidden</p>
                                                <p className="text-[10px] mt-1 opacity-60">Product Reels are active and will show under the Add to Cart button.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Product Details */}
                                    <div className="py-2 space-y-8">
                                        <div className="space-y-4">
                                            <h2 className="text-3xl font-black text-[#0F172A] tracking-tight" style={{ fontSize: titleSize, color: titleColor }}>The Rouge Carry</h2>
                                            <p className="text-xl font-bold text-slate-400">$200.00 – $900.00</p>
                                        </div>
                                        
                                        <div className="h-[1px] bg-slate-100"></div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shade</label>
                                                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-500 outline-none">
                                                    <option>Select an option</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Craft</label>
                                                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-500 outline-none">
                                                    <option>Select an option</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-center">
                                            <div className="flex h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                                                <button className="px-4 hover:bg-slate-100 transition-colors text-slate-400 font-bold">−</button>
                                                <div className="w-10 flex items-center justify-center font-black text-slate-700">1</div>
                                                <button className="px-4 hover:bg-slate-100 transition-colors text-slate-400 font-bold">+</button>
                                            </div>
                                            <button className="flex-1 h-12 bg-[#1E293B] text-white rounded-xl font-black text-sm shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all">
                                                <ShoppingBag size={18} />
                                                Add to Cart
                                            </button>
                                        </div>

                                        {activeFeature === 'reels' && isReelsEnabled && (
                                            <div className="pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">{reelsTitle}</h3>
                                                </div>
                                                <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                                                    {[1,2,3,4].map((i) => (
                                                        <div 
                                                            key={i} 
                                                            className="w-[140px] aspect-[9/16] bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden relative group shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1"
                                                        >
                                                            <img 
                                                                src={`https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300&index=${i}`} 
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                            />
                                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                                                                    <Play size={20} fill="currentColor" />
                                                                </div>
                                                            </div>
                                                            {/* User Info overlay (UGC feel) */}
                                                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-white/30 backdrop-blur-sm border border-white/30 overflow-hidden">
                                                                    <div className="w-full h-full bg-slate-200" />
                                                                </div>
                                                                <span className="text-[8px] font-bold text-white shadow-sm">@user_{i}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* WiseVideo Widget Placeholder */}
                                <div className="mt-16 pt-12 border-t-2 border-dashed border-emerald-200 relative">
                                    <div className="absolute -top-3.5 left-0 bg-emerald-500 text-white px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider">WiseVideo Widget</div>
                                    <div className="text-left mb-8">
                                        <h3 className="text-xl font-black text-[#0F172A]">See it in action</h3>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[1,2,3,4].map((i) => (
                                            <div key={i} className="aspect-[4/5] bg-slate-100 rounded-2xl relative overflow-hidden group shadow-sm border border-slate-100">
                                                <img src={`https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400&i=${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                                        <Play size={20} fill="currentColor" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Preview Disabled Overlay */}
                                {!isEnabled && (
                                    <div className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
                                        <div className="bg-white/95 p-8 rounded-3xl shadow-2xl max-w-sm border border-slate-100 animate-in zoom-in duration-300">
                                            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Video size={32} />
                                            </div>
                                            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider mb-2">Preview Disabled</h3>
                                            <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                                Activate the widget status in the sidebar to enable the live preview mode.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>


        </React.Fragment>
    );
}

export default App;
