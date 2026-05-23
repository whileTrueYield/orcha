import { XIcon, TagIcon, PencilIcon } from "@heroicons/react/solid";
import { clearSelection } from "actions";
import { useSelector } from "react-redux";
import { getSelectedItems } from "reducers/selector";
import { useAppDispatch } from "store";
import { plural } from "utils/string";
import cn from "classnames";
import { useState } from "react";
import { TicketBatchEditTagsModal } from "./TicketBatchEditTagsModal";
import { filter, map } from "lodash";
import { TicketBatchEditTicketsModal } from "./TicketBatchEditTicketsModal";

interface Props {
  domain: string;
  className?: string;
  onClear?: () => void;
}

export const TicketBatchEditOverlay: React.FC<Props> = (props) => {
  const { domain } = props;
  const [showTagsEdit, setShowTagsEdit] = useState(false);
  const [showTicketsEdit, setShowTicketsEdit] = useState(false);
  const selectedItems = useSelector(getSelectedItems(domain));
  const dispatch = useAppDispatch();

  const onClearSelection = () => {
    dispatch(clearSelection(domain));
    if (props.onClear) {
      props.onClear();
    }
  };

  const ticketIds = map(
    filter(selectedItems, (item) => /^ticket:/.test(item)),
    (item): number => parseInt(item.split(":")[1])
  );

  return (
    <>
      <TicketBatchEditTagsModal
        visible={showTagsEdit}
        ticketIds={ticketIds}
        onClose={() => setShowTagsEdit(false)}
      />
      <TicketBatchEditTicketsModal
        visible={showTicketsEdit}
        ticketIds={ticketIds}
        onClose={() => setShowTicketsEdit(false)}
      />
      <div
        className={cn(
          "flex flex-row items-center space-x-4 rounded-full bg-gray-800 py-2 px-3 text-gray-100",
          props.className
        )}
      >
        <button
          type="button"
          title="Clear selection"
          className="rounded-full p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
          onClick={onClearSelection}
        >
          <XIcon className="h-4 w-4" />
        </button>
        <div className="hidden text-sm sm:block">
          {plural("{} selected item", "{} selected items", selectedItems)}
        </div>
        <button
          type="button"
          title={ticketIds.length === 0 ? "No ticket selected" : "Edit Tags"}
          className="flex flex-row items-center rounded-full bg-sky-600 py-1 px-2 text-sm font-medium text-sky-50 hover:bg-sky-500 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
          onClick={() => setShowTagsEdit(true)}
          disabled={ticketIds.length === 0}
        >
          <TagIcon className="mr-1 h-4 w-4" />
          <span>Edit tags</span>
        </button>
        <button
          type="button"
          title={
            ticketIds.length === 0
              ? "No ticket selected"
              : "Edit ticket attributes"
          }
          className="flex flex-row items-center rounded-full bg-sky-600 py-1 px-2 text-sm font-medium text-sky-50 hover:bg-sky-500 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
          onClick={() => setShowTicketsEdit(true)}
          disabled={ticketIds.length === 0}
        >
          <PencilIcon className="mr-1 h-4 w-4" />
          <span>Edit tickets</span>
        </button>
      </div>
    </>
  );
};
