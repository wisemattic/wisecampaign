import { useEffect, useState } from "react";
import DropdownComponent from "./DropdownComponent";

const BannerAction = ({value, handleChange}) => {
  const [selected, setSelected] = useState({ value: "newtab", label: "Open In New Tab" });

  const options = [
    { value: "_blank", label: "Open In New Tab" },
    { value: "_self", label: "Open Here" }
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
      handleChange({ target: { name: "buttonAction", value: newValue } });
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

export default BannerAction;
