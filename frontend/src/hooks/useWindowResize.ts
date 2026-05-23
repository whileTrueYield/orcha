import { useState, useEffect } from "react";

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

export const useWindowResize = (
  onResize?: (size: WindowSize) => void
): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      const newWindowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setWindowSize(newWindowSize);
      onResize && onResize(newWindowSize);
    }

    window.addEventListener("resize", handleResize);

    if (
      window.innerWidth !== windowSize.width &&
      window.innerHeight !== windowSize.height
    ) {
      handleResize();
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [onResize, windowSize]);

  return windowSize;
};
