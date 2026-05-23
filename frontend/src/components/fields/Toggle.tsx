import React from "react";
import cn from "classnames";
import { useFormContext } from "react-hook-form";
import { FieldDescription } from "./FieldDescription";
import { FormError } from "./FieldError";

interface Props extends React.HTMLProps<HTMLInputElement> {
  error?: any;
  id?: string;
  ref?: React.MutableRefObject<HTMLInputElement>;
}

export const Toggle = React.forwardRef<HTMLInputElement, Props>(
  (props, ref) => {
    const { className, error, ...otherProps } = props;

    const containerClass = cn(
      "toggle-container relative inline-flex shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring",
      {
        "toggle-error": error,
      }
    );

    const toggleClassName = cn(
      "toggle-ball inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200"
    );

    return (
      <div className={className}>
        <input
          {...otherProps}
          ref={ref}
          type="checkbox"
          className="toggle-input hidden"
        />
        <label
          htmlFor={props.id}
          role="checkbox"
          aria-checked="false"
          className={containerClass}
        >
          <span aria-hidden="true" className={toggleClassName} />
        </label>
      </div>
    );
  }
);

export interface FormToggleProps extends Props {
  name: string;
}

/**
 * A field that automatically connects to the current react hook
 * form. It displays the only the field and auto switch to an error
 * style in case of form error.
 */
export const FormToggle: React.FC<FormToggleProps> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods

  return (
    <Toggle error={errors[props.name]} {...props} {...register(props.name)} />
  );
};

export interface FormToggleGroupProps extends Props {
  name: string;
  label: string;
  description?: string;
  leftToggle?: boolean;
}

/**
 * A field group that automatically connects to the current react hook
 * form context. It displays the field and its optional description below.
 * The field auto detects error on the field and display the proper field style
 * and replace the description with the error message.
 * @param props
 */
export const FormToggleGroup: React.FC<FormToggleGroupProps> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods
  const { description, className, label, ...otherProps } = props;
  const error = errors[props.name];

  const containerClass = cn("flex items-center flex-row", className, {
    "space-x-3": !className?.includes("flex-row-reverse"),
  });

  const renderDescription = () => (
    <FieldDescription>{description}</FieldDescription>
  );

  const renderError = () => <FormError className="mt-1" name={props.name} />;

  return (
    <label className={containerClass}>
      <Toggle error={error} {...otherProps} {...register(props.name)} />
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {error ? renderError() : description ? renderDescription() : null}
      </div>
    </label>
  );
};
