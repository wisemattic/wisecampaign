import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Input,
  ButtonGroup,
  Button,
} from "@material-tailwind/react";
import InputField from "./Common/InputField";
import { useState } from "react";
import { Icon } from "../pages/wisebanner/tabs/customizer/BannerCustomizer";
import TextAlignmentToggle from "./Common/TextAlignmentToggle";

// excludeFields contains the type of fields to exclude
const TypographySetting = ({
  formValues,
  handleChange,
  component,
  excludeFields = [],
}) => {
  const [open, setOpen] = useState(1);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {!excludeFields.includes("color") && (
              <InputField
                label="Text Color"
                value={formValues.banner[component].color}
                type="color"
                onChange={handleChange(component, "color")}
              />
            )}

            {!excludeFields.includes("fontSize") && (
              <InputField
                label="Font Size"
                value={formValues.banner[component].fontSize}
                type="range"
                min={5}
                max={100}
                onChange={handleChange(component, "fontSize")}
              />
            )}

            {!excludeFields.includes("fontFamily") && (
              <InputField
                value={formValues.banner[component].fontFamily}
                label="Font Family"
                type="font-family"
                onChange={handleChange(component, "fontFamily")}
              />
            )}

            {!excludeFields.includes("fontWeight") && (
              <InputField
                value={formValues.banner[component].fontWeight}
                label="Font Weight"
                type="font-weight"
                onChange={handleChange(component, "fontWeight")}
              />
            )}

            {!excludeFields.includes("fontStyle") && (
              <InputField
                value={formValues.banner[component].fontStyle}
                label="Font Style"
                type="font-style"
                onChange={handleChange(component, "fontStyle")}
              />
            )}

            {!excludeFields.includes("hoverTextColor") && (
              <InputField
                label="Hover Text Color"
                value={formValues.banner[component].hoverTextColor}
                type="color"
                onChange={handleChange(component, "hoverTextColor")}
              />
            )}

            {/* {!excludeFields.includes("color") && (
        <InputField
          label="Text Alignment"
          value={formValues.banner.headline.align}
          type="radio"
          options={["left", "center", "right"]}
          onChange={handleChange(component, "align")}
        />)} */}

            {!excludeFields.includes("align") && (
               <InputField
               label="Text Alignment"
               value={formValues.banner.headline.align}
               type="text-align"
               onChange={handleChange(component, "align")}/>
            )}
          </div>
  );
};

export default TypographySetting;
