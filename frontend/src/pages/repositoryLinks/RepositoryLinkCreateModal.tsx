/**
 * Two-step modal for creating a Repository link.
 *
 * Step 1 optionally labels the link. On success the SAME modal swaps to step 2,
 * which reveals the webhook URL and secret exactly once with copy affordances
 * and the GitHub setup steps. The secret lives only in this component's state
 * and is dropped when the modal closes — it can never be retrieved again,
 * mirroring the backend contract (createRepositoryLink returns it once).
 *
 * Props:
 *  - visible / onClose: standard Modal control.
 *  - onCreated: called when the user acknowledges, so the parent can refetch.
 *
 * Assumes an Apollo client is in context.
 */

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LinkIcon, ExclamationIcon } from "@heroicons/react/outline";
import { Modal, ModalProps } from "components/modals/Modal";
import { Label } from "components/fields/Label";
import { FormInput } from "components/fields/Input";
import { Button } from "components/fields/Button";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError } from "utils/GQLClient";
import {
  CreateRepositoryLinkResult,
  MutationCreateRepositoryLinkArgs,
} from "types/graphql";
import { CREATE_REPOSITORY_LINK } from "./repositoryLinkQueries";

interface Props extends Pick<ModalProps, "visible" | "onClose"> {
  onCreated: () => void;
}

const schema = yup
  .object()
  .noUnknown()
  .shape({
    name: yup.string().trim().default(""),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const RepositoryLinkCreateModal: React.FC<Props> = ({
  visible,
  onClose,
  onCreated,
}) => {
  // Non-null once created; flips the modal to the one-time reveal step and holds
  // the unrecoverable webhook secret + URL.
  const [created, setCreated] = useState<CreateRepositoryLinkResult | null>(
    null,
  );

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { name: "" },
  });

  const [createLink] = useBlockingMutation<
    { createRepositoryLink: CreateRepositoryLinkResult },
    MutationCreateRepositoryLinkArgs
  >(CREATE_REPOSITORY_LINK, {
    onError: onGraphQLError({ title: "Could not create link" }),
    onCompleted: ({ createRepositoryLink }) => setCreated(createRepositoryLink),
  });

  // Reset everything so a reopened modal starts clean and the secret is gone.
  const handleClose = () => {
    setCreated(null);
    formMethods.reset();
    onClose();
  };

  const onSubmit = (form: FormSchema) => {
    const name = form.name.trim();
    createLink({ variables: { input: name ? { name } : {} } });
  };

  const acknowledge = () => {
    onCreated();
    handleClose();
  };

  return (
    <Modal visible={visible} onClose={handleClose}>
      {created ? (
        <RevealStep result={created} onAcknowledge={acknowledge} />
      ) : (
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
                <LinkIcon className="h-6 w-6 text-brand-600" />
              </div>
              <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                  Link a repository
                </Dialog.Title>
                <p className="mt-1 text-sm text-gray-500">
                  We&apos;ll generate a webhook URL and secret to add to your
                  GitHub repository. The link activates once GitHub sends its
                  first signed delivery — which proves you control the repo.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <Label htmlFor="link-name" className="mb-1">
                Label
                <span className="ml-1 font-normal text-gray-500">
                  — optional, to tell pending links apart
                </span>
              </Label>
              <FormInput
                id="link-name"
                name="name"
                placeholder="e.g. Main backend repo"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button
                type="button"
                btnType="secondaryWhite"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit" btnType="primary">
                Generate webhook
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </Modal>
  );
};

interface RevealStepProps {
  result: CreateRepositoryLinkResult;
  onAcknowledge: () => void;
}

const RevealStep: React.FC<RevealStepProps> = ({ result, onAcknowledge }) => (
  <div>
    <div className="flex items-start">
      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
        <ExclamationIcon className="h-6 w-6 text-yellow-600" />
      </div>
      <div className="mt-3 sm:mt-0 sm:ml-4">
        <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
          Add this webhook to your repository
        </Dialog.Title>
        <p className="mt-1 text-sm text-gray-500">
          The secret is shown only once. In GitHub, open your repo&apos;s{" "}
          <span className="font-medium">Settings → Webhooks → Add webhook</span>
          , paste the values below, set the content type to{" "}
          <span className="font-mono">application/json</span>, and choose the{" "}
          <span className="font-medium">Pull requests</span> event.
        </p>
      </div>
    </div>

    <div className="mt-5 space-y-4">
      <CopyField label="Payload URL" value={result.webhookUrl} />
      <CopyField label="Secret" value={result.webhookSecret} />
    </div>

    <div className="mt-6 flex justify-end">
      <Button type="button" btnType="primary" onClick={onAcknowledge}>
        I&apos;ve added it
      </Button>
    </div>
  </div>
);

const CopyField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <Label className="mb-0">{label}</Label>
        <button
          type="button"
          onClick={copy}
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="break-all rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-800">
        {value}
      </div>
    </div>
  );
};
