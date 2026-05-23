import React, { useCallback, useEffect, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import cn from "classnames";
import { Link } from "react-router-dom";
import { get, map, reject } from "lodash";

interface PopMenuOptionButton {
  type: "button";
  onClick: () => void;
  label: string | React.ReactElement;
  disabled?: boolean;
  danger?: boolean;
  success?: boolean;
  icon?: (className: string) => React.ReactNode;
  hidden?: boolean;
}

interface PopMenuOptionSubmitButton {
  type: "submit";
  label: string;
  disabled?: boolean;
  danger?: boolean;
  success?: boolean;
  icon?: (className: string) => React.ReactNode;
  hidden?: boolean;
}

interface PopMenuOptionLink {
  type: "link";
  to: string;
  label: string;
  icon?: (className: string) => React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  success?: boolean;
  target?: string;
  hidden?: boolean;
}

interface PopMenuOptionInfo {
  type: "info";
  component: React.ReactNode;
  hidden?: boolean;
}

interface PopMenuOptionSeparator {
  type: "separator";
  hidden?: boolean;
}

export type PopMenuOption =
  | PopMenuOptionSubmitButton
  | PopMenuOptionButton
  | PopMenuOptionLink
  | PopMenuOptionInfo
  | PopMenuOptionSeparator;

interface Props {
  options: PopMenuOption[];
  className?: string;
  children: React.ReactNode;
  size?: "xlarge" | "large" | "medium" | "small";
  direction?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "auto";
}

export const PopMenu: React.FC<Props> = (props) => {
  const [buttonHeight, setButtonHeight] = useState(0);
  const triggerButtonRef = useRef<HTMLDivElement>(null);

  const originalDirection = props.direction || "auto";
  const size = props.size || "medium";
  const [direction, setDirection] = useState(originalDirection);

  // We want to recompute the placement of the floating container
  // of the menu every time we display it.
  const computePlacement = useCallback(() => {
    if (triggerButtonRef.current && originalDirection === "auto") {
      // We'll divide the screen in 4 quarters, each defining
      // the direction of the floating container based on which
      // quarter the trigger button is positioned
      //
      //     top-left   |  top-right
      //   ----------------------------
      //    bottom-left | bottom-right

      const { x, y } = triggerButtonRef.current.getBoundingClientRect();
      const { clientWidth, clientHeight } = document.documentElement;

      const horizontal = x > clientWidth / 2 ? "left" : "right";
      const vertical = y > clientHeight / 2 ? "top" : "bottom";

      setDirection(`${vertical}-${horizontal}` as any);
    }
  }, [triggerButtonRef, originalDirection]);

  useEffect(() => {
    if (triggerButtonRef.current) {
      setButtonHeight(triggerButtonRef.current.clientHeight);
      computePlacement();
    }
  }, [setButtonHeight, triggerButtonRef, computePlacement]);

  const popClassName = cn("absolute rounded-md shadow-lg", {
    "left-0 origin-top-right mb-1": direction === "top-right",
    "right-0 origin-top-left mb-1": direction === "top-left",
    "left-0 origin-top-right mt-1": direction === "bottom-right",
    "right-0 origin-top-left mt-1": direction === "bottom-left",
    "w-40": size === "medium",
    "w-32": size === "small",
    "w-56": size === "large",
    "w-64": size === "xlarge",
  });

  const renderSeparator = (option: PopMenuOptionSeparator, key: string) => (
    <div className="bg-white py-1" key={key}>
      <div className="border-t border-gray-200"></div>
    </div>
  );

  const renderLink = (option: PopMenuOptionLink, key: string) => {
    return (
      <Menu.Item key={key} disabled={option.disabled}>
        {({ active, disabled }) => {
          const linkClassName = cn(
            "block px-4 py-2 text-sm leading-5 focus:outline-none",
            {
              "text-gray-400 bg-gray-50 cursor-not-allowed": disabled,
              "bg-brand-600 text-white": active && !disabled,
              "bg-white text-gray-700": !active && !disabled,
              "cursor-pointer": !disabled,
            }
          );

          const iconClassName = cn("w-5 h-5 mr-3 inline-block", {
            // regular
            "text-brand-100":
              active && !disabled && !option.danger && !option.success,
            "text-gray-500":
              !active && !disabled && !option.danger && !option.success,

            // danger
            "text-red-100 ": active && !disabled && option.danger,
            "text-red-500": !active && !disabled && option.danger,

            // success
            "text-green-100 ": active && !disabled && option.success,
            "text-green-500": !active && !disabled && option.success,
          });

          return (
            <Link
              to={option.to}
              className={linkClassName}
              role="menuitem"
              target={option.target}
            >
              {option.icon ? option.icon(iconClassName) : null}
              {option.label}
            </Link>
          );
        }}
      </Menu.Item>
    );
  };

  const renderButton = (
    option: PopMenuOptionButton | PopMenuOptionSubmitButton,
    key: string
  ) => {
    return (
      <Menu.Item key={key} disabled={option.disabled}>
        {({ active, disabled }) => {
          const buttonClassName = cn(
            "w-full px-4 py-2 text-sm leading-5 focus:outline-none cursor-default flex flex-row truncate",
            {
              "text-gray-400 bg-gray-50 cursor-not-allowed": disabled,
              "cursor-pointer": !disabled,

              // regular
              "bg-sky-600 text-white":
                active && !disabled && !option.danger && !option.success,
              "bg-white text-gray-700":
                !active && !disabled && !option.danger && !option.success,

              // success
              "bg-green-600 text-white": active && !disabled && option.success,
              "bg-white text-green-700": !active && !disabled && option.success,

              // danger
              "bg-red-600 text-white": active && !disabled && option.danger,
              "bg-white text-red-700": !active && !disabled && option.danger,
            }
          );

          const iconClassName = cn("w-5 h-5 mr-3", {
            // regular
            "text-brand-100":
              active && !disabled && !option.danger && !option.success,
            "text-gray-500":
              !active && !disabled && !option.danger && !option.success,

            // danger
            "text-red-100 ": active && !disabled && option.danger,
            "text-red-500": !active && !disabled && option.danger,

            // success
            "text-green-100 ": active && !disabled && option.success,
            "text-green-500": !active && !disabled && option.success,
          });

          return (
            <button
              key={key}
              onClick={get(option, "onClick")}
              className={buttonClassName}
              role="menuitem"
              type={option.type}
            >
              {option.icon ? option.icon(iconClassName) : null}
              <span className="block w-full truncate text-left">
                {option.label}
              </span>
            </button>
          );
        }}
      </Menu.Item>
    );
  };

  const renderInfo = (option: PopMenuOptionInfo, key: string) => (
    <div key={key}>{option.component}</div>
  );

  const renderItem = (option: PopMenuOption, index: number) => {
    switch (option.type) {
      case "submit":
      case "button":
        return renderButton(option, String(index));
      case "info":
        return renderInfo(option, String(index));
      case "link":
        return renderLink(option, String(index));
      case "separator":
        return renderSeparator(option, String(index));

      default:
        console.warn(
          `Could not display one of the menu item, unknown type {option.type}`,
          option
        );
        return null;
    }
  };

  const style = /^top-/.test(direction) ? { bottom: buttonHeight + "px" } : {};

  return (
    <div
      className={props.className}
      ref={triggerButtonRef}
      onClick={computePlacement}
    >
      <Menu>
        {({ open }: { open: boolean }) => (
          <>
            {props.children}
            <div
              data-e2e="pop-menu"
              className={`relative ${open ? "z-40" : ""}`}
            >
              <Transition
                style={style}
                className={popClassName}
                show={open}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  static
                  className="overflow-hidden rounded-md shadow outline-none"
                >
                  {map(reject(props.options, { hidden: true }), renderItem)}
                </Menu.Items>
              </Transition>
            </div>
          </>
        )}
      </Menu>
    </div>
  );
};
