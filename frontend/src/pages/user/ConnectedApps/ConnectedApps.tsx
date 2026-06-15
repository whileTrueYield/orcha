/**
 * Route container for the Connected Apps settings page.
 *
 * Thin wrapper: sets the page title and delegates rendering and data to
 * ConnectedAppsView (store-agnostic, unit-tested in isolation).
 *
 * Mounted at urlResolver.user.paths.connectedApps in LazyAuthRouter.
 */

import { usePageTitle } from "hooks/usePageTitle";
import { ConnectedAppsView } from "./ConnectedAppsView";

export const ConnectedApps: React.FC = () => {
  usePageTitle("Connected Apps");

  return <ConnectedAppsView />;
};
