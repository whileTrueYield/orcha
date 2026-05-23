import { PropsWithChildren, useRef, useState } from "react";
import { Popover } from "components/Popover/Popover";
import { useOutsideClick } from "hooks/useOutsideClick";
import { useKeyup } from "hooks/useKeyup";
import cn from "classnames";

interface Props extends PropsWithChildren {
  className?: string;
  tooltip: React.ReactNode | ((close: () => void) => React.ReactNode);
  backgroundColor?: string;
}

export const HoverTooltip: React.FC<Props> = (props) => {
  const [isVisible, setVisible] = useState(false);
  const popoverRef = useRef(null);
  const [referenceElement, setReferenceElement] =
    useState<HTMLSpanElement | null>(null);

  const backgroundColor = props.backgroundColor || "bg-black";

  return (
    <span
      className={props.className}
      ref={setReferenceElement}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {props.children}
      {referenceElement && isVisible ? (
        <Popover
          referenceElement={referenceElement}
          className="z-50 max-w-xs cursor-auto px-2 sm:max-w-sm sm:px-0"
          background={backgroundColor}
        >
          <div
            ref={popoverRef}
            className={cn(
              backgroundColor,
              "relative overflow-hidden rounded-md p-2 text-sm font-medium text-white shadow-lg"
            )}
          >
            {typeof props.tooltip === "function"
              ? props.tooltip(() => setVisible(false))
              : props.tooltip}
          </div>
        </Popover>
      ) : null}
    </span>
  );
};

export const ClickTooltip: React.FC<Props> = (props) => {
  const [isVisible, setVisible] = useState(false);
  const popoverRef = useRef(null);
  const [referenceElement, setReferenceElement] =
    useState<HTMLSpanElement | null>(null);

  useOutsideClick(popoverRef, () => popoverRef.current && setVisible(false));
  useKeyup("Escape", () => popoverRef.current && setVisible(false));

  return (
    <span
      className={props.className}
      ref={setReferenceElement}
      onMouseDown={() => setTimeout(() => setVisible(true))}
    >
      {props.children}
      {referenceElement && isVisible ? (
        <Popover
          referenceElement={referenceElement}
          className="z-50 max-w-xs cursor-auto px-2 sm:max-w-sm sm:px-0"
          background="bg-gray-700"
        >
          <div
            ref={popoverRef}
            className="relative overflow-hidden rounded-md bg-gray-700 p-2 text-sm font-medium text-white shadow-lg"
          >
            {typeof props.tooltip === "function"
              ? props.tooltip(() => setVisible(false))
              : props.tooltip}
          </div>
        </Popover>
      ) : null}
    </span>
  );
};
