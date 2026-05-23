import React, { Fragment, useEffect, useRef } from "react";
import "./Modal.css";

import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import cn from "classnames";

export interface ModalProps {
  visible: boolean;
  onClose: () => any;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
  initialFocusSelector?: string;
  dark?: boolean;
  blur?: boolean;
  large?: boolean;
  id?: string;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = (props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { visible, initialFocus, dark, blur, large, id, initialFocusSelector } =
    props;

  // FOCUS HACK:
  // Using react-hook-form helps with many things but makes it harder
  // to access input refs. Having the input built into component, made
  // it even harder. In order to circumvent this design flaw, we'll
  // rely on a pure javascript hack to activate a field not based on
  // its ref, but using a query selector like "#ticket-title".
  useEffect(() => {
    if (visible && initialFocusSelector) {
      setTimeout(() => {
        if (modalRef.current) {
          const elt = modalRef.current.querySelector(
            initialFocusSelector
          ) as HTMLInputElement;
          if (elt) {
            try {
              elt.focus();
            } catch (error) {
              console.warn(
                `Could not activate focus on selector ${initialFocusSelector}`,
                error
              );
            }
          }
        }
      });
    }
  }, [visible, initialFocusSelector, modalRef]);

  // By default, dialog will close when clicking the backdrop
  // or pressing ESC. We want the ESC behavior but not the
  // backdrop click. So we'll manually handle the ESC key press
  // and disable the built in close feature in the <Dialog /> element
  const { onClose } = props;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const modalColor = cn(
    "w-full inline-block align-bottom px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:p-6",
    {
      "bg-white rounded-xl": !dark,
      "bg-gray-900 rounded-3xl": dark,
      "sm:max-w-xl": !large,
      "sm:max-w-2xl": large,
    }
  );

  const overlayClass = cn(
    "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
    {
      "backdrop-blur-sm": blur,
    }
  );

  return (
    <Transition.Root show={visible} as={Fragment}>
      <Dialog
        as="div"
        data-e2e="modal"
        className="relative z-30"
        onClose={() => {}}
        initialFocus={initialFocus}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={overlayClass} />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0"
            ref={modalRef}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={modalColor} id={id}>
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    onClick={props.onClose}
                    type="button"
                    className="text-gray-400 transition duration-150 ease-in-out hover:text-gray-500 focus:text-gray-500 focus:outline-none"
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>
                {props.children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
