import React, { useEffect, useState } from "react";
import { ticketFormFields } from "pages/ticket/formFields";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ImportTicketsInputDetail,
  MiniProduct,
  MiniProject,
  MiniWorkflow,
  MutationImportTicketsArgs,
  Ticket,
} from "types/graphql";
import { FormError } from "components/fields/FieldError";
import { ProductWorkflowSelect } from "components/fields/ProductWorkflowSelect";
import { ProductSelect } from "components/fields/ProductSelect";
import { Button } from "components/fields/Button";
import {
  ExclamationIcon,
  InformationCircleIcon,
  UploadIcon,
} from "@heroicons/react/solid";
import { FormSelectGroup } from "components/fields/Select";
import { Label } from "components/fields/Label";
import { UploadCsv } from "./UploadCsv";
import { gql } from "@apollo/client";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { trim } from "lodash";
import { usePageTitle } from "hooks/usePageTitle";
import { GET_ONBOARDING_STATUS_QUERY } from "components/sidebar/Onboarding";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { urlResolver } from "utils/navigation";
import { useHistory, useParams } from "react-router-dom";
import { ProjectSelect } from "components/fields/ProjectSelect";
import { FieldDescription } from "components/fields/FieldDescription";

const schema = yup
  .object({
    workflowId: ticketFormFields.workflowId.optional(),
    productId: ticketFormFields.productId.optional(),
    projectId: ticketFormFields.projectId.required(),
    idColumn: yup.string().label("ID Column").optional(),
    titleColumn: yup.string().label("Title Column").required(),
    descriptionColumn: yup.string().label("Description Column").optional(),
    authorEmailColumn: yup.string().label("Author Column").optional(),
    ownerEmailColumn: yup.string().label("Owner Column").optional(),
    tagsColumn: yup.string().label("Tags Column").optional(),
    // ancestorsColumn: yup.string().label("Ancestors Column").optional(),
    // successorsColumn: yup.string().label("Successors Column").optional(),
  })
  .noUnknown()
  .defined();

type FormSchema = yup.InferType<typeof schema>;

