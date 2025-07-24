import React from 'react';
import './RoundCheckbox.scss';

interface RoundCheckboxProps {
    onCheckboxChange: (checked: boolean) => void;
    checked: boolean; // New prop to control checked state
}

const RoundCheckbox: React.FC<RoundCheckboxProps> = ({ onCheckboxChange, checked }) => {
    return (
        <div className="round-checkbox-container">
            <input
                type="checkbox"
                id="roundCheckbox"
                checked={checked}
                onChange={(e) => onCheckboxChange(e.target.checked)} // Notify parent of change
                className="round-checkbox"
            />
            {/*<label htmlFor="roundCheckbox" className="checkbox-label">*/}
            {/*    {checked ? 'Checked' : 'Unchecked'}*/}
            {/*</label>*/}
        </div>
    );
};

export default RoundCheckbox;
