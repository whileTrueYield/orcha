import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cn from "classnames";
import { forEach, sortBy } from "lodash";

interface Props<T> {
  className?: string;
  sortBy: string;
  elements: Array<T>;
}

type ElementSizeSet = { [position: string]: number };

export function SortedUl<T extends { id: number }>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { elements } = props;

  const ulRef = useRef<HTMLUListElement>(null);
  const [heights, setHeights] = useState<ElementSizeSet>({});

  const positions = useMemo(() => {
    const positions: { [id: string]: number } = {};

    forEach(sortBy(elements, "priority"), (item, index) => {
      positions[item.id] = index;
    });

    return positions;
  }, [elements]);

  const captureSizes = useCallback(() => {
    if (ulRef.current) {
      let hasChanged = false;
      const itemSizes: ElementSizeSet = {};
      Array.from(ulRef.current.children).forEach((node, index) => {
        const rect = node.getBoundingClientRect();
        const elementId = props.elements[index].id;

        if (heights[elementId] !== rect.height) {
          hasChanged = true;
        }

        itemSizes[elementId] = rect.height;
      });

      if (hasChanged) {
        setHeights(itemSizes);
      }
    }
  }, [setHeights, heights, props.elements]);

  useEffect(() => {
    if (ulRef.current) {
      captureSizes();
    }
  }, [captureSizes]);

  useEffect(() => {
    const getTop = (position: number): number => {
      let top = 0;
      // positions[item.id] = li position 0,1,2...
      for (const elementId in positions) {
        if (positions[elementId] < position) {
          top += heights[elementId] || 0;
        }
      }

      return top;
    };

    captureSizes();

    let totalHeight = 0;
    if (ulRef.current) {
      if (ulRef.current.children.length < props.elements.length) {
        console.warn(
          "There is more LI elements than there is props.elements provided to SortedUl. Make sure you only have dynamic LI in the SortedUl element"
        );
      }
      Array.from(ulRef.current.children).forEach((node: any, index) => {
        const elementId = props.elements[index].id;
        node.style.left = `0px`;
        node.style.right = `0px`;
        node.style.top = `${getTop(positions[elementId])}px`;
        node.style.position = "absolute";
        node.style.transitionProperty = "top";
        totalHeight += heights[elementId];
        setTimeout(() => (node.style.transitionDuration = "1000ms"), 200);
      });
      ulRef.current.style.height = `${totalHeight}px`;
    }
  }, [positions, captureSizes, heights, props.elements]);

  const className = cn("relative w-full", props.className);

  return (
    <ul className={className} ref={ulRef}>
      {props.children}
    </ul>
  );
}
