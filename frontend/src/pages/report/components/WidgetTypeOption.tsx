import { RadioGroup } from "@headlessui/react";
import { ReportWidgetType } from "types/graphql";
import cn from "classnames";

interface Props {
  value: ReportWidgetType;
  src: string;
  alt: string;
}

export const WidgetTypeOption: React.FC<Props> = (props) => {
  const { value, src, alt } = props;

  return (
    <RadioGroup.Option
      value={value}
      className={({ checked, active }) =>
        cn(
          "relative flex cursor-pointer rounded-lg border-2 p-2 shadow-sm ring-offset-2 focus:outline-none",
          {
            "border-brand-500 bg-brand-100": checked,
            "border-gray-300 bg-white": !checked,
            "border-brand-500 ring-4 ring-brand-500 ring-opacity-30": active,
          }
        )
      }
    >
      <div className="m-1">
        <img src={src} className="h-16 w-16" alt={alt} />
      </div>
    </RadioGroup.Option>
  );
};
