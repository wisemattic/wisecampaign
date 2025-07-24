import React from "react";
import { BannerSection } from "./BannerSection";
import { HeadlineSection } from "./HeadlineSection";
import { SubHeadlineSection } from "./SubHeadlineSection";
import { CountdownSection } from "./CountdownSection";
import { ButtonSection } from "./ButtonSection";
import { BogoSection } from "./BogoSection";
import { useBannerContext } from "../../../../context/BannerContext";
import {
  Accordion,
  AccordionHeader,
  AccordionBody
} from "@material-tailwind/react";
import UpdateBannerButton from "../../../../components/UpdateBannerButton";
import BannerSettings from "../setting/BannerSettings";
import { FaPaintBrush, FaImage, FaHeading, FaFont, FaClock } from "react-icons/fa";
import { RxButton } from "react-icons/rx";

const BannerCustomizer: React.FC = () => {
  const {
    updateActiveBanner,
    activeBanner
  } = useBannerContext();

  // Handle non-nested changes (e.g., banner settings)
  const handleChange =
    (section: keyof FormValues["banner"], key: string, unit?: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value =
        e.target.type === "file" ? e.target.files?.[0] || null : e.target.value;

      if (unit) {
        value = value + unit;
      }



      // Preserve the id while updating form values
    const updatedValues = {
      ...activeBanner,
      banner: {
        ...activeBanner.banner,
        [section]: {
          ...activeBanner.banner[section],
          [key]: value,
        },
        id: activeBanner.banner?.id || null, // Ensure the ID is preserved
      },
    };

      updateActiveBanner(updatedValues);
    };

  const [open, setOpen] = React.useState(1); // Changed from 0 to 1 to open Background by default

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    activeBanner &&
    <div>
      <div className="space-y-2">
        {[
          { id: 1, title: "Background", icon: <FaPaintBrush className="w-4 h-4" />, component: <BannerSection formValues={activeBanner} handleChange={handleChange} /> },
          { id: 2, title: "Bogo", icon: <FaImage className="w-4 h-4" />, component: <BogoSection formValues={activeBanner} handleChange={handleChange} /> },
          { id: 3, title: "Headline", icon: <FaHeading className="w-4 h-4" />, component: <HeadlineSection formValues={activeBanner} handleChange={handleChange} /> },
          { id: 4, title: "Sub Headline", icon: <FaFont className="w-4 h-4" />, component: <SubHeadlineSection formValues={activeBanner} handleChange={handleChange} /> },
          { id: 5, title: "Countdown", icon: <FaClock className="w-4 h-4" />, component: <CountdownSection formValues={activeBanner} handleChange={handleChange} /> },
          { id: 6, title: "Button", icon: <RxButton className="w-4 h-4" />, component: <ButtonSection formValues={activeBanner} handleChange={handleChange} /> }
        ].map(({ id, title, icon, component }) => (
          <div key={id} className="flex items-start">
            <Accordion open={open === id} className={`w-[200px] flex-shrink-0 ${open === id ? 'bg-blue-50 rounded-lg' : ''}`}>
              <AccordionHeader
                onClick={() => handleOpen(id)}
                className={`text-sm font-semibold py-1 px-2 flex items-center gap-2 ${open === id ? 'text-blue-500' : 'text-gray-700'}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  {icon}
                  {title}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`${open === id ? "rotate-270 text-blue-500" : "rotate-90"} h-4 w-4 transition-transform`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </AccordionHeader>
            </Accordion>
            <div className={`flex-1 transition-all duration-300 ${open === id ? 'pl-6 opacity-100' : 'opacity-0'}`}>
              {open === id && component}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Icon = ({ id, open }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${id === open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
};

export default BannerCustomizer;
