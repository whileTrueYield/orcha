import React from "react";
import cn from "classnames";
import { useFormContext } from "react-hook-form";
import { FormError } from "./FieldError";
import { FieldDescription } from "./FieldDescription";

export interface SelectProps extends React.HTMLProps<HTMLSelectElement> {
  error?: any;
  small?: boolean;
  ref?: React.MutableRefObject<HTMLSelectElement>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    const { className, error, small, ...otherProps } = props;

    const containerClass = cn(
      "focus:ring focus:ring-opacity-25 focus:outline-none block w-full flex-1 block min-w-0 pl-3 pr-10 text-base leading-6 sm:text-sm sm:leading-5 rounded-lg",
      {
        "border-gray-300 focus:ring-brand-400 focus:border-brand-500": !error,
        "border-red-300 focus:ring-red focus:border-red-300": error,
        "py-1": small,
        "py-2": !small,
      },
      className
    );

    return <select ref={ref} className={containerClass} {...otherProps} />;
  }
);

export interface FormSelectProps extends SelectProps {
  name: string;
}

/**
 * A field that automatically connects to the current react hook
 * form. It displays the only the field and auto switch to an error
 * style in case of form error.
 */
export const FormSelect: React.FC<FormSelectProps> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods

  return (
    <Select error={errors[props.name]} {...props} {...register(props.name)} />
  );
};

export interface FormSelectGroupProps extends SelectProps {
  name: string;
  description?: string;
}

/**
 * A field group that automatically connects to the current react hook
 * form context. It displays the field and its optional description below.
 * The field auto detects error on the field and display the proper field style
 * and replace the description with the error message.
 * @param props
 */
export const FormSelectGroup: React.FC<FormSelectGroupProps> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods
  const { description, ...otherProps } = props;
  const error = errors[props.name];

  const renderDescription = () => (
    <FieldDescription className="mt-1">{description}</FieldDescription>
  );

  const renderError = () => <FormError className="mt-1" name={props.name} />;

  return (
    <>
      <Select
        error={errors[props.name]}
        {...otherProps}
        {...register(props.name)}
      />
      {error ? renderError() : description ? renderDescription() : null}
    </>
  );
};
