import React, { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { hasAccessToReport } from "reducers/selector";

export const ReportRouter: React.FC = () => {
  const hasReport = useSelector(hasAccessToReport);

  if (!hasReport) {
    return null;
  }

  const Router = lazy(() => import("./BetaRouter"));

  return (
    <Suspense>
      <Router />
    </Suspense>
  );
};
