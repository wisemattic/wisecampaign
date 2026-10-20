import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DESIGN_DEFAULTS, LABEL_DEFAULTS } from './options.js';

/**
 * The product table, shared by the storefront (storefront.jsx) and the admin preview (App.jsx).
 * Styles live in includes/css/product-table.css; the design settings arrive as CSS variables.
 *
 * onAddToCart(productId, quantity, variationId, attributes) resolves to { ok, message, url }.
 */

const RADIUS = { square: '0px', rounded: '8px', pill: '999px' };
const PADDING = { compact: '8px', comfortable: '12px', spacious: '18px' };

// Lowercase without accents, so "cafe" finds "Café"
const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const formatMoney = (amount, c) => {
    const currency = c || { symbol: '$', position: 'left', decimals: 2, decimalSep: '.', thousandSep: ',' };
    const [whole, cents] = Math.abs(Number(amount) || 0).toFixed(currency.decimals).split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSep);
    const number = cents ? `${grouped}${currency.decimalSep}${cents}` : grouped;
    switch (currency.position) {
        case 'right': return `${number}${currency.symbol}`;
        case 'left_space': return `${currency.symbol} ${number}`;
        case 'right_space': return `${number} ${currency.symbol}`;
        default: return `${currency.symbol}${number}`;
    }
};

// The variation matching every chosen attribute ("" in a variation means "any value")
const findVariation = (product, choice) => {
    if (!product.variations) return null;
    const keys = product.variationAttributes.map((a) => a.key);
    if (keys.some((k) => !choice?.[k])) return null;
    return product.variations.find((v) => keys.every((k) => !v.attributes[k] || v.attributes[k] === choice[k])) || null;
};

const SortIcon = ({ dir }) => (
    <svg className="wpt-sort" viewBox="0 0 10 14" aria-hidden="true">
        <path d="M5 1 1 5h8z" opacity={dir === 'asc' ? 1 : 0.3} fill="currentColor" />
        <path d="M5 13 1 9h8z" opacity={dir === 'desc' ? 1 : 0.3} fill="currentColor" />
    </svg>
);

