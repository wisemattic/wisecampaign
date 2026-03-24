import { Button, Typography } from "@material-tailwind/react";
import { useStockBarContext } from "../../context/StockbarContext";
import { TemplateType } from "./TeplateType";
import StockBarDesignSkeleton from "./StockBarDesignSkeleton";
import { PopoverCustomAnimation } from "../../pages/wisebanner/tabs/templates/PopoverCustomAnimation";
import StockBarTempltes from "./StockBarTemplates";
import StockBarSetting from "./StockBarSetting";
import { ToastType, useToast } from "../../provider/ToastProvider";
import NoActiveStockBar from "./NoActiveStockBar";
import { FaSave } from "react-icons/fa";

export default function StockBarDesign({ deactivationButton }) {
  const { activeStockBar, setActiveStockBar } = useStockBarContext();
  const { showToast } = useToast();

  if (!activeStockBar) {
    return <NoActiveStockBar />;
  }

  const { progressColor, progressBgColor, progressStartColor, progressEndColor, type } = activeStockBar;

  const handlePropChange = (key, value) => {
    setActiveStockBar(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // First set the active stock bar
      const activeResponse = await fetch('/wp-json/wise-campaign-plugin/v1/stockbars/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeStockBar.id }),
      });

      if (!activeResponse.ok) {
        throw new Error('Failed to set active template');
      }

      // Then update the template design with isActive set to true
      const response = await fetch('/wp-json/wise-campaign-plugin/v1/stockbars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...activeStockBar, isActive: true }),
      });
      const data = await response.json();
      
      if (data.success) {
        showToast("Stock bar updated successfully!", ToastType.SUCCESS);
      } else {
        showToast("Failed to update stock bar", ToastType.ERROR);
      }
    } catch (error) {
      showToast("Error updating stock bar", ToastType.ERROR);
    }
  };

  const colorSettings = [
    {
      id: type === TemplateType.SOLID ? "progressColor" : "progressStartColor",
      label: type === TemplateType.SOLID ? "Progress Bar Color" : "Progress Start Color",
      value: type === TemplateType.SOLID ? progressColor : progressStartColor || "#000000"
    },
    ...(type === TemplateType.GRADIENT ? [{
      id: "progressEndColor",
      label: "Progress End Color",
      value: progressEndColor || "#000000"
    }] : []),
    {
      id: "progressBgColor",
      label: "Progress Background",
      value: progressBgColor || "#000000"
    },
    {
      id: "backgroundColor",
      label: "Stock Bar Background",
      value: activeStockBar.backgroundColor || "#ffffff"
    },
    {
      id: "textColor",
      label: "Text Color",
      value: activeStockBar.textColor || "#000000"
    },
    {
      id: "borderColor",
      label: "Border Color",
      value: activeStockBar.borderColor || "#e5e7eb"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-y-auto max-h-[calc(100vh-120px)]">
      {/* Preview Section */}
      <section className="p-6 border-b">
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <StockBarDesignSkeleton />
      </section>

      {/* Template Selection Section */}
      <section className="p-3 border-b bg-gray-50">
        <PopoverCustomAnimation
          popoverOptions={<StockBarTempltes/>}
          componentName="StockBar"
          deactivationButton={deactivationButton}
        />
      </section>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Color Customization Section */}
          <section>
            <div className="bg-white p-6 rounded-lg border overflow-y-auto max-h-[calc(100vh-300px)]">
              <h2 className="text-lg font-semibold mb-6">Color Settings</h2>
              <div className="space-y-4">
                {colorSettings.map(({ id, label, value }) => (
                  <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Typography className="text-sm font-medium">{label}</Typography>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{value}</span>
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handlePropChange(id, e.target.value)}
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Display Settings Section */}
          <section>
            <div className="bg-white p-6 rounded-lg border overflow-y-auto max-h-[calc(100vh-300px)]">
              <h2 className="text-lg font-semibold mb-6">Display Settings</h2>
              <StockBarSetting />
            </div>
          </section>
        </div>

        {/* Action Section */}
        <section className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            className="flex items-center gap-2"
            variant="gradient"
            color="blue"
          >
            <FaSave className="w-4 h-4" />
            Save Changes
          </Button>
        </section>
      </div>
    </div>
  );
}
