import React, { useCallback, useEffect, useState } from 'react';
import {
    AlertCircle,
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    CheckCircle2,
    Copy,
    Crown,
    ExternalLink,
    Filter,
    Hash,
    LayoutList,
    Loader2,
    MessageSquarePlus,
    Monitor,
    Pencil,
    Plus,
    Power,
    RefreshCw,
    Save,
    Search,
    ShoppingCart,
    Smartphone,
    Sparkles,
    Table2,
    Trash2,
} from 'lucide-react';
import ProductTable from './ProductTable.jsx';
import { CheckList, ColorRow, FieldLabel, Hint, Notice, NumberRow, OptionCard, SectionTitle, SliderRow, TextArea, Toast, Toggle, ToggleRow } from './components/ui.jsx';
import { BULK_OPTIONS, COLUMNS, SORT_OPTIONS, SOURCES, TEMPLATES, newTable } from './options.js';
import PerformanceCard from '../../shared/PerformanceCard.jsx';

const FEATURE_REQUEST_URL = 'https://wisecampaign.canny.io/feature-requests';
const PRICING_URL = 'https://wisemattic.com/wisecampaign/pricing';

const api = (path) => `${window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/'}product-table/${path}`;
const apiHeaders = (json = false) => {
    const nonce = window.wiseModuleData?.nonce;
    return {
        ...(json ? { 'Content-Type': 'application/json' } : {}),
        ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
    };
};

// On/off is saved on its own, so it never counts as an unsaved change.
const snapshot = (settings) => JSON.stringify({ ...settings, isActive: undefined });

const shortcodeFor = (table) => `[product_table id="${table.id}"]`;

// navigator.clipboard only exists on https and localhost, so plain http sites copy through a hidden textarea
const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            // Blocked by the browser; try the old way below
        }
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '0';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch (e) {
        copied = false;
    }
    document.body.removeChild(field);
    return copied;
};

const sourceSummary = (table, store) => {
    const names = (ids, list) => ids.map((id) => list.find((x) => x.id === id)?.name).filter(Boolean);
    switch (table.source) {
        case 'categories': return `Categories: ${names(table.categories, store.categories).join(', ') || 'none picked'}`;
        case 'tags': return `Tags: ${names(table.tags, store.tags).join(', ') || 'none picked'}`;
        case 'products': return `${table.products.length} chosen product${table.products.length === 1 ? '' : 's'}`;
        default: return 'All products';
    }
};

// What a table still needs picked before it can show any products ('category', 'tag', 'product'), or null
const missingPick = (table, store) => {
    const known = (ids, list) => ids.some((id) => list.some((x) => x.id === id));
    if (table.source === 'categories' && !known(table.categories, store.categories)) return 'category';
    if (table.source === 'tags' && !known(table.tags, store.tags)) return 'tag';
    if (table.source === 'products' && !table.products.length) return 'product';
    return null;
};

// Dark table colors (such as Midnight) are meant for dark themes, so the preview page turns dark with them
const isDarkColor = (hex) => {
    let h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (!/^[0-9a-f]{6}$/i.test(h)) return false;
    const n = parseInt(h, 16);
    return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 110;
};

