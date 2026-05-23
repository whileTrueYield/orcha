import React, { lazy, Suspense } from "react";
import { TipTapCollabProps } from "./TipTapCollabProps";

const LazyTipTapCollab = lazy(() => import("./TipTapCollabLazy"));

const TipTapCollab: React.FC<TipTapCollabProps> = (props) => {
  return (
    <Suspense>
      <LazyTipTapCollab {...props} />
    </Suspense>
  );
};

export default TipTapCollab;
