import React from 'react';

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (e: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {

    return (
        <div className="">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                {label}
            </label>
            <div className="flex items-center space-x-4">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-16 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
        </div>
    );
};

export default ColorPicker;
