export * from "./notification";
export * from "./pagination";
export * from "./react";
export * from "./ticket";
export * from "./filter";
export * from "./schedule";

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
