import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BarChart3, ExternalLink, Gift, Loader2, MessageSquarePlus, Power, RefreshCw, Save, Settings2, Users } from 'lucide-react';
import SettingsPanel, { TABS } from './components/SettingsPanel.jsx';
import Preview from './components/Preview.jsx';
import Customers from './components/Customers.jsx';
import Analytics from './components/Analytics.jsx';
import { Notice, ProBadge, Toast } from './components/ui.jsx';
import PerformanceCard from '../../shared/PerformanceCard.jsx';
import { api, money, pointValue } from './points.jsx';

const FEATURE_REQUEST_URL = 'https://wisecampaign.canny.io/feature-requests';

// On/off is saved on its own, so it never counts as an unsaved change
const snapshot = (settings) => JSON.stringify({ ...settings, enabled: undefined });

const VIEWS = [
    { id: 'settings', label: 'Settings', icon: <Settings2 size={15} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={15} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={15} />, pro: true },
];

export default function App() {
    const [data, setData] = useState(null);
    const [settings, setSettings] = useState(null);
    const [saved, setSaved] = useState('');
    const [status, setStatus] = useState('loading');
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [view, setView] = useState('settings');
    const [tab, setTab] = useState('earn');
    const [focus, setFocus] = useState('product');

    const notify = useCallback((t) => setToast(t), []);
    const closeToast = useCallback(() => setToast(null), []);
    const isDirty = status === 'ready' && snapshot(settings) !== saved;
    const isPro = !!data?.isPro;

    const load = useCallback(async () => {
        setStatus('loading');
        try {
            const payload = await api();
            setData(payload);
            setSettings(payload.settings);
            setSaved(snapshot(payload.settings));
            setStatus('ready');
        } catch (e) {
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = await api('', { method: 'POST', body: settings });
            setSettings(payload.settings);
            setSaved(snapshot(payload.settings));
            setToast({ type: 'success', message: 'wiseRewards settings saved!' });
        } catch (e) {
            setToast({ type: 'error', message: e.message });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleEnabled = async () => {
        const next = !settings.enabled;
        update('enabled', next);
        try {
            await api('/status', { method: 'POST', body: { enabled: next } });
            setToast({ type: 'success', message: next ? 'wiseRewards is on: customers earn and use points.' : 'wiseRewards is off.' });
        } catch (e) {
            update('enabled', !next);
            setToast({ type: 'error', message: e.message });
        }
    };

    if (status !== 'ready') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-32px)] bg-[#F8FAFC] text-slate-500 gap-4">
                {status === 'loading' ? (
                    <>
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                        <span className="text-sm font-bold">Loading wiseRewards…</span>
                    </>
                ) : (
                    <>
                        <AlertCircle size={28} className="text-rose-500" />
                        <span className="text-sm font-bold">Could not load wiseRewards.</span>
                        <button type="button" onClick={load} className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold">
                            <RefreshCw size={14} /> Try Again
                        </button>
                    </>
                )}
            </div>
        );
    }

    const stats = data.stats;
    return (
        <div className="flex flex-col h-[calc(100vh-32px)] bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            <header className="pt-3 pb-3 bg-white border-0 border-b border-solid border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <img src={`${window.wiseModuleData?.pluginUrl || '/wp-content/plugins/wisecampaign/'}images/fe/wisecampaign-icon.png`} alt="" className="w-9 h-9 rounded-xl object-contain shrink-0" />
                    <span className="font-bold text-lg tracking-tight text-[#0F172A]">WiseCampaign</span>
                    <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs font-bold text-violet-600">
                        <Gift size={14} />
                        wiseRewards
                    </div>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex bg-slate-100 p-1 rounded-md">
                        {VIEWS.map((v) => (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => setView(v.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {v.icon}
                                {v.label}
                                {v.pro && !isPro && <ProBadge />}
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
                        disabled={isSaving || !isDirty}
                        className={`flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-bold shadow-lg shadow-slate-200 active:scale-95 ${isSaving || !isDirty ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <Save size={18} className={isSaving ? 'animate-spin' : ''} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            {view === 'settings' ? (
                <div className="flex flex-1 overflow-hidden">
                    <aside className="w-[400px] bg-white border-0 border-r border-solid border-slate-200 flex flex-col shrink-0 overflow-y-auto">
                        <div className="p-5 border-0 border-b-4 border-solid border-slate-50 bg-slate-50/30">
                            <button
                                type="button"
                                onClick={toggleEnabled}
                                className="w-full flex items-center justify-between bg-white p-4 rounded-xl border border-solid border-slate-200 shadow-sm hover:border-blue-200 transition-all cursor-pointer text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${settings.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Power size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-700 uppercase tracking-tight">wiseRewards</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                            {settings.enabled ? <span className="text-emerald-500">Currently Active</span> : 'Feature Disabled'}
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full transition-all relative ${settings.enabled ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enabled ? 'right-1' : 'left-1'}`} />
                                </div>
                            </button>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {[
                                    { k: 'Customers with points', v: stats.members.toLocaleString() },
                                    { k: 'Unused points', v: stats.outstanding.toLocaleString(), sub: settings.redeemEnabled ? money(stats.outstanding * pointValue(settings), data.currency) : null },
                                    { k: `Given, ${stats.days} days`, v: stats.issued.toLocaleString() },
                                    { k: `Used, ${stats.days} days`, v: stats.redeemed.toLocaleString() },
                                ].map((x) => (
                                    <div key={x.k} className="p-3 rounded-xl bg-white border border-solid border-slate-200">
                                        <div className="text-base font-black text-[#0F172A] leading-tight">{x.v}</div>
                                        <div className="text-[10px] font-medium text-slate-500">{x.k}{x.sub ? ` · ${x.sub}` : ''}</div>
                                    </div>
                                ))}
                            </div>
                            <PerformanceCard module="rewards" />
                            {!data.hasWc && <div className="mt-3"><Notice>wiseRewards needs WooCommerce.</Notice></div>}
                        </div>

                        <div className="px-4 pt-4 pb-2">
                            <div className="flex bg-slate-100 p-1 rounded-md">
                                {TABS.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTab(t.id)}
                                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === t.id ? 'bg-white shadow-sm text-[#0F172A]' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {t.label}
                                        {t.pro && !isPro && <ProBadge />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-4 py-3 space-y-4 pb-10 text-left">
                            <SettingsPanel
                                tab={tab}
                                settings={settings}
                                update={update}
                                isPro={isPro}
                                currency={data.currency}
                                couponsEnabled={data.couponsEnabled}
                                accountUrl={data.accountUrl}
                                onPreview={setFocus}
                            />
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
                    </aside>

                    <main className="flex-1 overflow-y-auto bg-slate-50">
                        <div className="max-w-3xl mx-auto px-8 py-6">
                            <Preview settings={settings} currency={data.currency} sample={data.sample} focus={focus} enabled={settings.enabled} />
                            <div className="flex items-center justify-center gap-3 pt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] opacity-60 select-none">
                                <span className="w-8 h-[2px] bg-slate-300" />
                                Live preview · example shopper with 1,250 points
                                <span className="w-8 h-[2px] bg-slate-300" />
                            </div>
                        </div>
                    </main>
                </div>
            ) : (
                <main className="flex-1 overflow-y-auto bg-slate-50">
                    {view === 'customers' ? (
                        <Customers settings={settings} currency={data.currency} notify={notify} />
                    ) : (
                        <Analytics isPro={isPro} settings={settings} currency={data.currency} />
                    )}
                </main>
            )}

            {toast && <Toast toast={toast} onClose={closeToast} />}
        </div>
    );
}
