import { lazy, Suspense } from "react";

const ReportView = lazy(() => import("./ReportView"));

export const LazyReportView: React.FC = (props) => {
  return (
    <Suspense>
      <ReportView {...props} />
    </Suspense>
  );
};
