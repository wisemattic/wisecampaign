import React, { useState } from "react";
import { rgbToHex } from "../utilities/main";
import { useBannerContext } from "../context/BannerContext";
import { Button } from "@material-tailwind/react";

const ButtonStyleSelector: React.FC = () => {
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const { activeBanner, updateActiveBanner } = useBannerContext();
  const { button } = activeBanner.banner;

  const handleClick = (index: number, selectedStyle: any) => {
    const formatSize = (val: any) => {
      if (!val) return "14px";
      return isNaN(Number(val)) ? val : `${val}px`;
    };

    const newFontSize = formatSize(selectedStyle.fontSize);

    const styleData = {
      ...activeBanner.banner.button,
      padding: selectedStyle.padding || activeBanner.banner.button.padding,
      color: selectedStyle.color || activeBanner.banner.button.color,
      bgColor: selectedStyle.backgroundColor || activeBanner.banner.button.bgColor,
      borderRadius: selectedStyle.borderRadius || activeBanner.banner.button.borderRadius,
      fontSize: newFontSize, 
    };

    // 1. Update Context (for the Live Preview)
    updateActiveBanner({
      ...activeBanner,
      banner: { ...activeBanner.banner, button: styleData },
    });

    // 2. CRITICAL: If you have access to the parent's handleChange 
    // or a way to update the 'formValues' object, you must call it here.
    // Otherwise, TypographySetting will still show the old value in the range slider.

    setSelectedButton(index);
};

  const buttons = [
    {
      id: 1,
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "0rem",
        backgroundColor: "#3B82F6",
        fontSize: "14px"
      },
    },
    {
      id: 2,
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        backgroundColor: "#FF5733",
        color: "#FFFFFF",
        fontSize: "14px"
      },
    },
    {
      id: 3,
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "1rem",
        backgroundColor: "#000000",
        color: "#FFFFFF",
        fontSize: "14px"
      },
    },
    {
      id: 4,
      style: {
        padding: "0.5rem 1.5rem",
        borderRadius: "2rem",
        backgroundColor: "#10B981",
        color: "#FFFFFF",
        border: "none",
        fontSize: "14px"
      },
    },
    {
      id: 5,
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "0.25rem",
        backgroundColor: "transparent",
        color: "#3B82F6",
        border: "2px solid #3B82F6",
        fontSize: "14px"
      },
    },
    {
      id: 6,
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "0.5rem",
        backgroundColor: "#7C3AED",
        color: "#FFFFFF",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        fontSize: "14px"
      },
    },
    {
      id: 7,
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "0rem",
        backgroundColor: "#DC2626",
        color: "#FFFFFF",
        border: "2px solid #991B1B",
        fontSize: "14px"
      },
    },
    {
      id: 8,
      style: {
        padding: "0.5rem 1.5rem",
        borderRadius: "0.75rem",
        backgroundColor: "#F59E0B",
        color: "#000000",
        fontSize: "14px"
      },
    },
    // {
    //   id: 9,
    //   style: {
    //     padding: "0.5rem 1rem",
    //     borderRadius: "0.25rem",
    //     background: "linear-gradient(45deg, #3B82F6, #7C3AED)",
    //     color: "#FFFFFF",
    //   },
    // },
  ];

  return (
    <aside className="grid grid-cols-3 gap-4 p-2">
      {buttons.map(({ id, style }, index) => (
        <div key={id}>
          <button
            // Change 2: Pass the 'style' object to the handler
            onClick={() => handleClick(index, style)}
            style={style}
            className={`w-full transition-all duration-300 ${
              selectedButton === index
                ? "outline outline-2 outline-blue-500 outline-offset-2"
                : ""
            }`}
          >
            {button.text}
          </button>
        </div>
      ))}
    </aside>
  );
};

export default ButtonStyleSelector;
