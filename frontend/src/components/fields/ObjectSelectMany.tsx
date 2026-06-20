import React from "react";
import { Listbox, Transition } from "@headlessui/react";
import cn from "classnames";
import { reject, some, sortBy } from "lodash";

export interface RenderOptionArgs<T> {
  selected: boolean;
  active: boolean;
  item: T;
}

export interface ObjectSelectManyProps<T> {
  items: T[];
  value?: T[];
  name?: string;
  label?: string;
  tabIndex?: number;
  onChange: (value: T[]) => void;
  identityMethod: (value?: T) => string | number | null;
  renderOption?: (args: RenderOptionArgs<T>) => React.ReactNode;
  renderButton?: (value: T[]) => React.ReactNode;
  renderOptionLabel?: (value?: T) => string;
  renderButtonLabel?: (value?: T[]) => string;
  header?: React.ReactNode;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ObjectSelectMany<T extends { id: number }>(
  props: ObjectSelectManyProps<T>
) {
  const {
    header,
    value,
    tabIndex,
    label,
    identityMethod,
    className,
    placeholder,
    disabled,
  } = props;

  const isSelected = (item: T) =>
    some(value, (v) => identityMethod(item) === identityMethod(v));

  const items = sortBy(props.items, (item) => !isSelected(item));
  const renderOptionLabel = (value?: T) => {
    if (value) {
      return props.renderOptionLabel ? props.renderOptionLabel(value) : value;
    } else {
      return (
        <div className="text-gray-500" style={{ minHeight: "20px" }}>
          {placeholder}
        </div>
      );
    }
  };

  const renderButtonLabel = (value?: T[]) => {
    if (value && value.length > 0) {
      return props.renderButtonLabel ? props.renderButtonLabel(value) : value;
    } else {
      return (
        <div className="text-gray-500" style={{ minHeight: "20px" }}>
          {placeholder}
        </div>
      );
    }
  };

  const renderOption = ({ active, item }: RenderOptionArgs<T>) => {
    const selected = isSelected(item);

    const rowClass = cn(
      "cursor-default select-none relative py-2 px-4 flex flex-row",
      {
        "text-white bg-brand-500": active,
        "text-gray-700 bg-white": !active,
        "font-semibold": selected,
        "text-gray-900 bg-white": selected && !active,
      }
    );

    // TODO: fix the `as any` for the renderOptionLabel call
    // {renderOptionLabel(item) as any}
    return (
      <div className={rowClass}>
        <span className="block flex-1 truncate">
          {renderOptionLabel(item) as any}
        </span>
        {selected && (
          <span
            className={`${
              active ? "text-white" : "text-brand-600"
            } inset-y-0 right-1 flex items-center pl-1.5`}
          >
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
        )}
      </div>
    );
  };

  // TODO: We need to fix the `as any` here for
  // {renderButtonLabel(value) as any}
  const renderButton = (value?: T[]) => (
    <>
      <span className="block truncate">{renderButtonLabel(value) as any}</span>
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
    </>
  );

  const renderItems = () => {
    return items.map((item) => (
      <Listbox.Option key={item.id} value={item as any}>
        {({ selected, focus }) => renderOption({ selected, active: focus, item })}
      </Listbox.Option>
    ));
  };

  const renderNoItems = () => (
    <Listbox.Option disabled={true} value={null as any}>
      <div className="relative cursor-default select-none bg-white py-2 pl-8 pr-4 text-gray-600">
        No choices
      </div>
    </Listbox.Option>
  );

  const renderLabel = () => (
    <Listbox.Label className="mb-1 block text-sm font-medium leading-5 text-gray-700">
      {label}
    </Listbox.Label>
  );

  const containerClasses = cn(
    "flex items-center justify-center relative",
    className
  );

  const onChange = (changed: any) => {
    if (value) {
      if (isSelected(changed)) {
        props.onChange(
          reject(value, (v) => identityMethod(v) === identityMethod(changed))
        );
      } else {
        props.onChange([...value, changed]);
      }
    } else {
      props.onChange([changed]);
    }
  };

  return (
    <div className={containerClasses}>
      <div className="w-full">
        <Listbox value={null} onChange={onChange} disabled={disabled}>
          {({ open }) => (
            <>
              {label ? renderLabel() : null}
              <div>
                <span className="inline-block w-full rounded-md shadow-sm">
                  <Listbox.Button
                    tabIndex={tabIndex}
                    className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500 focus:ring-opacity-25 sm:text-sm sm:leading-5"
                  >
                    {renderButton(value)}
                  </Listbox.Button>
                </span>

                <Transition
                  as="div"
                  show={open}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="overflow-hidden rounded-md shadow-xl">
                    <Listbox.Options
                      static
                      className="shadow-xs max-h-60 overflow-auto text-base leading-6 focus:outline-none sm:text-sm sm:leading-5"
                    >
                      {header ? (
                        <Listbox.Option value={false} disabled>
                          {header}
                        </Listbox.Option>
                      ) : null}
                      {items.length > 0 ? renderItems() : renderNoItems()}
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
