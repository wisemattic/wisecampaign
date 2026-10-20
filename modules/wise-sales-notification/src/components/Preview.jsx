import React from 'react';
import { AlertCircle, ImageIcon, Search } from 'lucide-react';

// Where the storefront puts the popup (notification-frontend.css position classes).
const DESKTOP_OFFSETS = {
    'bottom-left': { bottom: 45, left: 40 },
    'bottom-right': { bottom: 45, right: 40 },
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
};

/**
 * The storefront popup, built with the same markup and classes as notification-frontend.js
 * so the storefront stylesheet draws it identically. `look` holds the effective settings.
 */
export function NotificationPopup({ look, item, isMobile }) {
    const hasLink = item.product_url && item.product_url !== '#';
    return (
        <div
            className={`wisecampaign-notification-popup ${hasLink ? 'wisecampaign-clickable' : ''}`}
            data-template={look.template}
            style={{
                backgroundColor: look.background_color,
                borderColor: look.border_color,
                borderWidth: `${look.border_width}px`,
                borderStyle: 'solid',
                borderRadius: `${look.border_radius}px`,
                fontFamily: `'${look.font_family}', sans-serif`,
                cursor: hasLink ? 'pointer' : 'default',
                // Same as the storefront's small-screen rule
                ...(isMobile ? { width: '100%', boxSizing: 'border-box' } : {}),
            }}
        >
            <img
                src={item.product_image}
                alt={item.image_type === 'avatar' ? item.buyer : item.product_name}
                className={item.image_type ? `is-${item.image_type}` : ''}
                style={{ borderRadius: `${look.image_radius}px`, ...(isMobile ? { width: 72, height: 72, marginRight: 14 } : {}) }}
            />
            <div className="notification-content">
                <div className="notification-body">
                    <p className="buyer-info">
                        <span className="buyer-name">{item.buyer}</span> just purchased
                    </p>
                    <p className="product-name">{item.product_name}</p>
                    <p className="location-info">From: <span className="location">{item.location}</span></p>
                </div>
                <div className="notification-footer">
                    <p className="timestamp">{item.time}</p>
                    {!look.hideBranding && (
                        <p className="brand-credit">
                            <span style={{ textDecoration: 'none', color: 'inherit' }}>by <b>wiseCampaign</b></span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

const Bar = ({ className = '' }) => <div className={`rounded-full bg-slate-100 ${className}`} />;

function StorePage({ isMobile }) {
    if (isMobile) {
        return (
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-0 border-b border-solid border-slate-100">
                    <div className="w-5 h-3 flex flex-col justify-between">
                        <span className="w-full h-0.5 bg-slate-800 rounded-full" />
                        <span className="w-full h-0.5 bg-slate-800 rounded-full" />
                        <span className="w-3/4 h-0.5 bg-slate-800 rounded-full" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-900" />
                    <div className="w-6 h-6 rounded-lg bg-slate-100" />
                </div>
                <div className="aspect-[16/9] bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl flex flex-col justify-end p-3">
                    <div className="w-2/3 h-3 bg-white/80 rounded-full mb-1.5" />
                    <div className="w-1/2 h-2.5 bg-white/60 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-100 rounded-xl" />
                            <Bar className="h-2.5 w-3/4" />
                            <Bar className="h-2 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-10">
            <div className="flex items-center justify-between mb-10">
                <div className="w-10 h-10 rounded-full bg-slate-900" />
                <div className="flex gap-10">
                    <Bar className="w-16 h-3" />
                    <Bar className="w-16 h-3" />
                    <Bar className="w-16 h-3" />
                </div>
                <div className="w-20 h-8 rounded-full bg-slate-100" />
            </div>
            <div className="flex items-center gap-12 mb-12">
                <div className="flex-1 space-y-5">
                    <Bar className="w-24 h-4 !bg-blue-100" />
                    <div className="space-y-3">
                        <div className="w-full h-9 rounded-2xl bg-slate-100" />
                        <div className="w-3/4 h-9 rounded-2xl bg-slate-100" />
                    </div>
                    <div className="space-y-2">
                        <Bar className="w-2/3 h-3 !bg-slate-50" />
                        <Bar className="w-1/2 h-3 !bg-slate-50" />
                    </div>
                    <div className="flex gap-4 pt-1">
                        <div className="w-28 h-10 rounded-2xl bg-slate-900" />
                        <div className="w-28 h-10 rounded-2xl border border-solid border-slate-200" />
                    </div>
                </div>
                <div className="w-[38%] aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-200 to-slate-100 shrink-0 flex items-center justify-center">
                    <ImageIcon size={40} className="text-white" strokeWidth={1.5} />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-3">
                        <div className="aspect-[4/3] bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl" />
                        <Bar className="h-3 w-2/3" />
                        <Bar className="h-3 w-1/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Preview({ look, item, visible, device, position, emptyReason, enabled, onEnable }) {
    const isMobile = device === 'mobile';
    const offsets = isMobile
        ? { ...(position.startsWith('top') ? { top: 20 } : { bottom: 45 }), left: 12, right: 12 }
        : DESKTOP_OFFSETS[position] || DESKTOP_OFFSETS['bottom-left'];

    const popup = item ? (
        <div id="wisecampaign-notification-container" className={visible ? 'show' : ''} style={offsets}>
            <NotificationPopup look={look} item={item} isMobile={isMobile} />
        </div>
    ) : (
        <div className="absolute inset-x-0 bottom-6 flex justify-center px-6 z-10">
            <div className="flex items-start gap-2 max-w-md px-4 py-3 rounded-xl bg-amber-50 border border-solid border-amber-200 text-amber-700 text-xs font-bold shadow-sm">
                <AlertCircle size={15} className="shrink-0 mt-px" />
                <span>{emptyReason}</span>
            </div>
        </div>
    );

    return (
        <div className="relative flex-1 flex justify-center items-start p-6 sm:p-8 pt-2">
            {!enabled && (
                <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-slate-900/10">
                    <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-solid border-white flex flex-col items-center gap-4 max-w-sm text-center wsn-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="m-0 text-xl font-black text-[#0F172A] tracking-tight">Sales Notification Is Off</h3>
                        <p className="m-0 text-slate-500 text-xs font-medium leading-relaxed">
                            Visitors don't see any purchase popups. Turn it on to show them on your site.
                        </p>
                        <button
                            type="button"
                            onClick={onEnable}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 text-xs"
                        >
                            Turn On Sales Notification
                        </button>
                    </div>
                </div>
            )}

            {isMobile ? (
                <div className="w-[375px] max-w-full bg-slate-900 rounded-[44px] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.3)] border-4 border-solid border-slate-800 flex flex-col my-2">
                    <div className="px-5 pt-1 pb-2 flex items-center justify-between text-white text-[11px] font-semibold select-none">
                        <span>9:41</span>
                        <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-slate-800 ml-auto mr-1.5" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] opacity-80">
                            <span>5G</span>
                            <span>100%</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-[32px] overflow-hidden flex flex-col">
                        <div className="bg-slate-100 px-3 py-1.5 border-0 border-b border-solid border-slate-200">
                            <div className="bg-white h-6 rounded-full flex items-center px-3 gap-2 border border-solid border-slate-200 text-[10px] text-slate-600 font-medium justify-center">
                                <Search size={10} className="text-slate-400" />
                                <span>mysite.com</span>
                            </div>
                        </div>
                        <div className="relative h-[600px] overflow-hidden">
                            <StorePage isMobile />
                            {popup}
                        </div>
                        <div className="py-2 bg-white flex justify-center">
                            <div className="w-28 h-1 bg-slate-300 rounded-full" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-[1100px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-solid border-slate-200 overflow-hidden flex flex-col">
                    <div className="bg-[#F8FAFC] px-6 py-2.5 border-0 border-b border-solid border-slate-200 flex items-center gap-4 shrink-0">
                        <div className="flex gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                        </div>
                        <div className="flex-1 max-w-3xl mx-auto bg-white h-7 rounded-lg flex items-center px-4 gap-3 border border-solid border-slate-200/60 shadow-sm">
                            <Search size={12} className="text-slate-300" />
                            <span className="text-[11px] font-medium text-slate-500 tracking-tight">mysite.com</span>
                        </div>
                    </div>
                    <div className="relative h-[640px] overflow-hidden">
                        <StorePage />
                        {popup}
                    </div>
                </div>
            )}
        </div>
    );
}
