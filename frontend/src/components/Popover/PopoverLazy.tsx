/**
 * Lazily-loaded floating tooltip/popover, portaled to a popper root.
 *
 * Ported from react-popper's `usePopper` to `@floating-ui/react` (react-popper
 * is unmaintained and has no React 19 peer). Behaviour is preserved: popper
 * applied `flip` + `preventOverflow` by default, so `flip()` + `shift()`
 * reproduce that; `offset(8)` matches the old `[skidding 0, distance 8]`;
 * default placement stays "bottom".
 *
 * Public API: default export Popover({ referenceElement, children, className,
 * background }).
 */
import { Transition } from "@headlessui/react";
import { useRef } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
} from "@floating-ui/react";
import ReactDOM from "react-dom";

import type { Props } from "./Popover";

const Popover: React.FC<Props> = (props) => {
  const { referenceElement, background } = props;
  const arrowRef = useRef<HTMLDivElement | null>(null);

  const { refs, floatingStyles, middlewareData, placement } = useFloating({
    strategy: "absolute",
    placement: "bottom",
    elements: { reference: referenceElement },
    middleware: [offset(8), flip(), shift(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  });

  // The arrow sits on the side of the floating element opposite its resolved
  // placement; offsetting that side by half the arrow box pokes it out.
  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[placement.split("-")[0]] as string;
  const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};

  // when logged in, we want to be included from the sidebar main section
  // meaning below the top sidebar when scrolling on a mobile device
  const popperAuthedRoot = document.querySelector("#popper-authed-root");

  // otherwise fall back to the one on the document root
  const popperRoot = document.querySelector("#popper-root");

  const popper = (
    <div
      id="tooltip"
      ref={refs.setFloating}
      style={floatingStyles}
      className={props.className}
    >
      <div
        id="arrow"
        className="h-4 w-4"
        ref={arrowRef}
        style={{
          position: "absolute",
          left: arrowX != null ? `${arrowX}px` : "",
          top: arrowY != null ? `${arrowY}px` : "",
          [staticSide]: "-8px",
        }}
      >
        <Transition
          as="div"
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
        as="div"
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
