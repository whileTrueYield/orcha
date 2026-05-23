import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { useHistory, useParams } from "react-router-dom";
import { reportFormFields } from "../formFields";
import { gql } from "@apollo/client";
import { MutationDuplicateReportArgs, Report } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { DocumentAddIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";

const DUPLICATE_REPORT_MUTATION = gql`
  mutation DuplicateReport($reportId: Int!, $input: DuplicateReportInput!) {
    duplicateReport(reportId: $reportId, input: $input) {
      id
      name
      stage
    }
  }
`;

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: reportFormFields.name,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  reportId: number;
  reportName: string;
}

export const ReportDuplicateModal: React.FC<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const history = useHistory();
  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: props.reportName + " copy",
    },
  });
  const [submitted, setSubmitted] = useState(false);

  const [duplicateReport] = useBlockingMutation<
    { duplicateReport: Report },
    MutationDuplicateReportArgs
  >(DUPLICATE_REPORT_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Report duplicated",
      callback: (data) =>
        history.push(urlResolver.report.view(orgId, data.duplicateReport.id)),
    }),
    onError: onGraphQLError({
      title: "Report duplication failed",
      callback: () => setSubmitted(false),
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    setSubmitted(true);
    duplicateReport({
      variables: { reportId: props.reportId, input: formData },
    });
  };

  return (
    <Modal {...props} initialFocusSelector="#report-name">
      <FormProvider {...formContext}>
        <form
          onSubmit={formContext.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <DocumentAddIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
            >
              Duplicate report
            </Dialog.Title>
            <div className="mt-2 space-y-4">
              <div>
                <Label htmlFor="report-name" className="mb-1">
                  Duplicated Report Name
                </Label>
                <FormInputGroup
                  id="report-name"
                  name="name"
                  autoFocus
                  placeholder="e.g. Mobile Application"
                  tabIndex={1}
                />
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                btnType="primary"
                tabIndex={3}
                fullInMobile
                disabled={submitted}
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Duplicate Report
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                btnType="secondaryWhite"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                tabIndex={4}
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
