import React from "react";
import cn from "classnames";

interface Props {
  todo: number;
  done: number;
  className?: string;
}

export const ProgressBar: React.FC<Props> = (props) => {
  const { todo, done, className } = props;
  const total = todo + done;
  const value = total > 0 ? done / total : 0;
  const percent = Math.floor(value * 100);

  const fontColor = value === 1 ? "text-green-100" : "text-brand-100";
  const bgColor = value === 1 ? "bg-green-300" : "bg-brand-300";

  const classPercent = cn(
    "absolute tracking-wider font-semibold font-title flex items-center justify-center transition-all duration-1000",
    {
      "inset-0 text-gray-500": percent < 30,
      [`left-0 top-0 bottom-0 ${fontColor}`]: percent >= 30,
    }
  );

  return (
    <div className={className}>
      <div className="relative h-8 overflow-hidden rounded-lg border-2 border-white bg-gray-100 shadow">
        <div
          className={`absolute left-0 top-0 bottom-0 ${bgColor} flex items-center justify-center transition-all duration-1000`}
          style={{ width: `${percent}%` }}
        ></div>
        <div
          className={classPercent}
          style={{ width: `${percent < 30 ? 100 : percent}%` }}
        >
          {percent}%
        </div>
      </div>
    </div>
  );
};
