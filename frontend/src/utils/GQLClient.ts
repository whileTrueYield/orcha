import {
  ApolloClient,
  ApolloError,
  NormalizedCacheObject,
  HttpLink,
  concat,
  ApolloLink,
} from "@apollo/client";
import { GraphQLUri } from "config";
import { store } from "../store";
import { ACTION_TYPES } from "actions/types";
import { createNotification } from "actions";
import cache from "./GqlCache";

const httpLink = new HttpLink({
  uri: GraphQLUri,
  credentials: "include",
});

const orgMiddleware = new ApolloLink((operation, forward) => {
  const pathFragment = window.location.pathname.split("/");
  const orgId =
    pathFragment[1] === "org" ? parseInt(pathFragment[2], 10) : null;

  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      organization: orgId,
    },
  }));

  return forward(operation);
});

export const GQLClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache,
  link: concat(orgMiddleware, httpLink),
});

interface OnMutationCompleteArgs<T> {
  title?: string;
  subTitle?: string | ((data: T) => string | undefined);
  callback?: (t: T) => void;
}

export const onMutationComplete =
  <T>(args: OnMutationCompleteArgs<T>) =>
  (t: T) => {
    if (args.title) {
      let subTitle: string | undefined;

      if (typeof args.subTitle === "function") {
        subTitle = args.subTitle(t);
      } else {
        subTitle = args.subTitle;
      }

      store.dispatch<ACTION_TYPES>(
        createNotification({
          type: "Success",
          title: args.title,
          subTitle,
        })
      );
    }

    if (args.callback) {
      args.callback(t);
    }
  };

interface OnGraphQLErrorArgs {
  title?: string;
  subTitle?: string;
  callback?: (error: ApolloError) => void;
}

export const onGraphQLError =
  (args: OnGraphQLErrorArgs) => (error: ApolloError, other?: any) => {
    if (args.title) {
      let subTitle = args.subTitle;

      if (!subTitle) {
        subTitle = error?.message
          ? error?.message.replace(/^GraphQL error: /, "")
          : "";
      }

      store.dispatch<ACTION_TYPES>(
        createNotification({
          type: "Error",
          title: args.title,
          subTitle,
        })
      );
    }

    if (args.callback) {
      args.callback(error);
    }
  };
