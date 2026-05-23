import React, { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { hasAccessToDocumentation } from "reducers/selector";

const Router = lazy(() => import("./BetaRouter"));

export const DocumentationRouter: React.FC = () => {
  const hasDocumentation = useSelector(hasAccessToDocumentation);

  if (!hasDocumentation) {
    return null;
  }

  return (
    <Suspense>
      <Router />
    </Suspense>
  );
};
