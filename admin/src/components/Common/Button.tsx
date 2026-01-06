import React, {useState} from 'react';

// Define the type for the Button props
interface ButtonProps {
    label: string;
    buttonStyle: Button;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, buttonStyle = {},  className = '', onClick, disabled = false }) => {

    const [isHovered, setIsHovered] = useState(false);

    
    const formatFontSize = (size?: string | number) => {
        if (!size) return undefined;
        return isNaN(Number(size)) ? size : `${size}px`;
    };

    const style = {
        minWidth: buttonStyle.width,
        minHeight: buttonStyle.height,
        padding: buttonStyle.padding || '0.75rem 1.5rem',
        backgroundColor: isHovered ? buttonStyle.hoverBgColor : buttonStyle.bgColor,
        color: isHovered ? buttonStyle.hoverTextColor : buttonStyle.color,
        fontSize: formatFontSize(buttonStyle.fontSize),
        fontFamily: buttonStyle.fontFamily,
        fontWeight: buttonStyle.fontWeight,
        fontStyle: buttonStyle.fontStyle,
        borderColor: isHovered ? buttonStyle.hoverBorderColor : buttonStyle.borderColor,
        borderRadius: buttonStyle.borderRadius,
        cursor: 'pointer',
        border: `1px solid ${isHovered ? buttonStyle.hoverBorderColor : buttonStyle.borderColor}`,
    };


    return (
        <button
            onClick={onClick}
            style={style}
            className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label}
        </button>
    );
};

export default Button;
