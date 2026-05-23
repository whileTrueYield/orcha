import cn from "classnames";
import React, { createContext } from "react";
import { motion } from "framer-motion";
import { useContext } from "react";

interface Props extends React.HTMLProps<HTMLDivElement> {
  className?: string;
  layoutId?: string;
}

const DEFAULT_LAYOUT_ID = "A-TAB";
const LayoutIdContext = createContext(DEFAULT_LAYOUT_ID);

export const Tabs: React.FC<Props> = (props) => {
  const { className, layoutId, ...otherProps } = props;

  const classes = cn(
    "flex-none flex space-x-2 shadow-inner bg-gray-200 p-1.5 rounded-full",
    props.className
  );

  return (
    <div className="flex flex-row justify-center">
      <LayoutIdContext.Provider value={layoutId || DEFAULT_LAYOUT_ID}>
        <nav className={classes} aria-label="Tabs" {...otherProps} />
      </LayoutIdContext.Provider>
    </div>
  );
};

interface TabButtonProps extends React.HTMLProps<HTMLDivElement> {
  active?: boolean;
  asElement?: (className: string) => React.ReactElement;
}

export const Tab: React.FC<TabButtonProps> = (props) => {
  const { label, active, asElement, className, children, ...otherProps } =
    props;

  const layoutId = useContext(LayoutIdContext);

  const classes = cn(
    "relative flex flex-row rounded-full items-center px-3 py-2 space-x-1 font-medium cursor-pointer text-sm focus:outline-none focus:ring",
    {
      "text-gray-500": !active,
      "text-gray-700": active,
    },
    className
  );

  if (asElement) {
    return (
      <div className="relative">
        {active && (
          <motion.div
            layoutId={layoutId || "a-tab"}
            className="absolute inset-0 rounded-full bg-white shadow"
            transition={{ duration: 0.3 }}
          ></motion.div>
        )}
        <span className="relative">{asElement(classes)}</span>
      </div>
    );
  }

  return (
    <div className={classes} {...otherProps}>
      {active && (
        <motion.div
          layoutId={layoutId || "a-tab"}
          className="absolute inset-0 rounded-full bg-white shadow"
          transition={{ duration: 0.3 }}
        ></motion.div>
      )}
      <span className="relative z-10">{children}</span>
    </div>
  );
};
