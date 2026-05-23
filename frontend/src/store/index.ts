import { useDispatch } from "react-redux";
import configStore from "./store";

export const { store } = configStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
// type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
