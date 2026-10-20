import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Crown,
    ExternalLink,
    LayoutGrid,
    Loader2,
    MessageSquarePlus,
    Monitor,
    Power,
    RefreshCw,
    Save,
    ShoppingBag,
    Smartphone,
    Sparkles,
    Store,
    X,
    Zap,
} from 'lucide-react';
import BuyNowButton from './components/BuyNowButton.jsx';
import Preview, { PreviewHint } from './components/Preview.jsx';
import {
    ANIMATIONS,
    COLOR_PRESETS,
    DEFAULT_SETTINGS,
    HOVER_EFFECTS,
    ICONS,
    POSITIONS,
    PRO_KEYS,
    TEMPLATES,
} from './options.js';
import PerformanceCard from '../../shared/PerformanceCard.jsx';

const PRICING_URL = 'https://wisemattic.com/wisecampaign/pricing';
const FEATURE_REQUEST_URL = 'https://wisecampaign.canny.io/feature-requests';
const DISPLAY_LOCATIONS = ['single_product', 'shop_page'];

const apiBase = () => window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/';
const apiHeaders = (json = false) => {
    const nonce = window.wiseModuleData?.nonce;
    return {
        ...(json ? { 'Content-Type': 'application/json' } : {}),
        ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
    };
};

const ProPill = ({ small = false }) => (
    <span
        className={`${small ? 'text-[7px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'} font-black uppercase tracking-wider bg-amber-100 text-amber-600 rounded shrink-0`}
    >
        PRO
    </span>
);

const SectionTitle = ({ children, pro = false, aside = null }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
            <h3 className="m-0 text-sm font-black text-[#0F172A] tracking-tight">{children}</h3>
            {pro && (
                <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded shadow-sm" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                    PRO
                </span>
            )}
        </div>
        {aside}
    </div>
);

const FieldLabel = ({ children }) => (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{children}</label>
);

