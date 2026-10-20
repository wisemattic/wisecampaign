import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Crown, Minus, Plus, Search, Sparkles, X } from 'lucide-react';

export const PRICING_URL = 'https://wisemattic.com/wisecampaign/pricing';

export const ProPill = ({ small = false }) => (
    <span className={`${small ? 'text-[7px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'} font-black uppercase tracking-wider bg-amber-100 text-amber-600 rounded shrink-0`}>
        PRO
    </span>
);

export const SectionTitle = ({ children, pro = false, aside = null }) => (
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

export const FieldLabel = ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{children}</label>
);

export const Hint = ({ children }) => (
    <p className="m-0 text-[11px] text-slate-400 font-medium leading-relaxed pl-1">{children}</p>
);

export const Notice = ({ children }) => (
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-solid border-amber-200 text-amber-700 text-[11px] font-bold">
        <AlertCircle size={14} className="shrink-0 mt-px" />
        <span>{children}</span>
    </div>
);

export const Toggle = ({ on, onClick, label, disabled = false }) => (
    <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${on ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${on ? 'right-1' : 'left-1'}`} />
    </button>
);

// A bordered row with a title, optional description and a switch on the right.
export const ToggleRow = ({ title, desc, icon, on, onClick, pro = false, locked = false }) => (
    <div className="flex items-center justify-between gap-3 p-3 border border-solid border-slate-200 rounded-lg">
        <div className="flex items-center gap-2.5 min-w-0">
            {icon && <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">{icon}</div>}
            <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A]">
                    {title}
                    {pro && locked && <ProPill small />}
                </div>
                {desc && <div className="text-[10px] font-medium text-slate-400">{desc}</div>}
            </div>
        </div>
        <Toggle on={on} onClick={onClick} label={title} />
    </div>
);

export const ColorRow = ({ label, value, onChange, disabled = false }) => (
    <div className={`flex items-center justify-between p-2 border border-solid border-slate-200 rounded-lg hover:border-slate-300 transition-colors ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
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

export const SliderRow = ({ label, value, min, max, unit = 'px', onChange, disabled = false }) => (
    <div className={`flex items-center justify-between p-2 border border-solid border-slate-200 rounded-lg hover:border-slate-300 transition-colors ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <span className="text-xs font-bold text-slate-600">{label}</span>
        <div className="flex items-center gap-3">
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="w-28 accent-blue-600"
                aria-label={label}
            />
            <span className="text-[10px] font-mono font-bold text-slate-400 w-9 text-right">{value}{unit}</span>
        </div>
    </div>
);

export const NumberRow = ({ label, desc, value, min, max, unit, onChange }) => {
    const set = (v) => onChange(Math.max(min, Math.min(max, Number.isNaN(v) ? min : v)));
    return (
        <div className="flex items-center justify-between gap-3 p-3 border border-solid border-slate-200 rounded-lg">
            <div>
                <div className="text-xs font-black text-[#0F172A]">{label}</div>
                {desc && <div className="text-[10px] font-medium text-slate-400">{desc}</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => set(value - 1)} className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center" aria-label={`Less ${label}`}>
                    <Minus size={12} />
                </button>
                <input
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => set(parseInt(e.target.value, 10))}
                    className="!w-12 !min-h-0 !h-7 !p-0 text-center !text-xs font-black !border !border-solid !border-slate-200 !rounded-md !shadow-none"
                    aria-label={label}
                />
                <button type="button" onClick={() => set(value + 1)} className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center" aria-label={`More ${label}`}>
                    <Plus size={12} />
                </button>
                <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{unit}</span>
            </div>
        </div>
    );
};

export const TextArea = ({ id, value, onChange, rows = 3, placeholder }) => (
    <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full !bg-white !border !border-solid !border-slate-200 !rounded-xl !px-4 !py-3 !text-xs font-semibold leading-relaxed outline-none focus:!border-blue-500 transition-all !shadow-sm resize-y"
    />
);

export const OptionCard = ({ selected, locked = false, disabled = false, onClick, children, className = '' }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        disabled={disabled}
        className={`py-2 px-2.5 text-xs font-bold rounded-lg border border-solid transition-all flex items-center justify-between text-left ${
            disabled
                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                : selected
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm font-black cursor-pointer'
                    : `border-slate-200 bg-white text-slate-600 cursor-pointer ${locked ? 'hover:border-amber-300' : 'hover:border-slate-300'}`
        } ${className}`}
    >
        {children}
    </button>
);

/**
 * Searchable checkbox list for picking orders, products or pages.
 */
export const CheckList = ({ items, selected, onChange, emptyText, searchPlaceholder = 'Search…' }) => {
    const [query, setQuery] = useState('');
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
    }, [items, query]);

    if (!items.length) {
        return <Notice>{emptyText}</Notice>;
    }

    const toggle = (id) => onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

    return (
        <div className="border border-solid border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-0 border-b border-solid border-slate-100 bg-slate-50/60">
                <Search size={13} className="text-slate-400 shrink-0" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="flex-1 !bg-transparent !border-none !shadow-none !p-0 !min-h-0 !text-xs font-semibold outline-none"
                />
                <span className="text-[10px] font-black text-blue-600 shrink-0">{selected.length} selected</span>
                {selected.length > 0 && (
                    <button type="button" onClick={() => onChange([])} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                        Clear
                    </button>
                )}
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
                {visible.map((item) => {
                    const on = selected.includes(item.id);
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => toggle(item.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-xs transition-colors ${on ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
                        >
                            <span className={`w-4 h-4 rounded border border-solid flex items-center justify-center shrink-0 ${on ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                                {on && <CheckCircle2 size={11} strokeWidth={3} />}
                            </span>
                            <span className={`truncate font-semibold ${on ? 'text-blue-700' : 'text-slate-600'}`}>{item.label}</span>
                            {item.meta && <span className="ml-auto text-[10px] font-bold text-slate-400 shrink-0">{item.meta}</span>}
                        </button>
                    );
                })}
                {!visible.length && <div className="px-3 py-3 text-[11px] font-medium text-slate-400">No matches.</div>}
            </div>
        </div>
    );
};

