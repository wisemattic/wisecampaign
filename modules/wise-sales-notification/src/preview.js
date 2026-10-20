// Builds the notifications the storefront would show for the current (unsaved) settings.
// Mirrors SalesNotification::get_notification_data(); keep the two in sync.

const TIME_OPTIONS = [
    '3 minutes ago', '7 minutes ago', '15 minutes ago', '28 minutes ago', '45 minutes ago',
    '1 hour ago', '2 hours ago', '5 hours ago', '8 hours ago', '14 hours ago',
    '19 hours ago', '22 hours ago', '1 day ago', '2 days ago', '3 days ago',
];

const DEMO_ITEMS = [
    'Premium Wireless Headphones',
    'Smart Fitness Watch',
    'Ultra-Comfort Sneakers',
    'Minimalist Leather Wallet',
    'Stainless Steel Water Bottle',
];

// Must match SalesNotification::get_avatar_for_name() (djb2 over code points).
export function avatarForName(name, avatars) {
    if (!avatars.length) return '';
    let hash = 5381;
    for (const ch of String(name)) {
        hash = ((hash * 33) + ch.codePointAt(0)) >>> 0;
    }
    return avatars[hash % avatars.length];
}

// "Product name | https://link" per line; the link is optional.
export function parseCustomProducts(raw) {
    return String(raw || '')
        .split(/\r\n|\r|\n/)
        .map((line) => {
            // Split on the first "|" only, like explode('|', $line, 2)
            const cut = line.indexOf('|');
            return cut === -1
                ? { name: line.trim(), url: '' }
                : { name: line.slice(0, cut).trim(), url: line.slice(cut + 1).trim() };
        })
        .filter((p) => p.name !== '');
}

export function effectiveSource(settings, hasWc) {
    if (!hasWc && ['recent_orders', 'selected_orders'].includes(settings.source)) {
        return 'virtual_orders';
    }
    return settings.source;
}

export function effectiveProductsMode(settings, hasWc) {
    return hasWc ? settings.virtual_products_mode : 'custom_products';
}

function virtualItems(settings, data) {
    const { defaults, products, avatars, placeholderImage, customImages, hasWc } = data;
    const fallbackImage = `${window.wiseModuleData?.pluginUrl || ''}images/fe/wc_logo.png`;

    let names = String(settings.virtual_names || defaults.virtual_names).split(/[\r\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (!names.length) names = ['Sarah M.', 'Alex K.', 'David R.', 'Emily W.', 'Michael B.'];

    let locations = String(settings.virtual_locations || defaults.virtual_locations).split(/[\r\n]+/).map((s) => s.trim()).filter(Boolean);
    if (!locations.length) locations = ['New York, USA', 'London, UK', 'Toronto, Canada', 'Sydney, Australia'];

    const mode = effectiveProductsMode(settings, hasWc);
    let catalog = [];
    if (mode === 'custom_products') {
        catalog = parseCustomProducts(settings.virtual_custom_products).map((p) => ({ ...p, image: '' }));
    } else {
        const selected = settings.virtual_selected_products;
        const pool = mode === 'selected_products' && selected.length ? products.filter((p) => selected.includes(p.id)) : products.slice(0, 15);
        catalog = pool.map((p) => ({ name: p.name, url: p.url, image: p.image }));
        if (!catalog.length) {
            catalog = DEMO_ITEMS.map((name) => ({ name, url: '#', image: placeholderImage }));
        }
    }

    if (!catalog.length) {
        return { items: [], reason: 'Type at least one product under Custom Products in the Content tab.' };
    }

    const imageFor = (index, buyer, productImage) => {
        if (settings.virtual_image_type === 'buyer' && avatars.length) {
            return { url: avatarForName(buyer, avatars), type: 'avatar' };
        }
        if (customImages.length) {
            return { url: customImages[index % customImages.length].url, type: 'custom' };
        }
        if (productImage) {
            return { url: productImage, type: 'product' };
        }
        // Custom products have no photo of their own; the buyer's avatar looks better than a placeholder.
        if (avatars.length) {
            return { url: avatarForName(buyer, avatars), type: 'avatar' };
        }
        return { url: fallbackImage, type: 'product' };
    };

    const total = Math.max(names.length, locations.length, 12);
    const items = [];
    for (let i = 0; i < total; i++) {
        const entry = catalog[i % catalog.length];
        const buyer = names[i % names.length];
        const image = imageFor(i, buyer, entry.image);
        items.push({
            product_name: entry.name,
            product_image: image.url,
            image_type: image.type,
            product_url: entry.url,
            buyer,
            time: TIME_OPTIONS[i % TIME_OPTIONS.length],
            location: locations[i % locations.length],
        });
    }
    return { items, reason: '' };
}

function orderItems(orders) {
    return orders.flatMap((order) => order.items.map((item) => ({
        product_name: item.name,
        product_image: item.image,
        image_type: '',
        product_url: item.url,
        buyer: order.buyer,
        time: order.time,
        location: order.location,
    })));
}

/**
 * Returns { items, reason }: the notifications to preview, or why the storefront would show none.
 */
export function buildPreviewItems(settings, data) {
    const source = effectiveSource(settings, data.hasWc);

    if (source === 'virtual_orders') {
        if (!data.isPro) {
            return {
                items: [],
                reason: data.hasWc
                    ? 'Simulated orders need a PRO license. Pick Recent or Selected Orders in the Content tab.'
                    : 'Without WooCommerce, notifications use simulated orders, which need a PRO license.',
            };
        }
        return virtualItems(settings, data);
    }

    const completed = data.orders.filter((o) => o.status === 'completed');

    if (source === 'selected_orders') {
        if (!settings.selected_orders.length) {
            return { items: [], reason: 'Pick at least one order under Selected Orders in the Content tab.' };
        }
        const items = orderItems(completed.filter((o) => settings.selected_orders.includes(o.id)));
        return { items, reason: items.length ? '' : 'None of the selected orders is completed yet. Only completed orders are shown.' };
    }

    const items = orderItems(completed.slice(0, 10));
    return { items, reason: items.length ? '' : 'No completed orders yet. Notifications start after your first completed order.' };
}
