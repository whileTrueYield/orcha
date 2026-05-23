import React, { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";

const Router = lazy(() => import("./RouterLazy"));

export const AdminRouter: React.FC = () => {
  const isAdmin = useSelector(isAdminLevel);

  if (isAdmin) {
    return (
      <Suspense>
        <Router />
      </Suspense>
    );
  }

  return null;
};
