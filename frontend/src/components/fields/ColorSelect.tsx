import React, { useEffect, useRef, useState } from "react";
import { first, last, map } from "lodash";
import { COLORS } from "config";
import cn from "classnames";
import { getColor } from "config";
import { useOutsideClick } from "hooks/useOutsideClick";

interface ColorSelectProps {
  className?: string;
  value: string;
  onChange: (color: string) => void;
}

export const ColorSelect: React.FC<ColorSelectProps> = (props) => {
  const { value } = props;
  const [isSelectorVisible, setSelectorVisibility] = useState(false);
  const colorSet = getColor(value);
  const container = useRef<HTMLDivElement>(null);
  useOutsideClick(container, () => setSelectorVisibility(false));

  // close the sidebar on ESC key pressed
  useEffect(() => {
    if (isSelectorVisible) {
      const closeSidebarOnEsc = (event: KeyboardEvent) => {
        if (event.code === "Escape") {
          setSelectorVisibility(false);
        }
      };

      window.addEventListener("keyup", closeSidebarOnEsc);
      return () => {
        window.removeEventListener("keyup", closeSidebarOnEsc);
      };
    }
  }, [isSelectorVisible, setSelectorVisibility]);

  const setColor = (color: string) => {
    props.onChange(color);
    setSelectorVisibility(false);
  };

  const renderMenu = () => (
    <div className="absolute right-0 top-0 z-10 mt-10 rounded-md border border-gray-300 bg-white p-2 shadow-lg">
      <div className="grid grid-cols-4 gap-2">
        {map(COLORS, (color, colorKey) => (
          <button
            key={`color-${color.name}`}
            className={`col-span-1 flex h-8 w-8 items-center justify-center font-bold capitalize ${color.bgColor} border-2 ${color.textColor} ${color.borderColor} cursor-pointer rounded ring-brand-400 ring-opacity-50 hover:ring`}
            title={color.name}
            onClick={() => setColor(colorKey)}
          >
            {first(last(color.name.split(" ")))}
          </button>
        ))}
      </div>
    </div>
  );

  const className = cn("relative", props.className);

  return (
    <div className={className} ref={container}>
      <button
        type="button"
        className={`truncate text-left ${colorSet.bgColor} ${colorSet.borderColor} font-semibold ${colorSet.textColor} flex h-[38px] w-full items-center rounded-md border-2 px-2 text-left text-sm shadow-sm`}
        onClick={() => setSelectorVisibility(!isSelectorVisible)}
      >
        {colorSet.name ? colorSet.name : "Color"}
      </button>
      {isSelectorVisible ? renderMenu() : null}
    </div>
  );
};
