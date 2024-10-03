import React, { useState, useEffect } from "react";
import "./countdown.css";

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

interface CountdownProps {
  targetDate: string;
  name: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, name }) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]); // Update when timeLeft changes

  const formatTime = (time: number | undefined): string => {
    return time !== undefined && time < 10 ? `0${time}` : `${time}`;
  };

  return (
    <div className="countdown-container">
      <h2>{name} will end on</h2>
      <div className="countdown">
        {timeLeft.days !== undefined && (
          <span>{formatTime(timeLeft.days)}:</span>
        )}
        {timeLeft.hours !== undefined && (
          <span>{formatTime(timeLeft.hours)}:</span>
        )}
        {timeLeft.minutes !== undefined && (
          <span>{formatTime(timeLeft.minutes)}:</span>
        )}
        {timeLeft.seconds !== undefined ? (
          <span>{formatTime(timeLeft.seconds)}</span>
        ) : (
          <span>00</span>
        )}
      </div>
    </div>
  );
};

export default Countdown;
