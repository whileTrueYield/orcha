import { trim } from "lodash";

type URLParams = { [params: string]: string };

const urlWithParams = (url: string) => (params?: URLParams) => {
  if (params) {
    const searchParams = new URLSearchParams(window.location.search);
    for (const key in params) {
      searchParams.set(key, params[key]);
    }

    return url + "?" + searchParams.toString();
  } else {
    return url;
  }
};

// return different value if on a mac some others OS
export function forOS<T extends any>(mac: T, others: T): T {
  if (window.navigator.userAgent.indexOf("Mac") > -1) {
    return mac;
  }
  return others;
}

export const urlResolver = {
  auth: {
    root: () => urlResolver.auth.login(),
    login: () => "/auth/login",
    logout: () => "/auth/logout",
    register: () => "/auth/register",
    organization: () => "/auth/organization",
    createOrganization: () => "/auth/create_organization",
    createFirstOrganization: () => "/auth/create_first_organization",
    chooseOrganization: () => "/auth/choose_organization",
    passwordLost: () => "/auth/password_lost",
    passwordReset: () => "/auth/password_reset",
    sendConfirmationEmail: () => "/auth/confirm_email",
    acceptInvite: () => "/auth/register_on_invite",
    paths: {
      login: "/auth/login",
      logout: "/auth/logout",
      register: "/auth/register",
      organization: "/auth/organization",
      createOrganization: "/auth/create_organization",
      createFirstOrganization: "/auth/create_first_organization",
      chooseOrganization: "/auth/choose_organization",
      passwordLost: "/auth/password_lost",
      passwordReset: "/auth/password_reset",
      sendConfirmationEmail: "/auth/confirm_email",
      acceptInvite: "/auth/register_on_invite",
    },
  },
  onboarding: {
    root: (orgId: string) =>
      urlResolver.onboarding.paths.welcome.replace(":orgId", orgId.toString()),
    welcome: (orgId: string) =>
      urlResolver.onboarding.paths.welcome.replace(":orgId", orgId.toString()),
    paths: {
      welcome: "/org/:orgId/onboarding/welcome",
    },
  },
  schedule: {
    root: (orgId: string | number) =>
      urlResolver.schedule.paths.root.replace(":orgId", orgId.toString()),
    list: (orgId: string | number) =>
      urlResolver.schedule.paths.list.replace(":orgId", orgId.toString()),
    swimlanes: (orgId: string | number) =>
      urlResolver.schedule.paths.swimlanes.replace(":orgId", orgId.toString()),
    priorities: (orgId: string | number) =>
      urlResolver.schedule.paths.priorities.replace(":orgId", orgId.toString()),
    gantt: (orgId: string | number) =>
      urlResolver.schedule.paths.gantt.replace(":orgId", orgId.toString()),
    blockingTickets: (orgId: string | number) =>
      urlResolver.schedule.paths.blockingTickets.replace(
        ":orgId",
        orgId.toString(),
      ),
    editTickets: (orgId: string | number) =>
      urlResolver.schedule.paths.editTickets.replace(
        ":orgId",
        orgId.toString(),
      ),
    editPriorities: (orgId: string | number) =>
      urlResolver.schedule.paths.editPriorities.replace(
        ":orgId",
        orgId.toString(),
      ),
    editProjections: (orgId: string | number) =>
      urlResolver.schedule.paths.editProjections.replace(
        ":orgId",
        orgId.toString(),
      ),
    paths: {
      root: "/org/:orgId/schedule",
      list: "/org/:orgId/schedule/list",
      editTickets: "/org/:orgId/schedule/edit_tickets",
      editPriorities: "/org/:orgId/schedule/edit_priorities",
      editProjections: "/org/:orgId/schedule/edit_projections",
      swimlanes: "/org/:orgId/schedule/swimlanes",
      priorities: "/org/:orgId/schedule/priorities",
      gantt: "/org/:orgId/schedule/gantt",
      blockingTickets: "/org/:orgId/schedule/blocking_tickets",
    },
  },
  import: {
    root: (orgId: string | number) =>
      urlResolver.import.paths.importTicket.replace(":orgId", orgId.toString()),
    importTicket: (orgId: string | number) =>
      urlResolver.import.paths.importTicket.replace(":orgId", orgId.toString()),
    paths: {
      importTicket: "/org/:orgId/admin/import/ticket",
    },
  },
  explorer: {
    root: (orgId: string | number): string =>
      urlResolver.explorer.paths.root.replace(":orgId", orgId.toString()),
    listing: (orgId: string | number, projectId: string | number): string =>
      urlResolver.explorer.paths.listing
        .replace(":orgId", orgId.toString())
        .replace(":projectId", projectId.toString()),
    editor: (orgId: string | number, projectId: string | number): string =>
      urlResolver.explorer.paths.editor
        .replace(":orgId", orgId.toString())
        .replace(":projectId", projectId.toString()),
    analytics: (orgId: string | number, projectId: string | number): string =>
      urlResolver.explorer.paths.analytics
        .replace(":orgId", orgId.toString())
        .replace(":projectId", projectId.toString()),
    dependencies: (
      orgId: string | number,
      projectId: string | number,
    ): string =>
      urlResolver.explorer.paths.dependencies
        .replace(":orgId", orgId.toString())
        .replace(":projectId", projectId.toString()),

    paths: {
      root: "/org/:orgId/explorer",
      listing: "/org/:orgId/explorer/view/:projectId",
      editor: "/org/:orgId/explorer/editor/:projectId",
      slateEditor: "/org/:orgId/explorer/slate-editor/:projectId",
      old_editor: "/org/:orgId/explorer/old_editor/:projectId",
      analytics: "/org/:orgId/explorer/analytics/:projectId",
      dependencies: "/org/:orgId/explorer/dependencies/:projectId",
      searchRoot: "/org/:orgId/explorer/search/:projectId",
    },
  },
  search: {
    root: (orgId: string | number) =>
      urlResolver.search.search(orgId.toString()),
    search: (orgId: string | number, projectId?: string | number): string =>
      projectId
        ? urlResolver.search.paths.search
            .replace(":orgId", orgId.toString())
            .replace(":projectId", projectId.toString())
        : urlResolver.search.paths.root.replace(":orgId", orgId.toString()),
    paths: {
      root: "/org/:orgId/search/",
      search: "/org/:orgId/search/:projectId",
    },
  },
  admin: {
    root: (orgId: string | number) =>
      urlResolver.role.listing(orgId.toString()),
    sidebar: (orgId: string | number) =>
      urlResolver.admin.paths.sidebar.replace(":orgId", orgId.toString()),
    billing: (orgId: string | number) =>
      urlResolver.admin.paths.billing.replace(":orgId", orgId.toString()),
    paths: {
      billing: "/org/:orgId/admin/billing",
      sidebar: "/org/:orgId/admin",
    },
  },
  page: {
    root: (orgId: string | number) =>
      urlResolver.page.listing(orgId.toString()),
    listing: (orgId: string | number) =>
      urlResolver.page.paths.listing.replace(":orgId", orgId.toString()),
    view: (orgId: string | number, id: number) =>
      urlResolver.page.paths.view
        .replace(":orgId", orgId.toString())
        .replace(":pageId", id.toString()),
    paths: {
      listing: "/org/:orgId/page",
      view: "/org/:orgId/page/:pageId/view",
    },
  },
  report: {
    root: (orgId: string | number) =>
      urlResolver.report.listing(orgId.toString()),
    listing: (orgId: string | number) =>
      urlResolver.report.paths.listing.replace(":orgId", orgId.toString()),
    view: (orgId: string | number, reportId: number) =>
      urlResolver.report.paths.view
        .replace(":orgId", orgId.toString())
        .replace(":reportId", reportId.toString()),
    edit: (orgId: string | number, reportId: number) =>
      urlResolver.report.paths.edit
        .replace(":orgId", orgId.toString())
        .replace(":reportId", reportId.toString()),
    paths: {
      listing: "/org/:orgId/report",
      view: "/org/:orgId/report/:reportId/view",
      edit: "/org/:orgId/report/:reportId/edit",
    },
  },
  documentation: {
    root: (orgId: string | number) =>
      urlResolver.documentation.listing(orgId.toString()),
    listing: (orgId: string | number) =>
      urlResolver.documentation.paths.listing.replace(
        ":orgId",
        orgId.toString(),
      ),
    view: (orgId: string | number, documentationId: number) =>
      urlResolver.documentation.paths.view
        .replace(":orgId", orgId.toString())
        .replace(":documentationId", documentationId.toString()),
    pageView: (
      orgId: string | number,
      documentationId: number,
      pageId: number,
    ) =>
      urlResolver.documentation.paths.pageView
        .replace(":orgId", orgId.toString())
        .replace(":documentationId", documentationId.toString())
        .replace(":pageId", pageId.toString()),
    paths: {
      listing: "/org/:orgId/documentation",
      view: "/org/:orgId/documentation/:documentationId/view",
      pageView: "/org/:orgId/documentation/:documentationId/page/:pageId/view",
    },
  },
  product: {
    root: (orgId: string | number) =>
      urlResolver.product.listing(orgId.toString()),
    listing: (orgId: string | number, params?: URLParams) =>
      urlWithParams(
        urlResolver.product.paths.listing.replace(":orgId", orgId.toString()),
      )(params),
    edit: (orgId: string | number, id: number) =>
      urlResolver.product.paths.edit
        .replace(":orgId", orgId.toString())
        .replace(":productId", id.toString()),
    view: (orgId: string | number, id: number) =>
      urlResolver.product.paths.view
        .replace(":orgId", orgId.toString())
        .replace(":productId", id.toString()),
    paths: {
      listing: "/org/:orgId/admin/product",
      edit: "/org/:orgId/admin/product/:productId/edit",
      view: "/org/:orgId/admin/product/:productId/view",
    },
  },
  team: {
    root: (orgId: string | number) =>
      urlResolver.team.listing(orgId.toString()),
    listing: (orgId: string | number) =>
      urlResolver.team.paths.listing.replace(":orgId", orgId.toString()),
    edit: (orgId: string | number, id: number) =>
      urlResolver.team.paths.edit
        .replace(":orgId", orgId.toString())
        .replace(":teamId", id.toString()),
    view: (orgId: string | number, id: number) =>
      urlResolver.team.paths.view
        .replace(":orgId", orgId.toString())
        .replace(":teamId", id.toString()),
    paths: {
      listing: "/org/:orgId/admin/team",
      edit: "/org/:orgId/admin/team/:teamId/edit",
      view: "/org/:orgId/admin/team/:teamId/view",
    },
  },
  ticket: {
    root: (orgId: string | number) =>
      urlResolver.ticket.listing(orgId.toString()),
    listing: (orgId: string | number) =>
      urlResolver.ticket.paths.listing.replace(":orgId", orgId.toString()),
    favorite: (orgId: string | number) =>
      urlResolver.ticket.paths.favorite.replace(":orgId", orgId.toString()),
    view: (orgId: string | number, id: number) =>
      urlResolver.ticket.paths.view
        .replace(":orgId", orgId.toString())
        .replace(":ticketId", id.toString()),
    paths: {
      favorite: "/org/:orgId/favorite-tickets",
      listing: "/org/:orgId/ticket",
      view: "/org/:orgId/ticket/:ticketId/view",
    },
  },
  issue: {
    root: (orgId: string | number) =>
      urlResolver.issue.listing(orgId.toString()),
    listing: (orgId: string | number) =>
      urlResolver.issue.paths.listing.replace(":orgId", orgId.toString()),
    clientView: (token: string) =>
      urlResolver.issue.paths.clientView.replace(":token", token),
    view: (orgId: string | number, id: number) =>
      urlResolver.issue.paths.view
        .replace(":orgId", orgId.toString())
        .replace(":issueId", id.toString()),
    paths: {
      listing: "/org/:orgId/issue",
      view: "/org/:orgId/issue/:issueId/view",
      clientView: "/support/:token",
    },
  },

  story: {
    root: (orgId: string | number) =>
      urlResolver.story.listing(orgId.toString()),
    listing: (orgId: string | number) =>
      urlResolver.story.paths.listing.replace(":orgId", orgId.toString()),
    edit: (orgId: string | number, id: number) =>
      urlResolver.story.paths.edit
        .replace(":orgId", orgId.toString())
        .replace(":storyId", id.toString()),
    view: (orgId: string | number, id: number) =>
      urlResolver.story.paths.view
        .replace(":orgId", orgId.toString())
        .replace(":storyId", id.toString()),
    paths: {
      listing: "/org/:orgId/story",
      edit: "/org/:orgId/story/:storyId/edit",
      view: "/org/:orgId/story/:storyId/view",
    },
  },
  note: {
    root: (orgId: string | number) =>
      urlResolver.note.listing(orgId.toString()),
    listing: (orgId: string | number) =>
      urlResolver.note.paths.listing.replace(":orgId", orgId.toString()),
    paths: {
      listing: "/org/:orgId/note",
    },
  },
  calendar: {
    root: (orgId: string | number) =>
      urlResolver.calendar.week(orgId.toString()),
    week: (orgId: string | number) =>
      urlResolver.calendar.paths.week.replace(":orgId", orgId.toString()),
    paths: {
      week: "/org/:orgId/calendar",
    },
  },
  dashboard: {
    root: (orgId: string | number) =>
      urlResolver.dashboard.home(orgId.toString()),
    home: (orgId: string | number) =>
      urlResolver.dashboard.paths.home.replace(":orgId", orgId.toString()),
    paths: {
      home: "/org/:orgId/dashboard",
    },
  },
  demo: {
    root: () => urlResolver.demo.demoRequest(),
    demoRequest: () => urlResolver.demo.paths.demoRequest,
    demoStatus: () => urlResolver.demo.paths.demoStatus,
    paths: {
      demoRequest: "/demo/req",
      demoStatus: "/demo/status",
    },
  },
  dependency: {
    root: (orgId: string | number) =>
      urlResolver.dependency.paths.rootDependency.replace(
        ":orgId",
        orgId.toString(),
      ),
    dependency: (orgId: string | number, path: string = "") =>
      urlResolver.dependency.paths.dependency
        .replace(":orgId", orgId.toString())
        .replace(
          ":path+",
          path
            .split("/")
            .map(trim)
            .filter((i) => i)
            .map(encodeURIComponent)
            .join("/"),
        ),
    paths: {
      dependency: "/org/:orgId/dependency/:path+",
      rootDependency: "/org/:orgId/dependency",
    },
  },
  role: {
    root: (orgId: string | number) =>
      urlResolver.role.listing(orgId.toString()),
    listing: (orgId: string | number, params?: URLParams) =>
      urlWithParams(
        urlResolver.role.paths.listing.replace(":orgId", orgId.toString()),
      )(params),
    view: (orgId: string | number, roleId: number) =>
      urlResolver.role.paths.view
        .replace(":orgId", orgId.toString())
        .replace(":roleId", roleId.toString()),

    edit: (orgId: string | number, roleId: number) =>
      urlResolver.role.paths.edit
        .replace(":orgId", orgId.toString())
        .replace(":roleId", roleId.toString()),
    paths: {
      listing: "/org/:orgId/admin/role",
      view: "/org/:orgId/admin/role/:roleId/",
      edit: "/org/:orgId/admin/role/:roleId/edit",
    },
  },
  user: {
    editMe: (orgId: string | number) =>
      urlResolver.user.paths.editMe.replace(":orgId", orgId.toString()),
    paths: {
      editMe: "/org/:orgId/user/me/edit",
    },
  },
  workflow: {
    root: (orgId: string) => urlResolver.workflow.listing(orgId.toString()),
    listing: (orgId: string) =>
      urlResolver.workflow.paths.listing.replace(":orgId", orgId.toString()),
    edit: (orgId: string, id: number) =>
      urlResolver.workflow.paths.edit
        .replace(":orgId", orgId.toString())
        .replace(":workflowId", id.toString()),
    paths: {
      listing: "/org/:orgId/admin/workflow",
      edit: "/org/:orgId/admin/workflow/:workflowId",
    },
  },
  blackoutTime: {
    root: (orgId: string) =>
      urlResolver.blackoutTime.calendar(orgId.toString()),
    calendar: (orgId: string) =>
      urlResolver.blackoutTime.paths.calendar.replace(
        ":orgId",
        orgId.toString(),
      ),
    scheduledListing: (orgId: string) =>
      urlResolver.blackoutTime.paths.scheduledListing.replace(
        ":orgId",
        orgId.toString(),
      ),
    recurringListing: (orgId: string) =>
      urlResolver.blackoutTime.paths.recurringListing.replace(
        ":orgId",
        orgId.toString(),
      ),
    scheduledEdit: (orgId: string, id: number) =>
      urlResolver.blackoutTime.paths.scheduledEdit
        .replace(":orgId", orgId.toString())
        .replace(":blackoutTimeId", id.toString()),
    recurringEdit: (orgId: string, id: number) =>
      urlResolver.blackoutTime.paths.recurringEdit
        .replace(":orgId", orgId.toString())
        .replace(":blackoutTimeId", id.toString()),
    paths: {
      calendar: "/org/:orgId/admin/blackout/calendar",
      scheduledListing: "/org/:orgId/admin/blackout/scheduled",
      recurringListing: "/org/:orgId/admin/blackout/recurring",
      scheduledEdit: "/org/:orgId/admin/blackout/scheduled/:blackoutTimeId",
      recurringEdit: "/org/:orgId/admin/blackout/recurring/:blackoutTimeId",
    },
  },
  tag: {
    root: (orgId: string) => urlResolver.tag.listing(orgId.toString()),
    listing: (orgId: string) =>
      urlResolver.tag.paths.listing.replace(":orgId", orgId.toString()),
    edit: (orgId: string, id: number) =>
      urlResolver.tag.paths.edit
        .replace(":orgId", orgId.toString())
        .replace(":tagId", id.toString()),
    paths: {
      listing: "/org/:orgId/admin/tag",
      edit: "/org/:orgId/admin/tag/:tagId",
    },
  },
};
