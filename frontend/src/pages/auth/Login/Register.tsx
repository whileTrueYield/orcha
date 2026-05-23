import React from "react";
import { authRegisterFields } from "../formFields";
import * as yup from "yup";
import { useForm, FormProvider, useWatch } from "react-hook-form";
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
import { getFirstFromQuery, JSONToQuery } from "utils";
import { useAppDispatch } from "store";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { getProofOfWork } from "./getProofOfWork";

const REGISTER_MUTATION = gql`
  mutation register($input: RegisterInput!) {
    register(input: $input) {
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

export const Register: React.FC = () => {
  const emailFromQuery = getFirstFromQuery(document.location.search, "email");
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { email: emailFromQuery },
  });
  usePageTitle("Register");
  const dispatch = useAppDispatch();
  const history = useHistory();
  const email = useWatch({
    control: formMethods.control,
    name: "email",
  });

  const [register] = useBlockingMutation<
    { register: Me },
    MutationRegisterArgs
  >(REGISTER_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Registration successful",
      callback: (data) => {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: data.register,
        });
        history.push(urlResolver.auth.chooseOrganization());
      },
    }),
    onError: onGraphQLError({
      title: "Registration failed",
      subTitle: "Please review your email and password",
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    const [proof, hash] = await getProofOfWork();
    register({ variables: { input: { ...formData, proof, hash } } });
  };

  return (
    <AuthScreenContainer>
      <h1 className="mt-6 text-center text-3xl font-extrabold leading-9 text-gray-600">
        Create an Account
      </h1>
      <p className="mt-4 px-4 text-center text-base text-gray-600">
        Create your account and discover features that empower decisions and
        unleash productivity
      </p>

      <Panel className="mt-4 py-8 px-4 sm:px-10">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="mt-4">
              <Label htmlFor="register-email" className="mb-1">
                Professional Email
              </Label>
              <FormInputGroup
                type="text"
                id="register-email"
                name="email"
                placeholder="e.g. john.doe@company.com"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="register-password" className="mb-1">
                Password
              </Label>
              <FormInputGroup
                id="register-password"
                type="password"
                name="password"
                placeholder="must be 10 characters or more"
              />
            </div>

            <div className="mt-6">
              <span className="block w-full rounded-md shadow-sm">
                <Button
                  disabled={formMethods.formState.isSubmitting}
                  type="submit"
                  btnType="primary"
                  block
                >
                  Create Your Account
                </Button>
              </span>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?
              <Link
                className="ml-1 text-sm font-medium text-brand-700 transition duration-150 ease-in-out hover:text-brand-500 focus:underline focus:outline-none"
                to={urlResolver.auth.login() + "?" + JSONToQuery({ email })}
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
