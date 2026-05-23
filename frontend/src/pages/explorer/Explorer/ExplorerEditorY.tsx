import { Suspense, useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { usePageTitle } from "hooks/usePageTitle";
import { find } from "lodash";
import { useParams } from "react-router-dom";
import { QueryProjectArgs, ModelStage } from "types/graphql";
import { ProjectListing } from "./ExplorerSide/ProjectListing";
import { onGraphQLError } from "utils/GQLClient";
import { ProjectCrumbs } from "pages/project/ProjectView/ProjectCrumbs";
import { ExplorerTabs } from "./ExplorerTabs";
import { projectFormFields } from "pages/project/formFields";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FCWithFragments } from "types";
import { EmptyState } from "components/views/EmtpyState";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { ProjectActions } from "./ProjectAction";
import {
  useMoveIntoProject,
  usePinProject,
  usePublishProject,
  useUnarchiveProject,
  useUnpinProject,
} from "../hooks";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { BookmarkIcon } from "@heroicons/react/solid";

import { QueryReturnValue } from "types/queryTypes";
import { useAddToRecentlyVisitedProject } from "utils/preferences";
import TiptapCollab from "components/TipTap/TipTapCollab";
import { HoverTooltip } from "components/help/Tooltip";
import { ProjectName } from "./ProjectName/ProjectName";

