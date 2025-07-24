import React from 'react';
import ColorPicker from "./ColorPicker";
import DateTimeInput from "./DateTimeInput";
import TextAlignmentToggle from './TextAlignmentToggle';

interface InputProps {
    label: string;
    value: string | number | File | null;
    type: string;
    onChange: (e: { target: { value: string } }) => void;
    min?: number,
    max?: number,
    unit?: string | null,
    defaultValue?: number,
    options?: { value: string; label: string }[] | string[];
}

const InputField: React.FC<InputProps> = ({label, value, type, onChange, min, max, unit, defaultValue, options}) => {

    switch (type) {
        case 'radio':

            return (<div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
                    <div className="flex space-x-4">
                        {options && options.map((option) => {
                            // Check if it's an array of strings or an array of objects
                            const optionValue = typeof option === 'string' ? option : option.value;
                            const optionLabel = typeof option === 'string' ? option : option.label;
                            return (<label key={optionValue}
                                           className="inline-flex items-center text-sm font-medium text-gray-700">
                                    <input className="form-radio mr-2"
                                           type="radio"
                                           name={label}
                                           value={optionValue}
                                           checked={value === optionValue}
                                           onChange={onChange}
                                    />
                                    {optionLabel}
                                </label>);
                        })}
                    </div>
                </div>);
        case 'file':
            return (<div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
                    <input type="file" onChange={onChange}
                           className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                </div>);
        case 'color':
            return (<ColorPicker label={label} value={String(value)} onChange={(colorValue) => {
                onChange({ target: { value: colorValue } });
            }} />);
        case 'checkbox':
        case 'number': return (<div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
            <input
                type={type}
                value={String(value)}
                onChange={onChange}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </div>)
        case 'text':
            return (<div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
                <input
                    type={type}
                    value={String(value)}
                    onChange={onChange}
                    className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>)
        case 'date':
        case 'datetime-local':
            return (<DateTimeInput label={label} type={type} value={String(value)} onChange={(datetimeValue: any) => {
                onChange({ target: { value: datetimeValue } });
            }} />);

        case 'font-weight':
            return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
                <select 
                className="w-full placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                onChange={onChange}
                value={String(value)}
                >
                    <option value="100">Thin</option>
                    <option value="200">Extralight</option>
                    <option value="300">Light</option>
                    <option value="400">Normal</option>
                    <option value="500">Medium</option>
                    <option value="600">Semi Bold</option>
                    <option value="700">Bold</option>
                    <option value="800">Extra Bold</option>
                </select>
            </div>);

        case 'font-style':
            return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
                <select 
                className="w-full placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                onChange={onChange}
                value={String(value)}
                >
                    <option value="italic">Italic</option>
                    <option value="regular">Regular</option>
                </select>
            </div>);

        case 'font-family':
            return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
                <select 
                className="w-full placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                onChange={onChange}
                value={String(value)}
                >
                    <option value="Apple Color Emoji">Apple Color Emoji</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Cambria">Cambria</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Liberation Mono">Liberation Mono</option>
                    <option value="Menlo">Menlo</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Consolas">Consolas</option>
                    <option value="Archivo Black">Archivo Black</option>
                </select>
            </div>);

        case 'text-align':
            return(
                <TextAlignmentToggle onChange={onChange} value={String(value)}/>
            );

        case 'range':
            return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
                <input
                type='range'
                min={min}
                max={max}
                defaultValue={defaultValue}
                value={String(value)}
                onChange={onChange}
                className="w-full py-2 border rounded-lg"/>
                <div className="flex justify-between w-full text-gray-500 text-sm mt-2">
                    <span>{min}</span>
                    <span className='text-blue-800'>{String(value)} {unit}</span>
                    <span>{max}</span>
                </div>
            </div>)
        default:
            return null;
    }
};

export default InputField
