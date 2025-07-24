import React, { createContext, useContext, useEffect, useState } from "react";
import SolidStockBar from "../components/StockBar/templates/SolidStockBar";
import GradientStockBar from "../components/StockBar/templates/GradientStockBar";
import { TemplateType } from "../components/StockBar/TeplateType";

const StockBarContext = createContext();

export const StockBarProvider = ({ children }) => {

  const [stockBars, setStockBars] = useState([]);
  const [activeStockBar, setActiveStockBar] = useState();
  const [stockBarSetting, setStockBarSetting] = useState();

  // Fetch stock bars from the API
  useEffect(() => {
    const fetchStockBars = async () => {
      try {
        const response = await fetch('/wp-json/wise-campaign-plugin/v1/stockbars');
        const data = await response.json();
        console.log('.............');
        console.log(data);

        // Set the stock bars
        setStockBars(data);
        data.map((bar)=>{
          if(bar.isActive) {
            setActiveStockBar(bar)
          }
        })
      } catch (error) {
        console.error("Error fetching stock bars:", error);
      }
    };

    const fetchStockBarSetting = async () => {
      try {
        const response = await fetch('/wp-json/wise-campaign-plugin/v1/stockbars/setting');
        const data = await response.json();

        // Set the stock bars
        setStockBarSetting(data);
        
      } catch (error) {
        console.error("Error fetching stock bar setting:", error);
      }
    };

    fetchStockBars();
    fetchStockBarSetting();
  }, []); // This effect runs only once on mount
  

  const renderStockBar = (stockBar) => {
    const commonProps = {
      progressValue: 25,
      backgroundColor: stockBar.backgroundColor,
      textColor: stockBar.textColor,
      borderColor: stockBar.borderColor,
      progressBgColor: stockBar.progressBgColor,
      totalSold: stockBar.totalSold || 21,
      availableItems: stockBar.availableItems || 110
    };

    if (stockBar.type === TemplateType.SOLID) {
      return (
        <SolidStockBar
          {...commonProps}
          progressColor={stockBar.progressColor}
        />
      );
    }

    if (stockBar.type === TemplateType.GRADIENT) {
      return (
        <GradientStockBar
          {...commonProps}
          progressStartColor={stockBar.progressStartColor}
          progressEndColor={stockBar.progressEndColor}
        />
      );
    }

    return null;
  };


  return (
    <StockBarContext.Provider value={{  
        renderStockBar,
        stockBars, setStockBars, 
        activeStockBar, setActiveStockBar,
        stockBarSetting, setStockBarSetting }}>
      {children}
    </StockBarContext.Provider>
  );
};

export const useStockBarContext = () => {
  const context = useContext(StockBarContext);
  if (!context) {
    throw new Error(
      "use AppSettingContext must be used within a AppSettingProvider"
    );
  }
  return context;
};
