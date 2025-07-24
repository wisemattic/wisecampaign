// Countdown-centered design
const CountdownFocusTemplate = ({ banner, maxHeadlineWith, overFlowHidden }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4"
      style={{
        ...((banner.general.bgImage && banner.general.bgImage !== "null") 
          ? { backgroundImage: `url(${getBackgroundImage(banner.general.bgImage)})` }
          : { backgroundColor: banner.general.bannerColor }),
        minHeight: banner.general.height,
        width: "100%",
        maxWidth: banner.general.width,
      }}>
      <div className="scale-110">
        {banner.countdown.component === "DefaultCountdown" ? (
          <DefaultCountdown {...banner.countdown} timerEndDate={new Date(banner.countdown.timer).getTime()} />
        ) : banner.countdown.component === "CircleCountdown" ? (
          <CircleCountdown {...banner.countdown} timerEndDate={new Date(banner.countdown.timer).getTime()} />
        ) : (
          <BoxedCountdown {...banner.countdown} timerEndDate={new Date(banner.countdown.timer).getTime()} />
        )}
      </div>
      <Button 
        label={banner.button.text} 
        buttonStyle={{
          ...banner.button,
          fontSize: `clamp(${banner.button.fontSize * 0.5}px, 2.5vw, ${banner.button.fontSize}px)`,
        }} 
      />
    </div>
  );
};