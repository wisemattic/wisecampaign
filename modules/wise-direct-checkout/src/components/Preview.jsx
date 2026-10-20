import React from 'react';
import { AlertCircle, ImageIcon, MousePointerClick, Search, Star } from 'lucide-react';
import BuyNowButton from './BuyNowButton.jsx';

const BUTTON_FONT = { fontSize: 15, padding: '0.618em 1.3em', lineHeight: 1.5 };

// Stand-ins for the theme's own Add to Cart button and quantity field.
const AddToCart = ({ style = {}, small = false }) => (
    <span
        className="inline-flex items-center justify-center rounded-[4px] bg-slate-800 border border-solid border-slate-800 text-white font-bold whitespace-nowrap select-none"
        style={small ? { fontSize: 13, padding: '0.5em 1em', lineHeight: 1.5, ...style } : { ...BUTTON_FONT, ...style }}
    >
        Add to cart
    </span>
);

const Qty = () => (
    <span className="inline-flex items-center justify-center w-14 shrink-0 rounded-[4px] border border-solid border-slate-300 bg-white text-slate-700 text-sm font-semibold select-none" style={{ height: 43 }}>
        1
    </span>
);

const Bar = ({ className = '' }) => <div className={`rounded-full bg-slate-100 ${className}`} />;

/**
 * The single product cart form, laid out like the storefront for each placement.
 * Below 769px the storefront stacks the Buy Now button at full width.
 */
