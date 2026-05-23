import React from "react";
import cn from "classnames";

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  btnSize?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "icon";
  btnType?:
    | "danger"
    | "warning"
    | "primary"
    | "success"
    | "secondaryWhite"
    | "secondaryDanger"
    | "secondaryWarning"
    | "white"
    | "gray";
  fullInMobile?: boolean;
  block?: boolean;
  btnGroup?: "none" | "start" | "middle" | "end";
  btnClassName?: string;
  asElement?: (className: string) => React.ReactElement;
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  (props, ref) => {
    const {
      btnType,
      btnSize,
      block,
      fullInMobile,
      asElement,
      className,
      btnGroup,
      btnClassName,
      ...buttonProps
    } = props;

    const buttonGrouped = btnGroup || "none";
    const buttonType = btnType || "white";
    const buttonSize = btnSize || "medium";

    const hasShadow =
      ["white", "secondary", "primary", "danger", "success"].indexOf(
        buttonType
      ) > -1;

    const containerClass = cn(
      "inline-flex items-center h-fit group",
      {
        "block w-full": props.block,
        "block w-full sm:inline-block sm:w-auto":
          !props.block && props.fullInMobile,
        "shadow-sm": hasShadow,
        "rounded-md": buttonGrouped === "none",
        "rounded-l-md border-r-0 -ml-px h-full": buttonGrouped === "start",
        "rounded-r-md -ml-px h-full": buttonGrouped === "end",
        "border-r-0 -ml-px h-full": buttonGrouped === "middle",
      },
      className
    );

    const buttonClass = cn(
      "whitespace-nowrap inline-flex w-full items-center justify-center font-medium focus:outline-none transition ease-in-out duration-150",
      {
        "border border-brand-600 text-white bg-brand-600 hover:bg-brand-500 focus:border-brand-700 focus:ring-opacity-25 focus:ring-brand-400 focus:ring active:bg-brand-700":
          !props.disabled && buttonType === "primary",
        "border border-green-600 text-white bg-green-600 hover:bg-green-500 focus:border-green-700 focus:ring-opacity-25 focus:ring-green-400 focus:ring active:bg-green-700":
          !props.disabled && buttonType === "success",
        "border border-transparent text-gray-700 bg-gray-200 md:bg-transparent hover:bg-gray-200 focus:border-gray-300 focus:ring-opacity-25 focus:ring-brand-400 focus:border-brand-300 focus:ring active:bg-gray-200":
          !props.disabled && buttonType === "secondaryWhite",
        "border border-red-600 text-white bg-red-600 hover:bg-red-500 focus:ring focus:ring-opacity-25 focus:ring-red-400 focus:border-red-300 active:bg-red-600":
          !props.disabled && buttonType === "danger",
        "border border-orange-600 text-white bg-orange-600 hover:bg-orange-500 focus:ring focus:ring-opacity-25 focus:ring-orange-400 focus:border-orange-300 active:bg-orange-600":
          !props.disabled && buttonType === "warning",
        "border border-transparent text-red-700 bg-red-100 md:bg-transparent hover:bg-red-50 focus:ring-opacity-25 focus:ring-red-400 focus:border-red-300 focus:ring active:bg-red-200 hover:bg-red-100":
          !props.disabled && buttonType === "secondaryDanger",
        "border border-transparent text-orange-700 bg-orange-100 md:bg-transparent hover:bg-orange-50 focus:ring-opacity-25 focus:ring-orange-400 focus:border-orange-300 focus:ring active:bg-orange-200 hover:bg-orange-100":
          !props.disabled && buttonType === "secondaryWarning",
        "border border-gray-300 text-gray-700 bg-white hover:text-gray-500 focus:ring-opacity-25 focus:ring-brand-400 focus:border-brand-300 focus:ring active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150":
          !props.disabled && buttonType === "white",
        "border border-gray-300 text-gray-700 bg-gray-50 hover:text-gray-500 focus:ring-opacity-25 focus:ring-brand-400 focus:border-brand-300 focus:ring active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150":
          !props.disabled && buttonType === "gray",
        "border border-gray-300 text-gray-400 bg-gray-200 cursor-not-allowed":
          props.disabled,
        "px-2 py-1 text-xs": buttonSize === "xsmall",
        "px-3 py-1 text-sm": buttonSize === "small",
        "px-4 py-2 text-sm": buttonSize === "medium",
        "px-4 py-2 text-base": buttonSize === "large",
        "px-6 py-3 text-base": buttonSize === "xlarge",
        "p-1": buttonSize === "icon",
        "rounded-md": buttonGrouped === "none",
        "rounded-l-md border-r-0 focus:relative": buttonGrouped === "start",
        "rounded-r-md focus:relative": buttonGrouped === "end",
        "border-r-0 focus:relative": buttonGrouped === "middle",
      },
      btnClassName
    );

    if (asElement) {
      return (
        <span className={containerClass} children={asElement(buttonClass)} />
      );
    }

    return (
      <span className={containerClass}>
        <button className={buttonClass} {...buttonProps} ref={ref}>
          {props.children}
        </button>
      </span>
    );
  }
);
