import React, { useEffect } from "react";

interface Options {
  ignoreTooltipClick?: boolean;
}

export function useOutsideClick(
  ref: React.MutableRefObject<HTMLElement | null>,
  callback: (event: MouseEvent) => any,
  options: Options = {}
) {
  useEffect(() => {
    function handleClickEvent(event: MouseEvent) {
      // in case we use this for a tooltip, we want to make sure that
      // clicking the tooltip is ignored
      if (options.ignoreTooltipClick) {
        // tooltip have and ID of "tooltip"... clever me
        const tooltip = document.getElementById("tooltip");
        if (tooltip && tooltip.contains(event.target as Node)) {
          return;
        }
      }
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    }

    document.addEventListener("mousedown", handleClickEvent);
    return () => {
      document.removeEventListener("mousedown", handleClickEvent);
    };
  }, [ref, callback, options]);
}
