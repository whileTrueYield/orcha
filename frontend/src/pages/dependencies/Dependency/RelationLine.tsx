import React, { useEffect, useRef } from "react";
import { Coordinate } from "./types";

interface Props {
  start: Coordinate | null;
  yScrollElement: HTMLDivElement | null;
  xScrollElement: HTMLDivElement | null;
  lineType: "square" | "curve";
}

export const RelationLine: React.FC<Props> = (props) => {
  const { start, yScrollElement, xScrollElement, lineType } = props;
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (yScrollElement && xScrollElement) {
      const onDragOver = (event: MouseEvent) => {
        if (yScrollElement && lineRef.current && start) {
          const bbox = yScrollElement.getBoundingClientRect();
          const y = event.pageY + yScrollElement.scrollTop - bbox.top;
          const x = event.pageX + xScrollElement.scrollLeft - bbox.left;

          const depdencyContainer = document.getElementById(
            "dependency-ticket-container"
          );

          // we need to offset the end of dragged line by the width
          // of the ticket listing container since this container changes
          // based on the window width
          let offsetX = 255;
          if (depdencyContainer) {
            offsetX = depdencyContainer.getBoundingClientRect().width;
          }

          const end = { x: x - offsetX, y };

          if (lineType === "curve") {
            const points = [
              "M" + [start.x, start.y].join(","),
              "C" + [end.x, start.y].join(","),
              [start.x, end.y].join(","),
              [end.x, end.y].join(","),
            ];

            lineRef.current.setAttribute("d", points.join(" "));
          } else {
            const halfWay = start.x + (end.x - start.x) / 2;

            const points = [
              "M" + [start.x, start.y].join(","),
              [halfWay, start.y].join(","),
              [halfWay, end.y].join(","),
              [end.x, end.y].join(","),
            ];

            lineRef.current.setAttribute("d", points.join(" "));
          }
        }
        event.preventDefault();
      };

      yScrollElement.addEventListener("dragover", onDragOver);

      return () => {
        yScrollElement.removeEventListener("dragover", onDragOver);
      };
    }
  }, [yScrollElement, start, lineRef, lineType, xScrollElement]);

  if (!start || !yScrollElement || !xScrollElement) {
    return null;
  }

  return (
    <path
      fill="none"
      strokeWidth={2}
      strokeDasharray={4}
      className="stroke-current text-gray-400"
      strokeLinejoin="round"
      ref={lineRef}
    />
  );
};