export default function ProductTable({ table, products, design, labels, currency, onAddToCart, forceMobile = false }) {
    const d = { ...DESIGN_DEFAULTS, ...design };
    const t = { ...LABEL_DEFAULTS, ...labels };
    const rootRef = useRef(null);

    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [attrFilters, setAttrFilters] = useState({});
    const [sort, setSort] = useState({ key: '', dir: 'asc' });
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState([]);
    const [qty, setQty] = useState({});
    const [choices, setChoices] = useState({});
    const [status, setStatus] = useState({}); // id => { state: 'adding' | 'added' | 'error', message }
    const [bulkBusy, setBulkBusy] = useState(false);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (!rootRef.current || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
        observer.observe(rootRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [query, category, attrFilters, sort, table.perPage, products]);

    const columns = table.columns;
    const showBuy = table.columns.includes('buy');
    const bulkEnabled = showBuy && table.bulkCart !== 'none';

    // Cards instead of a table when the table itself is too narrow for its columns, whatever the screen size
    const minTableWidth = Math.max(640, columns.length * 115 + (showBuy ? 120 : 0));
    const mobile = forceMobile || (width > 0 && width < minTableWidth);

    // Filter lists come from the products in the table
    const categories = useMemo(() => [...new Set(products.flatMap((p) => p.categories))].sort(), [products]);
    const attributeFilters = useMemo(() => {
        const counts = {};
        products.forEach((p) => Object.keys(p.attributes || {}).forEach((name) => { counts[name] = (counts[name] || 0) + 1; }));
        return Object.keys(counts)
            .sort((a, b) => counts[b] - counts[a])
            .slice(0, 3)
            .map((name) => ({ name, values: [...new Set(products.flatMap((p) => p.attributes?.[name] || []))].sort() }));
    }, [products]);

    const filtered = useMemo(() => {
        const q = normalize(query);
        let list = products.filter((p) => {
            if (q && !normalize([p.name, p.sku, p.summary, ...p.categories, ...p.tags].join(' ')).includes(q)) return false;
            if (category && !p.categories.includes(category)) return false;
            return Object.entries(attrFilters).every(([name, value]) => !value || (p.attributes?.[name] || []).includes(value));
        });
        if (sort.key) {
            const factor = sort.dir === 'asc' ? 1 : -1;
            list = [...list].sort((a, b) => (sort.key === 'price' ? a.price - b.price : a.name.localeCompare(b.name)) * factor);
        }
        return list;
    }, [products, query, category, attrFilters, sort]);

    const perPage = Math.max(1, Number(table.perPage) || 10);
    const pages = Math.max(1, Math.ceil(filtered.length / perPage));
    const current = Math.min(page, pages);
    const visible = filtered.slice((current - 1) * perPage, current * perPage);

    // What one row would add right now: { productId, variationId, attributes, price, canAdd }
    const rowState = (p) => {
        const quantity = Math.max(1, Number(qty[p.id]) || 1);
        if (p.variations) {
            const v = findVariation(p, choices[p.id]);
            return { productId: p.id, variationId: v?.id || 0, attributes: choices[p.id] || {}, price: v ? v.price : p.price, canAdd: !!v && v.canAdd, quantity, variation: v };
        }
        return { productId: p.id, variationId: 0, attributes: {}, price: p.price, canAdd: p.canAdd, quantity };
    };

    const add = async (p) => {
        const r = rowState(p);
        if (!r.canAdd) return;
        setStatus((s) => ({ ...s, [p.id]: { state: 'adding' } }));
        const res = await onAddToCart(r.productId, r.quantity, r.variationId, r.attributes);
        setStatus((s) => ({ ...s, [p.id]: res.ok ? { state: 'added' } : { state: 'error', message: res.message, url: res.url } }));
        if (res.ok) {
            setTimeout(() => setStatus((s) => (s[p.id]?.state === 'added' ? { ...s, [p.id]: undefined } : s)), 2500);
        }
        return res.ok;
    };

    const selectedRows = products.filter((p) => selected.includes(p.id) && rowState(p).canAdd);
    const bulkItems = selectedRows.reduce((sum, p) => sum + rowState(p).quantity, 0);
    const bulkTotal = selectedRows.reduce((sum, p) => sum + rowState(p).price * rowState(p).quantity, 0);
    const bulkText = (bulkItems === 1 ? t.bulkSingular : t.bulkPlural)
        .replaceAll('{items}', bulkItems)
        .replaceAll('{total}', formatMoney(bulkTotal, currency));

    const addSelected = async () => {
        setBulkBusy(true);
        for (const p of selectedRows) {
            // One at a time: WooCommerce updates the cart session per request
            // eslint-disable-next-line no-await-in-loop
            await add(p);
        }
        setSelected([]);
        setBulkBusy(false);
    };

    const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
    const selectableOnPage = visible.filter((p) => rowState(p).canAdd).map((p) => p.id);
    const allOnPageSelected = selectableOnPage.length > 0 && selectableOnPage.every((id) => selected.includes(id));

    const style = {
        '--wpt-header-bg': d.headerBg,
        '--wpt-header-text': d.headerText,
        '--wpt-row-bg': d.rowBg,
        '--wpt-row-alt': d.striped ? d.rowAltBg : d.rowBg,
        '--wpt-text': d.text,
        '--wpt-link': d.link,
        '--wpt-border': d.border,
        '--wpt-v-border': d.verticalBorders ? d.border : 'transparent',
        '--wpt-accent': d.accent,
        '--wpt-accent-text': d.accentText,
        '--wpt-radius': RADIUS[d.radius] || RADIUS.rounded,
        '--wpt-box-radius': d.radius === 'square' ? '0px' : '12px',
        '--wpt-pad': PADDING[d.density] || PADDING.comfortable,
        '--wpt-font': `${d.fontSize}px`,
        '--wpt-header-font': `${d.headerFontSize}px`,
        '--wpt-header-case': d.uppercaseHeader ? 'uppercase' : 'none',
    };

    const heading = (id) => ({ image: '', name: 'Product', sku: 'SKU', summary: 'Description', categories: 'Categories', tags: 'Tags', stock: 'Stock', price: 'Price', buy: '' }[id]);

    // A render function, not a component: a component defined here would remount on every
    // render and the quantity field would lose focus while typing.
    const renderBuy = (p) => {
        const r = rowState(p);
        const st = status[p.id];
        if (!p.variations && !p.canAdd) {
            return p.inStock
                ? <a className="wpt-btn wpt-btn--ghost" href={p.buttonUrl}>{p.buttonText || t.viewProduct}</a>
                : <span className="wpt-btn wpt-btn--disabled">{p.stockText}</span>;
        }
        return (
            <div className="wpt-buy">
                {p.variations && (
                    <div className="wpt-variations">
                        {p.variationAttributes.map((a) => (
                            <select
                                key={a.key}
                                className="wpt-select"
                                aria-label={a.label}
                                value={choices[p.id]?.[a.key] || ''}
                                onChange={(e) => setChoices((c) => ({ ...c, [p.id]: { ...c[p.id], [a.key]: e.target.value } }))}
                            >
                                <option value="">{a.label}</option>
                                {a.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        ))}
                    </div>
                )}
                <div className="wpt-buy__row">
                    {table.showQty && (
                        <input
                            type="number"
                            className="wpt-qty"
                            min="1"
                            max={r.variation?.maxQty > 0 ? r.variation.maxQty : (p.maxQty > 0 ? p.maxQty : undefined)}
                            value={qty[p.id] ?? 1}
                            aria-label={`Quantity for ${p.name}`}
                            onChange={(e) => setQty((q) => ({ ...q, [p.id]: e.target.value }))}
                        />
                    )}
                    <button
                        type="button"
                        className={`wpt-btn${st?.state === 'added' ? ' is-added' : ''}${st?.state === 'adding' ? ' is-busy' : ''}`}
                        disabled={!r.canAdd || st?.state === 'adding'}
                        aria-busy={st?.state === 'adding'}
                        onClick={() => add(p)}
                    >
                        {st?.state === 'added' ? `✓ ${t.added}` : p.variations && !r.variation ? t.selectOptions : t.addToCart}
                    </button>
                </div>
                {p.variations && r.variation && !r.variation.inStock && <span className="wpt-note">Out of stock</span>}
                {st?.state === 'error' && (
                    <span className="wpt-note wpt-note--error">
                        {st.message} {st.url && <a href={st.url}>{t.viewProduct}</a>}
                    </span>
                )}
            </div>
        );
    };

    const priceHtml = (p) => {
        const v = p.variations ? findVariation(p, choices[p.id]) : null;
        return { __html: v?.priceHtml || p.priceHtml };
    };

    const cell = (id, p) => {
        switch (id) {
            case 'image':
                return <a href={p.url} className="wpt-thumb"><img src={p.image} alt="" loading="lazy" /></a>;
            case 'name':
                return <a href={p.url} className="wpt-name">{p.name}</a>;
            case 'sku':
                return <span className="wpt-muted">{p.sku || '—'}</span>;
            case 'summary':
                return <span className="wpt-summary">{p.summary}</span>;
            case 'categories':
                return <span className="wpt-muted">{p.categories.join(', ') || '—'}</span>;
            case 'tags':
                return <span className="wpt-muted">{p.tags.join(', ') || '—'}</span>;
            case 'stock':
                return <span className={`wpt-stock${p.inStock ? '' : ' is-out'}`}>{p.stockText}</span>;
            case 'price':
                return <span className="wpt-price" dangerouslySetInnerHTML={priceHtml(p)} />;
            case 'buy':
                return renderBuy(p);
            default:
                return null;
        }
    };

    const checkbox = (p) => (
        <input
            type="checkbox"
            className="wpt-check"
            aria-label={`Select ${p.name}`}
            disabled={!rowState(p).canAdd}
            checked={selected.includes(p.id)}
            onChange={(e) => setSelected((s) => (e.target.checked ? [...s, p.id] : s.filter((id) => id !== p.id)))}
        />
    );

    // With buttons above and below, the hint shows only above
    const bulkBar = (where) => bulkEnabled && (table.bulkCart === where || table.bulkCart === 'both')
        && (selectedRows.length || where === 'above' || table.bulkCart === 'below') && (
        <div className={`wpt-bulk wpt-bulk--${where}`}>
            {selectedRows.length ? (
                <button type="button" className={`wpt-btn${bulkBusy ? ' is-busy' : ''}`} disabled={bulkBusy} aria-busy={bulkBusy} onClick={addSelected}>
                    {bulkText}
                </button>
            ) : (
                <span className="wpt-muted">{t.bulkHint}</span>
            )}
        </div>
    );

    const filtersActive = query || category || Object.values(attrFilters).some(Boolean);
    const bulkAbove = bulkBar('above');

    return (
        <div ref={rootRef} className={`wpt${mobile ? ' wpt--cards' : ''}`} style={style}>
            {(table.showSearch || bulkAbove || (table.showFilters && (categories.length > 1 || attributeFilters.length))) && (
                <div className="wpt-toolbar">
                    {table.showFilters && categories.length > 1 && (
                        <select className="wpt-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
                            <option value="">All categories</option>
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    )}
                    {table.showFilters && attributeFilters.map((f) => (
                        <select
                            key={f.name}
                            className="wpt-select"
                            value={attrFilters[f.name] || ''}
                            onChange={(e) => setAttrFilters((a) => ({ ...a, [f.name]: e.target.value }))}
                            aria-label={f.name}
                        >
                            <option value="">{f.name}</option>
                            {f.values.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                    ))}
                    {filtersActive && (
                        <button type="button" className="wpt-reset" onClick={() => { setQuery(''); setCategory(''); setAttrFilters({}); }}>
                            Reset
                        </button>
                    )}
                    <div className="wpt-toolbar__end">
                        {bulkAbove}
                        {table.showSearch && (
                            <input
                                type="search"
                                className="wpt-search"
                                placeholder={t.searchPlaceholder}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label={t.searchPlaceholder}
                            />
                        )}
                    </div>
                </div>
            )}

            {!products.length || !filtered.length ? (
                <div className="wpt-empty">{products.length ? t.noResults : t.noProducts}</div>
            ) : mobile ? (
                <div className="wpt-cards">
                    {visible.map((p) => (
                        <div key={p.id} className="wpt-card">
                            {bulkEnabled && <div className="wpt-card__check">{checkbox(p)}</div>}
                            {columns.includes('image') && cell('image', p)}
                            <div className="wpt-card__body">
                                {cell('name', p)}
                                {columns.includes('price') && cell('price', p)}
                                {columns.filter((c) => !['image', 'name', 'price', 'buy'].includes(c)).map((c) => (
                                    <div key={c} className="wpt-card__line">{cell(c, p)}</div>
                                ))}
                                {showBuy && cell('buy', p)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="wpt-scroll">
                    <table className="wpt-table">
                        <thead>
                            <tr>
                                {bulkEnabled && (
                                    <th className="wpt-col-check">
                                        <input
                                            type="checkbox"
                                            className="wpt-check"
                                            aria-label="Select all on this page"
                                            disabled={!selectableOnPage.length}
                                            checked={allOnPageSelected}
                                            onChange={(e) => setSelected((s) => (e.target.checked
                                                ? [...new Set([...s, ...selectableOnPage])]
                                                : s.filter((id) => !selectableOnPage.includes(id))))}
                                        />
                                    </th>
                                )}
                                {columns.map((c) => (
                                    <th key={c} className={`wpt-col-${c}`}>
                                        {c === 'name' || c === 'price' ? (
                                            <button type="button" className="wpt-sort-btn" onClick={() => toggleSort(c)}>
                                                {heading(c)} <SortIcon dir={sort.key === c ? sort.dir : ''} />
                                            </button>
                                        ) : heading(c)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((p) => (
                                <tr key={p.id}>
                                    {bulkEnabled && <td className="wpt-col-check">{checkbox(p)}</td>}
                                    {columns.map((c) => <td key={c} className={`wpt-col-${c}`}>{cell(c, p)}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {bulkBar('below')}

            {filtered.length > 0 && (
                <div className="wpt-footer">
                    <span className="wpt-muted">
                        Showing {(current - 1) * perPage + 1}–{Math.min(current * perPage, filtered.length)} of {filtered.length} products
                    </span>
                    {pages > 1 && (
                        <div className="wpt-pages">
                            <button type="button" className="wpt-page" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page">‹</button>
                            {Array.from({ length: pages }, (_, i) => i + 1)
                                .filter((n) => n === 1 || n === pages || Math.abs(n - current) <= 1)
                                .map((n, i, arr) => (
                                    <React.Fragment key={n}>
                                        {i > 0 && n - arr[i - 1] > 1 && <span className="wpt-muted">…</span>}
                                        <button type="button" className={`wpt-page${n === current ? ' is-current' : ''}`} onClick={() => setPage(n)}>{n}</button>
                                    </React.Fragment>
                                ))}
                            <button type="button" className="wpt-page" disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Next page">›</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
