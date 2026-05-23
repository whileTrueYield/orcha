import React, { lazy, Suspense } from "react";

export interface Props {
  referenceElement: HTMLElement;
  children: React.ReactNode;
  className?: string;
  background?: string;
}

const LazyPopover = lazy(() => import("./PopoverLazy"));

export const Popover: React.FC<Props> = (props) => {
  return (
    <Suspense>
      <LazyPopover {...props} />
    </Suspense>
  );
};
