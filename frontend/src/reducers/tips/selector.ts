import { State } from "./index";

export const isTipVisible = (state: State, name: string) =>
  state.tips.indexOf(name) > -1;
