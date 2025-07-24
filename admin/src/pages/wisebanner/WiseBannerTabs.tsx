import React, { useEffect, useState } from "react";
import "./WiseBannerTabs.scss";
import Preview from "../../components/Preview";
import Navbar from "../../components/Navbar";
import DashboardWelcome from "./tabs/dashboard/DashboardWelcome";
import UpgradePlan from "./tabs/dashboard/UpgradePlan";
import BannerCustomizer from "./tabs/customizer/BannerCustomizer";
import BannerSettings from "./tabs/setting/BannerSettings";
import BannerSettingsReDesign from "./tabs/setting/BannerSettingsReDesign";
import UpdateBannerButton from "../../components/UpdateBannerButton";
import { PopoverCustomAnimation } from "./tabs/templates/PopoverCustomAnimation";
import BannerDesign from "./tabs/templates/BannerDesign";
import { StockBarState } from "../stockbar/StockBarState";
import { useSettingContext } from "../../context/SettingContext";

const WiseBannerTabs = () => {
  const { settingData, isPro } = useSettingContext();
  const [state, setState] = useState(false);

  useEffect(() => {
    setState(settingData?.enabled ?? false);
  }, [settingData]);

  useEffect(() => {
    //     console.log(isPro)
    //     if (settingData?.enabled) {
    //       const style = document.createElement("style");
    //       style.innerHTML = `
    //         #wpwrap{
    //   top:var(--wpwrap-top) !important;
    // }
    // #wpadminbar{
    //   top: var(--wpadminbar-top);
    // }
    //       `;
    //       document.head.appendChild(style);

    //       return () => {
    //         // Cleanup style when component is unmounted or disabled
    //         document.head.removeChild(style);
    //       };
    // }
  }, [settingData || isPro]);

  const handleStateChange = async (newState) => {
      try {
        const response = await fetch('/wp-json/wise-campaign-plugin/v1/setting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled: newState }),
        });
  
        if (response.ok) {
          setState(newState);
        }
      } catch (error) {
        console.error('Failed to update setting:', error);
      }
    };
  
    const DeactivationOverlay = () => (
      <div className={`transition-all duration-500 ease-in-out absolute w-full 
        ${!state ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="flex h-screen items-center justify-center">
          <StockBarState
            state={state}
            setState={handleStateChange}
            componentName="wiseBanner"
          />
        </div>
      </div>
    );
  
    const MainContent = () => (
      <div className={`transition-all duration-500 ease-in-out md:mr-4
        ${state ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <div className="w-full mx-auto min-h-screen">
          {/* Preview Section */}
          <section className="border-b">
            <Preview />
          </section>
  
          {/* Template Selection Section */}
          <section className="bg-gray-50 p-2 border-b">
            <PopoverCustomAnimation
              popoverOptions={<BannerDesign />}
              componentName="wiseBanner"
              deactivationButton={
                <StockBarState
                  state={state}
                  setState={handleStateChange}
                  componentName="wiseBanner"
                />
              }
            />
        </section>
  
        {/* Customization Section */}
        <section className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Customize Banner</h2>
          <BannerCustomizer />
        </section>
  
        {/* Settings Section */}
        <section className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Banner Settings</h2>
          <BannerSettingsReDesign />
        </section>
  
        {/* Action Section */}
        <section className="p-6 bg-gray-50">
          <UpdateBannerButton />
        </section>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <DeactivationOverlay />
      <MainContent />
    </div>
  );
};

export default WiseBannerTabs;
