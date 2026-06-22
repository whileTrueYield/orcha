import React from "react";
import { Route, Switch } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { RepositoryLinksView } from "./RepositoryLinksView";

export const RepositoryLinksRouter: React.FC = () => (
  <Switch>
    <Route
      path={urlResolver.admin.paths.repositoryLinks}
      component={RepositoryLinksView}
    />
  </Switch>
);
