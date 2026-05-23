import { gql, useQuery } from "@apollo/client";
import { PlusIcon } from "@heroicons/react/solid";
import { Button } from "components/fields/Button";
import { EmptyState } from "components/views/EmtpyState";
import React, { useState } from "react";
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useParams,
} from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { Explorer } from "./Explorer/Explorer";
import { ExplorerAnalytics } from "./Explorer/ExplorerAnalytics";
import { ExplorerDependencies } from "./Explorer/ExplorerDependencies";
import { ExplorerEditorY } from "./Explorer/ExplorerEditorY";
import { ExplorerProjectCreateModal } from "./Explorer/ExplorerMain/ExplorerProjectCreateModal";
import { QueryReturnValue } from "types/queryTypes";

interface params {
  projectId?: string;
  orgId: string;
}

export const ExplorerRouter: React.FC = () => {
  return (
    <Route path={urlResolver.explorer.paths.root}>
      <Switch>
        <Route path={urlResolver.explorer.paths.listing} component={Explorer} />
        <Route
          path={urlResolver.explorer.paths.analytics}
          component={ExplorerAnalytics}
        />
        <Route
          path={urlResolver.explorer.paths.editor}
          component={ExplorerEditorY}
        />
        <Route
          path={urlResolver.explorer.paths.dependencies}
          component={ExplorerDependencies}
        />
        <Route component={NewProjectView} />
      </Switch>
    </Route>
  );
};

/**
 * We use that component to display to the user the tutorial
 * when they do not have any project. When clicking the explorer,
 * the user will the redirect to the urlResolver.explorer.paths.root
 * we will then load the last visited project (if any). If none
 * come back (the backend falls back to the latest created project)
 * we know the organization has no project and we should
 * display the onboarding view on projects
 */
const NewProjectView: React.FC = () => {
  const params = useParams<params>();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const history = useHistory();

  const { data } = useQuery<QueryReturnValue["myLastProject"]>(
    MY_LAST_PROJECT_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  if (data?.myLastProject?.id) {
    return (
      <Redirect
        to={{
          pathname: urlResolver.explorer.listing(
            params.orgId,
            data.myLastProject.id
          ),
        }}
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <EmptyState
        title="Create your first project"
        subTitle="Projects are where you store tickets"
      >
        <Button
          type="button"
          onClick={() => setCreateModalVisible(true)}
          btnType="primary"
          className="mt-5"
        >
          <PlusIcon className="-ml-0.5 mr-1 h-5 w-5" />
          Create New Project
        </Button>
        <ExplorerProjectCreateModal
          organizationId={parseInt(params.orgId)}
          visible={isCreateModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onCreate={(project) => {
            history.push(urlResolver.explorer.editor(params.orgId, project.id));
          }}
        />
      </EmptyState>
    </div>
  );
};

const MY_LAST_PROJECT_QUERY = gql`
  query GetMyLastProject {
    myLastProject {
      id
      name
      parentId
    }
  }
`;
