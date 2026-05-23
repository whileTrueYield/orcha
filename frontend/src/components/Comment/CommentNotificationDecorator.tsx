import { LogoutIcon } from "@heroicons/react/outline";
import React from "react";
import { useHistory } from "react-router-dom";

export const CommentNotificationDecorator: React.FC = () => {
  const history = useHistory();
  return (
    <div className="relative">
      <div className="absolute -top-11 right-8 h-6 rounded-t bg-pink-500 px-2 py-0.5 text-sm">
        <button
          onClick={() => history.replace(history.location.pathname)}
          type="button"
          className="ml-1 flex flex-row items-center space-x-2 font-medium text-white hover:text-pink-50"
        >
          <span className="hidden sm:inline">
            Click here to exit notification view
          </span>
          <span className="sm:hidden">Exit notification</span>
          <LogoutIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
