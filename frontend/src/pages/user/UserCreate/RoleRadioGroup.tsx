import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/solid";
import React from "react";
import cn from "classnames";
import { RoleType } from "types/graphql";

interface Props {
  title: string;
  description: string;
  value: RoleType;
  danger?: boolean;
  warning?: boolean;
}

export const RoleRadioGroup: React.FC<Props> = (props) => {
  const { value, title, description, danger, warning } = props;

  return (
    <RadioGroup.Option
      value={value}
      className={({ checked, focus }) =>
        cn(
          "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none",
          {
            "border-transparent bg-orange-50": checked && danger,
            "border-transparent bg-yellow-50": checked && warning,
            "border-transparent": checked && !danger && !warning,
            "border-gray-300": !checked,
            "border-orange-500 ring-2 ring-orange-500": focus && danger,
            "border-yellow-500 ring-2 ring-yellow-500": focus && warning,
            "border-brand-500 ring-2 ring-brand-500":
              focus && !danger && !warning,
          }
        )
      }
    >
      {({ checked, focus }) => (
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
          <CheckCircleIcon
            className={cn("h-5 w-5 text-brand-600", { invisible: !checked })}
            aria-hidden="true"
          />
          <div
            className={cn("pointer-events-none absolute -inset-px rounded-lg", {
              border: focus,
              "border-2": !focus,
              "border-orange-500": checked && danger,
              "border-yellow-500": checked && warning,
              "border-brand-500": checked && !danger && !warning,
              "border-transparent": !checked,
            })}
            aria-hidden="true"
          />
        </>
      )}
    </RadioGroup.Option>
  );
};
