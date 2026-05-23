import React, { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { hasAccessToSupport } from "reducers/selector";

const Router = lazy(() => import("./BetaRouter"));

export const IssueRouter: React.FC = () => {
  const hasSupport = useSelector(hasAccessToSupport);

  if (!hasSupport) {
    return null;
  }

  return (
    <Suspense>
      <Router />
    </Suspense>
  );
};
