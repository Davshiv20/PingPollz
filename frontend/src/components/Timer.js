import React, { useState, useEffect } from 'react';

const Timer = ({ timeRemaining }) => {
  const [displayTime, setDisplayTime] = useState(timeRemaining);

  useEffect(() => {
    setDisplayTime(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (displayTime > 0) {
      const interval = setInterval(() => {
        setDisplayTime(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [displayTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (displayTime <= 10) return 'timer warning';
    if (displayTime <= 30) return 'timer';
    return 'timer';
  };

  return (
    <div className={getTimerClass()}>
      ⏱️ {formatTime(displayTime)}
    </div>
  );
};

export default Timer; 