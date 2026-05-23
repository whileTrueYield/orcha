import React from "react";
import { Route, Switch } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { BillingView } from "./BillingView/BillingView";

export const BillingRouter: React.FC = () => (
  <Switch>
    <Route path={urlResolver.admin.paths.billing} component={BillingView} />
  </Switch>
);
