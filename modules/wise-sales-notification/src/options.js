// Option ids must match the whitelists in includes/features/SalesNotification.php.

export const TEMPLATES = [
    { id: 'template_1', label: 'Classic Card', desc: 'Rounded card, square photo', pro: false },
    { id: 'template_2', label: 'Modern Pill', desc: 'Capsule with round photo', pro: false },
    { id: 'template_3', label: 'Frosted Glass', desc: 'See-through blur', pro: true },
    { id: 'template_4', label: 'Minimalist Micro', desc: 'Compact for mobile', pro: true },
    { id: 'template_5', label: 'Gradient Accent', desc: 'Colored left stripe', pro: true },
    { id: 'template_6', label: 'Dark Mode Neo', desc: 'Dark with cyan accent', pro: true },
];

export const PRO_TEMPLATES = TEMPLATES.filter((t) => t.pro).map((t) => t.id);

// Picking a template also loads its look into the style controls.
export const TEMPLATE_PRESETS = {
    template_1: { background_color: '#FFFFFF', border_color: '#FFFFFF', border_width: 0, border_radius: 10, image_radius: 10 },
    template_2: { background_color: '#FFFFFF', border_color: '#FFFFFF', border_width: 0, border_radius: 100, image_radius: 50 },
    template_3: { background_color: '#FFFFFF', border_color: '#E2E8F0', border_width: 1, border_radius: 16, image_radius: 12 },
    template_4: { background_color: '#FFFFFF', border_color: '#E2E8F0', border_width: 1, border_radius: 8, image_radius: 6 },
    template_5: { background_color: '#FFFFFF', border_color: '#776EFF', border_width: 0, border_radius: 12, image_radius: 8 },
    template_6: { background_color: '#0F172A', border_color: '#334155', border_width: 1, border_radius: 14, image_radius: 10 },
};

// Style settings each template replaces with its own look (see notification-frontend.css).
export const TEMPLATE_OVERRIDES = {
    template_1: [],
    template_2: ['border_radius', 'image_radius'],
    template_3: ['background_color', 'border_color', 'border_width', 'border_radius', 'image_radius'],
    template_4: ['border_color', 'border_width', 'border_radius', 'image_radius'],
    template_5: ['border_radius', 'image_radius'],
    template_6: ['background_color', 'border_color', 'border_width', 'border_radius', 'image_radius'],
};

export const POSITIONS = [
    { id: 'top-left', label: 'Top Left' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'bottom-right', label: 'Bottom Right' },
];

export const FONTS = ['Poppins', 'Roboto', 'Open Sans', 'Lato'];

export const SOURCES = [
    { id: 'recent_orders', label: 'Recent Orders', desc: 'Your latest completed orders', wc: true, pro: false },
    { id: 'selected_orders', label: 'Selected Orders', desc: 'Hand-pick the orders to show', wc: true, pro: false },
    { id: 'virtual_orders', label: 'Simulated Orders', desc: 'Your own buyer names, places and products', wc: false, pro: true },
];

export const PRODUCT_MODES = [
    { id: 'all_products', label: 'All Products', desc: 'Any published product', wc: true },
    { id: 'selected_products', label: 'Selected Products', desc: 'Only the ones you pick', wc: true },
    { id: 'custom_products', label: 'Custom Products', desc: 'Type in products or services', wc: false },
];
