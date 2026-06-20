import React, { useState, useEffect } from "react";
import { MenuItem } from "./MenuItem";
import { urlResolver } from "utils/navigation";
import "./sidebar.css";
import { Menu, Transition } from "@headlessui/react";
import { useSelector } from "react-redux";
import { Avatar } from "components/views/Avatar";
import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import { gql, useMutation, useQuery } from "@apollo/client";
import { onGraphQLError, onMutationComplete, GQLClient } from "utils/GQLClient";
import { Link, NavLink, useHistory, useParams } from "react-router-dom";
import { TaskPlayer } from "components/taskManager/TaskPlayer";
import { useAppDispatch } from "store";
import {
  CogIcon,
  HomeIcon,
  PencilAltIcon,
  TicketIcon,
  RefreshIcon,
  SupportIcon,
  BookOpenIcon,
  ChartPieIcon,
  BookmarkIcon,
  CalendarIcon,
  SearchIcon,
  FolderIcon,
  KeyIcon,
  LinkIcon,
} from "@heroicons/react/outline";
import {
  SwitchHorizontalIcon,
  UserCircleIcon,
  ChevronDownIcon,
  LogoutIcon,
  PlusIcon,
  PlusSmIcon,
} from "@heroicons/react/solid";
import { NoteCreateModal } from "pages/note/CreateNote/NoteCreateModal";
import { NotificationButton } from "components/notification/NotificationButton";
import { ReadNotificationMiddleware } from "components/notification/ReadNotificationMiddleware";
import { TicketCreateModal } from "pages/ticket/TicketCreate/TicketCreateModal";
import {
  getMe,
  hasAccessToDocumentation,
  hasAccessToSupport,
  isAdminLevel,
  hasAccessToReport,
  getEditorShowTicketId,
} from "reducers/selector";
import { ScheduleStatus } from "types/graphql";
import { SearchModal } from "components/search/SearchModal";
import { TicketModalEdit } from "pages/ticket/TicketModalEdit";
import { hideTicketEditModal } from "actions";
import { WelcomeButton } from "./WelcomeButton";
import { StartUsingOrcha } from "./StartUsingOrcha";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import { HoverTooltip } from "components/help/Tooltip";

type Props = {
  children?: React.ReactNode;
};

