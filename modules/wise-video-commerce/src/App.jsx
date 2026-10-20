import React, { useCallback, useEffect, useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Clapperboard,
    Crown,
    ExternalLink,
    Film,
    GalleryHorizontalEnd,
    LayoutGrid,
    Loader2,
    MessageSquarePlus,
    Monitor,
    Play,
    Power,
    RefreshCw,
    Rows3,
    Save,
    ShoppingBag,
    Smartphone,
    Sparkles,
    Video,
    Volume2,
    X,
} from 'lucide-react';
import { ColorRow, FieldLabel, Hint, Notice, OptionCard, SectionTitle, SliderRow, Toast, ToggleRow } from './components/ui.jsx';
import PerformanceCard from '../../shared/PerformanceCard.jsx';

const FEATURE_REQUEST_URL = 'https://wisecampaign.canny.io/feature-requests';
const PRICING_URL = 'https://wisemattic.com/wisecampaign/pricing';

const apiBase = () => `${window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/'}video-commerce/settings`;
const apiHeaders = (json = false) => {
    const nonce = window.wiseModuleData?.nonce;
    return {
        ...(json ? { 'Content-Type': 'application/json' } : {}),
        ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
    };
};

// On/off is saved on its own, so it never counts as an unsaved change.
const snapshot = (settings) => JSON.stringify({ ...settings, status: undefined });

// Values must match WiseVideoCommerce::get_layouts()
const LAYOUTS = [
    { id: 'Carousel (Horizontal)', label: 'Carousel', icon: <GalleryHorizontalEnd size={16} /> },
    { id: 'Grid (2 Columns)', label: 'Grid', icon: <LayoutGrid size={16} /> },
    { id: 'Stacked (Vertical)', label: 'Stacked', icon: <Rows3 size={16} /> },
];

// Color plus opacity (0-100) as rgba(), like WiseVideoCommerce::rgba(). Also reads older rgba() values.
const rgba = (color, opacity, fallback) => {
    const value = String(color || '');
    let rgb;
    const m = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) {
        rgb = [m[1], m[2], m[3]].map(Number);
    } else {
        let hex = (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value) ? value : fallback).slice(1);
        if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
        rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    }
    return `rgba(${rgb.join(',')},${Math.max(0, Math.min(100, Number(opacity))) / 100})`;
};

// Hex for the color pickers; older versions saved the card color as rgba()
const toHex = (color, fallback) => {
    const value = String(color || '');
    if (/^#[0-9a-f]{6}$/i.test(value)) return value;
    const m = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) return `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
    return fallback;
};

const PlayBadge = ({ size = 'md' }) => (
    <span className={`flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur ${size === 'sm' ? 'w-6 h-6' : 'w-11 h-11'}`}>
        <Play size={size === 'sm' ? 11 : 18} fill="currentColor" className="ml-0.5" />
    </span>
);

/**
 * The product card from WiseVideoCommerce::render_product_card(), drawn with the saved colors.
 */
const ProductCard = ({ s, className = '' }) => (
    <div
        className={`flex items-center gap-3 p-2.5 rounded-2xl border border-solid border-white/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.3)] ${className}`}
        style={{ backgroundColor: rgba(s.mobileCartBgColor, s.mobileCartBgOpacity, '#1E293B'), color: s.mobileCartTextColor }}
    >
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-200 to-rose-300 shrink-0" />
        <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold truncate">Leather Weekender</div>
            <div className="text-[11px] font-semibold opacity-80">৳ 249.00</div>
        </div>
        <span
            className="px-3.5 py-2 rounded-lg text-[11px] font-extrabold whitespace-nowrap"
            style={{ backgroundColor: rgba(s.mobileCartBtnColor, s.mobileCartBtnOpacity, '#FFFFFF'), color: s.mobileCartBtnTextColor }}
        >
            {s.buyNowText || 'Buy Now'}
        </span>
    </div>
);

const VideoMock = ({ radius, children, tall = false }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 ${tall ? 'aspect-[3/4]' : 'aspect-video'}`} style={{ borderRadius: radius }}>
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,#f59e0b,transparent_45%),radial-gradient(circle_at_75%_70%,#ec4899,transparent_40%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
            <PlayBadge />
        </div>
        <div className="absolute left-0 right-0 bottom-0 px-3 py-2.5 flex items-center gap-2.5 text-white/90 bg-gradient-to-t from-black/50 to-transparent">
            <Play size={12} fill="currentColor" />
            <div className="flex-1 h-1 rounded-full bg-white/25">
                <div className="w-1/3 h-full rounded-full bg-white" />
            </div>
            <Volume2 size={13} />
        </div>
        {children}
    </div>
);

