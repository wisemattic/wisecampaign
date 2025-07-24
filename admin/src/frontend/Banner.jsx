import React, { useEffect, useState } from "react";

import "./Banner.scss";
import Button from "../components/Common/Button";
import DefaultCountdown from "../components/CountdownTimer/DefaultCountdown";
import SeparatorCountdown from "../components/CountdownTimer/SeparatorCountdown";
import { getBackgroundImage, renderImage } from "../utils/utils";
import logo from "../../public/wise_campaign_logo.png";
import useDisplayRule from "../hooks/useDisplayRule";
import { useSettingContext } from "../context/SettingContext";
import { useBannerContext } from "../context/BannerContext";
import { getSelectedBannerData } from "../api";
import { mapDbColumnsToFormValues } from "../utilities/main";
import useDbToFormMapper from "../hooks/useDbToFormMapper";
import useSetting from "../hooks/useSetting";
import CircleCountdown from "../components/CountdownTimer/CircleCountdown";
import BoxedCountdown from "../components/CountdownTimer/BoxedCountdown";

const Banner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showOnMobile, setShowOnMobile] = useState(true);
  const [showOnDesktop, setShowOnDesktop] = useState(true);
  const {fetchDisplayRule, displayRules, getSelectedBanner, selectedBanner} = useDisplayRule()
  const { fetchSubscriptionStatus, fetchSettingData, settingData, isPro} = useSettingContext()

useEffect(() => {
  const fetchData = async () => {
    try {
      const setting = await fetchSettingData();
      if (setting?.enabled) {
        // setShowBanner(true)
        getSelectedBanner()
        await fetchSubscriptionStatus()
        if(isPro) {
          setShowBanner(false)
          fetchDisplayRule()
        }
        else
          setShowBanner(true)
      } else {
        setShowBanner(false)
      }
    } catch (error) {
      console.error("Error fetching setting data:", error);
    }
  };

  fetchData();
}, [isPro]);

