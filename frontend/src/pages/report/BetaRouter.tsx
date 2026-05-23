import React from "react";
import { Route, Switch } from "react-router-dom";
import { ReportList } from "./ReportList/ReportList";
import { LazyReportView } from "./ReportView/LazyReportView";
import { urlResolver } from "utils/navigation";
import { ReportEdit } from "./ReportEdit/ReportEdit";

// This router is loaded through suspence. We do not want to load it
// unless the current user does have access to the feature (see feature flag)
const ReportRouter: React.FC = () => (
  <Switch>
    <Route path={urlResolver.report.paths.view} component={LazyReportView} />
    <Route path={urlResolver.report.paths.edit} component={ReportEdit} />
    <Route path={urlResolver.report.paths.listing} component={ReportList} />
  </Switch>
);

export default ReportRouter;
