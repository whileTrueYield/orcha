import React from "react";

import { XIcon } from "@heroicons/react/solid";
import { RefreshIcon } from "@heroicons/react/solid";

interface Props {
  dismiss: () => void;
}

export const NewVersionNotification: React.FC<Props> = (props) => {
  const { dismiss } = props;

  return (
    <div className="pointer-events-auto mt-2 w-full transform rounded-lg bg-gray-800 shadow-lg transition duration-200 hover:scale-105">
      <div className="shadow-xs overflow-hidden rounded-lg">
        <div className="p-4">
          <div className="flex items-start">
            <div className="shrink-0">
              <RefreshIcon className="h-6 w-6 text-gray-100" />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-base font-semibold leading-5 text-gray-50">
                New Version Available
              </p>
              <p className="mt-1 text-sm leading-5 text-gray-100">
                Reload the page to use the latest version of Orcha.
              </p>

              <div className="mt-3 -ml-2 flex space-x-3">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-sm font-medium text-gray-100 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  onClick={() => window.location.reload()}
                >
                  Reload
                </button>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-sm font-medium text-gray-200 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  onClick={dismiss}
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div className="ml-4 flex shrink-0">
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex text-white transition duration-150 ease-in-out focus:text-gray-50 focus:outline-none"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
