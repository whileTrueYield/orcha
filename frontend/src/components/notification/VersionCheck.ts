import { newVersionNotification } from "actions";
import React, { useEffect } from "react";
import { useAppDispatch } from "store";
import { revision } from "utils/revision";

// Check every 15 minutes
const VERSION_CHECK_INTERVAL = 15 * 60 * 1000;

/**
 * This component compares the version of the currently loaded frontend
 * and the latest available version and notify the user by creating
 * an version notification.
 * @returns
 */
export const VersionCheck: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // create the method and attach it to the window scope for the JSONP to trigger
    (window as any).setOrchaRevision = (newRevision: string) => {
      // just being extra careful with JSONP here, checking
      // that we received a string
      if (
        newRevision &&
        typeof newRevision === "string" &&
        revision !== newRevision
      ) {
        dispatch(newVersionNotification());
        // new version has been detected, no need to check anymore
        clearInterval(interval);
      }
    };

    const checkVersion = () => {
      // we'll have a global frontend cache of 2 minutes
      const timestamp = Math.round(new Date().getTime() / 120000);
      const script = document.createElement("script");
      script.setAttribute("id", "revision-jsonp");
      script.src = `/revision.js?d=${timestamp}`;

      // remove previous script tag
      const previousScript = document.querySelector("script#revision-jsonp");
      if (previousScript && previousScript.parentElement) {
        previousScript.parentElement.removeChild(previousScript);
      }

      document.body.appendChild(script);
    };

    const interval = setInterval(checkVersion, VERSION_CHECK_INTERVAL);

    // trigger the version check, when opening a new tab, we want
    // to make sure it's using the latest version of the app
    checkVersion();

    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);

  return null;
};
