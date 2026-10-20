import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductTable from './ProductTable.jsx';

/**
 * Storefront entry: mounts every [product_table] on the page. Each shortcode prints a
 * .wpt-root element and a JSON script with the same data-wpt-instance.
 */

const config = window.wiseProductTable || {};

async function addToCart(tableId, productId, quantity, variationId, attributes) {
    // wisecampaign_source and _object credit the sale to this table in WiseCampaign Analytics
    const body = new URLSearchParams({
        product_id: productId,
        quantity,
        variation_id: variationId || 0,
        wisecampaign_source: 'producttable',
        wisecampaign_object: tableId || 0,
    });
    Object.entries(attributes || {}).forEach(([key, value]) => body.append(`variation[${key}]`, value));

    try {
        const res = await fetch(config.addToCartUrl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        const data = await res.json();
        if (!data || data.error) {
            return { ok: false, message: data?.message || 'Could not add to cart.', url: data?.product_url };
        }
        // Lets the theme's mini cart and wiseCart refresh, like WooCommerce's own buttons do
        if (window.jQuery) {
            window.jQuery(document.body).trigger('added_to_cart', [data.fragments, data.cart_hash, null]);
        }
        return { ok: true };
    } catch (e) {
        return { ok: false, message: 'Could not add to cart. Please try again.' };
    }
}

document.querySelectorAll('.wpt-root').forEach((root) => {
    const script = document.querySelector(`.wpt-data[data-wpt-instance="${root.dataset.wptInstance}"]`);
    if (!script) return;
    let data;
    try {
        data = JSON.parse(script.textContent);
    } catch (e) {
        return;
    }
    (window.wiseTrackQueue = window.wiseTrackQueue || []).push(['producttable', 'view', data.table.id]);
    ReactDOM.createRoot(root).render(
        <ProductTable
            table={data.table}
            products={data.products}
            design={data.design}
            labels={data.labels}
            currency={config.currency}
            onAddToCart={(...args) => addToCart(data.table.id, ...args)}
        />,
    );
});
