import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useSettingContext } from "../context/SettingContext";
import DirectCheckout from "../pages/DirectCheckout";
import WiseBannerUpgrade from "./WiseBannerUpgrade";
import styled from "styled-components";
import WiseBannerTabs from "../pages/wisebanner/WiseBannerTabs";
import StockBar from "../pages/stockbar/StockBar";
import UpComming from "../pages/UpComming";
import DefaultView from "../pages/DefaultView";
import { useAppSettingContext } from "../context/common/AppSettingContext";
import useStockbarStatus from "../hooks/useStockbarStatus";


const MainComponent = () => {

  const {settingConfig} = useAppSettingContext()
  const {isWooCommerceExists} = settingConfig

  const [activeMenu, setActiveMenu] = useState({
    wiseBannerMenu: false,
    directCheckoutMenu: false,
    sealsNotificationMenu: false,
    wiseCartMenu: false,
    stockBarMenu: false,
  }); // State to track active menu
  
  const { settingData, fetchSettingData, fetchSubscriptionStatus, isPro } = useSettingContext();
  const {stockbarStatus } = useStockbarStatus();

  // Initial state with each toggle button set to false (off)
  const [toggles, setToggles] = useState({
    wiseBanner: false,
    directCheckout: false,
    sealsNotification: false,
    wiseCart: false,
    stockBar: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const setting = await fetchSettingData();
        if (setting?.enabled) {
          await fetchSubscriptionStatus();
          setToggles(prev => ({
            ...prev,
            wiseBanner: true,
          }));
          setActiveMenu(prev => ({
            ...prev,
            wiseBannerMenu: true
          }));
        }
  
        // Fetch stock bar status AFTER fetching settings
        if (stockbarStatus?.stockBarEnabled) {
          setToggles(prev => ({
            ...prev,
            stockBar: true,
          }));
        }
      } catch (error) {
        console.error("Error fetching setting data:", error);
      }
    };
  
    fetchData();
  
  }, [isPro]); // Only re-run when `isPro` changes
  

const renderActiveComponent = () => {
  const componentMap = {
    wiseBannerMenu: <WiseBannerTabs settingData={settingData || false} isPro={isPro || false} />,
    directCheckoutMenu: <UpComming />,
    sealsNotificationMenu: <UpComming />,
    wiseCartMenu: <UpComming />,
    stockBarMenu: <StockBar />
  };

  // Find the active menu
  const activeKey = Object.keys(activeMenu).find((key) => activeMenu[key]);

  // Return the component from the map or fall back to DefaultView
  return componentMap[activeKey] || <DefaultView isPro={isPro} />;
};

  // Handle toggle change
  const handleToggle = (toggleKey) => {
    setToggles((prevToggles) => ({
      ...prevToggles,
      [toggleKey]: !prevToggles[toggleKey],
    }));
  };

  const handleActiveMenu = (menuKey) => {
    setActiveMenu((prevState) => {
      // If isWooCommerceExists is false, only allow wiseBannerMenu to be activated
      if (!isWooCommerceExists && menuKey !== "wiseBannerMenu") {
        return prevState; // Do nothing and retain the current state
      }

      return {
        wiseBannerMenu: false,
        directCheckoutMenu: false,
        sealsNotificationMenu: false,
        wiseCartMenu: false,
        stockBarMenu: false,
        [menuKey]: true, // Activate the selected menu
      };
    });
  };

  return (
    <div>
      <div className="text-center bg-[#ffffff05] text-black -ml-5">
        {/*<Header />*/}
        <div className="flex">
          <Sidebar menuHandler={handleActiveMenu} menus={activeMenu}/>
          <div className="flex-1">{renderActiveComponent()}</div>
        </div>
      </div>
    </div>
  );
};

export default MainComponent;
