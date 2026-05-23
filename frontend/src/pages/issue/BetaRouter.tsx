import React from "react";
import { Route, Switch } from "react-router-dom";
import { IssueList } from "./IssueList/IssueList";
import { urlResolver } from "utils/navigation";
import { IssueView } from "./IssueView/IssueView";

// This router is loaded through suspence. We do not want to load it
// unless the current user does have access to the feature (see feature flag)
const IssueRouter: React.FC = () => (
  <Switch>
    <Route path={urlResolver.issue.paths.view} component={IssueView} />
    <Route path={urlResolver.issue.paths.listing} component={IssueList} />
  </Switch>
);

export default IssueRouter;
