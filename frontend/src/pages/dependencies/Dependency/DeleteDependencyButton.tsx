import { Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";
import React from "react";

interface Props {
  onClick: () => void;
}

export const DeleteDependencyButton: React.FC<Props> = (props) => {
  return (
    <div className="relative z-20 h-5 w-5">
      <Transition
        appear={true}
        show={true}
        enter="transition duration-150"
        enterFrom="opacity-0 scale-50"
        enterTo="opacity-100 scale-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="absolute inset-y-0 left-4"
      >
        <button
          type="button"
          className="flex h-full flex-row items-center whitespace-nowrap rounded-full bg-red-400 pl-1 pr-3 text-sm font-medium text-white shadow hover:bg-red-500"
          onClick={(event) => {
            props.onClick();
            event.stopPropagation();
          }}
        >
          <div className="mr-1 rounded-full bg-red-50 p-px">
            <XIcon className="h-3 w-3 text-red-500" />
          </div>
          <div>unlink</div>
        </button>
      </Transition>
    </div>
  );
};
