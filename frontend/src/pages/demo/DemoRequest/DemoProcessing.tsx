import { usePageTitle } from "hooks/usePageTitle";
import { getProofOfWork } from "pages/auth/Login/getProofOfWork";
import { gql, useQuery } from "@apollo/client";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import {
  AuthStatus,
  DemoRequest,
  DemoStatus,
  Me,
  MutationLoginArgs,
  QueryGetDemoArgs,
  RoleStatus,
  RoleType,
} from "types/graphql";
import { useState } from "react";
import { QueryReturnValue } from "types/queryTypes";
import { ChevronRightIcon } from "@heroicons/react/solid";
import { useAppDispatch } from "store";
import { meFragment } from "pages/auth/fragments";
import { useHistory } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { capitalize } from "lodash";
import { LoadingState } from "components/views/LoadingState";
import { ErrorScreen } from "components/ErrorScreen";

export const DemoRequestProcessing: React.FC<{ demoRequestId: string }> = (
  props,
) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [signing, setSigning] = useState(false);

  usePageTitle("Demo");

  const { data, stopPolling, loading, error } = useQuery<
    QueryReturnValue["getDemo"],
    QueryGetDemoArgs
  >(GET_DEMO_REQUEST_QUERY, {
    variables: { id: props.demoRequestId },
    pollInterval: 5000,
    fetchPolicy: "network-only",
    onError: onGraphQLError({
      title: "Status Refresh Failed",
      callback: () => stopPolling(),
    }),
    onCompleted: ({ getDemo }) => {
      if (getDemo.status === DemoStatus.Ready) {
        stopPolling();
      }
      if (getDemo.status === DemoStatus.Failed) {
        stopPolling();
      }
    },
  });

  const renderRoleType = (roleStatus?: RoleStatus, roleType?: RoleType) => {
    if (roleStatus && roleType) {
      if (roleStatus === RoleStatus.Invited) {
        return (
          <span className="mr-2 inline-block rounded border border-yellow-300 bg-yellow-100 px-1 py-px text-xs font-medium text-yellow-700">
            Invited
          </span>
        );
      } else {
        return (
          <span className="mr-2 inline-block rounded border border-sky-300 bg-sky-100 px-1 py-px text-xs font-medium text-sky-700">
            {capitalize(roleType)}
          </span>
        );
      }
    }

    return null;
  };

  const [login] = useBlockingMutation<{ login: Me }, MutationLoginArgs>(
    LOGIN_MUTATION,
    {
      onCompleted: onMutationComplete({
        title: "Login Success",
        callback: (data) => {
          const me = data.login;
          setSigning(false);
          if (me.status === AuthStatus.Linked) {
            dispatch({ type: "LOGIN_SUCCESS", payload: me });
            if (me.organization?.id) {
              history.push(
                urlResolver.dashboard.home(me.organization.id.toString()),
              );
            } else {
              history.push(urlResolver.auth.chooseOrganization());
            }
          } else if (me.status === AuthStatus.User) {
            dispatch({ type: "LOGIN_SUCCESS", payload: me });
            history.push(urlResolver.auth.chooseOrganization());
          }
        },
      }),
      onError: onGraphQLError({
        title: "Authentication failed",
        callback: () => setSigning(false),
      }),
    },
  );

  const onLogin = (password: string) => async (email: string) => {
    setSigning(true);
    const [proof, hash] = await getProofOfWork();
    login({ variables: { input: { password, email, proof, hash } } });
  };

  const renderButton = (status?: string) => {
    if (!status) {
      return (
        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-md bg-[#12BAA6] px-4 py-2 text-sm font-semibold leading-6 text-white shadow transition duration-150 ease-in-out hover:bg-[#16DFC7]"
        >
          Access Demo Instance
        </button>
      );
    }

    return (
      <button
        type="button"
        className="flex w-full cursor-not-allowed items-center justify-center rounded-md bg-[#12BAA6] px-4 py-2 text-sm font-semibold leading-6 text-white shadow transition duration-150 ease-in-out hover:bg-[#16DFC7]"
        disabled
      >
        <svg
          className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {status}
      </button>
    );
  };

  const renderDemoRequest = (demoRequest: DemoRequest) => {
    if (demoRequest.status === DemoStatus.Queued) {
      return (
        <div>
          <h2 className="mt-12 text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Experience Orcha
            <span className="relative -top-0.5 ml-2 inline-block rounded bg-[#12BAA6] py-0.5 px-2 align-middle text-xl font-bold uppercase tracking-wide text-white">
              Demo
            </span>
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            In this demo, a team of 10 music enthusiasts work together on an
            online music app called GrooveStream.
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            The build process is automated and typically takes two minutes to
            finish.
          </p>
          <div className="mt-6">{renderButton("Looking for Worker...")}</div>
        </div>
      );
    } else if (demoRequest.status === DemoStatus.Processing) {
      return (
        <div>
          <h2 className="mt-12 text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Experience Orcha
            <span className="relative -top-0.5 ml-2 inline-block rounded bg-[#12BAA6] py-0.5 px-2 align-middle text-xl font-bold uppercase tracking-wide text-white">
              Demo
            </span>
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            In this demo, a team of 10 music enthusiasts work together on an
            online music app called GrooveStream.
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            The build process is automated and typically takes two minutes to
            finish.
          </p>
          <div className="mt-6">{renderButton("Building the Demo...")}</div>
        </div>
      );
    } else if (demoRequest.status === DemoStatus.Ready) {
      const config = JSON.parse(demoRequest.config);
      const login = onLogin(config.password);

      return (
        <div>
          <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Your demo instance is ready!
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            In this demo, a team of 10 music enthusiasts work together on an
            online music app called GrooveStream.
          </p>
          <div className="mt-4">
            <div className="mb-1 text-sm font-medium text-gray-800">
              Select your role:
            </div>
            <ul className="max-h-[calc(100vh-400px)] w-full divide-y divide-gray-100 overflow-hidden overflow-y-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
              {config.roles.map((role: any) => (
                <li
                  role="button"
                  onClick={() => login(role.email)}
                  key={role.email}
                  className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex flex-1 gap-x-4">
                    <img
                      className="h-12 w-12 flex-none rounded-full bg-gray-50"
                      src={role.avatarUrl}
                      alt=""
                    />
                    <div className="min-w-0 flex-auto">
                      <p className="flex flex-row items-center justify-between text-sm font-semibold leading-6 text-gray-900">
                        <span className="absolute inset-x-0 -top-px bottom-0" />
                        <span>{role.name}</span>
                        {renderRoleType(role.status, role.type)}
                      </p>
                      <p className="mt-1 flex truncate text-xs leading-5 text-gray-500">
                        {role.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <ChevronRightIcon
                      className="h-5 w-5 flex-none text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    } else {
      return (
        <div className="mt-10 flex flex-col items-center justify-center">
          <div className="text-center text-lg font-medium text-gray-700">
            status: {demoRequest.status}
          </div>
          <div className="mt-2 text-center text-sm font-medium text-gray-700">
            Try again in 10 minutes
          </div>
        </div>
      );
    }
  };

  if (!data || loading) {
    return <LoadingState title="loading..." />;
  }

  if (error) {
    return <ErrorScreen />;
  }

  const demoRequest = data.getDemo;

  return (
    <div className="relative flex h-full min-h-full bg-gray-50">
      {signing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg border bg-white px-12 py-6 text-xl text-gray-600">
            Signing in...
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="relative mx-auto w-full max-w-sm lg:w-96">
          <img
            className="mx-auto h-16 w-auto"
            src="/img/logos/logo-with-text.png"
            alt="Orcha"
          />
          {renderDemoRequest(demoRequest)}
          <div className="mt-6 text-center text-sm font-medium text-gray-500">
            Ready to sign up?
            <a
              className="ml-1 text-sm text-sky-600 hover:text-sky-700 hover:underline"
              href="https://app.orcha.io/auth/register"
            >
              Start using Orcha
            </a>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/img/groove-stream-image.jpg"
          alt=""
        />
        <div className="absolute right-2 bottom-2 z-10 rounded bg-black bg-opacity-80 py-1 px-3 text-sm font-medium text-white">
          photo by{" "}
          <a
            rel="noreferrer"
            href="https://unsplash.com/@sudhithxavier"
            target="_blank"
            className="underline hover:no-underline"
          >
            Sudhith Xavier
          </a>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col rounded-xl bg-black bg-opacity-60 px-12 py-8 shadow-lg backdrop-blur">
            <div className="text-4xl font-bold uppercase tracking-wide text-white">
              <span className="text-[56px]">G</span>roove
              <span className="text-[56px]">S</span>tream
            </div>
            <div className="text-lg font-normal tracking-wide text-white">
              An Orcha Demo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GET_DEMO_REQUEST_QUERY = gql`
  query getDemo($id: String!) {
    getDemo(id: $id) {
      id
      email
      status
      config
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation loginForDemo($input: LoginInput!) {
    login(input: $input) {
      ...meFragment
    }
  }
  ${meFragment}
`;
