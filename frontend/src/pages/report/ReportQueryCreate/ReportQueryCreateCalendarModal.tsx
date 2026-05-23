import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import {
  reportAggregateFields,
  reportGroupByDates,
  reportQueryFormFields,
} from "../formFields";
import { gql } from "@apollo/client";
import {
  MutationCreateReportQueryArgs,
  Report,
  ReportQuery,
  ReportAggregateField,
  ReportGroupBy,
  ReportWidgetType,
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
import { ReportQueryListFilter } from "types";
import { FormSelectGroup } from "components/fields/Select";
import { capitalize, map, startCase } from "lodash";
import { FormToggleGroup } from "components/fields/Toggle";
import { GET_REPORT_QUERY } from "../ReportEdit/ReportEdit";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    title: reportQueryFormFields.title,
    chartBy: reportQueryFormFields.chartByDate,
    aggregateField: reportQueryFormFields.aggregateField,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  report: Report;
}

export const ReportQueryCreateCalendarModal: React.FC<Props> = (props) => {
  const { report } = props;

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      aggregateField: ReportAggregateField.TicketCount,
      chartBy: ReportGroupBy.CreatedAt,
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
      products: [],
      workflows: [],
      authors: [],
      assignees: [],
      tags: [],
      tickets: [],
    },
  });

  useEffect(() => {
    register("granularity");
  }, [register]);

  const [createReportQuery] = useBlockingMutation<
    { createReportQuery: ReportQuery },
    MutationCreateReportQueryArgs
  >(CREATE_REPORT_QUERY_MUTATION, {
    refetchQueries: [GET_REPORT_QUERY],
    onCompleted: onMutationComplete({
      title: "Report created",
      callback: props.onClose,
    }),
    onError: onGraphQLError({ title: "Report creation failed" }),
  });

  const onSubmit = (formData: FormSchema) => {
    createReportQuery({
      variables: {
        reportId: report.id,
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
          widgetType: ReportWidgetType.Calendar,
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
                New Calendar Widget
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
                    <Label htmlFor="query-chart-by" className="mb-1">
                      Chart by
                    </Label>
                    <div className="max-w-sm">
                      <FormSelectGroup id="query-chart-by" name="chartBy">
                        {reportGroupByDates.map((groupBy) => (
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
                Create Query
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

const CREATE_REPORT_QUERY_MUTATION = gql`
  mutation CreateReportQueryCalendar(
    $reportId: Int!
    $input: CreateReportQueryInput!
  ) {
    createReportQuery(reportId: $reportId, input: $input) {
      id
      title
    }
  }
`;
