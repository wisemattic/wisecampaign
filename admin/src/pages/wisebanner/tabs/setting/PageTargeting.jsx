import { useEffect, useState } from "react";
import DropdownComponent from "./DropdownComponent";

const PageTargeting = ({ value, handleChange, pages }) => {
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Populate options dynamically
    const newOptions = pages && Array.isArray(pages)
      ? [{ value: "all", label: "Show Every Page" }, ...pages]
      : [{ value: "all", label: "Show Every Page" }];

    setOptions(newOptions);
  }, [pages]);

  useEffect(() => {
    // Set the selected state based on the `value` prop
    if (options.length > 0) {
      const selectedOption = options.find((option) => option.value === value) || options[0];
      setSelected(selectedOption);
    }
  }, [value, options]); // Runs when `value` or `options` changes

  const handleOnChange = (e) => {
    const newValue = e.target.value;
    const selectedOption = options.find((option) => option.value === newValue);

    if (selectedOption) {
      setSelected(selectedOption);
      handleChange({ target: { name: "pageTargeting", value: newValue } });
    }
  };

  return (
    <>
      {options.length > 0 && selected && (
        <DropdownComponent
          options={options}
          defaultSelected={selected}
          onChange={handleOnChange}
        />
      )}
    </>
  );
};

export default PageTargeting;
