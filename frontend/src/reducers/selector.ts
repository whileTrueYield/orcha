import { RootState } from "./types";
import * as fromNotification from "./notification/selector";
import * as fromCommon from "./upload/selector";
import * as fromMe from "./me/selector";
import * as fromFilter from "./filter/selector";
import * as fromPage from "./page/selector";
import * as fromSchedule from "./schedule/selector";
import * as fromEditor from "./editor/selector";
import * as fromTips from "./tips/selector";
import * as fromProject from "./project/selector";
import * as fromListing from "./listing/selector";

import { RoleType } from "types/graphql";

export const getNotifications = (state: RootState) =>
  fromNotification.getNotifications(state.notification);
export const getLastNotifications = (state: RootState) =>
  fromNotification.getLastNotifications(state.notification);

export const isNewVersionAvailable = (state: RootState) =>
  fromNotification.isNewVersionAvailable(state.notification);

export const getUpload = (state: RootState, name: string) =>
  fromCommon.getUpload(state.upload, name);
export const getUploads = (state: RootState) =>
  fromCommon.getUploads(state.upload);
export const isUploading = (state: RootState) =>
  fromCommon.isUploading(state.upload);
export const getUploadRequest = (state: RootState, name: string) =>
  fromCommon.getUploadRequest(state.upload, name);
export const getUploadRequests = (state: RootState) =>
  fromCommon.getUploadRequests(state.upload);

export const isAdminLevel = (state: RootState) => {
  const me = fromMe.getMe(state.me);
  return me?.role?.type === RoleType.Admin || me?.role?.type === RoleType.Owner;
};
export const isOwnerLevel = (state: RootState) => {
  const me = fromMe.getMe(state.me);
  return me?.role?.type === RoleType.Owner;
};

export const getMe = (state: RootState) => fromMe.getMe(state.me);
export const getMiniMe = (state: RootState) => fromMe.getMiniMe(state.me);
export const getAuthStatus = (state: RootState) =>
  fromMe.getAuthStatus(state.me);
export const getUserStatus = (state: RootState) =>
  fromMe.getUserStatus(state.me);

// feature flags
export const hasAccessToDocumentation = (state: RootState) =>
  fromMe.hasAccessToFeature(state.me, "documentation");
export const hasAccessToSupport = (state: RootState) =>
  fromMe.hasAccessToFeature(state.me, "support");
export const hasAccessToReport = (state: RootState) =>
  fromMe.hasAccessToFeature(state.me, "report");

export const getTicketFilter = (state: RootState) =>
  fromFilter.getTicketFilter(state.filter);
export const getSearchFilter = (state: RootState) =>
  fromFilter.getSearchFilter(state.filter);
export const getExplorerFilter = (state: RootState) =>
  fromFilter.getExplorerFilter(state.filter);
export const searchFilterIsEmpty = (state: RootState) =>
  fromFilter.searchFilterIsEmpty(state.filter);

export const getPage = (state: RootState) => fromPage.getPage(state.page);

export const getAddedTicketsToSchedule = (state: RootState) =>
  fromSchedule.getAddedTicketsToSchedule(state.schedule);
export const getRemovedTicketsFromSchedule = (state: RootState) =>
  fromSchedule.getRemovedTicketsFromSchedule(state.schedule);
export const getSchedulePriorities = (state: RootState) =>
  fromSchedule.getSchedulePriorities(state.schedule);
export const getScheduleProjections = (state: RootState) =>
  fromSchedule.getScheduleProjections(state.schedule);
export const scheduleProjectionsRequireRefresh = (state: RootState) =>
  fromSchedule.scheduleProjectionsRequireRefresh(state.schedule);
export const getScheduleProjectionSorting = (state: RootState) =>
  fromSchedule.getScheduleProjectionSorting(state.schedule);

export const getEditorShowTicketId = (state: RootState) =>
  fromEditor.getEditorShowTicketId(state.editor);

export const isTipVisible = (name: string) => (state: RootState) =>
  fromTips.isTipVisible(state.tips, name);

export const showArchivedProjects = (state: RootState) =>
  fromProject.showArchivedProjects(state.project);
export const getOpenedProjects = (state: RootState) =>
  fromProject.getOpenedProjects(state.project);

export const getSelectedItems = (domain: string) => (state: RootState) =>
  fromListing.getSelectedItems(state.listing, domain);
