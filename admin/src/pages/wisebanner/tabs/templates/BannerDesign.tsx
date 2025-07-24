import React, { useEffect } from "react";
import { Button, Typography } from "@material-tailwind/react";
import { useBannerContext } from "../../../../context/BannerContext";
import { ToastType, useToast } from "../../../../provider/ToastProvider";
import useDisplayRule from "../../../../hooks/useDisplayRule";
import { useSettingContext } from "../../../../context/SettingContext";
import BannerTemplate from "./BannerTemplate";
import useDbToFormMapper from "../../../../hooks/useDbToFormMapper";
import BannerTemplateRe from "./BannerTemplateRe";

const BannerDesign: React.FC = () => {
  const { bannerData, loading, updateBanner, activeBanner } = useBannerContext();
  const { isPro } = useSettingContext();
  const { displayRules, fetchDisplayRule } = useDisplayRule();
  const mapDBToForm = useDbToFormMapper();
  const { showToast } = useToast();

  useEffect(() => {
    if (isPro) fetchDisplayRule();
  }, [isPro]);

  const handleSave = async () => {
    if (!activeBanner) return;

    try {
      await updateBanner(activeBanner.id, { ...activeBanner, is_selected: 1 });
      showToast("Banner updated successfully!", ToastType.SUCCESS);
    } catch (error) {
      showToast("Failed to update banner", ToastType.ERROR);
    }
  };

  if (!bannerData || !activeBanner) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <Typography className="text-gray-500">No active banner available.</Typography>
      </div>
    );
  }

  return (
    <div className="shadow-sm bg-white border border-blue-500 rounded-md">

      {/* Template Selection Section */}
      <section className="p-6 border-b">
        <div className="p-4 max-w-full">
          <Typography variant="h6" className="mb-4">
            Select Template
          </Typography>
          <div className="space-y-4">
            {bannerData.map((item, index) => {
              const bannerItem = mapDBToForm(item);
              return (
                <div
                  key={index}
                  onClick={() => updateBanner(item.id, { ...item, is_selected: 1 })}
                  className={`relative border-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                    activeBanner.id === bannerItem.id 
                      ? 'border-blue-500 shadow-md bg-blue-50/30' 
                      : 'border-gray-200'
                  }`}
                >
                  {activeBanner.id === bannerItem.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="p-2">
                    <BannerTemplate
                      banner={bannerItem.banner}
                      maxHeadlineWith="280px"
                      overFlowHidden={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BannerDesign;
