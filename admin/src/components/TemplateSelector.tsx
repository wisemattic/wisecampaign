import React from 'react';
import { useBannerContext } from "../context/BannerContext";

const TemplateSelector: React.FC = () => {
  const { activeBanner, updateActiveBanner } = useBannerContext();

  const handleTemplateChange = (templateName: string) => {
    const updatedValues = {
      ...activeBanner,
      banner: {
        ...activeBanner.banner,
        general: {
          ...activeBanner.banner.general,
          template: templateName
        }
      }
    };
    updateActiveBanner(updatedValues);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Select Template</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'default', label: 'Default Template' },
          { name: 'minimal', label: 'Minimal' },
          { name: 'countdownFocus', label: 'Countdown Focus' },
          { name: 'ctaFocus', label: 'CTA Focus' }
        ].map(template => (
          <div
            key={template.name}
            onClick={() => handleTemplateChange(template.name)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              activeBanner.banner.general.template === template.name
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {template.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;