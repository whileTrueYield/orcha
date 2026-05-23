import React, { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { documentationPageFormFields } from "../formFields";
import { gql } from "@apollo/client";
import {
  DocumentationPage,
  MutationUpdateDocumentationPageConfigArgs,
} from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { DocumentAddIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";
import { FCWithFragments } from "types";
import { Tag } from "components/tags/Tag";
import { without } from "lodash";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    title: documentationPageFormFields.title,
    customId: documentationPageFormFields.customId,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  documentationPage: DocumentationPage;
}

export const DocumentationPageConfigModal: FCWithFragments<Props> = (props) => {
  const { documentationPage } = props;
  const urlInput = useRef<HTMLInputElement>(null);
  const keywordInput = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>(documentationPage.urls);
  const [url, setUrl] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>(
    documentationPage.keywords
  );
  const [keyword, setKeyword] = useState<string>("");

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      customId: documentationPage.customId,
      title: documentationPage.title,
    },
  });

  const { reset } = formContext;

  useEffect(() => {
    reset({
      customId: documentationPage.customId,
      title: documentationPage.title,
    });
    setUrls(documentationPage.urls);
    setKeywords(documentationPage.keywords);
  }, [reset, documentationPage, setUrls, setKeywords]);

  const [updateDocumentationPageConfig] = useBlockingMutation<
    { updateDocumentationPageConfig: DocumentationPage },
    MutationUpdateDocumentationPageConfigArgs
  >(MUTATE_UPDATE_DOCUMENTATION_PAGE_CONFIG, {
    onCompleted: onMutationComplete({
      title: "Page Config updated",
      callback: props.onClose,
    }),
    onError: onGraphQLError({
      title: "Page config update failed",
    }),
    // When the title of the page is changed, we need to update the
    // the documentation "title" attribute which is a
    // combination of
    update: (cache, { data }) => {
      if (!data) {
        return;
      }

      const page = data.updateDocumentationPageConfig;

      cache.updateFragment(
        {
          id: "MiniDocumentationPage:" + page.id.toString(),
          fragment: gql`
            fragment DocumentationFragment on MiniDocumentationPage {
              id
              title
            }
          `,
        },
        (data) => ({ ...data, title: page.title })
      );
    },
  });

  const onSubmit = (formData: FormSchema) => {
    updateDocumentationPageConfig({
      variables: {
        documentationPageId: documentationPage.id,
        input: { ...formData, urls, keywords },
      },
    });
  };

  return (
    <Modal {...props} initialFocusSelector="#documentation-title">
      <FormProvider {...formContext}>
        <form
          onSubmit={formContext.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <DocumentAddIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
            >
              Documentation Page Config
            </Dialog.Title>
            <div className="mt-2">
              <div className="mt-2">
                <Label htmlFor="documentation-title" className="mb-1">
                  Title
                </Label>
                <FormInputGroup
                  id="documentation-title"
                  name="title"
                  autoFocus
                  placeholder="e.g. Markdown Tutorial"
                  tabIndex={1}
                  description="This title is used in the table of contents"
                />
              </div>

              <div className="mt-2">
                <Label htmlFor="documentation-custom-id" className="mb-1">
                  Unique ID
                </Label>
                <FormInputGroup
                  id="documentation-custom-id"
                  name="customId"
                  autoFocus
                  placeholder="e.g. mardown-tutorial"
                  tabIndex={2}
                  description="Use this ID as a reference for support integration"
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="documentation-url" className="mb-1" optional>
                  URLs
                </Label>
                <div
                  className="rounded border border-gray-300 bg-white px-2 shadow-sm"
                  onClick={() => urlInput.current?.focus()}
                >
                  {urls.map((url) => (
                    <Tag
                      large
                      className="mr-1 mb-1 bg-brand-100 text-brand-900"
                      key={url}
                      onDelete={() => setUrls(without(urls, url))}
                    >
                      {url}
                    </Tag>
                  ))}
                  <input
                    type="text"
                    tabIndex={3}
                    ref={urlInput}
                    id="documentation-url"
                    placeholder="e.g. /product/*/detail"
                    onChange={(event) => setUrl(event.currentTarget.value)}
                    value={url}
                    className="inline-block rounded border-none px-1 py-2 text-sm text-gray-700 focus:border-none focus:outline-none focus:ring-0"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        if (urls.indexOf(url) === -1) {
                          setUrls([url, ...urls]);
                          setUrl("");
                        }
                        event.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label
                  htmlFor="documentation-keyword"
                  className="mb-1"
                  optional
                >
                  Keywords
                </Label>
                <div
                  className="rounded border border-gray-300 bg-white px-2 shadow-sm"
                  onClick={() => keywordInput.current?.focus()}
                >
                  {keywords.map((keyword) => (
                    <Tag
                      large
                      className="mr-1 mb-1 bg-green-100 text-green-900"
                      key={keyword}
                      onDelete={() => setKeywords(without(keywords, keyword))}
                    >
                      {keyword}
                    </Tag>
                  ))}
                  <input
                    type="text"
                    ref={keywordInput}
                    tabIndex={4}
                    id="documentation-keyword"
                    placeholder="e.g. markdown"
                    onChange={(event) => setKeyword(event.currentTarget.value)}
                    value={keyword}
                    className="inline-block rounded border-none px-1 py-2 text-sm text-gray-700 focus:border-none focus:outline-none focus:ring-0"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        if (keywords.indexOf(keyword) === -1) {
                          setKeywords([keyword, ...keywords]);
                          setKeyword("");
                        }
                        event.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button type="submit" btnType="primary" tabIndex={5} fullInMobile>
                <PlusIcon className="mr-2 h-5 w-5" />
                Update Config
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                btnType="secondaryWhite"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                tabIndex={6}
                fullInMobile
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

DocumentationPageConfigModal.fragments = {
  DocumentationPageConfigModalFragment: gql`
    fragment DocumentationPageConfigModalFragment on DocumentationPage {
      id
      title
      urls
      keywords
      customId
      documentationId
    }
  `,
};

const MUTATE_UPDATE_DOCUMENTATION_PAGE_CONFIG = gql`
  mutation updateDocumentationPageConfig(
    $documentationPageId: Int!
    $input: UpdateDocumentationPageConfigInput!
  ) {
    updateDocumentationPageConfig(
      documentationPageId: $documentationPageId
      input: $input
    ) {
      id
      ...DocumentationPageConfigModalFragment
    }
  }
  ${DocumentationPageConfigModal.fragments.DocumentationPageConfigModalFragment}
`;
