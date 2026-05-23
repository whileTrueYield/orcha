import React, { useState } from "react";
import { gql } from "@apollo/client";
import { AuthScreenContainer } from "./AuthScreenContainer";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { useLogout } from "./useLogout";

const SEND_CONFIRMATION_EMAIL = gql`
  mutation SendConfirmationEmail {
    sendConfirmationEmail
  }
`;

export const SendConfirmationEmail: React.FC = () => {
  usePageTitle("Confirmation Email");
  const [sendConfirmationEmailSubmitted, setPasswordResetSubmitted] =
    useState(false);

  const [logOut] = useLogout();

  const [sendConfirmationEmail] = useBlockingMutation<{
    sendConfirmationEmail: boolean;
  }>(SEND_CONFIRMATION_EMAIL, {
    onCompleted: onMutationComplete({
      title: "Confirmation Email Sent",
      subTitle: "Check your email to confirm your account",
      callback: () => setPasswordResetSubmitted(true),
    }),
    onError: onGraphQLError({
      title: "Email confirm failed",
    }),
  });

  if (sendConfirmationEmailSubmitted) {
    return (
      <AuthScreenContainer>
        <img
          className="mx-auto w-64"
          src="/img/svg/undraw_Letter_re_8m03.svg"
          alt="Person throwing a paper plane"
        />
        <h2 className="mt-6 text-center font-title text-3xl font-semibold leading-9 text-gray-600">
          Email Validation Sent
        </h2>
        <p className="mt-4 px-4 text-center text-sm text-gray-500">
          Check your email for your confirmation email. You may close or refresh
          this window once you have validated your account.
        </p>
        <div className="mt-6">
          <Button block onClick={() => logOut()} btnType="gray" type="button">
            Log out
          </Button>
        </div>
      </AuthScreenContainer>
    );
  }

  return (
    <AuthScreenContainer>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-48 w-auto"
          src="/img/svg/undraw_secure_login_pdn4.svg"
          alt="Person standing next to a locked laptop"
        />
        <h2 className="mt-6 text-center font-title text-3xl font-semibold leading-9 text-gray-600">
          Email Verification Required
        </h2>
        <p className="mt-4 text-center text-sm text-gray-500">
          For security purpose, we require every email account to be verified.
          Please check your email account for a confirmation email. If you
          cannot find one, you may request a new one below.
        </p>
        <div className="mt-6 flex flex-row justify-between">
          <Button onClick={() => logOut()} btnType="gray" type="button">
            Log out
          </Button>
          <Button onClick={() => sendConfirmationEmail()} btnType="primary">
            Request a second confirmation email
          </Button>
        </div>
      </div>
    </AuthScreenContainer>
  );
};
