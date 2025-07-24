import React, { useState } from "react";
import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight } from "react-icons/fa";

const TextAlignmentToggle = ({onChange, value}) => {
  // State for selected alignment
  const [alignment, setAlignment] = useState(value);

  // Handler to update alignment state
  const handleAlignmentChange = (newAlignment) => {
    setAlignment(newAlignment);
     // Create a synthetic event with the required structure
     const syntheticEvent = {
      target: { value: newAlignment }
    };

    onChange(syntheticEvent);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
        Text Alignment
      </label>

      <div className="flex gap-4 justify-center">
        {/* Left Alignment */}
        <div
          onClick={() => handleAlignmentChange("left")}
          className={`p-2 rounded-md cursor-pointer transition-colors ${
            alignment === "left"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          <div className="flex flex-col items-center">
            <FaAlignLeft/>
            <span className="text-sm">Left</span>
          </div>
        </div>

        {/* Center Alignment */}
        <div
          onClick={() => handleAlignmentChange("center")}
          className={`p-2 rounded-md cursor-pointer transition-colors ${
            alignment === "center"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          <div className="flex flex-col items-center">
            <FaAlignCenter/>
            <span className="text-sm">Center</span>
          </div>
        </div>

        {/* Right Alignment */}
        <div
          onClick={() => handleAlignmentChange("right")}
          className={`p-2 rounded-md cursor-pointer transition-colors ${
            alignment === "right"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          <div className="flex flex-col items-center">
            <FaAlignRight/>
            <span className="text-sm">Right</span>
          </div>
        </div>

        {/* Justify Alignment */}
        <div
          onClick={() => handleAlignmentChange("justify")}
          className={`p-2 rounded-md cursor-pointer transition-colors ${
            alignment === "justify"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          <div className="flex flex-col items-center">
            <FaAlignJustify/>
            <span className="text-sm">Justify</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextAlignmentToggle;
