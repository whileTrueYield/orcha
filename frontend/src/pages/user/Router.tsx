import React from "react";
import { Route, Switch } from "react-router-dom";
import { RoleList } from "./RoleList/RoleList";
import { urlResolver } from "utils/navigation";
import { RoleEdit } from "./RoleEdit/RoleEdit";

export const UserRouter: React.FC = () => (
  <Switch>
    <Route path={urlResolver.role.paths.edit} component={RoleEdit} />
    <Route path={urlResolver.role.paths.listing} component={RoleList} />
  </Switch>
);
