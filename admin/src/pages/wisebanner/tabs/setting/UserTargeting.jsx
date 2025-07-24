import { useState } from "react";
import DropdownComponent from "./DropdownComponent";

const UserTargeting = ({value, handleChange}) => {
  const [selected, setSelected] = useState({ value: "all", label: "All Users" });

  const options = [
    { value: "all", label: "All Users" },
    { value: "all", label: "Need to discuss" }
  ];

  // Need to change this function
  const handleOnChange = (e) => {
    const newValue = e.target.value;
    const selectedOption = options.find((option) => option.value === newValue);
    if (selectedOption) {
      setSelected(selectedOption);
      handleChange({ target: { name: "userTargeting", value: newValue } });
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

export default UserTargeting;
