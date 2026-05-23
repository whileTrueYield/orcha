interface Props {
  onContactClick: () => void;
  onSearchClick: () => void;
  documentationId: string;
}

export const Home: React.FC<Props> = (props) => {
  return (
    <div className="flex flex-col items-center flex-1 px-4">
      <div className="flex flex-col flex-1 w-full">
        <div className="text-2xl text-center text-gray-600 font-medium pt-12 shrink-0">
          How can we help you?
        </div>
        <div className="flex flex-col flex-1 justify-center">
          <div className="flex flex-col">
            <button
              type="button"
              className="px-4 py-6 hover:z-10 rounded-t-xl bg-white border hover:bg-sky-50 hover:border-sky-300 group duration-300 transition flex flex-row space-x-2 w-full text-gray-600 font-medium hover:text-gray-700"
              onClick={props.onContactClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 group-hover:text-sky-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
              <span>Contact Support</span>
            </button>
            <button
              type="button"
              className="px-4 py-6 hover:z-10 -my-px bg-white border hover:bg-sky-50 hover:border-sky-300 group duration-300 transition flex flex-row space-x-2 w-full text-gray-600 font-medium hover:text-gray-700"
              onClick={props.onSearchClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 group-hover:text-sky-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <span>Search Knowledge Base</span>
            </button>
            <a
              href={`${import.meta.env.VITE_DOCUMENTATION_URI}/doc/${
                props.documentationId
              }`}
              className="px-4 py-6 hover:z-10 rounded-b-xl bg-white border hover:bg-sky-50 hover:border-sky-300 group duration-300 transition flex flex-row space-x-2 w-full text-gray-600 font-medium hover:text-gray-700"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 group-hover:text-sky-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796a3.765 3.765 0 00-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 01-1.388.88m2.268-2.268l4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0l-3.448-4.138m3.448 4.138a9.014 9.014 0 01-9.424 0m5.976-4.138a3.765 3.765 0 01-2.528 0m0 0a3.736 3.736 0 01-1.388-.88 3.737 3.737 0 01-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 01-1.652-1.306 9.027 9.027 0 01-1.306-1.652m0 0l4.138-3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976a3.765 3.765 0 010-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 011.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 00-1.652 1.306A9.025 9.025 0 004.33 7.288"
                />
              </svg>

              <span>Explore Documentation</span>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t py-2 text-xs text-gray-400 text-center w-full">
        Powered by{" "}
        <a
          href="https://www.orcha.io#source=widget"
          target="_blank"
          rel="noreferrer"
          className="hover:text-sky-600 hover:underline font-semibold"
        >
          Orcha
        </a>
      </div>
    </div>
  );
};
