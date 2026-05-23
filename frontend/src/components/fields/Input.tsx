import React, { FocusEvent, ReactNode } from "react";
import cn from "classnames";

import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  useFormContext,
} from "react-hook-form";
import { FormError } from "./FieldError";
import { FieldDescription } from "./FieldDescription";
import { ExclamationCircleIcon } from "@heroicons/react/solid";

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
  ref?:
    | React.RefCallback<HTMLInputElement>
    | React.MutableRefObject<HTMLInputElement>;
  children?: React.ReactNode;
  small?: boolean;
  inputClassName?: string;
}

/**
 * An augmented HTML `<input>` tag that handles error styling.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const { className, error, children, small, inputClassName, ...inputProps } =
      props;
    const isDisabled = !!inputProps.disabled;

    const containerClass = cn(
      "shadow-sm rounded-md",
      {
        "border-r-0 flex flex-row": !!children,
      },
      className
    );

    const renderErrorIcon = () => (
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      </div>
    );

    const inputClass = cn(
      "flex-1 block w-full min-w-0 focus:ring-opacity-25 focus:ring transition duration-150 ease-in-out text-sm",
      {
        "pr-10 border-red-300 text-red-900 placeholder-red-300 focus:border-red-300 focus:ring-red-500":
          error,
        "text-gray-800 border-gray-300 focus:ring-brand-400 focus:border-brand-500":
          !error && !isDisabled,
        "bg-gray-100 text-gray-500 cursor-not-allowed": isDisabled,
        "rounded-none rounded-l-md": !!children,
        rounded: !children,
        "py-1 text-sm": small,
        "bg-gray-50": inputProps.readOnly,
      },
      inputClassName
    );

    return (
      <div className={containerClass}>
        <div className="relative flex-grow focus-within:z-10">
          <input
            {...inputProps}
            type={inputProps.type || "text"}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            className={inputClass}
          />
          {error ? renderErrorIcon() : null}
        </div>
        {children}
      </div>
    );
  }
);

export interface FormInputProps extends InputProps {
  name: string;
}

/**
 * A field that automatically connects to the current react hook
 * form. It displays the only the field and auto switch to an error
 * style in case of form error.
 */
export const FormInput: React.FC<FormInputProps> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods
  return (
    <Input error={errors[props.name]} {...props} {...register(props.name)} />
  );
};

export interface FormInputGroupProps extends InputProps {
  name: string;
  description?: string | ReactNode;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

/**
 * A field group that automatically connects to the current react hook
 * form context. It displays the field and its optional description below.
 * The field auto detects error on the field and display the proper field style
 * and replace the description with the error message.
 * @param props
 */
export const FormInputGroup: React.FC<FormInputGroupProps> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods
  const { description, onBlur, ...otherProps } = props;
  const error = errors[props.name];

  const renderDescription = () => (
    <FieldDescription className="mt-1">{description}</FieldDescription>
  );

  const renderError = () => <FormError className="mt-1" name={props.name} />;

  return (
    <>
      <Input
        error={errors[props.name]}
        {...otherProps}
        {...register(props.name, { onBlur })}
      />
      {error ? renderError() : description ? renderDescription() : null}
    </>
  );
};
