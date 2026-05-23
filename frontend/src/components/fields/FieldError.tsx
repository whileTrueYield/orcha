import React from "react";
import cn from "classnames";
import { useFormContext } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

export interface FieldErrorProps extends React.HTMLProps<HTMLParagraphElement> {
  message: any;
}

export const FieldError: React.FC<FieldErrorProps> = (props) => {
  const { className, message, ...otherProps } = props;
  const containerClass = cn("text-sm text-red-600", className);

  return (
    <p role="alert" className={containerClass} {...otherProps}>
      {message}
    </p>
  );
};

export interface FormErrorProps extends React.HTMLProps<HTMLParagraphElement> {
  name: string;
}

export const FormError: React.FC<FormErrorProps> = (props) => {
  const {
    formState: { errors },
  } = useFormContext(); // retrieve all hook methods
  const { name, ...otherProps } = props;

  return (
    <ErrorMessage
      errors={errors}
      name={name}
      render={({ message }) => <FieldError message={message} {...otherProps} />}
    />
  );
};
