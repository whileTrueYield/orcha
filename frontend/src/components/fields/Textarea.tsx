import React from "react";
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

export interface TextareaProps extends React.HTMLProps<HTMLTextAreaElement> {
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
  ref?: React.MutableRefObject<HTMLTextAreaElement>;
}
/**
 * An augmented HTML `<textarea>` tag that handles error styling.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    const { className, error, ...textareaProps } = props;

    const containerClass = cn("relative rounded-md shadow-sm block", className);

    const renderErrorIcon = () => (
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      </div>
    );

    const inputClass = cn(
      "flex-1 block w-full min-w-0 rounded focus:ring-opacity-25 focus:ring transition duration-150 ease-in-out sm:text-sm sm:leading-5",
      {
        "border-red-300 focus:border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:outline-none pr-10":
          error,
        "border-gray-300 focus:border-brand-500 focus:ring-brand-400 focus:text-gray-800":
          !error,
      }
    );

    return (
      <div className={containerClass}>
        <textarea
          rows={3}
          {...textareaProps}
          ref={ref}
          aria-invalid={error ? "true" : "false"}
          className={inputClass}
        />
        {error ? renderErrorIcon() : null}
      </div>
    );
  }
);

export interface FormTextareaProps extends TextareaProps {
  name: string;
}

/**
 * A field that automatically connects to the current react hook
 * form. It displays the only the field and auto switch to an error
 * style in case of form error.
 */
export const FormTextarea: React.FC<FormTextareaProps> = (props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods

  return (
    <Textarea error={errors[props.name]} {...props} {...register(props.name)} />
  );
};

export interface FormTextareaGroupProps extends TextareaProps {
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
export const FormTextareaGroup: React.FC<FormTextareaGroupProps> = (props) => {
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
      <Textarea
        error={errors[props.name]}
        {...otherProps}
        {...register(props.name)}
      />
      {error ? renderError() : description ? renderDescription() : null}
    </>
  );
};
