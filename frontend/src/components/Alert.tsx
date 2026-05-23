import { PropsWithChildren, useState } from "react";
import cn from "classnames";
import {
  CheckCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/solid";

interface Props extends PropsWithChildren {
  type?: "warning" | "danger" | "success" | "info";
  title: string;
  showDismiss?: Boolean;
  onCtaClick?: () => void;
  cta?: string;
  className?: string;
}

export const Alert: React.FC<Props> = (props) => {
  const alertType = props.type || "info";
  const [isVisible, setVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  const renderIcon = () => {
    switch (alertType) {
      case "danger":
        return <XCircleIcon className="h-5 w-5 text-red-400 " />;
      case "warning":
        return <ExclamationIcon className="h-5 w-5 text-yellow-400 " />;
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-400 " />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400 " />;
    }
  };

  const buttonClassName = cn(
    "rounded-md px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2",
    {
      "bg-red-50 focus:ring-offset-red-50 focus:ring-red-600 hover:bg-red-100 text-red-800 ":
        alertType === "danger",
      "bg-yellow-50 focus:ring-offset-yellow-50 focus:ring-yellow-600 hover:bg-yellow-100 text-yellow-800 ":
        alertType === "warning",
      "bg-blue-50 focus:ring-offset-blue-50 focus:ring-blue-600 hover:bg-blue-100 text-blue-800 ":
        alertType === "info",
      "bg-green-50 focus:ring-offset-green-50 focus:ring-green-600 hover:bg-green-100 text-green-800 ":
        alertType === "success",
    }
  );

  const bodyClassName = cn("mt-2 text-sm", {
    "text-red-700": alertType === "danger",
    "text-yellow-700": alertType === "warning",
    "text-blue-700": alertType === "info",
    "text-green-700": alertType === "success",
  });

  const titleClassName = cn("text-sm font-medium", {
    "text-red-800": alertType === "danger",
    "text-yellow-800": alertType === "warning",
    "text-blue-800": alertType === "info",
    "text-green-800": alertType === "success",
  });

  const containerClassName = cn("rounded-md p-4", props.className, {
    "bg-red-50": alertType === "danger",
    "bg-yellow-50": alertType === "warning",
    "bg-blue-50": alertType === "info",
    "bg-green-50": alertType === "success",
  });

  const renderCtaButton = () => (
    <button
      type="button"
      className={buttonClassName}
      onClick={() => props.onCtaClick && props.onCtaClick()}
    >
      {props.cta}
    </button>
  );

  const renderShowDismiss = () => (
    <button
      type="button"
      onClick={() => setVisible(false)}
      className={`${props.cta ? "ml-3 " : ""}${buttonClassName}`}
    >
      Dismiss
    </button>
  );

  const renderButtons = () => {
    if (props.showDismiss || props.cta) {
      return (
        <div className="mt-4">
          <div className="-mx-2 -my-1.5 flex">
            {props.cta && renderCtaButton()}
            {props.showDismiss && renderShowDismiss()}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={containerClassName}>
      <div className="flex">
        <div className="flex-shrink-0">{renderIcon()}</div>
        <div className="ml-3">
          <h3 className={titleClassName}>{props.title}</h3>
          <div className={bodyClassName}>{props.children}</div>
          {renderButtons()}
        </div>
      </div>
    </div>
  );
};
