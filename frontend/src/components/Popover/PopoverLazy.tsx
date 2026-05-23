import { Transition } from "@headlessui/react";
import { useState } from "react";
import { usePopper } from "react-popper";
import ReactDOM from "react-dom";

import type { Props } from "./Popover";

const Popover: React.FC<Props> = (props) => {
  const { referenceElement, background } = props;
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: "absolute",
    modifiers: [
      { name: "offset", options: { offset: [0, 8] } },
      { name: "arrow", options: { element: arrowElement } },
    ],
  });

  // when logged in, we want to be included from the sidebar main section
  // meaning below the top sidebar when scrolling on a mobile device
  const popperAuthedRoot = document.querySelector("#popper-authed-root");

  // otherwise fall back to the one on the document root
  const popperRoot = document.querySelector("#popper-root");

  const popper = (
    <div
      id="tooltip"
      ref={setPopperElement}
      style={styles.popper}
      className={props.className}
      {...attributes.popper}
    >
      <div
        id="arrow"
        className="h-4 w-4"
        ref={setArrowElement}
        style={styles.arrow}
      >
        <Transition
          show
          appear
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <div
            className={`h-4 w-4 rotate-45 transform rounded ${
              background || "bg-gray-700"
            }`}
          ></div>
        </Transition>
      </div>
      <Transition
        show
        appear
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        {props.children}
      </Transition>
    </div>
  );

  if (popperAuthedRoot) {
    return ReactDOM.createPortal(popper, popperAuthedRoot);
  } else if (popperRoot) {
    return ReactDOM.createPortal(popper, popperRoot);
  } else {
    console.warn('Could not find "popper-root" element.');
    return popper;
  }
};

export default Popover;
