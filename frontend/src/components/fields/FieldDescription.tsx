import React from "react";
import cn from "classnames";

export interface FieldDescriptionProps
  extends React.HTMLProps<HTMLParagraphElement> {}

export const FieldDescription: React.FC<FieldDescriptionProps> = (props) => {
  const { className, ...otherProps } = props;
  const containerClass = cn("text-sm text-gray-500", className);

  return <div role="alert" className={containerClass} {...otherProps} />;
};
