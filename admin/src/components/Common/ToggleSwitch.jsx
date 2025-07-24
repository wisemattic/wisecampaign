import React, { useState } from 'react';

const ToggleSwitch = ({isOn, handleToggle, disabled=false}) => {

    return (
        <div
            onClick={handleToggle}
            className={`w-8 h-3 flex items-center rounded-full cursor-pointer border-2 border-indigo-700 ${
                !disabled && isOn ? 'bg-indigo-700' : 'bg-gray-300'
            }`}
        >
            <div
                className={`bg-indigo-400 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    !disabled && isOn ? 'translate-x-6' : 'translate-x-0'
                }`}
            />
        </div>
    );
};

export default ToggleSwitch;