interface params {
  projectId: string;
  orgId: string;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: projectFormFields.name.label("Project's Name"),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const ExplorerEditorY: FCWithFragments = () => {
  const params = useParams<params>();
  const me = useSelector(getMe);
  const projectId = parseInt(params.projectId);
  const addToRecentlyVisitedProject = useAddToRecentlyVisitedProject();
  const [confirmPublishVisible, setConfirmPublishVisible] = useState(false);
  const [confirmUnarchiveVisible, setConfirmUnarchiveVisible] = useState(false);
  const [pinProject] = usePinProject({ variables: { projectId } });
  const [unpinProject] = useUnpinProject({ variables: { projectId } });

  usePageTitle("Details");

  const [selection, setSelection] = useState<string[]>([]);

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });

  const { data, loading } = useQuery<
    QueryReturnValue["project"],
    QueryProjectArgs
  >(GET_PROJECT_QUERY, {
    fetchPolicy: "network-only", // we want the data reloaded && stored in cache
    variables: { id: projectId },
    onError: onGraphQLError({ title: "Could not retrieve project" }),
    onCompleted: ({ project }) => {
      formMethods.reset({
        name: project.name,
      });
      addToRecentlyVisitedProject(project);
    },
  });

  const { data: tokenData } = useQuery<
    QueryReturnValue["projectTextAccessToken"]
  >(GET_PROJECT_ACCESS_TOKEN, {
    pollInterval: 14 * 60 * 1000, // every 14 mins, token lasts 15mins
    fetchPolicy: "no-cache", // we want the data reloaded && but NEVER stored cache
    onError: onGraphQLError({ title: "Access to project details rejected" }),
    variables: { id: projectId },
  });

  const [publishProject] = usePublishProject({ variables: { projectId } });
  const [unarchiveProject] = useUnarchiveProject({ variables: { projectId } });
  const [moveIntoProject] = useMoveIntoProject();

  useEffect(() => {
    const element = document.getElementById("project-title-text-area");
    if (element instanceof HTMLTextAreaElement) {
      const onInput = (event: Event) => {
        if (event.currentTarget instanceof HTMLTextAreaElement) {
          resizeTextArea(event.currentTarget);
        }
      };
      const resizeTextArea = (element: HTMLTextAreaElement) => {
        if (element instanceof HTMLTextAreaElement) {
          element.style.height = "5px";
          element.style.height = element.scrollHeight + "px";
        }
      };

      element.addEventListener("input", onInput);
      resizeTextArea(element);
      return () => {
        element.removeEventListener("input", onInput);
      };
    }
  });

  const onDrop = (source: string, projectId: number) => {
    if (!source) {
      return;
    }

    if (selection.indexOf(source) > -1) {
      moveIntoProject({
        variables: {
          sources: selection,
          projectId,
        },
        onCompleted: () => setSelection([]),
      });
    } else {
      moveIntoProject({
        variables: {
          sources: [source],
          projectId,
        },
        onCompleted: () => setSelection([]),
      });
    }
  };

  if (!data || !data.project) {
    return (
      <div className="flex flex-col pb-20 sm:pb-6">
        <div className="flex flex-row items-center justify-end space-x-4 sm:my-4">
          <ExplorerTabs />
        </div>

        <div className="flex min-w-0 flex-row sm:space-x-2">
          <div className="hidden lg:block">
            <ProjectListing onDrop={onDrop} category="description" />
          </div>
          <EmptyState title="Select a project" />
        </div>
      </div>
    );
  }

  const { project } = data;

  const isBookmarked = find(me?.role?.pinnedProjects, { id: project.id });
  const accessToken = tokenData?.projectTextAccessToken;
  const isReadOnly =
    project.ancestorIsArchived ||
    project.stage === ModelStage.Deleted ||
    project.stage === ModelStage.Archived;

  const renderBookmarkButton = () => {
    if (isBookmarked) {
      return (
        <HoverTooltip tooltip="Remove Bookmark">
          <button
            type="button"
            className="group rounded-lg p-1 text-sm font-medium text-pink-400 transition hover:bg-gray-50 hover:text-pink-300 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50 disabled:text-gray-400 disabled:hover:bg-transparent"
            onClick={() => unpinProject()}
            sr-only="Remove project bookmark"
            title="Remove project bookmark"
          >
            <BookmarkIcon className="h-7 w-7" />
          </button>
        </HoverTooltip>
      );
    } else {
      return (
        <HoverTooltip tooltip="Bookmark Folder">
          <button
            type="button"
            className="group rounded-lg p-1 text-sm font-medium text-gray-200 transition hover:bg-gray-50 hover:text-pink-300 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50 disabled:text-gray-400 disabled:hover:bg-transparent"
            onClick={() => pinProject()}
            sr-only="Bookmark folder"
          >
            <BookmarkIcon className="h-7 w-7" />
          </button>
        </HoverTooltip>
      );
    }
  };

  return (
    <div className="flex min-w-0 flex-col pb-14 sm:pb-14">
      <ConfirmModal
        onClose={() => setConfirmPublishVisible(false)}
        title="Publish Project?"
        description="Please confirm you want to publish this project. This will make this project visible to everyone in your organization."
        onConfirm={publishProject}
        visible={confirmPublishVisible}
        cta="Publish Project"
      />
      <ConfirmModal
        onClose={() => setConfirmUnarchiveVisible(false)}
        title="Unarchive Project?"
        description="Please confirm you want to un-archive this project. This will make this project visible to everyone in your organization."
        onConfirm={unarchiveProject}
        visible={confirmUnarchiveVisible}
        cta="Publish Project"
      />

      <div className="flex flex-row items-center justify-between space-x-4 sm:my-4">
        <div className="flex flex-1 flex-row items-center space-x-2">
          <ProjectCrumbs
            project={project}
            category="description"
            hideOnMobile
          />
        </div>
        <ExplorerTabs isDraft={project.stage === ModelStage.Draft} />
      </div>
      <div className="my-4 space-y-4 px-4 sm:hidden">
        <div className="text-center text-lg font-medium text-gray-700">
          {project.name}
        </div>
        <p className="text-sm text-gray-600">
          You may communicate important information about your project here.
        </p>
      </div>
      <div className="flex min-w-0 flex-1 flex-row sm:space-x-2 xl:space-x-4">
        <div className="hidden lg:block">
          <ProjectListing onDrop={onDrop} category="description" />
        </div>

        <Suspense>
          <div className="flex min-w-0 flex-1 flex-row justify-around space-x-4">
            <div className="relative flex w-full flex-1 flex-col bg-white pb-4 sm:rounded-lg sm:shadow">
              <div className="flex flex-row items-center justify-between space-x-2 rounded-t-lg bg-white px-4 pb-1 pt-3">
                <div className="flex flex-1 flex-row items-center justify-start space-x-2">
                  {renderBookmarkButton()}
                  <ProjectName projectId={project.id} name={project.name} />
                </div>
                <ProjectActions project={project} />
              </div>

              {accessToken && !loading ? (
                <TiptapCollab
                  documentId={projectId}
                  documentType="projectText"
                  accessToken={accessToken}
                  readonly={isReadOnly}
                  placeholder="Use Readme to describe your project plan, goals and description..."
                />
              ) : null}
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
};

ExplorerEditorY.fragments = {
  ExplorerEditorYFragment: gql`
    fragment ExplorerEditorYFragment on Project {
      id
      name
      stage
      parentId
      updatedAt
      ancestorIsArchived
      owner {
        id
        name
        avatarUrl
      }
      ...ProjectCrumbsFragment
      ...ProjectActionsFragment
    }
    ${ProjectCrumbs.fragments.ProjectCrumbsFragment}
    ${ProjectActions.fragments.ProjectActionsFragment}
  `,
};

const GET_PROJECT_QUERY = gql`
  query getProjectForYEditor($id: Int!) {
    project(id: $id, visited: true) {
      id

      ...ExplorerEditorYFragment
    }
  }
  ${ExplorerEditorY.fragments.ExplorerEditorYFragment}
`;

const GET_PROJECT_ACCESS_TOKEN = gql`
  query getProjectTextAccessToken($id: Int!) {
    projectTextAccessToken(id: $id)
  }
`;
