import { Link } from "react-router-dom";
import { urlResolver } from "utils/navigation";

export const ErrorScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center space-y-4">
      <div className="text-2xl font-semibold text-gray-500">
        Something went wrong :(
      </div>
      <div className="text-xl text-gray-500">
        Try to refresh the page or
        <Link
          className="mx-1 text-brand-600 underline hover:text-brand-500 hover:no-underline"
          to={urlResolver.auth.logout()}
        >
          logout
        </Link>
        and login again
      </div>
    </div>
  );
};
