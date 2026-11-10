import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, Minus, Plus, Search, Users } from 'lucide-react';
import { Field, Hint, Modal, NumberInput, TextInput } from './ui.jsx';
import { api, label, money, pointValue } from '../points.jsx';

const SORTS = [
    { id: 'balance', label: 'Balance' },
    { id: 'earned', label: 'Earned' },
    { id: 'redeemed', label: 'Used' },
    { id: 'recent', label: 'Recent' },
];

const Pager = ({ page, total, perPage, onPage }) => {
    const pages = Math.max(1, Math.ceil(total / perPage));
    if (pages <= 1) return null;
    return (
        <div className="flex items-center justify-end gap-2 text-xs font-bold text-slate-500">
            <span>Page {page} of {pages}</span>
            <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="p-1.5 rounded-md border border-solid border-slate-200 bg-white disabled:opacity-40" aria-label="Previous page">
                <ChevronLeft size={14} />
            </button>
            <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="p-1.5 rounded-md border border-solid border-slate-200 bg-white disabled:opacity-40" aria-label="Next page">
                <ChevronRight size={14} />
            </button>
        </div>
    );
};

const Avatar = ({ src }) => <img src={src} alt="" className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />;

// One customer: balance, change it, and every points change
function CustomerModal({ id, settings, currency, onClose, onChanged, notify }) {
    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [points, setPoints] = useState(100);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);

    const load = useCallback(async (p = 1) => {
        try {
            setData(await api(`/customers/${id}?page=${p}`));
            setPage(p);
        } catch (e) {
            notify({ type: 'error', message: e.message });
            onClose();
        }
    }, [id, notify, onClose]);

    useEffect(() => {
        load(1);
    }, [load]);

    const adjust = async (sign) => {
        const n = Math.abs(parseInt(points, 10) || 0);
        if (!n) return;
        setBusy(true);
        try {
            const payload = await api(`/customers/${id}`, { method: 'POST', body: { points: sign * n, note } });
            setData(payload);
            setPage(1);
            setNote('');
            onChanged();
            notify({ type: 'success', message: `${sign > 0 ? 'Added' : 'Took'} ${label(settings, n)}.` });
        } catch (e) {
            notify({ type: 'error', message: e.message });
        } finally {
            setBusy(false);
        }
    };

    const c = data?.customer;
    return (
        <Modal title={c ? c.name : 'Customer'} onClose={onClose} wide>
            {!c ? (
                <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-blue-600" /></div>
            ) : (
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                        <img src={c.avatar} alt="" className="w-12 h-12 rounded-full bg-slate-100" />
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-[#0F172A]">{c.name}</div>
                            <div className="text-xs text-slate-500">{c.email}</div>
                        </div>
                        <a href={c.editUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 no-underline">
                            Profile <ExternalLink size={12} />
                        </a>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { k: 'Balance', v: label(settings, c.balance), sub: settings.redeemEnabled && c.balance > 0 ? `Worth ${money(c.balance * pointValue(settings), currency)}` : null },
                            { k: 'Earned all time', v: label(settings, c.lifetime), sub: c.extra?.tier ? `${c.extra.tier} tier` : null },
                            { k: c.pendingSignup ? 'Waiting bonus' : 'Expires', v: c.pendingSignup ? label(settings, c.pendingSignup) : c.expiresText || 'Never', sub: c.pendingSignup ? 'Unlocks with the first order' : null },
                        ].map((x) => (
                            <div key={x.k} className="p-3 rounded-xl bg-slate-50 border border-solid border-slate-100">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{x.k}</div>
                                <div className="text-base font-black text-[#0F172A]">{x.v}</div>
                                {x.sub && <div className="text-[11px] font-medium text-slate-500">{x.sub}</div>}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-xl border border-solid border-slate-200 space-y-3">
                        <div className="text-sm font-black text-[#0F172A]">Add or take points</div>
                        <div className="flex flex-wrap items-end gap-2">
                            <Field label="Points">
                                <NumberInput value={points} min={1} onChange={setPoints} suffix={settings.pointsLabel} label="Points to change" />
                            </Field>
                            <div className="flex-1 min-w-[180px]">
                                <Field label="Note (the customer sees it)">
                                    <TextInput value={note} onChange={setNote} maxLength={120} placeholder="Thanks for your patience" />
                                </Field>
                            </div>
                            <button type="button" disabled={busy} onClick={() => adjust(1)} className="flex items-center gap-1 h-10 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50">
                                <Plus size={14} /> Add
                            </button>
                            <button type="button" disabled={busy} onClick={() => adjust(-1)} className="flex items-center gap-1 h-10 px-3 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold disabled:opacity-50">
                                <Minus size={14} /> Take
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-black text-[#0F172A]">History</div>
                        {data.history.rows.length === 0 ? (
                            <Hint>No points yet.</Hint>
                        ) : (
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="text-left text-[10px] uppercase tracking-widest text-slate-400">
                                        <th className="py-2 font-black">Date</th>
                                        <th className="py-2 font-black">Activity</th>
                                        <th className="py-2 font-black text-right">Change</th>
                                        <th className="py-2 font-black text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.history.rows.map((r) => (
                                        <tr key={r.id} className="border-0 border-t border-solid border-slate-100">
                                            <td className="py-2 text-slate-500 whitespace-nowrap">{r.dateText}</td>
                                            <td className="py-2 text-slate-700 font-semibold">{r.text}</td>
                                            <td className={`py-2 text-right font-black ${r.points < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{r.points > 0 ? '+' : '−'}{Math.abs(r.points).toLocaleString()}</td>
                                            <td className="py-2 text-right text-slate-500 font-bold">{r.balance.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <Pager page={page} total={data.history.total} perPage={data.history.perPage} onPage={load} />
                    </div>
                </div>
            )}
        </Modal>
    );
}

// Find any account to give points to, also customers without points yet
function FindCustomer({ settings, onPick, onClose }) {
    const [q, setQ] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (q.trim().length < 2) {
            setUsers([]);
            return undefined;
        }
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                setUsers((await api(`/users?search=${encodeURIComponent(q.trim())}`)).users);
            } catch (e) {
                setUsers([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [q]);
    return (
        <Modal title="Give points" onClose={onClose}>
            <div className="space-y-3">
                <TextInput value={q} onChange={setQ} placeholder="Search by name or email" />
                {loading && <Loader2 size={16} className="animate-spin text-blue-600" />}
                <div className="space-y-1">
                    {users.map((u) => (
                        <button key={u.id} type="button" onClick={() => onPick(u.id)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 text-left">
                            <Avatar src={u.avatar} />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-black text-[#0F172A] truncate">{u.name}</div>
                                <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{label(settings, u.balance)}</span>
                        </button>
                    ))}
                    {q.trim().length >= 2 && !loading && users.length === 0 && <Hint>No accounts match.</Hint>}
                </div>
            </div>
        </Modal>
    );
}

export default function Customers({ settings, currency, notify }) {
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [orderby, setOrderby] = useState('balance');
    const [page, setPage] = useState(1);
    const [list, setList] = useState(null);
    const [open, setOpen] = useState(null);
    const [finding, setFinding] = useState(false);
    const closeCustomer = useCallback(() => setOpen(null), []);

    useEffect(() => {
        const t = setTimeout(() => {
            setQuery(search.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    const load = useCallback(async () => {
        try {
            setList(await api(`/customers?search=${encodeURIComponent(query)}&orderby=${orderby}&page=${page}`));
        } catch (e) {
            notify({ type: 'error', message: e.message });
            setList({ rows: [], total: 0, perPage: 20 });
        }
    }, [query, orderby, page, notify]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="max-w-6xl mx-auto w-full px-8 py-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search customers"
                        className="w-full !h-10 !pl-9 !pr-3 !bg-white !border !border-solid !border-slate-200 !rounded-xl !text-sm font-semibold !shadow-sm outline-none focus:!border-blue-500"
                    />
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-solid border-slate-200">
                    {SORTS.map((o) => (
                        <button key={o.id} type="button" onClick={() => { setOrderby(o.id); setPage(1); }} className={`px-3 py-1.5 rounded-md text-xs font-bold ${orderby === o.id ? 'bg-slate-100 text-blue-600' : 'text-slate-500'}`}>
                            {o.label}
                        </button>
                    ))}
                </div>
                <button type="button" onClick={() => setFinding(true)} className="ml-auto flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-bold">
                    <Plus size={14} /> Give points
                </button>
            </div>

            <div className="rounded-2xl bg-white border border-solid border-slate-200 overflow-hidden">
                {!list ? (
                    <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-blue-600" /></div>
                ) : list.rows.length === 0 ? (
                    <div className="flex flex-col items-center text-center gap-2 py-16 px-6">
                        <div className="p-3 rounded-2xl bg-violet-50 text-violet-600"><Users size={22} /></div>
                        <div className="text-sm font-black text-[#0F172A]">{query ? 'No customers match.' : 'No points yet'}</div>
                        {!query && <p className="m-0 max-w-sm text-xs text-slate-500">Customers show up here once they earn points by signing up, buying or reviewing, or when you give them points.</p>}
                    </div>
                ) : (
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/60">
                                <th className="px-5 py-3 font-black">Customer</th>
                                <th className="px-5 py-3 font-black text-right">Balance</th>
                                <th className="px-5 py-3 font-black text-right">Earned</th>
                                <th className="px-5 py-3 font-black text-right">Used</th>
                                <th className="px-5 py-3 font-black">Last activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.rows.map((r) => (
                                <tr key={r.id} onClick={() => setOpen(r.id)} className="cursor-pointer border-0 border-t border-solid border-slate-100 hover:bg-slate-50">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar src={r.avatar} />
                                            <div className="min-w-0">
                                                <div className="text-xs font-black text-[#0F172A] truncate">{r.name}</div>
                                                <div className="text-[11px] text-slate-500 truncate">{r.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="text-xs font-black text-[#0F172A]">{r.balance.toLocaleString()}</div>
                                        {settings.redeemEnabled && r.balance > 0 && <div className="text-[10px] text-slate-400">{money(r.balance * pointValue(settings), currency)}</div>}
                                    </td>
                                    <td className="px-5 py-3 text-right text-xs font-bold text-emerald-600">{r.earned.toLocaleString()}</td>
                                    <td className="px-5 py-3 text-right text-xs font-bold text-slate-500">{r.redeemed.toLocaleString()}</td>
                                    <td className="px-5 py-3 text-xs text-slate-500">{r.lastText}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {list && <Pager page={page} total={list.total} perPage={list.perPage || 20} onPage={setPage} />}

            {finding && (
                <FindCustomer
                    settings={settings}
                    onClose={() => setFinding(false)}
                    onPick={(id) => {
                        setFinding(false);
                        setOpen(id);
                    }}
                />
            )}
            {open && <CustomerModal id={open} settings={settings} currency={currency} notify={notify} onClose={closeCustomer} onChanged={load} />}
        </div>
    );
}