function CartForm({ position, isMobile, renderButton }) {
    const full = { width: '100%' };

    if (isMobile) {
        if (position === 'replace_add_to_cart') {
            return <div className="flex flex-col items-start gap-2.5"><Qty />{renderButton(full)}</div>;
        }
        if (position === 'before_add_to_cart') {
            return (
                <div className="flex flex-col gap-2.5">
                    {renderButton(full)}
                    <div className="flex gap-2.5"><Qty /><AddToCart /></div>
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-2.5">
                <div className="flex gap-2.5"><Qty /><AddToCart /></div>
                {renderButton(full)}
            </div>
        );
    }

    switch (position) {
        case 'before_add_to_cart':
            return <div className="flex flex-wrap items-center gap-2.5"><Qty />{renderButton()}<AddToCart /></div>;
        case 'side_by_side':
            return <div className="flex items-center gap-2.5"><Qty /><AddToCart style={{ flex: 1 }} />{renderButton({ flex: 1 })}</div>;
        case 'below_add_to_cart':
            return (
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5"><Qty /><AddToCart /></div>
                    {renderButton(full)}
                </div>
            );
        case 'replace_add_to_cart':
            return <div className="flex items-center gap-2.5"><Qty />{renderButton()}</div>;
        default:
            return <div className="flex flex-wrap items-center gap-2.5"><Qty /><AddToCart />{renderButton()}</div>;
    }
}

const HiddenNote = ({ children }) => (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-solid border-amber-200 text-amber-700 text-xs font-bold">
        <AlertCircle size={14} className="shrink-0" />
        {children}
    </div>
);

function ProductPage({ isMobile, show, position, renderButton }) {
    const info = (
        <div className={isMobile ? 'space-y-4' : 'space-y-5'}>
            <Bar className="w-20 h-3 !bg-blue-100" />
            <div className="space-y-2.5">
                <Bar className={`w-full ${isMobile ? 'h-5' : 'h-7'} !rounded-xl`} />
                <Bar className={`w-2/3 ${isMobile ? 'h-5' : 'h-7'} !rounded-xl`} />
            </div>
            <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
                <Bar className="w-16 h-2.5 ml-2" />
            </div>
            <Bar className="w-28 h-6 !bg-slate-200 !rounded-lg" />
            <div className="space-y-2">
                <Bar className="w-full h-2.5 !bg-slate-50" />
                <Bar className="w-11/12 h-2.5 !bg-slate-50" />
                <Bar className="w-3/4 h-2.5 !bg-slate-50" />
            </div>
            <div className="pt-5 border-0 border-t border-solid border-slate-100">
                {show ? (
                    <CartForm position={position} isMobile={isMobile} renderButton={renderButton} />
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5"><Qty /><AddToCart /></div>
                        <HiddenNote>Buy Now is turned off for product pages (Settings tab).</HiddenNote>
                    </div>
                )}
            </div>
            <div className="pt-5 border-0 border-t border-solid border-slate-100 space-y-2">
                <Bar className="w-40 h-2.5" />
                <Bar className="w-52 h-2.5" />
            </div>
        </div>
    );

    if (isMobile) {
        // Shorter image so the cart form shows without scrolling the phone
        return (
            <div className="p-4 space-y-5">
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
                    <ImageIcon size={36} className="text-white" strokeWidth={1.5} />
                </div>
                {info}
            </div>
        );
    }

    const image = (
        <div className="space-y-3">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
                <ImageIcon size={48} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-square rounded-xl bg-slate-100" />)}
            </div>
        </div>
    );

    return (
        <div className="p-10">
            <div className="flex items-center gap-2 mb-8">
                <Bar className="w-12 h-2.5" />
                <span className="text-slate-300 text-xs">/</span>
                <Bar className="w-16 h-2.5" />
                <span className="text-slate-300 text-xs">/</span>
                <Bar className="w-24 h-2.5 !bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-12 items-start">
                {image}
                {info}
            </div>
        </div>
    );
}

function ShopPage({ isMobile, show, renderButton }) {
    const products = isMobile ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6];

    return (
        <div className={isMobile ? 'p-4 space-y-4' : 'p-10 space-y-8'}>
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Bar className={`${isMobile ? 'w-24 h-5' : 'w-40 h-7'} !bg-slate-200 !rounded-lg`} />
                    <Bar className="w-28 h-2.5" />
                </div>
                <div className={`${isMobile ? 'w-16 h-7' : 'w-36 h-9'} rounded-lg border border-solid border-slate-200`} />
            </div>
            {!show && <HiddenNote>Buy Now is turned off for shop pages (Settings tab).</HiddenNote>}
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-3 gap-8'}`}>
                {products.map((i) => (
                    <div key={i} className="flex flex-col">
                        <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center mb-3">
                            <ImageIcon size={28} className="text-white" strokeWidth={1.5} />
                        </div>
                        <Bar className="w-3/4 h-3 mb-2" />
                        <Bar className="w-1/3 h-3 mb-3 !bg-slate-200" />
                        <AddToCart small style={{ width: '100%' }} />
                        {show && renderButton(
                            { width: '100%', fontSize: 13, padding: '0.5em 1em', marginTop: '0.5em' },
                            'wisecampaign-buy-now-loop'
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Preview({ button, icons, device, page, displayOn, position, enabled, onEnable }) {
    const isMobile = device === 'mobile';
    const renderButton = (style = {}, className = '') => (
        <BuyNowButton button={button} icons={icons} style={{ ...BUTTON_FONT, ...style }} className={className} />
    );

    const content = page === 'shop'
        ? <ShopPage isMobile={isMobile} show={displayOn.includes('shop_page')} renderButton={renderButton} />
        : <ProductPage isMobile={isMobile} show={displayOn.includes('single_product')} position={position} renderButton={renderButton} />;

    const url = page === 'shop' ? 'mysite.com/shop' : 'mysite.com/product/leather-backpack';

    return (
        <div className="relative flex-1 flex justify-center items-start p-6 sm:p-8 pt-2">
            {!enabled && (
                <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-slate-900/10">
                    <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-solid border-white flex flex-col items-center gap-4 max-w-sm text-center wdc-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="m-0 text-xl font-black text-[#0F172A] tracking-tight">Direct Checkout Is Off</h3>
                        <p className="m-0 text-slate-500 text-xs font-medium leading-relaxed">
                            Shoppers don't see the Buy Now button. Turn it on to show it on your store.
                        </p>
                        <button
                            type="button"
                            onClick={onEnable}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 text-xs"
                        >
                            Turn On Direct Checkout
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
                                <span className="truncate">{url}</span>
                            </div>
                        </div>
                        <div className="max-h-[620px] overflow-y-auto">{content}</div>
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
                            <span className="text-[11px] font-medium text-slate-500 tracking-tight">{url}</span>
                        </div>
                    </div>
                    <div className="px-10 pt-6 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-slate-900" />
                        <div className="flex gap-10">
                            <Bar className="w-16 h-3" />
                            <Bar className="w-16 h-3" />
                            <Bar className="w-16 h-3" />
                        </div>
                        <div className="w-20 h-8 rounded-full bg-slate-100" />
                    </div>
                    {content}
                </div>
            )}
        </div>
    );
}

export function PreviewHint({ hasHover }) {
    if (!hasHover) {
        return null;
    }
    return (
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <MousePointerClick size={13} />
            Point at the button to try the hover effect
        </span>
    );
}
