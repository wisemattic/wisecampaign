import React, { useEffect, useState } from "react";
import {
    Play,
    FileText,
    Video,
    MessageSquare,
    Target,
    BarChart2,
    Zap,
    Bell,
    ShoppingCart,
    Clapperboard,
    Table,
    BadgePercent,
    Check,
    Star,
    Users,
    Lightbulb,
    Heart,
    Plus,
    Minus,
    ArrowRight
} from "lucide-react";

// A module's item in the WiseCampaign admin menu
const menuItem = (slug) =>
    document.querySelector(`#toplevel_page_wisecampaign_getting_started .wp-submenu a[href$="page=${slug}"]`)?.closest("li");

/**
 * Shows or hides a module's admin menu item right away, so the page does not need a reload.
 * Turned-on items go back to their usual place: before the next module in the menu.
 */
const syncAdminMenu = (modules, id, enabled) => {
    const module = modules.find((m) => m.id === id);
    const existing = menuItem(module.menuSlug);
    if (!enabled) {
        existing?.remove();
        return;
    }
    if (existing) return;

    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = `admin.php?page=${module.menuSlug}`;
    link.textContent = module.menuTitle;
    li.appendChild(link);

    // Menu order as registered in includes/Classes/Menu.php
    const order = ["banner", "checkout", "socialproof", "wisecart", "stockbar", "wisevideo", "producttable", "discountmanager"];
    const slugOf = (mid) => modules.find((m) => m.id === mid).menuSlug;
    const index = order.indexOf(id);
    const next = order.slice(index + 1).map((mid) => menuItem(slugOf(mid))).find(Boolean);
    if (next) {
        next.before(li);
        return;
    }
    const previous = order.slice(0, index).reverse().map((mid) => menuItem(slugOf(mid))).find(Boolean)
        || menuItem("wisecampaign_getting_started");
    previous?.after(li);
};

