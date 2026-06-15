import React from "react";
import { authLoginFields } from "../formFields";
import { get } from "lodash";
import * as yup from "yup";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { gql } from "@apollo/client";
import { MutationLoginArgs, Me, AuthStatus } from "types/graphql";
import { Link, useHistory, useLocation } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { Panel } from "components/views/Panel";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { getFirstFromQuery, JSONToQuery } from "utils";
import { AuthScreenContainer } from "./AuthScreenContainer";
import { resolveReturnTo } from "./resolveReturnTo";
import { ApiUri } from "config";
import { useAppDispatch } from "store";
import { LockClosedIcon } from "@heroicons/react/solid";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { getProofOfWork } from "./getProofOfWork";
import { meFragment } from "../fragments";

const LOGIN_MUTATION = gql`
  mutation login($input: LoginInput!) {
    login(input: $input) {
      ...meFragment
    }
  }
  ${meFragment}
`;

const schema = yup
  .object({
    email: authLoginFields.email,
    password: authLoginFields.password,
  })
  .noUnknown();

type FormSchema = yup.InferType<typeof schema>;

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const emailFromQuery = getFirstFromQuery(document.location.search, "email");
  // Resolve the OAuth consent returnTo URL on mount — this is a full-page
  // navigation target on a different (backend) origin, so the guard ensures we
  // never redirect to an arbitrary external URL.
  const oauthReturnTo = resolveReturnTo(document.location.search, ApiUri);
  usePageTitle("Login");

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { email: emailFromQuery },
  });

  const history = useHistory();
  const location = useLocation();
  const fromLocation = get(location.state, "from", {
    pathname: "",
  });
  const email = useWatch({
    control: formMethods.control,
    name: "email",
  });

  const [login] = useBlockingMutation<{ login: Me }, MutationLoginArgs>(
    LOGIN_MUTATION,
    {
      onCompleted: onMutationComplete({
        title: "Login Success",
        callback: (data) => {
          const me = data.login;
          dispatch({ type: "LOGIN_SUCCESS", payload: me });
          if (oauthReturnTo) {
            // External (backend) origin → must be a real navigation, not a router push.
            window.location.assign(oauthReturnTo);
            return;
          }
          if (fromLocation) {
            history.replace(fromLocation);
          } else if (me.status === AuthStatus.User) {
            history.push(urlResolver.auth.chooseOrganization());
          } else if (me.status === AuthStatus.Linked) {
            if (me.organization?.id) {
              history.push(
                urlResolver.dashboard.home(me.organization.id.toString()),
              );
            } else {
              history.push(urlResolver.auth.chooseOrganization());
            }
          }
        },
      }),
      onError: onGraphQLError({
        title: "Authentication failed",
      }),
    }
  );

  const onSubmit = async (formData: FormSchema) => {
    const [proof, hash] = await getProofOfWork();
    login({ variables: { input: { ...formData, proof, hash } } });
  };

  const passwordLostLink = (
    <Link
      to={urlResolver.auth.passwordLost() + "?" + JSONToQuery({ email })}
      className="text-sm font-medium text-brand-700 transition duration-150 ease-in-out hover:text-brand-500 focus:underline focus:outline-none"
    >
      Forgot your password?
    </Link>
  );

  return (
    <AuthScreenContainer>
      <h1 className="mt-6 text-center font-title text-3xl font-semibold leading-9 text-gray-600">
        Sign in
      </h1>
      <Panel className="mt-8 py-8 px-4 sm:px-10">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="login-email" className="mb-1">
                Email address
              </Label>
              <FormInputGroup
                type="email"
                name="email"
                id="login-email"
                data-e2e="login-email"
                placeholder="e.g. jane.roe@company.com"
                autoFocus={email ? false : true}
              />
            </div>

            <div className="mt-6">
              <Label
                htmlFor="login-password"
                className="mb-1"
                additionalInfo={passwordLostLink}
              >
                Password
              </Label>
              <FormInputGroup
                data-e2e="login-password"
                id="login-password"
                type="password"
                name="password"
                placeholder="Your Password"
                autoFocus={email ? true : false}
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row">
              <Button
                type="submit"
                data-e2e="login-submit-button"
                btnType="primary"
                block
                className="relative"
                disabled={formMethods.formState.isSubmitting}
              >
                <LockClosedIcon className="absolute right-2 top-2 h-5 w-5 text-brand-400" />
                Sign in
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account yet?
              <Link
                className="ml-1 text-sm font-medium text-brand-700 transition duration-150 ease-in-out hover:text-brand-500 focus:underline focus:outline-none"
                to={urlResolver.auth.register() + "?" + JSONToQuery({ email })}
              >
                Create Account
              </Link>
            </div>
          </form>
        </FormProvider>
      </Panel>
    </AuthScreenContainer>
  );
};
