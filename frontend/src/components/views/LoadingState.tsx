import React from "react";
import { Link } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { Joke } from "../views/Joke";
import { ScreenCenter } from "./ScreenCenter";

interface Props {
  title?: string;
  subTitle?: string;
}

export const LoadingState: React.FC<Props> = (props) => {
  return (
    <div className="flex w-full flex-col items-center justify-center py-8">
      <img
        src="/img/svg/undraw_loading_frh4.svg"
        className="max-w-xs px-4"
        alt="Man with a cap looking into an empty box"
      />
      <p className="mt-8 text-center text-lg tracking-wide text-gray-500">
        {props.title || "Loading..."}
      </p>
      <p className="mt-2 px-4 text-center text-sm italic text-gray-400 sm:px-0">
        {props.subTitle ? props.subTitle : <Joke />}
      </p>
    </div>
  );
};

export const LightLoadingState: React.FC<{ title?: string }> = (props) => {
  return (
    <ScreenCenter>
      <h1 className="text-center text-2xl text-gray-500">
        {props.title || "Loading..."}
      </h1>

      <div className="mt-2 text-center">
        <Link
          to={urlResolver.auth.logout()}
          className="text-base text-brand-600 hover:text-brand-500 hover:underline"
        >
          Or click here to logout
        </Link>
      </div>
    </ScreenCenter>
  );
};
