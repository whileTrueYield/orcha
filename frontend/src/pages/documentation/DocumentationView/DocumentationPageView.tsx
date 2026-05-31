import React, { Suspense, useState } from "react";
import { Documentation, DocumentationPage } from "types/graphql";
import { gql } from "@apollo/client";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { ChevronDownIcon, CogIcon, TrashIcon } from "@heroicons/react/solid";
import { DocumentationPageConfigModal } from "./DocumentationPageConfigModal";
import { FCWithFragments } from "types";
import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import { Button } from "components/fields/Button";
import { Menu } from "@headlessui/react";

interface Props {
  documentation: Documentation;
  documentationPage: DocumentationPage;
  onDelete: () => void;
}

export const DocumentationPageView: FCWithFragments<Props> = (props) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [
    showDeleteDocumentationPageModal,
    setShowDeleteDocumentationPageModal,
  ] = useState(false);
  const { documentationPage, onDelete } = props;

  // const words = reduce(
  //   documentationPage.blocks,
  //   (acc: number, block: DocumentationDataBlock): number => {
  //     switch (block.type) {
  //       case "header":
  //       case "paragraph":
  //         return acc + JSON.parse(block.data).text.trim().split(/\s+/).length;
  //       default:
  //         return acc;
  //     }
  //   },
  //   0
  // );

  if (!documentationPage) {
    return <div className="min-h-[20vh]"></div>;
  }

  const menuOptions: PopMenuOption[] = [
    {
      label: "Config Page",
      onClick: () => setShowConfigModal(true),
      type: "button",
      icon: (className) => <CogIcon className={className} />,
    },
    {
      type: "separator",
    },
    {
      label: "Delete Page",
      onClick: () => setShowDeleteDocumentationPageModal(true),
      type: "button",
      danger: true,
      icon: (className) => <TrashIcon className={className} />,
    },
  ];

  // const timeToRead = {
  //   lower: ceil(words / 250),
  //   higher: ceil(words / 150),
  // };

  return (
    <div className="relative flex h-full flex-col">
      <DocumentationPageConfigModal
        visible={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        documentationPage={documentationPage}
      />

      <div className="flex h-14 shrink-0 flex-row items-center justify-between rounded-tr-lg border-b bg-gray-50 px-4 py-2">
        <div className="text-lg text-gray-800">{documentationPage.title}</div>

        <div className="hidden text-sm text-gray-500 lg:flex">
          {/* {plural("{} word - ", "{} words - ", words)}
          {timeToRead.lower === timeToRead.higher
            ? plural("{} minute", "{} minutes", timeToRead.lower)
            : `${timeToRead.lower} to ${timeToRead.higher} minutes read`} */}
        </div>

        <div className="flex flex-row items-center">
          <Button
            onClick={() => setShowConfigModal(true)}
            type="button"
            btnType="white"
            btnGroup="start"
          >
            <CogIcon className="mr-1 h-5 w-5 text-gray-600" />
            Config Page
          </Button>
          <PopMenu options={menuOptions} direction="bottom-left">
            <Button
              type="button"
              btnType="white"
              btnGroup="end"
              asElement={(className) => (
                <Menu.Button className={className}>
                  <ChevronDownIcon className="-mx-2 h-5 w-5 sm:h-5 sm:w-5" />
                </Menu.Button>
              )}
            ></Button>
          </PopMenu>
        </div>
      </div>

      <div className="relative flex h-full flex-1 flex-col rounded-br-xl bg-white">
        <Suspense>
          <div className="mx-auto w-full p-4">
            {/* TODO(tiptap-removal): interim read-only plain-text view of the
                documentation page body. The collaborative rich-text editor was
                removed; a Crepe-based editor with a save mutation is the
                follow-up. The body field is the Markdown source of truth. */}
            <textarea
              readOnly
              value={documentationPage.body ?? ""}
              className="min-h-[40vh] w-full rounded border p-2 font-mono text-sm"
            />
          </div>
        </Suspense>
      </div>

      <DangerConfirm
        cta="Yes, Delete"
        description="Are you sure you want to delete this documentation page? This action cannot be undone."
        onConfirm={onDelete}
        onClose={() => setShowDeleteDocumentationPageModal(false)}
        title={`Delete Documentation Page?`}
        visible={showDeleteDocumentationPageModal}
      />
    </div>
  );
};

DocumentationPageView.fragments = {
  DocumentationPageViewFragment: gql`
    fragment DocumentationPageViewFragment on DocumentationPage {
      id
      body
      ...DocumentationPageConfigModalFragment
    }
    ${DocumentationPageConfigModal.fragments
      .DocumentationPageConfigModalFragment}
  `,
};
