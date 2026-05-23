import React from "react";
import { Route, Switch } from "react-router-dom";
import { DocumentationList } from "./DocumentationList/DocumentationList";
import { DocumentationView } from "./DocumentationView/DocumentationView";
import { urlResolver } from "utils/navigation";

// This router is loaded through suspence. We do not want to load it
// unless the current user does have access to the feature (see feature flag)
const DocumentationRouter: React.FC = () => (
  <Switch>
    <Route
      path={urlResolver.documentation.paths.view}
      component={DocumentationView}
    />
    <Route
      path={urlResolver.documentation.paths.pageView}
      component={DocumentationView}
    />
    <Route
      path={urlResolver.documentation.paths.listing}
      component={DocumentationList}
    />
  </Switch>
);

export default DocumentationRouter;
