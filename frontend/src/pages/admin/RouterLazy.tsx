import React from "react";
import { Route, Switch } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { AdminSidebar } from "./AdminSidebar/AdminSidebar";

const LazyAdminRouter: React.FC = () => (
  <Switch>
    <Route path={urlResolver.admin.paths.sidebar} component={AdminSidebar} />
  </Switch>
);

export default LazyAdminRouter;
