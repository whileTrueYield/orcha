import { Panel, PanelBody } from "components/views/Panel";
import { OrganizationFields } from "../formFields";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { FCWithFragments } from "types";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { MutationUpdateOrganizationArgs, Organization } from "types/graphql";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { QueryReturnValue } from "types/queryTypes";

interface Props {}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: OrganizationFields.name.required(),
    address1: OrganizationFields.address1.required(),
    address2: OrganizationFields.address2.optional(),
    city: OrganizationFields.city.required(),
    state: OrganizationFields.state.required(),
    zipcode: OrganizationFields.zipcode.required(),
    country: OrganizationFields.country.required(),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const BillingView: FCWithFragments<Props> = (props) => {
  usePageTitle("Billing");
  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });

  useQuery<QueryReturnValue["organization"]>(QUERY_GET_ORGANIZATION, {
    fetchPolicy: "cache-and-network",
    onError: onGraphQLError({ title: "Retrieve organization error" }),
    onCompleted: ({ organization }) => {
      formMethods.reset({
        name: organization.name,
        address1: organization.billingAddress?.address1,
        address2: organization.billingAddress?.address2,
        zipcode: organization.billingAddress?.zipcode,
        city: organization.billingAddress?.city,
        state: organization.billingAddress?.state,
        country: organization.billingAddress?.country,
      });
      // setCoverUrl(organization.coverUrl);
    },
  });

  const [updateOrganization] = useBlockingMutation<
    { updateOrganization: Organization },
    MutationUpdateOrganizationArgs
  >(MUTATE_UPDATE_ORGANIZATION, {
    onError: onGraphQLError({ title: "Could not update organization" }),
    onCompleted: onMutationComplete({
      title: "Organization Updated",
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    updateOrganization({
      variables: {
        input: {
          name: formData.name,
          billingAddress: {
            address1: formData.address1,
            address2: formData.address2,
            zipcode: formData.zipcode,
            city: formData.city,
            state: formData.state,
            country: formData.country,
          },
        },
      },
    });
  };

  return (
    <div className="flex flex-col space-y-6 px-2 pb-6 sm:px-0">
      <Panel>
        <PanelBody>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Organization &amp; Billing Address
          </h3>
          <p className="mt-1 text-sm leading-5 text-gray-500">
            Update your billing information. Please note that updating your
            location could affect your tax rates.
          </p>
          <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)}>
              <div className="mt-4">
                <Label htmlFor="name" className="mb-1" required>
                  Organization's Name
                </Label>
                <FormInputGroup
                  type="text"
                  name="name"
                  id="name"
                  placeholder="e.g. Conroy inc."
                  autoFocus
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="address1" className="mb-1" required>
                  Street Address
                </Label>
                <FormInputGroup
                  type="text"
                  name="address1"
                  id="address1"
                  placeholder="e.g. 425 Diamond Cove"
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="address2" className="mb-1" optional>
                  Suite / Floor / Other...
                </Label>
                <FormInputGroup
                  type="text"
                  name="address2"
                  id="address2"
                  placeholder="Suite number, Floor number..."
                />
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-3 mt-4">
                    <Label htmlFor="city" className="mb-1" required>
                      City
                    </Label>
                    <FormInputGroup
                      type="text"
                      name="city"
                      id="city"
                      placeholder="e.g. Ashton"
                    />
                  </div>
                  <div className="col-span-2 mt-4">
                    <Label htmlFor="zipcode" className="mb-1" required>
                      Zip Code
                    </Label>
                    <FormInputGroup
                      type="text"
                      name="zipcode"
                      id="zipcode"
                      placeholder="e.g. 02864"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1 mt-4">
                  <Label htmlFor="state" className="mb-1" required>
                    State
                  </Label>
                  <FormInputGroup
                    type="text"
                    name="state"
                    id="state"
                    placeholder="e.g. Rhode Island"
                  />
                </div>

                <div className="col-span-1 mt-4">
                  <Label htmlFor="country" className="mb-1" required>
                    Country
                  </Label>
                  <FormInputGroup
                    type="text"
                    name="country"
                    id="country"
                    placeholder="USA"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-row-reverse">
                <Button fullInMobile btnType="primary" type="submit">
                  Update Address
                </Button>
                <Button
                  type="button"
                  fullInMobile
                  className="mr-2"
                  btnType="secondaryWhite"
                  onClick={() => formMethods.reset()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </FormProvider>
        </PanelBody>
      </Panel>
    </div>
  );
};

BillingView.fragments = {
  OrganizationEditFields: gql`
    fragment OrganizationEditFields on Organization {
      id
      name
      coverUrl
      billingAddress {
        address1
        address2
        zipcode
        city
        state
        country
      }
    }
  `,
};

const MUTATE_UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      ...OrganizationEditFields
    }
  }
  ${BillingView.fragments.OrganizationEditFields}
`;

const QUERY_GET_ORGANIZATION = gql`
  query GetOrganization {
    organization {
      ...OrganizationEditFields
    }
  }
  ${BillingView.fragments.OrganizationEditFields}
`;
