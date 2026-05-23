import { Tag, TagProps } from "components/tags/Tag";
import React from "react";
import cn from "classnames";

interface Props extends TagProps {
  arr: any[];
}

export const ShowCount: React.FC<Props> = (props) => {
  const { arr, ...tagProps } = props;
  const count = arr ? arr.length : 0;

  if (count) {
    tagProps.className = cn(
      "bg-brand-200 text-brand-800 ml-2 align-bottom",
      tagProps.className
    );

    return (
      <Tag round {...tagProps}>
        {count}
      </Tag>
    );
  } else {
    return null;
  }
};
