import React, { useRef, useState } from "react";
import { Button } from "components/fields/Button";
import { FilterIcon } from "@heroicons/react/solid";
import { ProductFilter } from "components/ListFilter/ProductFilter";
import { WorkflowFilter } from "components/ListFilter/WorkflowFilter";
import { ToggleFilter } from "components/ListFilter/ToggleFilter";
import { RoleFilter } from "components/ListFilter/RoleFilter";
import { SelectFilter } from "components/ListFilter/SelectFilter";
import { ModelStage, TicketStatus } from "types/graphql";
import { TicketListFilter } from "types/filter";
import { CalendarFilter } from "components/ListFilter/CalendarFilter";
import { useOutsideClick } from "hooks/useOutsideClick";
import { XIcon } from "@heroicons/react/solid";
import { TagFilter } from "components/ListFilter/TagFilter";
import { useKeyup } from "hooks/useKeyup";

interface Props {
  onChange: (filter: TicketListFilter) => void;
  onClear?: () => void;
  filter: TicketListFilter;
  className?: string;
}

export function TicketFilterButton(props: React.PropsWithChildren<Props>) {
  const [isOpen, setOpen] = useState(false);
  const { filter, onChange, onClear } = props;
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, () => setOpen(false));
  useKeyup("Escape", () => setOpen(false));

  return (
    <div className="relative flex-1 sm:flex-none">
      <Button
        type="button"
        btnType="white"
        onClick={() => !isOpen && setOpen(true)}
        fullInMobile
      >
        <FilterIcon className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" />
        Filter
      </Button>

      <div
        className={`fixed inset-2 z-20 rounded-lg sm:relative sm:inset-0 sm:z-10 ${
          isOpen ? "" : "hidden"
        }`}
      >
        <div
          className="absolute inset-0 overflow-y-auto rounded-lg sm:inset-auto sm:overflow-y-visible"
          ref={wrapperRef}
          style={{ minWidth: "18rem" }}
        >
          <div className="mt-1 rounded-lg border bg-white p-2 shadow-lg sm:border-none">
            <div className=" fong-md flex flex-1 flex-row items-center justify-between border-b py-2 px-2">
              <div className="hidden  font-semibold text-gray-500 sm:flex">
                Filters
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex  flex-row items-center font-semibold text-gray-500 sm:hidden"
              >
                <XIcon className="mr-1 h-5 w-5 text-gray-600" />
                Close
              </button>
              {onClear ? (
                <Button
                  type="button"
                  btnType="secondaryDanger"
                  btnSize="small"
                  onClick={() => {
                    onClear();
                    setOpen(false);
                  }}
                >
                  clear filters
                </Button>
              ) : null}
            </div>

            <ToggleFilter
              filter={filter}
              onFilterChange={onChange}
              label="Active"
              domain="isActive"
            />
            <ProductFilter filter={filter} onFilterChange={onChange} />
            <CalendarFilter
              filter={filter}
              onFilterChange={onChange}
              label="Creation Date"
              domain="createdAt"
            />
            <WorkflowFilter filter={filter} onFilterChange={onChange} />
            <RoleFilter
              filter={filter}
              onFilterChange={onChange}
              label="Assignee"
              domain="assignees"
            />
            <RoleFilter
              filter={filter}
              onFilterChange={onChange}
              label="Author"
              domain="authors"
            />
            <TagFilter filter={filter} onFilterChange={onChange} />
            <SelectFilter<TicketListFilter>
              filter={filter}
              onFilterChange={onChange}
              label="Status"
              domain="statuses"
              placeholder="Filter by status..."
              options={[
                { label: "Unscheduled", value: TicketStatus.Unscheduled },
                { label: "Scheduled", value: TicketStatus.Scheduled },
                { label: "Cancelled", value: TicketStatus.Cancelled },
                { label: "Done", value: TicketStatus.Done },
              ]}
            />
            <SelectFilter<TicketListFilter>
              filter={filter}
              onFilterChange={onChange}
              label="Lifecycle"
              domain="stages"
              placeholder="Filter by state..."
              options={[
                { label: "Draft", value: ModelStage.Draft },
                { label: "Published", value: ModelStage.Published },
                { label: "Archived", value: ModelStage.Archived },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
