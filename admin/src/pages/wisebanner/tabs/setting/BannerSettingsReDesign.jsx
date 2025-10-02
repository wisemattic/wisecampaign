import SettingElementLayout from "./SettingElementLayout";
import BannerPosition from "./BannerPosition";
import BannerType from "./BannerType";
import BannerAction from "./BanneraAction";
import BannerOnDevice from "./BannerOnDevice";
import BannerDeploy from "./BannerDeploy";
import PageTargeting from "./PageTargeting";
import UserTargeting from "./UserTargeting";
import { useEffect, useState } from "react";
import useDisplayRule from "../../../../hooks/useDisplayRule";
import { openInNewTab, toSnakeCase } from "../../../../utils/utils";
import { ToastType, useToast } from "../../../../provider/ToastProvider";
import { useSettingContext } from "../../../../context/SettingContext";
import SettingElementLayoutReDesign from "./SettingElementLayoutReDesign";
import { useAppSettingContext } from "../../../../context/common/AppSettingContext";
import { Button } from "@material-tailwind/react";
import { FaUndo } from "react-icons/fa";
import UpdateBannerSettingButton from "../../../../components/UpdateBannerSettingButton";


const BannerSettingsReDesign = () => {

  
  const {settingConfig} = useAppSettingContext()
  const {isProActive} = settingConfig

  const {isPro} = useSettingContext();
  const {save, fetchTargetOptions, users, pages, displayRules, fetchDisplayRule} = useDisplayRule()
  const {showToast} = useToast()

  // Initializing state for banner settings
  const [settingState, setSettingState] = useState({
    bannerPosition: 'top',
    bannerType: 'normal',
    buttonAction: '_self',
    showBannerOn: ['mobile','desktop'],
    bannerDeploy: {
      afterSeconds: false,
      afterScroll: false,
      seconds: 10,
      scroll: 10,
    },
    pageTargeting: 'all',
    userTargeting: ''
  });

  // Fetch the display rules on component mount
  useEffect(() => {
    if(isProActive) {
      fetchDisplayRule();
      fetchTargetOptions();
    }
  }, [isProActive]);

  // Sync the displayRules with the component state
  useEffect(() => {
    if (displayRules) {
      setSettingState(displayRules);
    }
  }, [displayRules]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettingState((prevState) => {
      const updatedState = {
        ...prevState,
        [name]: value,
      };
      return updatedState;
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const updatedDisplayRules = toSnakeCase(settingState);
      await save(updatedDisplayRules); // Save the updated display rules
      showToast("Your wise banner setting saved successfully!", ToastType.SUCCESS);
    } catch (error) {
      showToast("Banner setting not saved", ToastType.ERROR);
    }
  };

  return (
    <>
   <div className="relative block bg-slate-100 w-full group">
      <div>
        {/* Main Content */}
      <div className="grid grid-cols-1 gap-3"> 
        <SettingElementLayoutReDesign
          title="Banner Position"
          element={<BannerPosition value={settingState.bannerPosition} handleChange={handleChange}/>}
        />
        <SettingElementLayoutReDesign title="Banner Type" element={<BannerType value={settingState.bannerType} handleChange={handleChange} />} />
        <SettingElementLayoutReDesign
          title="Button Action"
          element={<BannerAction value={settingState.buttonAction} handleChange={handleChange}/>}
        />
        <SettingElementLayoutReDesign
          title="Show banner on:"
          element={<BannerOnDevice value={settingState.showBannerOn} handleChange={handleChange}/>}
        />
        <SettingElementLayoutReDesign
          title="Banner Deploy:"
          element={<BannerDeploy value={settingState.bannerDeploy} handleChange={handleChange}/>}
        />
        <SettingElementLayoutReDesign
          title="Page targeting:" 
          element={<PageTargeting pages={pages} value={settingState.pageTargeting} handleChange={handleChange}/>}
        />
        {/* <SettingElementLayout
          title="User targeting:"
          element={<UserTargeting value={settingState.userTargeting} handleChange={handleChange}/>}
        /> */}
      </div>

      {/* Fade Overlay */}
      {!isProActive ? <>
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-md"></div>

      {/* Button on Hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={()=> openInNewTab('https://wisemattic.com/wisecampaign/')} className="bg-white px-6 py-2 rounded-md font-extrabold text-violet-600 hover:bg-gray-200">
          Upgrade to PRO
        </button>
      </div>
      </>
      : <></>}
      </div>
    </div>

    <div>
      <UpdateBannerSettingButton settingState={settingState} />
    </div>

    </>
  );
};

export default BannerSettingsReDesign;
