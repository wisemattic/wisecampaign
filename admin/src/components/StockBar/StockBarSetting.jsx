import { Typography } from "@material-tailwind/react";
import { useStockBarContext } from "../../context/StockbarContext";
import ReactSwitch from "react-switch";
import { ToastType, useToast } from "../../provider/ToastProvider";

export default function StockBarSetting() {
  const { stockBarSetting, setStockBarSetting } = useStockBarContext();
  const { showToast } = useToast();

  const handleToggle = (field) => {
    const updatedSetting = { 
      ...stockBarSetting, 
      [field]: !stockBarSetting[field] 
    };
    setStockBarSetting(updatedSetting);
    handleSave(updatedSetting);
  };

  const handleSave = async (settings) => {
    try {
      const response = await fetch("/wp-json/wise-campaign-plugin/v1/stockbars/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      
      if (data.success) {
        showToast("Settings saved successfully!", ToastType.SUCCESS);
      } else {
        showToast("Failed to save settings", ToastType.ERROR);
      }
    } catch (error) {
      showToast("Error saving settings", ToastType.ERROR);
    }
  };

  if (!stockBarSetting) return null;

  const settings = [
    {
      id: 'displayOnShopPage',
      label: 'Display on Shop Page',
      description: 'Show stock bar on the WooCommerce shop page'
    },
    {
      id: 'displayOnProductPage',
      label: 'Display on Product Page',
      description: 'Show stock bar on individual product pages'
    }
  ];

  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Stock Bar Display Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Configure where the stock bar appears on your store</p>
      </div>

      <div className="space-y-4">
        {settings.map(({ id, label, description }) => (
          <div key={id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div>
              <Typography className="font-medium text-gray-800">{label}</Typography>
              <Typography className="text-sm text-gray-600">{description}</Typography>
            </div>
            <ReactSwitch
              checked={stockBarSetting[id]}
              onChange={() => handleToggle(id)}
              onColor="#3b82f6"
              offColor="#94a3b8"
              onHandleColor="#ffffff"
              offHandleColor="#ffffff"
              handleDiameter={20}
              height={24}
              width={48}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.2)"
              activeBoxShadow="0px 0px 1px 5px rgba(59, 130, 246, 0.2)"
              uncheckedIcon={false}
              checkedIcon={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
