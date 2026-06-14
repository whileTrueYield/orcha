/**
 * Route container for the API Tokens settings page.
 *
 * Thin wrapper: resolves the caller's admin level from the store and sets the
 * page title, then delegates all rendering and data to ApiTokensView (which is
 * store-agnostic and unit-tested in isolation).
 *
 * Mounted at urlResolver.user.paths.tokens in LazyAuthRouter.
 */

import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";
import { usePageTitle } from "hooks/usePageTitle";
import { ApiTokensView } from "./ApiTokensView";

export const ApiTokens: React.FC = () => {
  const isAdmin = useSelector(isAdminLevel);
  usePageTitle("API Tokens");

  return <ApiTokensView isAdmin={isAdmin} />;
};
