// Headline + Button only
const MinimalTemplate = ({ banner, maxHeadlineWith, overFlowHidden }) => {
  return (
    <div className="flex items-center justify-between p-4 gap-4"
      style={{
        ...((banner.general.bgImage && banner.general.bgImage !== "null") 
          ? { backgroundImage: `url(${getBackgroundImage(banner.general.bgImage)})` }
          : { backgroundColor: banner.general.bannerColor }),
        minHeight: banner.general.height,
        width: "100%",
        maxWidth: banner.general.width,
      }}>
      <div className="flex-1">
        <div style={{
          color: banner.headline.color,
          fontSize: `clamp(${banner.headline.fontSize * 0.5}px, 3.5vw, ${banner.headline.fontSize}px)`,
          fontFamily: banner.headline.fontFamily,
          fontWeight: banner.headline.fontWeight,
          fontStyle: banner.headline.fontStyle,
        }}>
          {banner.headline.text}
        </div>
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