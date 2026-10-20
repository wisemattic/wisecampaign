import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    Bell,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Crown,
    ExternalLink,
    Image as ImageIconLucide,
    Loader2,
    MessageSquarePlus,
    Monitor,
    Pause,
    Play,
    Power,
    RefreshCw,
    RotateCcw,
    Save,
    Shuffle,
    Smartphone,
    Repeat,
    Users,
} from 'lucide-react';
import Preview from './components/Preview.jsx';
import { CornerSketch, ImageGallery, TemplateSketch } from './components/Pickers.jsx';
import {
    CheckList,
    ColorRow,
    ConfirmModal,
    FieldLabel,
    Hint,
    Notice,
    NumberRow,
    OptionCard,
    PRICING_URL,
    ProModal,
    ProPill,
    SectionTitle,
    SliderRow,
    TextArea,
    Toast,
    ToggleRow,
} from './components/ui.jsx';
import { FONTS, POSITIONS, PRODUCT_MODES, PRO_TEMPLATES, SOURCES, TEMPLATES, TEMPLATE_OVERRIDES, TEMPLATE_PRESETS } from './options.js';
import { buildPreviewItems, effectiveProductsMode, effectiveSource } from './preview.js';
import PerformanceCard from '../../shared/PerformanceCard.jsx';

const FEATURE_REQUEST_URL = 'https://wisecampaign.canny.io/feature-requests';

const apiBase = () => `${window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/'}sales-notification`;
const apiHeaders = (json = false) => {
    const nonce = window.wiseModuleData?.nonce;
    return {
        ...(json ? { 'Content-Type': 'application/json' } : {}),
        ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
    };
};

// On/off is saved on its own, so it never counts as an unsaved change.
const snapshot = (settings) => JSON.stringify({ ...settings, enabled: undefined });

