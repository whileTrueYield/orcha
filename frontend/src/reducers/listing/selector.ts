import { State } from "./index";

const defaultSelectedItems = [] as readonly string[];

export const getSelectedItems = (state: State, domain: string): string[] =>
  state.selectedItems[domain] || defaultSelectedItems;
