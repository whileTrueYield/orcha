import React, { ReactNode, useEffect } from "react";
import { find, map } from "lodash";
import cn from "classnames";
import { ErrorMessage } from "@hookform/error-message";
import { Menu, Transition } from "@headlessui/react";
import { useWatch } from "react-hook-form";
import { ConnectForm, FormContextType } from "../fields/ConnectForm";

interface SelectOption {
  value: any;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RenderButtonParams {
  value: any;
}

interface Props extends React.HTMLProps<HTMLSelectElement> {
  label?: string;
  description?: string;
  name: string;
  placeholder: string;
  onChange: (value: any) => void;
  options: SelectOption[];
  renderButton?: (params: RenderButtonParams) => ReactNode;
}

interface ElementProps extends Props {
  formContext: FormContextType;
}

const CustomSelectGroupElement: React.FC<ElementProps> = (props) => {
  const { formContext, name, description, label, options, placeholder } = props;
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

  const onClick = (option: SelectOption) => () => {
    if (!option.disabled) {
      setValue(name, option.value);
      if (errors[name] || formState.isSubmitted) {
        trigger(name);
      }
    }
  };

  const getActiveOption = () => find(options, isSelected);

  const renderOption = (option: SelectOption) => {
    return (
      <Menu.Item key={option.label} disabled={option.disabled}>
        {renderItem(option)}
      </Menu.Item>
    );
  };

  interface RenderItemParams {
    focus: boolean;
  }

  const renderItem = (option: SelectOption) => (params: RenderItemParams) => {
    const className = cn("cursor-default select-none relative py-2 pl-3 pr-9", {
      "bg-brand-600 text-white": params.focus,
      "bg-gray-100 text-gray-600": option.disabled,
      "text-gray-900": !params.focus && !option.disabled,
      "font-semibold": isSelected(option),
    });
    return (
      <div className={className} onClick={onClick(option)}>
        <span className="block truncate">
          {option.label}
          {renderItemDescription(option, params)}
        </span>
        {renderCheckmark(option, params)}
      </div>
    );
  };

  const isSelected = (option: SelectOption) => {
    return value === option.value;
  };

  const renderCheckmark = (option: SelectOption, params: RenderItemParams) => {
    if (isSelected(option)) {
      const className = cn(
        "absolute inset-y-0 right-0 flex items-center pr-4",
        {
          "text-blue-600": !params.focus,
          "text-white": params.focus,
        }
      );

      return (
        <span className={className}>
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
    } else {
      return null;
    }
  };

  const renderItemDescription = (
    option: SelectOption,
    params: RenderItemParams
  ) => {
    if (option.description) {
      const className = cn("ml-2 text-sm font-normal", {
        "text-blue-200": params.focus,
        "text-gray-500": !params.focus,
      });

      return <span className={className}>{option.description}</span>;
    }

    return null;
  };

  const renderLabel = () => {
    if (label) {
      return (
        <label
          htmlFor={props.id || name}
          className="block text-sm font-medium leading-5 text-gray-700"
        >
          {label}
        </label>
      );
    }

    return null;
  };

  const renderDescription = () => {
    if (description) {
      return (
        <div className="mt-2 ml-1 text-sm text-gray-500">{description}</div>
      );
    }

    return null;
  };

  const renderValue = () => {
    const option = getActiveOption();
    if (option) {
      return option.label;
    } else {
      return <span className="text-gray-400">{placeholder}</span>;
    }
  };

  const renderButton = () => {
    if (props.renderButton) {
      return props.renderButton({ value });
    }

    return (
      <Menu.Button className="focus:ring-blue relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5">
        <span className="block truncate" style={{ minHeight: "1.25rem" }}>
          {renderValue()}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M7 7l3-3 3 3m0 6l-3 3-3-3"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Menu.Button>
    );
  };

  return (
    <>
      {renderLabel()}
      <Menu>
        {({ open }: { open: boolean }) => (
          <div className="relative mt-1 w-full">
            {renderButton()}
            <Transition
              as="div"
              show={open}
              className="absolute mt-1 mb-4 w-full rounded-md bg-white shadow-lg"
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items
                static
                className="shadow-xs max-h-56 overflow-auto rounded-md text-base leading-6 focus:outline-none sm:text-sm sm:leading-5"
              >
                {map(options, renderOption)}
              </Menu.Items>
            </Transition>
          </div>
        )}
      </Menu>
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
      {renderDescription()}
    </>
  );
};

export const CustomSelectGroup: React.FC<Props> = (props) => (
  <ConnectForm>
    {(formContext) => <CustomSelectGroupElement {...props} {...formContext} />}
  </ConnectForm>
);
