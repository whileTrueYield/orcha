import React from "react";
import { Route, Switch } from "react-router-dom";
import { NoteList } from "./NoteList/NoteList";
import { urlResolver } from "utils/navigation";

export const NoteRouter: React.FC = () => (
  <Switch>
    {/* <Route path={urlResolver.page.paths.edit} component={PageEdit} />
    <Route path={urlResolver.page.paths.view} component={PageView} /> */}
    <Route path={urlResolver.note.paths.listing} component={NoteList} />
  </Switch>
);
