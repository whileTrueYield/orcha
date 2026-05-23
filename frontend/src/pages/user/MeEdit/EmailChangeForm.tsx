import { gql } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { passwordResetFields } from "pages/auth/formFields";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { MutationChangeEmailArgs, User } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import * as yup from "yup";

interface Props {
  user: User;
}

const schema = yup
  .object({
    email: passwordResetFields.email,
    newEmail: passwordResetFields.email.label("New email"),
    password: passwordResetFields.password,
  })
  .noUnknown();

type FormSchema = yup.InferType<typeof schema>;

export const EmailChangeForm: React.FC<Props> = (props) => {
  const [showWarning, setShowWarning] = useState(false);
  const { user } = props;

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: user.email,
    },
  });

  const [changeEmail] = useBlockingMutation<
    { changeEmail: User },
    MutationChangeEmailArgs
  >(CHANGE_PASSWORD_MUTATION, {
    onError: onGraphQLError({ title: "Could not change your email" }),
    onCompleted: onMutationComplete({
      title: "Your email has been changed",
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    if (showWarning) {
      changeEmail({
        variables: {
          input: {
            password: formData.password,
            email: formData.newEmail,
          },
        },
      });
    } else {
      setShowWarning(true);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <DangerConfirm
        title="Confirm Email Change"
        description="Are you sure you want to change your email? This will not disconnect any
        other person already connected."
        cta="Yes, my change email"
        visible={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={() => formMethods.handleSubmit(onSubmit)()}
      />
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:max-w-sm">
            <Label
              htmlFor="email-change-email"
              className="mb-1"
              additionalInfo={
                <span className="text-sm text-gray-600">read-only</span>
              }
            >
              Your Current Email
            </Label>
            <FormInputGroup
              type="text"
              readOnly
              name="email"
              id="email-change-email"
            />
          </div>
          <div className="sm:mt-0 sm:max-w-sm">
            <Label htmlFor="email-change-password" className="mb-1">
              Confirm Current Password
            </Label>
            <FormInputGroup
              type="password"
              name="password"
              id="email-change-password"
              placeholder="Your current password"
            />
          </div>
        </div>
        <div className="mt-6 sm:max-w-sm">
          <Label htmlFor="email-change-new-email" className="mb-1">
            Your New Email
          </Label>
          <FormInputGroup
            type="text"
            name="newEmail"
            id="email-change-new-email"
          />
        </div>

        <div className="mt-5 flex flex-row justify-end sm:mt-8">
          <Button type="submit" btnType="danger">
            Change my email
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangeEmail($input: ChangeEmailInput!) {
    changeEmail(input: $input) {
      id
      email
    }
  }
`;
