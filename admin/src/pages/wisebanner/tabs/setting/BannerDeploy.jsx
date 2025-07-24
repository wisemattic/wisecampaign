import { useState } from "react";

const BannerDeploy = ({ value, handleChange }) => {
    const { afterSeconds = false, afterScroll = false, seconds = 10, scroll = 10 } = value;

    // Handle checkbox change
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        handleChange({
            target: {
                name: "bannerDeploy",
                value: { ...value, [name]: checked },
            },
        });
    };

    // Handle input change
    const handleInputChange = (event) => {
        const { name, value: inputValue } = event.target;
        handleChange({
            target: {
                name: "bannerDeploy",
                value: { ...value, [name]: Number(inputValue) },
            },
        });
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <label className="flex gap-1">
                <input
                    type="checkbox"
                    name="afterSeconds"
                    checked={afterSeconds}
                    onChange={handleCheckboxChange}
                    className="text-blue-600 rounded self-center"
                />
                <span className="text-gray-700 self-center">
                    After
                    <input
                        name="seconds"
                        className="w-16 text-center ml-1 mr-1"
                        type="number"
                        min={0}
                        value={seconds}
                        onChange={handleInputChange}
                    />
                    Seconds
                </span>
            </label>
            <label className="flex gap-1">
                <input
                    type="checkbox"
                    name="afterScroll"
                    checked={afterScroll}
                    onChange={handleCheckboxChange}
                    className="text-blue-600 rounded self-center"
                />
                <span className="text-gray-700 self-center">
                    After
                    <input
                        name="scroll"
                        className="w-16 text-center ml-1 mr-1"
                        type="number"
                        min={0}
                        max={100}
                        value={scroll}
                        onChange={handleInputChange}
                    />
                    % Scroll
                </span>
            </label>
        </div>
    );
};

export default BannerDeploy;
