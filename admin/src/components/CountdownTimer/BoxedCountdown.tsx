import React from 'react';

interface BoxedCountdownProps {
  text: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  fontFamily: string;
  color: string;
  timerEndDate: number;
}

const BoxedCountdown: React.FC<BoxedCountdownProps> = ({
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
          const fontSizeMatch = fontSize.match(/\d+/g);
          const baseFontSize = fontSizeMatch ? Math.max(...fontSizeMatch.map(Number)) : 16;
          const boxSize = Math.max(baseFontSize * 1.8, 35);
          
          return (
            <div key={key} className="flex flex-col items-center">
              <div 
                className="bg-gray-100 rounded-md flex items-center justify-center"
                style={{ 
                  width: boxSize,
                  height: boxSize,
                  padding: `${baseFontSize * 0.15}px`,
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span 
                  style={{ 
                    fontSize: `${baseFontSize * 0.7}px`,
                    lineHeight: 1
                  }}
                >
                  {value.toString().padStart(2, '0')}
                </span>
              </div>
              <span 
                className="mt-1 capitalize" 
                style={{ 
                  fontSize: `${baseFontSize * 0.5}px`,
                  lineHeight: 1.2
                }}
              >
                {key}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoxedCountdown;