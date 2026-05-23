import { ReactNode } from "react";

interface Props {
  onBackClick?: () => void;
  onClose: () => void;
  onHide: () => void;
  children: ReactNode;
}

export const Header: React.FC<Props> = (props) => {
  const { onBackClick, onClose } = props;
  return (
    <div className="text-base flex flex-row text-white pl-4 pr-2 py-2 font-medium tracking-wide bg-gray-900">
      <div className="flex-1 flex flex-row items-center">
        {onBackClick ? (
          <button
            className="text-white -ml-2 mr-2 font-bold text-lg rounded-md bg-gray-700 hover:bg-gray-100 transition hover:text-gray-800 w-6 h-6 p-0.5 flex items-center justify-center"
            type="button"
            onClick={onBackClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <img
            src="/supportIcon.svg"
            className="w-5 h-5 mr-2 inline-block relative -top-0.5"
            alt=""
          />
        )}
        {props.children}
      </div>
      <div className="flex flex-row space-x-2">
        <button
          onClick={onClose}
          type="button"
          className="text-white font-bold text-lg rounded-md bg-gray-700 hover:bg-red-700 hover:text-red-50 transition w-6 h-6 p-0.5 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
