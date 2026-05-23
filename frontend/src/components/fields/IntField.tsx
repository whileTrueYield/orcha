import { MinusIcon, PlusIcon } from "@heroicons/react/solid";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FieldDescription } from "./FieldDescription";
import { FormError } from "./FieldError";

interface Props {
  name: string;
  className?: string;
  description?: string;
  id?: string;
  tabIndex?: number;
}

export const IntField: React.FC<Props> = (props) => {
  const { name, description, tabIndex } = props;

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const value = watch(name);

  useEffect(() => {
    register(name);
  }, [register, name]);

  const error = errors[props.name];

  const renderDescription = () => (
    <FieldDescription className="mt-1">{description}</FieldDescription>
  );

  const renderError = () => <FormError className="mt-1" name={props.name} />;

  return (
    <div className={props.className}>
      <div className="flex w-48 flex-row items-center space-x-2">
        <button
          type="button"
          onClick={() => setValue(name, parseInt(value) - 1)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-400 text-white hover:bg-brand-600"
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        <input
          type="number"
          className="w-24 rounded-md border border-gray-300 bg-white py-2 pl-3 text-center shadow-sm focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25 sm:text-sm"
          id={props.id}
          tabIndex={tabIndex}
          {...register(name)}
        ></input>
        <button
          type="button"
          onClick={() => setValue(name, parseInt(value) + 1)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-400 text-white hover:bg-brand-600"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      {error ? renderError() : description ? renderDescription() : null}
    </div>
  );
};
