import React from "react";
import { Link } from "react-router-dom";
import { CheckIcon } from "@heroicons/react/solid";
import cn from "classnames";

interface Props {
  isDone: boolean;
  to: string;
  title: string;
  description: string;
  position: number;
  onClose: () => void;
}

export const OnboardingStep: React.FC<Props> = (props) => {
  const { isDone } = props;

  const linkClass = cn(
    "relative block rounded-lg border-2 p-2 pl-5 transition",
    {
      "bg-purple-700 group-hover:bg-purple-600 border-purple-500 group-hover:border-purple-400":
        !isDone,
      "bg-gray-900 hover:bg-black border-gray-700 group-hover:border-gray-600 border-2":
        isDone,
    }
  );

  const titleClass = cn("text-sm font-semibold", {
    "text-purple-50 group-hover:text-white": !isDone,
    "text-gray-200 group-hover:text-white": isDone,
  });

  const descriptionClass = cn("text-xs font-medium", {
    "text-purple-300 group-hover:text-purple-100": !isDone,
    "text-gray-200 group-hover:text-white": isDone,
  });

  const positionClass = cn(
    "flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold",
    {
      "border-2 text-white bg-purple-700 group-hover:bg-purple-600 border-purple-500 group-hover:border-purple-400":
        !isDone,
      "border-2 bg-green-600 text-white shadow-sm transition border-gray-700 group-hover:border-gray-600":
        isDone,
    }
  );

  return (
    <div className="group relative">
      <Link to={props.to} className={linkClass} onClick={props.onClose}>
        <h2 className={titleClass}>{props.title}</h2>
        <p className={descriptionClass}>{props.description}</p>
        <div className="absolute -left-3 top-0 bottom-0 flex flex-row items-center justify-center">
          <div className={positionClass}>
            {isDone ? (
              <CheckIcon className="h-4 w-4 text-white"></CheckIcon>
            ) : (
              props.position
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};
