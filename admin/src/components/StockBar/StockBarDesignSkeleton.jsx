import React from 'react';
import { Typography } from "@material-tailwind/react";
import { useStockBarContext } from '../../context/StockbarContext';

export default function StockBarDesignSkeleton() {
    const {
        activeStockBar, renderStockBar
    } = useStockBarContext();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center">
            {/* Product Image Placeholder */}
            <div className="w-[180px] h-[180px] bg-gray-300 rounded-md mb-2 flex items-center justify-center animate-pulse relative">
                <div className="absolute top-2 left-2">
                    <div className="w-8 h-8 rounded-full bg-gray-400"></div>
                </div>
                <div className="grid h-30 w-30 place-items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-16 w-16 text-gray-400"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                    </svg>
                </div>
            </div>

            <div>
                {/* Product Details */}
                <div className="space-y-1.5 mb-2 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                    <div className="flex gap-2 items-center">
                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                    <div className="h-2 bg-gray-300 rounded w-32"></div>
                    <div className="h-2 bg-gray-300 rounded w-24"></div>
                </div>

                <div className="mt-2 mb-2">
                    {renderStockBar(activeStockBar)}
                </div>

                {/* Add to Cart Section */}
                <div className="flex gap-4 items-center animate-pulse">
                    <div className="h-4 w-16 bg-gray-300 rounded"></div>
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                </div>

                {/* Category */}
                <div className="mt-2 flex gap-2 items-center">
                    <div className="h-2 bg-gray-300 rounded w-12"></div>
                    <div className="h-2 bg-gray-300 rounded w-20"></div>
                </div>
            </div>
        </div>
    );
}