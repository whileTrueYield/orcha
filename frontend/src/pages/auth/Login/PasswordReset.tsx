import React from "react";
import { passwordResetFields } from "../formFields";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { gql } from "@apollo/client";
import { MutationPasswordResetArgs, Me } from "types/graphql";
import { Link, useHistory } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { AuthScreenContainer } from "./AuthScreenContainer";
import { Panel } from "components/views/Panel";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { getFirstFromQuery } from "utils";
import { useAppDispatch } from "store";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { getProofOfWork } from "./getProofOfWork";

const PASSWORD_RESET = gql`
  mutation passwordReset($input: PasswordResetInput!) {
    passwordReset(input: $input) {
      status
      role {
        id
        type
        title
        name
      }
      user {
        id
        email
        status
      }
      organization {
        id
        name
      }
    }
  }
`;

const schema = yup
  .object({
    email: passwordResetFields.email,
    secret: passwordResetFields.secret,
    password: passwordResetFields.password,
  })
  .noUnknown();

type FormSchema = yup.InferType<typeof schema>;

export const PasswordReset: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  usePageTitle("Password Reset");

  // This ensure that we only capture the first query value for secret and
  // email since url query allow for multiple values for the same var
  const secret = getFirstFromQuery(document.location.search, "secret");
  const email = getFirstFromQuery(document.location.search, "email");

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      secret,
      email,
    },
  });

  const [passwordReset] = useBlockingMutation<
    { passwordReset: Me },
    MutationPasswordResetArgs
  >(PASSWORD_RESET, {
    onCompleted: onMutationComplete({
      title: "Password Reset Completed",
      subTitle: "Your new password has been set",
      callback: (data) => {
        const me = data.passwordReset;
        dispatch({ type: "LOGIN_SUCCESS", payload: me });
        history.push(urlResolver.auth.chooseOrganization());
      },
    }),
    onError: onGraphQLError({
      title: "Password reset failed",
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    const [proof, hash] = await getProofOfWork();
    passwordReset({ variables: { input: { ...formData, proof, hash } } });
  };

  return (
    <AuthScreenContainer>
      <h2 className="mt-6 text-center font-title text-3xl font-semibold leading-9 text-gray-600">
        Select a new password
      </h2>
      <p className="mt-4 px-4 text-center text-sm text-gray-500">
        You may now reset your password by filling up the form below.
      </p>

      <Panel className="mt-4 py-8 px-4 sm:px-10">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div>
              <Label
                htmlFor="password-reset-password"
                className="mb-1"
                additionalInfo={
                  <span className="text-sm text-gray-600">read-only</span>
                }
              >
                Your Email
              </Label>
              <FormInputGroup
                type="text"
                readOnly
                name="email"
                id="password-reset-email"
              />
            </div>
            <div className="mt-6">
              <Label htmlFor="password-reset-password" className="mb-1">
                New Password
              </Label>
              <FormInputGroup
                type="password"
                name="password"
                id="password-reset-password"
                placeholder="Your new password"
                autoFocus
              />
            </div>
            <FormInputGroup
              type="hidden"
              name="secret"
              id="password-reset-email"
            />

            <div className="mt-5 flex-col-reverse sm:mt-8 sm:flex sm:flex-row sm:justify-end">
              <Button
                btnType="secondaryWhite"
                className="mb-3 sm:mb-0 sm:mr-3"
                asElement={(className) => (
                  <Link to={urlResolver.auth.login} className={className}>
                    Cancel
                  </Link>
                )}
              />
              <Button type="submit" btnType="primary">
                Change my password
              </Button>
            </div>
          </form>
        </FormProvider>
      </Panel>
    </AuthScreenContainer>
  );
};
