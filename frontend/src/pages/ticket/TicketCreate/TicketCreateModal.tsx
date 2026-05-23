import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { Link, useHistory, useParams } from "react-router-dom";
import {
  HabitProductWorkflow,
  MiniProduct,
  MiniProject,
  MiniWorkflow,
  ModelStage,
  MutationCreateTicketArgs,
  Project,
  Ticket,
} from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProductSelect } from "components/fields/ProductSelect";
import { ProductWorkflowSelect } from "components/fields/ProductWorkflowSelect";
import { gql, useMutation, useQuery } from "@apollo/client";
import { urlResolver } from "utils/navigation";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormError } from "components/fields/FieldError";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { FormCheckboxGroup } from "components/fields/Checkbox";
import {
  ChevronDownIcon,
  ExclamationIcon,
  PencilAltIcon,
} from "@heroicons/react/solid";
import {
  DocumentAddIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";
import { Dialog, Listbox, Menu } from "@headlessui/react";
import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import { filter, trim } from "lodash";
import {
  convertToMiniProduct,
  convertToMiniProject,
  convertToMiniWorkflow,
} from "components/fields/convertToMini";
import { DocumentNode } from "graphql";
import { ProjectSelect } from "components/fields/ProjectSelect";
import { useHabits } from "hooks/useHabits";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";
import { useAppDispatch } from "store";
import { showTicketEditModal } from "actions";
import { ticketFormFields } from "../formFields";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import TiptapForm from "components/TipTap/TipTapForm";
import { TipTapDecoration } from "components/TipTap/TipTapDecoration";

const schema = yup
  .object({
    title: ticketFormFields.title.required(),
    description: ticketFormFields.description,
    workflowId: ticketFormFields.workflowId.required(),
    productId: ticketFormFields.productId.required(),
    projectId: ticketFormFields.projectId.required(),
    batchCreate: yup.boolean(),
  })
  .noUnknown()
  .defined();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  defaultTitle?: string;
  defaultProjectId?: number;
  defaultProductId?: number;
  defaultWorkflowId?: number;
  defaultDescription?: string;
  refetchQueries?: DocumentNode[];
  onCreate?: (ticketId: number) => void;
  onChange?: (ticket: Partial<Ticket>) => void;
}

