import { useOutsideClick } from "hooks/useOutsideClick";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FieldDescription } from "./FieldDescription";
import { FormError } from "./FieldError";
import { Input } from "./Input";
import { parse, format, startOfDay, addDays, addMonths } from "date-fns";
import { Calendar } from "./Calendar";

interface DateInputProps {
  onChange: (value: Date | null) => void;
  onBlur: () => void;
  value: Date | null;
  readOnly?: boolean;
  withShortcuts?: boolean;
}

export const DateInput: React.FC<DateInputProps> = (props) => {
  const { onChange, onBlur, value, readOnly } = props;
  const [strDate, setStrDate] = useState(value ? format(value, "P") : "");
  const [isOpen, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, () => setOpen(false));

  const onTextInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    if (value === "") {
      return onChange(null);
    }

    const date = parse(value, "P", new Date());

    if (isNaN(date as any)) {
      setStrDate(value);
    } else {
      onChange(date);
      setStrDate(value);
    }
  };

  useEffect(() => {
    if (value) {
      setStrDate(format(value, "M/d/y"));
    } else {
      setStrDate("");
    }
  }, [value, setStrDate]);

  if (readOnly) {
    return (
      <Input
        type="text"
        value={value ? format(value, "EEE, MMM do, y") : ""}
        readOnly={readOnly}
      />
    );
  }

  console.log({ value });

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="text"
        onChange={onTextInputChange}
        onBlur={onBlur}
        value={strDate}
        onFocus={() => setOpen(true)}
        readOnly={readOnly}
      />
      {value ? (
        <div className="pointer-events-none absolute left-2 right-0 top-0 bottom-0 flex items-center">
          <div className="bg-white p-1 text-sm text-gray-700">
            {format(value, "EEE, MMM do, y")}
          </div>
        </div>
      ) : null}
      <div className={isOpen ? "absolute right-0 z-10" : "hidden"}>
        <div className="z-20 mt-1 rounded-md border bg-white p-4 shadow-md">
          {props.withShortcuts ? (
            <div className="mb-2 flex justify-between">
              <button
                type="button"
                onClick={() => onChange(startOfDay(addDays(new Date(), 7)))}
                className="rounded-md bg-gray-100 py-1 px-2 text-sm font-medium text-gray-600 hover:bg-brand-500 hover:text-white"
              >
                in a week
              </button>
              <button
                type="button"
                onClick={() => onChange(startOfDay(addDays(new Date(), 14)))}
                className="rounded-md bg-gray-100 py-1 px-2 text-sm font-medium text-gray-600 hover:bg-brand-500 hover:text-white"
              >
                in 2 weeks
              </button>
              <button
                type="button"
                onClick={() => onChange(startOfDay(addMonths(new Date(), 1)))}
                className="rounded-md bg-gray-100 py-1 px-2 text-sm font-medium text-gray-600 hover:bg-brand-500 hover:text-white"
              >
                in a month
              </button>
            </div>
          ) : null}
          <Calendar value={value} onChange={onChange} showFooterButtons />
        </div>
      </div>
    </div>
  );
};

export interface FormDateInputGroupProps {
  name: string;
  description?: string | React.ReactNode;
  readOnly?: boolean;
  withShortcuts?: boolean;
}

export const FormDateInputGroup: React.FC<FormDateInputGroupProps> = (
  props
) => {
  const {
    control,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods
  const { name, description, readOnly, withShortcuts } = props;
  const error = errors[props.name];

  const renderDescription = () => (
    <FieldDescription className="mt-1">{description}</FieldDescription>
  );

  const renderError = () => <FormError className="mt-1" name={props.name} />;

  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <DateInput
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            readOnly={readOnly}
            withShortcuts={withShortcuts}
          />
        )}
      />

      {error ? renderError() : description ? renderDescription() : null}
    </>
  );
};
