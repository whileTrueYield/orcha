import cn from "classnames";
import { map, range } from "lodash";

interface Props {
  rows: number;
  cols: number;
  isActive?: boolean;
  onClick: (rows: number, cols: number) => void;
}

export const WidgetSizeButton: React.FC<Props> = (props) => {
  const { rows, cols, isActive } = props;

  const buttonClass = cn("animate group rounded-xl border-4 p-1", {
    "border-brand-500 bg-brand-100": isActive,
    "border-transparent hover:bg-gray-100": !isActive,
  });

  const activeBoxClass = cn("animate rounded-lg border-4", {
    "border-brand-500 bg-brand-200": isActive,
    "border-brand-300 bg-brand-100 group-hover:border-brand-500 group-hover:bg-brand-200":
      !isActive,
  });

  const inactiveBoxClass = cn("animate rounded-lg border-4", {
    "border-gray-300 bg-gray-100": isActive,
    "border-gray-200 bg-gray-100 group-hover:border-gray-300": !isActive,
  });

  const renderActiveBlock = () => {
    const className = cn(activeBoxClass, {
      "row-span-2 h-16": rows === 2,
      "h-8": rows === 1,
      "col-span-2": cols === 2,
    });

    return <div className={className} />;
  };

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={() => props.onClick(rows, cols)}
    >
      <div className="grid w-24 grid-cols-2 grid-rows-2 gap-1">
        {renderActiveBlock()}
        {map(range(4 - rows * cols), (idx) => (
          <div key={idx} className={inactiveBoxClass} />
        ))}
      </div>
    </button>
  );
};