export const ImportTicket: React.FC = (props) => {
  usePageTitle("Import Tickets");
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();
  const [showGoToProjects, setShowGoToProjects] = useState(false);
  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });
  const [product, setProduct] = useState<MiniProduct>();
  const [workflow, setWorkflow] = useState<MiniWorkflow>();
  const [project, setProject] = useState<MiniProject>();
  const [data, _setData] = useState<string[][]>([]);

  const setData = (data: string[][]) => {
    _setData(data);

    if (data.length > 0) {
      data[0].forEach((columnName, index) => {
        switch (columnName.toLowerCase()) {
          case "title":
            return formContext.setValue("titleColumn", index.toString());
          case "description":
            return formContext.setValue("descriptionColumn", index.toString());
          case "owner_email":
            return formContext.setValue("ownerEmailColumn", index.toString());
          case "author_email":
            return formContext.setValue("authorEmailColumn", index.toString());
          case "tags":
            return formContext.setValue("tagsColumn", index.toString());
          // case "ancestor_ids":
          //   return formContext.setValue("ancestorsColumn", index.toString());
          // case "successor_ids":
          //   return formContext.setValue("successorsColumn", index.toString());
          case "id":
            return formContext.setValue("idColumn", index.toString());
        }
      });
    } else {
      return formContext.reset();
    }
  };

  useEffect(() => {
    formContext.register("workflowId");
    formContext.register("productId");
    formContext.register("projectId");
  }, [formContext]);

  const onProjectChange = (project?: MiniProject) => {
    setProject(project);
    if (project) {
      const projectId = project.id;
      formContext.setValue("projectId", projectId, {
        shouldValidate: true,
      });
    }
  };

  const onProductChange = (product?: MiniProduct) => {
    setProduct(product);
    onWorkflowChange();
    if (product) {
      const productId = product.id;
      formContext.setValue("productId", productId, {
        shouldValidate: true,
      });
    }
  };

  const onWorkflowChange = (workflow?: MiniWorkflow) => {
    setWorkflow(workflow);
    if (workflow) {
      formContext.setValue("workflowId", workflow.id, {
        shouldValidate: true,
      });
    }
  };

  const [importTickets] = useBlockingMutation<
    { importTickets: Ticket[] },
    MutationImportTicketsArgs
  >(IMPORT_TICKETS_MUTATION, {
    refetchQueries: [GET_ONBOARDING_STATUS_QUERY], // this is to refresh the status of the onboarding
    onError: onGraphQLError({ title: "Could not import files" }),
    onCompleted: onMutationComplete({
      title: "Import complete",
      callback: () => {
        setShowGoToProjects(true);
        setData([]);
      },
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    if (data?.length) {
      const tickets: ImportTicketsInputDetail[] = [];
      for (const row of data.slice(1)) {
        const title = trim(row[parseInt(formData.titleColumn)]);

        if (!title) {
          continue;
        }

        const ticket: ImportTicketsInputDetail = { title };

        if (
          formData.descriptionColumn &&
          formData.descriptionColumn !== "DNI"
        ) {
          const description = trim(row[parseInt(formData.descriptionColumn)]);
          if (description) {
            ticket.description = description;
          }
        }

        if (formData.idColumn && formData.idColumn !== "DNI") {
          const id = trim(row[parseInt(formData.idColumn)]);
          if (id) {
            ticket.id = id;
          }
        }

        if (formData.ownerEmailColumn && formData.ownerEmailColumn !== "DNI") {
          const ownerEmail = trim(row[parseInt(formData.ownerEmailColumn)]);
          if (ownerEmail) {
            ticket.ownerEmail = ownerEmail;
          }
        }

        if (
          formData.authorEmailColumn &&
          formData.authorEmailColumn !== "DNI"
        ) {
          const authorEmail = trim(row[parseInt(formData.authorEmailColumn)]);
          if (authorEmail) {
            ticket.authorEmail = authorEmail;
          }
        }

        if (formData.tagsColumn && formData.tagsColumn !== "DNI") {
          const tags = trim(row[parseInt(formData.tagsColumn)]);
          if (tags) {
            ticket.tags = tags;
          }
        }

        // if (formData.ancestorsColumn && formData.ancestorsColumn !== "DNI") {
        //   const ancestorIds = trim(row[parseInt(formData.ancestorsColumn)]);
        //   if (ancestorIds) {
        //     ticket.ancestorIds = ancestorIds;
        //   }
        // }

        // if (formData.successorsColumn && formData.successorsColumn !== "DNI") {
        //   const successorIds = trim(row[parseInt(formData.successorsColumn)]);
        //   if (successorIds) {
        //     ticket.successorIds = successorIds;
        //   }
        // }

        tickets.push(ticket);
      }

      importTickets({
        variables: {
          input: {
            tickets,
            productId: formData.productId,
            projectId: formData.projectId,
            workflowId: formData.workflowId,
          },
        },
      });
    }
  };

  return (
    <div className="rounded-lg bg-white shadow">
      <ConfirmModal
        title="Import Complete"
        description="Your import was successful. The tickets have been created as Draft and can be seen in the project section"
        cta={"Go To Projects"}
        visible={showGoToProjects}
        onConfirm={() =>
          project &&
          history.push(urlResolver.explorer.listing(orgId, project.id))
        }
        onClose={() => setShowGoToProjects(false)}
      />

      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Import Tickets
        </h3>
        <p className="mt-4 text-sm text-gray-500">
          This page allows you to import batches of tickets. You should download
          our
          <a
            href={
              import.meta.env.PUBLIC_URL + "/files/import-ticket-template.csv"
            }
            download
            className="mx-1 font-medium text-brand-600 underline hover:no-underline"
          >
            ticket import template file
          </a>
          to simplify your import.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          We recommend that you upload multiple batches of tickets,{" "}
          <span className="font-medium text-gray-700">
            one batch for every workflow
          </span>
          . Note that all imported tickets will be in a Draft state.
        </p>
        <h4 className="mt-8 text-base font-medium leading-5 text-gray-900">
          1. Upload File
        </h4>
        <div className="mt-4">
          <UploadCsv
            onFileRead={setData}
            className="mt-2 flex h-36 items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 "
            rows={data}
          />
        </div>

        {data?.length ? (
          <FormProvider {...formContext}>
            <form onSubmit={formContext.handleSubmit(onSubmit)}>
              <h4 className="mt-8 text-base font-medium leading-5 text-gray-900">
                2. Associate Fields
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Associate every attribute with a column from your import. Select
                <span className="mx-1 font-semibold text-gray-700">
                  Do Not Import
                </span>
                if you do not want an attribute to be imported
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="title-field" className="mb-1" required>
                    Title Column
                  </Label>
                  <FormSelectGroup name="titleColumn" id="title-field">
                    {data
                      ? data[0].map((value, index) => (
                          <option key={value} value={index}>
                            {index + 1}: {value}
                          </option>
                        ))
                      : null}
                  </FormSelectGroup>
                </div>
                <div>
                  <Label htmlFor="description-field" className="mb-1" optional>
                    Description Column
                  </Label>
                  <FormSelectGroup
                    name="descriptionColumn"
                    id="description-field"
                  >
                    <option value="DNI">-- Do Not Import --</option>
                    {data
                      ? data[0].map((value, index) => (
                          <option key={value} value={index}>
                            {index + 1}: {value}
                          </option>
                        ))
                      : null}
                  </FormSelectGroup>
                </div>
                <div>
                  <Label htmlFor="id-field" className="mb-1" optional>
                    ID Column
                  </Label>
                  <FormSelectGroup name="idColumn" id="id-field">
                    {data
                      ? data[0].map((value, index) => (
                          <option key={value} value={index}>
                            {index + 1}: {value}
                          </option>
                        ))
                      : null}
                  </FormSelectGroup>
                  <FieldDescription className="mt-1">
                    <InformationCircleIcon className="mr-0.5 inline-block h-4 w-4 align-text-bottom text-gray-300" />
                    Imported ID is displayed in the ticket information.
                  </FieldDescription>
                </div>

                <div>
                  <Label htmlFor="tags-field" className="mb-1" optional>
                    Tags and Labels Column
                  </Label>
                  <FormSelectGroup name="tagsColumn" id="tags-field">
                    <option value="DNI">-- Do Not Import --</option>
                    {data
                      ? data[0].map((value, index) => (
                          <option key={value} value={index}>
                            {index + 1}: {value}
                          </option>
                        ))
                      : null}
                  </FormSelectGroup>
                  <FieldDescription className="mt-1">
                    <InformationCircleIcon className="mr-0.5 inline-block h-4 w-4 align-text-bottom text-gray-300" />
                    Non existing tags will be created.
                  </FieldDescription>
                </div>

                <div>
                  <Label htmlFor="author-field" className="mb-1" optional>
                    Author Column
                  </Label>
                  <FormSelectGroup name="authorEmailColumn" id="author-field">
                    <option value="DNI">-- Do Not Import --</option>
                    {data
                      ? data[0].map((value, index) => (
                          <option key={value} value={index}>
                            {index + 1}: {value}
                          </option>
                        ))
                      : null}
                  </FormSelectGroup>
                  <FieldDescription className="mt-1">
                    <InformationCircleIcon className="mr-0.5 inline-block h-4 w-4 align-text-bottom text-gray-300" />
                    Make sure all referred members have been invited.
                  </FieldDescription>
                </div>

                <div>
                  <Label htmlFor="owner-field" className="mb-1" optional>
                    Owner Column
                  </Label>
                  <FormSelectGroup name="ownerEmailColumn" id="owner-field">
                    <option value="DNI">-- Do Not Import --</option>
                    {data
                      ? data[0].map((value, index) => (
                          <option key={value} value={index}>
                            {index + 1}: {value}
                          </option>
                        ))
                      : null}
                  </FormSelectGroup>
                  <FieldDescription className="mt-1">
                    <InformationCircleIcon className="mr-0.5 inline-block h-4 w-4 align-text-bottom text-gray-300" />
                    Make sure all referred members have been invited.
                  </FieldDescription>
                </div>

                {/* <div>
                  <Label htmlFor="ancestors-field" className="mb-1" optional>
                    Ancestor Tickets Column
                  </Label>
                  <FormSelectGroup name="ancestorsColumn" id="ancestors-field">
                    <option value="DNI">-- Do Not Import --</option>
                    {data
                      ? data[0].map((value, index) => (
                          <option key={value} value={index}>
                            {index + 1}: {value}
                          </option>
                        ))
                      : null}
                  </FormSelectGroup>
                  
                </div>

                <div>
                  <Label htmlFor="successors-field" className="mb-1" optional>
                    Successor Tickets Column
                  </Label>
                  <FormSelectGroup
                    name="successorsColumn"
                    id="successors-field"
                  >
                    <option value="DNI">-- Do Not Import --</option>
                    {data
                      ? data[0].map((value, index) => (
                          <option key={value} value={index}>
                            {index + 1}: {value}
                          </option>
                        ))
                      : null}
                  </FormSelectGroup>
                </div>*/}
              </div>

              <h4 className="mt-8 text-base font-medium leading-5 text-gray-900">
                3. Customize
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                You may select the product, workflow and project to apply to all
                the imported tickets.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProductSelect
                  label="Product"
                  tabIndex={1}
                  value={product}
                  onChange={onProductChange}
                  includeDraft
                />
                <FormError className="mt-1" name="productId" />
                {product ? (
                  <>
                    <ProductWorkflowSelect
                      tabIndex={2}
                      label="Workflow"
                      productId={product.id}
                      value={workflow}
                      onChange={onWorkflowChange}
                    />
                    <FormError className="mt-1" name="workflowId" />
                  </>
                ) : (
                  <div>
                    <Label htmlFor="ticket-description" className="mb-1">
                      Workflow
                    </Label>
                    <div className="sm rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-center text-sm leading-5 text-gray-300">
                      <ExclamationIcon className="mr-2 inline-block h-5 w-5 align-top text-gray-300" />
                      No Product Selected
                    </div>
                  </div>
                )}
                <div>
                  <ProjectSelect
                    label="Project"
                    value={project}
                    onChange={onProjectChange}
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button
                  type="submit"
                  btnType="primary"
                  tabIndex={5}
                  fullInMobile
                >
                  <UploadIcon className="mr-2 h-5 w-5" />
                  Import Tickets
                </Button>
              </div>
            </form>
          </FormProvider>
        ) : null}
      </div>
    </div>
  );
};

const IMPORT_TICKETS_MUTATION = gql`
  mutation ImportTickets($input: ImportTicketsInput!) {
    importTickets(input: $input) {
      id
    }
  }
`;
