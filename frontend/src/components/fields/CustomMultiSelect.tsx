import React, { ReactNode, useRef, useState } from "react";
import { filter, find, map } from "lodash";
import cn from "classnames";
import { Menu, Transition } from "@headlessui/react";
import { useOutsideClick } from "hooks/useOutsideClick";
import { useKeyup } from "hooks/useKeyup";
import { useDebouncedState } from "hooks/useDebouncedState";
import { Input } from "components/fields/Input";
import { Button } from "./Button";
import { PlusIcon } from "@heroicons/react/solid";

export interface SelectOption<T> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RenderButtonParams<T> {
  values: T[];

  // The multiselect controls its open/close state
  // so we need to provide its controller and state
  isOpen: boolean;
  setOpen: (state: boolean) => void;
}

interface Props<T> {
  id?: string;
  label?: string;
  description?: string;
  className?: string;
  placeholder?: string;
  values: T[];
  options: SelectOption<T>[];
  checkmarks?: boolean;
  renderButton?: (params: RenderButtonParams<T>) => ReactNode;
  onSearch?: (query: string) => void;
  onCreate?: (query: string) => void;
  onSelect: (option: T[]) => void;
  onDeselect: (option: T[]) => void;
  identityMethod: (source: T) => any;
}

export function CustomMultiSelect<T>(props: Props<T>) {
  const {
    className,
    description,
    identityMethod,
    label,
    onDeselect,
    onSearch,
    onSelect,
    options,
    placeholder,
    values,
    checkmarks,
    onCreate,
  } = props;
  const searchField = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const [search, setSearch] = useDebouncedState("", 1000, () => {
    if (onSearch) {
      onSearch(search);
    }
  });

  // alternative closing strategies
  useOutsideClick(wrapperRef, () => setOpen(false));
  useKeyup("Escape", () => (isOpen ? setOpen(false) : null));

  const onClick = (option: SelectOption<T>) => () => {
    if (!option.disabled) {
      // We want to deselected a selected option
      if (isSelected(option)) {
        onDeselect([option.value]);
      } else {
        onSelect([option.value]);
      }
    }
  };

  const getActiveOptions = () => {
    return filter(options, isSelected);
  };

  const renderOption = (option: SelectOption<T>) => {
    return (
      <Menu.Item
        key={`${option.label}-${option.description}`}
        disabled={option.disabled}
      >
        {renderItem(option)}
      </Menu.Item>
    );
  };

  interface RenderItemParams {
    active: boolean;
  }

  const renderItem =
    (option: SelectOption<T>) => (params: RenderItemParams) => {
      const className = cn("cursor-default select-none relative py-2 px-3", {
        "bg-brand-700 text-white": params.active,
        "bg-gray-300 text-gray-600": option.disabled && !isSelected(option),
        "font-semibold text-brand-900 bg-white":
          !params.active && isSelected(option),
        "pl-8": checkmarks,
      });
      return (
        <div className={className} onClick={onClick(option)}>
          <span className="inline-flex w-full space-x-2 truncate">
            <span className="block truncate">{option.label}</span>
            <span className="">{renderItemDescription(option, params)}</span>
          </span>
          {checkmarks ? renderCheckmark(option, params) : null}
        </div>
      );
    };

  const isSelected = (option: SelectOption<T>): boolean => {
    const identity = identityMethod(option.value);
    return !!find(values, (opt) => identityMethod(opt) === identity);
  };

  const renderCheckmark = (
    option: SelectOption<T>,
    params: RenderItemParams
  ) => {
    if (isSelected(option)) {
      const className = cn(
        "absolute inset-y-0 left-2 flex items-center pr-4",
        {}
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
    option: SelectOption<T>,
    params: RenderItemParams
  ) => {
    if (option.description) {
      const className = cn("ml-1 font-normal text-gray-600");

      return <span className={className}>{option.description}</span>;
    }

    return null;
  };

  const renderLabel = () => {
    if (label) {
      return (
        <label
          htmlFor={props.id}
          onClick={() => setOpen(!isOpen)}
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
    const options = getActiveOptions();
    if (options.length > 0) {
      return map(options, "label").join(", ");
    } else {
      return <span className="text-gray-400">{placeholder}</span>;
    }
  };

  const renderButton = () => {
    if (props.renderButton) {
      return props.renderButton({ values, isOpen, setOpen });
    }

    return (
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className="focus:ring-blue relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
      >
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
      </button>
    );
  };

  const renderCreate = () => {
    if (onCreate) {
      // if there is onSearch tool, we'll integrate with it
      if (onSearch) {
        return (
          <Button
            type="button"
            value={search}
            btnGroup="end"
            btnType="primary"
            btnSize="xsmall"
            onClick={() => onCreate(search)}
          >
            <PlusIcon className="h-4 w-4 text-white" />
          </Button>
        );
      } else {
        return (
          <div className="p-2">
            <Button
              btnSize="xsmall"
              type="button"
              btnType="primary"
              value={search}
              block
              onClick={() => onCreate(search)}
            >
              Create new tag
            </Button>
          </div>
        );
      }
    } else {
      return null;
    }
  };

  const coverKey = (code: string) => {
    return code === "Space" || code === "Tab";
  };

  const renderSearch = () => {
    if (onSearch) {
      // note the presence of the onKeyDown hook to prevent Headless UI from
      // capturing (and cancelling) the event while on the input text field.
      // Without this, Headless UI would prevent space, up and down from working
      return (
        <div className="p-2">
          <Input
            onKeyDown={(evt) =>
              coverKey(evt.code) ? evt.stopPropagation() : true
            }
            small
            onChange={(evt) => setSearch(evt.currentTarget.value)}
            type="text"
            value={search}
            placeholder="Search..."
            autoFocus
            ref={searchField}
            onClick={(event) => event.stopPropagation()}
          >
            {renderCreate()}
          </Input>
        </div>
      );
    } else {
      return null;
    }
  };

  const ItemsClass = cn(
    "rounded-md text-base leading-6 shadow-xs focus:outline-none sm:text-sm sm:leading-5"
  );

  return (
    <div className={className} ref={wrapperRef}>
      {renderLabel()}
      <Menu>
        {() => (
          <div className="w-full">
            {renderButton()}

            <div className="relative mt-1">
              <Transition
                show={isOpen}
                className=" absolute right-0 z-10 mt-1 mb-4 w-full max-w-md overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Menu.Items static className={ItemsClass}>
                  {renderSearch()}
                  <div className="max-h-56 overflow-auto border-t">
                    {map(options, renderOption)}
                  </div>
                </Menu.Items>
              </Transition>
            </div>
          </div>
        )}
      </Menu>
      {renderDescription()}
    </div>
  );
}
