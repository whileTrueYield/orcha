import React, { CSSProperties, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Popover } from "@headlessui/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/solid";
import cn from "classnames";
import { LightBulbIcon } from "@heroicons/react/outline";

interface Props {
  children?: React.ReactNode;
  className?: string;
}

const WIDTH = 320;

export const InlinePopHelp: React.FC<Props> = (props) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const className = cn(
    "text-sm leading-6 text-gray-600 space-y-2",
    props.className
  );

  useEffect(() => {
    if (buttonRef.current) {
      const onClick = (event: MouseEvent) => {
        const panelStyle: CSSProperties = { width: `${WIDTH}px` };
        const panelBox = buttonRef.current!.getBoundingClientRect();
        if (event.clientX > window.innerWidth / 2) {
          panelStyle.left = panelBox.x - WIDTH;
          panelStyle.maxWidth = event.clientX - 8;
        } else {
          panelStyle.left = panelBox.x;
          panelStyle.maxWidth =
            window.innerWidth - (panelBox.left + panelStyle.left + 8);
        }

        if (event.clientY > window.innerHeight / 2) {
          panelStyle.top = panelBox.top + 8;
        } else {
          panelStyle.top = panelBox.top + 8;
        }
        setPanelStyle(panelStyle);
      };

      const button = buttonRef.current;
      button.addEventListener("click", onClick);
      return () => {
        button.removeEventListener("click", onClick);
      };
    }
  }, [buttonRef, panelRef]);

  const panel = ReactDOM.createPortal(
    <div className="fixed left-0 top-0 z-30">
      <Popover.Panel
        className="absolute z-10 flex flex-row items-start space-x-2 rounded-md border bg-white p-4 shadow-lg"
        style={panelStyle}
      >
        <div className="shrink-0">
          <LightBulbIcon className="h-6 w-6 text-yellow-400" />
        </div>
        <div className={className}>{props.children}</div>
      </Popover.Panel>
    </div>,
    document.getElementById("popup-root")!
  );

  return (
    <Popover className="relative inline-block">
      <Popover.Button
        ref={buttonRef}
        className="rounded-full p-1 text-gray-400 hover:text-gray-600 focus:text-yellow-500 focus:outline-none focus:ring"
      >
        <QuestionMarkCircleIcon className="h-4 w-4" />
      </Popover.Button>
      {panel}
    </Popover>
  );
};
