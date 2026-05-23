import { WeeklyCalendarItem } from "./types";
import { parseTime } from "../../utils/time";
import cn from "classnames";

interface ItemProps {
  onClick?: (
    item: WeeklyCalendarItem,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  item: WeeklyCalendarItem;
  secondHeight: number;
  className?: string;
}

export const ScheduleItem: React.FC<ItemProps> = (props) => {
  const { item, secondHeight } = props;

  const onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (props.onClick) {
      props.onClick(item, event);
    }
    event.stopPropagation();
  };

  // convert a time string (e.g.: 08:30) into the number of seconds since midnight
  const [startHour, startMinute] = parseTime(item.startTime);
  const [stopHour, stopMinute] = parseTime(item.stopTime);

  const startEpoch = startHour * 3600 + startMinute * 60;
  const itemLength = stopHour * 3600 + stopMinute * 60 - startEpoch;

  const className = cn(
    props.className,
    "absolute left-1 right-1 shadow rounded-md"
  );

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        top: startEpoch * secondHeight,
        height: itemLength * secondHeight,
      }}
    ></div>
  );
};
