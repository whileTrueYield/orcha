import React from "react";
import {
  Product,
  MutationAddFeatureGroupArgs,
  MutationDeleteFeatureGroupArgs,
} from "types/graphql";
import { gql } from "@apollo/client";
import * as yup from "yup";
import { productFeatureGroupFields } from "../formFields";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, FormProvider } from "react-hook-form";
import { onMutationComplete, onGraphQLError } from "utils/GQLClient";
import { PlusIcon } from "@heroicons/react/solid";
import { ProductFeatureGroupEdit } from "./ProductFeatureGroupEdit";
import { FCWithFragments } from "types";
import { Label } from "components/fields/Label";
import { FormInputGroup } from "components/fields/Input";
import { Button } from "components/fields/Button";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  product: Product;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    featureGroupName: productFeatureGroupFields.name.label("Name"),
  });

type FormSchema = yup.InferType<typeof schema>;

export const ProductFeatureGroupManage: FCWithFragments<Props> = (props) => {
  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });
  const { product } = props;
  const featureGroups = product.featureGroups.nodes;
  const productId = product.id;

  const [addFeatureGroup] = useBlockingMutation<
    { addFeatureGroup: Product },
    MutationAddFeatureGroupArgs
  >(MUTATION_ADD_FEATURE_GROUP, {
    onCompleted: onMutationComplete({
      title: "Feature Group created",
      callback: () => formMethods.reset(),
    }),
    onError: onGraphQLError({ title: "Could not create Feature Group" }),
  });

  const [deleteFeatureGroup] = useBlockingMutation<
    { deleteFeatureGroup: Product },
    MutationDeleteFeatureGroupArgs
  >(MUTATION_DELETE_FEATURE_GROUP, {
    onCompleted: onMutationComplete({ title: "Feature Group deleted" }),
    onError: onGraphQLError({ title: "Could not delete Feature Group" }),
  });

  const onSubmit = (formData: FormSchema) => {
    addFeatureGroup({
      variables: {
        productId,
        name: formData.featureGroupName,
      },
    });
  };

  const displayFeatures = () => (
    <div className="overflow-hidden border bg-white sm:rounded-md">
      <ul>
        {featureGroups.map((featureGroup) => (
          <li key={`feature-group-${featureGroup.id}`}>
            <ProductFeatureGroupEdit
              onDelete={(featureGroupId: number) =>
                deleteFeatureGroup({ variables: { featureGroupId } })
              }
              featureGroup={featureGroup}
            />
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="mt-5 md:col-span-2 md:mt-0">
      {displayFeatures()}
      <div className="mt-6">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Label htmlFor="newFeatureGroupName">
              Create a new feature group
            </Label>
            <div className="mt-1 flex flex-col sm:flex-row">
              <div className="flex-grow">
                <FormInputGroup
                  name="featureGroupName"
                  id="newFeatureGroupName"
                  type="text"
                  placeholder="e.g. Checkout"
                  description="A feature group name should be unique within the product"
                >
                  <Button type="submit" btnType="primary" btnGroup="end">
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Create
                  </Button>
                </FormInputGroup>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

ProductFeatureGroupManage.fragments = {
  ProductFeatureManageFields: gql`
    fragment ProductFeatureManageFields on Product {
      id
      featureGroups(first: 50) {
        nodes {
          ...ProductFeatureGroupEditFields
        }
      }
    }
    ${ProductFeatureGroupEdit.fragments.ProductFeatureGroupEditFields}
  `,
};

const MUTATION_ADD_FEATURE_GROUP = gql`
  mutation AddFeatureGroup($productId: Int!, $name: String!) {
    addFeatureGroup(productId: $productId, name: $name) {
      ...ProductFeatureManageFields
    }
  }
  ${ProductFeatureGroupManage.fragments.ProductFeatureManageFields}
`;

const MUTATION_DELETE_FEATURE_GROUP = gql`
  mutation DeleteFeatureGroup($featureGroupId: Int!) {
    deleteFeatureGroup(featureGroupId: $featureGroupId) {
      ...ProductFeatureManageFields
    }
  }
  ${ProductFeatureGroupManage.fragments.ProductFeatureManageFields}
`;