const getBackgroundStyle = () => {
  if (selectedBanner?.general?.bgImage && selectedBanner.general.bgImage !== "null") {
    return { backgroundImage: `url(${getBackgroundImage(selectedBanner.general.bgImage)})` };
  } else if (selectedBanner?.general?.bannerColor) {
    return { backgroundColor: selectedBanner.general.bannerColor };
  }
  return {}; // Fallback style
};

  useEffect(() => {

    const fullUrlWithoutQuery = `${window.location.origin}${window.location.pathname}`;

    const isTargetPage = (displayRules && (displayRules.pageTargeting == "all" || fullUrlWithoutQuery.startsWith(displayRules.pageTargeting)));

    if(isTargetPage) {

    if (!displayRules || !displayRules.bannerDeploy) return;

    const { afterSeconds, afterScroll, seconds, scroll } =
      displayRules.bannerDeploy;

    if(!afterSeconds && !afterScroll) {
      setShowBanner(true)
    }

    // Timeout logic
    let timeout = null;
    if (afterSeconds) {
      timeout = setTimeout(() => {
        setShowBanner(true);
      }, seconds * 1000); // Convert seconds to milliseconds
    }

    // Scroll logic
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      // Calculate scroll percentage
      const scrollPercent = (scrollPosition / scrollHeight) * 100;

      if (afterScroll && scrollPercent >= scroll) {
        setShowBanner(true);
        window.removeEventListener("scroll", handleScroll); // Cleanup after trigger
      }
    };

    if (afterScroll) {
      window.addEventListener("scroll", handleScroll);
    }

    // Cleanup on unmount
    return () => {
      if (timeout) clearTimeout(timeout);
      if (afterScroll) window.removeEventListener("scroll", handleScroll);
    };
  }
  }, [displayRules]);

  const getBannerClass = () => {
    if (displayRules?.bannerType === "sticky") {
      if (displayRules?.bannerPosition === "bottom") return "sticky bottom-0 z-50";
      else {
        return "sticky top-0 z-50";
      }
    }
    return "";
  };

  const getVisibilityClasses = () => {
    if (!displayRules?.showBannerOn) return ""; // Show by default if no rules
    const showOn = displayRules.showBannerOn;

    if (Array.isArray(showOn)) {
      if (showOn.includes("mobile") && showOn.includes("desktop")) {
        return "flex flex-col md:flex-row items-center justify-center gap-2 pt-2 pb-2"; // Show on all devices (no specific classes needed)
      } else if (showOn.includes("mobile")) {
        return "flex flex-col md:hidden items-center justify-center gap-2 pt-2 pb-2"; // Show only on mobile (block on mobile, hidden on desktop)
      } else if (showOn.includes("desktop")) {
        return "hidden md:flex md:flex-row items-center justify-center gap-2 pt-2 pb-2"; // Show only on desktop (hidden on mobile, block on desktop)
      }
    }

    return "hidden"; // Hide by default if no specific rules
  };

  return (
    showBanner &&
    selectedBanner &&
    (isPro ? displayRules : true) && (
        <div className="wisecampaign-tw">
        <div
          className={isPro ? getVisibilityClasses() : "flex flex-col md:flex-row items-center justify-center gap-2 pt-2 pb-2"}
          style={{
            ...(selectedBanner.general.bgImage &&
            selectedBanner.general.bgImage !== "null"
              ? {
                  backgroundImage: `url(${getBackgroundImage(selectedBanner.general.bgImage)})`,
                }
              : { backgroundColor: selectedBanner.general.bannerColor }),
            height: "auto",
            minHeight: selectedBanner.general.height,
            backgroundSize: "cover",
            width: selectedBanner.general.width,
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="hidden md:block md:basis-1/12"></div>
          <div className="md:basis-5/12 flex flex-col justify-center">
            <div
              style={{
                color: selectedBanner.headline.color,
                textAlign: selectedBanner.headline.align,
                fontSize: selectedBanner.headline.fontSize + "px",
                fontFamily: selectedBanner.headline.fontFamily,
                fontWeight: selectedBanner.headline.fontWeight,
                fontStyle: selectedBanner.headline.fontStyle,
                whiteSpace: "nowrap",
              }}
            >
              {selectedBanner.headline.text}
            </div>
            <div
              style={{
                color: selectedBanner.subHeadline.color,
                textAlign: selectedBanner.subHeadline.align,
                fontSize: selectedBanner.subHeadline.fontSize + "px",
                fontFamily: selectedBanner.subHeadline.fontFamily,
                fontWeight: selectedBanner.subHeadline.fontWeight,
                fontStyle: selectedBanner.subHeadline.fontStyle,
                whiteSpace: "nowrap"
              }}
            >
              {selectedBanner.subHeadline.text}
            </div>
          </div>
          <div className="md:basis-1/12 flex justify-center items-center">
            {selectedBanner.bogo?.imgSrc
              ? renderImage(
                  selectedBanner.bogo.imgSrc,
                  selectedBanner.bogo.alt,
                  selectedBanner.bogo.width,
                  selectedBanner.bogo.height
                )
              : renderImage(logo, "Bogo Image", "auto", "auto")}
          </div>
          <div className="grow flex flex-col justify-center">
            {selectedBanner.countdown.component === "DefaultCountdown" ? (
              <DefaultCountdown
                text={selectedBanner.countdown.text}
                fontSize={selectedBanner.countdown.fontSize + "px"}
                fontWeight={selectedBanner.countdown.fontWeight}
                fontStyle={selectedBanner.countdown.fontStyle}
                fontFamily={selectedBanner.countdown.fontFamily}
                color={selectedBanner.countdown.color}
                timerEndDate={new Date(selectedBanner.countdown.timer).getTime()}
              />
            ) : selectedBanner.countdown.component === "SeparatorCountdown" ? (
              <SeparatorCountdown
                text={selectedBanner.countdown.text}
                fontSize={selectedBanner.countdown.fontSize + "px"}
                fontWeight={selectedBanner.countdown.fontWeight}
                fontStyle={selectedBanner.countdown.fontStyle}
                fontFamily={selectedBanner.countdown.fontFamily}
                color={selectedBanner.countdown.color}
                timerEndDate={new Date(selectedBanner.countdown.timer).getTime()}
              />
            ) : selectedBanner.countdown.component === "CircleCountdown" ? (
              <CircleCountdown
                text={selectedBanner.countdown.text}
                fontSize={selectedBanner.countdown.fontSize + "px"}
                fontWeight={selectedBanner.countdown.fontWeight}
                fontStyle={selectedBanner.countdown.fontStyle}
                fontFamily={selectedBanner.countdown.fontFamily}
                color={selectedBanner.countdown.color}
                timerEndDate={new Date(selectedBanner.countdown.timer).getTime()}
              />
            ) : (
              <BoxedCountdown
                text={selectedBanner.countdown.text}
                fontSize={selectedBanner.countdown.fontSize + "px"}
                fontWeight={selectedBanner.countdown.fontWeight}
                fontStyle={selectedBanner.countdown.fontStyle}
                fontFamily={selectedBanner.countdown.fontFamily}
                color={selectedBanner.countdown.color}
                timerEndDate={new Date(selectedBanner.countdown.timer).getTime()}
              />
            )}
          </div>
          <div className="flex justify-center items-center md:justify-end">
            <a
              href={selectedBanner.button?.link || "#"}
              target={
                isPro && displayRules?.buttonAction ? displayRules.buttonAction : "_self"
              }
              rel="noopener noreferrer"
            >
              <Button
                label={selectedBanner.button.text}
                buttonStyle={selectedBanner.button}
              />
            </a>
          </div>
          <div className="hidden md:block md:basis-1/12"></div>
          </div>
          </div>
    )
  );
};

export default Banner;