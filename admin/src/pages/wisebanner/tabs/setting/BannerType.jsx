import { useEffect, useState } from "react";
import DropdownComponent from "./DropdownComponent";

const BannerType = ({value, handleChange}) => {
  const [selected, setSelected] = useState({ value: "sticky", label: "Sticky" });

  const options = [
    { value: "sticky", label: "Sticky" },
    { value: "normal", label: "Normal" }
  ];

  useEffect(() => {
    // Find the option based on the 'value' prop when the component mounts or when 'value' changes
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      setSelected(selectedOption); // Update state with the matched option
    }
  }, [value]); // This effect runs whenever the 'value' prop changes

  // Need to change this function
  const handleOnChange = (e) => {
    const newValue = e.target.value;
    const selectedOption = options.find((option) => option.value === newValue);
    if (selectedOption) {
      setSelected(selectedOption);
      handleChange({ target: { name: "bannerType", value: newValue } });
    }
  };

  return (
    <DropdownComponent
      options={options}
      defaultSelected={selected}
      onChange={handleOnChange}
    />
  );
};

export default BannerType;
