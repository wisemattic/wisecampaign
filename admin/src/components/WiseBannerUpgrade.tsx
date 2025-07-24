import React from 'react';
import upgradeBg from "../assets/upgrade_background.png"
const WiseBannerUpgrade: React.FC = () => {
    return (
        <div className="w-full bg-white rounded-lg shadow-lg p-6 mx-auto mt-8 relative">
            {/* Banner Content */}
            <div className="flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                    Need to Upgrades
                </h2>
                <div className="flex flex-col space-y-2">
                    <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-600 transition">
                        Upgrade Now
                    </button>
                    <span className="text-sm text-gray-500">30+ Banners</span>
                </div>
            </div>
            {/* Background Image (optional) */}
            <div className="absolute inset-0">
                <img
                    src={upgradeBg}
                    alt="Background"
                    className="w-full object-cover rounded-lg"
                />
            </div>
        </div>
    );
};

export default WiseBannerUpgrade;
