import React from "react";
import { Route, Switch } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { TicketFavorite } from "./TicketList/TicketFavorite";
import { TicketView } from "./TicketView/TicketView";

export const TicketRouter: React.FC = () => (
  <Switch>
    <Route path={urlResolver.ticket.paths.view} component={TicketView} />
    <Route
      path={urlResolver.ticket.paths.favorite}
      component={TicketFavorite}
    />
  </Switch>
);
