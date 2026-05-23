import { useEffect, useState } from "react";
import { useParams, RouteComponentProps } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Product, QueryProductArgs } from "types/graphql";

import { UploadZone } from "components/fields/UploadZone";
import { productFormFields } from "../formFields";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { MutationUpdateProductArgs } from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProductFeatureGroupManage } from "./ProductFeatureGroupManage";
import { onMutationComplete, onGraphQLError } from "utils/GQLClient";
import { FCWithFragments } from "types";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { ProductWorkflowList } from "./ProductWorkflowList";
import { Button } from "components/fields/Button";
import { PhotoAddIcon } from "components/assets/PhotoAddIcon";
import { Panel, PanelBody } from "components/views/Panel";
import { ProductStage } from "./productStage";
import { StageBadge } from "components/tags/StageBadge";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { useNavConfirmation } from "hooks/useNavConfirmation";
import { ProductSupportEmbed } from "./ProductSupportEmbed";
import { ToggleButton } from "components/fields/ToggleButton";
import { useSelector } from "react-redux";
import { hasAccessToSupport } from "reducers/selector";
import { Tag } from "components/tags/Tag";
import { QueryReturnValue } from "types/queryTypes";
import { FormTextarea } from "components/fields/Textarea";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: productFormFields.name,
    code: productFormFields.code,
    description: productFormFields.description,
    coverUrl: productFormFields.coverUrl,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface UrlParams {
  productId: string;
  orgId: string;
}

type Props = RouteComponentProps<{ productId: string }>;

