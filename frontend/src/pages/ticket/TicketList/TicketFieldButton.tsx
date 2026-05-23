import React, { useRef, useState } from "react";
import { Button } from "components/fields/Button";
import cn from "classnames";
import { startCase, without } from "lodash";
import { useOutsideClick } from "hooks/useOutsideClick";

interface Props {
  available: string[];
  selected: string[];
  onChange: (fields: string[]) => void;
  children?: React.ReactNode;
}

export const TicketFieldButton: React.FC<Props> = (props) => {
  const { children, available, selected } = props;
  const [show, setShow] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useOutsideClick(elementRef, () => setShow(false));

  const containerClass = cn(
    "absolute bg-white rounded-lg shadow-lg top-0 right-0 sm:right-auto sm:left-0 border mt-0.5 min-w-[16rem] p-1 z-10",
    {
      hidden: !show,
      block: show,
    }
  );

  const onClick = (fieldName: string) => {
    if (selected.indexOf(fieldName) > -1) {
      props.onChange(without(selected, fieldName));
    } else {
      props.onChange([...selected, fieldName]);
    }
  };

  return (
    <div ref={elementRef} className="flex-1">
      <Button type="button" fullInMobile onClick={() => setShow(!show)}>
        {children}
      </Button>
      <div className="relative">
        <div className={containerClass}>
          <ul>
            {available.map((fieldName) => (
              <li key={fieldName}>
                <label className="my-1 flex flex-1 flex-row items-center rounded-md p-2 text-gray-500 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 rounded text-brand-600 transition duration-150 ease-in-out focus:border-brand-500 focus:ring focus:ring-brand-400 focus:ring-opacity-50"
                    checked={selected.indexOf(fieldName) > -1}
                    onChange={() => onClick(fieldName)}
                  />
                  {startCase(fieldName)}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
