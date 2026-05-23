import { useFormContext } from "react-hook-form";
import React from "react";

export type FormContextType = ReturnType<typeof useFormContext>;

interface Props {
  children: ({
    formContext,
  }: {
    formContext: FormContextType;
  }) => React.ReactElement;
}

export const ConnectForm: React.FC<Props> = ({ children }) => {
  const formContext = useFormContext();

  return children({ formContext });
};
