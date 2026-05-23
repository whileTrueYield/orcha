import { useEffect } from "react";

export function useKeyup(
  code: string,
  callback: (event: KeyboardEvent) => void
) {
  useEffect(() => {
    function handleKeyupEvent(event: KeyboardEvent) {
      if (event.code === code) {
        callback(event);
      }
    }

    window.addEventListener("keyup", handleKeyupEvent);
    return () => {
      window.removeEventListener("keyup", handleKeyupEvent);
    };
  }, [code, callback]);
}
