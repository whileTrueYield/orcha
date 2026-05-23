import { LogoutIcon } from "@heroicons/react/solid";
import { Button } from "components/fields/Button";
import { Panel } from "components/views/Panel";
import { ScreenCenter } from "components/views/ScreenCenter";
import { usePageTitle } from "hooks/usePageTitle";
import React from "react";
import { useHistory } from "react-router-dom";
import { Footer } from "./Footer";
import { useLogout } from "./useLogout";

export const Logout: React.FC = () => {
  const history = useHistory();
  const [logout] = useLogout();

  usePageTitle("Logout");

  return (
    <ScreenCenter>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-24 w-auto"
          src="/img/logos/logo-on-light.svg"
          alt="Orcha"
        />
        <h1 className="mt-6 text-center font-title text-3xl font-semibold leading-9 text-gray-600">
          Logout
        </h1>
        <Panel className="mt-8 py-8 px-4 text-center sm:px-10">
          <p className="py-2 text-gray-700">
            Click the Logout button below to logout of your account.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row">
            <Button
              btnType="white"
              type="button"
              block
              className="relative mb-2 sm:mb-0 sm:mr-4"
              onClick={() => history.goBack()}
            >
              Cancel
            </Button>
            <Button
              btnType="primary"
              type="button"
              onClick={() => logout()}
              block
              className="relative"
              id="logout-button"
            >
              <LogoutIcon className="absolute right-2 top-2 h-5 w-5 text-brand-300" />
              Logout
            </Button>
          </div>
        </Panel>
      </div>
      <Footer />
    </ScreenCenter>
  );
};
