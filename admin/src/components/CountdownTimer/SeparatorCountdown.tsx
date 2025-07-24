import { useState, useEffect } from 'react';

// @ts-ignore
const SeparatorCountdown = ({ text, fontSize, fontWeight, fontStyle, fontFamily, color, timerEndDate }) => {
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
            const Hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const Min = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const Sec = Math.floor((distance % (1000 * 60)) / 1000);

            setTime({
                Days,
                Hours,
                Min,
                Sec,
            });

            if (distance < 0) {
                clearInterval(countdown);
                setTime({
                    Days: 0,
                    Hours: 0,
                    Min: 0,
                    Sec: 0,
                });
            }
        }, 1000);

        return () => clearInterval(countdown);
    }, []);

    const countDownStyle = {
        fontSize,
        fontWeight,
        fontStyle,
        fontFamily,
        color,
    };

    return (
        <div className="flex items-center justify-center">
            {['Days', 'Hours', 'Min', 'Sec'].map((unit, index) => (
                <div key={unit} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-100 rounded-lg px-2 py-2 min-w-[40px] text-center">
                            <span style={countDownStyle} className="block font-semibold">
                                {String(time[unit]).padStart(2, '0')}
                            </span>
                        </div>
                        <span style={{...countDownStyle, fontSize: '0.65rem'}} className="mt-1 opacity-75">
                            {unit}
                        </span>
                    </div>
                    {index < 3 && (
                        <div className="flex items-center h-[40px] mx-1">
                            <span style={countDownStyle} className="text-2xl font-bold">:</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SeparatorCountdown;
