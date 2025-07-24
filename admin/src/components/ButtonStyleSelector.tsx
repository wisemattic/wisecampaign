import React, { useState } from "react";
import { rgbToHex } from "../utilities/main";
import { useBannerContext } from "../context/BannerContext";
import { Button } from "@material-tailwind/react";

const ButtonStyleSelector: React.FC = () => {
  const [selectedButton, setSelectedButton] = useState(null);
  const { activeBanner, updateActiveBanner } = useBannerContext();
  const { button } = activeBanner.banner;

  const handleClick = (index: number, event: any) => {
    const buttonStyle = event.target.style;
    const styleData = {
      width: activeBanner.banner.button.width,
      height: activeBanner.banner.button.height,
      text: activeBanner.banner.button.text,
      padding: buttonStyle.padding,
      color: rgbToHex(buttonStyle.color),
      bgColor: rgbToHex(buttonStyle.backgroundColor),
      borderColor: activeBanner.banner.button.borderColor,
      borderRadius: buttonStyle.borderRadius,
      hoverBgColor: activeBanner.banner.button.hoverBgColor,
      hoverBorderColor: activeBanner.banner.button.hoverBorderColor,
      hoverTextColor: activeBanner.banner.button.hoverTextColor,
      link: activeBanner.banner.button.link,
      fontSize: activeBanner.banner.button.fontSize,
      fontFamily: activeBanner.banner.button.fontFamily,
      fontWeight: activeBanner.banner.button.fontWeight,
      fontStyle: activeBanner.banner.button.fontStyle,
    };
    const updatedValues = {
      ...activeBanner,
      banner: {
        ...activeBanner.banner,
        button: {
          ...styleData,
        },
      },
    };

    updateActiveBanner(updatedValues);
    setSelectedButton(index);
    // onCheckedBannerChange(updatedValues);
  };

  const buttons = [
    {
      id: 1,
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "0rem",
        backgroundColor: "#3B82F6",
        color: "#FFFFFF",
      },
    },
    {
      id: 2,
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        backgroundColor: "#FF5733",
        color: "#FFFFFF",
      },
    },
    {
      id: 3,
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "1rem",
        backgroundColor: "#000000",
        color: "#FFFFFF",
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
      },
    },
    {
      id: 8,
      style: {
        padding: "0.5rem 1.5rem",
        borderRadius: "0.75rem",
        backgroundColor: "#F59E0B",
        color: "#000000",
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
            onClick={(event) => handleClick(index, event)}
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
