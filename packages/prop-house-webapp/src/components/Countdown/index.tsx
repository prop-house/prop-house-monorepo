import { useState, useEffect } from 'react';

const Countdown: React.FC<{ date: Date }> = props => {
  const { date } = props;
  const [countdown, setCountdown] = useState({
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const diff = date.getTime() - now.getTime();

      if (diff > 0) {
        const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
        const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ weeks, days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [date]);

  const { weeks, days, hours, minutes, seconds } = countdown;

  const copy = () => {
    return weeks > 0
      ? `${weeks} weeks`
      : `${days > 0 ? `${days}d` : ''} ${hours > 0 ? `${hours}h` : ''} ${
          minutes > 0 ? `${minutes}m` : ''
        } ${seconds}s`;
  };

  return (
    <>{seconds === 0 && minutes === 0 && hours === 0 ? '...' : `Round will begin in ${copy()}`}</>
  );
};
export default Countdown;
