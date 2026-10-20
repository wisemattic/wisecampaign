// Keep defaults and ids in sync with includes/features/WiseProductTable.php.

export const DESIGN_DEFAULTS = {
    headerBg: '#f8fafc',
    headerText: '#1e293b',
    rowBg: '#ffffff',
    rowAltBg: '#f8fafc',
    striped: true,
    text: '#475569',
    link: '#2563eb',
    border: '#e2e8f0',
    verticalBorders: false,
    accent: '#0f172a',
    accentText: '#ffffff',
    radius: 'rounded',
    density: 'comfortable',
    fontSize: 14,
    headerFontSize: 12,
    uppercaseHeader: true,
};

export const LABEL_DEFAULTS = {
    addToCart: 'Add to cart',
    added: 'Added',
    selectOptions: 'Select options',
    viewProduct: 'View product',
    bulkSingular: 'Add 1 item for {total}',
    bulkPlural: 'Add {items} items for {total}',
    bulkHint: 'Tick products to add several at once',
    searchPlaceholder: 'Search products…',
    noProducts: 'No products found.',
    noResults: 'No products match your search.',
};

// Ready-made looks. Picking one replaces the design settings.
export const TEMPLATES = [
    {
        id: 'default',
        name: 'Slate',
        desc: 'Clean and neutral, works with any theme',
        design: { ...DESIGN_DEFAULTS },
    },
    {
        id: 'royal-blue',
        name: 'Royal Blue',
        desc: 'Bold blue header and buttons',
        design: { ...DESIGN_DEFAULTS, headerBg: '#2563eb', headerText: '#ffffff', rowAltBg: '#eff6ff', link: '#1d4ed8', border: '#dbeafe', accent: '#2563eb', accentText: '#ffffff', radius: 'pill' },
    },
    {
        id: 'lilac-rose',
        name: 'Lilac & Rose',
        desc: 'Soft lavender with rose buttons',
        design: { ...DESIGN_DEFAULTS, headerBg: '#f3f0ff', headerText: '#312e81', striped: false, text: '#4b5563', link: '#4338ca', border: '#ede9fe', accent: '#fb7185', accentText: '#ffffff' },
    },
    {
        id: 'mint',
        name: 'Fresh Mint',
        desc: 'Calm green for wellness and food stores',
        design: { ...DESIGN_DEFAULTS, headerBg: '#ecfdf5', headerText: '#065f46', rowAltBg: '#f6fefa', text: '#374151', link: '#047857', border: '#d1fae5', accent: '#059669', accentText: '#ffffff', uppercaseHeader: false, headerFontSize: 13 },
    },
    {
        id: 'midnight',
        name: 'Midnight',
        desc: 'Dark table for dark themes',
        design: { ...DESIGN_DEFAULTS, headerBg: '#020617', headerText: '#e2e8f0', rowBg: '#0f172a', rowAltBg: '#111c33', text: '#cbd5e1', link: '#7dd3fc', border: '#1e293b', accent: '#f59e0b', accentText: '#111827' },
    },
];

export const COLUMNS = [
    { id: 'image', label: 'Image' },
    { id: 'name', label: 'Name' },
    { id: 'sku', label: 'SKU' },
    { id: 'summary', label: 'Summary' },
    { id: 'categories', label: 'Categories' },
    { id: 'tags', label: 'Tags' },
    { id: 'stock', label: 'Stock' },
    { id: 'price', label: 'Price' },
    { id: 'buy', label: 'Buy' },
];

export const SOURCES = [
    { id: 'all', label: 'All products' },
    { id: 'categories', label: 'Categories' },
    { id: 'tags', label: 'Tags' },
    { id: 'products', label: 'Chosen products' },
];

export const SORT_OPTIONS = [
    { id: 'menu_order', label: 'Default (menu order)' },
    { id: 'name', label: 'Name A–Z' },
    { id: 'date', label: 'Newest first' },
    { id: 'price-asc', label: 'Price: low to high' },
    { id: 'price-desc', label: 'Price: high to low' },
    { id: 'popularity', label: 'Best selling' },
];

export const BULK_OPTIONS = [
    { id: 'above', label: 'Above' },
    { id: 'below', label: 'Below' },
    { id: 'both', label: 'Both' },
    { id: 'none', label: 'Off' },
];

export const newTable = (id) => ({
    id,
    name: `Product Table ${id}`,
    source: 'all',
    categories: [],
    tags: [],
    products: [],
    inStockOnly: false,
    columns: ['image', 'name', 'summary', 'price', 'buy'],
    showQty: true,
    bulkCart: 'above',
    showSearch: true,
    showFilters: true,
    sortBy: 'menu_order',
    perPage: 10,
    limit: 100,
});
