import { gql, useQuery } from "@apollo/client";
import { usePagination } from "hooks/usePagination";
import { Paginator } from "components/views/Paginator";
import { Link, useParams } from "react-router-dom";
import { FCWithFragments } from "types";
import {
  MutationAddWorkflowsArgs,
  MutationRemoveWorkflowsArgs,
  Workflow,
  Product,
  MutationUpdateProductUseGlobalWorkflowArgs,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { urlResolver } from "utils/navigation";
import { idsAsNumber } from "utils/string";
import { ProductAddWorkflows } from "./ProductAddWorkflows";
import { XIcon } from "@heroicons/react/solid";
import { Panel, PanelBody } from "components/views/Panel";
import { useBlockingMutation } from "utils/graphql";
import { ToggleButton } from "components/fields/ToggleButton";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";

interface Props {
  productId: number;
}

export const ProductWorkflowList: FCWithFragments<Props> = (props) => {
  const productId = props.productId;
  const { orgId } = useParams<{ orgId: string }>();

  const pagination = usePagination({
    pageSize: 6,
  });

  const paginationVariables = {
    first: pagination.pageSize,
    offset: pagination.pageSize * pagination.page,
  };

  const { data, loading, refetch } = useQuery<QueryReturnValue["product"]>(
    GET_WORKFLOWS,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        id: productId,
        ...paginationVariables,
      },
      onError: onGraphQLError({ title: "Retrieve product workflows error" }),
    }
  );

  const [updateProductUseGlobalWorkflow] = useBlockingMutation<
    MutationReturnValue["updateProductUseGlobalWorkflow"],
    MutationUpdateProductUseGlobalWorkflowArgs
  >(MUTATE_UPDATE_PRODUCT_GLOBAL_WORKFLOW, {
    onError: onGraphQLError({ title: "Could not change glboal workflow use" }),
    onCompleted: onMutationComplete({
      title: "Global Workflow use updated",
    }),
  });

  const [addWorkflows] = useBlockingMutation<
    { addWorkflows: Product },
    MutationAddWorkflowsArgs
  >(MUTATE_ADD_WORKFLOWS, {
    onError: onGraphQLError({ title: "Could not add workflows to product" }),
    onCompleted: onMutationComplete({
      title: "Workflow added",
      callback: () => refetch(),
    }),
  });

  const [removeWorkflows] = useBlockingMutation<
    { removeWorkflows: Product },
    MutationRemoveWorkflowsArgs
  >(MUTATE_REMOVE_WORKFLOWS, {
    onError: onGraphQLError({
      title: "Could not remove workflows from product",
    }),
    onCompleted: onMutationComplete({
      title: "Workflow removed",
      callback: () => refetch(),
    }),
  });

  const product = data?.product;

  if (loading) {
    return null;
  }

  if (!product) {
    return null;
  }

  const workflows = product.workflows.nodes;
  const total = product.workflows.totalCount;

  const onRemoveWorkflows = (roles: Workflow[]) => {
    removeWorkflows({
      variables: {
        productId: product.id,
        workflowIds: idsAsNumber(roles),
        ...paginationVariables,
      },
    });
  };

  const onAddWorkflows = (roles: Workflow[]) => {
    addWorkflows({
      variables: {
        productId: product.id,
        workflowIds: idsAsNumber(roles),
        ...paginationVariables,
      },
    });
  };

  const renderWorkflow = (workflow: Workflow) => (
    <li key={`workflow-${workflow.id}`}>
      <div className="group relative flex w-full items-center justify-between rounded-lg bg-white p-6 shadow">
        <button
          onClick={() => onRemoveWorkflows([workflow])}
          className="absolute right-0 top-0 flex translate-x-3 -translate-y-3 transform justify-items-center rounded-full border-2 border-white bg-red-500 p-0.5 opacity-0 shadow transition-opacity duration-300 hover:bg-red-600 group-hover:opacity-100"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
        <div className="flex-1 truncate">
          <div className="justify-center truncate">
            <Link
              to={urlResolver.workflow.edit(orgId, workflow.id)}
              className="truncate font-medium text-gray-900 hover:underline"
            >
              {workflow.name}
            </Link>
            <p className="truncate text-sm text-gray-500">
              {workflow.description}
            </p>
          </div>
        </div>
      </div>
    </li>
  );

  return (
    <Panel>
      <PanelBody>
        <div className="md:grid md:grid-cols-3 md:gap-y-4 md:gap-x-6">
          <div className="hidden sm:block md:col-span-1">
            <div className="text-lg font-medium leading-6 text-gray-900">
              Workflows
            </div>
          </div>
          <div className="hidden flex-row justify-end sm:flex md:col-span-2">
            <ToggleButton
              leftLabel="Use Global Workflows"
              checked={product.isUsingDefaultWorkflows}
              onChange={(checked) => {
                updateProductUseGlobalWorkflow({
                  variables: {
                    productId: product.id,
                    useDefaultWorkflows: checked,
                  },
                });
              }}
            />
          </div>
          <div className="mb-2 flex flex-row items-center justify-between sm:hidden">
            <div className="flex-1 text-lg font-medium leading-6 text-gray-900">
              Workflows
            </div>
            <ToggleButton
              small
              leftLabel="Use Global Workflows"
              checked={product.isUsingDefaultWorkflows}
              onChange={(checked) => {
                updateProductUseGlobalWorkflow({
                  variables: {
                    productId: product.id,
                    useDefaultWorkflows: checked,
                  },
                });
              }}
            />
          </div>

          <div className="md:col-span-1">
            <div className="space-y-3 sm:px-2 md:px-0">
              {product.isUsingDefaultWorkflows ? (
                <>
                  <p className="text-sm leading-5 text-gray-500">
                    Your product is configured to use{" "}
                    <strong className="font-semibold text-brand-700">
                      all available global workflows.
                    </strong>
                  </p>
                  <p className="text-sm leading-5 text-gray-500">
                    You may use this section to set additional non-global
                    workflows to your product.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm leading-5 text-gray-500">
                    Your product is configured to{" "}
                    <strong className="font-semibold text-yellow-600">
                      only use workflows you have selected in this section.
                    </strong>
                  </p>
                  <p className="text-sm leading-5 text-gray-500">
                    You may add restricted and global workflows to this products
                    here.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 px-4 sm:px-0 md:col-span-2 md:mt-0 ">
            <ul className="grid grid-cols-1 gap-6 rounded-lg bg-gray-100 p-4 shadow-inner sm:grid-cols-2 md:grid-cols-2">
              {product.workflows.nodes.map((workflow) =>
                renderWorkflow(workflow)
              )}

              <ProductAddWorkflows
                product={product}
                addWorkflows={onAddWorkflows}
                removeWorkflows={onRemoveWorkflows}
              />
            </ul>
            <Paginator
              total={total}
              {...pagination}
              isLoading={loading}
              setPage={pagination.setPage}
              itemCount={workflows.length}
              itemName="workflow"
              className="mt-4"
            />
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
};

ProductWorkflowList.fragments = {
  ProductWorkflowList_WorkflowsFragment: gql`
    fragment ProductWorkflowList_WorkflowsFragment on Workflow {
      id
      description
      name
    }
  `,
};

const GET_WORKFLOWS = gql`
  query getProductWorkflowsForProductWorkflowList(
    $id: Int!
    $first: Int!
    $search: String
    $offset: Int
  ) {
    product(id: $id) {
      id
      isUsingDefaultWorkflows
      workflowIds
      workflows(first: $first, search: $search, offset: $offset) {
        totalCount
        nodes {
          ...ProductWorkflowList_WorkflowsFragment
        }
      }
    }
  }
  ${ProductWorkflowList.fragments.ProductWorkflowList_WorkflowsFragment}
`;

const MUTATE_REMOVE_WORKFLOWS = gql`
  mutation ProductRemoveWorkflows(
    $productId: Int!
    $workflowIds: [Int!]!
    $first: Int!
    $search: String
    $offset: Int
  ) {
    removeWorkflows(productId: $productId, workflowIds: $workflowIds) {
      id
      workflowIds
      workflows(first: $first, search: $search, offset: $offset) {
        totalCount
        nodes {
          ...ProductWorkflowList_WorkflowsFragment
        }
      }
    }
  }
  ${ProductWorkflowList.fragments.ProductWorkflowList_WorkflowsFragment}
`;

const MUTATE_UPDATE_PRODUCT_GLOBAL_WORKFLOW = gql`
  mutation updateProductUseGlobalWorkflow(
    $productId: Int!
    $useDefaultWorkflows: Boolean!
  ) {
    updateProductUseGlobalWorkflow(
      useDefaultWorkflows: $useDefaultWorkflows
      productId: $productId
    ) {
      id
      isUsingDefaultWorkflows
    }
  }
`;

const MUTATE_ADD_WORKFLOWS = gql`
  mutation ProductAddWorkflows(
    $productId: Int!
    $workflowIds: [Int!]!
    $first: Int!
    $search: String
    $offset: Int
  ) {
    addWorkflows(productId: $productId, workflowIds: $workflowIds) {
      id
      workflowIds
      workflows(first: $first, search: $search, offset: $offset) {
        totalCount
        nodes {
          ...ProductWorkflowList_WorkflowsFragment
        }
      }
    }
  }
  ${ProductWorkflowList.fragments.ProductWorkflowList_WorkflowsFragment}
`;
