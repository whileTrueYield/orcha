import React, { useContext } from "react";
import cn from "classnames";
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { FieldDescription } from "./FieldDescription";
import { FormError } from "./FieldError";

export interface RadioProps extends React.HTMLProps<HTMLInputElement> {
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
  ref?: React.MutableRefObject<HTMLInputElement>;
  name: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (props, ref) => {
    const { className, error, ...otherProps } = props;

    const containerClass = cn(
      "focus:ring-opacity-25 focus:ring h-4 w-4 transition duration-150 ease-in-out",
      {
        "text-brand-600 focus:border-red-300 focus:ring-red": !error,
        "text-red-400 focus:ring-brand-400 focus:border-brand-500": error,
      }
    );

    return (
      <input
        {...otherProps}
        type="radio"
        ref={ref}
        className={containerClass}
      />
    );
  }
);

export interface FormRadioProps extends RadioProps {
  name: string;
}

/**
 * A field that automatically connects to the current react hook
 * form. It displays the only the field and auto switch to an error
 * style in case of form error.
 */
export const FormRadio: React.FC<FormRadioProps> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods

  return (
    <Radio error={errors[props.name]} {...props} {...register(props.name)} />
  );
};

export interface FormRadioGroupOptionProps extends RadioProps {
  label: string;
  description?: string;
  value: any;
}

/**
 * A field group that automatically connects to the current react hook
 * form context. It displays the field and its optional description below.
 * The field auto detects error on the field and display the proper field style
 * and replace the description with the error message.
 * @param props
 */
export const FormRadioGroupOption: React.FC<FormRadioGroupOptionProps> = (
  props
) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods
  const { description, className, label, ...otherProps } = props;
  const name = useContext(FormRadioGroupNameContext);
  const error = errors[name];
  const containerClass = cn("flex items-start mt-4", className);

  const renderDescription = () => (
    <FieldDescription className="mt-1">{description}</FieldDescription>
  );

  return (
    <label className={containerClass}>
      <div className="flex h-5 items-center">
        <Radio error={error} {...otherProps} {...register(props.name)} />
      </div>
      <div className="ml-3 text-sm leading-5">
        <div className="block text-sm font-medium leading-5 text-gray-700">
          {label}
        </div>
        {description ? renderDescription() : null}
      </div>
    </label>
  );
};

export interface FormRadioGroupProps extends RadioProps {
  name: string;
  legend?: string;
  description?: string;
}

export const FormRadioGroupNameContext = React.createContext("");

export const FormRadioGroup: React.FC<FormRadioGroupProps> = (props) => {
  const { name, legend, description } = props;
  const { errors } = useFormState();

  const renderDescription = () => (
    <FieldDescription className="mt-1">{description}</FieldDescription>
  );

  const renderLegend = () => (
    <legend className="text-base font-medium leading-6 text-gray-900">
      {legend}
    </legend>
  );

  const renderError = () => <FormError className="mt-1" name={name} />;
  const error = errors[name];

  return (
    <FormRadioGroupNameContext.Provider value={name}>
      {legend ? renderLegend() : null}
      {description ? renderDescription() : null}
      {props.children}
      {error ? renderError() : description ? renderDescription() : null}
    </FormRadioGroupNameContext.Provider>
  );
};
