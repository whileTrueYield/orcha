import React from "react";
import cn from "classnames";

interface Props extends React.ButtonHTMLAttributes<HTMLDivElement> {}

export const Panel: React.FC<Props> = ({ className, ...props }) => {
  const classNames = cn("bg-white shadow rounded-lg", className);

  return <div className={classNames} {...props}></div>;
};

type PanelHeaderProps = {
  children?: React.ReactNode;
};

export const PanelHeader: React.FC<PanelHeaderProps> = ({ children }) => {
  return (
    <div className="rounded-t-lg border-b border-gray-200 px-4 py-5 sm:px-6">
      {children}
    </div>
  );
};

type PanelHeadingProps = {
  children?: React.ReactNode;
};

export const PanelHeading: React.FC<PanelHeadingProps> = ({ children }) => (
  <h3 className="font-title text-lg font-medium leading-6 text-gray-900">
    {children}
  </h3>
);

interface PanelButtonProps {
  button: React.ReactNode;
  children?: React.ReactNode;
}

export const PanelHeadingWithButton: React.FC<PanelButtonProps> = ({
  children,
  button,
}) => {
  return (
    <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
      <div className="ml-4 mt-2">
        <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
          {children}
        </h3>
      </div>
      <div className="ml-4 mt-2 shrink-0">{button}</div>
    </div>
  );
};

interface PanelFooterProps {
  className?: string;
  children?: React.ReactNode;
}

export const PanelFooter: React.FC<PanelFooterProps> = ({
  children,
  className,
}) => {
  className = cn(
    "border-t border-gray-200 px-4 py-4 sm:px-6 rounded-b-lg",
    className
  );
  return <div className={className}>{children}</div>;
};

interface PanelBodyProps {
  className?: string;
  children?: React.ReactNode;
}

export const PanelBody: React.FC<PanelBodyProps> = ({
  children,
  className,
}) => {
  className = cn("px-4 py-5 sm:p-6", className);
  return <div className={className}>{children}</div>;
};
