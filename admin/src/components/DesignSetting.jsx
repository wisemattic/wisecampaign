import { Accordion, AccordionBody, AccordionHeader } from "@material-tailwind/react";
import InputField from "./Common/InputField";
import { Icon } from "../pages/wisebanner/tabs/customizer/BannerCustomizer";
import { useState } from "react";

const DesignSetting = ({formValues, handleChange, component}) => {
  const [open, setOpen] = useState(1);
 
  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    <div>
      <Accordion open={open === 1} icon={<Icon id={1} open={open} />}>
          <AccordionHeader className="text-sm" onClick={() => handleOpen(1)}>
          Design
          </AccordionHeader>
          <AccordionBody>
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <InputField
        label="Padding"
        value={formValues.banner.button.padding.replace("px","")}
        type="range"
        min={-100}
        max={100}
        unit={'px'}
        onChange={handleChange(component, "padding", 'px')}
      />
      <InputField
        label="Border Radius"
        value={formValues.banner.button.borderRadius.replace("px","")}
        type="range"
        min={0}
        max={50}
        onChange={handleChange(component, "borderRadius", 'px')}
      />
      <InputField
        label="Background Color"
        value={formValues.banner.button.bgColor}
        type="color"
        onChange={handleChange(component, "bgColor")}
      />
      <InputField
        label="Border Color"
        value={formValues.banner.button.borderColor}
        type="color"
        onChange={handleChange(component, "borderColor")}
      />
      <InputField
        label="Hover Background Color"
        value={formValues.banner.button.hoverBgColor}
        type="color"
        onChange={handleChange(component, "hoverBgColor")}
      />
      <InputField
        label="Hover Border Color"
        value={formValues.banner.button.hoverBorderColor}
        type="color"
        onChange={handleChange(component, "hoverBorderColor")}
      />
    </div>

    </AccordionBody>
    </Accordion>
    </div>
  );
};

export default DesignSetting