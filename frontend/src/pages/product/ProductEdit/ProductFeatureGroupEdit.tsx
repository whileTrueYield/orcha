import React, { useState } from "react";
import {
  FeatureGroup,
  MutationDeleteFeatureArgs,
  MutationUpdateFeatureGroupArgs,
} from "types/graphql";
import cn from "classnames";
import * as yup from "yup";
import { productFeatureFields } from "../formFields";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { gql } from "@apollo/client";
import { onMutationComplete, onGraphQLError } from "utils/GQLClient";
import { plural } from "utils/string";
import { Button } from "components/fields/Button";
import { ProductFeatureCreate } from "./ProductFeatureCreate";
import { map } from "lodash";
import { ProductFeatureUpdate } from "./ProductFeatureUpdate";
import { Legend } from "components/fields/Legend";
import { FCWithFragments } from "types";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { FormInputGroup } from "components/fields/Input";
import { ChevronRightIcon } from "@heroicons/react/solid";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  featureGroup: FeatureGroup;
  onDelete: (featureGroupId: number) => void;
  className?: string;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    featureName: productFeatureFields.name.label("Feature Group name"),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const ProductFeatureGroupEdit: FCWithFragments<Props> = (props) => {
  const { featureGroup, className } = props;
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const features = featureGroup.features.nodes;
  const featureGroupId = featureGroup.id;
  const [isOpened, setIsOpened] = useState(false);
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { featureName: featureGroup.name },
  });

  const [updateFeatureGroup] = useBlockingMutation<
    { updateFeatureGroup: FeatureGroup },
    MutationUpdateFeatureGroupArgs
  >(MUTATION_UPDATE_FEATURE_GROUP, {
    onError: onGraphQLError({ title: "Could not update Feature Group" }),
    onCompleted: onMutationComplete({ title: "Feature has been renamed" }),
  });

  const [deleteFeature] = useBlockingMutation<
    { deleteFeatureGroup: FeatureGroup },
    MutationDeleteFeatureArgs
  >(MUTATION_DELETE_FEATURE, {
    onError: onGraphQLError({ title: "Could not delete Feature" }),
    onCompleted: onMutationComplete({ title: "Feature has been deleted" }),
  });

  const formClasses = cn("bg-gray-100 py-4", {
    hidden: !isOpened,
  });

  const onSubmit = (formData: FormSchema) => {
    updateFeatureGroup({
      variables: {
        featureGroupId: featureGroup.id,
        input: { name: formData.featureName },
      },
    });
  };

  const displayNoFeatures = () => (
    <div className="flex h-16 items-center justify-center text-base text-gray-500">
      This group does not contain any features yet
    </div>
  );

  const displayFeatures = () => (
    <div className="mb-2">
      {map(features, (feature) => (
        <ProductFeatureUpdate
          key={feature.id}
          feature={feature}
          className="mt-2"
          onDelete={(featureId: number) =>
            deleteFeature({ variables: { featureId } })
          }
        />
      ))}
    </div>
  );

  return (
    <div className={className}>
      <DangerConfirm
        cta="Yes, Delete"
        description="Are you sure you want to delete this feature group ? This will delete all the features it contains and is likely to negatively impact your auto-pilot"
        onConfirm={() => props.onDelete(featureGroupId)}
        onClose={() => setIsConfirmModalVisible(false)}
        title={`Delete Feature Group "${featureGroup.name}"?`}
        visible={isConfirmModalVisible}
      />
      <button
        type="button"
        onClick={() => setIsOpened(!isOpened)}
        className="block w-full border-b border-gray-100 transition duration-150 ease-in-out hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
      >
        <div className="flex items-center px-2 py-4 sm:px-3">
          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex w-full flex-row items-center text-sm">
              <div className="flex-none leading-5 text-gray-700">
                <ChevronRightIcon
                  className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                    isOpened ? "rotate-90" : ""
                  }`}
                />
              </div>
              <div className="ml-2 truncate font-medium leading-5">
                {featureGroup.name}
                <span className="ml-2 text-sm font-normal text-gray-500 transition-all duration-300">
                  {plural("({} feature)", "({} features)", features)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </button>
      <div className={formClasses}>
        <div className="px-4">
          <Legend> {plural("Feature", "Features", features)}</Legend>
          {features.length > 0 ? displayFeatures() : displayNoFeatures()}
          <ProductFeatureCreate featureGroupId={featureGroupId} />
        </div>
        <FormProvider {...formMethods}>
          <form className="mt-4" onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="px-4">
              <Legend htmlFor={`update-group-name-${featureGroupId}`}>
                Feature Group
              </Legend>
              <FormInputGroup
                placeholder="e.g. Checkout"
                name="featureName"
                className="mt-2"
                id={`update-group-name-${featureGroupId}`}
              />
            </div>
            <div className="mt-4 px-4">
              <div className="flex flex-row justify-between">
                <div>
                  <Button
                    type="button"
                    onClick={() => setIsConfirmModalVisible(true)}
                    btnType="secondaryDanger"
                  >
                    <span className="hidden sm:inline">Delete Group</span>
                    <span className="sm:hidden">Delete</span>
                  </Button>
                </div>
                <div className="flex">
                  <Button
                    type="button"
                    btnType="secondaryWhite"
                    onClick={() => setIsOpened(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!formMethods.formState.isDirty}
                    className="ml-2"
                    type="submit"
                    btnType="white"
                  >
                    <span className="hidden sm:inline">Rename Group</span>
                    <span className="sm:hidden">Rename</span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

ProductFeatureGroupEdit.fragments = {
  ProductFeatureGroupEditFields: gql`
    fragment ProductFeatureGroupEditFields on FeatureGroup {
      id
      name
      features(first: 50) {
        nodes {
          id
          name
        }
      }
    }
  `,
};

const MUTATION_UPDATE_FEATURE_GROUP = gql`
  mutation UpdateFeatureGroup(
    $featureGroupId: Int!
    $input: UpdateFeatureGroupInput!
  ) {
    updateFeatureGroup(featureGroupId: $featureGroupId, input: $input) {
      ...ProductFeatureGroupEditFields
    }
  }
  ${ProductFeatureGroupEdit.fragments.ProductFeatureGroupEditFields}
`;

const MUTATION_DELETE_FEATURE = gql`
  mutation DeleteFeature($featureId: Int!) {
    deleteFeature(featureId: $featureId) {
      ...ProductFeatureGroupEditFields
    }
  }
  ${ProductFeatureGroupEdit.fragments.ProductFeatureGroupEditFields}
`;
