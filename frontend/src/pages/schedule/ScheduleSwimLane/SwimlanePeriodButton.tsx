import { addDays, differenceInDays, subDays } from "date-fns";
import cn from "classnames";
import { useState } from "react";

interface Props {
  onLowerLimitChange: (date: Date) => void;
  onUpperLimitChange: (date: Date) => void;
  lowerLimit: Date;
  upperLimit: Date;
}

export const SwimlanePeriodButton: React.FC<Props> = (props) => {
  const { onLowerLimitChange, onUpperLimitChange, lowerLimit, upperLimit } =
    props;

  const [hoverDays, setHoverDays] = useState(0);

  const lowerDays = differenceInDays(new Date(), lowerLimit);
  const upperDays = differenceInDays(upperLimit, new Date()) + 1;

  const getPastPeriodClassName = (days: number, className?: string) => {
    const isCurrent = lowerDays === days;
    const isActive = hoverDays < 0 ? days <= -hoverDays : days <= lowerDays;

    return cn(
      "border text-sm px-2 py-1.5 hover:z-10 hover:font-semibold transition-all",
      className,
      {
        "relative bg-sky-100 text-sky-700 border-sky-300 hover:text-sky-800":
          isActive,
        "bg-gray-50 text-gray-500": !isActive,
        "font-normal text-opacity-50": !isCurrent && hoverDays >= 0,
        "font-semibold": isCurrent && hoverDays >= 0,
      }
    );
  };

  const getFuturePeriodClassName = (days: number, className?: string) => {
    const isCurrent = upperDays === days;
    const isActive = hoverDays > 0 ? days <= hoverDays : days <= upperDays;

    return cn(
      "border text-sm px-2 py-1.5 hover:z-10 hover:font-semibold transition-all",
      className,
      {
        "relative bg-green-100 text-green-700 border-green-300 hover:text-green-800":
          isActive,
        "bg-gray-50 text-gray-500 hover:bg-green-100 hover:text-green-700":
          !isActive,
        "font-normal text-opacity-50": !isCurrent && hoverDays <= 0,
        "font-semibold": isCurrent && hoverDays <= 0,
      }
    );
  };

  return (
    <div className="mx-auto">
      <div className="flex flex-row" onMouseLeave={() => setHoverDays(0)}>
        <button
          type="button"
          onClick={() => onLowerLimitChange(subDays(new Date(), 14))}
          className={getPastPeriodClassName(14, "-mr-px rounded-l-full pl-3")}
          onMouseEnter={() => setHoverDays(-14)}
        >
          -2 weeks
        </button>
        <button
          type="button"
          onClick={() => onLowerLimitChange(subDays(new Date(), 7))}
          className={getPastPeriodClassName(7, "-mr-px")}
          onMouseEnter={() => setHoverDays(-7)}
        >
          -1 week
        </button>
        <button
          type="button"
          onClick={() => onLowerLimitChange(subDays(new Date(), 2))}
          className={getPastPeriodClassName(2, "-mr-px")}
          onMouseEnter={() => setHoverDays(-2)}
        >
          -2 days
        </button>
        <button
          type="button"
          onClick={() => onLowerLimitChange(subDays(new Date(), 1))}
          className={getPastPeriodClassName(1, "-mr-px")}
          onMouseEnter={() => setHoverDays(-1)}
        >
          -1 day
        </button>
        <button
          type="button"
          onClick={() => {
            onLowerLimitChange(subDays(new Date(), 7));
            onUpperLimitChange(addDays(new Date(), 7));
          }}
          onMouseEnter={() => setHoverDays(0)}
          className="border border-gray-300 bg-white py-1 px-2 text-sm font-medium text-gray-500 hover:z-10 hover:border-gray-400 hover:text-gray-700"
        >
          Reset Period
        </button>
        <button
          type="button"
          onClick={() => onUpperLimitChange(addDays(new Date(), 1))}
          className={getFuturePeriodClassName(1, "-ml-px")}
          onMouseEnter={() => setHoverDays(1)}
        >
          +1 day
        </button>
        <button
          type="button"
          onClick={() => onUpperLimitChange(addDays(new Date(), 2))}
          className={getFuturePeriodClassName(2, "-ml-px")}
          onMouseEnter={() => setHoverDays(2)}
        >
          +2 days
        </button>
        <button
          type="button"
          onClick={() => onUpperLimitChange(addDays(new Date(), 7))}
          className={getFuturePeriodClassName(7, "-ml-px")}
          onMouseEnter={() => setHoverDays(7)}
        >
          +1 week
        </button>
        <button
          type="button"
          onClick={() => onUpperLimitChange(addDays(new Date(), 14))}
          className={getFuturePeriodClassName(14, "-ml-px rounded-r-full pr-3")}
          onMouseEnter={() => setHoverDays(14)}
        >
          +2 weeks
        </button>
      </div>
    </div>
  );
};
