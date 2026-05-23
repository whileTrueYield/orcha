import React, { useState } from "react";
import { passwordLostFields } from "../formFields";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { gql } from "@apollo/client";
import { MutationPasswordLostArgs } from "types/graphql";
import { Link } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { AuthScreenContainer } from "./AuthScreenContainer";
import { Panel } from "components/views/Panel";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { getFirstFromQuery } from "utils";
import { ChevronLeftIcon } from "@heroicons/react/solid";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { getProofOfWork } from "./getProofOfWork";

const PASSWORD_LOST = gql`
  mutation PasswordLost($input: PasswordLostInput!) {
    passwordLost(input: $input)
  }
`;

const schema = yup.object({ email: passwordLostFields.email }).noUnknown();

type FormSchema = yup.InferType<typeof schema>;

export const PasswordLost: React.FC = () => {
  usePageTitle("Password Lost");
  const emailFromQuery = getFirstFromQuery(document.location.search, "email");
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { email: emailFromQuery },
  });

  const [passwordResetSubmitted, setPasswordResetSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>();

  const [passwordReset] = useBlockingMutation<
    { passwordReset: boolean },
    MutationPasswordLostArgs
  >(PASSWORD_LOST, {
    onCompleted: onMutationComplete({
      title: "Password Reset Requested",
      subTitle: "Check your email to reset your password",
      callback: () => setPasswordResetSubmitted(true),
    }),
    onError: onGraphQLError({
      title: "Password reset failed",
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    setSubmittedEmail(formData["email"]);
    const [proof, hash] = await getProofOfWork();
    passwordReset({ variables: { input: { ...formData, proof, hash } } });
  };

  if (passwordResetSubmitted) {
    return (
      <AuthScreenContainer>
        <h2 className="mt-6 text-center font-title text-3xl font-semibold leading-9 text-gray-600">
          Check your email
        </h2>
        <p className="mt-4 px-4 text-center text-sm text-gray-600">
          We've sent your verification link to <strong>{submittedEmail}</strong>
          <br />
          Please click on the link in that email to continue.
        </p>

        <div className="mt-6">
          <Button
            btnType="primary"
            block
            asElement={(classname) => (
              <Link to={urlResolver.auth.login()} className={classname}>
                <ChevronLeftIcon className="mr-2 h-4 w-4 text-white" />
                Back to Sign In
              </Link>
            )}
          ></Button>
        </div>
      </AuthScreenContainer>
    );
  }

  return (
    <AuthScreenContainer>
      <h2 className="mt-6 text-center font-title text-3xl font-semibold leading-9 text-gray-600">
        Forgot your password?
      </h2>
      <p className="mt-4 px-4 text-base text-gray-600">
        Enter your email address below. If you have an account with us, we'll
        send you a reset link
      </p>

      <Panel className="mt-4 py-8 px-4 sm:px-10">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="password-lost-email" className="mb-1">
                Email address
              </Label>
              <FormInputGroup
                type="email"
                name="email"
                id="password-lost-email"
                placeholder="The email you use to login to Orcha"
                autoFocus
              />
            </div>

            <div className="mt-6">
              <Button type="submit" btnType="primary" block>
                Request a password reset
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  to={urlResolver.auth.login()}
                  className="text-sm font-medium text-brand-700 transition duration-150 ease-in-out hover:text-brand-600 focus:underline focus:outline-none"
                >
                  Sign in
                </Link>
              </div>

              <div className="leading-5">
                <Link
                  to={urlResolver.auth.register()}
                  className="text-sm font-medium text-brand-700 transition duration-150 ease-in-out hover:text-brand-600 focus:underline focus:outline-none"
                >
                  Create an Account
                </Link>
              </div>
            </div>
          </form>
        </FormProvider>
      </Panel>
    </AuthScreenContainer>
  );
};
