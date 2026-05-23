import React, { useEffect, useState } from "react";

interface TaskTimerProps extends React.HTMLProps<HTMLSpanElement> {
  date: string;
  showSeconds?: boolean;
}

const getTimeDelta = (startDate: Date, showSeconds?: boolean): string => {
  const diff = new Date().getTime() - startDate.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff - hours * 3600000) / 60000);
  const seconds = Math.floor(
    (diff - (hours * 3600000 + minutes * 60000)) / 1000
  );

  const formatedHours = hours > 0 ? `${hours}h` : "";
  const formatedMinutes = minutes > 9 ? `${minutes}m` : `0${minutes}m`;
  const formatedSeconds = showSeconds
    ? `${seconds > 9 ? seconds : "0" + seconds}`
    : "";

  return `${formatedHours} ${formatedMinutes} ${formatedSeconds}`;
};

export const TaskTimer: React.FC<TaskTimerProps> = (props) => {
  const { date: dateStr, showSeconds, ...otherProps } = props;
  const [time, setTime] = useState(
    getTimeDelta(new Date(dateStr), showSeconds)
  );

  useEffect(() => {
    const date = new Date(dateStr);

    const generateTime = () => {
      const newTime = getTimeDelta(date, showSeconds);

      if (newTime !== time) {
        setTime(newTime);
      }
    };

    const interval = setInterval(generateTime, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [time, setTime, dateStr, showSeconds]);

  return <span {...otherProps}>{time}</span>;
};
