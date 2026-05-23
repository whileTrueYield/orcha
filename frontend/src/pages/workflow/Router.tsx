import React from "react";
import { Route, Switch } from "react-router-dom";
import { WorkflowList } from "./WorkflowList/WorkflowList";
import { WorkflowEdit } from "./WorkflowEdit/WorkflowEdit";
import { urlResolver } from "utils/navigation";
// import { WorkflowStateAnalyser } from "./WorkflowStateAnalyser/WorkflowStateAnalyser";

export const WorkflowRouter: React.FC = () => (
  <Switch>
    {/* <Route
      path={urlResolver.workflow.paths.stateAnalyser}
      component={WorkflowStateAnalyser}
    /> */}
    <Route path={urlResolver.workflow.paths.edit} component={WorkflowEdit} />
    <Route path={urlResolver.workflow.paths.listing} component={WorkflowList} />
  </Switch>
);
