import React from "react";

const GettingStarted = () => {
    return (
        <div className="wisecampaign-tw bg-slate-50 min-h-screen">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-400 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -left-[10%] w-[35%] h-[35%] bg-purple-400 blur-[120px] rounded-full" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-16">
                {/* Hero Section */}
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border border-white shadow-sm rounded-full mb-8 hover:scale-105 transition-transform cursor-default">
                        <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
                            Welcome to WiseCampaign
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]">
                        Transform your <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">WooCommerce</span> store with intelligence
                    </h1>

                    <p className="max-w-3xl mx-auto text-xl text-slate-500 font-medium leading-relaxed mb-12">
                        Everything you need to boost conversions, drive more sales, and create a premium shopping experience effortlessly.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                        <a
                            href="https://www.youtube.com/watch?v=_izkuOj0faE&list=PLgvLzizk1BA2NZ1M55IOWRMtIZJLntkA6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 transition-all active:scale-95"
                        >
                            Watch Tutorials
                        </a>
                        <a
                            href="https://wisemattic.com/docs/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold border border-slate-200 shadow-xl shadow-slate-100 hover:bg-slate-50 hover:-translate-y-1 transition-all active:scale-95"
                        >
                            Read Documentation
                        </a>
                        <a
                            href="https://wisecampaign.canny.io/feature-requests"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
                        >

                            Feature Requests
                        </a>
                    </div>
                </div>

                {/* Core Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {[
                        {
                            title: "WiseBanner",
                            desc: "High-converting banners with countdowns and animated CTAs.",
                            icon: "🎯",
                            color: "from-blue-500 to-indigo-600"
                        },
                        {
                            title: "StockBar",
                            desc: "Real-time stock urgency to move inventory faster.",
                            icon: "📊",
                            color: "from-emerald-500 to-teal-600"
                        },
                        {
                            title: "Direct Checkout",
                            desc: "Bypass the cart for lightning-fast purchasing.",
                            icon: "🛒",
                            color: "from-amber-500 to-orange-600"
                        },
                        {
                            title: "Social Proof",
                            desc: "Real-time sales notifications to build instant trust.",
                            icon: "🔔",
                            color: "from-rose-500 to-pink-600"
                        },
                        {
                            title: "WiseCart",
                            desc: "Premium mini-cart experience for quick access.",
                            icon: "🛍️",
                            color: "from-violet-500 to-purple-600"
                        },
                        {
                            title: "Ready to Scale",
                            desc: "Built to handle high traffic and complex rules.",
                            icon: "⚡",
                            color: "from-cyan-500 to-blue-600"
                        }
                    ].map((m, idx) => (
                        <div key={idx} className="group relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300">
                            <div className={`w-14 h-14 bg-gradient-to-br ${m.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                                {m.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">{m.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">{m.desc}</p>
                        </div>
                    ))}
                </div>

                {/* PREMIUM SECTION: DISCOUNT MANAGER */}
                <div className="relative mb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900 rounded-[3.5rem] -rotate-1 skew-y-1" />
                    <div className="relative bg-slate-900 p-12 md:p-20 rounded-[3.5rem] border border-slate-800">
                        <div className="flex flex-col lg:flex-row gap-16 items-start">
                            <div className="lg:w-1/3">
                                <span className="inline-block px-4 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest rounded-full mb-6 border border-blue-500/30">
                                    Premium Capability
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                                    Omnipotent <span className="text-blue-500">Discount</span> Management
                                </h2>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
                                    Mix and match pricing logic, reward loyal customers, and drive faster checkouts – all without writing a single line of code.
                                </p>
                                <a href="https://wisemattic.com/wisecampaign/pricing" target="_blank" className="inline-flex items-center gap-2 text-white bg-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 hover:-translate-y-1 transition-all">
                                    Upgrade to Pro
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                </a>
                            </div>

                            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {[
                                    {
                                        title: "Simple Discounts",
                                        desc: "Storewide offers or conditional deals like 10% off everything or $5 off specific categories.",
                                        icon: "🏷️"
                                    },
                                    {
                                        title: "Total Spend Rewards",
                                        desc: "Automatically reward big spenders: e.g., $10 off when spending over $100.",
                                        icon: "💰"
                                    },
                                    {
                                        title: "Free Products (BOGO)",
                                        desc: "Create 3-for-2 or Buy 1 Get 1 Free offers to clear inventory fast.",
                                        icon: "🎁"
                                    },
                                    {
                                        title: "Bundle Pricing",
                                        desc: "Sell in bulk: 10 items for $100 or 2 for $25. Perfect for increasing quantities.",
                                        icon: "📦"
                                    },
                                    {
                                        title: "Buy X, Get Y",
                                        desc: "Advanced upsell logic: Give 10% off when someone buys 5 specific products.",
                                        icon: "🔄"
                                    },
                                    {
                                        title: "Tiered Bulk Rules",
                                        desc: "Scale discounts based on volume: Buy 10+ and save 20%.",
                                        icon: "📈"
                                    },
                                    {
                                        title: "Next Order Coupons",
                                        desc: "Reward buyers with automated coupons for their next trip to your store.",
                                        icon: "🎟️"
                                    }
                                ].map((d, i) => (
                                    <div key={i} className="group bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-xl shrink-0">
                                                {d.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold mb-2 group-hover:text-blue-400 transition-colors">{d.title}</h4>
                                                <p className="text-slate-400 text-sm leading-relaxed">{d.desc}</p>
                                                <a href="https://wisemattic.com/docs/" target="_blank" className="inline-block mt-3 text-xs font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all">Learn More →</a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                    {[
                        {
                            label: "Support",
                            title: "5-Star Global Support",
                            desc: "Need help? Our expert team is standing by to assist your store.",
                            action: "Contact Us",
                            link: "https://wisemattic.com/contact-us",
                            icon: "💬"
                        },
                        {
                            label: "Community",
                            title: "WiseCampaign Insiders",
                            desc: "Connect with thousands of owners sharing success strategies.",
                            action: "Join Facebook Group",
                            link: "https://www.facebook.com/groups/wisemattic",
                            icon: "👥"
                        },
                        {
                            label: "Feedback",
                            title: "Shape our Future",
                            desc: "Submit feature requests and help us decide what to build next.",
                            action: "Submit Request",
                            link: "https://wisecampaign.canny.io/feature-requests",
                            icon: "💡"
                        },
                        {
                            label: "Reviews",
                            title: "Help Us Grow",
                            desc: "If WiseCampaign is helping you, we'd love a quick review.",
                            action: "Review on WordPress",
                            link: "https://wordpress.org/plugins/wisecampaign/#reviews",
                            icon: "⭐"
                        }
                    ].map((c, i) => (
                        <div key={i} className="flex flex-col bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 items-center text-center hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-6">{c.icon}</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">{c.label}</span>
                            <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight">{c.title}</h3>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{c.desc}</p>
                            <a href={c.link} target="_blank" className="mt-auto px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                                {c.action}
                            </a>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="bg-slate-900 overflow-hidden rounded-[3.5rem] shadow-2xl">
                    <div className="p-12 md:p-20">
                        <h2 className="text-4xl font-black text-white text-center mb-16">Intelligence Archive (FAQ)</h2>
                        <div className="max-w-3xl mx-auto space-y-4">
                            {[
                                {
                                    q: "Who should use WiseCampaign?",
                                    a: "Every store owner looking for professional-grade marketing tools. Whether you're a boutique or a high-volume retailer, WiseCampaign scales with you."
                                },
                                {
                                    q: "What are the core requirements?",
                                    a: "Just the latest version of WordPress and WooCommerce. WiseCampaign is optimized for full site editing and all modern themes."
                                }
                            ].map((faq, i) => (
                                <details key={i} className="group bg-slate-800/50 rounded-2xl border border-slate-700/50 transition-all [&_summary::-webkit-details-marker]:hidden">
                                    <summary className="flex cursor-pointer items-center justify-between p-6">
                                        <h3 className="text-lg font-bold text-white pr-8">{faq.q}</h3>
                                        <div className="bg-slate-700 p-2 rounded-lg group-open:bg-blue-600 transition-colors">
                                            <svg className="h-5 w-5 text-white transition-transform group-open:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                    </summary>
                                    <div className="px-6 pb-6 pt-0">
                                        <div className="h-px bg-slate-700 mb-6" />
                                        <p className="text-slate-400 leading-relaxed font-medium">{faq.a}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GettingStarted;
