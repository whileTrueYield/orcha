import { ActionWithPayload, EmptyAction } from "actions/actionTypes";

export type ShowTipsAction = ActionWithPayload<"SHOW_TIPS", string>;
export type HideAllTipsAction = EmptyAction<"HIDE_ALL_TIPS">;
export type HideTipsAction = ActionWithPayload<"HIDE_TIPS", string>;

export type TIPS_ACTION_TYPES = ShowTipsAction;

export const showTips = (tipsName: string): ShowTipsAction => ({
  type: "SHOW_TIPS",
  payload: tipsName,
});

export const hideAllTips = (): HideAllTipsAction => ({
  type: "HIDE_ALL_TIPS",
});

export const hideTips = (tipsName: string): HideTipsAction => ({
  type: "HIDE_TIPS",
  payload: tipsName,
});