const GettingStarted = () => {
    const isPro = window.wiseModuleData?.pro?.isLicenseActive || false;
    const version = window.wiseModuleData?.version || "1.3.1";


    // Video play state
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);
    const [videoStart, setVideoStart] = useState(0);

    const playVideo = (start = 0) => {
        setVideoStart(start);
        setIsPlayingVideo(true);
    };

    // Default modules config
    const defaultModules = [
        {
            id: "banner",
            menuSlug: "wise_banner_v2",
            menuTitle: "wiseBanner",
            title: "WiseBanner",
            desc: "High-converting banners with countdowns and animated CTAs.",
            icon: Target,
            iconColor: "text-rose-500",
            iconBg: "bg-rose-50 border border-rose-100",
            activeColor: "bg-[#F97316]",
            linkColor: "text-[#F97316] hover:text-orange-600",
            link: "admin.php?page=wise_banner_v2"
        },
        {
            id: "stockbar",
            menuSlug: "wise_stock_bar",
            menuTitle: "StockBar",
            title: "StockBar",
            desc: "Real-time stock urgency to move inventory faster.",
            icon: BarChart2,
            iconColor: "text-teal-600",
            iconBg: "bg-teal-50 border border-teal-100",
            activeColor: "bg-emerald-500",
            linkColor: "text-emerald-600 hover:text-emerald-700",
            link: "admin.php?page=wise_stock_bar"
        },
        {
            id: "checkout",
            menuSlug: "wisecampaign_checkout",
            menuTitle: "Direct Checkout",
            title: "Direct Checkout",
            desc: "Bypass the cart for lightning-fast purchasing.",
            icon: Zap,
            iconColor: "text-purple-600",
            iconBg: "bg-purple-50 border border-purple-100",
            activeColor: "bg-[#7C3AED]",
            linkColor: "text-[#7C3AED] hover:text-purple-700",
            link: "admin.php?page=wisecampaign_checkout"
        },
        {
            id: "socialproof",
            menuSlug: "wisecampaign_notification",
            menuTitle: "Sales Notification",
            title: "Social Proof",
            desc: "Real-time sales notifications to build instant trust.",
            icon: Bell,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-50 border border-amber-100",
            activeColor: "bg-amber-500",
            linkColor: "text-amber-600 hover:text-amber-700",
            link: "admin.php?page=wisecampaign_notification"
        },
        {
            id: "wisecart",
            menuSlug: "wisecampaign_cart",
            menuTitle: "wiseCart",
            title: "WiseCart",
            desc: "Premium mini-cart experience for quick access.",
            icon: ShoppingCart,
            iconColor: "text-indigo-500",
            iconBg: "bg-indigo-50 border border-indigo-100",
            activeColor: "bg-indigo-500",
            linkColor: "text-indigo-600 hover:text-indigo-700",
            link: "admin.php?page=wisecampaign_cart"
        },
        {
            id: "wisevideo",
            menuSlug: "wise_video_commerce",
            menuTitle: "WiseVideo Commerce",
            title: "WiseVideo",
            desc: "High-impact video galleries and product video replacements.",
            icon: Clapperboard,
            iconColor: "text-slate-700",
            iconBg: "bg-slate-100 border border-slate-200",
            activeColor: "bg-blue-600",
            linkColor: "text-blue-600 hover:text-blue-700",
            link: "admin.php?page=wise_video_commerce"
        },
        {
            id: "producttable",
            menuSlug: "wise_product_table",
            menuTitle: "Product Table",
            title: "Product Table",
            desc: "Fast, responsive product tables with quick ordering and custom filters.",
            icon: Table,
            iconColor: "text-cyan-600",
            iconBg: "bg-cyan-50 border border-cyan-100",
            activeColor: "bg-cyan-600",
            linkColor: "text-cyan-600 hover:text-cyan-700",
            link: "admin.php?page=wise_product_table"
        },
        {
            id: "discountmanager",
            menuSlug: "wisecampaign_discount_manager",
            menuTitle: "Discount Manager",
            title: "Discount Manager",
            desc: "Advanced conditional discounts, BOGO, bulk rules, and spend rewards.",
            icon: BadgePercent,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-50 border border-emerald-100",
            activeColor: "bg-emerald-600",
            linkColor: "text-emerald-600 hover:text-emerald-700",
            link: isPro ? "admin.php?page=wisecampaign_discount_manager" : "https://wisemattic.com/wisecampaign/pricing"
        }
    ];

    // Which modules are on. Saved on the server (includes/Classes/Modules.php); every module is on until turned off.
    const [states, setStates] = useState(() => {
        const fallback = Object.fromEntries(defaultModules.map((m) => [m.id, true]));
        try {
            const saved = JSON.parse(document.getElementById("getting-started-app")?.dataset.modules || "{}");
            return { ...fallback, ...saved };
        } catch (e) {
            return fallback;
        }
    });
    const [savingId, setSavingId] = useState(null);
    const [saveError, setSaveError] = useState("");

    // Older versions kept the switches in the browser only
    useEffect(() => {
        try {
            localStorage.removeItem("wisecampaign_modules_state");
        } catch (e) {
            // Ignore storage errors
        }
    }, []);

    useEffect(() => {
        if (!saveError) return undefined;
        const timer = setTimeout(() => setSaveError(""), 5000);
        return () => clearTimeout(timer);
    }, [saveError]);

    const modules = defaultModules.map((m) => ({ ...m, active: !!states[m.id] }));
    const activeCount = modules.filter((m) => m.active).length;

    // Discount Manager has an admin page only with an active Pro license
    const hasMenuPage = (id) => id !== "discountmanager" || isPro;

    const setModule = async (id, enabled) => {
        setStates((prev) => ({ ...prev, [id]: enabled }));
        setSavingId(id);
        setSaveError("");
        try {
            const res = await fetch(`${window.wiseModuleData?.apiUrl || "/wp-json/wisecampaign/v1/"}modules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(window.wiseModuleData?.nonce ? { "X-WP-Nonce": window.wiseModuleData.nonce } : {}),
                },
                body: JSON.stringify({ id, enabled }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message || "Could not save. Please try again.");
            setStates(payload.modules);
            if (hasMenuPage(id)) {
                syncAdminMenu(modules, id, enabled);
            }
        } catch (e) {
            setStates((prev) => ({ ...prev, [id]: !enabled }));
            setSaveError(e.message || "Could not save. Please try again.");
        } finally {
            setSavingId(null);
        }
    };

    const toggleModule = (id) => setModule(id, !states[id]);

    // FAQ state
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: "Who should use WiseCampaign?",
            a: "WiseCampaign is designed for WooCommerce store owners, marketers, and agencies who want to boost conversion rates, recover abandoned carts, and increase average order value (AOV) with proven, beautiful on-site marketing tools."
        },
        {
            q: "What are the core requirements?",
            a: "WiseCampaign requires WordPress 5.8+ and WooCommerce 4.0+. It is fully compatible with WooCommerce HPOS (High-Performance Order Storage), Block Editor, and all standard WordPress themes."
        },
        {
            q: "Can I use multiple plugins together?",
            a: "Yes! All modules in WiseCampaign (WiseBanner, StockBar, Direct Checkout, Sales Notification, WiseCart, and WiseVideo) are designed to work together seamlessly without speed bottlenecks or code conflicts."
        },
        {
            q: "Is there a free trial?",
            a: "The core WiseCampaign plugin is 100% free with essential conversion features. You can upgrade to WiseCampaign Pro with our 14-day money-back guarantee to unlock advanced dynamic discount rules, unlimited video carousels, and priority support."
        }
    ];

    return (
        <div
            className="wisecampaign-tw bg-slate-50 min-h-screen text-slate-800 antialiased"
            style={{
                backgroundColor: '#f8fafc',
                paddingTop: '28px',
                paddingBottom: '56px',
                paddingLeft: '24px',
                paddingRight: '24px',
                minHeight: '100vh',
                boxSizing: 'border-box',
                width: '100%'
            }}
        >
            <div className="max-w-[1080px] mx-auto">
                {/* TOP HEADER BAR */}
                <div className="bg-white rounded-2xl border border-slate-200/90 px-5 sm:px-6 py-3.5 mb-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Logo + Title + Subtitle */}
                    <div className="flex items-center gap-3.5">
                        <img
                            src={(window.wiseModuleData?.pluginUrl || '/wp-content/plugins/wisecampaign/') + 'images/fe/wisecampaign-icon.png'}
                            alt="WiseCampaign"
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain shrink-0"
                        />
                        <div>
                            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                WiseCampaign
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">
                                WooCommerce Conversion Suite · v{version}
                            </p>
                        </div>
                    </div>

                    {/* Right: Active Badge + Upgrade / Pro Button */}
                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Active</span>
                        </span>
                        {isPro ? (
                            <a
                                href="admin.php?page=wisecampaign_plugin_license"
                                className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-sm transition-all"
                            >
                                Pro Active
                            </a>
                        ) : (
                            <a
                                href="https://wisemattic.com/wisecampaign/pricing"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.98] text-white shadow-sm shadow-purple-500/20 transition-all"
                            >
                                Upgrade to Pro
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    {/* LEFT COLUMN: Tutorial, Modules, FAQ (col-span-8) */}
                    <div className="lg:col-span-8 space-y-5">
                        
                        {/* 1. GETTING STARTED TUTORIAL CARD */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                            {/* Card Header */}
                            <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                                        Getting Started Tutorial
                                    </h2>
                                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                                        Watch the full walkthrough — 3 min 32 sec
                                    </p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                                    Recommended
                                </span>
                            </div>

                            {/* Video Display Area */}
                            <div className="relative h-[260px] sm:h-[320px] md:h-[340px] w-full video-grid-pattern flex flex-col items-center justify-center overflow-hidden">
                                {isPlayingVideo ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/r0VXORmiFZ0?autoplay=1&rel=0${videoStart ? `&start=${videoStart}` : ''}`}
                                        title="How to Add a Halloween Top Bar to Your WooCommerce Store | wiseBanner Tutorial"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <>
                                        {/* Play Button */}
                                        <button
                                            type="button"
                                            onClick={() => playVideo()}
                                            className="w-13 h-13 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group z-10 cursor-pointer"
                                            aria-label="Play tutorial video"
                                        >
                                            <Play className="w-6 h-6 text-[#7C3AED] fill-[#7C3AED] ml-0.5 group-hover:scale-105 transition-transform" />
                                        </button>

                                        {/* Video Title */}
                                        <h3 className="text-white font-bold text-base sm:text-lg mt-3.5 tracking-tight z-10 text-center px-4">
                                            Create a Halloween top bar with wiseBanner
                                        </h3>

                                        {/* Chapter Pills */}
                                        <div className="flex items-center justify-center gap-2 mt-2.5 z-10">
                                            {[
                                                { label: "Install", start: 14 },
                                                { label: "Templates", start: 68 },
                                                { label: "Go live", start: 166 }
                                            ].map(({ label: topic, start }) => (
                                                <button
                                                    key={topic}
                                                    type="button"
                                                    onClick={() => playVideo(start)}
                                                    className="px-3 py-0.5 text-[11px] font-medium rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 backdrop-blur-sm transition-colors cursor-pointer"
                                                >
                                                    {topic}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Card Footer Links */}
                            <div className="px-5 py-3 bg-white border-t border-slate-100 flex flex-wrap items-center gap-5 text-xs font-semibold">
                                <a
                                    href="https://wisemattic.com/docs/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#7C3AED] transition-colors"
                                >
                                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Read Docs</span>
                                </a>
                                <a
                                    href="https://www.youtube.com/watch?v=6iNWZtWO2c4&list=PLgvLzizk1BA2NZ1M55IOWRMtIZJLntkA6"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#7C3AED] transition-colors"
                                >
                                    <Video className="w-3.5 h-3.5 text-slate-400" />
                                    <span>More Tutorials</span>
                                </a>
                                <a
                                    href="https://wisecampaign.canny.io/feature-requests"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#7C3AED] transition-colors"
                                >
                                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Feature Requests</span>
                                </a>
                            </div>
                        </div>

                        {/* 2. CONVERSION MODULES CARD */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                                    Your Conversion Modules
                                </h2>
                                <span className="text-xs text-slate-500 font-medium">
                                    {activeCount} of {modules.length} active
                                </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-500 -mt-2 mb-4">
                                Turn off what you don't use. A module that is off leaves the menu and stops loading on your store.
                            </p>
                            {saveError && (
                                <p role="alert" className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 -mt-1 mb-4">
                                    {saveError}
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {modules.map((m) => {
                                    const IconComponent = m.icon;
                                    return (
                                        <div
                                            key={m.id}
                                            className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 transition-all flex flex-col justify-between"
                                        >
                                            <div>
                                                {/* Top Row: Icon + Title + Switch */}
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className={`flex items-center gap-2.5 transition-opacity ${m.active ? "" : "opacity-50 grayscale"}`}>
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${m.iconBg}`}>
                                                            <IconComponent className={`w-4 h-4 ${m.iconColor}`} />
                                                        </div>
                                                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                                                            {m.title}
                                                        </h3>
                                                    </div>

                                                    {/* Toggle Switch */}
                                                    <button
                                                        type="button"
                                                        role="switch"
                                                        aria-checked={m.active}
                                                        onClick={() => toggleModule(m.id)}
                                                        disabled={savingId === m.id}
                                                        className={`wc-toggle-btn ${savingId === m.id ? "wc-toggle-saving" : ""}`}
                                                        style={{
                                                            backgroundColor: m.active
                                                                ? m.id === "banner"
                                                                    ? "#F97316"
                                                                    : m.id === "checkout"
                                                                    ? "#7C3AED"
                                                                    : m.id === "stockbar"
                                                                    ? "#10B981"
                                                                    : m.id === "socialproof"
                                                                    ? "#F59E0B"
                                                                    : m.id === "wisecart"
                                                                    ? "#6366F1"
                                                                    : m.id === "wisevideo"
                                                                    ? "#2563EB"
                                                                    : m.id === "producttable"
                                                                    ? "#0891B2"
                                                                    : "#059669"
                                                                : "#CBD5E1"
                                                        }}
                                                        aria-label={`Toggle ${m.title}`}
                                                    >
                                                        <span
                                                            aria-hidden="true"
                                                            className={`wc-toggle-knob ${m.active ? "active" : ""}`}
                                                        />
                                                    </button>
                                                </div>

                                                {/* Description */}
                                                <p className={`text-[11px] sm:text-xs text-slate-500 mt-2 leading-relaxed transition-opacity ${m.active ? "" : "opacity-60"}`}>
                                                    {m.desc}
                                                </p>
                                            </div>

                                            {/* Configure Link */}
                                            <div className="mt-3">
                                                {m.active ? (
                                                    <a
                                                        href={m.link}
                                                        className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold transition-colors ${m.linkColor}`}
                                                    >
                                                        Configure →
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-400">
                                                        Turned off
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. FREQUENTLY ASKED QUESTIONS CARD */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mb-1">
                                Frequently Asked Questions
                            </h2>

                            <div className="divide-y divide-slate-100">
                                {faqs.map((faq, index) => {
                                    const isOpen = openFaq === index;
                                    return (
                                        <div key={index} className="py-3">
                                            <button
                                                type="button"
                                                onClick={() => setOpenFaq(isOpen ? null : index)}
                                                className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                                            >
                                                <span className="font-semibold text-slate-800 text-xs sm:text-sm group-hover:text-[#7C3AED] transition-colors">
                                                    {faq.q}
                                                </span>
                                                <span className="shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors">
                                                    {isOpen ? (
                                                        <Minus className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <Plus className="w-3.5 h-3.5" />
                                                    )}
                                                </span>
                                            </button>

                                            {isOpen && (
                                                <div className="mt-2 pr-6 text-xs text-slate-600 leading-relaxed">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Quick Start, Discount Promo, Help & Community, Changelog (col-span-4) */}
                    <div className="lg:col-span-4 space-y-5">
                        
                        {/* 1. QUICK START CARD */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                                    Quick Start
                                </h3>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-[#7C3AED] border border-purple-100">
                                    ⚡ 5-Min Setup
                                </span>
                            </div>
                            
                            <p className="text-xs text-slate-600 font-medium mb-4">
                                Create your top bar banner in 5 min
                            </p>

                            {/* Checklist Content */}
                            <div className="space-y-3">
                                <div className="space-y-2.5">
                                    {/* Step 1: done while the wiseBanner module is on */}
                                    <div className="flex items-center gap-2.5">
                                        {states.banner ? (
                                            <div className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm">
                                                <Check className="w-3 h-3 stroke-[3]" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                1
                                            </div>
                                        )}
                                        <span className={`text-xs ${states.banner ? "font-medium text-slate-400 line-through" : "font-semibold text-slate-800"}`}>
                                            Activate wiseBanner module
                                        </span>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                            2
                                        </div>
                                        <span className="text-xs font-semibold text-slate-800">
                                            Customize text & countdown timer
                                        </span>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                            3
                                        </div>
                                        <span className="text-xs font-semibold text-slate-800">
                                            Choose Top / Bottom & sticky mode
                                        </span>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                            4
                                        </div>
                                        <span className="text-xs font-semibold text-slate-800">
                                            Preview & publish on your store
                                        </span>
                                    </div>
                                </div>

                                {/* Continue Setup CTA */}
                                {states.banner ? (
                                    <a
                                        href="admin.php?page=wise_banner_v2"
                                        className="w-full mt-2 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.98] text-white font-semibold rounded-xl text-center flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-500/20 text-xs"
                                    >
                                        <span>Continue Setup</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setModule("banner", true)}
                                        disabled={savingId === "banner"}
                                        className="w-full mt-2 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.98] text-white font-semibold rounded-xl text-center flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-500/20 text-xs cursor-pointer"
                                    >
                                        <span>Turn On wiseBanner</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 2. OMNIPOTENT DISCOUNT MANAGEMENT (DARK CARD) */}
                        <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm text-white relative overflow-hidden">
                            {/* Premium Pill Badge */}
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/10 text-purple-300 border border-white/10">
                                Premium
                            </span>

                            {/* Title */}
                            <h3 className="text-sm sm:text-base font-bold mt-2.5 text-white tracking-tight leading-snug">
                                Omnipotent <span className="text-[#818CF8]">Discount</span> Management
                            </h3>

                            {/* Subtitle */}
                            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed font-normal">
                                Mix pricing logic, reward customers, and drive faster checkouts — zero code.
                            </p>

                            {/* Capabilities Grid */}
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3.5 text-[10px] sm:text-[11px] text-slate-300 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-purple-400">✦</span>
                                    <span>Simple Discounts</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-purple-400">✦</span>
                                    <span>BOGO</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-purple-400">✦</span>
                                    <span>Buy X Get Y</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-purple-400">✦</span>
                                    <span>Bulk Rules</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-purple-400">✦</span>
                                    <span>Spend Rewards</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-purple-400">✦</span>
                                    <span>Next Order</span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            {isPro && !states.discountmanager ? (
                                <button
                                    type="button"
                                    onClick={() => setModule("discountmanager", true)}
                                    disabled={savingId === "discountmanager"}
                                    className="w-full mt-4 py-2.5 bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white font-semibold rounded-xl text-center flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 text-xs cursor-pointer"
                                >
                                    <span>Turn On Discount Manager</span>
                                </button>
                            ) : (
                            <a
                                href={
                                    isPro
                                        ? "admin.php?page=wisecampaign_discount_manager"
                                        : "https://wisemattic.com/wisecampaign/pricing"
                                }
                                target={isPro ? "_self" : "_blank"}
                                rel="noopener noreferrer"
                                className="w-full mt-4 py-2.5 bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white font-semibold rounded-xl text-center flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 text-xs"
                            >
                                <span>Manage Discounts</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                            )}
                        </div>

                        {/* 3. HELP & COMMUNITY CARD */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-2.5">
                                Help & Community
                            </h3>

                            <div className="divide-y divide-slate-100">
                                {/* 5-Star Support */}
                                <div className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 text-xs">
                                                5-Star Support
                                            </h4>
                                            <p className="text-slate-400 text-[10px]">
                                                Expert help, fast response
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href="https://wisemattic.com/support/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 hover:text-amber-700 font-semibold text-xs whitespace-nowrap hover:underline"
                                    >
                                        Contact Us →
                                    </a>
                                </div>

                                {/* Insiders Group */}
                                <div className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                            <Users className="w-3.5 h-3.5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 text-xs">
                                                Insiders Group
                                            </h4>
                                            <p className="text-slate-400 text-[10px]">
                                                10k+ WooCommerce members
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href="https://www.facebook.com/groups/wisemattic"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 font-semibold text-xs whitespace-nowrap hover:underline"
                                    >
                                        Join Facebook →
                                    </a>
                                </div>

                                {/* Request Feature */}
                                <div className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                                            <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 text-xs">
                                                Request Feature
                                            </h4>
                                            <p className="text-slate-400 text-[10px]">
                                                Shape the product roadmap
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href="https://wisecampaign.canny.io/feature-requests"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs whitespace-nowrap hover:underline"
                                    >
                                        Submit Idea →
                                    </a>
                                </div>

                                {/* Leave a Review */}
                                <div className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 text-xs">
                                                Leave a Review
                                            </h4>
                                            <p className="text-slate-400 text-[10px]">
                                                Your review helps us grow
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href="https://wordpress.org/plugins/wisecampaign/#reviews"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-rose-600 hover:text-rose-700 font-semibold text-xs whitespace-nowrap hover:underline"
                                    >
                                        Rate on WP →
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* 4. WHAT'S NEW IN V... CARD */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-2.5">
                                What's new in v{version}
                            </h3>

                            <div className="space-y-2.5 text-xs text-slate-600 font-medium leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <span className="text-amber-500 shrink-0 mt-0.5">⚡</span>
                                    <span><strong className="text-slate-800 font-semibold">Added:</strong> Banner Position controls (Top and Bottom placement) for wiseBanner v2.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-purple-500 shrink-0 mt-0.5">📌</span>
                                    <span><strong className="text-slate-800 font-semibold">Added:</strong> Sticky (Floating) vs. Non-Sticky mode for Top and Bottom banner positions.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-indigo-500 shrink-0 mt-0.5">✨</span>
                                    <span><strong className="text-slate-800 font-semibold">Improved:</strong> Enhanced wiseBanner editor UI with real-time live preview matching selected banner position.</span>
                                </div>
                            </div>

                            <a
                                href="https://wordpress.org/plugins/wisecampaign/#developers"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#7C3AED] hover:text-[#6D28D9] font-semibold text-xs mt-3 transition-colors"
                            >
                                <span>Full changelog</span>
                                <span>→</span>
                            </a>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default GettingStarted;
