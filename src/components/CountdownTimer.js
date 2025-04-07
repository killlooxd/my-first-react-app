import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment-timezone';

function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const end = moment.utc(endTime);
      const now = moment.utc();
      const duration = moment.duration(end.diff(now));

      const days = duration.days();
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      setTimeLeft(
        `${days > 0 ? `${days}д ` : ''}${hours}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );

      if (duration.asMilliseconds() <= 0) {
        clearInterval(interval);
        setTimeLeft('Аукцион завершен');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return <span>{timeLeft}</span>;
}

// Убедись, что экспорт по умолчанию используется правильно
export default CountdownTimer;
