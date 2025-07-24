import { BANNER_TEMPLATES } from './BannerTemplates';

const BannerPreview: React.FC = () => {
  const { activeBanner } = useBannerContext();
  
  const Template = BANNER_TEMPLATES[activeBanner.banner.general.template || 'default'];

  return (
    <div className="banner-preview">
      <Template 
        banner={activeBanner.banner} 
        maxHeadlineWith={400} 
        overFlowHidden={true} 
      />
    </div>
  );
};