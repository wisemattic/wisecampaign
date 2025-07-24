import React from 'react';

interface CircleCountdownProps {
  text: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  fontFamily: string;
  color: string;
  timerEndDate: number;
}

const CircleCountdown: React.FC<CircleCountdownProps> = ({
  text,
  fontSize,
  fontWeight,
  fontStyle,
  fontFamily,
  color,
  timerEndDate,
}) => {
  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = timerEndDate - new Date().getTime();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEndDate]);

  return (
    <div className="flex flex-col items-center" style={{ color, fontFamily, fontSize, fontWeight, fontStyle }}>
      <span className="mb-2">{text}</span>
      <div className="flex gap-4">
        {Object.entries(timeLeft).map(([key, value]) => {
          // Parse font size from clamp value or direct pixel value
          const fontSizeMatch = fontSize.match(/\d+/g);
          const baseFontSize = fontSizeMatch ? Math.max(...fontSizeMatch.map(Number)) : 16;
          const circleSize = Math.max(baseFontSize * 2.5, 40);
          const radius = circleSize * 0.4;
          const center = circleSize / 2;
          const circumference = 2 * Math.PI * radius;

          return (
            <div key={key} className="flex flex-col items-center">
              <div className="relative" style={{ width: circleSize, height: circleSize }}>
                <svg width={circleSize} height={circleSize} className="transform scale-90">
                  <circle
                    className="text-gray-200"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={center}
                    cy={center}
                  />
                  <circle
                    className="text-blue-500"
                    strokeWidth="2"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (value / (key === 'days' ? 30 : key === 'hours' ? 24 : 60)) * circumference}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={center}
                    cy={center}
                  />
                </svg>
                <span 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ fontSize: `${baseFontSize * 0.8}px` }}
                >
                  {value.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="mt-1 capitalize" style={{ fontSize: `${baseFontSize * 0.6}px` }}>
                {key}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CircleCountdown;