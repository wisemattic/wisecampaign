import { useState, useEffect } from 'react';

const GradientBGCountdown = ({ text, fontSize, fontWeight, fontStyle, fontFamily, color, timerEndDate }) => {
    const [time, setTime] = useState({
        Days: 0,
        Hours: 0,
        Min: 0,
        Sec: 0,
    });

    useEffect(() => {
        const targetDate = new Date(timerEndDate).getTime();

        const countdown = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            const Days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const Hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const Min = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const Sec = Math.floor((distance % (1000 * 60)) / 1000);

            setTime({ Days, Hours, Min, Sec });

            if (distance < 0) {
                clearInterval(countdown);
                setTime({ Days: 0, Hours: 0, Min: 0, Sec: 0 });
            }
        }, 1000);

        return () => clearInterval(countdown);
    }, [timerEndDate]);

    const countDownStyle = {
        fontSize,
        fontWeight,
        fontStyle,
        fontFamily,
        color: 'white',
    };

    const labelStyle = {
        fontSize: '0.875rem',
        fontFamily,
        color: 'white',
    };

    return (
        <div className="flex items-center justify-center">
            {['Days', 'Hours', 'Min', 'Sec'].map((unit, index) => (
                <div key={unit} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className="rounded-xl bg-gradient-to-b from-indigo-600 to-purple-600 p-3 min-w-[80px] aspect-square flex items-center justify-center flex-col">
                            <span style={countDownStyle} className="text-2xl font-bold">
                                {String(time[unit]).padStart(2, '0')}
                            </span>
                            <span style={labelStyle} className="mt-1 font-medium">
                                {unit}
                            </span>
                        </div>
                    </div>
                    {index < 3 && (
                        <div className="flex items-center h-[80px] mx-2">
                            <span style={{ ...countDownStyle, color }} className="text-2xl font-bold">:</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default GradientBGCountdown;
