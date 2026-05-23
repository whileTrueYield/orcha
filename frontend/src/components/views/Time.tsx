import React from "react";
import { format, subDays } from "date-fns";

interface TimeProps {
  date: string;
  format: string;
  className?: string;
}

export const Time: React.FC<TimeProps> = (props) => {
  const date = new Date(props.date);

  return (
    <time
      className={props.className}
      title={date.toLocaleString()}
      defaultValue={date.toISOString()}
    >
      {format(date, props.format)}
    </time>
  );
};

interface SmartTimeProps {
  date: string;
  className?: string;
  short?: boolean;
}

export const SmartTime: React.FC<SmartTimeProps> = (props) => {
  const { className } = props;
  if (!props.date) {
    return null;
  }
  const date = new Date(props.date);

  const today = new Date();

  if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
    return (
      <time
        className={className}
        title={date.toLocaleString()}
        defaultValue={date.toISOString()}
        dateTime={date.toISOString()}
      >
        today, {format(date, "h:mm bbbb")}
      </time>
    );
  }

  const yesterday = subDays(today, 1);
  if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
    return (
      <time
        className={className}
        title={date.toLocaleString()}
        defaultValue={date.toISOString()}
        dateTime={date.toISOString()}
      >
        yesterday, {format(date, "h:mm bbbb")}
      </time>
    );
  }

  // is the same year?
  if (format(date, "yyyy") === format(today, "yyyy")) {
    return (
      <time
        className={className}
        title={date.toLocaleString()}
        defaultValue={date.toISOString()}
        dateTime={date.toISOString()}
      >
        {format(date, "EEE, MMM do")}
      </time>
    );
  }

  return (
    <time
      className={className}
      title={date.toLocaleString()}
      defaultValue={date.toISOString()}
      dateTime={date.toISOString()}
    >
      {format(date, "EEE, MMM do, yyyy")}
    </time>
  );
};
