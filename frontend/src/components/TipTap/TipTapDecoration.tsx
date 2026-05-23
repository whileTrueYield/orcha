import { ArrowRightIcon } from "@heroicons/react/solid";
import { PhotoAddIcon } from "components/assets/PhotoAddIcon";

interface Props extends React.PropsWithChildren {
  className?: string;
}

export const TipTapDecoration: React.FC<Props> = (props) => {
  const { className } = props;

  return (
    <div className={className}>
      {props.children}
      <div className="flex items-center justify-between rounded-b-md border border-t-0 border-gray-300 bg-gray-100 p-2 text-xs text-gray-500">
        <div className="flex flex-row items-center space-x-4">
          <span className="whitespace-nowrap">
            <span className="font-bold">@</span> people
          </span>
          <span className="whitespace-nowrap">
            <span className="font-bold">#</span> ticket
          </span>
          <span className="whitespace-nowrap">
            <span className="font-bold">:</span>100
            <ArrowRightIcon className="mx-1 inline-block h-3 w-3 align-middle text-gray-400" />
            💯
          </span>
          <span className="hidden whitespace-nowrap sm:block">
            <PhotoAddIcon className="mr-1 inline-block h-4 w-4 align-bottom" />
            Drag-n-Drop
          </span>
        </div>
      </div>
    </div>
  );
};
