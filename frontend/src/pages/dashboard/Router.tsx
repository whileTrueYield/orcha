import { Home } from "./Home/Home";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { urlResolver } from "utils/navigation";

export const HomeRouter: React.FC = () => (
  <Switch>
    <Route path={urlResolver.dashboard.paths.home} component={Home} />
  </Switch>
);
