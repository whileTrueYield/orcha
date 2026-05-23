import React from "react";
import cn from "classnames";
import { useFormContext } from "react-hook-form";
import { FieldDescription } from "./FieldDescription";
import { FormError } from "./FieldError";

export interface CheckboxProps extends React.HTMLProps<HTMLInputElement> {
  error?: any;
  ref?: React.MutableRefObject<HTMLInputElement>;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (props, ref) => {
    const { className, error, ...otherProps } = props;

    const containerClass = cn("flex items-center h-5", className);

    const inputClass = cn(
      "focus:ring-opacity-50 focus:ring h-4 w-4 transition duration-150 ease-in-out rounded",
      {
        "text-brand-600 focus:ring-brand-400 focus:border-brand-500": !error,
        "text-red-500 focus:border-red-300 border-red-300 focus:ring-red":
          error,
      }
    );

    return (
      <div className={containerClass}>
        <input
          {...otherProps}
          ref={ref}
          type="checkbox"
          className={inputClass}
        />
      </div>
    );
  }
);

export interface FormCheckboxProps extends CheckboxProps {
  name: string;
}

/**
 * A field that automatically connects to the current react hook
 * form. It displays the only the field and auto switch to an error
 * style in case of form error.
 */
export const FormCheckbox: React.FC<FormCheckboxProps> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods

  return (
    <Checkbox error={errors[props.name]} {...register(props.name)} {...props} />
  );
};

export interface FormCheckboxGroupProps extends CheckboxProps {
  name: string;
  label?: string;
  description?: string;
}

/**
 * A field group that automatically connects to the current react hook
 * form context. It displays the field and its optional description below.
 * The field auto detects error on the field and display the proper field style
 * and replace the description with the error message.
 * @param props
 */
export const FormCheckboxGroup: React.FC<FormCheckboxGroupProps> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods
  const { description, className, label, ...otherProps } = props;
  const error = errors[props.name];

  const containerClass = cn("flex items-start", className);

  const renderDescription = () => (
    <FieldDescription className="mt-1">{description}</FieldDescription>
  );

  const renderError = () => <FormError className="mt-1" name={props.name} />;

  return (
    <div className={containerClass}>
      <div className="flex h-5 items-center">
        <Checkbox error={error} {...register(props.name)} {...otherProps} />
      </div>
      {label ? (
        <div className="ml-3 text-sm leading-5">
          <label
            htmlFor={props.id}
            className="inline-block text-sm font-medium leading-5 text-gray-700"
          >
            {label}
          </label>
          {error ? renderError() : description ? renderDescription() : null}
        </div>
      ) : null}
    </div>
  );
};

interface CheckboxGroupProps extends CheckboxProps {
  label: string;
  description?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = (props) => {
  const { description, className, label, ...otherProps } = props;

  const containerClass = cn("flex items-start", className);

  const renderDescription = () => (
    <FieldDescription className="mt-1">{description}</FieldDescription>
  );

  return (
    <div className={containerClass}>
      <div className="flex h-5 items-center">
        <Checkbox {...otherProps} />
      </div>
      <div className="ml-3 text-sm leading-5">
        <label
          htmlFor={props.id}
          className="block text-sm font-medium leading-5 text-gray-700"
        >
          {label}
        </label>
        {description ? renderDescription() : null}
      </div>
    </div>
  );
};
