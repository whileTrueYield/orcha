import React from "react";
import cn from "classnames";
import { ModelStage } from "types/graphql";
import { Tag } from "./Tag";

interface Props {
  stage: ModelStage;
  className?: string;
  large?: boolean;
}

export const StageBadge: React.FC<Props> = (props) => {
  const { stage, className, large } = props;

  const stageClass = cn(className, {
    "bg-green-100 text-green-800": stage === ModelStage.Published,
    "bg-gray-200 text-gray-800": stage === ModelStage.Draft,
    "bg-orange-100 text-orange-800": stage === ModelStage.Archived,
    "bg-red-600 text-red-50": stage === ModelStage.Deleted,
  });

  return (
    <Tag className={stageClass} large={large}>
      {stage}
    </Tag>
  );
};
