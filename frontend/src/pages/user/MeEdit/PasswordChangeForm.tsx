import { gql } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { passwordResetFields } from "pages/auth/formFields";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { MutationChangePasswordArgs, User } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import * as yup from "yup";

const schema = yup
  .object({
    newPassword: passwordResetFields.password.label("New password"),
    passwordConfirm: passwordResetFields.password
      .label("Confirm password")
      .oneOf([yup.ref("password"), null], "Passwords must match"),
    password: passwordResetFields.password.label("Current password"),
  })
  .noUnknown();

type FormSchema = yup.InferType<typeof schema>;

export const PasswordChangeForm: React.FC = (props) => {
  const [showWarning, setShowWarning] = useState(false);
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });

  const [changePassword] = useBlockingMutation<
    { changePassword: User },
    MutationChangePasswordArgs
  >(CHANGE_PASSWORD_MUTATION, {
    onError: onGraphQLError({ title: "Could not change your password" }),
    onCompleted: onMutationComplete({
      title: "Your password has been changed",
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    if (showWarning) {
      changePassword({
        variables: {
          input: {
            password: formData.password,
            newPassword: formData.newPassword,
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
        title="Confirm Password Change"
        description="Are you sure you want to change your password? This will not disconnect any
        other person already connected."
        cta="Yes, my change password"
        visible={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={() => formMethods.handleSubmit(onSubmit)()}
      />
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <div className="sm:max-w-sm">
          <Label htmlFor="password-change-password" className="mb-1">
            Current Password
          </Label>
          <FormInputGroup
            type="password"
            name="password"
            id="password-change-password"
            placeholder="Your current password"
          />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="col-span1">
            <Label htmlFor="password-change-new-password" className="mb-1">
              New Password
            </Label>
            <FormInputGroup
              type="password"
              name="newPassword"
              id="password-change-new-password"
              placeholder="Your new password"
            />
          </div>
          <div className="col-span1">
            <Label
              htmlFor="password-change-confirm-new-password"
              className="mb-1"
            >
              Confirm New Password
            </Label>
            <FormInputGroup
              type="password"
              name="passwordConfirm"
              id="password-change-confirm-new-password"
              placeholder="Confirm New Password"
            />
          </div>
        </div>
        <FormInputGroup type="hidden" name="secret" id="password-reset-email" />

        <div className="mt-5 flex flex-row justify-end sm:mt-8">
          <Button type="submit" btnType="warning">
            Change my password
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      id
      email
    }
  }
`;
