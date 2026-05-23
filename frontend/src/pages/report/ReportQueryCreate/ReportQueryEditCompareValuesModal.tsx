import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import {
  reportAggregateFields,
  reportGroupByStates,
  reportQueryFormFields,
} from "../formFields";
import { gql } from "@apollo/client";
import {
  ReportQuery,
  ReportDateGranularity,
  MutationUpdateReportQueryArgs,
} from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { DatabaseIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";
import { ReportQueryInput } from "./ReportQueryInput";
import { FCWithFragments, ReportQueryListFilter } from "types";
import { FormSelectGroup } from "components/fields/Select";
import { capitalize, map, startCase } from "lodash";
import { FormToggleGroup } from "components/fields/Toggle";
import { Checkbox } from "components/fields/Checkbox";
import { toRecordFilterElement } from "../helper";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    title: reportQueryFormFields.title,
    chartBy: reportQueryFormFields.chartByState,
    chartByLabel: reportQueryFormFields.label.optional().nullable(),
    secondaryChartBy: reportQueryFormFields.chartByState,
    secondaryChartByLabel: reportQueryFormFields.label.optional().nullable(),
    granularity: reportQueryFormFields.granularity,
    aggregateField: reportQueryFormFields.aggregateField,
    cummulative: reportQueryFormFields.cummulative.optional(),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  reportQuery: ReportQuery;
}

