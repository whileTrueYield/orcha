import React, { lazy, Suspense } from "react";

const ProjectAnalyticView = lazy(() => import("./ProjectAnalyticView"));

interface Props {
  projectId: number;
}

export const LazyProjectAnalyticView: React.FC<Props> = (props) => {
  return (
    <Suspense>
      <ProjectAnalyticView {...props} />
    </Suspense>
  );
};
