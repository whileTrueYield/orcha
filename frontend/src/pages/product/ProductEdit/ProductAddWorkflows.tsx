import { useMemo, useState } from "react";
import { map } from "lodash";
import {
  CustomMultiSelect,
  RenderButtonParams,
  SelectOption,
} from "components/fields/CustomMultiSelect";
import { Workflow, Product } from "types/graphql";
import { gql, useQuery } from "@apollo/client";
import { FCWithFragments } from "types";
import { PlusOnIcon } from "components/icons/PlusOnIcon";
import { CollectionIcon } from "@heroicons/react/outline";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  product: Product;
  className?: string;
  addWorkflows: (workflows: Workflow[]) => void;
  removeWorkflows: (workflows: Workflow[]) => void;
}

export const ProductAddWorkflows: FCWithFragments<Props> = (props) => {
  const { className, product, addWorkflows, removeWorkflows } = props;

  const [query, setQuery] = useState("");

  const paginationVariables = { first: 20, search: query, offset: 0 };

  const { data } = useQuery<QueryReturnValue["workflows"]>(
    GET_WORKFLOWS_FOR_PRODUCT,
    {
      variables: { ...paginationVariables },
    }
  );

  const dbWorkflows = data?.workflows.nodes;

  const options: SelectOption<Workflow>[] = useMemo(
    () =>
      map(dbWorkflows, (workflow: Workflow) => ({
        value: workflow,
        label: workflow.name,
      })),
    [dbWorkflows]
  );

  const renderButton = ({ setOpen, isOpen }: RenderButtonParams<Workflow>) => (
    <button
      type="button"
      onClick={() => setOpen(!isOpen)}
      className="group flex h-[92px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400 "
    >
      <PlusOnIcon
        className="text-gray-500"
        plusIconClassName="w-4 h-4 bg-gray-100"
      >
        <CollectionIcon className="h-6 w-6" />
      </PlusOnIcon>
      <span className="mt-1 block text-sm font-medium text-gray-600">
        Add Workflow
      </span>
    </button>
  );

  // create series of fake member object for comparison
  const workflows = map(product.workflowIds, (id) => ({ id }));

  return (
    <div className={className}>
      <CustomMultiSelect<Workflow>
        renderButton={renderButton}
        options={options}
        onSearch={(query: string) => setQuery(query)}
        values={workflows as any}
        identityMethod={(v) => v.id}
        onSelect={addWorkflows}
        onDeselect={removeWorkflows}
        checkmarks
      />
    </div>
  );
};

ProductAddWorkflows.fragments = {
  ProductAddWorkflows_WorkflowFragment: gql`
    fragment ProductAddWorkflows_WorkflowFragment on Workflow {
      id
      name
    }
  `,
};

const GET_WORKFLOWS_FOR_PRODUCT = gql`
  query getWorkflowForProduct($first: Int!, $search: String, $offset: Int) {
    workflows(first: $first, search: $search, offset: $offset) {
      totalCount
      nodes {
        ...ProductAddWorkflows_WorkflowFragment
      }
    }
  }
  ${ProductAddWorkflows.fragments.ProductAddWorkflows_WorkflowFragment}
`;
