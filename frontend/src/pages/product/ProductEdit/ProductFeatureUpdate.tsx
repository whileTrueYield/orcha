import * as yup from "yup";
import React, { useState } from "react";
import { productFeatureFields } from "../formFields";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { Feature, MutationUpdateFeatureArgs } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Button } from "components/fields/Button";
import { PopMenu } from "components/modals/PopMenu";
import { Menu } from "@headlessui/react";
import { DangerConfirm } from "components/modals/DangerConfirm";
import {
  CheckIcon,
  TrashIcon,
  XIcon,
  DotsVerticalIcon,
} from "@heroicons/react/solid";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  feature: Feature;
  className?: string;
  onDelete: (featureId: number) => void;
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

export const ProductFeatureUpdate: FCWithFragments<Props> = (props) => {
  const { feature, className } = props;
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const featureId = feature.id;
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { featureName: feature.name },
  });

  const [updateFeature] = useBlockingMutation<
    { updateFeature: Feature },
    MutationUpdateFeatureArgs
  >(MUTATION_UPDATE_FEATURE, {
    onCompleted: onMutationComplete({ title: "Feature updated" }),
    onError: onGraphQLError({ title: "Could not create Feature" }),
  });

  const onSubmit = (formData: FormSchema) => {
    updateFeature({
      variables: {
        featureId,
        input: { name: formData.featureName },
      },
    });
  };

  return (
    <div className={className}>
      <DangerConfirm
        cta="Yes, Delete"
        description="Are you sure you want to delete this feature? This may negatively impact your auto-pilot"
        onConfirm={() => props.onDelete(featureId)}
        onClose={() => setIsConfirmModalVisible(false)}
        title={`Delete Feature "${feature.name}"?`}
        visible={isConfirmModalVisible}
      />
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <div className="flex flex-col sm:flex-row">
            <div className="flex-grow">
              <FormInputGroup
                name="featureName"
                id="newFeatureName"
                type="text"
                placeholder="e.g. Checkout Detail"
              >
                <PopMenu
                  direction="bottom-left"
                  options={[
                    {
                      label: "Rename",
                      type: "submit",
                      icon: (className) => <CheckIcon className={className} />,
                    },
                    {
                      label: "Deprecate",
                      type: "button",
                      onClick: () => console.warn("deprecated"),
                      icon: (className) => <XIcon className={className} />,
                    },
                    {
                      type: "separator",
                    },
                    {
                      label: "Delete",
                      type: "button",
                      danger: true,
                      onClick: () => setIsConfirmModalVisible(true),
                      icon: (className) => <TrashIcon className={className} />,
                    },
                  ]}
                >
                  <Button
                    type="button"
                    btnGroup="end"
                    btnType="gray"
                    asElement={(className) => (
                      <Menu.Button className={className}>
                        <DotsVerticalIcon className="h-5 w-5 leading-5 text-gray-500" />
                      </Menu.Button>
                    )}
                  />
                </PopMenu>
              </FormInputGroup>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

ProductFeatureUpdate.fragments = {
  ProductFeatureUpdateFields: gql`
    fragment ProductFeatureUpdateFields on Feature {
      id
      name
    }
  `,
};

const MUTATION_UPDATE_FEATURE = gql`
  mutation UpdateFeature($featureId: Int!, $input: UpdateFeatureInput!) {
    updateFeature(featureId: $featureId, input: $input) {
      ...ProductFeatureUpdateFields
    }
  }
  ${ProductFeatureUpdate.fragments.ProductFeatureUpdateFields}
`;
