import React from "react";
import { Route, Switch } from "react-router-dom";
import { LogoGenerator } from "./LogoGenerator";

export const LogoRouter: React.FC = () => (
  <Switch>
    <Route path="/logo" component={LogoGenerator} exact />
  </Switch>
);
