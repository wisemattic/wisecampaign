import { useEffect, useState } from "react";

const BannerOnDevice = ({ value = [], handleChange }) => {
  // Initialize state for tracking the checked status of devices
  const [checkedDevices, setCheckedDevices] = useState({
    mobile: false,
    desktop: false,
  });

  // Sync the `checkedDevices` state with the `value` prop
  useEffect(() => {
    if(Array.isArray(value)) {
    setCheckedDevices({
      mobile: value.includes("mobile"),
      desktop: value.includes("desktop"),
    });
  }
  }, [value]);

  // Handle checkbox changes
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    console.log('=============')
    console.log(name)
    console.log(checked)

    // Update the `checkedDevices` state
    setCheckedDevices((prev) => ({
      ...prev,
      [name]: checked,
    }));

    // Create the updated devices array and pass it to the parent
    const updatedDevices = checked
      ? [...new Set([...value, name])] // Add device if not already included
      : value.filter((device) => device !== name); // Remove unselected device


      console.log(updatedDevices)

    // Notify the parent component of the updated devices array
    handleChange({ target: { name: "showBannerOn", value: updatedDevices } });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="flex gap-1">
        <input
          type="checkbox"
          name="mobile"
          checked={checkedDevices.mobile}
          onChange={handleCheckboxChange}
          className="text-blue-600 border-gray-300 rounded self-center"
        />
        <span className="text-gray-700 self-center">Mobile</span>
      </label>
      <label className="flex gap-1">
        <input
          type="checkbox"
          name="desktop"
          checked={checkedDevices.desktop}
          onChange={handleCheckboxChange}
          className="text-blue-600 border-gray-300 rounded self-center"
        />
        <span className="text-gray-700 self-center">Desktop</span>
      </label>
    </div>
  );
};

export default BannerOnDevice;
