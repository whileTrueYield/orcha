import React from "react";
import { Route, Switch } from "react-router-dom";
import { BlackoutTimeList } from "./BlackoutTimeList/BlackoutTimeList";
import { urlResolver } from "utils/navigation";
import { BlackoutTimeCalendar } from "./BlackoutTimeCalendar/BlackoutTimeCalendar";
// import { BlackoutTimeStateAnalyser } from "./BlackoutTimeStateAnalyser/BlackoutTimeStateAnalyser";

export const BlackoutTimeRouter: React.FC = () => (
  <Switch>
    <Route
      path={urlResolver.blackoutTime.paths.calendar}
      component={BlackoutTimeCalendar}
    />
    <Route
      path={urlResolver.blackoutTime.paths.scheduledListing}
      component={BlackoutTimeList}
    />
  </Switch>
);
