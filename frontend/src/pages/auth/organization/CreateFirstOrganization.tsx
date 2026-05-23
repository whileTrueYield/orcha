import React from "react";
import * as yup from "yup";
import { NewOrganizationFields } from "../formFields";
import { FormInputGroup } from "components/fields/Input";
import { useForm, FormProvider } from "react-hook-form";
import { gql } from "@apollo/client";
import { MutationCreateOrganizationArgs } from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { Link, useHistory } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { AuthScreenContainer } from "../Login/AuthScreenContainer";
import { ChevronLeftIcon } from "@heroicons/react/solid";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { roleFormFields } from "pages/user/formFields";
import { MutationReturnValue } from "types/queryTypes";

const schema = yup.object().noUnknown().defined().shape({
  name: NewOrganizationFields.name.required(),
  userName: roleFormFields.name.required(),
});

type FormSchema = yup.InferType<typeof schema>;

const CreateFirstOrganization: React.FC = () => {
  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });
  const history = useHistory();

  usePageTitle("Create Organization");

  const [createOrganization] = useBlockingMutation<
    MutationReturnValue["createOrganization"],
    MutationCreateOrganizationArgs
  >(CREATE_ORGANIZATION_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Organization Created",
      callback: (data) => {
        const { organization, project } = data.createOrganization;
        history.push(urlResolver.explorer.editor(organization.id, project.id));
      },
    }),
    onError: onGraphQLError({
      title: "Could not create organization",
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
    createOrganization({ variables: { input: { ...formData, timeZone } } });
  };

  return (
    <AuthScreenContainer>
      <h2 className="mt-6 text-center text-3xl font-extrabold leading-9 text-gray-600">
        Let's get started!
      </h2>
      <p className="mt-4 px-4 text-center text-sm text-gray-500">
        Please enter your company name to create your organization.
      </p>
      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="px-4 py-5 sm:p-6">
              <div className="mt-4">
                <Label htmlFor="name" className="mb-1" required>
                  Organization's Name
                </Label>
                <FormInputGroup
                  type="text"
                  name="name"
                  id="name"
                  placeholder="e.g. Able inc."
                  autoFocus
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="userName" className="mb-1">
                  Your name within this organization
                </Label>
                <FormInputGroup
                  id="userName"
                  type="text"
                  name="userName"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>
            <div className="flex flex-col justify-between  px-4 py-4 sm:flex-row sm:px-6">
              <Button
                btnType="white"
                fullInMobile
                asElement={(classname) => (
                  <Link to={urlResolver.auth.logout()} className={classname}>
                    <ChevronLeftIcon className="mr-1 -ml-1 h-4 w-4" />
                    Logout
                  </Link>
                )}
              />
              <Button
                type="submit"
                btnType="primary"
                fullInMobile
                className="mt-4 sm:mt-0"
              >
                Create new Organization
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </AuthScreenContainer>
  );
};

const CREATE_ORGANIZATION_MUTATION = gql`
  mutation createFirstOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      organization {
        status
        id
        name
      }
      project {
        id
      }
    }
  }
`;

export default CreateFirstOrganization;
