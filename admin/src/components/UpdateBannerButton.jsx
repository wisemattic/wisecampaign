import { Button } from "@material-tailwind/react";
import { useBannerContext } from "../context/BannerContext";
import useFormToDbMapper from "../hooks/useFormToDbMapper";
import { ToastType, useToast } from "../provider/ToastProvider";
import { FaSave, FaUndo } from "react-icons/fa";

const UpdateBannerButton = () => {
  const { activeBanner, updateBanner } = useBannerContext();
  const { showToast } = useToast();
  const mapFormToDb = useFormToDbMapper();
  
  const handleSave = async () => {
    try {
      const banner = mapFormToDb(activeBanner);
      if (!banner.id) {
        showToast("Banner ID is required", ToastType.ERROR);
        return;
      }

      const formData = new FormData();
      Object.entries(banner).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await updateBanner(banner.id, formData);
      showToast("Banner updated successfully!", ToastType.SUCCESS);
    } catch (error) {
      showToast("Failed to save changes", ToastType.ERROR);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      window.location.reload();
    }
  };

  if (!activeBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Any unsaved changes will be lost
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            className="flex items-center gap-2"
            color="red"
            variant="outlined"
            size="sm"
          >
            <FaUndo className="w-4 h-4" />
            Reset Changes
          </Button>
          <Button
            onClick={handleSave}
            className="flex items-center gap-2"
            size="sm"
            variant="gradient"
            color="blue"
          >
            <FaSave className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBannerButton;
