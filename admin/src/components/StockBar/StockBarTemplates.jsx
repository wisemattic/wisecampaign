import {
  Card,
  List,
  ListItem,
  ListItemPrefix,
  Button,
  Radio,
  Typography,
} from "@material-tailwind/react";
import SolidStockBar from "./templates/SolidStockBar";
import { useState } from "react";
import GradientStockBar from "./templates/GradientStockBar";
import { useStockBarContext } from "../../context/StockbarContext";

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-full w-full scale-105"
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
      clipRule="evenodd"
    />
  </svg>
);

export default function StockBarTempltes({ onClose }) {
  const { activeStockBar, setActiveStockBar, stockBars, setStockBars, renderStockBar } = useStockBarContext();
  
  const handleTemplateSelect = async () => {
    if (!activeStockBar) return;

    try {
      // First set the active stock bar
      const activeResponse = await fetch('/wp-json/wise-campaign-plugin/v1/stockbars/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeStockBar.id }),
      });

      if (!activeResponse.ok) {
        throw new Error('Failed to set active template');
      }

      // Then update the template design
      const updatedBar = { ...activeStockBar, isActive: true };
      const response = await fetch('/wp-json/wise-campaign-plugin/v1/stockbars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBar),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      const updatedStockBars = stockBars.map((currentBar) => ({
        ...currentBar,
        isActive: currentBar.id === activeStockBar.id
      }));
      
      setStockBars(updatedStockBars);
      setActiveStockBar(updatedBar);

      // Ensure popup closes after successful update
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };
  
  return (
    <div className="p-4 max-w-2xl mx-auto bg-white border border-blue-500 rounded-md shadow-sm">
      <Typography variant="h6" className="mb-4 text-center">
        Select Template
      </Typography>
      <div className="space-y-4 flex flex-col items-center">
        {stockBars.map((stockBar, index) => (
          <div
            key={stockBar.id}
            onClick={() => {
              setActiveStockBar(stockBar);
              onClose?.();
            }}
            className={`relative border-2 rounded-lg cursor-pointer transition-all hover:border-blue-500 w-full ${
              activeStockBar?.id === stockBar.id 
                ? 'border-blue-500 shadow-md bg-blue-50/30' 
                : 'border-gray-200'
            }`}
          >
            {activeStockBar?.id === stockBar.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="p-2">
              {renderStockBar(stockBar)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
