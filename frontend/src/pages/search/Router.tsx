import { Route, Switch } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { Search } from "./Search/Search";

export const SearchRouter: React.FC = () => {
  return (
    <Switch>
      <Route path={urlResolver.search.paths.search} component={Search} />
      <Route path={urlResolver.search.paths.root} component={Search} />
    </Switch>
  );
};
