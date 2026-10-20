import React, { useCallback, useEffect, useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    FileText,
    Image as ImageIconLucide,
    Loader2,
    MessageSquarePlus,
    Minus,
    Monitor,
    Power,
    RefreshCw,
    Save,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Tag,
    Trash2,
    Zap,
    ArrowRightLeft,
    BadgePercent,
    Gift,
    PanelRightOpen,
    Receipt,
    Store,
} from 'lucide-react';
import Preview from './components/Preview.jsx';
import { ColorRow, FieldLabel, Hint, Notice, NumberRow, OptionCard, SectionTitle, SliderRow, TextArea, Toast, ToggleRow } from './components/ui.jsx';
import PerformanceCard from '../../shared/PerformanceCard.jsx';

const FEATURE_REQUEST_URL = 'https://wisecampaign.canny.io/feature-requests';

const apiBase = () => `${window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/'}wisecart`;
const apiHeaders = (json = false) => {
    const nonce = window.wiseModuleData?.nonce;
    return {
        ...(json ? { 'Content-Type': 'application/json' } : {}),
        ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
    };
};

// On/off is saved on its own, so it never counts as an unsaved change.
const snapshot = (settings) => JSON.stringify({ ...settings, wc_enable_wisecart: undefined });

// Ids must match WiseCart::sanitize_settings().
const POSITIONS = [
    { id: 'top_left', label: 'Top Left' },
    { id: 'top_right', label: 'Top Right' },
    { id: 'middle_left', label: 'Middle Left' },
    { id: 'middle_right', label: 'Middle Right' },
    { id: 'bottom_left', label: 'Bottom Left' },
    { id: 'bottom_right', label: 'Bottom Right' },
];

const BUTTON_STYLES = [
    { id: 'icon_only', label: 'Icon' },
    { id: 'text_only', label: 'Text' },
    { id: 'icon_and_text', label: 'Icon + Text' },
];

const PREVIEW_VIEWS = [
    { id: 'button', label: 'Cart Button' },
    { id: 'cart', label: 'Cart Drawer' },
    { id: 'empty', label: 'Empty Cart' },
    { id: 'success', label: 'Order Success' },
];

// Mini screen with the cart button drawn where it will sit.
const PositionSketch = ({ id, active }) => {
    const [v, h] = id.split('_');
    const vertical = v === 'middle' ? { top: '50%', transform: 'translateY(-50%)' } : { [v]: 4 };
    return (
        <div className={`relative w-full h-9 rounded-md border border-solid ${active ? 'border-blue-200 bg-white' : 'border-slate-200 bg-slate-50'}`}>
            <span className={`absolute w-3 h-3 rounded-full ${active ? 'bg-blue-600' : 'bg-slate-300'}`} style={{ ...vertical, [h]: 4 }} />
        </div>
    );
};

