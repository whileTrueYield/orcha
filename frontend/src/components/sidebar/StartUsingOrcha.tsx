import React from "react";

export const StartUsingOrcha: React.FC = () => {
  if (import.meta.env.VITE_DEMO_MODE !== "true") {
    return null;
  }

  return (
    <div className="my-4 px-2 md:hidden xl:block">
      <div className="flex flex-col space-y-1 rounded-xl bg-gray-900 p-4 text-center text-sm font-medium text-gray-200">
        <span>Ready to sign up?</span>
        <a
          className="text-sm text-[rgb(111,231,210)] hover:text-[rgb(101,211,200)] hover:underline"
          href="https://app.orcha.run/auth/register"
        >
          Start using Orcha
        </a>
      </div>
    </div>
  );
};
