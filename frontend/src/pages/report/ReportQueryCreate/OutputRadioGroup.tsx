import { RadioGroup } from "@headlessui/react";
import React, { ReactElement } from "react";
import cn from "classnames";
import { ReportWidgetType } from "types/graphql";

interface Props {
  title: string;
  description: string;
  value: ReportWidgetType;
  icon: (props: React.SVGProps<SVGSVGElement>) => ReactElement;
}

export const OutputRadioGroup: React.FC<Props> = (props) => {
  const { value, title, description } = props;
  const Icon = props.icon;

  return (
    <RadioGroup.Option
      value={value}
      className={({ checked, active }) =>
        cn(
          "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none",
          {
            "border-transparent": checked,
            "border-gray-300": !checked,
            "border-brand-500 bg-brand-50 ring-2 ring-brand-500": active,
          }
        )
      }
    >
      {({ checked, active }) => (
        <>
          <div className="flex flex-1">
            <div className="flex flex-col">
              <RadioGroup.Label
                as="span"
                className="block text-sm font-medium text-gray-900"
              >
                {title}
              </RadioGroup.Label>
              <RadioGroup.Description
                as="span"
                className="mt-1 flex items-center text-sm text-gray-500"
              >
                {description}
              </RadioGroup.Description>
            </div>
          </div>
          {/* <TicketIcon className="h-6 w-6 text-gray-400" /> */}

          <Icon
            className={cn("h-6 w-6", {
              "text-brand-600": checked,
              "text-gray-300": !checked,
            })}
            aria-hidden="true"
          />
          <div
            className={cn("pointer-events-none absolute -inset-px rounded-lg", {
              border: active,
              "border-2": !active,
              "border-brand-500": checked,
              "border-transparent": !checked,
            })}
            aria-hidden="true"
          />
        </>
      )}
    </RadioGroup.Option>
  );
};