// Small drawing of a template for the template cards
const TemplateSketch = ({ design }) => (
    <div className="w-full rounded-md overflow-hidden border border-solid" style={{ borderColor: design.border, background: design.rowBg }}>
        <div className="h-3.5 flex items-center gap-1 px-1.5" style={{ background: design.headerBg }}>
            <span className="h-1 w-6 rounded-full opacity-70" style={{ background: design.headerText }} />
            <span className="h-1 w-4 rounded-full opacity-70 ml-auto" style={{ background: design.headerText }} />
        </div>
        {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 flex items-center gap-1.5 px-1.5 border-0 border-t border-solid" style={{ borderColor: design.border, background: i % 2 && design.striped ? design.rowAltBg : design.rowBg }}>
                <span className="w-2.5 h-2.5 rounded-sm opacity-30" style={{ background: design.text }} />
                <span className="h-1 w-8 rounded-full" style={{ background: design.link }} />
                <span className="h-2 w-5 ml-auto" style={{ background: design.accent, borderRadius: design.radius === 'pill' ? 99 : design.radius === 'square' ? 0 : 2 }} />
            </div>
        ))}
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
    const [activeTab, setActiveTab] = useState('tables');
    const [editingId, setEditingId] = useState(null);
    const [previewId, setPreviewId] = useState(null);
    const [previewProducts, setPreviewProducts] = useState([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [showProModal, setShowProModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const closeToast = useCallback(() => setToast(null), []);
    const isEnabled = !!settings?.isActive;
    const licenseActive = !!data?.licenseActive;
    const isDirty = status === 'ready' && snapshot(settings) !== saved;

    const loadSettings = useCallback(async () => {
        setStatus('loading');
        try {
            // Some hosts cache REST responses; always ask the server for fresh settings and license status.
            const res = await fetch(api('settings'), { headers: apiHeaders(), cache: 'no-store' });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message);
            setData(payload);
            setSettings(payload.settings);
            setSaved(snapshot(payload.settings));
            setPreviewId(payload.settings.tables[0]?.id ?? null);
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

    const previewTable = settings?.tables.find((t) => t.id === (editingId ?? previewId)) || settings?.tables[0];

    // The preview asks the server for the products of the table as it is being edited
    const previewKey = previewTable ? JSON.stringify({ ...previewTable, name: '', columns: [], showQty: 0, bulkCart: '', showSearch: 0, showFilters: 0, perPage: 0 }) : '';
    useEffect(() => {
        if (!previewTable) return undefined;
        setPreviewLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(api('preview'), { method: 'POST', headers: apiHeaders(true), body: JSON.stringify(previewTable) });
                const payload = await res.json();
                setPreviewProducts(res.ok ? payload.products : []);
            } catch (e) {
                setPreviewProducts([]);
            } finally {
                setPreviewLoading(false);
            }
        }, 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewKey]);

    const setDesign = (key, value) => setSettings((s) => ({ ...s, template: 'custom', design: { ...s.design, [key]: value } }));
    const setLabel = (key, value) => setSettings((s) => ({ ...s, labels: { ...s.labels, [key]: value } }));
    const updateTable = (id, changes) => setSettings((s) => ({ ...s, tables: s.tables.map((t) => (t.id === id ? { ...t, ...changes } : t)) }));

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(api('settings'), { method: 'POST', headers: apiHeaders(true), body: JSON.stringify(settings) });
            const payload = await res.json();
            if (!res.ok || !payload.success) throw new Error(payload?.message || 'Could not save settings. Please try again.');
            setSettings(payload.settings);
            setSaved(snapshot(payload.settings));
            setToast({ type: 'success', message: 'Product Table settings saved!' });
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
        const next = !isEnabled;
        setSettings((s) => ({ ...s, isActive: next }));
        try {
            const res = await fetch(api('status'), { method: 'POST', headers: apiHeaders(true), body: JSON.stringify({ enabled: next }) });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message || 'Could not change the status.');
            setToast({ type: 'success', message: next ? 'Product Table is now on.' : 'Product Table is now off.' });
        } catch (e) {
            setSettings((s) => ({ ...s, isActive: !next }));
            setToast({ type: 'error', message: e.message });
        }
    };

    const addTable = () => {
        const id = Math.max(0, ...settings.tables.map((t) => t.id)) + 1;
        setSettings((s) => ({ ...s, tables: [...s.tables, newTable(id)] }));
        setEditingId(id);
        setPreviewId(id);
    };

    const deleteTable = (id) => {
        setSettings((s) => ({ ...s, tables: s.tables.filter((t) => t.id !== id) }));
        if (previewId === id) setPreviewId(settings.tables.find((t) => t.id !== id)?.id ?? null);
        setConfirmDelete(null);
    };

    const copyShortcode = async (table) => {
        if (await copyText(shortcodeFor(table))) {
            setToast({ type: 'success', message: `Copied ${shortcodeFor(table)}` });
        } else {
            setToast({ type: 'error', message: 'Could not copy. Select the shortcode and press Ctrl+C (⌘C on Mac).' });
        }
    };

    // The preview only pretends to add to the cart
    const previewAddToCart = useCallback(() => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 450)), []);

    if (status !== 'ready') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-32px)] bg-[#F8FAFC] text-slate-500 gap-4">
                {status === 'loading' ? (
                    <>
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                        <span className="text-sm font-bold">Loading Product Table…</span>
                    </>
                ) : (
                    <>
                        <AlertCircle size={28} className="text-rose-500" />
                        <span className="text-sm font-bold">Could not load the Product Table settings.</span>
                        <button type="button" onClick={loadSettings} className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold">
                            <RefreshCw size={14} /> Try Again
                        </button>
                    </>
                )}
            </div>
        );
    }

    const s = settings;
    const store = data.store;
    const editing = s.tables.find((t) => t.id === editingId);
    const isMobile = device === 'mobile';
    const darkPage = isDarkColor(s.design.rowBg);

    const tableEditor = (t) => (
        <div className="space-y-6 wpt-fade-in">
            <button type="button" onClick={() => setEditingId(null)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">
                <ArrowLeft size={14} /> All tables
            </button>

            <section className="space-y-2">
                <FieldLabel htmlFor="wpt-name">Table Name</FieldLabel>
                <input
                    id="wpt-name"
                    type="text"
                    value={t.name}
                    onChange={(e) => updateTable(t.id, { name: e.target.value })}
                    className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                />
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-solid border-slate-100">
                    <code className="!bg-transparent !p-0 select-all text-[11px] font-bold text-slate-600">{shortcodeFor(t)}</code>
                    <button type="button" onClick={() => copyShortcode(t)} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700">
                        <Copy size={12} /> Copy
                    </button>
                </div>
                <Hint>Paste the shortcode into any page or post.</Hint>
            </section>

            <section className="space-y-2">
                <SectionTitle>Products</SectionTitle>
                <div className="grid grid-cols-2 gap-1.5">
                    {SOURCES.map((src) => (
                        <OptionCard key={src.id} selected={t.source === src.id} onClick={() => updateTable(t.id, { source: src.id })} className="!justify-center py-2.5">
                            {src.label}
                        </OptionCard>
                    ))}
                </div>
                {t.source === 'categories' && (
                    <CheckList
                        items={store.categories.map((c) => ({ id: c.id, label: c.name, meta: String(c.count) }))}
                        selected={t.categories}
                        onChange={(ids) => updateTable(t.id, { categories: ids })}
                        emptyText="Your store has no product categories yet, so this table can't show any products. Choose another source."
                        searchPlaceholder="Search categories…"
                    />
                )}
                {t.source === 'tags' && (
                    <CheckList
                        items={store.tags.map((c) => ({ id: c.id, label: c.name, meta: String(c.count) }))}
                        selected={t.tags}
                        onChange={(ids) => updateTable(t.id, { tags: ids })}
                        emptyText="Your store has no product tags yet, so this table can't show any products. Choose another source."
                        searchPlaceholder="Search tags…"
                    />
                )}
                {t.source === 'products' && (
                    <CheckList
                        items={store.products.map((p) => ({ id: p.id, label: p.name }))}
                        selected={t.products}
                        onChange={(ids) => updateTable(t.id, { products: ids })}
                        emptyText="Your store has no published products yet, so this table can't show any."
                        searchPlaceholder="Search products…"
                    />
                )}
                {missingPick(t, store) && store[{ category: 'categories', tag: 'tags', product: 'products' }[missingPick(t, store)]].length > 0 && (
                    <Notice>Pick at least one {missingPick(t, store)}. Until you do, this table shows no products.</Notice>
                )}
                <ToggleRow title="Only products in stock" icon={<Filter size={14} />} on={t.inStockOnly} onClick={() => updateTable(t.id, { inStockOnly: !t.inStockOnly })} />
                <NumberRow label="Most products to load" value={t.limit} min={1} max={500} unit="" onChange={(v) => updateTable(t.id, { limit: v })} />
            </section>

            <section className="space-y-2">
                <SectionTitle>Columns</SectionTitle>
                <div className="border border-solid border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                    {[...t.columns, ...COLUMNS.map((c) => c.id).filter((id) => !t.columns.includes(id))].map((id) => {
                        const on = t.columns.includes(id);
                        const index = t.columns.indexOf(id);
                        const move = (dir) => {
                            const cols = [...t.columns];
                            [cols[index], cols[index + dir]] = [cols[index + dir], cols[index]];
                            updateTable(t.id, { columns: cols });
                        };
                        return (
                            <div key={id} className={`flex items-center gap-2 px-3 py-2 border-0 border-t border-solid border-slate-100 first:border-t-0 ${on ? 'bg-white' : 'bg-slate-50/70'}`}>
                                <Toggle
                                    on={on}
                                    label={COLUMNS.find((c) => c.id === id).label}
                                    onClick={() => updateTable(t.id, { columns: on ? t.columns.filter((c) => c !== id) : [...t.columns, id] })}
                                    disabled={on && t.columns.length === 1}
                                />
                                <span className={`flex-1 text-xs font-bold ${on ? 'text-slate-700' : 'text-slate-400'}`}>{COLUMNS.find((c) => c.id === id).label}</span>
                                {on && (
                                    <span className="flex gap-0.5">
                                        <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(-1)} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">
                                            <ArrowUp size={12} />
                                        </button>
                                        <button type="button" aria-label="Move down" disabled={index === t.columns.length - 1} onClick={() => move(1)} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">
                                            <ArrowDown size={12} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className={`space-y-2 ${t.columns.includes('buy') ? '' : 'opacity-40 pointer-events-none'}`}>
                <SectionTitle>Buying</SectionTitle>
                <ToggleRow title="Quantity box" desc="Next to each Add to cart button" icon={<Hash size={14} />} on={t.showQty} onClick={() => updateTable(t.id, { showQty: !t.showQty })} />
                <FieldLabel>Add Selected Button</FieldLabel>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-solid border-slate-200/50">
                    {BULK_OPTIONS.map((o) => (
                        <button
                            key={o.id}
                            type="button"
                            onClick={() => updateTable(t.id, { bulkCart: o.id })}
                            className={`flex-1 py-1.5 text-[11px] font-black rounded-md transition-all ${t.bulkCart === o.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
                <Hint>Shoppers tick products and add them all with one click.</Hint>
                {!t.columns.includes('buy') && <Hint>Turn on the Buy column to use these.</Hint>}
            </section>

            <section className="space-y-2">
                <SectionTitle>Search, Filters &amp; Order</SectionTitle>
                <ToggleRow title="Search box" icon={<Search size={14} />} on={t.showSearch} onClick={() => updateTable(t.id, { showSearch: !t.showSearch })} />
                <ToggleRow title="Filters" desc="Category, plus up to 3 attributes such as color or size" icon={<Filter size={14} />} on={t.showFilters} onClick={() => updateTable(t.id, { showFilters: !t.showFilters })} />
                <FieldLabel htmlFor="wpt-sort">Default Order</FieldLabel>
                <select
                    id="wpt-sort"
                    value={t.sortBy}
                    onChange={(e) => updateTable(t.id, { sortBy: e.target.value })}
                    className="w-full !max-w-none bg-white !border !border-solid !border-slate-200 !rounded-xl !pl-4 !pr-8 !py-2.5 !text-sm font-bold !shadow-sm"
                >
                    {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <NumberRow label="Products per page" value={t.perPage} min={5} max={100} unit="" onChange={(v) => updateTable(t.id, { perPage: v })} />
            </section>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-32px)] bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {showProModal && (
                <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/60 backdrop-blur-md wpt-fade-in p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 flex flex-col items-center text-center border border-solid border-slate-100">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-200" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
                            <Crown size={32} />
                        </div>
                        <h2 className="m-0 text-2xl font-black text-[#0F172A] tracking-tight mb-2">Unlock Pro Feature</h2>
                        <p className="m-0 text-slate-500 text-sm font-medium leading-relaxed mb-8">Product Table needs wiseCampaign Pro with an active license.</p>
                        <div className="flex gap-3 w-full">
                            <button type="button" onClick={() => setShowProModal(false)} className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl border border-solid border-slate-200/60">
                                Cancel
                            </button>
                            <a
                                href={window.wiseModuleData?.pro?.isInstalled ? window.wiseModuleData?.pro?.licensePageUrl : PRICING_URL}
                                target={window.wiseModuleData?.pro?.isInstalled ? undefined : '_blank'}
                                rel="noopener noreferrer"
                                className="flex-1 px-5 py-3 font-bold text-sm rounded-xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 no-underline"
                                style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
                            >
                                <span className="font-bold whitespace-nowrap" style={{ color: '#FFFFFF' }}>{window.wiseModuleData?.pro?.isInstalled ? 'Activate License' : 'Upgrade Now'}</span>
                                <Sparkles size={16} style={{ color: '#FFFFFF' }} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/60 backdrop-blur-md wpt-fade-in p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6"><Trash2 size={30} /></div>
                        <h2 className="m-0 text-2xl font-black text-[#0F172A] tracking-tight mb-2">Delete “{confirmDelete.name}”?</h2>
                        <p className="m-0 text-slate-500 text-sm font-medium leading-relaxed mb-8">
                            Pages using <code>{shortcodeFor(confirmDelete)}</code> will show nothing once you save.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button type="button" onClick={() => setConfirmDelete(null)} className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl">Cancel</button>
                            <button type="button" onClick={() => deleteTable(confirmDelete.id)} className="flex-1 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-200">Delete Table</button>
                        </div>
                    </div>
                </div>
            )}

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
                        <Table2 size={14} />
                        Product Table
                    </div>
                    {licenseActive ? (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-solid border-emerald-100">
                            <CheckCircle2 size={12} /> Pro Active
                        </span>
                    ) : (
                        <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>Pro Feature</span>
                    )}
                </div>

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
                                    <div className="text-sm font-black text-slate-700 uppercase tracking-tight">Product Table</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                        {isEnabled ? <span className="text-emerald-500">Currently Active</span> : licenseActive ? 'Feature Disabled' : 'Needs Pro License'}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-all relative ${isEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? 'right-1' : 'left-1'}`} />
                            </div>
                        </button>
                        <PerformanceCard module="producttable" />
                    </div>

                    <div className={`flex flex-col flex-1 transition-all duration-300 ${!isEnabled ? 'opacity-40 grayscale pointer-events-none select-none blur-[1px]' : ''}`}>
                        <div className="px-4 pt-4 pb-2">
                            <div className="flex bg-slate-100 p-1 rounded-md">
                                {['tables', 'design', 'settings'].map((tab) => (
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
                            {activeTab === 'tables' && (editing ? tableEditor(editing) : (
                                <div className="space-y-3 wpt-fade-in">
                                    <button
                                        type="button"
                                        onClick={addTable}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-100 transition-all"
                                    >
                                        <Plus size={16} /> Add New Table
                                    </button>
                                    {s.tables.map((t) => (
                                        <div
                                            key={t.id}
                                            className={`p-3.5 rounded-xl border border-solid transition-all ${previewId === t.id ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                        >
                                            <button type="button" onClick={() => setPreviewId(t.id)} className="w-full text-left">
                                                <div className="flex items-center gap-2">
                                                    <LayoutList size={14} className="text-blue-600 shrink-0" />
                                                    <span className="text-sm font-black text-[#0F172A] truncate">{t.name}</span>
                                                </div>
                                                {missingPick(t, store) ? (
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-1 truncate">
                                                        <AlertCircle size={12} className="shrink-0" />
                                                        {sourceSummary(t, store)} · shows no products
                                                    </div>
                                                ) : (
                                                    <div className="text-[11px] font-medium text-slate-400 mt-1 truncate">{sourceSummary(t, store)}</div>
                                                )}
                                            </button>
                                            <div className="flex items-center gap-2 mt-3">
                                                <button type="button" onClick={() => copyShortcode(t)} className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-solid border-slate-100 hover:border-slate-300 text-left" title="Copy shortcode">
                                                    <Copy size={12} className="text-slate-400 shrink-0" />
                                                    <code className="!bg-transparent !p-0 select-all text-[10px] font-bold text-slate-600 truncate">{shortcodeFor(t)}</code>
                                                </button>
                                                <button type="button" onClick={() => { setEditingId(t.id); setPreviewId(t.id); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-blue-600 hover:bg-blue-50">
                                                    <Pencil size={12} /> Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmDelete(t)}
                                                    disabled={s.tables.length === 1}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30"
                                                    aria-label={`Delete ${t.name}`}
                                                    title={s.tables.length === 1 ? 'Keep at least one table' : 'Delete'}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {activeTab === 'design' && (
                                <div className="space-y-6 wpt-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle>Templates</SectionTitle>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TEMPLATES.map((tpl) => (
                                                <button
                                                    key={tpl.id}
                                                    type="button"
                                                    onClick={() => setSettings((prev) => ({ ...prev, template: tpl.id, design: { ...tpl.design } }))}
                                                    className={`p-2 rounded-lg border border-solid transition-all text-left ${s.template === tpl.id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                                >
                                                    <TemplateSketch design={tpl.design} />
                                                    <div className={`mt-1.5 text-xs font-bold ${s.template === tpl.id ? 'text-blue-600' : 'text-slate-700'}`}>{tpl.name}</div>
                                                    <div className="text-[10px] font-medium text-slate-400 leading-tight">{tpl.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                        {s.template === 'custom' && <Hint>Your own colors. Pick a template to start over.</Hint>}
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Header</SectionTitle>
                                        <ColorRow label="Background" value={s.design.headerBg} onChange={(v) => setDesign('headerBg', v)} />
                                        <ColorRow label="Text" value={s.design.headerText} onChange={(v) => setDesign('headerText', v)} />
                                        <SliderRow label="Text Size" value={s.design.headerFontSize} min={10} max={18} onChange={(v) => setDesign('headerFontSize', v)} />
                                        <ToggleRow title="Uppercase headings" on={s.design.uppercaseHeader} onClick={() => setDesign('uppercaseHeader', !s.design.uppercaseHeader)} />
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Rows</SectionTitle>
                                        <ColorRow label="Background" value={s.design.rowBg} onChange={(v) => setDesign('rowBg', v)} />
                                        <ToggleRow title="Striped rows" on={s.design.striped} onClick={() => setDesign('striped', !s.design.striped)} />
                                        {s.design.striped && <ColorRow label="Stripe Color" value={s.design.rowAltBg} onChange={(v) => setDesign('rowAltBg', v)} />}
                                        <ColorRow label="Text" value={s.design.text} onChange={(v) => setDesign('text', v)} />
                                        <ColorRow label="Product Links" value={s.design.link} onChange={(v) => setDesign('link', v)} />
                                        <SliderRow label="Text Size" value={s.design.fontSize} min={12} max={18} onChange={(v) => setDesign('fontSize', v)} />
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Buttons &amp; Borders</SectionTitle>
                                        <ColorRow label="Button" value={s.design.accent} onChange={(v) => setDesign('accent', v)} />
                                        <ColorRow label="Button Text" value={s.design.accentText} onChange={(v) => setDesign('accentText', v)} />
                                        <ColorRow label="Borders" value={s.design.border === 'transparent' ? '#ffffff' : s.design.border} onChange={(v) => setDesign('border', v)} />
                                        <ToggleRow title="Lines between columns" on={s.design.verticalBorders} onClick={() => setDesign('verticalBorders', !s.design.verticalBorders)} />
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Shape &amp; Spacing</SectionTitle>
                                        <FieldLabel>Corners</FieldLabel>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[['square', 'Square'], ['rounded', 'Rounded'], ['pill', 'Pill']].map(([id, label]) => (
                                                <OptionCard key={id} selected={s.design.radius === id} onClick={() => setDesign('radius', id)} className="!justify-center">{label}</OptionCard>
                                            ))}
                                        </div>
                                        <FieldLabel>Row Spacing</FieldLabel>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[['compact', 'Compact'], ['comfortable', 'Comfortable'], ['spacious', 'Spacious']].map(([id, label]) => (
                                                <OptionCard key={id} selected={s.design.density === id} onClick={() => setDesign('density', id)} className="!justify-center">{label}</OptionCard>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-6 wpt-fade-in">
                                    <section className="space-y-2">
                                        <SectionTitle>Button Texts</SectionTitle>
                                        {[
                                            ['addToCart', 'Add to Cart'],
                                            ['added', 'After Adding'],
                                            ['selectOptions', 'Before Options Are Picked'],
                                            ['viewProduct', 'View Product'],
                                        ].map(([key, label]) => (
                                            <div key={key} className="space-y-1.5">
                                                <FieldLabel htmlFor={`wpt-l-${key}`}>{label}</FieldLabel>
                                                <input
                                                    id={`wpt-l-${key}`}
                                                    type="text"
                                                    value={s.labels[key]}
                                                    onChange={(e) => setLabel(key, e.target.value)}
                                                    className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 shadow-sm"
                                                />
                                            </div>
                                        ))}
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Add Selected</SectionTitle>
                                        {[
                                            ['bulkSingular', 'One Item'],
                                            ['bulkPlural', 'Several Items'],
                                            ['bulkHint', 'Before Anything Is Ticked'],
                                        ].map(([key, label]) => (
                                            <div key={key} className="space-y-1.5">
                                                <FieldLabel htmlFor={`wpt-l-${key}`}>{label}</FieldLabel>
                                                <input
                                                    id={`wpt-l-${key}`}
                                                    type="text"
                                                    value={s.labels[key]}
                                                    onChange={(e) => setLabel(key, e.target.value)}
                                                    className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 shadow-sm"
                                                />
                                            </div>
                                        ))}
                                        <Hint>{'{items}'} is the number of items and {'{total}'} their price.</Hint>
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Search &amp; Empty States</SectionTitle>
                                        {[
                                            ['searchPlaceholder', 'Search Box Placeholder'],
                                            ['noProducts', 'Table Has No Products'],
                                            ['noResults', 'Nothing Matches the Search'],
                                        ].map(([key, label]) => (
                                            <div key={key} className="space-y-1.5">
                                                <FieldLabel htmlFor={`wpt-l-${key}`}>{label}</FieldLabel>
                                                <input
                                                    id={`wpt-l-${key}`}
                                                    type="text"
                                                    value={s.labels[key]}
                                                    onChange={(e) => setLabel(key, e.target.value)}
                                                    className="w-full bg-white border border-solid border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 shadow-sm"
                                                />
                                            </div>
                                        ))}
                                    </section>

                                    <section className="space-y-2">
                                        <SectionTitle>Custom CSS</SectionTitle>
                                        <TextArea rows={6} value={s.customCss} onChange={(v) => setSettings((prev) => ({ ...prev, customCss: v }))} placeholder={'.wpt-table th { letter-spacing: 0; }'} />
                                        <Hint>Loaded on pages with a product table. Classes start with .wpt-</Hint>
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
                    <div className="flex items-center justify-between gap-4 px-8 pt-6 pb-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest shrink-0">Previewing</span>
                            {s.tables.length > 1 && !editing ? (
                                <select
                                    value={previewTable?.id}
                                    onChange={(e) => setPreviewId(Number(e.target.value))}
                                    className="!max-w-xs bg-white !border !border-solid !border-slate-200 !rounded-lg !pl-3 !pr-8 !py-1.5 !text-xs font-bold !shadow-sm"
                                >
                                    {s.tables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            ) : (
                                <span className="text-xs font-bold text-slate-700 truncate">{previewTable?.name}</span>
                            )}
                        </div>
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 shrink-0">
                            {previewLoading ? <Loader2 size={13} className="animate-spin" /> : <ShoppingCart size={13} />}
                            {previewLoading ? 'Loading products…' : `${previewProducts.length} product${previewProducts.length === 1 ? '' : 's'} · Add to cart is simulated`}
                        </span>
                    </div>

                    {previewTable && missingPick(previewTable, store) && (
                        <div className="mx-8 mt-2 flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-solid border-amber-200 text-xs font-bold text-amber-800">
                            <AlertCircle size={16} className="shrink-0" />
                            <span className="flex-1">
                                “{previewTable.name}” shows no products on your store: no {missingPick(previewTable, store)} is picked for it.
                            </span>
                            {editingId !== previewTable.id && (
                                <button type="button" onClick={() => { setActiveTab('tables'); setEditingId(previewTable.id); }} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold">
                                    Fix it
                                </button>
                            )}
                        </div>
                    )}

                    <div className="relative flex-1 flex justify-center items-start p-6 sm:p-8 pt-2">
                        {!isEnabled && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-slate-900/10">
                                <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-solid border-white flex flex-col items-center gap-4 max-w-sm text-center wpt-fade-in">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><AlertCircle size={32} /></div>
                                    <h3 className="m-0 text-xl font-black text-[#0F172A] tracking-tight">Product Table Is Off</h3>
                                    <p className="m-0 text-slate-500 text-xs font-medium leading-relaxed">
                                        {licenseActive ? 'Shortcodes show nothing to shoppers while it is off.' : 'This is a Pro feature. Activate your wiseCampaign Pro license to turn it on.'}
                                    </p>
                                    <button type="button" onClick={toggleEnabled} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 text-xs">
                                        {licenseActive ? 'Turn On Product Table' : 'Unlock with Pro'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={`${isMobile ? 'w-[390px]' : 'w-full max-w-[1100px]'} bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-solid border-slate-200 overflow-hidden`}>
                            <div className="bg-[#F8FAFC] px-6 py-2.5 border-0 border-b border-solid border-slate-200 flex items-center gap-4">
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                                </div>
                                <div className="flex-1 max-w-3xl mx-auto bg-white h-7 rounded-lg flex items-center justify-center px-4 border border-solid border-slate-200/60 shadow-sm">
                                    <span className="text-[11px] font-medium text-slate-500">mysite.com/order-form</span>
                                </div>
                            </div>
                            <div className={`${isMobile ? 'p-4' : 'p-8'} transition-colors`} style={{ background: darkPage ? '#0b1120' : '#ffffff' }}>
                                <div className={`h-6 w-48 rounded-lg mb-2 ${darkPage ? 'bg-slate-700' : 'bg-slate-200'}`} />
                                <div className={`h-2.5 w-72 max-w-full rounded-full mb-6 ${darkPage ? 'bg-slate-800' : 'bg-slate-100'}`} />
                                {previewTable && (
                                    <ProductTable
                                        key={previewTable.id}
                                        table={previewTable}
                                        products={previewProducts}
                                        design={s.design}
                                        labels={s.labels}
                                        currency={data.currency}
                                        onAddToCart={previewAddToCart}
                                        forceMobile={isMobile}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {s.customCss && <style>{s.customCss}</style>}
            {toast && <Toast toast={toast} onClose={closeToast} />}
        </div>
    );
}
