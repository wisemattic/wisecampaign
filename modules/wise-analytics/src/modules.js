import { BadgePercent, BarChart2, Bell, Clapperboard, ShoppingCart, Table, Target, Zap } from 'lucide-react';
import { MODULE_EVENTS } from '../../shared/moduleEvents.js';

// Name, icon and admin page per module; what their numbers mean comes from shared/moduleEvents.js
export const MODULES = {
    banner: { name: 'wiseBanner', icon: Target, tint: 'bg-rose-50 text-rose-500', page: 'wise_banner_v2', ...MODULE_EVENTS.banner },
    checkout: { name: 'Direct Checkout', icon: Zap, tint: 'bg-purple-50 text-purple-600', page: 'wisecampaign_checkout', ...MODULE_EVENTS.checkout },
    socialproof: { name: 'Sales Notification', icon: Bell, tint: 'bg-amber-50 text-amber-600', page: 'wisecampaign_notification', ...MODULE_EVENTS.socialproof },
    wisecart: { name: 'wiseCart', icon: ShoppingCart, tint: 'bg-indigo-50 text-indigo-500', page: 'wisecampaign_cart', ...MODULE_EVENTS.wisecart },
    stockbar: { name: 'StockBar', icon: BarChart2, tint: 'bg-teal-50 text-teal-600', page: 'wise_stock_bar', ...MODULE_EVENTS.stockbar },
    wisevideo: { name: 'WiseVideo', icon: Clapperboard, tint: 'bg-slate-100 text-slate-700', page: 'wise_video_commerce', ...MODULE_EVENTS.wisevideo },
    producttable: { name: 'Product Table', icon: Table, tint: 'bg-cyan-50 text-cyan-600', page: 'wise_product_table', ...MODULE_EVENTS.producttable },
    discountmanager: { name: 'Discount Manager', icon: BadgePercent, tint: 'bg-emerald-50 text-emerald-600', page: 'wisecampaign_discount_manager', ...MODULE_EVENTS.discountmanager },
};
