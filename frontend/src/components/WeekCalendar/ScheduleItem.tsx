import { WeeklyCalendarEvent } from "./types";
import cn from "classnames";

interface Props extends React.HTMLProps<HTMLDivElement> {
  onItemClick?: (
    item: WeeklyCalendarEvent,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  item: WeeklyCalendarEvent;
  secondHeight: number;
  className?: string;
}

export const ScheduleItem: React.FC<Props> = (props) => {
  const { item, secondHeight, onItemClick, ...divProps } = props;
  const { startDate, stopDate } = item;

  const onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (props.onItemClick) {
      props.onItemClick(item, event);
    }
    event.stopPropagation();
  };

  // convert a time string (e.g.: 08:30) into the number of seconds since midnight
  const startEpoch = startDate.getHours() * 3600 + startDate.getMinutes() * 60;
  const stopEpoch = stopDate.getHours() * 3600 + stopDate.getMinutes() * 60;
  const itemLength = stopEpoch - startEpoch;

  const className = cn("absolute left-1 right-1 rounded-md", props.className);

  return (
    <div
      {...divProps}
      role="button"
      onClick={onClick}
      className={className}
      style={{
        top: startEpoch * secondHeight,
        height: itemLength * secondHeight,
      }}
    >
      {item.name}
    </div>
  );
};
