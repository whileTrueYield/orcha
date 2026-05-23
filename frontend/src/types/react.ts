import { DocumentNode } from "graphql";

export interface FCWithFragments<P = {}> extends React.FunctionComponent<P> {
  fragments: {
    [fragment: string]: DocumentNode;
  };
}
