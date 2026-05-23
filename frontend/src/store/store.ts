import rootReducer from "reducers";
import { createLogger } from "redux-logger";
import { configureStore, Tuple } from "@reduxjs/toolkit";

const logger = createLogger({
  collapsed: true,
});

const isDev = import.meta.env.NODE_ENV === "development";

const getStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: () => (isDev ? new Tuple(logger) : new Tuple()),
  });

  return { store };
};

export default getStore;
