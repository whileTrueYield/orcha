import React from "react";
import { TicketListFilter } from "types";
import cn from "classnames";
import { ToggleFilterAsTag } from "components/ListFilter/ToggleFilterTag";
import { RecordFilterAsTag } from "components/ListFilter/RecordFilterTag";
import { ValueFilterAsTag } from "components/ListFilter/ValueFilterTag";
import { DateFilterAsTag } from "components/ListFilter/DateFilterTag";

interface Props {
  onChange: (filter: TicketListFilter) => void;
  filter: TicketListFilter;
  className?: string;
}

export const TicketFilterTags: React.FC<Props> = (props) => {
  const { filter, onChange } = props;
  const className = cn("py-2 px-4 sm:px-0", props.className);

  return (
    <div className={className}>
      <ToggleFilterAsTag<TicketListFilter>
        filter={filter}
        onChange={onChange}
        domain="isActive"
      />
      <DateFilterAsTag<TicketListFilter>
        filter={filter}
        onChange={onChange}
        domain="createdAt"
        label="Creation Date"
      />
      <ValueFilterAsTag<TicketListFilter>
        filter={filter}
        onChange={onChange}
        domain="statuses"
        label="Status"
      />
      <ValueFilterAsTag<TicketListFilter>
        filter={filter}
        onChange={onChange}
        domain="stages"
        label="Lifecycle"
      />
      <RecordFilterAsTag<TicketListFilter>
        filter={filter}
        onChange={onChange}
        domain="workflows"
        label="Workflow"
      />
      <RecordFilterAsTag<TicketListFilter>
        filter={filter}
        onChange={onChange}
        domain="authors"
        label="Author"
      />
      <RecordFilterAsTag<TicketListFilter>
        filter={filter}
        onChange={onChange}
        domain="products"
        label="Product"
      />
      <RecordFilterAsTag<TicketListFilter>
        filter={filter}
        onChange={onChange}
        domain="assignees"
        label="Assignee"
      />
      <RecordFilterAsTag<TicketListFilter>
        filter={filter}
        onChange={onChange}
        domain="features"
        label="Feature"
      />
      <RecordFilterAsTag<TicketListFilter>
        filter={filter}
        onChange={onChange}
        domain="tags"
        label="Tag"
      />
    </div>
  );
};
