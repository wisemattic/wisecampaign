import { useState, useEffect } from "react";

interface DropdownComponentProps {
    onChange?: (e: { target: { value: string } }) => void;
    options?: { value: string; label: string }[];
    defaultSelected?: { value: string; label: string };
}

const DropdownComponent: React.FC<DropdownComponentProps> = ({ options, defaultSelected, onChange }) => {
    const [selectedValue, setSelectedValue] = useState<string>(defaultSelected ? defaultSelected.value : '');

    useEffect(() => {
        if (defaultSelected) {
            setSelectedValue(defaultSelected.value);
        }
    }, [defaultSelected]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setSelectedValue(newValue);
        if (onChange) {
            onChange({ target: { value: newValue } });
        }
    };

    return (
        <select 
        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
        value={selectedValue} onChange={handleChange}>
            {options && options.map((option, index) => {
                return (
                    <option key={index} value={option.value} className="p-1">
                        {option.label}
                    </option>
                );
            })}
        </select>
    );
};

export default DropdownComponent;
