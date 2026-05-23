import React from "react";
import { Route, Switch } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { ImportTicket } from "./ImportTicket/ImportTicket";

export const ImportRouter: React.FC = () => (
  <Switch>
    <Route
      path={urlResolver.import.paths.importTicket}
      component={ImportTicket}
    />
  </Switch>
);
