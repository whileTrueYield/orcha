import React, { useEffect, useRef } from "react";
import { get } from "lodash";

/**
 * Listen to a keyUp event on window that matches the key "/"
 * and focus the element given as an argument. Return the reference
 * to place on the element to receive focus
 * @param searchElt
 */
export const useSlashForSearch = (): React.RefObject<HTMLInputElement | null> => {
  const searchElt = useRef<HTMLInputElement>(null);

  // Focus on the search input when pressing /
  useEffect(() => {
    const onKeyUp = (event: KeyboardEvent) => {
      // ignore when user type "/" in an input field
      const tagName = get(event, "target.tagName");
      if (tagName === "INPUT" || tagName === "TEXTAREA") {
        return;
      }

      if (event.code === "Slash") {
        searchElt.current?.focus();
        searchElt.current?.select();
      }
    };

    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [searchElt]);

  return searchElt;
};
