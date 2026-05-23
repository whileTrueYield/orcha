import React from "react";
import { Route, Switch } from "react-router-dom";
// import { Welcome } from "./Welcome/Welcome";
import { urlResolver } from "utils/navigation";
import { MeEdit } from "pages/user/MeEdit/MeEdit";

export const OnboardingRouter: React.FC = () => (
  <Switch>
    <Route path={urlResolver.onboarding.paths.welcome} component={MeEdit} />
  </Switch>
);
