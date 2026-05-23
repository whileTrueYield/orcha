import React from "react";
import cn from "classnames";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
  leftLabel?: string;
  checkedColor?: string;
  uncheckedColor?: string;
  small?: boolean;
}

export const ToggleButton: React.FC<Props> = (props) => {
  const { checked, onChange, className, label, leftLabel, small } = props;

  const checkedColor = props.checkedColor || "bg-brand-600";
  const uncheckedColor = props.uncheckedColor || "bg-gray-200";
  const containerClassname = cn(
    "relative inline-flex shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring focus:ring-brand-400",
    {
      ["toggle-checked " + checkedColor]: checked,
      ["toggle-unchecked " + uncheckedColor]: !checked,
      "h-5 w-8": small,
      "h-6 w-11 ": !small,
    }
  );

  const toggleClassName = cn(
    " inline-block rounded-full bg-white shadow transform transition ease-in-out duration-200",
    {
      "translate-x-5": checked && !small,
      "translate-x-3": checked && small,
      "translate-x-0": !checked,
      "h-4 w-4": small,
      "h-5 w-5": !small,
    }
  );

  const toggle = (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked="false"
      className={containerClassname}
    >
      <span aria-hidden="true" className={toggleClassName}></span>
    </button>
  );

  if (label || leftLabel) {
    const hasLeftAndRight = Boolean(label && leftLabel);
    const toggleContainerClass = cn("flex flex-row", className);

    const leftLabelClass = cn("block text-sm leading-5 font-medium", {
      "text-gray-700": hasLeftAndRight && !checked,
      "text-gray-400": hasLeftAndRight && checked,
      "text-gray-600": !hasLeftAndRight,
    });

    const rightLabelClass = cn("block text-sm leading-5 font-medium", {
      "text-gray-700": hasLeftAndRight && checked,
      "text-gray-400": hasLeftAndRight && !checked,
      "text-gray-600": !hasLeftAndRight,
    });

    return (
      <label className={toggleContainerClass}>
        {leftLabel && (
          <div className="mr-3 text-sm leading-5">
            <div className={leftLabelClass}>{leftLabel}</div>
          </div>
        )}
        <div className="flex h-5 items-center">{toggle}</div>
        {label && (
          <div className="ml-3 text-sm leading-5">
            <div className={rightLabelClass}>{label}</div>
          </div>
        )}
      </label>
    );
  }

  return <span className={className}>{toggle}</span>;
};
