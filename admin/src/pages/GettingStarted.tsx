import React from "react";

const GettingStarted: React.FC = () => {
  return (
    <div className="wisecampaign-tw bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-4 py-1.5 rounded-full">
            Welcome to WiseCampaign
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Take your marketing campaigns to the next level
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            A powerful WooCommerce add-on that helps you create high-converting marketing campaigns
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <a
              href="https://www.youtube.com/watch?v=_izkuOj0faE&list=PLgvLzizk1BA2NZ1M55IOWRMtIZJLntkA6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Watch Tutorial
            </a>
            <a
              href="https://wisemattic.com/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Documentation
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "WiseBanner",
              description: "Create high-converting banners with countdown timers, animated text, and call-to-action buttons",
              icon: "🎯"
            },
            {
              title: "WooCommerce StockBar",
              description: "Show real-time stock levels to create urgency and promote products effectively",
              icon: "📊"
            },
            {
              title: "Direct Checkout",
              description: "Enable seamless shopping experience, reducing cart abandonment",
              icon: "🛒"
            },
            {
              title: "Sales Notifications",
              description: "Display social proof notifications to build trust and encourage purchases",
              icon: "🔔"
            },
            {
              title: "WiseCart",
              description: "Enhance shopping with customizable mini cart for quick access",
              icon: "🛍️"
            },
            {
              title: "Easy Integration",
              description: "Seamlessly works with your existing WooCommerce setup",
              icon: "⚡"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Support Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "Get 5-star Support",
              description: "Need help? Our awesome support team is here for you.",
              linkText: "Get Support →",
              link: "https://wisemattic.com/contact-us",
              icon: "💬"
            },
            {
              title: "Join the Community",
              description: "Connect with other WiseCampaign users and share experiences.",
              linkText: "Join Now →",
              link: "https://www.facebook.com/groups/wisemattic",
              icon: "👥"
            },
            {
              title: "Rate Us",
              description: "Love WiseCampaign? We'd appreciate your review.",
              linkText: "Submit a Review →",
              link: "https://wordpress.org/plugins/wisecampaign/#reviews",
              icon: "⭐"
            }
          ].map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
              <p className="text-gray-600 mb-6">{card.description}</p>
              <a
                href={card.link}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
              >
                {card.linkText}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto divide-y divide-gray-200">
            {[
              {
                question: "Who should use WiseCampaign?",
                answer: "This plugin is for everyone who wants to sell products or services with a new level of marketing capabilities."
              },
              {
                question: "What are the requirements to use WiseCampaign?",
                answer: "You only need to have the latest version of WordPress on your website. WiseCampaign is an addon for the default WordPress editor, so the latest WordPress installation along with a theme is sufficient to get started."
              }
            ].map((faq, index) => (
              <details
                key={index}
                className="group py-4 [&_summary::-webkit-details-marker]:hidden"
                open={index === 0}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-1.5">
                  <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                  <span className="shrink-0 transition duration-300">
                    <svg
                      className="h-5 w-5 rotate-0 transform text-gray-500 group-open:rotate-45"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
