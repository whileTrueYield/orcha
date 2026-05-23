import { useEffect, useMemo, useState } from "react";

interface Props {
  className?: string;
  duration: number; // in ms
  onTimeout: () => void;
}

/**
 * Displays a countdown and trigger the onTimeout callback
 * when it reaches 0. This is used for default action on buttons
 * (dismiss [5,4,3,2...])
 */
export const Countdown: React.FC<Props> = (props) => {
  const { duration, onTimeout } = props;
  const [value, setValue] = useState(Math.ceil(props.duration / 1000));
  const startTime = useMemo(() => new Date(), []);

  useEffect(() => {
    const updateValue = () => {
      const delta = new Date().getTime() - startTime.getTime();
      if (delta > duration) {
        onTimeout();
        clearInterval(interval);
      }
      setValue(Math.ceil((duration - delta) / 1000));
    };

    const interval = setInterval(updateValue, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [setValue, startTime, onTimeout, duration]);

  return <span className={props.className}>{value}</span>;
};
