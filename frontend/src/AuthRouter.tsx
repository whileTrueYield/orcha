import { LightLoadingState } from "components/views/LoadingState";
import React, { lazy, Suspense } from "react";

const Router = lazy(() => import("./LazyAuthRouter"));

export const AuthRouter: React.FC = () => (
  <Suspense fallback={<LightLoadingState />}>
    <Router />
  </Suspense>
);
