import type { Query, Mutation } from "./graphql";

export type QueryReturnValue = {
  [Property in keyof Query]: {
    [P in Property]: Query[Property];
  };
};

export type MutationReturnValue = {
  [Property in keyof Mutation]: {
    [P in Property]: Mutation[Property];
  };
};
