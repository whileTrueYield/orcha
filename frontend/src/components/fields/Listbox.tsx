import React from "react";
import { Listbox as HeadlessListbox, Transition } from "@headlessui/react";
import cn from "classnames";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";

interface Props<T extends any> {
  value: T | null;
  options: T[];
  onChange: (value: T) => void;
  getKey?: (value: T) => string;
  getLabel?: (value: T | null) => string;
  placeholder?: string;
  className?: string;
}

export function ListBox<T>(props: React.PropsWithChildren<Props<T>>) {
  const { value, onChange, options, className } = props;

  const getKey = props.getKey ? props.getKey : (value: T) => value;
  const getLabel = props.getLabel ? props.getLabel : (value: T | null) => value;

  return (
    <div className={cn("relative", className)}>
      <HeadlessListbox value={value ?? undefined} onChange={onChange}>
        {({ open }) => (
          <>
            <HeadlessListbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm">
              <span className="block truncate">
                {value ? (
                  // TODO: Fix that any typing here
                  (getLabel(value) as any)
                ) : (
                  <span className="text-gray-400">{props.placeholder}</span>
                )}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </HeadlessListbox.Button>

            <Transition
              show={open}
              as={React.Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <HeadlessListbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((value) => (
                  <HeadlessListbox.Option
                    className={({ focus }) =>
                      cn("relative cursor-default select-none py-2 pl-3 pr-9", {
                        "bg-brand-600 text-white": focus,
                        "text-gray-900": !focus,
                      })
                    }
                    key={getKey(value) as any}
                    value={value}
                  >
                    {({ selected, focus }) => (
                      <>
                        <span
                          className={cn("block truncate", {
                            "font-semibold": focus,
                            "font-normal": !focus,
                          })}
                        >
                          {
                            // TODO: we need to fix the as any here
                            getLabel(value) as any
                          }
                        </span>

                        {selected ? (
                          <span
                            className={cn(
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                              {
                                "text-white": focus,
                                "text-brand-600": !focus,
                              }
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </HeadlessListbox.Option>
                ))}
              </HeadlessListbox.Options>
            </Transition>
          </>
        )}
      </HeadlessListbox>
    </div>
  );
}
