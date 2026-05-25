import * as yup from "yup";
import { demoLoginFields } from "../formFields";
import { usePageTitle } from "hooks/usePageTitle";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { getProofOfWork } from "pages/auth/Login/getProofOfWork";
import { gql } from "@apollo/client";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError } from "utils/GQLClient";
import { DemoRequest } from "types/graphql";
import { useState } from "react";
import { MutationReturnValue } from "types/queryTypes";
import { MutationRequestDemoArgs } from "types/graphql";
import { DemoRequestProcessing } from "./DemoProcessing";

const schema = yup
  .object({
    email: demoLoginFields.email,
  })
  .noUnknown();

type FormSchema = yup.InferType<typeof schema>;

// let cachedDemoId: string;

export const DemoRequestView: React.FC = () => {
  const [demoRequest, setDemoRequest] = useState<DemoRequest>();
  const [requesting, setRequesting] = useState(false);

  usePageTitle("Demo");

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { email: localStorage.getItem("demoEmail") || "" },
  });

  const [requestDemo] = useBlockingMutation<
    MutationReturnValue["requestDemo"],
    MutationRequestDemoArgs
  >(DEMO_REQUEST_MUTATION, {
    onCompleted: ({ requestDemo }) => {
      setDemoRequest(requestDemo);
      setRequesting(false);
      localStorage.setItem("demoEmail", requestDemo.email);
    },
    onError: onGraphQLError({
      title: "Demo request failed",
      callback: () => setRequesting(false),
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    setRequesting(true);
    const [proof, hash] = await getProofOfWork();
    requestDemo({ variables: { input: { ...formData, proof, hash } } });
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

  if (demoRequest) {
    return <DemoRequestProcessing demoRequestId={demoRequest.id} />;
  }

  return (
    <div className="relative flex h-full min-h-full bg-gray-50">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="relative mx-auto w-full max-w-sm lg:w-96">
          <img
            className="mx-auto h-16 w-auto"
            src="/img/logos/logo-with-text.png"
            alt="Orcha"
          />

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
            <div className="mt-6">
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
                      autoFocus
                      required
                      disabled={requesting}
                    />
                  </div>

                  <div className="mt-4">
                    {renderButton(requesting ? "Initializing..." : undefined)}
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>

          <div className="mt-6 text-center text-sm font-medium text-gray-500">
            Ready to sign up?
            <a
              className="ml-1 text-sm text-sky-600 hover:text-sky-700 hover:underline"
              href="https://app.orcha.run/auth/register"
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

const DEMO_REQUEST_MUTATION = gql`
  mutation requestDemo($input: RequestDemoInput!) {
    requestDemo(input: $input) {
      id
      email
      status
      config
    }
  }
`;
