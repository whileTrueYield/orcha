import { CheckIcon, XIcon } from "@heroicons/react/solid";
import React, { Fragment } from "react";
import cn from "classnames";

export interface TicketStep {
  name: string;
  status: "completed" | "current" | "upcoming" | "succeeded" | "failed";
}

interface Props {
  steps: TicketStep[];
}

export const TicketStageProgress: React.FC<Props> = (props) => {
  const { steps } = props;

  const renderStepIcon = (step: TicketStep, key?: string) => {
    switch (step.status) {
      case "completed":
        return (
          <div
            key={key}
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-600"
          >
            <CheckIcon className="h-4 w-4 text-white" aria-hidden="true" />
            <span className="sr-only">{step.name}</span>
          </div>
        );
      case "current":
        return (
          <div
            key={key}
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 border-brand-600 bg-white"
            aria-current="step"
          >
            <span
              className="h-2.5 w-2.5 rounded-full bg-brand-600"
              aria-hidden="true"
            />
            <span className="sr-only">{step.name}</span>
          </div>
        );
      case "succeeded":
        return (
          <div
            key={key}
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-green-600"
          >
            <CheckIcon className="h-4 w-4 text-white" aria-hidden="true" />
            <span className="sr-only">{step.name}</span>
          </div>
        );
      case "failed":
        return (
          <div
            key={key}
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-orange-600"
          >
            <XIcon className="h-4 w-4 text-white" aria-hidden="true" />
            <span className="sr-only">{step.name}</span>
          </div>
        );
      default:
        return (
          <div
            key={key}
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 border-gray-300 bg-white"
          >
            <span className="sr-only">{step.name}</span>
          </div>
        );
    }
  };

  const elts = steps.map((step, index) => {
    if (step !== steps[0]) {
      const className = cn("h-0.5 w-full", {
        "bg-gray-300": step.status === "upcoming",
        "bg-brand-500":
          step.status === "completed" || step.status === "current",
        "bg-gradient-to-r from-brand-500 to-green-500":
          step.status === "succeeded",
        "bg-gradient-to-r from-brand-500 to-orange-500 via-yellow-500":
          step.status === "failed",
      });
      return (
        <Fragment key={`step-${index}`}>
          <div className={className} />
          {renderStepIcon(step)}
        </Fragment>
      );
    }
    return renderStepIcon(step, `step-${index}`);
  });

  return (
    <div aria-label="Progress">
      <div className="mx-auto flex max-w-[16rem] flex-row items-center">
        {elts}
      </div>
    </div>
  );
};