export const Sidebar: React.FC<Props> = ({ children }) => {
  const { orgId } = useParams<{ orgId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createNoteModalVisible, setCreateNoteModalVisibility] =
    useState(false);
  const [searchModalVisible, setSearchModalVisibility] = useState(false);
  const [createTicketModalVisible, setCreateTicketModalVisibility] =
    useState(false);
  const showTicketId = useSelector(getEditorShowTicketId);

  const me = useSelector(getMe);
  const isAdmin = useSelector(isAdminLevel);
  const history = useHistory();
  const dispatch = useAppDispatch();

  const hasSupport = useSelector(hasAccessToSupport);
  const hasDocumentation = useSelector(hasAccessToDocumentation);
  const hasReport = useSelector(hasAccessToReport);

  useEffect(() => {
    const onKeyUp = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        event.stopPropagation();
        setSearchModalVisibility(true);
      }
    };
    document.addEventListener("keydown", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyUp);
    };
  }, [setSearchModalVisibility]);

  const { data } = useQuery<QueryReturnValue["myRoles"]>(MY_ROLES_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const [logout] = useMutation<MutationReturnValue["logout"]>(LOGOUT_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Logout Success",
      subTitle: "You have been logged out.",
      callback: async () => {
        GQLClient.cache.reset();
        dispatch({ type: "LOGOUT_SUCCESS" });
        history.replace(urlResolver.auth.login());
      },
    }),
    onError: onGraphQLError({
      title: "Something is Wrong",
      subTitle: "Clearing your cookies will also log you out",
    }),
  });

  // close the sidebar on ESC key pressed
  useEffect(() => {
    const closeSidebarOnEsc = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keyup", closeSidebarOnEsc);
    return () => {
      window.removeEventListener("keyup", closeSidebarOnEsc);
    };
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.setProperty("overflow", "hidden");
    } else {
      document.body.style.removeProperty("overflow");
    }
  }, [sidebarOpen]);

  const role = me?.role;
  const organization = me?.organization;

  if (!organization || !role) {
    return null;
  }

  const scheduleOk = organization.scheduleStatus === ScheduleStatus.Ok;

  const myRoles = data ? data.myRoles : [];
  const organizationChangeOptions: PopMenuOption[] = myRoles.map(
    (role): PopMenuOption => ({
      type: "link",
      target: "_blank",
      to: urlResolver.dashboard.home(role.organization.id.toString()),
      label: role.organization.name,
      disabled: organization.id === role.organization.id,
    }),
  );

  organizationChangeOptions.unshift({
    type: "info",
    component: (
      <div className="flex flex-row items-center bg-gray-700 px-2 py-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="text-center text-sm font-medium text-gray-100">
            <RefreshIcon className="mr-2 inline-block h-4 w-4 text-gray-300" />
            Change Organization
          </div>
        </div>
      </div>
    ),
  });

  organizationChangeOptions.push({ type: "separator" });
  organizationChangeOptions.push({
    type: "link",
    to: urlResolver.auth.createOrganization(),
    label: "Create Organization",
    icon: (className) => <PlusIcon className={className} />,
  });

  if (isAdmin) {
    organizationChangeOptions.push({ type: "separator" });
    organizationChangeOptions.push({
      type: "link",
      to: urlResolver.role.listing(organization.id.toString()),
      label: "Admin",
      icon: (className) => <CogIcon className={className} />,
    });
  }

  const userOptions: PopMenuOption[] = [
    {
      type: "info",
      component: (
        <div className="flex flex-row items-center bg-gray-700 p-3">
          <div className="mr-2 flex-none">
            <Avatar
              className="h-10 w-10 rounded-md border-2 border-gray-100 shadow"
              src={role.avatarUrl}
              name={role.name}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="font-semibold text-gray-100">{role.name}</div>
            <div className="flex flex-row justify-between text-xs text-white">
              <div className="truncate" title={organization.name}>
                {organization.name}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      type: "link",
      label: "Edit Profile",
      to: urlResolver.user.editMe(orgId),
      icon: (className) => <UserCircleIcon className={className} />,
    },
    {
      type: "link",
      label: "API Tokens",
      to: urlResolver.user.tokens(orgId),
      icon: (className) => <KeyIcon className={className} />,
    },
    {
      type: "link",
      label: "Connected Apps",
      to: urlResolver.user.connectedApps(orgId),
      icon: (className) => <LinkIcon className={className} />,
    },
    {
      type: "link",
      label: "Change Organization",
      to: urlResolver.auth.chooseOrganization(),
      icon: (className) => <SwitchHorizontalIcon className={className} />,
    },
    {
      type: "separator",
    },
    {
      type: "button",
      label: "Logout",
      onClick: () => logout(),
      icon: (className) => <LogoutIcon className={className} />,
    },
  ];

  const menuItems = (
    <nav>
      <MenuItem
        data-e2e="sidebar-dashboard-link"
        dismissSidebar={() => setSidebarOpen(false)}
        to={urlResolver.dashboard.root(orgId)}
        icon={(className) => <HomeIcon className={className} />}
      >
        Home
      </MenuItem>
      <MenuItem
        data-e2e="sidebar-favorite-link"
        dismissSidebar={() => setSidebarOpen(false)}
        to={urlResolver.ticket.favorite(orgId)}
        icon={(className) => <BookmarkIcon className={className} />}
      >
        Favorites
      </MenuItem>
      <MenuItem
        data-e2e="sidebar-notes-link"
        dismissSidebar={() => setSidebarOpen(false)}
        to={urlResolver.note.root(orgId)}
        icon={(className) => <PencilAltIcon className={className} />}
      >
        Notes
      </MenuItem>

      <div className="my-2 h-px bg-gray-700"></div>

      <MenuItem
        data-e2e="sidebar-search-link"
        dismissSidebar={() => setSidebarOpen(false)}
        to={urlResolver.search.root(orgId)}
        icon={(className) => <SearchIcon className={className} />}
      >
        Search
      </MenuItem>

      <MenuItem
        data-e2e="sidebar-schedule-link"
        dismissSidebar={() => setSidebarOpen(false)}
        to={
          scheduleOk
            ? urlResolver.schedule.root(orgId)
            : urlResolver.schedule.blockingTickets(orgId)
        }
        icon={(className) => (
          <CalendarIcon
            className={`${className} ${scheduleOk ? "" : "!text-red-400"}`}
          />
        )}
        className={scheduleOk ? undefined : "!text-red-400"}
      >
        <span>Schedule</span>
        {!scheduleOk && (
          <div className="relative ml-4 h-2 w-2 rounded-full bg-red-500">
            <div className="absolute -left-0.5 -top-0.5 h-3 w-3 animate-ping rounded-full bg-red-500" />
          </div>
        )}
      </MenuItem>

      <MenuItem
        data-e2e="sidebar-explorer-link"
        dismissSidebar={() => setSidebarOpen(false)}
        to={urlResolver.explorer.root(orgId)}
        icon={(className) => <FolderIcon className={className} />}
        isActive={(match, location) =>
          match ? true : /^\/org\/\d+\/(explorer)/.test(location.pathname)
        }
      >
        Tickets
      </MenuItem>

      <div className="pl-3 md:hidden xl:block">
        {role.pinnedProjects.map((project) => (
          <NavLink
            onClick={() => setSidebarOpen(false)}
            to={urlResolver.explorer.editor(orgId, project.id)}
            key={project.id}
            activeClassName="bg-gray-700 text-white hover:bg-gray-700 active-menu is-active text-gray-100"
            className="group group mt-1 flex min-w-0 cursor-pointer flex-row items-center rounded px-2 py-1 text-sm text-gray-300 transition hover:bg-gray-700 hover:text-gray-100"
          >
            <span className="truncate">{project.name}</span>
          </NavLink>
        ))}
      </div>
      {hasSupport || hasDocumentation ? (
        <div className="my-2 h-px bg-gray-700"></div>
      ) : null}
      {hasReport && (
        <MenuItem
          data-e2e="sidebar-report-link"
          dismissSidebar={() => setSidebarOpen(false)}
          to={urlResolver.report.root(orgId)}
          icon={(className) => <ChartPieIcon className={className} />}
          betaFeature
        >
          Report
        </MenuItem>
      )}
      {hasSupport && (
        <MenuItem
          data-e2e="sidebar-support-link"
          dismissSidebar={() => setSidebarOpen(false)}
          to={urlResolver.issue.root(orgId)}
          icon={(className) => <SupportIcon className={className} />}
          betaFeature
        >
          Support
        </MenuItem>
      )}
      {hasDocumentation && (
        <MenuItem
          data-e2e="sidebar-documentation-link"
          dismissSidebar={() => setSidebarOpen(false)}
          to={urlResolver.documentation.root(orgId)}
          icon={(className) => <BookOpenIcon className={className} />}
          betaFeature
        >
          Documentation
        </MenuItem>
      )}
    </nav>
  );

  const SidebarHeader = (
    <div className="mt-0 flex shrink-0 items-center bg-gray-900 px-4 py-5 sm:py-2.5 md:mt-1 md:px-2 xl:mt-0 xl:px-4 xl:py-2">
      <img
        className="h-10 w-10 shrink-0"
        src="/img/logos/logo-on-dark.png"
        alt="Orcha Logo"
      />
      <div className="ml-2 flex min-w-0 flex-1 flex-col md:hidden xl:flex">
        <Link
          to={urlResolver.dashboard.home(orgId)}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="-mb-1 flex items-center justify-between text-lg font-medium text-gray-50">
            <span>
              Orcha<span className="text-[rgb(0,255,209)]">.run</span>
            </span>
            <span className="relative inline-block rounded-full bg-[rgb(111,231,210)] px-2 py-1 text-xs font-semibold leading-3 text-gray-900">
              BETA
            </span>
          </div>
        </Link>
        <PopMenu
          options={organizationChangeOptions}
          direction="bottom-left"
          size="large"
        >
          <Menu.Button className="block w-full rounded text-base focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-30 focus:ring-offset-1 focus:ring-offset-gray-900">
            <div className="group flex flex-row items-center text-left text-gray-300 transition hover:text-white">
              <div className="truncate">{me?.organization?.name}</div>
              <ChevronDownIcon className="relative top-px ml-0.5 h-5 w-5 shrink-0 text-gray-400 transition group-hover:text-gray-100" />
            </div>
          </Menu.Button>
        </PopMenu>
      </div>
    </div>
  );

  return (
    <div className="ios-hscreen flex h-screen overflow-hidden">
      <div id="popper-authed-root" />
      {/* MOBILE section of the menu */}
      <Transition show={sidebarOpen}>
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as="div"
              className="fixed inset-0"
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
            </Transition.Child>

            <Transition.Child
              as="div"
              className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800"
              enter="transition-transform ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition-transform ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="absolute right-0 top-0 -mr-14 p-1">
                <button
                  className="flex h-12 w-12 items-center justify-center rounded-full focus:bg-gray-600 focus:outline-none"
                  aria-label="Close sidebar"
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg
                    className="h-6 w-6 text-white"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex h-0 flex-1 flex-col overflow-y-auto pb-4">
                {SidebarHeader}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="px-2">
                    <div className="px-1">
                      <button
                        onClick={() => {
                          setSidebarOpen(false);
                          setSearchModalVisibility(true);
                        }}
                        className="mb-2 mt-4 flex h-9 w-full flex-row items-center justify-between rounded-lg border border-black border-b-gray-700 bg-gray-900 px-2 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25"
                      >
                        <div className="flex min-w-0 flex-row items-center">
                          <SearchIcon className="h-5 w-5 text-gray-500" />
                          <span className="ml-2 truncate text-sm text-gray-500">
                            Quick Search
                          </span>
                        </div>
                        <div className="flex-none text-xs font-medium text-gray-500">
                          {navigator.userAgent.match(/MacIntosh/gi)
                            ? "Cmd"
                            : "Ctrl"}{" "}
                          K
                        </div>
                      </button>
                    </div>
                    {menuItems}
                  </div>
                  <div>
                    <StartUsingOrcha />

                    {isAdmin ? (
                      <nav className="p-2">
                        <MenuItem
                          danger
                          dismissSidebar={() => setSidebarOpen(false)}
                          to={urlResolver.admin.root(orgId)}
                          icon={(className) => (
                            <CogIcon className={className} />
                          )}
                          isActive={(match, location) =>
                            // if not a match, the URL needs to start with admin
                            match
                              ? true
                              : /^\/org\/\d+\/admin\//.test(location.pathname)
                          }
                        >
                          Admin
                        </MenuItem>
                      </nav>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="w-14 shrink-0"></div>
            </Transition.Child>
          </div>
        </div>
      </Transition>
      <div className="hidden md:flex md:shrink-0">
        <div className="flex w-14 flex-col bg-gray-900 xl:w-64">
          <div className="flex h-0 flex-1 flex-col overflow-y-auto">
            {SidebarHeader}
            <div className="flex flex-1 flex-col justify-between bg-gray-800">
              <nav className="px-2">
                <button
                  onClick={() => setSearchModalVisibility(true)}
                  className="mb-1 mt-3 flex h-9 flex-row items-center justify-between rounded-lg border border-black border-b-gray-700 bg-gray-900 px-2 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25 xl:hidden"
                >
                  <SearchIcon className="h-5 w-5 text-gray-500" />
                </button>

                <button
                  onClick={() => setCreateTicketModalVisibility(true)}
                  className="group mb-1 mt-3 flex h-9 flex-row items-center justify-between rounded-lg border-b-gray-700 bg-brand-700 px-2 hover:bg-brand-600 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25 xl:hidden"
                >
                  <span className="sr-only">Create Ticket</span>
                  <div className="relative">
                    <TicketIcon className="h-5 w-5 text-gray-100" />
                    <PlusIcon className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-brand-700 text-gray-100 group-hover:bg-brand-600" />
                  </div>
                </button>

                <div className="flex w-full flex-row space-x-2">
                  <button
                    onClick={() => setCreateTicketModalVisibility(true)}
                    className="mx-auto mb-2 mt-2 hidden h-9 flex-1 flex-row items-center justify-center space-x-1 rounded-lg bg-brand-700 px-2 text-base font-medium text-gray-100 transition hover:bg-brand-600 hover:text-white focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25 xl:flex"
                  >
                    <PlusSmIcon className="h-5 w-5" />
                    <span>Ticket</span>
                  </button>

                  <HoverTooltip
                    tooltip={`Quick Search - ${
                      navigator.userAgent.match(/MacIntosh/gi)
                        ? "Cmd + K"
                        : "Ctrl + K"
                    }`}
                  >
                    <button
                      onClick={() => setSearchModalVisibility(true)}
                      className="mx-auto mb-2 mt-2 hidden h-9 flex-row items-center justify-between rounded-lg border border-black border-b-gray-700 bg-gray-900 px-2 text-gray-500 hover:bg-black hover:text-gray-300 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25 xl:flex"
                    >
                      <div className="flex min-w-0 flex-row items-center">
                        <SearchIcon className="h-5 w-5" />
                      </div>
                    </button>
                  </HoverTooltip>
                </div>

                {menuItems}
              </nav>
              <div>
                <StartUsingOrcha />
                {isAdmin ? (
                  <nav className="p-2">
                    <MenuItem
                      danger
                      dismissSidebar={() => setSidebarOpen(false)}
                      to={urlResolver.admin.root(orgId)}
                      icon={(className) => <CogIcon className={className} />}
                      isActive={(match, location) =>
                        // if not a match, the URL needs to start with admin
                        match
                          ? true
                          : /^\/org\/\d+\/admin\//.test(location.pathname)
                      }
                    >
                      Admin
                    </MenuItem>
                  </nav>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="relative z-30 flex h-16 shrink-0 bg-white shadow">
          <button
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 md:hidden"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
          <TaskPlayer />

          <div className="flex flex-none items-center md:ml-6">
            <WelcomeButton />
            <ReadNotificationMiddleware />
            <button
              onClick={() => setCreateNoteModalVisibility(true)}
              className="group ml-2 hidden rounded-full bg-white p-1.5 text-gray-400 hover:bg-brand-100 hover:text-brand-700 focus:outline-none focus:ring focus:ring-brand-500 focus:ring-opacity-50 focus:ring-offset-2 sm:ml-4 sm:block"
            >
              <span className="sr-only">Create note</span>
              <div className="relative">
                <PencilAltIcon className="h-6 w-6" />
                <PlusIcon className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white group-hover:bg-brand-100" />
              </div>
            </button>

            <NotificationButton />

            <PopMenu
              options={userOptions}
              direction="bottom-left"
              className="ml-3 mr-2 sm:ml-4 sm:mr-4"
              size="large"
            >
              <Menu.Button
                aria-label="Open user's menu"
                className="group block w-full shrink-0 rounded-md focus:outline-none focus:ring focus:ring-brand-500 focus:ring-opacity-50 focus:ring-offset-2"
              >
                <div className="flex items-center">
                  <div className="grow-0" id="top-menu-avatar">
                    <Avatar
                      src={role.avatarUrl}
                      name={role.name}
                      className="inline-block h-10 w-10 rounded-md"
                    />
                  </div>
                </div>
              </Menu.Button>
            </PopMenu>
          </div>
        </div>
        <NoteCreateModal
          visible={createNoteModalVisible}
          onClose={() => setCreateNoteModalVisibility(false)}
        />
        <TicketCreateModal
          visible={createTicketModalVisible}
          onClose={() => setCreateTicketModalVisibility(false)}
        />
        <SearchModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisibility(false)}
        />
        <main
          className="relative h-full overflow-y-auto focus:outline-none sm:px-6 md:px-8"
          tabIndex={0}
          id="main-container"
        >
          {showTicketId && (
            <TicketModalEdit
              ticketId={showTicketId}
              setOpen={() => dispatch(hideTicketEditModal())}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

const LOGOUT_MUTATION = gql`
  mutation SidebarLogout {
    logout
  }
`;

const MY_ROLES_QUERY = gql`
  query MyRoles {
    myRoles {
      id
      status
      title
      name
      organization {
        id
        name
        status
      }
    }
  }
`;
