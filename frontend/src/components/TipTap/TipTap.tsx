import React, { lazy, Suspense } from "react";
import { TipTapProps } from "./TipTapProps";

const LazyTipTap = lazy(() => import("./TipTapLazy"));

const TipTap: React.FC<TipTapProps> = (props) => {
  return (
    <Suspense>
      <LazyTipTap {...props} />
    </Suspense>
  );
};

export default TipTap;
