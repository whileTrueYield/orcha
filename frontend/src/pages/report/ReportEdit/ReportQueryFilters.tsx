import { gql } from "@apollo/client";
import { RecordFilterAsTag } from "components/ListFilter/RecordFilterTag";
import { ValueFilterAsTag } from "components/ListFilter/ValueFilterTag";
import { FCWithFragments, ReportQueryListFilter } from "types";
import { ReportQuery } from "types/graphql";
import { toDateFilterElement, toRecordFilterElement } from "../helper";

interface Props {
  reportQuery: ReportQuery;
}

export const ReportQueryFilters: FCWithFragments<Props> = (props) => {
  const { reportQuery } = props;

  const filter: ReportQueryListFilter = {
    valueSets: {
      paths: [],
    },
    dates: {
      window: toDateFilterElement(reportQuery.fromDate, reportQuery.untilDate),
    },
    flags: {},
    recordSets: {
      products: reportQuery.byProducts.map(toRecordFilterElement),
      workflows: reportQuery.byWorkflows.map(toRecordFilterElement),
      authors: reportQuery.byAuthors.map(toRecordFilterElement),
      assignees: reportQuery.byAssignees.map(toRecordFilterElement),
      tags: reportQuery.byTags.map(toRecordFilterElement),
      tickets: reportQuery.byTickets.map(toRecordFilterElement),
    },
  };

  return (
    <>
      <RecordFilterAsTag<ReportQueryListFilter>
        filter={filter}
        domain="products"
        label="Product"
      />
      <RecordFilterAsTag<ReportQueryListFilter>
        filter={filter}
        domain="workflows"
        label="Workflow"
      />
      <RecordFilterAsTag<ReportQueryListFilter>
        filter={filter}
        domain="tickets"
        label="Tickets"
      />
      <RecordFilterAsTag<ReportQueryListFilter>
        filter={filter}
        domain="tags"
        label="Tag"
      />
      <ValueFilterAsTag<ReportQueryListFilter>
        filter={filter}
        domain="paths"
        label="Path"
      />
    </>
  );
};

ReportQueryFilters.fragments = {
  ReportQueryFiltersFragment: gql`
    fragment ReportQueryFiltersFragment on ReportQuery {
      id
      title
      fromDate
      untilDate
      granularity
      byProducts {
        id
        recordId
        label
      }
      byWorkflows {
        id
        recordId
        label
      }
      byAuthors {
        id
        recordId
        label
      }
      byAssignees {
        id
        recordId
        label
      }
      byTags {
        id
        recordId
        label
      }
      byTickets {
        id
        recordId
        label
      }
    }
  `,
};
