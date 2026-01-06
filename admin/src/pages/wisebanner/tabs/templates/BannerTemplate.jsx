import React, { useEffect, useState } from "react";

import "../../../../frontend/Banner.scss";
import logo from "../../../../../public/wise_campaign_logo.png";
import Button from "../../../../components/Common/Button";
import DefaultCountdown from "../../../../components/CountdownTimer/DefaultCountdown";
import SeparatorCountdown from "../../../../components/CountdownTimer/SeparatorCountdown";
import { getBackgroundImage, renderImage } from "../../../../utils/utils";
import CircleCountdown from "../../../../components/CountdownTimer/CircleCountdown";
import BoxedCountdown from "../../../../components/CountdownTimer/BoxedCountdown";

const BannerTemplate = ({ banner, maxHeadlineWith, overFlowHidden }) => {
  if (!banner) {
    return <div>Loading...</div>;
  }  
  return (
  <>
      <div
        className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 p-3 md:p-4 overflow-hidden"
        style={{
          ...((banner.general.bgImage && banner.general.bgImage !== "null") 
            ? { backgroundImage: `url(${getBackgroundImage(banner.general.bgImage)})` }
            : { backgroundColor: banner.general.bannerColor }),
          minHeight: banner.general.height,
          width: "100%",
          maxWidth: banner.general.width,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          margin: "0 auto",
        }}
      >
        <div className="hidden md:block md:basis-1/12"></div>
        <div className="w-full md:basis-5/12 flex flex-col justify-center gap-2 scale-95 md:scale-100">
          <div
            style={{
              color: banner.headline.color,
              textAlign: "center",
              fontSize: `clamp(${banner.headline.fontSize * 0.5}px, 3.5vw, ${banner.headline.fontSize}px)`,
              fontFamily: banner.headline.fontFamily,
              fontWeight: banner.headline.fontWeight,
              fontStyle: banner.headline.fontStyle,
              whiteSpace: "nowrap",
              overflow: overFlowHidden ? "hidden" : "visible",
              textOverflow: "ellipsis",
              maxWidth: maxHeadlineWith ? maxHeadlineWith : 'none',
              lineHeight: 1.2,
            }}
          >
            {banner.headline.text}
          </div>
          <div
            style={{
              color: banner.subHeadline.color,
              textAlign: "center",
              fontSize: `clamp(${banner.subHeadline.fontSize * 0.5}px, 2.5vw, ${banner.subHeadline.fontSize}px)`,
              fontFamily: banner.subHeadline.fontFamily,
              fontWeight: banner.subHeadline.fontWeight,
              fontStyle: banner.subHeadline.fontStyle,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
            }}
          >
            {banner.subHeadline.text}
          </div>
        </div>
        <div className={`flex-shrink-0 w-12 md:w-16 lg:w-auto flex justify-center items-center scale-90 md:scale-100 ${banner.bogo.show ? 'block' : 'hidden'}`}>
          {banner.bogo?.imgSrc
            ? renderImage(
                banner.bogo.imgSrc,
                banner.bogo.alt,
                banner.bogo.width,
                banner.bogo.height
              )
            : renderImage(logo, "Bogo Image", "auto", "auto")}
        </div>
        <div className={`flex flex-col justify-center scale-85 md:scale-100 ${banner.countdown.show ? 'block' : 'hidden'}`}>
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
          ) : banner.countdown.component === "SeparatorCountdown" ? (
            <SeparatorCountdown
              text={banner.countdown.text}
              fontSize={`clamp(${banner.countdown.fontSize * 0.5}px, 2.5vw, ${banner.countdown.fontSize}px)`}
              fontWeight={banner.countdown.fontWeight}
              fontStyle={banner.countdown.fontStyle}
              fontFamily={banner.countdown.fontFamily}
              color={banner.countdown.color}
              timerEndDate={new Date(banner.countdown.timer).getTime()}
            />
          ) : banner.countdown.component === "CircleCountdown" ? (
            <CircleCountdown
              text={banner.countdown.text}
              fontSize={`clamp(${banner.countdown.fontSize * 0.5}px, 2.5vw, ${banner.countdown.fontSize}px)`}
              fontWeight={banner.countdown.fontWeight}
              fontStyle={banner.countdown.fontStyle}
              fontFamily={banner.countdown.fontFamily}
              color={banner.countdown.color}
              timerEndDate={new Date(banner.countdown.timer).getTime()}
            />
          ) : (
            <BoxedCountdown
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
        <div className={`flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end scale-85 md:scale-100 ${banner.button.show ? 'block' : 'hidden'}`}>
          <Button 
            label={banner.button.text} 
            buttonStyle={{
              ...banner.button,
              fontSize: `${banner.button.fontSize}`,
              padding: window.innerWidth < 768 ? '0.5em 1em' : banner.button.padding,
              display: banner.button.show ? 'block' : 'none' 
            }} 
          />
        </div>
        <div className="hidden md:block md:basis-1/12"></div>
      </div>
    </>
  );
};

export default BannerTemplate;