export default function App() {
    const [data, setData] = useState(null);
    const [settings, setSettings] = useState(null);
    const [saved, setSaved] = useState('');
    const [status, setStatus] = useState('loading');
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [device, setDevice] = useState('desktop');
    const [activeTab, setActiveTab] = useState('settings');
    const [previewView, setPreviewView] = useState('page');
    const [showProModal, setShowProModal] = useState(false);

    const closeToast = useCallback(() => setToast(null), []);
    const isEnabled = settings?.status === 'active';
    const licenseActive = !!data?.licenseActive;
    const isDirty = status === 'ready' && snapshot(settings) !== saved;

    const loadSettings = useCallback(async () => {
        setStatus('loading');
        try {
            // Some hosts cache REST responses; always ask the server for fresh settings and license status.
            const res = await fetch(apiBase(), { headers: apiHeaders(), cache: 'no-store' });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message);
            setData(payload);
            setSettings(payload.settings);
            setSaved(snapshot(payload.settings));
            setStatus('ready');
        } catch (e) {
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        const warn = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [isDirty]);

    const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
    const flip = (key) => update(key, !settings[key]);

    const post = async (body) => {
        const res = await fetch(apiBase(), { method: 'POST', headers: apiHeaders(true), body: JSON.stringify(body) });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.message || 'Could not save settings. Please try again.');
        return payload.settings;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { status: _ignored, ...rest } = settings;
            const next = await post(rest);
            setSettings(next);
            setSaved(snapshot(next));
            setToast({ type: 'success', message: 'WiseVideo Commerce settings saved!' });
        } catch (e) {
            setToast({ type: 'error', message: e.message });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleEnabled = async () => {
        if (!isEnabled && !licenseActive) {
            setShowProModal(true);
            return;
        }
        const next = isEnabled ? 'inactive' : 'active';
        update('status', next);
        try {
            await post({ status: next });
            setToast({ type: 'success', message: next === 'active' ? 'WiseVideo Commerce is now on.' : 'WiseVideo Commerce is now off.' });
        } catch (e) {
            update('status', isEnabled ? 'active' : 'inactive');
            setToast({ type: 'error', message: e.message });
        }
    };

    if (status !== 'ready') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-32px)] bg-[#F8FAFC] text-slate-500 gap-4">
                {status === 'loading' ? (
                    <>
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                        <span className="text-sm font-bold">Loading WiseVideo Commerce…</span>
                    </>
                ) : (
                    <>
                        <AlertCircle size={28} className="text-rose-500" />
                        <span className="text-sm font-bold">Could not load the WiseVideo Commerce settings.</span>
                        <button type="button" onClick={loadSettings} className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold">
                            <RefreshCw size={14} /> Try Again
                        </button>
                    </>
                )}
            </div>
        );
    }

    const s = settings;
    const isMobile = device === 'mobile';
    const radius = `${s.cornerRadius}px`;
    const layout = LAYOUTS.find((l) => l.id === s.layoutStyle) || LAYOUTS[0];
    const thumbs = ['video', 'image', 'image', 'video', 'image'];

    return (
        <div className="flex flex-col h-[calc(100vh-32px)] bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {/* Pro Upgrade Modal */}
            {showProModal && (
                <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/60 backdrop-blur-md wvc-fade-in p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 flex flex-col items-center text-center border border-solid border-slate-100">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-200" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                            <Crown size={32} />
                        </div>
                        <h2 className="m-0 text-2xl font-black text-[#0F172A] tracking-tight mb-2">Unlock Pro Feature</h2>
                        <p className="m-0 text-slate-500 text-sm font-medium leading-relaxed mb-8">
                            WiseVideo Commerce needs wiseCampaign Pro with an active license.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                type="button"
                                onClick={() => setShowProModal(false)}
                                className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl border border-solid border-slate-200/60"
                            >
                                Cancel
                            </button>
                            <a
                                href={window.wiseModuleData?.pro?.isInstalled ? window.wiseModuleData?.pro?.licensePageUrl : PRICING_URL}
                                target={window.wiseModuleData?.pro?.isInstalled ? undefined : '_blank'}
                                rel="noopener noreferrer"
                                className="flex-1 px-5 py-3 font-bold text-sm rounded-xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 no-underline"
                                style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
                            >
                                <span className="font-bold whitespace-nowrap" style={{ color: '#FFFFFF' }}>
                                    {window.wiseModuleData?.pro?.isInstalled ? 'Activate License' : 'Upgrade Now'}
                                </span>
                                <Sparkles size={16} style={{ color: '#FFFFFF' }} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Header */}
            <header className="pt-3 pb-3 bg-white border-0 border-b border-solid border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 shrink-0">W</div>
                    <span className="font-bold text-lg tracking-tight text-[#0F172A]">WiseCampaign</span>
                    <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs font-bold text-blue-600">
                        <Video size={14} />
                        WiseVideo Commerce
                    </div>
                    {licenseActive ? (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-solid border-emerald-100">
                            <CheckCircle2 size={12} /> Pro Active
                        </span>
                    ) : (
                        <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                            Pro Feature
                        </span>
                    )}
                </div>

                {/* Center: Device Switcher */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex bg-slate-100 p-1 rounded-md">
                        {[
                            { id: 'desktop', label: 'Desktop', icon: <Monitor size={16} /> },
                            { id: 'mobile', label: 'Mobile', icon: <Smartphone size={16} /> },
                        ].map((d) => (
                            <button
                                key={d.id}
                                type="button"
                                onClick={() => setDevice(d.id)}
                                aria-label={d.label}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${device === d.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {d.icon}
                                {device === d.id && <span className="text-xs font-bold">{d.label}</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isDirty && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Unsaved changes
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-bold shadow-lg shadow-slate-200 active:scale-95 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <Save size={18} className={isSaving ? 'animate-spin' : ''} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-[380px] bg-white border-0 border-r border-solid border-slate-200 flex flex-col shrink-0 overflow-y-auto">
                    {/* Master Activation Toggle */}
                    <div className="p-5 border-0 border-b-4 border-solid border-slate-50 bg-slate-50/30">
                        <button
                            type="button"
                            onClick={toggleEnabled}
                            className="w-full flex items-center justify-between bg-white p-4 rounded-xl border border-solid border-slate-200 shadow-sm hover:border-blue-200 transition-all cursor-pointer text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Power size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-700 uppercase tracking-tight">WiseVideo Commerce</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                        {isEnabled ? <span className="text-emerald-500">Currently Active</span> : licenseActive ? 'Feature Disabled' : 'Needs Pro License'}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-all relative ${isEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? 'right-1' : 'left-1'}`} />
                            </div>
                        </button>
                        <PerformanceCard module="wisevideo" />
                    </div>

                    <div className={`flex flex-col flex-1 transition-all duration-300 ${!isEnabled ? 'opacity-40 grayscale pointer-events-none select-none blur-[1px]' : ''}`}>
                        {/* Navigation Tabs */}
                        <div className="px-4 pt-4 pb-2">
                            <div className="flex bg-slate-100 p-1 rounded-md">
                                {['settings', 'design', 'content'].map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-white shadow-sm text-[#0F172A]' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 py-4 space-y-6 pb-10 text-left">
                            {activeTab === 'settings' && (
                                <div className="space-y-6 wvc-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle>Features</SectionTitle>
                                        <ToggleRow
                                            title="Product video gallery"
                                            desc="Videos and product images together in the product gallery"
                                            icon={<Film size={14} />}
                                            on={s.galleryEnabled}
                                            onClick={() => { flip('galleryEnabled'); setPreviewView('page'); }}
                                        />
                                        <ToggleRow
                                            title="Product reels"
                                            desc="Vertical customer videos under Add to Cart"
                                            icon={<Clapperboard size={14} />}
                                            on={s.reelsEnabled}
                                            onClick={() => { flip('reelsEnabled'); setPreviewView('page'); }}
                                        />
                                        {s.reelsEnabled && (
                                            <ToggleRow
                                                title="Play reels automatically"
                                                desc="Muted, and only while they are on screen"
                                                icon={<Play size={14} />}
                                                on={s.reelsAutoplayEnabled}
                                                onClick={() => flip('reelsAutoplayEnabled')}
                                            />
                                        )}
                                        <ToggleRow
                                            title="Product card with Buy Now"
                                            desc="On the main video on phones, and in the reels viewer"
                                            icon={<ShoppingBag size={14} />}
                                            on={s.mobileCartOverlay}
                                            onClick={() => { flip('mobileCartOverlay'); setDevice('mobile'); }}
                                        />
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Add Videos to Products</SectionTitle>
                                        <ol className="m-0 pl-5 space-y-1.5 text-[12px] text-slate-600 font-medium leading-relaxed">
                                            <li>Open a product in <strong>Products → Edit</strong>.</li>
                                            <li>In the right column, set a <strong>Product video</strong>, add <strong>gallery videos</strong> or <strong>reels</strong>.</li>
                                            <li>Update the product. Products without videos keep their usual gallery.</li>
                                        </ol>
                                        <a
                                            href={data.productsUrl}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 no-underline"
                                        >
                                            Go to Products <ExternalLink size={12} />
                                        </a>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'design' && (
                                <div className="space-y-6 wvc-fade-in">
                                    <section className={`space-y-2 ${s.galleryEnabled ? '' : 'opacity-40 pointer-events-none'}`}>
                                        <SectionTitle>Gallery Thumbnails</SectionTitle>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {LAYOUTS.map((l) => (
                                                <OptionCard
                                                    key={l.id}
                                                    selected={s.layoutStyle === l.id}
                                                    onClick={() => { update('layoutStyle', l.id); setPreviewView('page'); }}
                                                    className="!flex-col !justify-center gap-1 py-2.5"
                                                >
                                                    {l.icon}
                                                    <span className="text-[11px]">{l.label}</span>
                                                </OptionCard>
                                            ))}
                                        </div>
                                        <SliderRow label="Corner Radius" value={s.cornerRadius} min={0} max={40} onChange={(v) => update('cornerRadius', v)} />
                                    </section>

                                    <section className={`space-y-2 ${s.mobileCartOverlay ? '' : 'opacity-40 pointer-events-none'}`} onFocus={() => setDevice('mobile')}>
                                        <SectionTitle>Product Card</SectionTitle>
                                        <ColorRow label="Card Background" value={toHex(s.mobileCartBgColor, '#1E293B')} onChange={(v) => update('mobileCartBgColor', v)} />
                                        <SliderRow label="Card Opacity" value={Math.round(s.mobileCartBgOpacity)} min={0} max={100} unit="%" onChange={(v) => update('mobileCartBgOpacity', v)} />
                                        <ColorRow label="Card Text" value={s.mobileCartTextColor} onChange={(v) => update('mobileCartTextColor', v)} />
                                        <ColorRow label="Button Background" value={toHex(s.mobileCartBtnColor, '#FFFFFF')} onChange={(v) => update('mobileCartBtnColor', v)} />
                                        <SliderRow label="Button Opacity" value={Math.round(s.mobileCartBtnOpacity)} min={0} max={100} unit="%" onChange={(v) => update('mobileCartBtnOpacity', v)} />
                                        <ColorRow label="Button Text" value={s.mobileCartBtnTextColor} onChange={(v) => update('mobileCartBtnTextColor', v)} />
                                    </section>

                                    {s.showGalleryTitle && (
                                        <section className="space-y-2 wvc-fade-in">
                                            <SectionTitle>Gallery Heading Style</SectionTitle>
                                            <SliderRow label="Size" value={parseInt(s.titleSize, 10) || 16} min={12} max={40} onChange={(v) => update('titleSize', `${v}px`)} />
                                            <ColorRow label="Color" value={s.titleColor} onChange={(v) => update('titleColor', v)} />
                                        </section>
                                    )}
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="space-y-6 wvc-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle>Gallery Heading</SectionTitle>
                                        <ToggleRow
                                            title="Show a heading above the gallery"
                                            icon={<Film size={14} />}
                                            on={s.showGalleryTitle}
                                            onClick={() => { flip('showGalleryTitle'); setPreviewView('page'); }}
                                        />
                                        {s.showGalleryTitle && (
                                            <input
                                                type="text"
                                                value={s.galleryTitle}
                                                onChange={(e) => update('galleryTitle', e.target.value)}
                                                className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                            />
                                        )}
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Reels Heading</SectionTitle>
                                        <input
                                            type="text"
                                            value={s.reelsTitle}
                                            onChange={(e) => update('reelsTitle', e.target.value)}
                                            onFocus={() => setPreviewView('page')}
                                            placeholder="e.g. Tagged with Reels"
                                            className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                        />
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Buy Now Button</SectionTitle>
                                        <FieldLabel htmlFor="wvc-buy-now">Button Text</FieldLabel>
                                        <input
                                            id="wvc-buy-now"
                                            type="text"
                                            value={s.buyNowText}
                                            onChange={(e) => update('buyNowText', e.target.value)}
                                            onFocus={() => setPreviewView('lightbox')}
                                            className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                        />
                                        <Hint>Simple products are added to the cart. Products with options scroll to the options first.</Hint>
                                    </section>
                                </div>
                            )}

                            <a
                                href={FEATURE_REQUEST_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-solid border-slate-100 hover:border-blue-200 no-underline transition-colors"
                            >
                                <div className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm"><MessageSquarePlus size={16} /></div>
                                <div className="flex-1">
                                    <div className="text-xs font-black text-[#0F172A]">Have a feature request?</div>
                                    <div className="text-[10px] font-medium text-slate-400">Share ideas and vote on others</div>
                                </div>
                                <ExternalLink size={14} className="text-slate-300" />
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Main Preview Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col relative">
                    <div className="flex items-center justify-between px-8 pt-6 pb-2">
                        <div className="flex bg-white p-1 rounded-md border border-solid border-slate-200 shadow-sm">
                            {[
                                { id: 'page', label: 'Product Page' },
                                { id: 'lightbox', label: 'Reels Viewer' },
                            ].map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => setPreviewView(v.id)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${previewView === v.id ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">Sample product with sample videos</span>
                    </div>

                    <div className="relative flex-1 flex justify-center items-start p-6 sm:p-8 pt-2">
                        {!isEnabled && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-slate-900/10">
                                <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-solid border-white flex flex-col items-center gap-4 max-w-sm text-center wvc-fade-in">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="m-0 text-xl font-black text-[#0F172A] tracking-tight">WiseVideo Commerce Is Off</h3>
                                    <p className="m-0 text-slate-500 text-xs font-medium leading-relaxed">
                                        {licenseActive ? 'Product pages show their usual gallery. Turn it on to add videos and reels.' : 'This is a Pro feature. Activate your wiseCampaign Pro license to turn it on.'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={toggleEnabled}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 text-xs"
                                    >
                                        {licenseActive ? 'Turn On WiseVideo Commerce' : 'Unlock with Pro'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={`${isMobile ? 'w-[375px]' : 'w-full max-w-[1100px]'} bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-solid border-slate-200 overflow-hidden`}>
                            <div className="bg-[#F8FAFC] px-6 py-2.5 border-0 border-b border-solid border-slate-200 flex items-center gap-4">
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                                </div>
                                <div className="flex-1 max-w-3xl mx-auto bg-white h-7 rounded-lg flex items-center justify-center px-4 border border-solid border-slate-200/60 shadow-sm">
                                    <span className="text-[11px] font-medium text-slate-500">mysite.com/product/leather-weekender</span>
                                </div>
                            </div>

                            {previewView === 'lightbox' ? (
                                <div className="relative bg-slate-950/90 flex items-center justify-center p-8 min-h-[640px]">
                                    {s.reelsEnabled ? (
                                        <div className="relative w-[300px] aspect-[9/16] rounded-[22px] overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-800 to-rose-900 shadow-2xl">
                                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_40%_35%,#f59e0b,transparent_45%)]" />
                                            <span className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center"><Volume2 size={16} /></span>
                                            <span className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center"><X size={16} /></span>
                                            {s.mobileCartOverlay && <ProductCard s={s} className="absolute left-3 right-3 bottom-4" />}
                                        </div>
                                    ) : (
                                        <Notice>Reels are turned off, so there is no reels viewer.</Notice>
                                    )}
                                </div>
                            ) : (
                                <div className={isMobile ? 'p-4 space-y-6' : 'p-10 grid grid-cols-2 gap-10'}>
                                    {/* Gallery */}
                                    <div>
                                        {s.galleryEnabled ? (
                                            <>
                                                {s.showGalleryTitle && (
                                                    <h2 className="m-0 mb-4 font-extrabold" style={{ fontSize: s.titleSize, color: s.titleColor }}>{s.galleryTitle}</h2>
                                                )}
                                                <VideoMock radius={radius} tall={isMobile}>
                                                    {isMobile && s.mobileCartOverlay && <ProductCard s={s} className="absolute left-3 right-3 bottom-12" />}
                                                </VideoMock>
                                                <div
                                                    className={`mt-3 gap-2.5 ${layout.id === 'Grid (2 Columns)' ? 'grid grid-cols-2' : layout.id === 'Stacked (Vertical)' ? 'flex flex-col' : 'flex overflow-hidden'}`}
                                                >
                                                    {thumbs.slice(0, layout.id === 'Carousel (Horizontal)' ? 5 : 4).map((type, i) => (
                                                        <div
                                                            key={i}
                                                            className={`relative shrink-0 overflow-hidden border-2 border-solid ${i === 0 ? 'border-blue-600' : 'border-transparent'} ${type === 'video' ? 'bg-gradient-to-br from-slate-700 to-indigo-900' : 'bg-gradient-to-br from-amber-100 to-rose-200'} ${layout.id === 'Carousel (Horizontal)' ? 'w-[72px] h-[72px]' : layout.id === 'Stacked (Vertical)' ? 'w-full aspect-video' : 'w-full aspect-square'}`}
                                                            style={{ borderRadius: `${s.cornerRadius * 0.75}px` }}
                                                        >
                                                            {type === 'video' && (
                                                                <span className="absolute inset-0 flex items-center justify-center"><PlayBadge size="sm" /></span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-100 to-rose-200" />
                                                <p className="mt-3 text-[11px] font-bold text-slate-400">Video gallery off: the usual product images show.</p>
                                            </>
                                        )}
                                    </div>

                                    {/* Product details */}
                                    <div className="space-y-5">
                                        <div className="h-3 w-24 rounded-full bg-slate-100" />
                                        <div className="text-2xl font-black text-[#0F172A] tracking-tight">Leather Weekender</div>
                                        <div className="text-lg font-bold text-slate-500">৳ 249.00</div>
                                        <div className="space-y-2">
                                            <div className="h-2.5 w-full rounded-full bg-slate-50" />
                                            <div className="h-2.5 w-4/5 rounded-full bg-slate-50" />
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-16 h-11 rounded-lg border border-solid border-slate-200" />
                                            <div className="flex-1 h-11 rounded-lg bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2">
                                                <ShoppingBag size={16} /> Add to cart
                                            </div>
                                        </div>

                                        {s.reelsEnabled && (
                                            <div className="pt-3">
                                                <div className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-[#0F172A] mb-3">{s.reelsTitle}</div>
                                                <div className="flex gap-3 overflow-hidden">
                                                    {['from-indigo-800 to-rose-700', 'from-amber-600 to-rose-700', 'from-emerald-700 to-sky-800', 'from-slate-700 to-indigo-800'].map((g, i) => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setPreviewView('lightbox')}
                                                            className={`relative shrink-0 w-[110px] aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br ${g} shadow-md`}
                                                            aria-label={`Open reel ${i + 1}`}
                                                        >
                                                            {!s.reelsAutoplayEnabled && (
                                                                <span className="absolute inset-0 flex items-center justify-center"><PlayBadge /></span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="m-0 mt-2 text-[11px] text-slate-400 font-medium">
                                                    {s.reelsAutoplayEnabled ? 'Reels play muted while on screen. Click one to open the viewer.' : 'Click a reel to open the viewer.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 pb-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] opacity-60 select-none">
                        <span className="w-8 h-[2px] bg-slate-300" />
                        {isMobile && s.mobileCartOverlay && previewView === 'page' ? 'Phones show the product card on the video' : `Live ${device} preview`}
                        <span className="w-8 h-[2px] bg-slate-300" />
                    </div>
                </main>
            </div>

            {toast && <Toast toast={toast} onClose={closeToast} />}
        </div>
    );
}
