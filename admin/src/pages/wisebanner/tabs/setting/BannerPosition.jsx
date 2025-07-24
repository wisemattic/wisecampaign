import { useEffect, useState } from "react";
import DropdownComponent from "./DropdownComponent";

const BannerPosition = ({value, handleChange}) => {
  const [selected, setSelected] = useState({ value: "top", label: "Top" });

  const options = [
    { value: "top", label: "Top" },
    { value: "bottom", label: "Bottom" }
  ];

  useEffect(() => {
    // Find the option based on the 'value' prop when the component mounts or when 'value' changes
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      setSelected(selectedOption); // Update state with the matched option
    }
  }, [value]); // This effect runs whenever the 'value' prop changes


  const handleOnChange = (e) => {
    const newValue = e.target.value;
    const selectedOption = options.find((option) => option.value === newValue);
    if (selectedOption) {
      setSelected(selectedOption);
      handleChange({ target: { name: "bannerPosition", value: newValue } });
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

export default BannerPosition;
