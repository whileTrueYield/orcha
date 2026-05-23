import React, { useEffect } from "react";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import { Login } from "./pages/auth/Login/Login";
import { PasswordReset } from "./pages/auth/Login/PasswordReset";
import { urlResolver } from "utils/navigation";
import { useSelector } from "react-redux";
import { getAuthStatus, getMe, getUserStatus } from "reducers/selector";
import { AuthStatus, UserStatus } from "types/graphql";
import { Register } from "pages/auth/Login/Register";
import { PasswordLost } from "pages/auth/Login/PasswordLost";
import { SendConfirmationEmail } from "pages/auth/Login/SendConfirmationEmail";
import { RegisterFromInvite } from "pages/auth/Login/RegisterFromInvite";

import { Logout } from "pages/auth/Login/Logout";

import { IssueClientView } from "pages/issue/IssueClientView/IssueClientView";
import { ChooseOrganization } from "pages/auth/organization/ChooseOrganization";
import CreateOrganization from "pages/auth/organization/CreateOrganization";

import { AuthRouter } from "AuthRouter";
import { SupportIntegration } from "components/SupportIntegration";
import { LightLoadingState } from "components/views/LoadingState";
import { useAppDispatch } from "store";
import { createNotification } from "actions";
import CreateFirstOrganization from "pages/auth/organization/CreateFirstOrganization";
import { DemoRequestView } from "pages/demo/DemoRequest/DemoRequest";

export const MainRouter: React.FC = () => {
  const authStatus = useSelector(getAuthStatus);
  const me = useSelector(getMe);
  const dispatch = useAppDispatch();
  const userStatus = useSelector(getUserStatus);
  const history = useHistory();
  const isLinked = authStatus === AuthStatus.Linked;
  const isAuth = authStatus === AuthStatus.User || isLinked;
  const isUnconfirmed = userStatus === UserStatus.Unconfirmed;

  const organizationId = isLinked ? me?.organization?.id : null;

  const toCreateOrganization = (history: any) => ({
    pathname: urlResolver.auth.paths.chooseOrganization,
    state: { from: history.location },
  });

  const toLogin = ({ location }: any) => ({
    pathname: urlResolver.auth.paths.login,
    state: { from: location },
  });

  // check if email confirmation is in search parameter, I don't
  // really like it here but hey... cant find another easier and more
  // compact place to put it.
  useEffect(() => {
    if (/(^\?|&)confirmed=true/i.test(history.location.search)) {
      dispatch(
        createNotification({
          type: "Success",
          title: "Email Verified",
          duration: 5,
        }),
      );
    }
  }, [dispatch, history.location.search]);

  // during loading display light loading state (we're loading
  // so lets avoid loading more assets here)
  if (authStatus === "unknown") {
    return <LightLoadingState />;
  }

  if (isUnconfirmed) {
    return <SendConfirmationEmail />;
  }

  if (!isAuth) {
    // when in DEMO_MODE we will generate account through the registration
    // of an email at the demo page, we don't allow creating regular accounts
    // if (import.meta.env.VITE_DEMO_MODE && false) {
    if (import.meta.env.VITE_DEMO_MODE) {
      return (
        <>
          <SupportIntegration forceDisplay />
          <Switch>
            <Route
              exact
              path={urlResolver.issue.paths.clientView}
              component={IssueClientView}
            />
            <Route path="/auth">
              <Switch>
                <Route
                  exact
                  path={urlResolver.auth.paths.chooseOrganization}
                  component={ChooseOrganization}
                />
                <Route component={DemoRequestView} />
              </Switch>
            </Route>
            <Route component={DemoRequestView} />
          </Switch>
        </>
      );
    }

    return (
      <Switch>
        <Route
          exact
          path={urlResolver.issue.paths.clientView}
          component={IssueClientView}
        />
        {import.meta.env.VITE_DEMO_MODE && (
          <Route
            exact
            path={urlResolver.demo.paths.demoRequest}
            component={DemoRequestView}
          />
        )}
        <Route path="/auth">
          <Switch>
            <Route
              exact
              path={urlResolver.auth.paths.login}
              component={Login}
            />
            <Route
              exact
              path={urlResolver.auth.paths.register}
              component={Register}
            />
            <Route
              exact
              path={urlResolver.auth.paths.passwordLost}
              component={PasswordLost}
            />
            <Route
              exact
              path={urlResolver.auth.paths.passwordReset}
              component={PasswordReset}
            />
            <Route
              exact
              path={urlResolver.auth.paths.acceptInvite}
              component={RegisterFromInvite}
            />
            <Route
              exact
              path={urlResolver.auth.paths.logout}
              component={Logout}
            />
            <Route
              render={(history) =>
                history.location.pathname ===
                urlResolver.auth.login() ? null : (
                  <Redirect to={toLogin(history)} />
                )
              }
            />
          </Switch>
        </Route>
        <Route
          render={(history) =>
            history.location.pathname === urlResolver.auth.login() ? null : (
              <Redirect to={toLogin(history)} />
            )
          }
        />
      </Switch>
    );
  }

  return (
    <>
      <SupportIntegration />
      <Switch>
        <Route
          exact
          path={urlResolver.auth.paths.createOrganization}
          component={CreateOrganization}
        />
        <Route
          exact
          path={urlResolver.auth.paths.createFirstOrganization}
          component={CreateFirstOrganization}
        />
        <Route
          exact
          path={urlResolver.auth.paths.chooseOrganization}
          component={ChooseOrganization}
        />
        <Route exact path={urlResolver.auth.paths.logout} component={Logout} />
        <Route
          exact
          path={urlResolver.issue.paths.clientView}
          component={IssueClientView}
        />
        <Route path="/org/:orgId">
          <AuthRouter />
        </Route>
        <Route
          render={(history) =>
            organizationId ? (
              <Redirect
                to={urlResolver.dashboard.home(organizationId.toString())}
              />
            ) : (
              <Redirect to={toCreateOrganization(history)} />
            )
          }
        />
      </Switch>
    </>
  );
};
