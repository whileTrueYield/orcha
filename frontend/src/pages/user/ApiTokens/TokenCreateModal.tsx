/**
 * Two-step modal for minting a Personal Access Token.
 *
 * Step 1 collects the token's name, read-only flag, and expiry. On success the
 * SAME modal swaps to step 2, which reveals the plaintext exactly once with a
 * copy affordance and a warning. The plaintext lives only in this component's
 * state and is dropped the moment the modal closes — it can never be retrieved
 * again, mirroring the backend contract (createApiToken returns it once).
 *
 * Props:
 *  - visible / onClose: standard Modal control.
 *  - onCreated: called when the user acknowledges the revealed token, so the
 *    parent can refetch the token list.
 *
 * Assumes an Apollo client is in context (MockedProvider in tests).
 */

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { KeyIcon, ExclamationIcon } from "@heroicons/react/outline";
import { Modal, ModalProps } from "components/modals/Modal";
import { Label } from "components/fields/Label";
import { FormInput } from "components/fields/Input";
import { FormSelect } from "components/fields/Select";
import { Toggle } from "components/fields/Toggle";
import { Button } from "components/fields/Button";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError } from "utils/GQLClient";
import {
  CreateApiTokenResult,
  MutationCreateApiTokenArgs,
} from "types/graphql";
import { CREATE_API_TOKEN } from "./tokenQueries";
import { EXPIRY_OPTIONS } from "./helper";

interface Props extends Pick<ModalProps, "visible" | "onClose"> {
  onCreated: () => void;
}

const schema = yup
  .object()
  .noUnknown()
  .shape({
    name: yup.string().trim().required("A name is required"),
    readOnly: yup.boolean().default(false),
    // Index into EXPIRY_OPTIONS; a string because <select> values are strings.
    expiryIndex: yup.string().default("0"),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const TokenCreateModal: React.FC<Props> = ({
  visible,
  onClose,
  onCreated,
}) => {
  // Non-null once the token is minted; this is what flips the modal to the
  // one-time reveal step and holds the unrecoverable plaintext.
  const [created, setCreated] = useState<CreateApiTokenResult | null>(null);

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", readOnly: false, expiryIndex: "0" },
  });

  const [createToken] = useBlockingMutation<
    { createApiToken: CreateApiTokenResult },
    MutationCreateApiTokenArgs
  >(CREATE_API_TOKEN, {
    onError: onGraphQLError({ title: "Could not create token" }),
    onCompleted: ({ createApiToken }) => setCreated(createApiToken),
  });

  // Reset everything so a reopened modal starts clean and the secret is gone.
  const handleClose = () => {
    setCreated(null);
    formMethods.reset();
    onClose();
  };

  const onSubmit = (form: FormSchema) => {
    const days = EXPIRY_OPTIONS[Number(form.expiryIndex)]?.days ?? null;
    createToken({
      variables: {
        input: {
          name: form.name.trim(),
          readOnly: form.readOnly,
          ...(days !== null ? { expiresInDays: days } : {}),
        },
      },
    });
  };

  const acknowledge = () => {
    onCreated();
    handleClose();
  };

  return (
    <Modal visible={visible} onClose={handleClose}>
      {created ? (
        <RevealStep plaintext={created.plaintext} onAcknowledge={acknowledge} />
      ) : (
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
                <KeyIcon className="h-6 w-6 text-brand-600" />
              </div>
              <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                  New API token
                </Dialog.Title>
                <p className="mt-1 text-sm text-gray-500">
                  Mint a Personal Access Token for an agent or script. The
                  secret is shown only once.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="token-name" className="mb-1">
                  Name
                </Label>
                <FormInput
                  id="token-name"
                  name="name"
                  placeholder="e.g. Claude Code on my laptop"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="token-readonly" className="mb-0">
                  Read-only
                  <span className="ml-1 font-normal text-gray-500">
                    — the token can read but never mutate
                  </span>
                </Label>
                <Toggle id="token-readonly" {...formMethods.register("readOnly")} />
              </div>

              <div>
                <Label htmlFor="token-expiry" className="mb-1">
                  Expiry
                </Label>
                <FormSelect id="token-expiry" name="expiryIndex">
                  {EXPIRY_OPTIONS.map((option, index) => (
                    <option key={option.label} value={String(index)}>
                      {option.label === "Never"
                        ? "Never expires"
                        : option.label}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button type="button" btnType="secondaryWhite" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" btnType="primary">
                Create token
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </Modal>
  );
};

interface RevealStepProps {
  plaintext: string;
  onAcknowledge: () => void;
}

const RevealStep: React.FC<RevealStepProps> = ({ plaintext, onAcknowledge }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(plaintext);
    setCopied(true);
  };

  return (
    <div>
      <div className="flex items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
          <ExclamationIcon className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
            Copy your token now
          </Dialog.Title>
          <p className="mt-1 text-sm text-gray-500">
            This is the only time the token will be shown. Store it somewhere
            safe — it can never be retrieved again.
          </p>
        </div>
      </div>

      <div className="mt-5 break-all rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-800">
        {plaintext}
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <Button type="button" btnType="secondaryWhite" onClick={copy}>
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button type="button" btnType="primary" onClick={onAcknowledge}>
          I&apos;ve saved it
        </Button>
      </div>
    </div>
  );
};
