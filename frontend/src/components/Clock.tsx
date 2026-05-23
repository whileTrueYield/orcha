import { useEffect, useState } from "react";

interface Props {
  className?: string;
  interval?: number;
  getValue: () => string;
}

/**
 * Element that auto refresh at a given interval value. Useful
 * to display a time based information (done X minutes ago or
 * the current time)
 *
 * interval value defaults to 1 second
 */
export const Clock: React.FC<Props> = (props) => {
  const { getValue } = props;
  const [value] = useClock(getValue, props.interval);
  return <span className={props.className}>{value}</span>;
};

/**
 * Hook that triggers at a given interval and set the value using
 * the provided callback
 *
 * ```ts
 * const getTime = useCallback(() => new Date());
 * const [currentTime] = useClock(getTime, 1000);
 * ```
 */
export const useClock = (
  getValue: () => string,
  interval: number = 1000
): [string, (value: string) => void] => {
  const [value, setValue] = useState<string>(getValue());

  useEffect(() => {
    const _interval = setInterval(() => setValue(getValue()), interval);
    return () => {
      clearInterval(_interval);
    };
  }, [getValue, interval]);

  return [value, setValue];
};
