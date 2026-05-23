import { Input, InputProps } from "components/fields/Input";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { timeFormater, timeParser } from "./timeParser";

interface Props extends InputProps {
  name: string;
}

export const DateTimeField: React.FC<Props> = (props) => {
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

  const setFormattedValue = (value: string) => {
    setValue(name, timeParser(value));
    setLocalValue(timeFormater(timeParser(value)));
  };

  // on keyup is to ensure that hitting Enter will first
  // convert the value prior to submitting the form
  return (
    <Input
      onBlur={(e) => setFormattedValue(e.currentTarget.value)}
      value={localValue}
      onKeyDown={(e) =>
        e.key === "Enter" ? setFormattedValue(e.currentTarget.value) : null
      }
      onChange={(e) => setLocalValue(e.currentTarget.value)}
      error={errors[name]}
      {...otherProps}
    />
  );
};
