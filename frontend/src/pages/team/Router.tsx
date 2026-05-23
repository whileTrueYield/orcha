import React from "react";
import { Route, Switch } from "react-router-dom";
import { TeamList } from "./TeamList/TeamList";
import { TeamEdit } from "./TeamEdit/TeamEdit";
import { TeamView } from "./TeamView/TeamView";
import { urlResolver } from "utils/navigation";

export const TeamRouter: React.FC = () => (
  <Switch>
    <Route path={urlResolver.team.paths.edit} component={TeamEdit} />
    <Route path={urlResolver.team.paths.view} component={TeamView} />
    <Route path={urlResolver.team.paths.listing} component={TeamList} />
  </Switch>
);