export const TicketCreateModal: React.FC<Props> = (props) => {
  const {
    defaultProductId,
    defaultWorkflowId,
    defaultTitle,
    defaultDescription,
    defaultProjectId,
    onChange,
  } = props;

  const dispatch = useAppDispatch();
  const { orgId } = useParams<{ orgId: string }>();
  const [miniProducts, setMiniProducts] = useState<MiniProduct[]>([]);
  const [activeMiniProducts, setActiveMiniProducts] = useState<MiniProduct[]>(
    [],
  );
  const history = useHistory();

  const habits = useHabits(({ habits }) => {
    if (habits?.productWorkflows.length) {
      const { product } = habits.productWorkflows[0];
      setProduct(convertToMiniProduct(product));
      formContext.setValue("productId", product.id);
    }
  });
  const isAdmin = useSelector(isAdminLevel);

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      productId: defaultProductId,
      workflowId: defaultWorkflowId,
      title: defaultTitle,
      description: defaultDescription,
      projectId: defaultProjectId,
    },
  });

  const [submitted, setSubmitted] = useState(false);
  const [product, setProduct] = useState<MiniProduct>();
  const [workflow, setWorkflow] = useState<MiniWorkflow>();
  const [project, setProject] = useState<MiniProject>();

  const { register, watch, getValues } = formContext;

  useQuery<QueryReturnValue["miniProducts"]>(GET_MINI_PRODUCTS_QUERY, {
    fetchPolicy: "cache-and-network",
    onCompleted: ({ miniProducts }) => {
      setMiniProducts(miniProducts);

      const activeMiniProducts = filter(miniProducts, {
        stage: ModelStage.Published,
      });
      setActiveMiniProducts(activeMiniProducts);

      // default the product to the only active MiniProduct
      if (activeMiniProducts.length === 1) {
        setProduct(activeMiniProducts[0]);
      }
    },
  });

  const showProductField = activeMiniProducts.length > 1;

  // Callback version of watch.
  React.useEffect(() => {
    const subscription = watch(() => onChange?.(getValues()));
    return () => subscription.unsubscribe();
  }, [watch, getValues, onChange]);

  const [createTicket] = useMutation<
    MutationReturnValue["createTicket"],
    MutationCreateTicketArgs
  >(CREATE_TICKET_MUTATION, {
    onError: onGraphQLError({
      title: "Ticket creation failed",
      callback: () => setSubmitted(false),
    }),
    refetchQueries: props.refetchQueries,
    onCompleted: onMutationComplete({
      title: "Ticket Created",
      callback: ({ createTicket }) => {
        setSubmitted(false);
        const { batchCreate } = formContext.getValues();
        formContext.reset({
          projectId: createTicket.project?.id,
          productId: createTicket.product?.id,
          workflowId: createTicket.workflow?.id,
          title: "",
          description: "",
          batchCreate,
        });

        if (props.onCreate) {
          props.onCreate(createTicket.id);
        }

        if (batchCreate) {
          formContext.setFocus("title");
        } else {
          dispatch(showTicketEditModal(createTicket.id));
          props.onClose();
        }
      },
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    setSubmitted(true);
    createTicket({
      variables: {
        input: {
          productId: formData.productId,
          workflowId: formData.workflowId,
          title: formData.title,
          // here the description is a tiptap JSON documnent,
          // the backend will convert it to a YJS document
          description: formData.description,
          projectId: formData.projectId,
          stage: ModelStage.Published,
        },
      },
    });
  };

  const submitAsDraft = async () => {
    const formData = formContext.getValues();
    formContext.clearErrors();
    formContext.trigger("title");
    formContext.trigger("projectId");

    if (trim(formData.title) && formData.projectId) {
      createTicket({
        variables: {
          input: {
            productId: formData.productId,
            workflowId: formData.workflowId,
            projectId: formData.projectId,
            title: formData.title,
            stage: ModelStage.Draft,
          },
        },
      });
    }
  };

  useEffect(() => {
    register("workflowId");
    register("productId");
    register("projectId");
  }, [register]);

  const onProductChange = (product?: MiniProduct) => {
    setProduct(product);
    onWorkflowChange();
    if (product) {
      const productId = product.id;
      formContext.setValue("productId", productId, {
        shouldValidate: true,
      });
    } else {
      formContext.resetField("productId");
    }
  };

  const onProjectChange = (project?: MiniProject) => {
    setProject(project);
    if (project) {
      const projectId = project.id;
      formContext.setValue("projectId", projectId, {
        shouldValidate: true,
      });
    } else {
      formContext.resetField("projectId");
    }
  };

  const onWorkflowChange = (workflow?: MiniWorkflow) => {
    setWorkflow(workflow);
    if (workflow) {
      formContext.setValue("workflowId", workflow.id, {
        shouldValidate: true,
      });
    } else {
      formContext.resetField("workflowId");
    }
  };

  const renderSubmitButton = () => {
    const menuOptions: PopMenuOption[] = [
      {
        type: "button",
        icon: (className) => <PencilAltIcon className={className} />,
        label: <span>Create as Draft</span>,
        onClick: submitAsDraft,
      },
    ];

    return (
      <div className="flex flex-row">
        <Button
          type="submit"
          tabIndex={5}
          btnType="primary"
          fullInMobile
          className="sm:ml-3"
          btnGroup="start"
          disabled={submitted}
        >
          Publish Ticket
        </Button>
        <PopMenu direction="bottom-left" options={menuOptions} size="large">
          <Menu.Button
            type="button"
            className="h-full shrink-0 items-center rounded-l-none rounded-r-md border-l border-brand-700 bg-brand-600 p-2 text-sm font-medium text-white hover:bg-brand-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-brand-800"
          >
            <span className="sr-only">Publish Options</span>
            <ChevronDownIcon
              className="h-5 w-5 text-brand-50"
              aria-hidden="true"
            />
          </Menu.Button>
        </PopMenu>
      </div>
    );
  };

  const renderProductSuggestion = (
    productWorkflows: HabitProductWorkflow[],
  ) => {
    if (!showProductField && product) {
      const suggestedWorkflows = habits?.productWorkflows
        .filter((pw) => pw.product.id === product.id)
        .map(({ workflow }) => workflow);

      if (suggestedWorkflows?.length) {
        return (
          <div className="col-span-4 -mt-3 truncate text-sm text-gray-600">
            <span className="italic">recent: </span>
            {suggestedWorkflows.slice(0, 3).map((workflow, index) => (
              <span
                className={index > 0 ? "hidden sm:inline" : undefined}
                key={workflow.id}
              >
                {index > 0 ? ", " : " "}
                <button
                  type="button"
                  onClick={() => {
                    setWorkflow(convertToMiniWorkflow(workflow));
                    formContext.setValue("workflowId", workflow.id, {
                      shouldValidate: true,
                    });
                  }}
                  className="text-brand-700 hover:text-brand-600 hover:underline"
                >
                  {workflow.name}
                </button>
              </span>
            ))}
          </div>
        );
      } else {
        return null;
      }
    }

    return (
      <div className="col-span-4 -mt-3 truncate text-sm text-gray-600">
        <span className="italic">recent: </span>
        {productWorkflows.slice(0, 3).map((productWorkflow, index) => (
          <span
            className={index > 0 ? "hidden sm:inline" : undefined}
            key={`${productWorkflow.product.id}-${productWorkflow.workflow.id}`}
          >
            {index > 0 ? ", " : " "}
            <button
              type="button"
              onClick={() => {
                setProduct(convertToMiniProduct(productWorkflow.product));
                formContext.setValue("productId", productWorkflow.product.id, {
                  shouldValidate: true,
                });
                setWorkflow(convertToMiniWorkflow(productWorkflow.workflow));
                formContext.setValue(
                  "workflowId",
                  productWorkflow.workflow.id,
                  {
                    shouldValidate: true,
                  },
                );
              }}
              className="text-brand-700 hover:text-brand-600 hover:underline"
            >
              {productWorkflow.product.name} &amp;{" "}
              {productWorkflow.workflow.name}
            </button>
          </span>
        ))}
      </div>
    );
  };

  const renderProjectSuggestion = (projects: Project[]) => {
    return (
      <div className="col-span-4 mt-1 truncate text-sm text-gray-600">
        <span className="italic">recent: </span>
        {projects.slice(0, 3).map((project, index) => (
          <span
            className={index > 0 ? "hidden sm:inline" : undefined}
            key={project.id}
          >
            {index > 0 ? ", " : " "}
            <button
              type="button"
              onClick={() => onProjectChange(convertToMiniProject(project))}
              className="text-brand-700 hover:text-brand-600 hover:underline"
            >
              {project.name}
            </button>
          </span>
        ))}
      </div>
    );
  };

  // If the user is an ADMIN and there is no workflows associated with
  // the selected product display a CTA to redirect the user to:
  // admin -> product -> edit section
  const renderNoWorkflowInProduct = () => {
    if (product && isAdmin) {
      return (
        <Listbox.Option value={null as any}>
          <button
            type="button"
            onClick={() => {
              props.onClose();
              history.push(urlResolver.product.edit(orgId, product.id));
            }}
            className="flex w-full flex-col items-center space-y-1 bg-yellow-50 px-4 py-2 text-yellow-700 hover:bg-brand-500 hover:text-white"
          >
            <div className="font-medium">Product has no workflows</div>
            <div className="text-xs text-opacity-80">Click to edit product</div>
          </button>
        </Listbox.Option>
      );
    }
  };

  const renderProductRequired = () => (
    <div className="col-span-4 rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            No active products
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              You need at least one active product to create a ticket. You can
              create and publish a product in{" "}
              <Link
                className="underline font-normal text-sky-700 hover:text-sky-500 hover:no-underline cursor-pointer break-words"
                to={urlResolver.product.listing(orgId)}
                onClick={props.onClose}
              >
                the admin section.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectFieldOnly = (product: MiniProduct) => (
    <div className="col-span-4">
      <ProductWorkflowSelect
        tabIndex={3}
        label="Workflow"
        productId={product.id}
        value={workflow}
        defaultId={defaultWorkflowId}
        onChange={onWorkflowChange}
        renderNoOptions={renderNoWorkflowInProduct}
      />
      <FormError className="mt-1" name="workflowId" />
    </div>
  );

  const renderProductAndProjectFields = () => (
    <>
      <div className="col-span-4 sm:col-span-4 md:col-span-2">
        <ProductSelect
          label="Product"
          tabIndex={3}
          value={product}
          onChange={onProductChange}
          defaultId={defaultProductId}
        />
        <FormError className="mt-1" name="productId" />
      </div>
      {product ? (
        <div className="col-span-4 sm:col-span-4 md:col-span-2">
          <ProductWorkflowSelect
            tabIndex={4}
            label="Workflow"
            productId={product.id}
            value={workflow}
            defaultId={defaultWorkflowId}
            onChange={onWorkflowChange}
            renderNoOptions={renderNoWorkflowInProduct}
          />
          <FormError className="mt-1" name="workflowId" />
        </div>
      ) : (
        <div className="col-span-4 sm:col-span-4 md:col-span-2">
          <Label htmlFor="ticket-description" className="mb-1">
            Workflow
          </Label>
          <div className="sm rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-center text-sm leading-5 text-gray-400">
            <ExclamationIcon className="mr-2 inline-block h-5 w-5 align-top text-gray-300" />
            No Product Selected
          </div>
        </div>
      )}
    </>
  );

  return (
    <Modal {...props} large initialFocusSelector="#ticket-title">
      <FormProvider {...formContext}>
        <form
          onSubmit={formContext.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <DocumentAddIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3sm:mt-0 flex-1 sm:ml-4">
            <Dialog.Title
              as="h3"
              className="text-center text-lg font-medium leading-6 text-gray-900 sm:mr-6 sm:text-left"
            >
              New Ticket
            </Dialog.Title>
            <div className="mt-2 grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <Label htmlFor="ticket-title" className="mb-1">
                  Ticket Title
                </Label>
                <FormInputGroup
                  id="ticket-title"
                  name="title"
                  autoComplete="off"
                  placeholder="e.g. Potatoe Cannon 2000"
                  tabIndex={1}
                  className="font-mono"
                />
              </div>

              <div className="col-span-4">
                <ProjectSelect
                  tabIndex={2}
                  value={project}
                  onChange={onProjectChange}
                  label="Project"
                  projectId={defaultProjectId}
                />
                <FormError className="mt-1" name="projectId" />
                {habits?.projects.length
                  ? renderProjectSuggestion(habits?.projects)
                  : null}
              </div>

              {activeMiniProducts.length === 0
                ? renderProductRequired()
                : showProductField
                  ? renderProductAndProjectFields()
                  : renderProjectFieldOnly(miniProducts[0])}

              {activeMiniProducts.length > 0 && habits?.productWorkflows.length
                ? renderProductSuggestion(habits?.productWorkflows)
                : null}

              <div className="col-span-4">
                <Label htmlFor="ticket-description" className="mb-1" optional>
                  Description
                </Label>
                <TipTapDecoration>
                  <TiptapForm
                    name="description"
                    placeholder="Describe the task, use :emoji, mention @people and link #ticket"
                    showToolbar="minimal"
                    className="max-h-80 overflow-y-auto rounded-t-md border border-gray-300 p-2"
                  />
                </TipTapDecoration>
              </div>
            </div>
            <div className="mt-5 flex flex-col justify-between sm:mt-4 sm:flex-row sm:items-center ">
              <div className="flex-0 mb-4 sm:mb-0">
                <FormCheckboxGroup
                  id="ticket-batch-create"
                  name="batchCreate"
                  label="Keep modal open"
                />
              </div>
              <div className="sm:flex sm:flex-row-reverse">
                {renderSubmitButton()}

                <Button
                  onClick={props.onClose}
                  type="button"
                  btnType="secondaryWhite"
                  tabIndex={6}
                  fullInMobile
                  className="mt-3 sm:mt-0"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

const CREATE_TICKET_MUTATION = gql`
  mutation CreateTicket($input: CreateTicketInput!) {
    createTicket(input: $input) {
      id
      title
      status
      workflow {
        id
      }
      product {
        id
      }
      project {
        id
        name
        parentId
      }
    }
  }
`;

const GET_MINI_PRODUCTS_QUERY = gql`
  query getMiniProductsForTicketCreate {
    miniProducts {
      id
      name
      stage
    }
  }
`;