export const ProductEdit: FCWithFragments<Props> = (props: Props) => {
  usePageTitle("Product Edit");
  const params = useParams<UrlParams>();
  const hasSupport = useSelector(hasAccessToSupport);
  const [editMode, _setEditMode] = useState(false);
  const productId = parseInt(params.productId);

  const { data, loading } = useQuery<
    QueryReturnValue["product"],
    QueryProductArgs
  >(GET_PRODUCT, {
    variables: {
      id: productId,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    onError: onGraphQLError({ title: "Retrieve product error" }),
    onCompleted: ({ product }) => {
      reset({
        name: product.name,
        code: product.code,
        description: product.description || "",
      });
      setCoverUrl(product.coverUrl);
      activateNavConfirmation(false);
    },
  });

  const [coverUrl, setCoverUrl] = useState<string | null | undefined>("");

  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });
  const {
    reset,
    setValue,
    formState: { errors, isDirty },
  } = formMethods;

  const {
    isConfirmNavVisible,
    onNavAccept,
    onNavCancel,
    activateNavConfirmation,
  } = useNavConfirmation(false);

  useEffect(() => {
    activateNavConfirmation(isDirty);
  }, [isDirty, activateNavConfirmation]);

  const [updateProduct] = useBlockingMutation<
    { updateProduct: Product },
    MutationUpdateProductArgs
  >(MUTATE_UPDATE_PRODUCT, {
    onError: onGraphQLError({ title: "Could not update product" }),
    onCompleted: onMutationComplete({
      title: "Product Updated",
      callback: () => setEditMode(false),
    }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }

      // update mini product cached name when we update the product's name
      cache.writeFragment({
        id: `MiniProduct:${data.updateProduct.id}`,
        fragment: gql`
          fragment miniProductUpdate on MiniProduct {
            id
            name
          }
        `,
        data: {
          id: data.updateProduct.id,
          name: data.updateProduct.name,
        },
      });
    },
  });

  const setEditMode = (editMode: boolean) => {
    _setEditMode(editMode);
    activateNavConfirmation(editMode && isDirty);
  };

  if (!data || loading) {
    return null;
  }

  const product = data.product;
  if (!product) {
    return null;
  }

  const onSubmit = (formData: FormSchema) => {
    if (product) {
      updateProduct({
        variables: {
          input: formData,
          productId: product.id,
        },
      });
    }
  };

  const clearCover = () => {
    setCoverUrl(null);
    setValue("coverUrl", null, { shouldDirty: true });
  };

  const renderSupportPanel = () => {
    if (product.isSupportActive) {
      return (
        <Panel>
          <PanelBody>
            <h3 className="flex flex-row items-center justify-between text-lg font-medium leading-6 text-gray-900">
              <span>Support Integration</span>
              <ToggleButton
                checked={product.isSupportActive}
                onChange={() =>
                  updateProduct({
                    variables: {
                      productId: product.id,
                      input: { isSupportActive: !product.isSupportActive },
                    },
                  })
                }
              />
            </h3>
            <ProductSupportEmbed productId={product.id} />
          </PanelBody>
        </Panel>
      );
    } else {
      return (
        <Panel>
          <PanelBody>
            <h3 className="flex flex-row items-center justify-between text-lg font-medium leading-6 text-gray-900">
              <span>Support Integration</span>
              <ToggleButton
                checked={product.isSupportActive}
                onChange={() =>
                  updateProduct({
                    variables: {
                      productId: product.id,
                      input: { isSupportActive: !product.isSupportActive },
                    },
                  })
                }
              />
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Orcha offers an easy to setup support integration for all your
              products.
            </p>
          </PanelBody>
        </Panel>
      );
    }
  };

  const displayCover = () => {
    if (product.coverUrl) {
      return (
        <img
          src={product.coverUrl}
          alt=""
          className="h-48 w-full rounded-t-lg object-cover"
        />
      );
    } else {
      return <div className="h-48 w-full rounded-t-lg object-cover" />;
    }
  };

  const renderReadOnlyView = () => (
    <div className="mx-2 rounded-lg bg-white shadow sm:mx-0 sm:mb-8">
      <div className="relative h-48 rounded-t-lg bg-gray-300">
        {displayCover()}
      </div>

      <div className="px-4 py-5 sm:p-0">
        <dl>
          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt className="text-sm font-medium leading-5 text-gray-500">
              Product name
            </dt>
            <dd className="mt-1 flex flex-row items-center space-x-2 leading-5 text-gray-800 sm:col-span-2 sm:mt-0">
              <span>{product.name}</span>
            </dd>
          </div>

          <div className="mt-8 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
            <dt className="text-sm font-medium leading-5 text-gray-500">
              Product code
            </dt>
            <dd className="mt-1 flex flex-row items-center space-x-2 leading-5 text-gray-800 sm:col-span-2 sm:mt-0">
              <Tag large>{product.code}</Tag>
            </dd>
          </div>

          {product.description ? (
            <div className="mt-8 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
              <dt className="text-sm font-medium leading-5 text-gray-500">
                Description
              </dt>
              <dd className="mt-1 text-sm leading-5 text-gray-800 sm:col-span-2 sm:mt-0">
                {product.description}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="my-4 flex flex-col justify-between space-y-2 px-4 sm:flex-row sm:space-y-0">
        <Button btnType="white" type="button" onClick={() => setEditMode(true)}>
          Edit Product
        </Button>
      </div>
    </div>
  );

  const renderEditView = () => (
    <Panel>
      <PanelBody>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {product.name}
          <StageBadge
            stage={product.stage}
            className="ml-4 align-text-bottom"
          />
        </h3>
        <p className="mt-1 text-sm leading-5 text-gray-500">
          You may describe your product using Markdown. The product code will be
          used to label ticket.
        </p>
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="col-span-3 sm:col-span-2">
                <Label htmlFor="product-name">Product Name</Label>
                <FormInputGroup
                  type="text"
                  name="name"
                  id="product-name"
                  placeholder="e.g. fou-du-roi"
                  className="mt-1"
                  autoFocus
                />
              </div>

              <div className="col-span-3 sm:col-span-1">
                <Label htmlFor="product-code">Product Code</Label>
                <FormInputGroup
                  type="text"
                  id="product-code"
                  name="code"
                  placeholder="e.g. XYZ"
                  className="mt-1 w-32 sm:w-auto"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="col-span-3 sm:col-span-2 md:col-span-3">
                <Label htmlFor="product-description" optional>
                  Description
                </Label>
                <FormTextarea
                  rows={6}
                  name="description"
                  aria-invalid={errors["description"] ? "true" : "false"}
                  aria-describedby={`content-field-error`}
                  placeholder="Post a comment, use :emoji, mention @people and link #ticket"
                />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="cover_photo">Product Banner</Label>
              <div className="mt-2">
                {coverUrl ? (
                  <div className="relative">
                    <img
                      src={coverUrl}
                      className="h-36 w-full overflow-hidden rounded-lg object-cover"
                      alt="profile cover"
                    />
                    <div
                      onClick={clearCover}
                      className="absolute inset-0 flex animate-pulse-once cursor-pointer items-center justify-center bg-white text-lg text-black opacity-0 transition-opacity duration-200 hover:opacity-75"
                    >
                      Click to change the product cover
                    </div>
                  </div>
                ) : null}
                <UploadZone
                  onUpload={(src) => {
                    activateNavConfirmation(true);
                    setCoverUrl(src);
                  }}
                  name="coverUrl"
                  className="mt-2 flex h-36 items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5 "
                  accept="image/*"
                  info="PNG, JPG, GIF up to 10MB"
                  icon={
                    <PhotoAddIcon className="mx-auto h-12 w-12 text-gray-400" />
                  }
                  isVisible={Boolean(coverUrl)}
                  category="organization"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col justify-end space-y-2 sm:flex-row sm:items-center sm:justify-end sm:space-x-2 sm:space-y-0">
              <Button
                type="button"
                btnType="secondaryWhite"
                fullInMobile
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
              <Button type="submit" btnType="primary">
                Update Product
              </Button>
            </div>
          </form>
        </FormProvider>
      </PanelBody>
    </Panel>
  );

  return (
    <>
      <WarningConfirm
        title="Discard Product Changes"
        description={
          "Are you sure you wish to discard the changes you made " +
          "to this product? Once discarded changes are permanently lost."
        }
        onClose={onNavCancel}
        cta="Yes, discard changes"
        onConfirm={onNavAccept}
        visible={isConfirmNavVisible}
      />
      <div className="flex flex-col space-y-6 px-2 pb-6 sm:px-0">
        {editMode ? renderEditView() : renderReadOnlyView()}

        <ProductWorkflowList productId={product.id} />

        {hasSupport ? renderSupportPanel() : null}

        <Panel>
          <PanelBody>
            <ProductStage product={product} />
          </PanelBody>
        </Panel>
      </div>
    </>
  );
};

ProductEdit.fragments = {
  ProductEditFields: gql`
    fragment ProductEditFields on Product {
      id
      isSupportActive
      name
      code
      description
      coverUrl
      isUsingDefaultWorkflows
    }
  `,
};

const GET_PRODUCT = gql`
  query getProductForEdit($id: Int!) {
    product(id: $id) {
      ...ProductEditFields
      ...ProductFeatureManageFields
      ...ProductStageDetails
      ...ProductSupportEmbedFragment
    }
  }
  ${ProductEdit.fragments.ProductEditFields}
  ${ProductFeatureGroupManage.fragments.ProductFeatureManageFields}
  ${ProductStage.fragments.ProductStageDetails}
  ${ProductSupportEmbed.fragments.ProductSupportEmbedFragment}
`;

const MUTATE_UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: UpdateProductInput!, $productId: Int!) {
    updateProduct(input: $input, productId: $productId) {
      ...ProductEditFields
      ...ProductFeatureManageFields
      ...ProductStageDetails
    }
  }
  ${ProductStage.fragments.ProductStageDetails}
  ${ProductEdit.fragments.ProductEditFields}
  ${ProductFeatureGroupManage.fragments.ProductFeatureManageFields}
`;
