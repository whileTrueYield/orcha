import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { useHistory, useParams } from "react-router-dom";
import { productFormFields } from "../formFields";
import { gql } from "@apollo/client";
import { MutationCreateProductArgs, Product } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { FormTextareaGroup } from "components/fields/Textarea";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { DocumentAddIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";
import { GET_ONBOARDING_STATUS_QUERY } from "components/sidebar/Onboarding";

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      stage
    }
  }
`;

const schema = yup.object().noUnknown().defined().shape({
  name: productFormFields.name,
  code: productFormFields.code,
  description: productFormFields.description,
});

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {}

export const ProductCreateModal: React.FC<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const history = useHistory();
  const formContext = useForm<FormSchema>({ resolver: yupResolver(schema) });
  const [submitted, setSubmitted] = useState(false);

  const [createProduct] = useBlockingMutation<
    { createProduct: Product },
    MutationCreateProductArgs
  >(CREATE_PRODUCT_MUTATION, {
    refetchQueries: [GET_ONBOARDING_STATUS_QUERY], // this is to refresh the status of the onboarding
    onCompleted: onMutationComplete({
      title: "Product created",
      callback: (data) =>
        history.push(urlResolver.product.edit(orgId, data.createProduct.id)),
    }),
    onError: onGraphQLError({
      title: "Product creation failed",
      subTitle: "Please review your product definition",
      callback: () => setSubmitted(false),
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    setSubmitted(true);
    createProduct({ variables: { input: formData } });
  };

  return (
    <Modal {...props} initialFocusSelector="#product-name">
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
              Create a New Product
            </Dialog.Title>
            <div className="mt-2">
              <div className="mt-2">
                <Label htmlFor="product-name" className="mb-1">
                  Product Name
                </Label>
                <FormInputGroup
                  id="product-name"
                  name="name"
                  autoFocus
                  placeholder="e.g. Mobile Application"
                  tabIndex={1}
                />
              </div>
              <div className="mt-2">
                <Label htmlFor="product-code" className="mb-1">
                  Product Code
                </Label>
                <FormInputGroup
                  id="product-code"
                  name="code"
                  placeholder="e.g. PC2K"
                  tabIndex={2}
                  className="mt-1 w-32"
                />
              </div>
              <div className="mt-2">
                <Label htmlFor="product-description" className="mb-1" optional>
                  Description
                </Label>
                <FormTextareaGroup
                  id="product-description"
                  name="description"
                  tabIndex={3}
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                btnType="primary"
                tabIndex={4}
                fullInMobile
                disabled={submitted}
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Create Product
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                btnType="secondaryWhite"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                tabIndex={5}
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
