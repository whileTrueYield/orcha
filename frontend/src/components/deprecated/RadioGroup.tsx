import React, { useEffect } from "react";
import { FormContextType, ConnectForm } from "../fields/ConnectForm";
import { kebabCase, map } from "lodash";
import { ErrorMessage } from "@hookform/error-message";
import { useWatch } from "react-hook-form";

interface RadioOption {
  value: any;
  label: string;
  description?: string;
}

interface Props extends React.HTMLProps<HTMLInputElement> {
  label?: string;
  description?: string;
  name: string;
  options: RadioOption[];
}

interface ElementProps extends Props {
  formContext: FormContextType;
}

const RadioGroupBase: React.FC<ElementProps> = (props) => {
  const { formContext, name, className, label, description, options } = props;
  const {
    control,
    register,
    setValue,
    trigger,
    formState,
    formState: { errors },
  } = formContext;
  const value = useWatch({ control, name });

  useEffect(() => {
    register(name);
  }, [register, name]);

  const onChange = (option: RadioOption) => () => {
    setValue(name, option.value);
    if (errors[name] || formState.isSubmitted) {
      trigger(name);
    }
  };

  const renderOptionDescription = (option: RadioOption) => {
    if (option.description) {
      return (
        <div className="text-sm leading-5 text-gray-500">
          {option.description}
        </div>
      );
    }
    return null;
  };

  const renderOption = (option: RadioOption) => {
    const id = kebabCase(`${name} ${option.label}`);

    return (
      <div className="mt-4 flex items-start" key={option.label}>
        <div className="flex h-5 items-center">
          <input
            id={id}
            type="radio"
            className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
            value={option.value}
            checked={option.value === value}
            onChange={onChange(option)}
            name={name}
          />
        </div>
        <div className="ml-3 text-sm leading-5">
          <label
            htmlFor={id}
            className="block text-sm font-medium leading-5 text-gray-700"
          >
            {option.label}
          </label>
          {renderOptionDescription(option)}
        </div>
      </div>
    );
  };

  const renderGroupLabel = () => {
    if (label) {
      return (
        <legend className="text-base font-medium text-gray-900">{label}</legend>
      );
    }
    return null;
  };

  const renderGroupDescription = () => {
    if (description) {
      return (
        <div className="text-sm leading-5 text-gray-500">{description}</div>
      );
    }
    return null;
  };

  return (
    <fieldset className={className}>
      {renderGroupLabel()}
      {renderGroupDescription()}
      {map(options, renderOption)}
      <ErrorMessage
        errors={errors}
        name={name}
        render={() => {
          return (
            <p
              id={`${name}-field-error`}
              role="alert"
              className="mt-2 ml-1 text-sm text-red-600"
            >
              This is not a valid selection.
            </p>
          );
        }}
      />
    </fieldset>
  );
};

export const RadioGroup: React.FC<Props> = (props) => (
  <ConnectForm>
    {(formContext) => <RadioGroupBase {...props} {...formContext} />}
  </ConnectForm>
);