export default function App() {
    const [data, setData] = useState(null);
    const [settings, setSettings] = useState(null);
    const [saved, setSaved] = useState('');
    const [customImages, setCustomImages] = useState([]);
    const [status, setStatus] = useState('loading'); // loading | ready | error
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [toast, setToast] = useState(null);
    const [device, setDevice] = useState('desktop');
    const [activeTab, setActiveTab] = useState('design');
    const [proModalReason, setProModalReason] = useState(null);
    const [confirmReset, setConfirmReset] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [popupVisible, setPopupVisible] = useState(true);

    const closeToast = useCallback(() => setToast(null), []);
    const isPro = !!data?.isPro;
    const hasWc = !!data?.hasWc;
    const isEnabled = settings?.enabled === '1';
    const isDirty = status === 'ready' && snapshot(settings) !== saved;

    const applyPayload = (payload) => {
        setData(payload);
        setSettings(payload.settings);
        setSaved(snapshot(payload.settings));
        setCustomImages(payload.customImages || []);
    };

    const loadSettings = useCallback(async () => {
        setStatus('loading');
        try {
            // Some hosts cache REST responses; always ask the server for fresh settings and license status.
            const res = await fetch(apiBase(), { headers: apiHeaders(), cache: 'no-store' });
            const payload = await res.json();
            if (!res.ok) {
                throw new Error(payload?.message || 'Could not load settings.');
            }
            applyPayload(payload);
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

    // What the storefront will really use: PRO-only choices fall back for free users.
    const look = useMemo(() => {
        if (!settings) return null;
        return {
            ...settings,
            template: !isPro && PRO_TEMPLATES.includes(settings.template) ? 'template_1' : settings.template,
            hideBranding: isPro && settings.hide_branding === '1',
        };
    }, [settings, isPro]);

    const preview = useMemo(() => {
        if (!settings || !data) return { items: [], reason: '' };
        return buildPreviewItems(settings, { ...data, customImages });
    }, [settings, data, customImages]);

    const itemCount = preview.items.length;
    const currentIndex = itemCount ? previewIndex % itemCount : 0;

    // Play cycles the popups with the real display and delay times.
    useEffect(() => {
        if (!playing || !itemCount) return undefined;
        const display = Math.max(1, settings.display_time) * 1000;
        const delay = Math.max(1, settings.delay_time) * 1000;
        let timer;
        const cycle = () => {
            setPopupVisible(true);
            timer = setTimeout(() => {
                setPopupVisible(false);
                timer = setTimeout(() => {
                    setPreviewIndex((i) => i + 1);
                    cycle();
                }, delay);
            }, display);
        };
        cycle();
        return () => {
            clearTimeout(timer);
            setPopupVisible(true);
        };
    }, [playing, itemCount, settings?.display_time, settings?.delay_time]);

    const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

    // Opens the upgrade dialog and returns true when the option needs PRO.
    const requirePro = (needsPro, reason) => {
        if (needsPro && !isPro) {
            setProModalReason(reason);
            return true;
        }
        return false;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(apiBase(), {
                method: 'POST',
                headers: apiHeaders(true),
                body: JSON.stringify(settings),
            });
            const payload = await res.json();
            if (!res.ok || !payload.success) {
                throw new Error(payload?.message || 'Could not save settings. Please try again.');
            }
            setSettings(payload.settings);
            setSaved(snapshot(payload.settings));
            setToast({ type: 'success', message: 'Sales Notification settings saved!' });
        } catch (e) {
            setToast({ type: 'error', message: e.message || 'Could not save settings. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleEnabled = async () => {
        const next = isEnabled ? '0' : '1';
        setSettings((prev) => ({ ...prev, enabled: next }));
        try {
            const res = await fetch(`${apiBase()}/status`, {
                method: 'POST',
                headers: apiHeaders(true),
                body: JSON.stringify({ enabled: next === '1' }),
            });
            const payload = await res.json();
            if (!res.ok || !payload.success) {
                throw new Error(payload?.message || 'Could not change the status.');
            }
            setToast({ type: 'success', message: next === '1' ? 'Sales Notification is now on.' : 'Sales Notification is now off.' });
        } catch (e) {
            setSettings((prev) => ({ ...prev, enabled: isEnabled ? '1' : '0' }));
            setToast({ type: 'error', message: e.message || 'Could not change the status.' });
        }
    };

    const handleReset = async () => {
        setIsResetting(true);
        try {
            const res = await fetch(`${apiBase()}/reset`, { method: 'POST', headers: apiHeaders(true), body: '{}' });
            const payload = await res.json();
            if (!res.ok || !payload.settings) {
                throw new Error(payload?.message || 'Could not reset the settings.');
            }
            applyPayload(payload);
            setPreviewIndex(0);
            setToast({ type: 'success', message: 'Settings reset to defaults.' });
        } catch (e) {
            setToast({ type: 'error', message: e.message || 'Could not reset the settings.' });
        } finally {
            setIsResetting(false);
            setConfirmReset(false);
        }
    };

    const selectTemplate = (tpl) => {
        if (requirePro(tpl.pro, 'Premium popup templates require a wiseCampaign Pro license.')) return;
        setSettings((prev) => ({ ...prev, template: tpl.id, ...TEMPLATE_PRESETS[tpl.id] }));
    };

    const updateImages = (images) => {
        setCustomImages(images);
        update('virtual_custom_images', images.map((img) => img.id));
    };

    if (status !== 'ready') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-32px)] bg-[#F8FAFC] text-slate-500 gap-4">
                {status === 'loading' ? (
                    <>
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                        <span className="text-sm font-bold">Loading Sales Notification…</span>
                    </>
                ) : (
                    <>
                        <AlertCircle size={28} className="text-rose-500" />
                        <span className="text-sm font-bold">Could not load the Sales Notification settings.</span>
                        <button type="button" onClick={loadSettings} className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold">
                            <RefreshCw size={14} /> Try Again
                        </button>
                    </>
                )}
            </div>
        );
    }

    const source = effectiveSource(settings, hasWc);
    const productsMode = effectiveProductsMode(settings, hasWc);
    const overridden = TEMPLATE_OVERRIDES[look.template] || [];
    const templateLabel = TEMPLATES.find((t) => t.id === look.template)?.label;

    return (
        <div className="flex flex-col h-[calc(100vh-32px)] bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {proModalReason && <ProModal reason={proModalReason} onClose={() => setProModalReason(null)} />}
            {confirmReset && (
                <ConfirmModal
                    title="Reset All Settings?"
                    message="Every Sales Notification setting goes back to its default value. This can't be undone."
                    confirmLabel="Reset Settings"
                    busy={isResetting}
                    onConfirm={handleReset}
                    onClose={() => setConfirmReset(false)}
                />
            )}

            {/* Top Header */}
            <header className="pt-3 pb-3 bg-white border-0 border-b border-solid border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 shrink-0">W</div>
                    <span className="font-bold text-lg tracking-tight text-[#0F172A]">WiseCampaign</span>
                    <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs font-bold text-blue-600">
                        <Bell size={14} />
                        Sales Notification
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
                                    <div className="text-sm font-black text-slate-700 uppercase tracking-tight">Sales Notification</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                        {isEnabled ? <span className="text-emerald-500">Currently Active</span> : 'Feature Disabled'}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-all relative ${isEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? 'right-1' : 'left-1'}`} />
                            </div>
                        </button>
                        <PerformanceCard module="socialproof" />
                    </div>

                    <div className={`flex flex-col flex-1 transition-all duration-300 ${!isEnabled ? 'opacity-40 grayscale pointer-events-none select-none blur-[1px]' : ''}`}>
                        {/* Navigation Tabs */}
                        <div className="px-4 pt-4 pb-2">
                            <div className="flex bg-slate-100 p-1 rounded-md">
                                {['design', 'content', 'settings'].map((tab) => (
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
                                <div className="space-y-6 wsn-fade-in">
                                    {/* Templates */}
                                    <section className="space-y-2">
                                        <SectionTitle>Popup Template</SectionTitle>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TEMPLATES.map((tpl) => {
                                                const locked = tpl.pro && !isPro;
                                                const selected = look.template === tpl.id;
                                                return (
                                                    <button
                                                        key={tpl.id}
                                                        type="button"
                                                        aria-pressed={selected}
                                                        onClick={() => selectTemplate(tpl)}
                                                        className={`p-2 rounded-lg border border-solid transition-all text-left ${
                                                            selected ? 'border-blue-600 bg-blue-50/50 shadow-sm' : `border-slate-200 bg-white ${locked ? 'hover:border-amber-300' : 'hover:border-slate-300'}`
                                                        }`}
                                                    >
                                                        <div className={`h-16 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden px-2 ${locked ? 'opacity-70' : ''}`}>
                                                            <TemplateSketch id={tpl.id} />
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1.5 gap-1">
                                                            <span className={`text-xs font-bold truncate ${selected ? 'text-blue-600' : 'text-slate-600'}`}>{tpl.label}</span>
                                                            {locked && <ProPill small />}
                                                        </div>
                                                        <div className="text-[10px] font-medium text-slate-400 truncate">{tpl.desc}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {/* Position */}
                                    <section className="space-y-2">
                                        <SectionTitle>Screen Position</SectionTitle>
                                        <div className="grid grid-cols-2 gap-2">
                                            {POSITIONS.map((pos) => (
                                                <OptionCard
                                                    key={pos.id}
                                                    selected={settings.position === pos.id}
                                                    onClick={() => update('position', pos.id)}
                                                    className="!flex-col !items-stretch gap-1.5"
                                                >
                                                    <CornerSketch id={pos.id} active={settings.position === pos.id} />
                                                    <span className="text-[11px] text-center">{pos.label}</span>
                                                </OptionCard>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Style */}
                                    <section className="space-y-2">
                                        <SectionTitle>Popup Style</SectionTitle>
                                        <ColorRow label="Background" value={settings.background_color} onChange={(v) => update('background_color', v)} disabled={overridden.includes('background_color')} />
                                        <ColorRow label="Border Color" value={settings.border_color} onChange={(v) => update('border_color', v)} disabled={overridden.includes('border_color')} />
                                        <SliderRow label="Border Width" value={settings.border_width} min={0} max={20} onChange={(v) => update('border_width', v)} disabled={overridden.includes('border_width')} />
                                        <SliderRow label="Corner Radius" value={settings.border_radius} min={0} max={100} onChange={(v) => update('border_radius', v)} disabled={overridden.includes('border_radius')} />
                                        <SliderRow label="Image Radius" value={settings.image_radius} min={0} max={50} onChange={(v) => update('image_radius', v)} disabled={overridden.includes('image_radius')} />
                                        {overridden.length > 0 && (
                                            <Hint>The {templateLabel} template sets its own {overridden.includes('background_color') ? 'colors, border and corners' : overridden.includes('border_color') ? 'border and corners' : 'corners'}, so those controls are off.</Hint>
                                        )}
                                    </section>

                                    {/* Font */}
                                    <section className="space-y-2">
                                        <SectionTitle>Font</SectionTitle>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {FONTS.map((font) => (
                                                <OptionCard key={font} selected={settings.font_family === font} onClick={() => update('font_family', font)} className="!justify-center py-2.5">
                                                    <span className="text-sm" style={{ fontFamily: `'${font}', sans-serif` }}>{font}</span>
                                                </OptionCard>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Branding */}
                                    <section className="space-y-2">
                                        <SectionTitle>Branding</SectionTitle>
                                        <ToggleRow
                                            title='Hide "by wiseCampaign"'
                                            desc="Remove the credit link from every popup"
                                            on={isPro && settings.hide_branding === '1'}
                                            pro
                                            locked={!isPro}
                                            onClick={() => {
                                                if (requirePro(true, 'Removing the "by wiseCampaign" credit requires a wiseCampaign Pro license.')) return;
                                                update('hide_branding', settings.hide_branding === '1' ? '0' : '1');
                                            }}
                                        />
                                    </section>
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="space-y-6 wsn-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle>Order Source</SectionTitle>
                                        <div className="space-y-1.5">
                                            {SOURCES.map((src) => {
                                                const needsWc = src.wc && !hasWc;
                                                const locked = src.pro && !isPro;
                                                return (
                                                    <OptionCard
                                                        key={src.id}
                                                        selected={source === src.id}
                                                        locked={locked}
                                                        disabled={needsWc}
                                                        className="w-full"
                                                        onClick={() => {
                                                            if (requirePro(src.pro, 'Simulated orders require a wiseCampaign Pro license.')) return;
                                                            update('source', src.id);
                                                        }}
                                                    >
                                                        <div className="min-w-0">
                                                            <div className="text-xs">{src.label}</div>
                                                            <div className={`text-[10px] font-medium ${source === src.id ? 'text-blue-500' : 'text-slate-400'}`}>{src.desc}</div>
                                                        </div>
                                                        {needsWc && <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 shrink-0">Needs WooCommerce</span>}
                                                        {!needsWc && locked && <ProPill small />}
                                                    </OptionCard>
                                                );
                                            })}
                                        </div>
                                        {!hasWc && <Hint>WooCommerce isn't active, so notifications are built from simulated orders.</Hint>}
                                    </section>

                                    {source === 'selected_orders' && (
                                        <section className="space-y-2 wsn-fade-in">
                                            <SectionTitle>Orders to Show</SectionTitle>
                                            <CheckList
                                                items={data.orders.map((o) => ({ id: o.id, label: o.label, meta: o.status === 'completed' ? '' : o.status }))}
                                                selected={settings.selected_orders}
                                                onChange={(ids) => update('selected_orders', ids)}
                                                emptyText="No orders found yet."
                                                searchPlaceholder="Search orders…"
                                            />
                                            <Hint>Only completed orders are shown on your site.</Hint>
                                        </section>
                                    )}

                                    {source === 'virtual_orders' && (
                                        <>
                                            <section className="space-y-2 wsn-fade-in">
                                                <SectionTitle>Buyers</SectionTitle>
                                                <FieldLabel htmlFor="wsn-names">Buyer Names</FieldLabel>
                                                <TextArea id="wsn-names" value={settings.virtual_names} onChange={(v) => update('virtual_names', v)} placeholder="Sarah M., Alex K., David R." />
                                                <Hint>Separate names with commas or new lines.</Hint>
                                                <div className="pt-2" />
                                                <FieldLabel htmlFor="wsn-locations">Locations</FieldLabel>
                                                <TextArea id="wsn-locations" rows={4} value={settings.virtual_locations} onChange={(v) => update('virtual_locations', v)} placeholder={'New York, USA\nLondon, UK'} />
                                                <Hint>One city and country per line.</Hint>
                                            </section>

                                            <section className="space-y-2 wsn-fade-in">
                                                <SectionTitle>Products to Promote</SectionTitle>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {PRODUCT_MODES.map((mode) => (
                                                        <OptionCard
                                                            key={mode.id}
                                                            selected={productsMode === mode.id}
                                                            disabled={mode.wc && !hasWc}
                                                            className="!flex-col !items-start gap-0.5"
                                                            onClick={() => update('virtual_products_mode', mode.id)}
                                                        >
                                                            <span className="text-[11px]">{mode.label}</span>
                                                            <span className={`text-[9px] font-medium leading-tight ${productsMode === mode.id ? 'text-blue-500' : 'text-slate-400'}`}>{mode.desc}</span>
                                                        </OptionCard>
                                                    ))}
                                                </div>
                                                {productsMode === 'selected_products' && (
                                                    <CheckList
                                                        items={data.products.map((p) => ({ id: p.id, label: p.name, meta: p.price }))}
                                                        selected={settings.virtual_selected_products}
                                                        onChange={(ids) => update('virtual_selected_products', ids)}
                                                        emptyText="No WooCommerce products found."
                                                        searchPlaceholder="Search products…"
                                                    />
                                                )}
                                                {productsMode === 'custom_products' && (
                                                    <>
                                                        <TextArea
                                                            rows={4}
                                                            value={settings.virtual_custom_products}
                                                            onChange={(v) => update('virtual_custom_products', v)}
                                                            placeholder={'Pro Plan | https://example.com/pricing\nOnline Course\nConsultation Call | https://example.com/book'}
                                                        />
                                                        <Hint>One product per line. Add " | " and a link to make the popup clickable.</Hint>
                                                    </>
                                                )}
                                            </section>

                                            <section className="space-y-2 wsn-fade-in">
                                                <SectionTitle>Notification Image</SectionTitle>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    <OptionCard
                                                        selected={settings.virtual_image_type === 'product'}
                                                        onClick={() => update('virtual_image_type', 'product')}
                                                        className="!flex-col !items-start gap-1.5"
                                                    >
                                                        <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
                                                            <ImageIconLucide size={16} />
                                                        </span>
                                                        <span className="text-[11px]">Product Photo</span>
                                                        <span className={`text-[9px] font-medium leading-tight ${settings.virtual_image_type === 'product' ? 'text-blue-500' : 'text-slate-400'}`}>Product images, or your own photos and logos</span>
                                                    </OptionCard>
                                                    <OptionCard
                                                        selected={settings.virtual_image_type === 'buyer'}
                                                        onClick={() => update('virtual_image_type', 'buyer')}
                                                        className="!flex-col !items-start gap-1.5"
                                                    >
                                                        <span className="flex -space-x-2">
                                                            {data.avatars.slice(0, 3).map((src) => (
                                                                <img key={src} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-solid border-white bg-slate-100" />
                                                            ))}
                                                        </span>
                                                        <span className="text-[11px]">Buyer Avatar</span>
                                                        <span className={`text-[9px] font-medium leading-tight ${settings.virtual_image_type === 'buyer' ? 'text-blue-500' : 'text-slate-400'}`}>Friendly cartoon avatar for each buyer</span>
                                                    </OptionCard>
                                                </div>
                                                {settings.virtual_image_type === 'product' && (
                                                    <div className="space-y-2 pt-1 wsn-fade-in">
                                                        <FieldLabel>Your Photos & Logos (optional)</FieldLabel>
                                                        <ImageGallery images={customImages} onChange={updateImages} />
                                                        <Hint>
                                                            {hasWc
                                                                ? "Drag to reorder. Leave empty to use each product's WooCommerce image."
                                                                : 'Drag to reorder. Leave empty to show buyer avatars.'}
                                                        </Hint>
                                                    </div>
                                                )}
                                            </section>
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-6 wsn-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle>Where to Show</SectionTitle>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {[
                                                { id: 'all_pages', label: 'Every Page' },
                                                { id: 'specific_pages', label: 'Specific Pages' },
                                            ].map((opt) => (
                                                <OptionCard key={opt.id} selected={settings.visibility === opt.id} onClick={() => update('visibility', opt.id)} className="!justify-center py-2.5">
                                                    {opt.label}
                                                </OptionCard>
                                            ))}
                                        </div>
                                        {settings.visibility === 'specific_pages' && (
                                            <div className="space-y-2 wsn-fade-in">
                                                <CheckList
                                                    items={data.pages.map((p) => ({ id: p.id, label: p.title || `#${p.id}` }))}
                                                    selected={settings.specific_pages}
                                                    onChange={(ids) => update('specific_pages', ids)}
                                                    emptyText="No published pages found."
                                                    searchPlaceholder="Search pages…"
                                                />
                                                {!settings.specific_pages.length && <Notice>Pick at least one page, or the popups won't show anywhere.</Notice>}
                                            </div>
                                        )}
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Timing</SectionTitle>
                                        <NumberRow label="Show each popup for" value={settings.display_time} min={1} max={300} unit="sec" onChange={(v) => update('display_time', v)} />
                                        <NumberRow label="Wait between popups" value={settings.delay_time} min={1} max={300} unit="sec" onChange={(v) => update('delay_time', v)} />
                                        <Hint>The first popup appears 3 seconds after the page loads.</Hint>
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Playback</SectionTitle>
                                        <ToggleRow
                                            title="Loop"
                                            desc="Start again after the last popup"
                                            icon={<Repeat size={14} />}
                                            on={settings.loop === '1'}
                                            onClick={() => update('loop', settings.loop === '1' ? '0' : '1')}
                                        />
                                        <ToggleRow
                                            title="Random order"
                                            desc="Shuffle the popups on every page load"
                                            icon={<Shuffle size={14} />}
                                            on={settings.random_show === '1'}
                                            onClick={() => update('random_show', settings.random_show === '1' ? '0' : '1')}
                                        />
                                    </section>

                                    <section className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => setConfirmReset(true)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-solid border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 text-xs font-bold transition-colors"
                                        >
                                            <RotateCcw size={14} /> Reset to Defaults
                                        </button>
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
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white p-1 rounded-md border border-solid border-slate-200 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setPreviewIndex((i) => (i - 1 + itemCount) % Math.max(1, itemCount))}
                                    disabled={itemCount < 2}
                                    className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                    aria-label="Previous notification"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="px-2 text-xs font-bold text-slate-600 tabular-nums">
                                    {itemCount ? `${currentIndex + 1} / ${itemCount}` : '0 / 0'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPreviewIndex((i) => i + 1)}
                                    disabled={itemCount < 2}
                                    className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                    aria-label="Next notification"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPlaying((p) => !p)}
                                disabled={!itemCount}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold border border-solid shadow-sm transition-all disabled:opacity-40 ${playing ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'}`}
                            >
                                {playing ? <Pause size={13} /> : <Play size={13} />}
                                {playing ? 'Pause' : 'Play'}
                            </button>
                        </div>
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <Users size={13} />
                            {source === 'virtual_orders' ? 'Simulated orders' : source === 'selected_orders' ? 'Selected orders' : 'Recent orders'}
                        </span>
                    </div>

                    <Preview
                        look={look}
                        item={preview.items[currentIndex] || null}
                        visible={popupVisible}
                        device={device}
                        position={settings.position}
                        emptyReason={preview.reason}
                        enabled={isEnabled}
                        onEnable={toggleEnabled}
                    />

                    <div className="flex items-center justify-center gap-3 pb-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] opacity-60 select-none">
                        <span className="w-8 h-[2px] bg-slate-300" />
                        {playing ? `Playing with your timing: ${settings.display_time}s on, ${settings.delay_time}s off` : `Live ${device} preview`}
                        <span className="w-8 h-[2px] bg-slate-300" />
                    </div>
                </main>
            </div>

            {toast && <Toast toast={toast} onClose={closeToast} />}
        </div>
    );
}
