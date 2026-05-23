import React from "react";
import cn from "classnames";

export interface LegendProps extends React.HTMLProps<HTMLLegendElement> {}

export const Legend: React.FC<LegendProps> = (props) => {
  const { className, ...otherProps } = props;

  const containerClass = cn("text-base font-medium text-gray-900", className);

  return <legend className={containerClass} {...otherProps} />;
};
