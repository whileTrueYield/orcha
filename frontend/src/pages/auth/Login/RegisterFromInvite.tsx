import React from "react";
import { authRegisterFields } from "../formFields";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { gql } from "@apollo/client";
import { MutationRegisterArgs, Me } from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { Link, useHistory } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { AuthScreenContainer } from "./AuthScreenContainer";
import { Panel } from "components/views/Panel";
import { JSONToQuery, parseQuery } from "utils";
import { concat, first } from "lodash";
import { useAppDispatch } from "store";
import { ChevronRightIcon } from "@heroicons/react/solid";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { getProofOfWork } from "./getProofOfWork";

const REGISTER_FROM_INVITE_MUTATION = gql`
  mutation RegisterFromInvite($input: RegisterInput!) {
    registerFromInvite(input: $input) {
      status
      user {
        id
        email
        status
      }
    }
  }
`;

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    email: authRegisterFields.email.required(),
    password: authRegisterFields.password.min(12).required(),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const RegisterFromInvite: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const query = parseQuery(document.location.search);
  usePageTitle("Invite");

  // This ensure that we only capture the first query value for secret and
  // email since url query allow for multiple values for the same var
  const email = first(concat(query.email));

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { email },
  });

  const [registerFromInvite] = useBlockingMutation<
    { registerFromInvite: Me },
    MutationRegisterArgs
  >(REGISTER_FROM_INVITE_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Registration successful",
      callback: (data) => {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: data.registerFromInvite,
        });
        history.push(urlResolver.auth.chooseOrganization());
      },
    }),
    onError: onGraphQLError({
      title: "Registration failed",
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    const [proof, hash] = await getProofOfWork();
    registerFromInvite({
      variables: { input: { ...formData, proof, hash } },
    });
  };

  return (
    <AuthScreenContainer>
      <h2 className="mt-6 text-center text-3xl font-extrabold leading-9 text-gray-600">
        You have been invited
      </h2>
      <p className="mt-4 px-4 text-center text-sm text-gray-600">
        Please review and correct your name below if necessary.
      </p>
      <p className="mt-4 px-4 text-center text-sm text-gray-600">
        Note that <strong>you cannot modify your email</strong> for security
        reasons.
      </p>

      <Panel className="mt-4 py-8 px-4 sm:px-10">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="mt-4">
              <Label
                htmlFor="register-email"
                className="mb-1"
                additionalInfo={
                  <span className="text-sm text-gray-600">read-only</span>
                }
              >
                Your Email
              </Label>
              <FormInputGroup
                type="text"
                id="register-email"
                name="email"
                readOnly
                placeholder="Your professional email"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="register-password" className="mb-1">
                Pick a Password
              </Label>
              <FormInputGroup
                id="register-password"
                type="password"
                name="password"
                placeholder="must be 10 characters or more"
              />
            </div>

            <div className="mt-6 flex flex-row">
              <Button
                type="submit"
                btnType="primary"
                block
                disabled={formMethods.formState.isSubmitting}
              >
                Proceed to Invite
                <ChevronRightIcon className="ml-2 h-4 w-4 text-brand-100" />
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?
              <Link
                className="ml-1 text-sm font-medium text-brand-600 transition duration-150 ease-in-out hover:text-brand-500 focus:underline focus:outline-none"
                to={`${urlResolver.auth.login()}?${JSONToQuery({ email })}`}
              >
                Go to log in
              </Link>
            </div>
          </form>
        </FormProvider>
      </Panel>
    </AuthScreenContainer>
  );
};
