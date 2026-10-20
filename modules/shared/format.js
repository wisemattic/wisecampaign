// Number, money and date formatting shared by the module dashboards. Currency settings come from WooCommerce.

export const formatNumber = (value) => (value === null || value === undefined ? '—' : Number(value).toLocaleString());

export const formatMoney = (value, currency, { whole = false } = {}) => {
    if (value === null || value === undefined) return '—';
    const c = currency || { symbol: '$', position: 'left', decimals: 2, decimalSep: '.', thousandSep: ',' };
    const decimals = whole ? 0 : c.decimals;
    const [int, frac] = Math.abs(value).toFixed(decimals).split('.');
    const amount = int.replace(/\B(?=(\d{3})+(?!\d))/g, c.thousandSep) + (frac ? c.decimalSep + frac : '');
    const sign = value < 0 ? '-' : '';
    switch (c.position) {
        case 'right': return `${sign}${amount}${c.symbol}`;
        case 'right_space': return `${sign}${amount} ${c.symbol}`;
        case 'left_space': return `${sign}${c.symbol} ${amount}`;
        default: return `${sign}${c.symbol}${amount}`;
    }
};

// Axis ticks: 0, 950, 1.2K, 45K, 1.3M
export const compactNumber = (value) => {
    const abs = Math.abs(value);
    if (abs >= 1e6) return `${+(value / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${+(value / 1e3).toFixed(1)}K`;
    return `${+value.toFixed(abs < 10 && abs % 1 ? 1 : 0)}`;
};

export const compactMoney = (value, currency) => {
    const c = currency || { symbol: '$', position: 'left' };
    const amount = compactNumber(value);
    return c.position && c.position.startsWith('right') ? `${amount}${c.symbol.trim()}` : `${c.symbol.trim()}${amount}`;
};

// "2026-10-20" in the site's time zone, shown as "Oct 20"
export const formatDate = (iso, opts = { month: 'short', day: 'numeric' }) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, opts);
};

// Percent change, or null when there is nothing to compare with
export const change = (now, before) => {
    if (now === null || before === null || now === undefined || before === undefined || !before) return null;
    return ((now - before) / before) * 100;
};
