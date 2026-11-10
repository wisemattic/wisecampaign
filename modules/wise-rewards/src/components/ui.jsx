import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Minus, Plus, X } from 'lucide-react';

export const SectionTitle = ({ children, aside = null }) => (
    <div className="flex items-center justify-between">
        <h3 className="m-0 text-sm font-black text-[#0F172A] tracking-tight">{children}</h3>
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
export const ToggleRow = ({ title, desc, icon, on, onClick }) => (
    <div className="flex items-center justify-between gap-3 p-3 border border-solid border-slate-200 rounded-lg">
        <div className="flex items-center gap-2.5 min-w-0">
            {icon && <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">{icon}</div>}
            <div className="min-w-0">
                <div className="text-xs font-black text-[#0F172A]">{title}</div>
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

export const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    const isError = toast.type === 'error';
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100000] wct-slide-up">
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

// ---- wiseRewards additions ----

// A number box with an optional prefix ($) or suffix (points), for rates and limits.
export const NumberInput = ({ id, value, onChange, min = 0, max, step = 1, prefix, suffix, width = 'w-24', disabled = false, label }) => (
    <div className={`inline-flex items-center h-9 rounded-lg border border-solid border-slate-200 bg-white shadow-sm focus-within:border-blue-500 transition-colors ${disabled ? 'opacity-50' : ''}`}>
        {prefix && <span className="pl-2.5 text-xs font-bold text-slate-400">{prefix}</span>}
        <input
            id={id}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            aria-label={label}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={`${width} !h-8 !min-h-0 !border-0 !shadow-none !bg-transparent !px-2 !py-0 !text-sm font-black text-[#0F172A] outline-none`}
        />
        {suffix && <span className="pr-2.5 text-xs font-bold text-slate-400 whitespace-nowrap">{suffix}</span>}
    </div>
);

export const TextInput = ({ id, value, onChange, placeholder, disabled = false, maxLength }) => (
    <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full !bg-white !border !border-solid !border-slate-200 !rounded-xl !px-3.5 !py-2.5 !text-sm font-semibold outline-none focus:!border-blue-500 transition-all !shadow-sm"
    />
);

export const ProBadge = ({ className = '' }) => (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 ${className}`}>Pro</span>
);

// A card of settings; with locked, its fields are dimmed and a click leads to the upgrade page.
export const Card = ({ title, desc, icon, aside, locked = false, upgradeUrl, children }) => (
    <section className="relative rounded-xl border border-solid border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
                {icon && <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg shrink-0">{icon}</div>}
                <div className="min-w-0">
                    <h3 className="m-0 flex items-center gap-1.5 text-sm font-black text-[#0F172A] tracking-tight">
                        {title}
                        {locked && <ProBadge />}
                    </h3>
                    {desc && <p className="m-0 mt-0.5 text-[11px] text-slate-500 font-medium leading-relaxed">{desc}</p>}
                </div>
            </div>
            {aside}
        </div>
        <div className={locked ? 'opacity-50 pointer-events-none select-none' : ''}>{children}</div>
        {locked && (
            <a
                href={upgradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 rounded-xl no-underline flex items-end justify-end p-3"
                aria-label={`Unlock ${title} with Pro`}
            >
                <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-black shadow-sm">Unlock with Pro</span>
            </a>
        )}
    </section>
);

export const Field = ({ label, htmlFor, hint, children }) => (
    <div className="space-y-1.5">
        {label && <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>}
        {children}
        {hint && <Hint>{hint}</Hint>}
    </div>
);

export const Modal = ({ title, onClose, children, wide = false }) => {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label={title}>
            <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
            <div className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl wct-fade-in`}>
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-0 border-b border-solid border-slate-100">
                    <h2 className="m-0 text-base font-black text-[#0F172A]">{title}</h2>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100" aria-label="Close">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
};
