import React from "react";
import { truncate } from "lodash";
import { Link } from "react-router-dom";
import { Tag } from "components/tags/Tag";
import { Workflow, ModelStage } from "types/graphql";
import cn from "classnames";
import { getColor } from "config";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import { HoverTooltip } from "components/help/Tooltip";

interface Props {
  workflow: Workflow;
  index: number;
  url: string;
}

export const WorkflowListRow: React.FC<Props> = (props) => {
  const description = truncate(props.workflow.description!, {
    length: 120,
    separator: " ",
  });

  const colorSet = getColor(props.workflow.color);

  const stageClass = cn("mx-2", {
    "bg-green-100 text-green-800":
      props.workflow.stage === ModelStage.Published,
    "bg-gray-200 text-gray-800": props.workflow.stage === ModelStage.Draft,
    "bg-orange-100 text-orange-800":
      props.workflow.stage === ModelStage.Archived,
  });

  return (
    <tr
      key={`table-row-${props.workflow.id}`}
      className={props.index % 2 ? "bg-gray-50" : "bg-white"}
    >
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium leading-5 text-gray-900">
        <Link
          to={props.url}
          className="flex flex-row items-center text-brand-600 hover:text-brand-900"
        >
          <div
            className={`h-4 w-4 rounded-full shadow ${colorSet.bgColor} border-2 ${colorSet.borderColor} mr-2`}
          />
          {props.workflow.name}
        </Link>
      </td>
      <td className="hidden max-w-xs truncate px-6 py-4 text-sm leading-5 text-gray-500 lg:table-cell">
        {description}
      </td>

      <td className="whitespace-nowrap px-6 py-4 leading-5 text-gray-500">
        <Tag className={stageClass}>{props.workflow.stage.toUpperCase()}</Tag>
      </td>

      <td className="hidden whitespace-nowrap px-6 py-4 leading-5 text-gray-500 lg:table-cell">
        {props.workflow.isDefaultWorkflow ? (
          <HoverTooltip tooltip="This workflow is available to all products">
            <div className="inline-flex flex-row items-center justify-center space-x-2 rounded-lg bg-brand-100 px-3 py-1 text-sm font-medium text-brand-600">
              <EyeIcon className="h-5 w-5 text-brand-500" />
              <span>Global</span>
            </div>
          </HoverTooltip>
        ) : (
          <HoverTooltip tooltip="This workflow is only available to products that have chosen it">
            <div className="inline-flex flex-row items-center justify-center space-x-2 rounded-lg bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">
              <EyeOffIcon className="h-5 w-5 text-pink-500" />
              <span>Restricted</span>
            </div>
          </HoverTooltip>
        )}
      </td>
    </tr>
  );
};
