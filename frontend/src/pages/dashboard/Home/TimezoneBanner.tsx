import { GlobeAltIcon, XIcon } from "@heroicons/react/outline";
import React from "react";

interface Props {
  cta: string;
  onCancel: () => void;
  onClick: () => void;
}

export const TimezoneBanner: React.FC<Props> = (props) => {
  return (
    <div
      data-e2e="timezone-banner"
      className="fixed inset-x-0 bottom-0 z-20 pb-2 sm:pb-24 md:left-14 xl:left-64 xl:pb-5"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-32">
        <div className="rounded-lg bg-orange-600 p-2 shadow-lg sm:p-3">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex w-0 flex-1 items-center">
              <span className="flex rounded-lg bg-orange-800 p-2">
                <GlobeAltIcon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </span>
              <p className="ml-3 truncate font-medium text-white">
                <span className="md:hidden">Your time zone changed!</span>
                <span className="hidden md:inline">
                  Change time zone to reflect your new work hours?
                </span>
              </p>
            </div>
            <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
              <button
                type="button"
                onClick={props.onClick}
                className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm hover:bg-orange-50"
              >
                {props.cta}
              </button>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                onClick={props.onCancel}
                className="-mr-1 flex rounded-md p-2 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Dismiss</span>
                <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