export const ReportQueryEditCompareValuesModal: FCWithFragments<Props> = (
  props
) => {
  const { reportQuery } = props;

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: reportQuery.title,
      aggregateField: reportQuery.aggregateField,
      cummulative: reportQuery.cummulative,
      chartBy: reportQuery.chartBy,
      chartByLabel: reportQuery.chartByLabel,
      secondaryChartBy: reportQuery.secondaryChartBy,
      secondaryChartByLabel: reportQuery.secondaryChartByLabel,
      granularity: reportQuery.granularity,
    },
  });
  const { register } = formContext;

  const [isSameAsPrimaryFilter, setSameAsPrimaryFilter] = useState(
    reportQuery.sameAsPrimaryFilter
  );
  const [filter, setFilter] = useState<ReportQueryListFilter>({
    valueSets: {
      paths: [],
    },
    flags: {},
    dates: {},
    recordSets: {
      products: reportQuery.byProducts.map(toRecordFilterElement),
      workflows: reportQuery.byWorkflows.map(toRecordFilterElement),
      authors: reportQuery.byAuthors.map(toRecordFilterElement),
      assignees: reportQuery.byAssignees.map(toRecordFilterElement),
      tags: reportQuery.byTags.map(toRecordFilterElement),
      tickets: reportQuery.byTickets.map(toRecordFilterElement),
    },
  });

  const [secondaryFilter, setSecondaryFilter] = useState<ReportQueryListFilter>(
    {
      valueSets: {
        paths: [],
      },
      flags: {},
      dates: {},
      recordSets: {
        products: reportQuery.secondaryByProducts.map(toRecordFilterElement),
        workflows: reportQuery.secondaryByWorkflows.map(toRecordFilterElement),
        authors: reportQuery.secondaryByAuthors.map(toRecordFilterElement),
        assignees: reportQuery.secondaryByAssignees.map(toRecordFilterElement),
        tags: reportQuery.secondaryByTags.map(toRecordFilterElement),
        tickets: reportQuery.secondaryByTickets.map(toRecordFilterElement),
      },
    }
  );

  useEffect(() => {
    register("granularity");
  }, [register]);

  const [updateReportQuery] = useBlockingMutation<
    { updateReportQuery: ReportQuery },
    MutationUpdateReportQueryArgs
  >(UPDATE_REPORT_QUERY_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Report Widget updated",
      callback: props.onClose,
    }),
    onError: onGraphQLError({ title: "Report Widget update failed" }),
  });

  const onSubmit = (formData: FormSchema) => {
    updateReportQuery({
      variables: {
        reportQueryId: reportQuery.id,
        input: {
          ...formData,
          // secondary filter values
          productIds: map(filter.recordSets.products, "id"),
          workflowIds: map(filter.recordSets.workflows, "id"),
          authorIds: map(filter.recordSets.authors, "id"),
          assigneeIds: map(filter.recordSets.assignees, "id"),
          tagIds: map(filter.recordSets.tags, "id"),
          ticketIds: map(filter.recordSets.tickets, "id"),

          // secondary filter values
          secondaryProductIds: map(secondaryFilter.recordSets.products, "id"),
          secondaryWorkflowIds: map(secondaryFilter.recordSets.workflows, "id"),
          secondaryAuthorIds: map(secondaryFilter.recordSets.authors, "id"),
          secondaryAssigneeIds: map(secondaryFilter.recordSets.assignees, "id"),
          secondaryTagIds: map(secondaryFilter.recordSets.tags, "id"),
          secondaryTicketIds: map(secondaryFilter.recordSets.tickets, "id"),

          sameAsPrimaryFilter: isSameAsPrimaryFilter,
          noUnknowns: true,
          ...filter.dates,
        },
      },
    });
  };

  return (
    <Modal {...props} large initialFocusSelector="#query-title">
      <FormProvider {...formContext}>
        <form
          onSubmit={formContext.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <DatabaseIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 flex-1 sm:mt-0 sm:ml-4">
            <div className="space-y-4">
              <Dialog.Title
                as="h3"
                className="text-center text-lg font-medium leading-6 text-gray-900 sm:mr-6 sm:text-left"
              >
                Edit Compare Values Widget
              </Dialog.Title>

              <div>
                <Label htmlFor="query-title" className="mb-1">
                  Widget Title
                </Label>
                <FormInputGroup
                  id="query-title"
                  name="title"
                  autoFocus
                  placeholder="e.g. Open Tickets"
                />
              </div>

              <div>
                <Label htmlFor="query-aggregate-field" className="mb-1">
                  Metric
                </Label>
                <div className="max-w-sm">
                  <FormSelectGroup
                    id="query-aggregate-field"
                    name="aggregateField"
                  >
                    {reportAggregateFields.map((field) => (
                      <option value={field} key={field}>
                        {capitalize(startCase(field))}
                      </option>
                    ))}
                  </FormSelectGroup>
                </div>
              </div>

              <div>
                <div className="col-span-5 mb-2 flex flex-row items-center space-x-2 pt-4">
                  <span className="h-3 w-3 rounded-full border border-gray-600 bg-brand-500"></span>
                  <span className="text-sm text-gray-700">Primary Values</span>
                  <div className="flex-1 border-b"></div>
                </div>

                <div className="grid-cols-5 space-y-4 md:grid md:gap-4 md:space-y-0">
                  <div className="col-span-1 md:col-span-5">
                    <Label className="mb-1">Filter</Label>
                    <ReportQueryInput filter={filter} onChange={setFilter} />
                  </div>

                  <div className="cols-span-1 md:col-span-3">
                    <Label htmlFor="query-group-by" className="mb-1">
                      Chart by
                    </Label>
                    <div className="max-w-sm">
                      <FormSelectGroup id="query-group-by" name="chartBy">
                        {reportGroupByStates.map((groupBy) => (
                          <option value={groupBy} key={groupBy}>
                            {capitalize(startCase(groupBy))}
                          </option>
                        ))}
                      </FormSelectGroup>
                    </div>
                  </div>

                  <div className="cols-span-1 md:col-span-2">
                    <Label htmlFor="granularity" className="mb-1">
                      Granularity
                    </Label>
                    <div className="max-w-sm">
                      <FormSelectGroup id="granularity" name="granularity">
                        <option value={ReportDateGranularity.Auto}>Auto</option>
                        <option value={ReportDateGranularity.Day}>
                          By Day
                        </option>
                        <option value={ReportDateGranularity.Week}>
                          By Week
                        </option>
                        <option value={ReportDateGranularity.Month}>
                          By Month
                        </option>
                      </FormSelectGroup>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <Label htmlFor="query-label" className="mb-1" optional>
                      Label
                    </Label>
                    <FormInputGroup
                      id="query-label"
                      name="chartByLabel"
                      autoFocus
                      placeholder="e.g. Open Tickets"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-2 flex flex-row items-center space-x-2 pt-4">
                  <span className="h-3 w-3 rounded-full border border-gray-600 bg-yellow-500"></span>
                  <span className="text-sm text-gray-700">
                    Secondary Values
                  </span>
                  <div className="flex-1 border-b"></div>
                </div>

                <div className="grid-cols-5 space-y-4 md:grid md:gap-4 md:space-y-0">
                  <div className="col-span-5">
                    <div className="mb-1 flex flex-row">
                      <Label className="flex-1">Filter</Label>
                      <label
                        className="mr-2 text-sm text-gray-500"
                        htmlFor="use-primary-filter"
                      >
                        Use primary filter
                      </label>
                      <Checkbox
                        onChange={() =>
                          setSameAsPrimaryFilter(!isSameAsPrimaryFilter)
                        }
                        checked={isSameAsPrimaryFilter}
                        id="use-primary-filter"
                      />
                    </div>

                    {isSameAsPrimaryFilter ? (
                      <button
                        type="button"
                        onClick={() => setSameAsPrimaryFilter(false)}
                        className="w-full rounded-md border bg-gray-100 p-2.5 text-sm text-gray-500"
                      >
                        Same as Primary Filter
                      </button>
                    ) : (
                      <ReportQueryInput
                        filter={secondaryFilter}
                        onChange={setSecondaryFilter}
                      />
                    )}
                  </div>

                  <div className="col-span-3">
                    <Label htmlFor="query-group-by" className="mb-1">
                      Chart by
                    </Label>
                    <div className="max-w-sm">
                      <FormSelectGroup
                        id="query-group-by"
                        name="secondaryChartBy"
                      >
                        {reportGroupByStates.map((groupBy) => (
                          <option value={groupBy} key={groupBy}>
                            {capitalize(startCase(groupBy))}
                          </option>
                        ))}
                      </FormSelectGroup>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <Label
                      htmlFor="query-secondary-label"
                      className="mb-1"
                      optional
                    >
                      Label
                    </Label>
                    <FormInputGroup
                      id="query-secondary-label"
                      name="secondaryChartByLabel"
                      autoFocus
                      placeholder="e.g. Open Tickets"
                    />
                  </div>
                </div>
              </div>
              <div className="border-b pt-4" />
              <div>
                <FormToggleGroup
                  id="cummulative-field"
                  name="cummulative"
                  className="mt-1 flex-row-reverse"
                  label="Cummulate values"
                  description="Values will be added over time to highlight period total"
                />
              </div>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button type="submit" btnType="primary" fullInMobile>
                Update Query
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                btnType="secondaryWhite"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                fullInMobile
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

const UPDATE_REPORT_QUERY_MUTATION = gql`
  mutation UpdateReportQueryForCompareValue(
    $reportQueryId: Int!
    $input: UpdateReportQueryInput!
  ) {
    updateReportQuery(reportQueryId: $reportQueryId, input: $input) {
      id
      title
      position
    }
  }
`;

ReportQueryEditCompareValuesModal.fragments = {
  ReportQueryEditCompareValuesModalFragment: gql`
    fragment ReportQueryEditCompareValuesModalFragment on ReportQuery {
      id
      title
      aggregateField
      cummulative
      sameAsPrimaryFilter

      chartBy
      chartByLabel

      secondaryChartBy
      secondaryChartByLabel

      byProducts {
        id
        label
        recordId
      }
      byWorkflows {
        id
        label
        recordId
      }
      byAuthors {
        id
        label
        recordId
      }
      byAssignees {
        id
        label
        recordId
      }
      byTags {
        id
        label
        recordId
      }
      byTickets {
        id
        label
        recordId
      }

      secondaryByProducts {
        id
        label
        recordId
      }
      secondaryByWorkflows {
        id
        label
        recordId
      }
      secondaryByAuthors {
        id
        label
        recordId
      }
      secondaryByAssignees {
        id
        label
        recordId
      }
      secondaryByTags {
        id
        label
        recordId
      }
      secondaryByTickets {
        id
        label
        recordId
      }
    }
  `,
};
