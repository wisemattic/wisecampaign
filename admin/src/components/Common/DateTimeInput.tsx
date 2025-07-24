import React from 'react';

interface DateTimeInputProps {
    label: string;
    type: string; // This could be restricted to 'datetime-local' if needed
    value: string;
    onChange: (formattedValue: string) => void;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({ label, type, value, onChange }) => {

    // Function to format the date value as 'YYYY-MM-DD HH:mm:ss'
    const formatDateTime = (dateValue: string): string => {
        const date = new Date(dateValue);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(formatDateTime(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </div>
    );
};

export default DateTimeInput;
