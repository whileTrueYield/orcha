import { useEffect, useState } from "react";
import { useParams, RouteComponentProps, useHistory } from "react-router-dom";

import { urlResolver } from "utils/navigation";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { Button } from "components/fields/Button";
import {
  DocumentationPage,
  MiniDocumentationPage,
  ModelStage,
  MutationCreateDocumentationPageArgs,
  MutationDeleteDocumentationArgs,
  MutationDeleteDocumentationPageArgs,
  MutationPublishDocumentationArgs,
  MutationUnpublishDocumentationArgs,
} from "types/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { FCWithFragments } from "types";
import { DocumentationPageView } from "./DocumentationPageView";
import {
  ChevronDownIcon,
  CloudUploadIcon,
  CogIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import { InputModal } from "components/modals/InputModal";
import { DocumentationToc } from "./DocumentationToc";
import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import { Menu } from "@headlessui/react";
import { DocumentationEditModal } from "./DocumentationEditModal";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { SmartTime } from "components/views/Time";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { Tag } from "components/tags/Tag";
import { NoAccess } from "components/views/NoAccess";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";

interface UrlParams {
  documentationId: string;
  orgId: string;
  pageId?: string;
}
type Props = RouteComponentProps<UrlParams>;

export const DocumentationView: FCWithFragments<Props> = () => {
  usePageTitle("Documentation View");
  const params = useParams<UrlParams>();
  const { pageId } = params;
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const history = useHistory();
  const documentationId = parseInt(params.documentationId);
  const [showPublishDocumentationModal, setShowPublishDocumentationModal] =
    useState(false);
  const [showUnpublishDocumentationModal, setShowUnpublishDocumentationModal] =
    useState(false);

  const [showUpdateDocumentationModal, setShowUpdateDocumentationModal] =
    useState(false);
  const [showDeleteDocumentationModal, setShowDeleteDocumentationModal] =
    useState(false);
  const [documentationPage, setDocumentationPage] =
    useState<DocumentationPage>();

  // We store the page Id we want to navigate to in the warning
  // this allow us to display a warning when trying to navigate
  // to a different page and still navigate on confirm to the
  // right page
  const [showEditModeWarning, setShowEditModeWarning] = useState(0);

  const { data, loading, error } = useQuery<QueryReturnValue["documentation"]>(
    GET_DOCUMENTATION_QUERY,
    {
      variables: {
        id: documentationId || "0",
      },
      onError: onGraphQLError({ title: "Could not access documentation" }),
    },
  );

  const [createDocumentationPage] = useMutation<
    MutationReturnValue["createDocumentationPage"],
    MutationCreateDocumentationPageArgs
  >(MUTATE_CREATE_PAGE, {
    onError: onGraphQLError({ title: "Could not add new page" }),
    onCompleted: onMutationComplete({
      title: "New documentation page added",
      callback: () => setShowCreatePageModal(false),
    }),
  });

  const [publishDocumentation] = useMutation<
    MutationReturnValue["publishDocumentation"],
    MutationPublishDocumentationArgs
  >(MUTATE_PUBLISH_DOCUMENTATION, {
    onError: onGraphQLError({ title: "Could not publish documentation" }),
    onCompleted: onMutationComplete({
      title: "Documentation has been published",
      callback: () => setShowCreatePageModal(false),
    }),
  });

  const [unpublishDocumentation] = useMutation<
    MutationReturnValue["unpublishDocumentation"],
    MutationUnpublishDocumentationArgs
  >(MUTATE_UNPUBLISH_DOCUMENTATION, {
    onError: onGraphQLError({ title: "Could not unpublish documentation" }),
    onCompleted: onMutationComplete({
      title: "Documentation has been unpublished",
      callback: () => setShowCreatePageModal(false),
    }),
  });

  const [deleteDocumentation] = useBlockingMutation<
    MutationReturnValue["deleteDocumentation"],
    MutationDeleteDocumentationArgs
  >(DELETE_DOCUMENTATION_MUTATION, {
    onError: onGraphQLError({ title: "Documentation Deletion failed" }),
    onCompleted: onMutationComplete({
      title: "Documentation has been deleted",
      callback: () => {
        setTimeout(() =>
          history.push(urlResolver.documentation.listing(params.orgId)),
        );
      },
    }),
  });

  const [getDocumentationPage, { loading: loadingPage }] = useLazyQuery<
    QueryReturnValue["documentationPage"]
  >(GET_DOCUMENTATION_PAGE_QUERY, {
    fetchPolicy: "cache-and-network",

    onCompleted: ({ documentationPage }) => {
      setDocumentationPage(documentationPage);
    },
  });

  useEffect(() => {
    if (pageId) {
      getDocumentationPage({
        variables: {
          id: parseInt(pageId),
        },
      });
    }
  }, [pageId, getDocumentationPage]);

  const [deleteDocumentationPage] = useBlockingMutation<
    MutationReturnValue["deleteDocumentationPage"],
    MutationDeleteDocumentationPageArgs
  >(MUTATE_DELETE_DOCUMENTATION_PAGE, {
    onError: onGraphQLError({ title: "Documentation Page Deletion failed" }),
    onCompleted: onMutationComplete({
      title: "Documentation Page has been deleted",
      callback: () =>
        history.push(
          urlResolver.documentation.view(
            params.orgId,
            parseInt(params.documentationId),
          ),
        ),
    }),
  });

  const onDeleteDocumentation = () => {
    deleteDocumentation({ variables: { documentationId } });
  };

  const onDeleteDocumentationPage = () => {
    if (documentationPage) {
      deleteDocumentationPage({
        variables: { documentationPageId: documentationPage.id },
        update: (cache) => {
          cache.updateFragment(
            {
              id: "Documentation:" + documentationPage.documentationId,
              fragment: DocumentationToc.fragments.DocumentationTocFragment,
              fragmentName: "DocumentationTocFragment",
            },
            (documentation) => ({
              ...documentation,
              titles: documentation.titles.filter(
                (title: MiniDocumentationPage) =>
                  title.id !== documentationPage.id,
              ),
            }),
          );
          setDocumentationPage(undefined);
        },
      });
    }
  };

  const menuOptions: PopMenuOption[] = [
    {
      label: "Edit Documentation",
      onClick: () => setShowUpdateDocumentationModal(true),
      type: "button",
      icon: (className) => <CogIcon className={className} />,
    },
    {
      type: "separator",
    },
    {
      label: "Unpublish",
      onClick: () => setShowUnpublishDocumentationModal(true),
      type: "button",
      icon: (className) => <XCircleIcon className={className} />,
    },
    {
      label: "Delete Documentation",
      onClick: () => setShowDeleteDocumentationModal(true),
      type: "button",
      danger: true,
      icon: (className) => <TrashIcon className={className} />,
    },
  ];

  const documentation = data?.documentation;

  if (error) {
    return <NoAccess className="h-full" />;
  }

  if (loading || !documentation) {
    return null;
  }

  const renderStatus = () => {
    if (documentation.lastPublishRequestAt) {
      return (
        <span>
          <Tag className="mr-2 bg-gray-200 align-bottom font-semibold text-gray-800">
            {documentation.stage}
          </Tag>
          changes in progress...
        </span>
      );
    }

    if (documentation.stage === ModelStage.Published) {
      return (
        <span>
          <Tag className="mr-2 bg-green-600 align-bottom text-white">
            {documentation.stage}
          </Tag>
          Last published <SmartTime date={documentation.lastPublishedAt} />
          <a
            href={`${import.meta.env.VITE_DOCUMENTATION_URI}/doc/${documentationId}/`}
            target="_blank"
            rel="noreferrer"
            className="ml-2 text-brand-600 underline hover:text-brand-800"
          >
            {`${import.meta.env.VITE_DOCUMENTATION_URI}/doc/${documentationId}/`}
          </a>
        </span>
      );
    } else {
      return (
        <span>
          <Tag className="mr-2 bg-gray-700 align-bottom text-white">
            {documentation.stage}
          </Tag>
          Not Published
        </span>
      );
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-col pb-14">
      <DangerConfirm
        cta="Delete Documentation"
        title="Delete Documentation"
        description="Are you sure you want to delete this documentation? All the pages within the documentation will be lost. This action cannot be undone."
        visible={showDeleteDocumentationModal}
        onClose={() => setShowDeleteDocumentationModal(false)}
        onConfirm={onDeleteDocumentation}
      />

      <WarningConfirm
        visible={!!showEditModeWarning}
        cta={"Yes, change page"}
        title="Change page and lose unsaved changes?"
        description="You are currently editing a documentation page. Would you like to change page ? All your
    unsaved changes will be lost."
        onClose={() => setShowEditModeWarning(0)}
        onConfirm={() => {
          getDocumentationPage({ variables: { id: showEditModeWarning } });
        }}
      />

      <ConfirmModal
        visible={showPublishDocumentationModal}
        cta={"Yes, publish documentation"}
        title="Publish this documentation"
        description="Publishing documentation takes a few minutes. Note that you won't be able to update the published version for the next 10 minutes."
        onClose={() => setShowPublishDocumentationModal(false)}
        onConfirm={() =>
          publishDocumentation({ variables: { id: documentationId } })
        }
      />

      <WarningConfirm
        visible={showUnpublishDocumentationModal}
        cta={"Yes, unpublish documentation"}
        title="Unublish this documentation"
        description="Unpublishing documentation will make this documentation unavailable to the public. It will not delete it. You won't be able to update the republish it for the next 10 minutes."
        onClose={() => setShowUnpublishDocumentationModal(false)}
        onConfirm={() =>
          unpublishDocumentation({ variables: { id: documentationId } })
        }
      />

      <DocumentationEditModal
        documentation={documentation}
        visible={showUpdateDocumentationModal}
        onClose={() => setShowUpdateDocumentationModal(false)}
      />

      <InputModal
        cta="Create Page"
        label="Page Title"
        title="Create Documentation Page"
        description="Provide a title for the new documentation page."
        visible={showCreatePageModal}
        onClose={() => setShowCreatePageModal(false)}
        onSubmit={({ value }) =>
          createDocumentationPage({
            variables: {
              documentationId: documentation.id,
              input: {
                title: value,
                body: `# ${value}\n`,
              },
            },
          })
        }
      />

      <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-2 py-8 sm:px-0">
        <div className="mb-6 flex flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl">
              <span className="text-gray-600">Documentation:</span>
              <span className="ml-1 font-semibold text-gray-700">
                {documentation.name}
              </span>
            </h1>
            <div className="text-gray mt-1 text-sm text-gray-500">
              {renderStatus()}
            </div>
          </div>

          <div className="flex flex-row sm:mt-0">
            <Button
              onClick={() => setShowPublishDocumentationModal(true)}
              btnGroup="start"
              type="button"
              btnType="success"
            >
              <CloudUploadIcon className="mr-1 h-5 w-5 text-brand-50" />
              Publish
            </Button>
            <PopMenu options={menuOptions} direction="bottom-left" size="large">
              <Button
                type="button"
                btnType="success"
                btnGroup="end"
                asElement={(className) => (
                  <Menu.Button className={className}>
                    <ChevronDownIcon className="-mx-2 h-6 w-6 sm:h-5 sm:w-5" />
                  </Menu.Button>
                )}
              ></Button>
            </PopMenu>
          </div>
        </div>

        <div className="grid grid-cols-12 rounded-md bg-white shadow">
          <div className="col-span-5 border-r lg:col-span-4 xl:col-span-3">
            <div className="flex flex-col">
              <div className="flex h-14 flex-row items-center rounded-tl-lg border-b bg-gray-50 px-4 py-2 text-base font-medium text-gray-700">
                Table Of Contents
              </div>
              <DocumentationToc
                activePageId={documentationPage ? documentationPage.id : null}
                onPageChange={(id) =>
                  history.push(
                    urlResolver.documentation.pageView(
                      params.orgId,
                      documentationId,
                      id,
                    ),
                  )
                }
                documentation={documentation}
              />
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <Button
                onClick={() => setShowCreatePageModal(true)}
                type="button"
                btnType="primary"
                btnSize="small"
              >
                <PlusIcon className="h-5 w-5 text-brand-50 lg:mr-1" />
                Create new Page
              </Button>
            </div>
          </div>
          <div className="col-span-7 lg:col-span-8 xl:col-span-9">
            {loadingPage ? (
              <div className="flex h-full min-h-[20rem] flex-1 flex-col items-center justify-center space-y-5 bg-gray-50 text-xl text-gray-500">
                Loading...
              </div>
            ) : documentationPage ? (
              <DocumentationPageView
                documentation={documentation}
                documentationPage={documentationPage}
                onDelete={onDeleteDocumentationPage}
              />
            ) : (
              <div className="flex h-full min-h-[20rem] flex-1 flex-col items-center justify-center space-y-5">
                <div className="text-xl text-gray-500">
                  Select a page in the table of contents
                  <button
                    className="ml-2 align-text-bottom text-base text-gray-300 hover:text-sky-400"
                    onClick={() =>
                      (window as any).OrchaSupport.push([
                        "showDocumentationPageId",
                        "new-documentation-page#howtocreateanewpage",
                      ])
                    }
                  >
                    <QuestionMarkCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                <Button
                  onClick={() => setShowCreatePageModal(true)}
                  type="button"
                  btnType="primary"
                >
                  Create new Page
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="mx-2 mt-4 grid grid-cols-2 gap-4 sm:mx-0 md:grid-cols-3 lg:grid-cols-5"></div>
      </div>
    </div>
  );
};

DocumentationView.fragments = {
  DocumentationViewFragment: gql`
    fragment DocumentationViewFragment on Documentation {
      id
      name
      stage
      description
      updatedAt
      createdAt
      lastPublishedAt
      lastPublishRequestAt
      ...DocumentationTocFragment
    }
    ${DocumentationToc.fragments.DocumentationTocFragment}
  `,
};

const GET_DOCUMENTATION_QUERY = gql`
  query getDocumentation($id: Int!) {
    documentation(id: $id) {
      id
      ...DocumentationViewFragment
    }
  }
  ${DocumentationView.fragments.DocumentationViewFragment}
`;

const DELETE_DOCUMENTATION_MUTATION = gql`
  mutation DeleteDocumentation($documentationId: Int!) {
    deleteDocumentation(documentationId: $documentationId) {
      id
    }
  }
`;

const MUTATE_DELETE_DOCUMENTATION_PAGE = gql`
  mutation deleteDocumentationPage($documentationPageId: Int!) {
    deleteDocumentationPage(documentationPageId: $documentationPageId) {
      id
    }
  }
`;

// Todo: don't re-pull the documentation but update the
// record set of titles upon creation
const MUTATE_CREATE_PAGE = gql`
  mutation createDocumentationPage(
    $documentationId: Int!
    $input: CreateDocumentationPageInput!
  ) {
    createDocumentationPage(documentationId: $documentationId, input: $input) {
      id
      title
      body
      documentation {
        ...DocumentationViewFragment
      }
    }
  }
  ${DocumentationView.fragments.DocumentationViewFragment}
`;

const GET_DOCUMENTATION_PAGE_QUERY = gql`
  query DocumentationPage($id: Int!) {
    documentationPage(id: $id) {
      id
      ...DocumentationPageViewFragment
    }
  }
  ${DocumentationPageView.fragments.DocumentationPageViewFragment}
`;

const MUTATE_PUBLISH_DOCUMENTATION = gql`
  mutation PublishDocumentation($id: Int!) {
    publishDocumentation(id: $id) {
      id
      ...DocumentationViewFragment
    }
  }
  ${DocumentationView.fragments.DocumentationViewFragment}
`;

const MUTATE_UNPUBLISH_DOCUMENTATION = gql`
  mutation UnpublishDocumentation($id: Int!) {
    unpublishDocumentation(id: $id) {
      id
      ...DocumentationViewFragment
    }
  }
  ${DocumentationView.fragments.DocumentationViewFragment}
`;