const StyleSketch = ({ id, active }) => (
    <span className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[10px] font-black ${active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'}`}>
        {id !== 'text_only' && <ShoppingBag size={12} />}
        {id !== 'icon_only' && 'Cart'}
    </span>
);

export default function App() {
    const [data, setData] = useState(null);
    const [settings, setSettings] = useState(null);
    const [saved, setSaved] = useState('');
    const [status, setStatus] = useState('loading'); // loading | ready | error
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [device, setDevice] = useState('desktop');
    const [activeTab, setActiveTab] = useState('design');
    const [view, setView] = useState('cart');

    const closeToast = useCallback(() => setToast(null), []);
    const isEnabled = settings?.wc_enable_wisecart === 'yes';
    const isDirty = status === 'ready' && snapshot(settings) !== saved;

    const loadSettings = useCallback(async () => {
        setStatus('loading');
        try {
            // Some hosts cache REST responses; always ask the server for fresh settings.
            const res = await fetch(apiBase(), { headers: apiHeaders(), cache: 'no-store' });
            const payload = await res.json();
            if (!res.ok) {
                throw new Error(payload?.message || 'Could not load settings.');
            }
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
    const flip = (key) => update(key, settings[key] === 'yes' ? 'no' : 'yes');
    const isOn = (key) => settings[key] === 'yes';

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(apiBase(), { method: 'POST', headers: apiHeaders(true), body: JSON.stringify(settings) });
            const payload = await res.json();
            if (!res.ok || !payload.success) {
                throw new Error(payload?.message || 'Could not save settings. Please try again.');
            }
            setSettings(payload.settings);
            setSaved(snapshot(payload.settings));
            setToast({ type: 'success', message: 'wiseCart settings saved!' });
        } catch (e) {
            setToast({ type: 'error', message: e.message || 'Could not save settings. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleEnabled = async () => {
        const next = isEnabled ? 'no' : 'yes';
        update('wc_enable_wisecart', next);
        try {
            const res = await fetch(`${apiBase()}/status`, { method: 'POST', headers: apiHeaders(true), body: JSON.stringify({ enabled: next === 'yes' }) });
            const payload = await res.json();
            if (!res.ok || !payload.success) {
                throw new Error(payload?.message || 'Could not change the status.');
            }
            setToast({ type: 'success', message: next === 'yes' ? 'wiseCart is now on.' : 'wiseCart is now off.' });
        } catch (e) {
            update('wc_enable_wisecart', isEnabled ? 'yes' : 'no');
            setToast({ type: 'error', message: e.message || 'Could not change the status.' });
        }
    };

    if (status !== 'ready') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-32px)] bg-[#F8FAFC] text-slate-500 gap-4">
                {status === 'loading' ? (
                    <>
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                        <span className="text-sm font-bold">Loading wiseCart…</span>
                    </>
                ) : (
                    <>
                        <AlertCircle size={28} className="text-rose-500" />
                        <span className="text-sm font-bold">Could not load the wiseCart settings.</span>
                        <button type="button" onClick={loadSettings} className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold">
                            <RefreshCw size={14} /> Try Again
                        </button>
                    </>
                )}
            </div>
        );
    }

    const hidden = settings.wc_icon_position === 'hidden';

    return (
        <div className="flex flex-col h-[calc(100vh-32px)] bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {/* Top Header */}
            <header className="pt-3 pb-3 bg-white border-0 border-b border-solid border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <img
                        src={`${window.wiseModuleData?.pluginUrl || '/wp-content/plugins/wisecampaign/'}images/fe/wisecampaign-icon.png`}
                        alt=""
                        className="w-9 h-9 rounded-xl object-contain shrink-0"
                    />
                    <span className="font-bold text-lg tracking-tight text-[#0F172A]">WiseCampaign</span>
                    <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs font-bold text-blue-600">
                        <ShoppingCart size={14} />
                        wiseCart
                    </div>
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
                                    <div className="text-sm font-black text-slate-700 uppercase tracking-tight">wiseCart</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                        {isEnabled ? <span className="text-emerald-500">Currently Active</span> : 'Feature Disabled'}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-all relative ${isEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? 'right-1' : 'left-1'}`} />
                            </div>
                        </button>
                        <PerformanceCard module="wisecart" />
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
                                <div className="space-y-6 wct-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle>Cart Button Position</SectionTitle>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {POSITIONS.map((pos) => (
                                                <OptionCard
                                                    key={pos.id}
                                                    selected={settings.wc_icon_position === pos.id}
                                                    onClick={() => update('wc_icon_position', pos.id)}
                                                    className="!flex-col !items-stretch gap-1.5"
                                                >
                                                    <PositionSketch id={pos.id} active={settings.wc_icon_position === pos.id} />
                                                    <span className="text-[11px] text-center">{pos.label}</span>
                                                </OptionCard>
                                            ))}
                                        </div>
                                        <OptionCard selected={hidden} onClick={() => update('wc_icon_position', 'hidden')} className="w-full !justify-center gap-1.5">
                                            <Minus size={13} /> Hide the cart button
                                        </OptionCard>
                                        {hidden && <Notice>With the button hidden, wiseCart also leaves the cart drawer off your pages.</Notice>}
                                    </section>

                                    <section className={`space-y-2 ${hidden ? 'opacity-40 pointer-events-none' : ''}`}>
                                        <SectionTitle>Button Style</SectionTitle>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {BUTTON_STYLES.map((st) => (
                                                <OptionCard
                                                    key={st.id}
                                                    selected={settings.wc_button_style === st.id}
                                                    onClick={() => update('wc_button_style', st.id)}
                                                    className="!flex-col !items-center gap-1.5 py-2.5"
                                                >
                                                    <StyleSketch id={st.id} active={settings.wc_button_style === st.id} />
                                                    <span className="text-[11px]">{st.label}</span>
                                                </OptionCard>
                                            ))}
                                        </div>
                                        {settings.wc_button_style !== 'icon_only' && (
                                            <div className="space-y-1.5 pt-1 wct-fade-in">
                                                <FieldLabel htmlFor="wct-button-text">Button Text</FieldLabel>
                                                <input
                                                    id="wct-button-text"
                                                    type="text"
                                                    value={settings.wc_button_text}
                                                    onChange={(e) => update('wc_button_text', e.target.value)}
                                                    className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </section>

                                    <section className={`space-y-2 ${hidden ? 'opacity-40 pointer-events-none' : ''}`}>
                                        <SectionTitle>Button Colors</SectionTitle>
                                        <ColorRow label="Background" value={settings.wc_button_background} onChange={(v) => update('wc_button_background', v)} />
                                        <ColorRow label="Icon & Text" value={settings.wc_icon_color} onChange={(v) => update('wc_icon_color', v)} />
                                        <ColorRow label="Count Badge" value={settings.wc_count_background} onChange={(v) => update('wc_count_background', v)} />
                                        <ColorRow label="Count Number" value={settings.wc_count_text_color} onChange={(v) => update('wc_count_text_color', v)} />
                                        <SliderRow label="Corner Radius" value={parseInt(settings.wc_border_radius, 10) || 0} min={0} max={50} onChange={(v) => update('wc_border_radius', String(v))} />
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Drawer Buttons</SectionTitle>
                                        <ColorRow label="Checkout Background" value={settings.wc_checkout_btn_background} onChange={(v) => update('wc_checkout_btn_background', v)} />
                                        <ColorRow label="Checkout Text" value={settings.wc_checkout_text_color} onChange={(v) => update('wc_checkout_text_color', v)} />
                                        <ColorRow label="Continue Shopping Background" value={settings.wc_continue_btn_background} onChange={(v) => update('wc_continue_btn_background', v)} />
                                        <ColorRow label="Continue Shopping Text" value={settings.wc_continue_btn_text_color} onChange={(v) => update('wc_continue_btn_text_color', v)} />
                                    </section>
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="space-y-6 wct-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle>Rewards & Savings</SectionTitle>
                                        <ToggleRow
                                            title="Reward progress bar"
                                            desc="Shows how much more unlocks the next reward"
                                            icon={<Gift size={14} />}
                                            on={isOn('wc_show_progress_bar')}
                                            onClick={() => {
                                                flip('wc_show_progress_bar');
                                                setView('cart');
                                            }}
                                        />
                                        {isOn('wc_show_progress_bar') && (
                                            <Hint>
                                                {data.goals.length
                                                    ? `Goals: ${data.goals.map((g) => g.label).join(', ')}.`
                                                    : 'No goals yet, so the preview shows an example. Set a minimum amount on WooCommerce Free shipping, or add a Total Spend discount in Discount Manager (PRO).'}
                                            </Hint>
                                        )}
                                        <ToggleRow
                                            title="Discounts & total"
                                            desc="Coupons, Discount Manager savings and the total"
                                            icon={<BadgePercent size={14} />}
                                            on={isOn('wc_show_discounts')}
                                            onClick={() => {
                                                flip('wc_show_discounts');
                                                setView('cart');
                                            }}
                                        />
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Cart Items</SectionTitle>
                                        <ToggleRow title="Product images" icon={<ImageIconLucide size={14} />} on={isOn('wc_show_product_images')} onClick={() => flip('wc_show_product_images')} />
                                        <ToggleRow title="Product prices" icon={<Tag size={14} />} on={isOn('wc_show_product_prices')} onClick={() => flip('wc_show_product_prices')} />
                                        <ToggleRow title="Quantity pickers" icon={<ArrowRightLeft size={14} />} on={isOn('wc_show_quantity_pickers')} onClick={() => flip('wc_show_quantity_pickers')} />
                                        <ToggleRow title="Remove buttons" icon={<Trash2 size={14} />} on={isOn('wc_show_delete_buttons')} onClick={() => flip('wc_show_delete_buttons')} />
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Cart Footer</SectionTitle>
                                        <ToggleRow title="Coupon field" icon={<Receipt size={14} />} on={isOn('wc_show_coupons')} onClick={() => flip('wc_show_coupons')} />
                                        {isOn('wc_show_coupons') && !data.couponsEnabled && (
                                            <Notice>Coupons are turned off in WooCommerce (Settings → General), so the coupon field stays hidden.</Notice>
                                        )}
                                        <ToggleRow title="Order subtotal" icon={<FileText size={14} />} on={isOn('wc_show_order_subtotal')} onClick={() => flip('wc_show_order_subtotal')} />
                                        <ToggleRow title="Continue Shopping button" icon={<Store size={14} />} on={isOn('wc_show_keep_shopping')} onClick={() => flip('wc_show_keep_shopping')} />
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Order Success Message</SectionTitle>
                                        <ToggleRow
                                            title="Show success message"
                                            desc="Shown in the cart after an order is placed"
                                            icon={<CheckCircle2 size={14} />}
                                            on={isOn('wc_success_message_enable')}
                                            onClick={() => {
                                                flip('wc_success_message_enable');
                                                setView('success');
                                            }}
                                        />
                                        {isOn('wc_success_message_enable') && (
                                            <div className="space-y-2 pt-1 wct-fade-in" onFocus={() => setView('success')}>
                                                <FieldLabel htmlFor="wct-success-title">Title</FieldLabel>
                                                <input
                                                    id="wct-success-title"
                                                    type="text"
                                                    value={settings.wc_success_message_title}
                                                    onChange={(e) => update('wc_success_message_title', e.target.value)}
                                                    className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                                                />
                                                <FieldLabel htmlFor="wct-success-text">Message</FieldLabel>
                                                <TextArea id="wct-success-text" value={settings.wc_success_message_text} onChange={(v) => update('wc_success_message_text', v)} />
                                                <NumberRow
                                                    label="Go to the order page after"
                                                    value={parseInt(settings.wc_success_redirect_delay, 10) || 1}
                                                    min={1}
                                                    max={120}
                                                    unit="sec"
                                                    onChange={(v) => update('wc_success_redirect_delay', String(v))}
                                                />
                                            </div>
                                        )}
                                    </section>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-6 wct-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle>When a Product Is Added</SectionTitle>
                                        <ToggleRow title="Open the cart" desc="Slide the cart open after Add to Cart" icon={<PanelRightOpen size={14} />} on={isOn('wc_auto_open_cart')} onClick={() => flip('wc_auto_open_cart')} />
                                        <ToggleRow title="Go straight to checkout" desc="Skip the cart and show the checkout" icon={<Zap size={14} />} on={isOn('wc_direct_checkout')} onClick={() => flip('wc_direct_checkout')} />
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Replace WooCommerce Pages</SectionTitle>
                                        <ToggleRow title="Cart page" desc="Open wiseCart instead of the cart page" icon={<ShoppingCart size={14} />} on={isOn('wc_replace_cart_page')} onClick={() => flip('wc_replace_cart_page')} />
                                        <ToggleRow title="Checkout page" desc="Show the checkout inside wiseCart" icon={<Receipt size={14} />} on={isOn('wc_replace_checkout_page')} onClick={() => flip('wc_replace_checkout_page')} />
                                        <Hint>Shoppers who open these pages are sent to your shop with wiseCart open.</Hint>
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
                            {PREVIEW_VIEWS.map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => setView(v.id)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${view === v.id ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">Click the cart button or the backdrop to try it</span>
                    </div>

                    {view === 'success' && !isOn('wc_success_message_enable') && (
                        <div className="px-8 pt-2">
                            <Notice>The success message is off, so shoppers go straight to the order page after checkout.</Notice>
                        </div>
                    )}

                    <Preview
                        settings={settings}
                        sample={data.sample}
                        goals={data.goals}
                        currency={data.currency}
                        couponsEnabled={data.couponsEnabled}
                        cssUrl={data.cssUrl}
                        device={device}
                        view={view === 'success' && !isOn('wc_success_message_enable') ? 'button' : view}
                        onViewChange={setView}
                        enabled={isEnabled}
                        onEnable={toggleEnabled}
                    />

                    <div className="flex items-center justify-center gap-3 pb-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] opacity-60 select-none">
                        <span className="w-8 h-[2px] bg-slate-300" />
                        Live {device} preview
                        <span className="w-8 h-[2px] bg-slate-300" />
                    </div>
                </main>
            </div>

            {toast && <Toast toast={toast} onClose={closeToast} />}
        </div>
    );
}
