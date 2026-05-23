import React from "react";
import { Route, Switch } from "react-router-dom";

import { urlResolver } from "utils/navigation";
import { ScheduleCalendarView } from "./ScheduleCalendarView/ScheduleCalendarView";
import { ScheduleEdit } from "./ScheduleEdit/ScheduleEdit";
import { ScheduleListView } from "./ScheduleListView/ScheduleListView";
import { BlockingTicketsView } from "./BlockingTicketsView/BlockingTicketsView";
import { SwimlaneView } from "./Swimlane/SwimlaneView";
import { GanttView } from "./Gantt/GanttView";
import { SchedulePrioritiesView } from "./SchedulePriorities/SchedulePrioritiesView";

export const ScheduleRouter: React.FC = () => {
  return (
    <Switch>
      <Route
        path={urlResolver.schedule.paths.root}
        component={ScheduleCalendarView}
        exact
      />
      <Route
        path={urlResolver.schedule.paths.list}
        component={ScheduleListView}
      />
      <Route
        path={urlResolver.schedule.paths.blockingTickets}
        component={BlockingTicketsView}
      />
      <Route
        path={urlResolver.schedule.paths.swimlanes}
        component={SwimlaneView}
      />
      <Route path={urlResolver.schedule.paths.gantt} component={GanttView} />
      <Route
        path={urlResolver.schedule.paths.priorities}
        component={SchedulePrioritiesView}
      />
      <Route
        path={urlResolver.schedule.paths.editTickets}
        component={ScheduleEdit}
      />
      <Route
        path={urlResolver.schedule.paths.editTickets}
        component={ScheduleEdit}
      />
      <Route path={urlResolver.schedule.paths.root} component={ScheduleEdit} />
    </Switch>
  );
};
