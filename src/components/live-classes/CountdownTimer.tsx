import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const { days, hours, minutes, seconds } = timeLeft;

  if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
    return (
      <div className="text-center">
        <span className="text-green-400 font-bold">🔴 LIVE NOW</span>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex justify-center space-x-4 text-sm">
        {days > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold">{days}</div>
            <div className="text-xs opacity-80">Days</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-2xl font-bold">{hours.toString().padStart(2, '0')}</div>
          <div className="text-xs opacity-80">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{minutes.toString().padStart(2, '0')}</div>
          <div className="text-xs opacity-80">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{seconds.toString().padStart(2, '0')}</div>
          <div className="text-xs opacity-80">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;