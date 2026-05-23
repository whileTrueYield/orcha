import {
  ModelStage,
  ReportWidgetType,
  ReportGroupBy,
  ReportAggregateField,
  ReportDateGranularity,
} from "types/graphql";
import * as yup from "yup";

export const reportWidgetTypes = Object.values(ReportWidgetType);

export const reportGroupByDates = [
  ReportGroupBy.ClosedAt,
  ReportGroupBy.CreatedAt,
  ReportGroupBy.Eta,
  ReportGroupBy.WorkDay,
  ReportGroupBy.ScheduledAt,
];

export const reportGroupByStates = [
  ReportGroupBy.Assignee,
  ReportGroupBy.Product,
  ReportGroupBy.Tag,
  ReportGroupBy.Workflow,
  ReportGroupBy.WorkflowState,
];

export const reportDateGranularities = Object.values(ReportDateGranularity);
export const reportAggregateFields = Object.values(ReportAggregateField);

// the report fields
export const reportFormFields = {
  name: yup.string().required().max(128).label("Name"),
  status: yup.string().required().oneOf(Object.values(ModelStage)),
};

// the report fields
export const reportQueryFormFields = {
  title: yup.string().required().max(128).label("Name"),
  noUnknowns: yup.bool().optional().label("No unknowns"),
  cummulative: yup.bool().optional().label("Cummulate values"),
  widgetType: yup
    .string()
    .required()
    .oneOf(reportWidgetTypes)
    .label("Widget Type"),
  chartByState: yup
    .string()
    .required()
    .oneOf(reportGroupByStates)
    .label("Chart By"),
  chartByDate: yup
    .string()
    .required()
    .oneOf(reportGroupByDates)
    .label("Chart By"),

  groupByState: yup
    .string()
    .required()
    .oneOf([null, ...reportGroupByStates])
    .nullable()
    // interpret an empty string "" value into a `null`
    .transform((value, originalValue) => (value === "" ? null : originalValue))
    .label("Group By"),
  groupByDate: yup
    .string()
    .required()
    .oneOf([null, ...reportGroupByDates])
    .nullable()
    // interpret an empty string "" value into a `null`
    .transform((value, originalValue) => (value === "" ? null : originalValue))
    .label("Group By"),

  label: yup.string().required().max(128).label("Label"),
  granularity: yup
    .string()
    .oneOf(reportDateGranularities)
    .nullable()
    .label("Granularity"),
  groupBy: yup
    .string()
    .oneOf([null, ...reportGroupByStates])
    .nullable()
    .transform((value, originalValue) => (value === "" ? null : originalValue))
    .label("Group By Secondary"),
  rows: yup.number().integer().min(1).max(2),
  cols: yup.number().integer().min(1).max(2),
  aggregateField: yup
    .string()
    .required()
    .oneOf(reportAggregateFields)
    .label("Aggregated Value"),
};
