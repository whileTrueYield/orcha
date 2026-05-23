import React from "react";
import { Route, Switch } from "react-router-dom";
import { TagList } from "./TagList/TagList";
import { TagEdit } from "./TagEdit/TagEdit";
import { urlResolver } from "utils/navigation";
// import { TagStateAnalyser } from "./TagStateAnalyser/TagStateAnalyser";

export const TagRouter: React.FC = () => (
  <Switch>
    {/* <Route
      path={urlResolver.tag.paths.stateAnalyser}
      component={TagStateAnalyser}
    /> */}
    <Route path={urlResolver.tag.paths.edit} component={TagEdit} />
    <Route path={urlResolver.tag.paths.listing} component={TagList} />
  </Switch>
);