export const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    const isError = toast.type === 'error';
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100000] wsn-slide-up">
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

const ModalShell = ({ children }) => (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/60 backdrop-blur-md wsn-fade-in p-4">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden p-8 flex flex-col items-center text-center border border-solid border-slate-100">
            {children}
        </div>
    </div>
);

export const ProModal = ({ reason, onClose }) => (
    <ModalShell>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-200" style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}>
            <Crown size={32} />
        </div>
        <h2 className="m-0 text-2xl font-black text-[#0F172A] tracking-tight mb-2">Unlock Pro Feature</h2>
        <p className="m-0 text-slate-500 text-sm font-medium leading-relaxed mb-8">{reason}</p>
        <div className="flex gap-3 w-full">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all active:scale-95 border border-solid border-slate-200/60"
            >
                Cancel
            </button>
            <a
                href={PRICING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex-1 px-5 py-3 font-bold text-sm rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center justify-center gap-2 no-underline"
                style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
            >
                <span className="font-bold whitespace-nowrap" style={{ color: '#FFFFFF' }}>Upgrade Now</span>
                <Sparkles size={16} style={{ color: '#FFFFFF' }} />
            </a>
        </div>
    </ModalShell>
);

export const ConfirmModal = ({ title, message, confirmLabel, onConfirm, onClose, busy = false }) => (
    <ModalShell>
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
            <AlertCircle size={32} />
        </div>
        <h2 className="m-0 text-2xl font-black text-[#0F172A] tracking-tight mb-2">{title}</h2>
        <p className="m-0 text-slate-500 text-sm font-medium leading-relaxed mb-8">{message}</p>
        <div className="flex gap-3 w-full">
            <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all active:scale-95 border border-solid border-slate-200/60"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className="flex-1 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-200 transition-all active:scale-95 whitespace-nowrap"
            >
                {busy ? 'Working…' : confirmLabel}
            </button>
        </div>
    </ModalShell>
);