const Toggle = ({ on, onClick, label }) => (
    <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onClick}
        className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${on ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'}`}
    >
        <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${on ? 'right-1' : 'left-1'}`} />
    </button>
);

const ColorRow = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between p-2 border border-solid border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
        <span className="text-xs font-bold text-slate-600">{label}</span>
        <div className="flex items-center gap-3">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="text-[10px] font-mono text-slate-400 bg-transparent border-none shadow-none w-16 outline-none p-0 focus:text-slate-900 uppercase"
                aria-label={`${label} hex value`}
            />
            <div className="relative cursor-pointer">
                <div className="w-6 h-6 rounded-md border border-solid border-slate-200 shadow-sm" style={{ backgroundColor: value }} />
                <input
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    aria-label={`${label} color picker`}
                />
            </div>
        </div>
    </div>
);

const OptionCard = ({ selected, locked, onClick, children, className = '' }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`py-2 px-2.5 text-xs font-bold rounded-lg border border-solid transition-all flex items-center justify-between text-left cursor-pointer ${
            selected
                ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm font-black'
                : `border-slate-200 bg-white text-slate-600 ${locked ? 'hover:border-amber-300' : 'hover:border-slate-300'}`
        } ${className}`}
    >
        {children}
    </button>
);

// Tiny drawing of the cart row for each placement: grey = Add to Cart, colored = Buy Now.
const PlacementDiagram = ({ id, color }) => {
    const qty = <span className="w-2 h-2 rounded-[2px] border border-solid border-slate-300 shrink-0" />;
    const atc = (grow = false) => <span className={`h-2 rounded-[2px] bg-slate-400 ${grow ? 'flex-1' : 'w-5'}`} />;
    const bn = (grow = false) => <span className={`h-2 rounded-[2px] ${grow ? 'flex-1' : 'w-5'}`} style={{ backgroundColor: color }} />;

    let rows;
    switch (id) {
        case 'before_add_to_cart':
            rows = <div className="flex items-center gap-1">{qty}{bn()}{atc()}</div>;
            break;
        case 'side_by_side':
            rows = <div className="flex items-center gap-1 w-full">{qty}{atc(true)}{bn(true)}</div>;
            break;
        case 'below_add_to_cart':
            rows = (
                <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-1">{qty}{atc()}</div>
                    {bn(true)}
                </div>
            );
            break;
        case 'replace_add_to_cart':
            rows = <div className="flex items-center gap-1">{qty}{bn()}</div>;
            break;
        default:
            rows = <div className="flex items-center gap-1">{qty}{atc()}{bn()}</div>;
    }

    return <div className="w-[68px] h-9 shrink-0 rounded-md bg-slate-50 border border-solid border-slate-100 flex items-center justify-center px-1.5">{rows}</div>;
};

const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    const isError = toast.type === 'error';
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100000] wdc-slide-up">
            <div className="bg-[#0F172A] text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center gap-3 border border-solid border-white/10">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isError ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                </div>
                <div>
                    <p className="m-0 text-xs font-black tracking-tight uppercase opacity-50 leading-none mb-0.5">{isError ? 'Error' : 'Success'}</p>
                    <p className="m-0 text-sm font-bold tracking-tight">{toast.message}</p>
                </div>
                <button type="button" onClick={onClose} className="ml-2 text-white/30 hover:text-white transition-colors" aria-label="Close">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default function App() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(DEFAULT_SETTINGS));
    const [pages, setPages] = useState([]);
    const [icons, setIcons] = useState({});
    const [isPro, setIsPro] = useState(!!window.wiseModuleData?.pro?.isActive);
    const [status, setStatus] = useState('loading'); // loading | ready | error
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [device, setDevice] = useState('desktop');
    const [activeTab, setActiveTab] = useState('design');
    const [previewPage, setPreviewPage] = useState('product');
    const [proModalReason, setProModalReason] = useState(null);

    const closeToast = useCallback(() => setToast(null), []);
    const isDirty = status === 'ready' && JSON.stringify(settings) !== savedSnapshot;
    const isEnabled = settings.dc_enabled === '1';

    const loadSettings = useCallback(async () => {
        setStatus('loading');
        try {
            // Some hosts cache REST responses; always ask the server for fresh settings and license status.
            const res = await fetch(`${apiBase()}direct-checkout`, { headers: apiHeaders(), cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || 'Could not load settings.');
            }
            const loaded = { ...DEFAULT_SETTINGS, ...data.settings };
            setSettings(loaded);
            setSavedSnapshot(JSON.stringify(loaded));
            setPages(data.pages || []);
            setIcons(data.icons || {});
            setIsPro(!!data.isPro);
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

    const handleSave = async (toSave = settings, successMessage = 'Direct Checkout settings saved!') => {
        setIsSaving(true);
        try {
            const res = await fetch(`${apiBase()}direct-checkout`, {
                method: 'POST',
                headers: apiHeaders(true),
                body: JSON.stringify(toSave),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data?.message || 'Could not save settings. Please try again.');
            }
            const saved = { ...DEFAULT_SETTINGS, ...data.settings };
            setSettings(saved);
            setSavedSnapshot(JSON.stringify(saved));
            setToast({ type: 'success', message: successMessage });
            return true;
        } catch (e) {
            setToast({ type: 'error', message: e.message || 'Could not save settings. Please try again.' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

    // Opens the upgrade dialog and returns true when the option needs PRO.
    const requirePro = (needsPro, reason) => {
        if (needsPro && !isPro) {
            setProModalReason(reason);
            return true;
        }
        return false;
    };

    const toggleEnabled = async () => {
        const previous = settings;
        const next = { ...settings, dc_enabled: isEnabled ? '0' : '1' };
        setSettings(next);
        const ok = await handleSave(next, next.dc_enabled === '1' ? 'Direct Checkout is now on.' : 'Direct Checkout is now off.');
        if (!ok) {
            setSettings(previous);
        }
    };

    const toggleLocation = (location) => {
        const current = settings.dc_display_on || [];
        const next = current.includes(location) ? current.filter((l) => l !== location) : [...current, location];
        // Keep a fixed order so toggling back and forth doesn't count as a change
        update('dc_display_on', DISPLAY_LOCATIONS.filter((l) => next.includes(l)));
    };

    // What the storefront actually shows: PRO options fall back to defaults without a license.
    const effective = useMemo(() => {
        if (isPro) {
            return settings;
        }
        const out = { ...settings };
        PRO_KEYS.forEach((key) => {
            out[key] = DEFAULT_SETTINGS[key];
        });
        return out;
    }, [settings, isPro]);

    const redirectIsKnown = ['checkout', 'cart', 'custom'].includes(settings.dc_redirect_to) || pages.some((p) => p.url === settings.dc_redirect_to);

    if (status !== 'ready') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-32px)] bg-[#F8FAFC] text-slate-500 gap-4">
                {status === 'loading' ? (
                    <>
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                        <span className="text-sm font-bold">Loading Direct Checkout…</span>
                    </>
                ) : (
                    <>
                        <AlertCircle size={28} className="text-rose-500" />
                        <span className="text-sm font-bold">Could not load the Direct Checkout settings.</span>
                        <button
                            type="button"
                            onClick={loadSettings}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold"
                        >
                            <RefreshCw size={14} /> Try Again
                        </button>
                    </>
                )}
            </div>
        );
    }

    const sampleButton = { ...effective, dc_button_icon: 'none' };

    return (
        <div className="flex flex-col h-[calc(100vh-32px)] bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {/* Pro Upgrade Modal */}
            {proModalReason && (
                <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/60 backdrop-blur-md wdc-fade-in p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden p-8 flex flex-col items-center text-center border border-solid border-slate-100">
                        <div className="w-16 h-16 rounded-2xl text-white flex items-center justify-center mb-6 shadow-lg shadow-amber-200" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                            <Crown size={32} />
                        </div>
                        <h2 className="m-0 text-2xl font-black text-[#0F172A] tracking-tight mb-2">Unlock Pro Feature</h2>
                        <p className="m-0 text-slate-500 text-sm font-medium leading-relaxed mb-8">{proModalReason}</p>
                        <div className="flex gap-3 w-full">
                            <button
                                type="button"
                                onClick={() => setProModalReason(null)}
                                className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all active:scale-95 border border-solid border-slate-200/60"
                            >
                                Cancel
                            </button>
                            <a
                                href={PRICING_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setProModalReason(null)}
                                className="flex-1 px-5 py-3 font-bold text-sm rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center justify-center gap-2 no-underline"
                                style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
                            >
                                <span className="font-bold whitespace-nowrap" style={{ color: '#FFFFFF' }}>Upgrade Now</span>
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
                        <Zap size={14} />
                        Direct Checkout
                    </div>
                    {isPro && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-solid border-emerald-100">
                            <CheckCircle2 size={12} /> Pro Active
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
                    {!isPro && (
                        <a
                            href={PRICING_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold no-underline shadow-sm"
                            style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}
                        >
                            <Crown size={14} /> Upgrade to PRO
                        </a>
                    )}
                    {isDirty && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Unsaved changes
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => handleSave()}
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
                            disabled={isSaving}
                            className="w-full flex items-center justify-between bg-white p-4 rounded-xl border border-solid border-slate-200 shadow-sm hover:border-blue-200 transition-all cursor-pointer text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Power size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-700 uppercase tracking-tight">Direct Checkout</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                        {isEnabled ? <span className="text-emerald-500">Currently Active</span> : 'Feature Disabled'}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-all relative ${isEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? 'right-1' : 'left-1'}`} />
                            </div>
                        </button>
                        <PerformanceCard module="checkout" />
                    </div>

                    <div className={`flex flex-col flex-1 transition-all duration-300 ${!isEnabled ? 'opacity-40 grayscale pointer-events-none select-none blur-[1px]' : ''}`}>
                        {/* Navigation Tabs */}
                        <div className="px-4 pt-4 pb-2">
                            <div className="flex bg-slate-100 p-1 rounded-md">
                                {['design', 'animation', 'settings'].map((tab) => (
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
                            {activeTab === 'design' && (
                                <div className="space-y-6 wdc-fade-in">
                                    {/* Button Text */}
                                    <section className="space-y-2">
                                        <SectionTitle>Button Text</SectionTitle>
                                        <input
                                            type="text"
                                            value={settings.dc_button_text}
                                            onChange={(e) => update('dc_button_text', e.target.value)}
                                            placeholder="e.g. Buy Now, Instant Checkout"
                                            className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                        />
                                    </section>

                                    {/* Colors */}
                                    <section className="space-y-2">
                                        <SectionTitle>Button Colors</SectionTitle>
                                        <ColorRow label="Background" value={settings.dc_button_color} onChange={(v) => update('dc_button_color', v)} />
                                        <ColorRow label="Text & Icon" value={settings.dc_button_text_color} onChange={(v) => update('dc_button_text_color', v)} />
                                        <div className="p-2 border border-solid border-slate-200 rounded-md">
                                            <span className="block text-xs font-bold text-slate-600 mb-2">Presets</span>
                                            <div className="flex gap-2">
                                                {COLOR_PRESETS.map((preset) => {
                                                    const active = settings.dc_button_color.toLowerCase() === preset.bg && settings.dc_button_text_color.toLowerCase() === preset.text;
                                                    return (
                                                        <button
                                                            key={preset.bg}
                                                            type="button"
                                                            onClick={() => setSettings((prev) => ({ ...prev, dc_button_color: preset.bg, dc_button_text_color: preset.text }))}
                                                            aria-label={`Use ${preset.bg} with ${preset.text} text`}
                                                            className={`w-8 h-8 rounded-lg border-2 border-solid border-white shadow-sm hover:scale-110 transition-transform flex items-center justify-center text-[11px] font-black ${active ? 'ring-2 ring-blue-600' : 'ring-1 ring-black/5'}`}
                                                            style={{ backgroundColor: preset.bg, color: preset.text }}
                                                        >
                                                            Aa
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Templates */}
                                    <section className="space-y-2">
                                        <SectionTitle pro={!isPro}>Button Template</SectionTitle>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TEMPLATES.map((tpl) => {
                                                const locked = tpl.pro && !isPro;
                                                const selected = effective.dc_button_template === tpl.id;
                                                return (
                                                    <button
                                                        key={tpl.id}
                                                        type="button"
                                                        aria-pressed={selected}
                                                        onClick={() => {
                                                            if (requirePro(tpl.pro, 'Button templates require a wiseCampaign Pro license.')) return;
                                                            update('dc_button_template', tpl.id);
                                                        }}
                                                        className={`p-2 rounded-lg border border-solid transition-all text-left ${
                                                            selected ? 'border-blue-600 bg-blue-50/50 shadow-sm' : `border-slate-200 bg-white ${locked ? 'hover:border-amber-300' : 'hover:border-slate-300'}`
                                                        }`}
                                                    >
                                                        <div className={`h-14 rounded-md bg-slate-50 flex items-center justify-center overflow-hidden px-2 ${locked ? 'opacity-70' : ''}`}>
                                                            <BuyNowButton button={sampleButton} icons={icons} template={tpl.id} animation="none" hover="none" className="wdc-sample-btn" />
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1.5">
                                                            <span className={`text-xs font-bold ${selected ? 'text-blue-600' : 'text-slate-600'}`}>{tpl.label}</span>
                                                            {locked && <ProPill small />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {/* Icon */}
                                    <section className="space-y-2">
                                        <SectionTitle pro={!isPro}>Button Icon</SectionTitle>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {ICONS.map((icon) => {
                                                const locked = icon.id !== 'none' && !isPro;
                                                return (
                                                    <OptionCard
                                                        key={icon.id}
                                                        selected={effective.dc_button_icon === icon.id}
                                                        locked={locked}
                                                        className="!flex-col !justify-center gap-1 py-2.5 relative"
                                                        onClick={() => {
                                                            if (requirePro(locked, 'Custom button icons require a wiseCampaign Pro license.')) return;
                                                            update('dc_button_icon', icon.id);
                                                        }}
                                                    >
                                                        {icon.id === 'none' ? (
                                                            <X size={16} className="text-slate-400" />
                                                        ) : (
                                                            <span className="w-4 h-4 inline-flex [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: icons[icon.id] || '' }} />
                                                        )}
                                                        <span className="text-[11px]">{icon.label}</span>
                                                        {locked && <span className="absolute top-1 right-1"><ProPill small /></span>}
                                                    </OptionCard>
                                                );
                                            })}
                                        </div>
                                        <div className={`space-y-1.5 pt-1 ${effective.dc_button_icon === 'none' ? 'opacity-40 pointer-events-none' : ''}`}>
                                            <FieldLabel>Icon Position</FieldLabel>
                                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-solid border-slate-200/50">
                                                {['left', 'right'].map((pos) => (
                                                    <button
                                                        key={pos}
                                                        type="button"
                                                        onClick={() => update('dc_icon_position', pos)}
                                                        className={`flex-1 py-1 text-[10px] font-black rounded-md transition-all capitalize ${settings.dc_icon_position === pos ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {pos}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'animation' && (
                                <div className="space-y-6 wdc-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle pro={!isPro}>Attention Animation</SectionTitle>
                                        <p className="m-0 text-[11px] text-slate-400 font-medium leading-relaxed">Loops on the button to catch the shopper's eye.</p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {ANIMATIONS.map((anim) => {
                                                const locked = anim.id !== 'none' && !isPro;
                                                return (
                                                    <OptionCard
                                                        key={anim.id}
                                                        selected={effective.dc_button_animation === anim.id}
                                                        locked={locked}
                                                        onClick={() => {
                                                            if (requirePro(locked, 'Attention animations require a wiseCampaign Pro license.')) return;
                                                            update('dc_button_animation', anim.id);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            <span className="text-sm">{anim.icon}</span>
                                                            <span className="truncate">{anim.label}</span>
                                                        </div>
                                                        {locked && <ProPill small />}
                                                    </OptionCard>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    <div className="h-[1px] bg-slate-100" />

                                    <section className="space-y-2">
                                        <SectionTitle pro={!isPro}>Hover Effect</SectionTitle>
                                        <p className="m-0 text-[11px] text-slate-400 font-medium leading-relaxed">Plays when the shopper points at the button. The attention animation stops while it plays.</p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {HOVER_EFFECTS.map((effect) => {
                                                const locked = effect.id !== 'none' && !isPro;
                                                return (
                                                    <OptionCard
                                                        key={effect.id}
                                                        selected={effective.dc_button_hover === effect.id}
                                                        locked={locked}
                                                        onClick={() => {
                                                            if (requirePro(locked, 'Hover effects require a wiseCampaign Pro license.')) return;
                                                            update('dc_button_hover', effect.id);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            <span className="text-sm">{effect.icon}</span>
                                                            <span className="truncate">{effect.label}</span>
                                                        </div>
                                                        {locked && <ProPill small />}
                                                    </OptionCard>
                                                );
                                            })}
                                        </div>
                                        {effective.dc_button_hover === 'icon_pop' && effective.dc_button_icon === 'none' && (
                                            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-solid border-amber-200 text-amber-700 text-[11px] font-bold">
                                                <AlertCircle size={14} className="shrink-0 mt-px" />
                                                Icon Pop needs a button icon. Pick one in the Design tab.
                                            </div>
                                        )}
                                    </section>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-6 wdc-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle>Show Buy Now On</SectionTitle>
                                        {[
                                            { id: 'single_product', label: 'Single product pages', desc: 'Next to the Add to Cart button', icon: <ShoppingBag size={14} /> },
                                            { id: 'shop_page', label: 'Shop & archive pages', desc: 'Category and tag listings, simple products only', icon: <LayoutGrid size={14} /> },
                                        ].map((loc) => (
                                            <div key={loc.id} className="flex items-center justify-between gap-3 p-3 border border-solid border-slate-200 rounded-lg">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">{loc.icon}</div>
                                                    <div>
                                                        <div className="text-xs font-black text-[#0F172A]">{loc.label}</div>
                                                        <div className="text-[10px] font-medium text-slate-400">{loc.desc}</div>
                                                    </div>
                                                </div>
                                                <Toggle on={settings.dc_display_on.includes(loc.id)} onClick={() => toggleLocation(loc.id)} label={loc.label} />
                                            </div>
                                        ))}
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle pro={!isPro}>Product Page Placement</SectionTitle>
                                        <div className="space-y-1.5">
                                            {POSITIONS.map((pos) => {
                                                const locked = pos.pro && !isPro;
                                                const selected = effective.dc_button_position === pos.id;
                                                return (
                                                    <OptionCard
                                                        key={pos.id}
                                                        selected={selected}
                                                        locked={locked}
                                                        className="w-full gap-3 !justify-start"
                                                        onClick={() => {
                                                            if (requirePro(locked, 'Advanced button placement requires a wiseCampaign Pro license.')) return;
                                                            update('dc_button_position', pos.id);
                                                        }}
                                                    >
                                                        <PlacementDiagram id={pos.id} color={settings.dc_button_color} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs">{pos.label}</div>
                                                            <div className={`text-[10px] font-medium ${selected ? 'text-blue-500' : 'text-slate-400'}`}>{pos.desc}</div>
                                                        </div>
                                                        {locked && <ProPill small />}
                                                    </OptionCard>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>After Click, Send Shoppers To</SectionTitle>
                                        <select
                                            value={settings.dc_redirect_to}
                                            onChange={(e) => update('dc_redirect_to', e.target.value)}
                                            className="w-full !max-w-none bg-white !border !border-solid !border-slate-200 !rounded-xl !px-4 !py-2.5 !text-sm font-bold !shadow-sm focus:!border-blue-500"
                                        >
                                            <optgroup label="WooCommerce">
                                                <option value="checkout">Checkout Page (Recommended)</option>
                                                <option value="cart">Cart Page</option>
                                            </optgroup>
                                            {pages.length > 0 && (
                                                <optgroup label="Your Pages">
                                                    {pages.map((page) => (
                                                        <option key={page.id} value={page.url}>{page.title || `#${page.id}`}</option>
                                                    ))}
                                                </optgroup>
                                            )}
                                            <optgroup label="Other">
                                                <option value="custom">Custom URL</option>
                                                {!redirectIsKnown && <option value={settings.dc_redirect_to}>{settings.dc_redirect_to}</option>}
                                            </optgroup>
                                        </select>
                                        {settings.dc_redirect_to === 'custom' && (
                                            <input
                                                type="url"
                                                value={settings.dc_redirect_custom_url}
                                                onChange={(e) => update('dc_redirect_custom_url', e.target.value)}
                                                placeholder="https://example.com/special-checkout"
                                                className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm wdc-fade-in"
                                            />
                                        )}
                                        <p className="m-0 text-[11px] text-slate-400 font-medium leading-relaxed pl-1">
                                            The product is added to the cart first, then the shopper lands here.
                                        </p>
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
                                { id: 'product', label: 'Product Page', icon: <ShoppingBag size={14} /> },
                                { id: 'shop', label: 'Shop Page', icon: <Store size={14} /> },
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setPreviewPage(p.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${previewPage === p.id ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {p.icon}
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <PreviewHint hasHover={effective.dc_button_hover !== 'none'} />
                    </div>

                    <Preview
                        button={effective}
                        icons={icons}
                        device={device}
                        page={previewPage}
                        displayOn={settings.dc_display_on}
                        position={effective.dc_button_position}
                        enabled={isEnabled}
                        onEnable={toggleEnabled}
                    />

                    <div className="flex items-center justify-center gap-3 pb-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] opacity-60 select-none">
                        <span className="w-8 h-[2px] bg-slate-300" />
                        Live {device} preview of your {previewPage === 'shop' ? 'shop page' : 'product page'}
                        <span className="w-8 h-[2px] bg-slate-300" />
                    </div>
                </main>
            </div>

            {toast && <Toast toast={toast} onClose={closeToast} />}
        </div>
    );
}
