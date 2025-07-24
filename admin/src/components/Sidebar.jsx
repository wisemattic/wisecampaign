import React, { useState } from "react";
import styled from "styled-components";
import { FaArrowRight, FaChartArea, FaChartBar, FaChartLine, FaHome, FaShoppingCart, FaSocks, FaTable } from "react-icons/fa";
import {
  Card,
  List,
  ListItem,
  MenuItem,
  MenuList,
  Switch,
} from "@material-tailwind/react";
import ToggleSwitch from "./Common/ToggleSwitch";
import { useSettingContext } from "../context/SettingContext";
import { getPathFor, openInNewTab } from "../utils/utils";
import useStockbarStatus from "../hooks/useStockbarStatus";

const UpcomingSpan = styled.span`
  font-size: 12px;
  color: #9ca8c0;
  padding-top: 5px;
  margin-left: 5px;
`;

const Sidebar = ({ menus, menuHandler }) => {
  const { updateSettingData, settingData, isPro } = useSettingContext();
  const {stockbarStatus, updateStockbar } = useStockbarStatus();

  const handleToggle = async (key) => {
    // if(key=='wiseBanner')
    //   updateSettingData({ enabled: !toggles[key] });
    // else if(key==='stockBar')
    //   updateStockbar({ stockBarEnabled: !toggles[key]});
    // toggleHandler(key);
  };

  const handleMenu = async (key) => {
    menuHandler(key);
  };

  return (
    <div className="w-fit max-w-[20rem] max-h-fit shadow-xl shadow-blue-gray-900/5 flex flex-col justify-between bg-blue-gray-100">
      {/* <div className="hidden bg-white md:flex flex-col justify-between shadow-md"> */}
      <div>
        <div className="flex justify-center m-10">
          <img className="h-14" src={getPathFor("wc_logo.png")} alt="wiseCampaign Logo" />
        </div>

        <div className="grid grid-cols-1 gap-4 pr-4">
          <div
            className={`w-full flex flex-row justify-between gap-2 pl-4 ${menus["wiseBannerMenu"] ? "border-l-4 border-blue-600" : ""}`}
          >
            <button className="flex items-center gap-2" onClick={() => handleMenu('wiseBannerMenu')}>
              <FaChartArea/>
              <span className="ml-1 mr-1 self-center">wiseBanner</span>
            </button>
            {/* <ToggleSwitch
              isOn={toggles["wiseBanner"]}
              handleToggle={() => handleToggle("wiseBanner")}
            /> */}
          </div>

          <div className={`w-full flex flex-row justify-between gap-2 pl-4 ${menus["stockBarMenu"] ? "border-l-4 border-blue-600" : ""}`}>
            <button className="flex items-center gap-2" onClick={() => handleMenu('stockBarMenu')}>
              <FaChartBar/>
              <span className="ml-1 mr-1 self-center">
                Stock Bar
              </span>
            </button>
            {/* <ToggleSwitch
              isOn={toggles["stockBar"]}
              handleToggle={() => handleToggle("stockBar")}
            /> */}
          </div>

          <div className={`w-full flex flex-row justify-between gap-2 pl-4 ${menus["directCheckoutMenu"] ? "border-l-4 border-blue-600" : ""}`}>
            <button className="flex items-center gap-2" onClick={() => handleMenu('directCheckoutMenu')}>
              <FaHome/>
              <span className="ml-1 mr-1 self-center">
                Direct Checkout
              </span>
            </button>
            {/* <ToggleSwitch
              isOn={toggles["directCheckout"]}
              handleToggle={() => handleToggle("directCheckout")}
              disabled={true}
            /> */}
          </div>

          <div className={`w-full flex flex-row justify-between gap-2 pl-4 ${menus["sealsNotificationMenu"] ? "border-l-4 border-blue-600" : ""}`}>
            <button className="flex items-center gap-2" onClick={() => handleMenu('sealsNotificationMenu')}>
              <FaChartLine/>
              <span className="ml-1 mr-1 self-center">
                Sales Notification
              </span>
            </button>
            {/* <ToggleSwitch
              isOn={toggles["sealsNotification"]}
              handleToggle={() => handleToggle("sealsNotification")}
              disabled={true}
            /> */}
          </div>

          <div className={`w-full flex flex-row justify-between gap-2 pl-4 ${menus["wiseCartMenu"] ? "border-l-4 border-blue-600" : ""}`}>
            <button className="flex items-center gap-2"  onClick={() => handleMenu('wiseCartMenu')}>
              <FaShoppingCart/>
              <span className="ml-1 mr-1 self-center">
                wiseCart
              </span>
            </button>
            {/* <ToggleSwitch
              isOn={toggles["wiseCart"]}
              handleToggle={() => handleToggle("wiseCart")}
              disabled={true}
            /> */}
          </div>
        </div>
      </div>

      <div className="relative m-5 mb-10">
        <img src={getPathFor("dashboard_left_image.png")} alt="Upgrade Image" className="max-w-44 h-auto" />

        <div className="absolute inset-0 grid grid-rows-4 content-center">
          <div className="justify-self-center row-start-3 row-span-2 p-2 text-sm text-white font-semibold">
            {isPro
              ? "You're on the Pro plan –  enjoy the full experience!"
              : "You're on the Free plan – Upgrade to enjoy the full experience!"}
          </div>
        </div>

        <div className="ml-5 absolute -mt-5">
          <button
            onClick={() => openInNewTab("https://wisemattic.com/wisecampaign/")}
            className="w-10 h-10 rounded-full bg-[#FB896B] flex justify-center items-center z-10"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default Sidebar;
