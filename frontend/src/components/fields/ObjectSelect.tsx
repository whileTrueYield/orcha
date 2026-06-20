import React from "react";
import { Listbox, Transition } from "@headlessui/react";
import cn from "classnames";
import { XIcon } from "@heroicons/react/solid";

export interface RenderOptionArgs<T> {
  selected: boolean;
  active: boolean;
  disabled: boolean;
  item: T;
}

export interface ObjectSelectProps<T> {
  items: T[];
  value?: T | null;
  name?: string;
  label?: string;
  tabIndex?: number;
  onChange: (value: T) => void;
  identityMethod?: (value?: T | null) => string | number | null;
  renderOption?: (args: RenderOptionArgs<T>) => React.ReactNode;
  renderButton?: (value: T | null, tabIndex?: number) => React.ReactNode;
  isDisabled?: (value: T) => boolean;
  isSelected?: (value: T) => boolean;
  onDelete?: () => void;
  renderOptionLabel?: (
    value?: T,
    isActive?: boolean,
    isSelected?: boolean,
    isDisabled?: boolean
  ) => string | React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  renderNoOptions?: () => React.ReactNode;
}

export function ObjectSelect<T>(props: ObjectSelectProps<T>) {
  const {
    header,
    value,
    onChange,
    items,
    tabIndex,
    label,
    identityMethod,
    className,
    placeholder,
    disabled,
  } = props;

  const renderOptionLabel = (
    value?: T | null,
    isActive?: boolean,
    isSelected?: boolean,
    isDisabled?: boolean
  ) => {
    if (value) {
      return props.renderOptionLabel
        ? props.renderOptionLabel(value, isActive, isSelected, isDisabled)
        : value;
    } else {
      return (
        <div className="truncate text-gray-500" style={{ minHeight: "20px" }}>
          {placeholder}
        </div>
      );
    }
  };

  const renderOption = ({
    selected,
    active,
    disabled,
    item,
  }: RenderOptionArgs<T>) => {
    if (props.isSelected) {
      selected = props.isSelected(item);
    } else {
      selected = identityMethod
        ? identityMethod(item) === identityMethod(value)
        : selected;
    }

    const rowClass = cn(
      "min-w-0 cursor-default select-none relative py-2 px-4 flex flex-row",
      {
        "text-white bg-brand-600": active && !disabled,
        "text-gray-700 bg-white": !active && !disabled && !selected,
        "font-semibold": selected,
        "text-gray-900 bg-brand-100": selected && !active,
        "text-gray-500 bg-gray-100 cursor-not-allowed": disabled,
      }
    );
    // TODO: find a way to fix the as any here
    return (
      <div className={rowClass}>
        <span className="block flex-1 truncate">
          {renderOptionLabel(item, active, selected, disabled) as any}
        </span>
      </div>
    );
  };

  // TODO: find a way to fix the as any for
  // {renderOptionLabel(value) as any}

  const renderButton = (value?: T | null) => (
    <>
      <span className="block min-w-0 text-gray-700">
        {renderOptionLabel(value) as any}
      </span>
      {props.onDelete && value ? (
        <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
          <span
            role="button"
            onClick={(event) => {
              event.preventDefault();
              props.onDelete && props.onDelete();
            }}
            className="flex cursor-pointer items-center rounded p-0.5 text-gray-400 transition hover:bg-red-100 hover:text-red-500"
          >
            <XIcon className="h-5 w-5" />
          </span>
        </div>
      ) : (
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
      )}
    </>
  );

  const renderItems = () => {
    return items.map((item, index) => (
      <Listbox.Option
        key={index}
        value={item as any}
        disabled={props.isDisabled ? props.isDisabled(item) : false}
      >
        {({ selected, focus, disabled }) =>
          renderOption({ selected, active: focus, item, disabled })
        }
      </Listbox.Option>
    ));
  };

  const renderNoItems = () => {
    if (props.renderNoOptions) {
      const alternateNoOptions = props.renderNoOptions();

      if (alternateNoOptions) {
        return alternateNoOptions;
      }
    }

    return (
      <Listbox.Option disabled={true} value={null as any}>
        <div className="relative cursor-default select-none bg-white py-2 pl-8 pr-4 text-center text-gray-400">
          No choices
        </div>
      </Listbox.Option>
    );
  };

  const renderLabel = () => (
    <Listbox.Label className="mb-1 block text-sm font-medium leading-5 text-gray-700">
      {label}
    </Listbox.Label>
  );

  const containerClasses = cn(
    "min-w-0 flex-1 flex items-center justify-center relative",
    className
  );

  return (
    <div className={containerClasses}>
      <div className="w-full">
        <Listbox value={value ?? undefined} onChange={onChange} disabled={disabled}>
          {({ open }) => (
            <>
              {label ? renderLabel() : null}
              <div>
                {props.renderButton ? (
                  props.renderButton(value || null, tabIndex)
                ) : (
                  <span className="inline-block w-full rounded-md shadow-sm">
                    <Listbox.Button
                      tabIndex={tabIndex}
                      className={cn(
                        "relative w-full min-w-0 cursor-default rounded-md border border-gray-300 py-2 pl-3 pr-10 text-left text-sm leading-5 transition duration-150 ease-in-out focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500 focus:ring-opacity-25",
                        {
                          "cursor-not-allowed bg-gray-50": disabled,
                          "bg-white": !disabled,
                        }
                      )}
                    >
                      {renderButton(value)}
                    </Listbox.Button>
                  </span>
                )}

                <Transition
                  as="div"
                  show={open}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 shadow-sm"
                >
                  <div
                    className="overflow-hidden rounded-md shadow-xl"
                    ref={(elt) => {
                      if (elt) {
                        elt.scrollIntoView({
                          block: "nearest",
                          behavior: "smooth",
                        });
                      }
                    }}
                  >
                    <Listbox.Options
                      static
                      className="shadow-xs text-sm leading-5 focus:outline-none"
                    >
                      {header ? (
                        <Listbox.Option value={false} disabled>
                          {header}
                        </Listbox.Option>
                      ) : null}
                      <div className="max-h-60 overflow-auto ">
                        {items.length > 0 ? renderItems() : renderNoItems()}
                      </div>
                    </Listbox.Options>
                  </div>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
      </div>
    </div>
  );
}
