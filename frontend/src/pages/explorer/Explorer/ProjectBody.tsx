/**
 * ProjectBody — loads a project's Markdown body and hands it to the shared
 * DocumentBody editor (#40). Replaces the collaborative TipTap/hocuspocus
 * project editor.
 *
 * Project-specific concern: a project is read-only when archived directly OR
 * through an archived ancestor (archival is inherited). Everything else — the
 * editor, save, conflict and warning handling — lives in DocumentBody.
 *
 * Exports: ProjectBody, GET_PROJECT_BODY, SAVE_DOCUMENT_BODY (re-exported).
 */
import { gql, useQuery } from "@apollo/client";
import { onGraphQLError } from "utils/GQLClient";
import { DocumentBodyType, ModelStage, Query } from "types/graphql";
import { DocumentBody } from "components/Markdown/DocumentBody";

export { SAVE_DOCUMENT_BODY } from "components/Markdown/DocumentBody";

export const GET_PROJECT_BODY = gql`
  query GetProjectBody($id: Int!) {
    project(id: $id) {
      id
      stage
      ancestorIsArchived
      body {
        markdown
        version
      }
    }
  }
`;

interface Props {
  projectId: number;
}

export const ProjectBody: React.FC<Props> = ({ projectId }) => {
  const { data } = useQuery<Pick<Query, "project">>(GET_PROJECT_BODY, {
    variables: { id: projectId },
    fetchPolicy: "network-only",
    onError: onGraphQLError({ title: "Could not load the project body" }),
  });

  if (!data?.project) return null;

  return (
    <DocumentBody
      key={projectId}
      documentType={DocumentBodyType.Project}
      documentId={projectId}
      initialMarkdown={data.project.body.markdown}
      initialVersion={data.project.body.version}
      readOnly={
        data.project.stage === ModelStage.Archived ||
        data.project.ancestorIsArchived
      }
      saveErrorTitle="Could not save the project body"
    />
  );
};
