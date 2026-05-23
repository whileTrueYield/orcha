import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import {
  reportAggregateFields,
  reportGroupByDates,
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
import { toRecordFilterElement } from "../helper";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    title: reportQueryFormFields.title,
    chartBy: reportQueryFormFields.groupByDate,
    groupBy: reportQueryFormFields.groupByState.optional(),
    granularity: reportQueryFormFields.granularity,
    aggregateField: reportQueryFormFields.aggregateField,
    cummulative: reportQueryFormFields.cummulative.optional(),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  reportQuery: ReportQuery;
}

export const ReportQueryEditValuesThroughTimeModal: FCWithFragments<Props> = (
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
      groupBy: reportQuery.groupBy,
      granularity: reportQuery.granularity,
    },
  });
  const { register } = formContext;

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

  useEffect(() => {
    register("granularity");
  }, [register]);

  const [updateReportQuery] = useBlockingMutation<
    { updateReportQuery: ReportQuery },
    MutationUpdateReportQueryArgs
  >(UPDATE_REPORT_QUERY_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Report updated",
      callback: props.onClose,
    }),
    onError: onGraphQLError({ title: "Report creation failed" }),
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

          sameAsPrimaryFilter: false,
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
                Edit Values Through Time Widget
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
                        {reportGroupByDates.map((groupBy) => (
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

                  <div className="cols-span-1 md:col-span-3">
                    <Label htmlFor="query-group-by" className="mb-1" optional>
                      Group by
                    </Label>
                    <div className="max-w-sm">
                      <FormSelectGroup id="query-group-by" name="groupBy">
                        <option value="">-- no sub grouping --</option>
                        {reportGroupByStates.map((groupBy) => (
                          <option value={groupBy} key={groupBy}>
                            {capitalize(startCase(groupBy))}
                          </option>
                        ))}
                      </FormSelectGroup>
                    </div>
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
  mutation UpdateReportQueryForValuesThroughTime(
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

ReportQueryEditValuesThroughTimeModal.fragments = {
  ReportQueryEditValuesThroughTimeModalFragment: gql`
    fragment ReportQueryEditValuesThroughTimeModalFragment on ReportQuery {
      id
      title
      aggregateField
      cummulative
      sameAsPrimaryFilter

      chartBy
      groupBy

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

      granularity
    }
  `,
};
