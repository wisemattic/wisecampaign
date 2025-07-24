// CTA-focused with BOGO
const CTAFocusTemplate = ({ banner, maxHeadlineWith, overFlowHidden }) => {
  return (
    <div className="flex items-center justify-center p-4 gap-8"
      style={{
        ...((banner.general.bgImage && banner.general.bgImage !== "null") 
          ? { backgroundImage: `url(${getBackgroundImage(banner.general.bgImage)})` }
          : { backgroundColor: banner.general.bannerColor }),
        minHeight: banner.general.height,
        width: "100%",
        maxWidth: banner.general.width,
      }}>
      <div className="flex-shrink-0">
        {banner.bogo?.imgSrc
          ? renderImage(
              banner.bogo.imgSrc,
              banner.bogo.alt,
              Math.floor(banner.bogo.width * 0.8),
              Math.floor(banner.bogo.height * 0.8)
            )
          : null}
      </div>
      <div className="flex flex-col items-start gap-4">
        <div style={{
          color: banner.headline.color,
          fontSize: `clamp(${banner.headline.fontSize * 0.6}px, 4vw, ${banner.headline.fontSize}px)`,
          fontFamily: banner.headline.fontFamily,
          fontWeight: banner.headline.fontWeight,
          fontStyle: banner.headline.fontStyle,
        }}>
          {banner.headline.text}
        </div>
        <Button 
          label={banner.button.text} 
          buttonStyle={{
            ...banner.button,
            fontSize: `clamp(${banner.button.fontSize * 0.6}px, 2.5vw, ${banner.button.fontSize}px)`,
            padding: '0.75em 2em',
          }} 
        />
      </div>
    </div>
  );
};