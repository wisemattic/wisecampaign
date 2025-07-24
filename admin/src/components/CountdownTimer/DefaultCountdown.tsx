import { useState, useEffect } from 'react';

// @ts-ignore
const DefaultCountdown = ({ text, fontSize, fontWeight, fontStyle, fontFamily, color, timerEndDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        Days: 0,
        Hours: 0,
        Min: 0,
        Sec: 0,
    });

    const calculateTimeLeft = () => {
        const eventTime = new Date(timerEndDate); // Using dynamic timerEndDate prop
        const currentTime = new Date();
        // @ts-ignore
        const difference = eventTime - currentTime;

        if (difference > 0) {
            const Days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const Hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const Min = Math.floor((difference / 1000 / 60) % 60);
            const Sec = Math.floor((difference / 1000) % 60);
            setTimeLeft({ Days, Hours, Min, Sec });
        } else {
            setTimeLeft({ Days: 0, Hours: 0, Min: 0, Sec: 0 });
        }
    };

    useEffect(() => {
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [timerEndDate]);

    return (

        <>
        <p className='text-center' style={{
                    color: color,
                    fontSize: fontSize,
                    fontFamily: fontFamily,
                    fontWeight: fontWeight,
                    fontStyle: fontStyle
             }}
        >
            {text}
        </p>
        <div className="c-flex c-space-x-1 c-rounded-md c-items-center c-justify-center count-down-main">
            {['Days', 'Hours', 'Min', 'Sec'].map((unit) => (
                <div key={unit} className="timer">
                    <div className="c-pr-2 c-pl-2 c-relative c-bg-indigo-100 c-w-max c-before">
                        <div
                            className={`countdown-element ${unit} c-font-manrope c-font-semibold c-text-16px c-text-indigo-600 c-tracking-16px c-max-w-30px c-text-center c-relative c-z-20`}
                            style={{
                                fontSize: fontSize,
                                fontWeight: fontWeight,
                                fontStyle: fontStyle,
                                fontFamily: fontFamily,
                                color: color,
                            }}
                        >

                            {timeLeft[unit]}
                        </div>
                    </div>
                    <p style={{
                        fontSize: fontSize,
                        fontWeight: fontWeight,
                        fontStyle: fontStyle,
                        fontFamily: fontFamily,
                        color: color,
                    }} className="c-text-sm c-font-normal c-text-gray-900 c-mt-1 c-text-center c-text-14px  c-w-full">{unit}</p>
                </div>
            ))}
        </div>
        </>
    );
};

export default DefaultCountdown;
