import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';

interface CountdownTimerProps {
  startTime: string;
  title: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  startTime,
  title,
  className = ""
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const difference = start - now;

      if (difference <= 0) {
        setIsLive(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (isLive) {
    return (
      <Card className={`border-destructive ${className}`}>
        <CardContent className="p-6 text-center">
          <Badge variant="destructive" className="mb-4 animate-pulse text-lg px-4 py-2">
            🔴 LIVE NOW
          </Badge>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">This class is currently live!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-primary">
            Starting Soon
          </Badge>
        </div>
        
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {formatNumber(timeLeft.days)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Days
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {formatNumber(timeLeft.hours)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Hours
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {formatNumber(timeLeft.minutes)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Minutes
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {formatNumber(timeLeft.seconds)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Seconds
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Starts at {new Date(startTime).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownTimer;