import {
  parsedTimeToMilitaryTime,
  transformToTime,
} from "components/WeeklySchedule";
import { addMinutes, format, roundToNearestMinutes } from "date-fns";
import { useFormContext } from "react-hook-form";
import { FormInputGroup, InputProps } from "./Input";
import { useEffect } from "react";

interface Props extends InputProps {
  name: string;
}

export const FormTimeInputGroup: React.FC<Props> = (props) => {
  const { setValue, register } = useFormContext(); // retrieve all hook methods

  const increaseTime = (time: string): string => {
    const milTime = parsedTimeToMilitaryTime(time);
    return format(
      roundToNearestMinutes(addMinutes(new Date("1970-01-01T" + milTime), 5), {
        nearestTo: 5,
      }),
      "p"
    );
  };

  const decreaseTime = (time: string): string => {
    const milTime = parsedTimeToMilitaryTime(time);
    return format(
      roundToNearestMinutes(addMinutes(new Date("1970-01-02T" + milTime), -5), {
        nearestTo: 5,
      }),
      "p"
    );
  };

  useEffect(() => {
    register(props.name, {
      onBlur: (e) =>
        e.target.value &&
        setValue(props.name, transformToTime(e.target.value), {
          shouldValidate: true,
        }),
    });
  });

  return (
    <FormInputGroup
      type="text"
      placeholder="e.g. 8:25"
      autoComplete="off"
      onKeyDown={(e) => {
        if (e.code === "ArrowUp") {
          setValue(props.name, increaseTime(e.currentTarget.value), {
            shouldValidate: true,
          });
        }
        if (e.code === "ArrowDown") {
          setValue(props.name, decreaseTime(e.currentTarget.value), {
            shouldValidate: true,
          });
        }
      }}
      {...props}
    />
  );
};
