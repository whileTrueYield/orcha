import { gql, useMutation } from "@apollo/client";
import { FCWithFragments } from "types";
import {
  Documentation,
  MutationAddChildToDocumentationPageArgs,
  MutationMoveAfterDocumentationPageArgs,
  MutationMoveBeforeDocumentationPageArgs,
} from "types/graphql";
import cn from "classnames";
import { buildToc, DocumentationTocTitle } from "./buildToc";
import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { MutationReturnValue } from "types/queryTypes";

interface Props {
  documentation: Documentation;
  activePageId: number | null;
  onPageChange: (pageId: number) => void;
}

export const DocumentationToc: FCWithFragments<Props> = (props) => {
  const { documentation, activePageId } = props;
  const titles = documentation.titles;
  const [hoverId, setHoverId] = useState<number | null>();
  const [draggedId, setDraggedId] = useState<number | null>();
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );
  const toc = useMemo(() => buildToc(titles), [titles]);

  const [addChildToDocumentationPage] = useMutation<
    MutationReturnValue["addChildToDocumentationPage"],
    MutationAddChildToDocumentationPageArgs
  >(MUTATE_ADD_CHILD_TO_DOCUMENTATION_PAGE, {
    onError: onGraphQLError({ title: "Page could not be moved" }),
    onCompleted: onMutationComplete({
      title: "Page moved",
    }),
  });

  const [moveBeforeDocumentationPage] = useMutation<
    MutationReturnValue["moveBeforeDocumentationPage"],
    MutationMoveBeforeDocumentationPageArgs
  >(MUTATE_MOVE_DOCUMENTATION_PAGE_BEFORE, {
    onError: onGraphQLError({ title: "Page could not be moved" }),
    onCompleted: onMutationComplete({
      title: "Page moved",
    }),
  });

  const [moveAfterDocumentationPage] = useMutation<
    MutationReturnValue["moveAfterDocumentationPage"],
    MutationMoveAfterDocumentationPageArgs
  >(MUTATE_MOVE_DOCUMENTATION_PAGE_AFTER, {
    onError: onGraphQLError({ title: "Page could not be moved" }),
    onCompleted: onMutationComplete({
      title: "Page moved",
    }),
  });

  const renderTitle =
    (parent?: DocumentationTocTitle) =>
    (
      title: DocumentationTocTitle,
      index: number,
      siblings: DocumentationTocTitle[]
    ) => {
      const isDraggedOver = title.id === hoverId && hoverId !== draggedId;
      const isDragged = title.id === draggedId;
      const isActive = title.id === activePageId;

      const linkClassName = cn(
        "w-full rounded py-1 pl-2 pr-1 flex flex-row justify-between items-center group",
        {
          "bg-brand-200 font-semibold text-brand-900": !isDragged && isActive,
          "hover:bg-gray-100 hover:text-gray-800": !isDragged && !isActive,
          "opacity-25 bg-white": isDragged,
        }
      );

      const dropClassNameTop = cn(
        "w-full transition-all duration-100 ease-in h-7 rounded-md",
        {
          "max-h-0": !isDraggedOver,
          "max-h-7 py-1": isDraggedOver,
          "bg-gray-600": isDraggedOver && dropPosition === "before",
          "border-2 border-gray-200 bg-gray-100":
            isDraggedOver && dropPosition !== "before",
        }
      );

      const dropClassNameUnder = cn(
        "w-full transition-all duration-100 ease-in h-7 rounded-md",
        {
          "max-h-0": !isDraggedOver,
          "max-h-7 py-1": isDraggedOver,
          "bg-gray-600": isDraggedOver && dropPosition === "after",
          "border-2 border-gray-200 bg-gray-100":
            isDraggedOver && dropPosition !== "after",
        }
      );

      const onDragEnd = () => {
        if (hoverId && draggedId) {
          switch (dropPosition) {
            case "before":
              moveBeforeDocumentationPage({
                variables: {
                  beforeDocumentationPageId: hoverId,
                  documentationPageId: draggedId,
                },
              });
              break;

            case "after":
              moveAfterDocumentationPage({
                variables: {
                  afterDocumentationPageId: hoverId,
                  documentationPageId: draggedId,
                },
              });
              break;

            default:
              console.warn("Unhandled drop position", dropPosition);
          }
        }
        setDraggedId(null);
        setHoverId(null);
      };

      return (
        <div key={title.id}>
          <div
            className="pt-1"
            onDragOver={(event) => event.preventDefault()}
            onDragEnter={(event) =>
              draggedId === title.id ? setHoverId(null) : setHoverId(title.id)
            }
          >
            <div
              className={dropClassNameTop}
              onDragEnter={() => {
                draggedId === title.id
                  ? setHoverId(null)
                  : setHoverId(title.id);
                setDropPosition("before");
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeaveCapture={() => setDropPosition(null)}
            />
            <span
              className={linkClassName}
              draggable
              onDragEnd={onDragEnd}
              onDragStart={() => setDraggedId(title.id)}
              onClick={() => props.onPageChange(title.id)}
              onDragEnter={() => {
                draggedId === title.id
                  ? setHoverId(null)
                  : setHoverId(title.id);
                setDropPosition("before");
              }}
              role="link"
            >
              <span className="truncate" title={title.title}>
                {title.title}
              </span>
              <div
                className="flex flex-row space-x-1"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="rounded bg-gray-200 p-0.5 text-gray-600 opacity-0 transition-opacity hover:bg-brand-500 hover:text-white disabled:text-gray-300 disabled:hover:bg-gray-200 disabled:hover:text-gray-300 group-hover:opacity-100"
                  disabled={!parent}
                  sr-only="Unindent page"
                  title="Unindent page"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (parent) {
                      moveAfterDocumentationPage({
                        variables: {
                          documentationPageId: title.id,
                          afterDocumentationPageId: parent.id,
                        },
                      });
                    }
                  }}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  disabled={!siblings[index - 1]}
                  className="rounded bg-gray-200 p-0.5 text-gray-600 opacity-0 transition-opacity hover:bg-brand-500 hover:text-white disabled:text-gray-300 disabled:hover:bg-gray-200 disabled:hover:text-gray-300 group-hover:opacity-100"
                  sr-only="Indent page under previous page"
                  title="Indent page under previous page"
                  onClick={(event) => {
                    event.stopPropagation();
                    console.log({
                      title,
                      previous: titles[index - 1],
                      index,
                      titles,
                    });
                    if (siblings[index - 1]) {
                      addChildToDocumentationPage({
                        variables: {
                          childDocumentationPageId: title.id,
                          parentDocumentationPageId: siblings[index - 1].id,
                        },
                      });
                    }
                  }}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </span>

            {title.children.length > 0 ? null : (
              <div
                className={dropClassNameUnder}
                onDragEnter={() => {
                  draggedId === title.id
                    ? setHoverId(null)
                    : setHoverId(title.id);
                  setDropPosition("after");
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeaveCapture={() => setDropPosition(null)}
              />
            )}
          </div>

          {title.children.length ? (
            <div role="list" className="top-0 flex flex-col pl-4 text-gray-700">
              {title.children.map(renderTitle(title))}
            </div>
          ) : null}
        </div>
      );
    };

  return (
    <div className="relative">
      <div role="list" className="top-0 flex flex-col p-2 text-gray-700">
        {toc.map(renderTitle())}
      </div>
    </div>
  );
};

DocumentationToc.fragments = {
  DocumentationTocFragment: gql`
    fragment DocumentationTocFragment on Documentation {
      id
      titles {
        id
        title
        position
        parentId
      }
    }
  `,
};

const MUTATE_ADD_CHILD_TO_DOCUMENTATION_PAGE = gql`
  mutation addChildToDocumentationPage(
    $parentDocumentationPageId: Int!
    $childDocumentationPageId: Int!
  ) {
    addChildToDocumentationPage(
      parentDocumentationPageId: $parentDocumentationPageId
      childDocumentationPageId: $childDocumentationPageId
    ) {
      id
      documentation {
        ...DocumentationTocFragment
      }
    }
  }
  ${DocumentationToc.fragments.DocumentationTocFragment}
`;

const MUTATE_MOVE_DOCUMENTATION_PAGE_BEFORE = gql`
  mutation moveBeforeDocumentationPage(
    $beforeDocumentationPageId: Int!
    $documentationPageId: Int!
  ) {
    moveBeforeDocumentationPage(
      documentationPageId: $documentationPageId
      beforeDocumentationPageId: $beforeDocumentationPageId
    ) {
      id
      documentation {
        ...DocumentationTocFragment
      }
    }
  }
  ${DocumentationToc.fragments.DocumentationTocFragment}
`;

const MUTATE_MOVE_DOCUMENTATION_PAGE_AFTER = gql`
  mutation moveAfterDocumentationPage(
    $afterDocumentationPageId: Int!
    $documentationPageId: Int!
  ) {
    moveAfterDocumentationPage(
      documentationPageId: $documentationPageId
      afterDocumentationPageId: $afterDocumentationPageId
    ) {
      id
      documentation {
        ...DocumentationTocFragment
      }
    }
  }
  ${DocumentationToc.fragments.DocumentationTocFragment}
`;
