import * as yup from "yup";
import React, { useState } from "react";
import { productFeatureFields } from "../formFields";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { FeatureGroup, MutationAddFeatureArgs } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { isEmptyString } from "utils/string";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  featureGroupId: number;
  className?: string;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    featureName: productFeatureFields.name.label("Feature Name"),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const ProductFeatureCreate: FCWithFragments<Props> = (props) => {
  const { featureGroupId, className } = props;
  const [isVisible, setIsVisible] = useState(false);
  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });
  const featureName = useWatch({
    control: formMethods.control,
    name: "featureName",
  });

  const [addFeature] = useBlockingMutation<
    { addFeature: FeatureGroup },
    MutationAddFeatureArgs
  >(MUTATION_ADD_FEATURE, {
    onCompleted: onMutationComplete({
      title: "Feature created",
      callback: () => formMethods.setValue("featureName", ""),
    }),
    onError: onGraphQLError({ title: "Could not create Feature" }),
  });

  const onSubmit = (formData: FormSchema) => {
    addFeature({
      variables: {
        featureGroupId,
        name: formData.featureName,
      },
    });
  };

  if (!isVisible) {
    return (
      <div className={className}>
        <Button
          block
          btnType="secondaryWhite"
          onClick={() => setIsVisible(true)}
        >
          <PlusIcon className="h-4 w-4" />
          Add New Feature
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...formMethods}>
      <form className={className} onSubmit={formMethods.handleSubmit(onSubmit)}>
        <div className="flex flex-col sm:flex-row">
          <div className="flex-grow">
            <FormInputGroup
              name="featureName"
              type="text"
              placeholder="e.g. Checkout Detail"
              autoFocus
            />
          </div>
          <div className="mt-3 flex-none sm:ml-3 sm:mt-0">
            <Button
              disabled={isEmptyString(featureName)}
              type="submit"
              btnType="white"
              block
            >
              <PlusIcon className="mr-1 h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

ProductFeatureCreate.fragments = {
  ProductFeatureCreateFields: gql`
    fragment ProductFeatureCreateFields on FeatureGroup {
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

const MUTATION_ADD_FEATURE = gql`
  mutation AddFeature($featureGroupId: Int!, $name: String!) {
    addFeature(featureGroupId: $featureGroupId, name: $name) {
      ...ProductFeatureCreateFields
    }
  }
  ${ProductFeatureCreate.fragments.ProductFeatureCreateFields}
`;
