import { FaHome, FaPlayCircle, FaPlusSquare } from "react-icons/fa"
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from "@material-tailwind/react";

import SolidStockBar from "../../components/StockBar/templates/SolidStockBar"
import StockBarTempltes from "../../components/StockBar/StockBarTemplates";
import StockBarDesign from "../../components/StockBar/StockBarDesign";
import StockBarSetting from "../../components/StockBar/StockBarSetting";
import ReactSwitch from "react-switch";
import { StockBarState } from "./StockBarState";
import { useEffect, useState } from "react";



export default function StockBarPlayGround() {
  const [state, setState] = useState(false);

  useEffect(() => {
    // Fetch initial status
    fetch('/wp-json/wise-campaign-plugin/v1/stockbar-status')
      .then(res => res.json())
      .then(data => {
        setState(data.stockBarEnabled);
      })
      .catch(error => console.error('Error fetching stock bar status:', error));
  }, []);

  const handleStateChange = async (newState) => {
    try {
      const response = await fetch('/wp-json/wise-campaign-plugin/v1/stockbar-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockBarEnabled: newState })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      const data = await response.json();
      setState(data.stockBarEnabled);
    } catch (error) {
      console.error('Error updating stock bar status:', error);
      // Revert state on error
      setState(!newState);
    }
  };

  return (
    <div className="relative  md:mr-4">
      <div className={`transition-all duration-500 ease-in-out absolute w-full 
        ${!state ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="flex h-screen items-center justify-center">
          <StockBarState
            state={state}
            setState={handleStateChange}
            componentName="StockBar"
          />
        </div>
      </div>

      <div className={`transition-all duration-500 ease-in-out 
        ${state ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <StockBarDesign
          deactivationButton={
            <StockBarState
              state={state}
              setState={handleStateChange}
              componentName="StockBar"
            />
          }
        />
      </div>
    </div>
  );
}