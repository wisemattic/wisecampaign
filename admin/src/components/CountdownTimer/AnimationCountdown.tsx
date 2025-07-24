import { useState, useEffect } from 'react';

const AnimationCountdown = () => {
    const [time, setTime] = useState({
        days: 0,
        hours: 0,
        min: 0,
        sec: 0,
    });

    useEffect(() => {
        const countdownDate = new Date("Jan 1, 2025 00:00:00").getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const min = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const sec = Math.floor((distance % (1000 * 60)) / 1000);

            setTime({
                days,
                hours,
                min,
                sec,
            });

            // If countdown is finished, stop the interval
            if (distance < 0) {
                clearInterval(interval);
                setTime({
                    days: 0,
                    hours: 0,
                    min: 0,
                    sec: 0,
                });
            }
        }, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <div className="flex items-start justify-center w-full gap-4 count-down-main">
            <div className="timer w-16">
                <div className="bg-indigo-600 py-4 px-2 rounded-lg overflow-hidden">
                    <h3 className="countdown-element days font-Cormorant font-semibold text-2xl text-white text-center">
                        {time.days}
                    </h3>
                </div>
                <p className="text-lg font-Cormorant font-medium text-gray-900 mt-1 text-center w-full">
                    days
                </p>
            </div>

            <h3 className="font-manrope font-semibold text-2xl text-gray-900">:</h3>

            <div className="timer w-16">
                <div className="bg-indigo-600 py-4 px-2 rounded-lg overflow-hidden">
                    <h3 className="countdown-element hours font-Cormorant font-semibold text-2xl text-white text-center">
                        {time.hours}
                    </h3>
                </div>
                <p className="text-lg font-Cormorant font-normal text-gray-900 mt-1 text-center w-full">
                    hours
                </p>
            </div>

            <h3 className="font-manrope font-semibold text-2xl text-gray-900">:</h3>

            <div className="timer w-16">
                <div className="bg-indigo-600 py-4 px-2 rounded-lg overflow-hidden">
                    <h3 className="countdown-element minutes font-Cormorant font-semibold text-2xl text-white text-center">
                        {time.min}
                    </h3>
                </div>
                <p className="text-lg font-Cormorant font-normal text-gray-900 mt-1 text-center w-full">
                    min
                </p>
            </div>

            <h3 className="font-manrope font-semibold text-2xl text-gray-900">:</h3>

            <div className="timer w-16">
                <div className="bg-indigo-600 py-4 px-2 rounded-lg overflow-hidden">
                    <h3 className="countdown-element seconds font-Cormorant font-semibold text-2xl text-white text-center animate-countinsecond">
                        {time.sec}
                    </h3>
                </div>
                <p className="text-lg font-Cormorant font-normal text-gray-900 mt-1 text-center w-full">
                    sec
                </p>
            </div>
        </div>
    );
};

export default AnimationCountdown;
