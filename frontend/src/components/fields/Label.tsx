import React, { ReactNode } from "react";
import cn from "classnames";

export interface LabelProps extends React.HTMLProps<HTMLLabelElement> {
  optional?: boolean;
  required?: boolean;
  readOnly?: boolean;
  additionalInfo?: ReactNode;
}

export const Label: React.FC<LabelProps> = (props) => {
  const {
    className,
    optional,
    readOnly,
    required,
    additionalInfo,
    children,
    ...otherProps
  } = props;

  const containerClass = cn("flex justify-between", className);

  const renderAdditionalInfo = () => {
    if (additionalInfo) {
      return (
        <span className="text-sm leading-5 text-gray-500">
          {additionalInfo}
        </span>
      );
    } else if (optional) {
      return <span className="text-sm leading-5 text-gray-500">Optional</span>;
    } else if (readOnly) {
      return <span className="text-sm leading-5 text-gray-500">read-only</span>;
    }
    return null;
  };

  return (
    <div className={containerClass}>
      <label
        className="block text-sm font-medium leading-5 text-gray-700"
        {...otherProps}
      >
        {children}
        {required ? <sup className="text-red-600">*</sup> : null}
      </label>
      {renderAdditionalInfo()}
    </div>
  );
};
