import React from "react";
import Button from "../../../../components/Common/Button";
import DefaultCountdown from "../../../../components/CountdownTimer/DefaultCountdown";
import SeparatorCountdown from "../../../../components/CountdownTimer/SeparatorCountdown";
import { getBackgroundImage, renderImage } from "../../../../utils/utils";
import logo from "../../../../../public/wise_campaign_logo.png";

const BannerTemplateRe = ({ banner, maxHeadlineWith, overFlowHidden }) => {
  if (!banner) return <div>Loading...</div>;

  return (
    <div
      className="relative flex flex-col md:flex-row items-center gap-4 md:gap-4 px-4 md:px-6 py-3 min-h-full overflow-hidden"
      style={{
        ...((banner.general.bgImage && banner.general.bgImage !== "null")
          ? { backgroundImage: `url(${getBackgroundImage(banner.general.bgImage)})` }
          : { backgroundColor: banner.general.bannerColor }),
        minHeight: banner.general.height,
        width: banner.general.width,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Left Section: Headlines */}
      <div className="w-full md:flex-1 md:max-w-xl text-center md:text-left scale-95 md:scale-100">
        <h2
          className="mb-2 md:mb-1 truncate px-2 md:px-0"
          style={{
            color: banner.headline.color,
            fontSize: `clamp(${banner.headline.fontSize * 0.5}px, 3.5vw, ${banner.headline.fontSize}px)`,
            fontFamily: banner.headline.fontFamily,
            fontWeight: banner.headline.fontWeight,
            fontStyle: banner.headline.fontStyle,
            maxWidth: maxHeadlineWith || 'none',
            overflow: overFlowHidden ? "hidden" : "visible",
            lineHeight: 1.2,
          }}
        >
          {banner.headline.text}
        </h2>
        <p
          className="truncate px-2 md:px-0"
          style={{
            color: banner.subHeadline.color,
            fontSize: `clamp(${banner.subHeadline.fontSize * 0.5}px, 2.5vw, ${banner.subHeadline.fontSize}px)`,
            fontFamily: banner.subHeadline.fontFamily,
            fontWeight: banner.subHeadline.fontWeight,
            fontStyle: banner.subHeadline.fontStyle,
            lineHeight: 1.2,
          }}
        >
          {banner.subHeadline.text}
        </p>
      </div>

      {/* Center Section: Logo & Countdown */}
      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 scale-85 md:scale-100">
        <div className="flex-shrink-0 w-12 md:w-16 lg:w-auto">
          {banner.bogo?.imgSrc
            ? renderImage(banner.bogo.imgSrc, banner.bogo.alt, Math.floor(banner.bogo.width * 0.8), Math.floor(banner.bogo.height * 0.8))
            : renderImage(logo, "Logo", "auto", "auto")}
        </div>
        <div className="flex-shrink-0 transform scale-85 md:scale-100">
          {banner.countdown.component === "DefaultCountdown" ? (
            <DefaultCountdown
              text={banner.countdown.text}
              fontSize={`clamp(${banner.countdown.fontSize * 0.5}px, 2.5vw, ${banner.countdown.fontSize}px)`}
              fontWeight={banner.countdown.fontWeight}
              fontStyle={banner.countdown.fontStyle}
              fontFamily={banner.countdown.fontFamily}
              color={banner.countdown.color}
              timerEndDate={new Date(banner.countdown.timer).getTime()}
            />
          ) : (
            <SeparatorCountdown
              text={banner.countdown.text}
              fontSize={`clamp(${banner.countdown.fontSize * 0.5}px, 2.5vw, ${banner.countdown.fontSize}px)`}
              fontWeight={banner.countdown.fontWeight}
              fontStyle={banner.countdown.fontStyle}
              fontFamily={banner.countdown.fontFamily}
              color={banner.countdown.color}
              timerEndDate={new Date(banner.countdown.timer).getTime()}
            />
          )}
        </div>
      </div>

      {/* Right Section: CTA Button */}
      <div className="flex-shrink-0 w-full md:w-auto md:mr-2 flex justify-center md:justify-start scale-85 md:scale-100">
        <Button label={banner.button.text} buttonStyle={{
          ...banner.button,
          fontSize: `clamp(${banner.button.fontSize * 0.5}px, 2.5vw, ${banner.button.fontSize}px)`,
          padding: window.innerWidth < 768 ? '0.5em 1em' : '0.5em 1em'
        }} />
      </div>
    </div>
  );
};

export default BannerTemplateRe;