import { Button } from "@material-tailwind/react";
import { useBannerContext } from "../context/BannerContext";
import useFormToDbMapper from "../hooks/useFormToDbMapper";
import { ToastType, useToast } from "../provider/ToastProvider";
import { FaSave, FaUndo } from "react-icons/fa";
import useDisplayRule from "../hooks/useDisplayRule";
import { toSnakeCase } from "../utils/utils";

const UpdateBannerSettingButton = ({settingState}) => {


  const {save, fetchTargetOptions, users, pages, displayRules, fetchDisplayRule} = useDisplayRule()
  const {showToast} = useToast()
  
  const handleSubmit = async () => {
      try {
        const updatedDisplayRules = toSnakeCase(settingState);
        await save(updatedDisplayRules); // Save the updated display rules
        showToast("Your wise banner setting saved successfully!", ToastType.SUCCESS);
      } catch (error) {
        showToast("Banner setting not saved", ToastType.ERROR);
      }
    };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      window.location.reload();
    }
  };

  return (
    <div className="bottom-0 left-0 right-0 bg-white border-t mt-6 p-4">
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
            onClick={handleSubmit}
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

export default UpdateBannerSettingButton;
