import { Input, InputProps } from "components/fields/Input";
import { floor } from "lodash";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { timeFormater, timeParser } from "./timeParser";

interface Props extends InputProps {
  name: string;
}

export const TimeField: React.FC<Props> = (props) => {
  const { name, ...otherProps } = props;
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    getValues,
  } = useFormContext();
  const value = watch(name);
  const [localValue, setLocalValue] = useState(
    timeFormater(value || getValues(name))
  );

  useEffect(() => {
    register(name);
  }, [register, name]);

  useEffect(() => {
    setLocalValue(timeFormater(value));
  }, [value]);

  const setFormattedValue = (newValue: string) => {
    const parsedValue = timeParser(newValue);
    if (value !== parsedValue) {
      setValue(name, parsedValue);
      setLocalValue(timeFormater(parsedValue));
    }
  };

  const increaseValue = (value: string) => {
    const current = timeParser(value);

    // by default we increment by 5 minutes
    let increment = 5 * 60;
    if (current >= 3600 * 8) {
      // over 8h, we increment by 1 hour
      increment = 3600;
    } else if (current >= 3600 * 4) {
      // over 4h, we increment by 30 minutes
      increment = 30 * 60;
    } else if (current >= 3600) {
      // over an hour, we increment by 15 minutes
      increment = 15 * 60;
    }

    const seconds = floor(current / increment) * increment + increment;

    setValue(name, seconds);
    setLocalValue(timeFormater(seconds));
  };

  const decreaseValue = (value: string) => {
    const current = timeParser(value);

    // by default we increment by 5 minutes
    let increment = 5 * 60;
    if (current > 3600 * 8) {
      // over 8h, we increment by 1 hour
      increment = 3600;
    } else if (current > 3600 * 4) {
      // over 4h, we increment by 30 minutes
      increment = 30 * 60;
    } else if (current > 3600) {
      // over an hour, we increment by 15 minutes
      increment = 15 * 60;
    }

    const seconds = floor(current / increment) * increment - increment;
    setValue(name, seconds <= 0 ? 0 : seconds);
    setLocalValue(timeFormater(seconds <= 0 ? 0 : seconds));
  };

  // on keyup is to ensure that hitting Enter will first
  // convert the value prior to submitting the form
  return (
    <Input
      onBlur={(e) => setFormattedValue(e.currentTarget.value)}
      value={localValue}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          setFormattedValue(e.currentTarget.value);
        }
        if (e.key === "ArrowUp") {
          increaseValue(e.currentTarget.value);
        }
        if (e.key === "ArrowDown") {
          decreaseValue(e.currentTarget.value);
        }
      }}
      onChange={(e) => setLocalValue(e.currentTarget.value)}
      error={errors[name]}
      {...otherProps}
    />
  );
};
