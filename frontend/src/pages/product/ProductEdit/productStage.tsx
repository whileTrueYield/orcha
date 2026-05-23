import React from "react";
import { FCWithFragments } from "types";
import {
  ModelStage,
  MutationUpdateProductStageArgs,
  Product,
} from "types/graphql";
import { gql } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  product: Product;
}

export const ProductStage: FCWithFragments<Props> = (props) => {
  const { product } = props;
  const [updateProductStage] = useBlockingMutation<
    { updateProductStage: Product },
    MutationUpdateProductStageArgs
  >(MUTATE_UPDATE_WORKFLOW_STAGE, {
    onError: onGraphQLError({ title: "Could not update product lifecycle" }),
    onCompleted: onMutationComplete({
      title: "Product lifecycle has been updated",
    }),
    refetchQueries: ["getMiniProductsForTicketCreate", "GetMiniProducts"],
  });

  const onChange = (stage: ModelStage) => {
    updateProductStage({
      variables: {
        productId: product.id,
        stage,
      },
    });
  };

  if (product.stage === ModelStage.Draft) {
    return <ProductDraftStage onChange={onChange} />;
  } else if (product.stage === ModelStage.Archived) {
    return <ProductArchivedStage onChange={onChange} />;
  } else if (product.stage === ModelStage.Published) {
    return <ProductPublishedStage onChange={onChange} />;
  }

  return null;
};

interface ProductStageChange {
  onChange: (stage: ModelStage) => void;
}

const ProductDraftStage: React.FC<ProductStageChange> = (props) => {
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Draft Product
      </h3>
      <div className="mt-2 sm:flex sm:items-start sm:justify-between">
        <div className="max-w-xl text-sm text-gray-500">
          <p>
            This product is in Draft, it may not be use by tickets yet. Publish
            this product to let your team use it.
          </p>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
          <Button
            type="button"
            btnType="primary"
            onClick={() => props.onChange(ModelStage.Published)}
          >
            Publish Product
          </Button>
        </div>
      </div>
    </>
  );
};

const ProductPublishedStage: React.FC<ProductStageChange> = (props) => {
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Published Product
      </h3>
      <div className="mt-2 sm:flex sm:items-start sm:justify-between">
        <div className="max-w-xl text-sm text-gray-500">
          <p>
            This product is available for your team to use. You may archive it
            to prevent further use, existing ticket using this product will
            remain functioning.
          </p>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
          <Button
            type="button"
            btnType="warning"
            onClick={() => props.onChange(ModelStage.Archived)}
          >
            Archive Product
          </Button>
        </div>
      </div>
    </>
  );
};

const ProductArchivedStage: React.FC<ProductStageChange> = (props) => {
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Archived Product
      </h3>
      <div className="mt-2 sm:flex sm:items-start sm:justify-between sm:space-x-2">
        <div className="max-w-xl text-sm text-gray-500">
          <p>
            This product has been archived. You may re-publish this product and
            start using again.
          </p>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
          <Button
            type="button"
            btnType="primary"
            onClick={() => props.onChange(ModelStage.Published)}
          >
            Publish Product
          </Button>
        </div>
      </div>
    </>
  );
};

ProductStage.fragments = {
  ProductStageDetails: gql`
    fragment ProductStageDetails on Product {
      id
      stage
    }
  `,
};

const MUTATE_UPDATE_WORKFLOW_STAGE = gql`
  mutation UpdateProductStage($stage: ModelStage!, $productId: Int!) {
    updateProductStage(stage: $stage, productId: $productId) {
      ...ProductStageDetails
    }
  }
  ${ProductStage.fragments.ProductStageDetails}
`;
