// Option ids must match the whitelists in includes/features/direct-checkout.php.

export const DEFAULT_SETTINGS = {
    dc_enabled: '0',
    dc_button_text: 'Buy Now',
    dc_button_color: '#007cba',
    dc_button_text_color: '#ffffff',
    dc_button_template: 'classic',
    dc_button_icon: 'none',
    dc_icon_position: 'left',
    dc_button_animation: 'none',
    dc_button_hover: 'none',
    dc_button_position: 'after_add_to_cart',
    dc_redirect_to: 'checkout',
    dc_redirect_custom_url: '',
    dc_display_on: [],
};

// Settings that only take effect with a PRO license.
export const PRO_KEYS = ['dc_button_template', 'dc_button_icon', 'dc_button_animation', 'dc_button_hover', 'dc_button_position'];

export const TEMPLATES = [
    { id: 'classic', label: 'Classic', pro: false },
    { id: 'pill', label: 'Rounded Pill', pro: true },
    { id: 'outline', label: 'Outline', pro: true },
    { id: 'gradient', label: 'Gradient Shine', pro: true },
    { id: 'raised', label: '3D Raised', pro: true },
    { id: 'glow', label: 'Soft Glow', pro: true },
    { id: 'soft', label: 'Soft Tint', pro: true },
    { id: 'block', label: 'Bold Block', pro: true },
];

export const ICONS = [
    { id: 'none', label: 'None' },
    { id: 'bolt', label: 'Bolt' },
    { id: 'bag', label: 'Bag' },
    { id: 'lock', label: 'Lock' },
    { id: 'cart', label: 'Cart' },
    { id: 'arrow', label: 'Arrow' },
];

export const ANIMATIONS = [
    { id: 'none', label: 'None', icon: '🚫' },
    { id: 'pulse', label: 'Pulse', icon: '💫' },
    { id: 'shimmer', label: 'Shimmer', icon: '✨' },
    { id: 'shake', label: 'Shake', icon: '📳' },
    { id: 'bounce', label: 'Bounce', icon: '🏀' },
    { id: 'heartbeat', label: 'Heartbeat', icon: '💓' },
    { id: 'wobble', label: 'Wobble', icon: '〰️' },
    { id: 'radiate', label: 'Radiate', icon: '🌟' },
    { id: 'tada', label: 'Tada', icon: '🎉' },
];

export const HOVER_EFFECTS = [
    { id: 'none', label: 'None', icon: '🚫' },
    { id: 'lift', label: 'Lift', icon: '⬆️' },
    { id: 'grow', label: 'Grow', icon: '🔍' },
    { id: 'shine', label: 'Shine', icon: '💡' },
    { id: 'glow', label: 'Glow', icon: '🔆' },
    { id: 'icon_pop', label: 'Icon Pop', icon: '🎯' },
];

export const POSITIONS = [
    { id: 'after_add_to_cart', label: 'After Add to Cart', desc: 'Next to the cart button (default)', pro: false },
    { id: 'before_add_to_cart', label: 'Before Add to Cart', desc: 'Buy Now comes first', pro: true },
    { id: 'side_by_side', label: 'Side by Side', desc: 'Two equal buttons in one row', pro: true },
    { id: 'below_add_to_cart', label: 'Below, Full Width', desc: 'Stacked under the cart button', pro: true },
    { id: 'replace_add_to_cart', label: 'Replace Add to Cart', desc: '1-click store: only Buy Now', pro: true },
];

export const COLOR_PRESETS = [
    { bg: '#007cba', text: '#ffffff' },
    { bg: '#4f46e5', text: '#ffffff' },
    { bg: '#059669', text: '#ffffff' },
    { bg: '#e11d48', text: '#ffffff' },
    { bg: '#ea580c', text: '#ffffff' },
    { bg: '#0f172a', text: '#ffffff' },
    { bg: '#facc15', text: '#111827' },
];
