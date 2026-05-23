import React from "react";
import { AvatarTheme } from "./avatarTheme";
import { kebabCase } from "lodash";

interface Props extends React.ComponentProps<"svg"> {
  className: string;
  theme: AvatarTheme;
  name?: string;
}

export const CherryAvatar: React.FC<Props> = (props) => {
  const prefix = kebabCase(props.name);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={200}
      height={200}
      viewBox="0 0 52.917 52.917"
      {...props}
    >
      <defs>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-l"}>
          <path d="M395.383 395.781c-6.635-1.47-10.302-5.694-12.042-10.145-1.879-4.77-1.552-9.802-.332-12.002 1.133-2.033 3.84-3.357 7.163-3.945 7.419-1.308 17.916 1.02 20.869 7.126 3.86 7.991-1.404 19.372-12.064 19.373-1.139 0-2.337-.129-3.594-.407" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-k"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-i"}>
          <path d="M339.458 369.179c4.137-5.377 14.887-5.516 21.884-2.723 3.134 1.253 5.514 3.1 6.208 5.322.747 2.402.041 7.395-2.772 11.682-2.61 4.004-7.06 7.39-13.855 7.478l-.224.002c-13.161-.001-17.193-14.016-11.241-21.761" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-e"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-f"}>
          <path d="M345.478 363.815h61.275v-24.029h-61.275z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-g"}>
          <path d="M335.003 395.313h33.89v-35.085h-33.89z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-h"}>
          <path d="M380.896 400.358h33.057v-35.535h-33.057z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-c"}>
          <path d="M426.42 380.965c-.041-.114-6.891-8.62-22.253-14.126a50.998 50.998 0 0 0-2.412-.787c-10.635-3.136-22.848-5.326-33.51-6.007-8.186-.524-15.233-.175-20.948 1.032-2.739.577-5.155 1.357-7.181 2.318-13.295 6.293-17.412 12.345-17.412 12.345-.412-9.266-.286-26.934 7.841-38.024.157-.215.341-.415.481-.569 2.457-2.811 5.394-5.224 8.737-7.179a42.342 42.342 0 0 1 5.283-2.58c.149-.067.298-.129.446-.189l.872-.364.063.004c5.158-1.913 11.56-3.219 18.587-3.787a42.52 42.52 0 0 1 1.461-.109 99.207 99.207 0 0 1 13.019-.019c2.506.16 5.01.416 7.418.759.491.066.982.141 1.428.217 7.503 1.174 14.259 3.173 20.065 5.938a43.42 43.42 0 0 1 2.003.995c2.654 1.396 5.088 2.963 7.231 4.655a39.8 39.8 0 0 1 2.34 1.997c2.123 1.963 4 4.189 5.576 6.61.274.418.624.798.768 1.235 6.535 19.777.794 35.841.659 36.274z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-a"}>
          <path d="M300 300h150v150H300Z" />
        </clipPath>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(14.28675 .91332 .91332 -14.28675 397.014 382.77)"
          spreadMethod="pad"
          id={prefix + "-m"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#faffff",
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#faffff",
            }}
            offset={0.434}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#faffff",
            }}
            offset={0.804}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#e1eded",
            }}
            offset={1}
          />
        </radialGradient>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(14.31469 .9151 .9151 -14.31469 352.157 377.855)"
          spreadMethod="pad"
          id={prefix + "-j"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#faffff",
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#faffff",
            }}
            offset={0.434}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#faffff",
            }}
            offset={0.804}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#e1eded",
            }}
            offset={1}
          />
        </radialGradient>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(102.59925 0 0 -102.59925 375 375)"
          spreadMethod="pad"
          id={prefix + "-b"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
            }}
            offset={0.235}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
            }}
            offset={0.581}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgOuterGradient,
            }}
            offset={1}
          />
        </radialGradient>
        <linearGradient
          x1={0}
          y1={0}
          x2={1}
          y2={0}
          gradientUnits="userSpaceOnUse"
          gradientTransform="scale(-37.28299 37.28299) rotate(86.342 -9.71 -1.07)"
          spreadMethod="pad"
          id={prefix + "-d"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.lightAccent,
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.lightAccent,
            }}
            offset={0.295}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgOuterGradient,
            }}
            offset={1}
          />
        </linearGradient>
      </defs>
      <g
        clipPath={`url(#${prefix}-a)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 158.75)"
      >
        <path
          d="M300 300h150v150H300Z"
          style={{
            fill: `url(#${prefix}-b)`,
            stroke: "none",
          }}
        />
      </g>
      <path
        d="M0 0c11.897 10.804 17.769 9.037 25.29 12.866 7.523 3.828-2.528 8.14-12.979 6.133C1.86 16.992-1.825 11.801 4.95 12.636-5.123 8.913-5.917 4.576-5.136.743-4.479-2.478 0 0 0 0"
        style={{
          fill: props.theme.darkAccent,
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 12.53 14.145)"
      />
      <path
        d="M0 0c1.8-5.108 11.799-2.326 20.479-4.047 8.68-1.722 14.79-.929 15.351 2.856.562 3.786-13.05 3.049-13.05 3.049s6.966 2.053 2.051 5.621C19.916 11.049-2.782 7.896 0 0"
        style={{
          fill: props.theme.darkAccent,
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 27.02 8.778)"
      />
      <g
        clipPath={`url(#${prefix}-c)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 158.75)"
      >
        <path
          d="M426.42 380.965c-.041-.114-6.891-8.62-22.253-14.126a50.998 50.998 0 0 0-2.412-.787c-10.635-3.136-22.848-5.326-33.51-6.007-8.186-.524-15.233-.175-20.948 1.032-2.739.577-5.155 1.357-7.181 2.318-13.295 6.293-17.412 12.345-17.412 12.345-.412-9.266-.286-26.934 7.841-38.024.157-.215.341-.415.481-.569 2.457-2.811 5.394-5.224 8.737-7.179a42.342 42.342 0 0 1 5.283-2.58c.149-.067.298-.129.446-.189l.872-.364.063.004c5.158-1.913 11.56-3.219 18.587-3.787a42.52 42.52 0 0 1 1.461-.109 99.207 99.207 0 0 1 13.019-.019c2.506.16 5.01.416 7.418.759.491.066.982.141 1.428.217 7.503 1.174 14.259 3.173 20.065 5.938a43.42 43.42 0 0 1 2.003.995c2.654 1.396 5.088 2.963 7.231 4.655a39.8 39.8 0 0 1 2.34 1.997c2.123 1.963 4 4.189 5.576 6.61.274.418.624.798.768 1.235 6.535 19.777.794 35.841.659 36.274z"
          style={{
            fill: `url(#${prefix}-d)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-e)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 158.75)"
      >
        <path
          d="M0 0c-.609-4.788-2.016-9.819-4.778-14.479a24.34 24.34 0 0 0-.693-1.113 31.794 31.794 0 0 0-5.071-6.013 35.517 35.517 0 0 0-2.148-1.832c-2.058-1.626-4.32-3.065-6.738-4.336a40.43 40.43 0 0 0-1.877-.932c-5.808-2.765-12.416-4.61-19.193-5.67a42.186 42.186 0 0 0-1.361-.208 96.004 96.004 0 0 0-19.791-.719c-.485.026-.961.067-1.438.109-7.002.565-13.379 1.901-18.34 3.833h-.008c-.198.083-.395.159-.593.251a39.032 39.032 0 0 0-4.944 2.407c-3.071 1.797-5.701 3.967-7.928 6.516a6.868 6.868 0 0 0-.401.473c-2.634 3.117-4.692 6.786-6.265 11.048-2.809 7.599-4.088 17.054-4.302 28.562 0 0 .942-11.59 16.27-18.846 2.328-1.104 4.994-1.946 7.893-2.556 16.159-3.418 39.811.255 56.025 5.036.892.266 1.742.546 2.575.84C-6.109 8.463-1.638 21.348-1.638 21.348S1.441 11.389 0 0"
          style={{
            fill: "#4f2743",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(428.343 361.444)"
        />
        <g
          clipPath={`url(#${prefix}-f)`}
          style={{
            opacity: 0.5,
          }}
        >
          <path
            d="M0 0c-6.726-3.772-21.631-7.272-22.176-7.171-.544.094-18.566 3.497-18.566 3.497-9.335 3.236-11.702 11.746-8.812 14.654 16.159-3.418 39.812.256 56.026 5.037.891.266 1.741.545 2.574.84C13.847 12.271 6.267 3.526 0 0"
            style={{
              fill: "#4f2743",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(396.19 346.959)"
          />
        </g>
        <path
          d="M0 0c.068.507.264 3.733 2.532 4.38 2.269.647 5.049-1.987 5.049-1.987s-2.142 4.883-6.064 3.73C-1.539 5.225 0 0 0 0"
          style={{
            fill: "#bf2e72",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(320.12 373.231)"
        />
        <g
          clipPath={`url(#${prefix}-g)`}
          style={{
            opacity: 0.19999701,
          }}
        >
          <path
            d="M0 0c-.721-2.954-3.286-5.381-6.681-7.004-7.579-3.618-19.295-3.262-23.885 3.977-6.644 10.486-2.388 29.276 12.148 28.854 7.405-.224 12.308-4.814 15.214-10.196C-.071 9.866.775 3.193 0 0"
            style={{
              fill: "#b63a89",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(368.624 369.48)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-h)`}
          style={{
            opacity: 0.19999701,
          }}
        >
          <path
            d="M0 0c1.259-2.767 4.231-4.674 7.87-5.634 8.12-2.14 19.565.396 22.724 8.363 4.571 11.542-3.116 29.208-17.319 26.081C6.042 27.208 2.082 21.784.23 15.954-1.771 9.706-1.357 2.992 0 0"
            style={{
              fill: "#b63a89",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(382.041 371.183)"
          />
        </g>
        <path
          d="M0 0c3.277 3.725 6.849 2.849 7.679-.714C9.076 5.703 3.009 7.926 0 0"
          style={{
            fill: "#bf2e72",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(422.589 379.616)"
        />
      </g>
      <g
        transform="matrix(.35278 0 0 -.35278 -105.833 158.75)"
        clipPath={`url(#${prefix}-i)`}
      >
        <path
          style={{
            fill: `url(#${prefix}-j)`,
            stroke: "none",
          }}
          d="M339.458 369.179c4.137-5.377 14.887-5.516 21.884-2.723 3.134 1.253 5.514 3.1 6.208 5.322.747 2.402.041 7.395-2.772 11.682-2.61 4.004-7.06 7.39-13.855 7.478l-.224.002c-13.161-.001-17.193-14.016-11.241-21.761"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-k)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 158.75)"
      >
        <path
          d="M0 0c-.693-2.222-3.074-4.069-6.208-5.322a9.62 9.62 0 0 0-11.95 8.717c-.339 5.297 3.683 9.877 8.988 10.216a9.564 9.564 0 0 0 6.399-1.929C.042 7.395.747 2.402 0 0"
          style={{
            fill: "#20bfb1",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(367.55 371.778)"
        />
        <path
          d="M0 0a4.544 4.544 0 1 0-9.068-.58A4.544 4.544 0 0 0 0 0"
          style={{
            fill: "#105460",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(367.26 376.313)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-l)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 158.75)"
      >
        <path
          d="M395.383 395.781c-6.635-1.47-10.302-5.694-12.042-10.145-1.879-4.77-1.552-9.802-.332-12.002 1.133-2.033 3.84-3.357 7.163-3.945 7.419-1.308 17.916 1.02 20.869 7.126 3.86 7.991-1.404 19.372-12.064 19.373-1.139 0-2.337-.129-3.594-.407"
          style={{
            fill: `url(#${prefix}-m)`,
            stroke: "none",
          }}
        />
      </g>
      <path
        d="M0 0c1.132-2.034 3.839-3.357 7.162-3.945a9.618 9.618 0 0 1 9.923 10.969c-.748 5.256-5.619 8.92-10.882 8.17a9.561 9.561 0 0 1-5.871-3.193C-1.548 7.231-1.221 2.199 0 0"
        style={{
          fill: "#20bfb1",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 29.284 26.94)"
      />
      <path
        d="M0 0a4.544 4.544 0 1 1 8.997 1.281A4.544 4.544 0 0 1 0 0"
        style={{
          fill: "#105460",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 29.058 25.353)"
      />
      <path
        d="M0 0c-2.058-1.626-4.319-3.064-6.737-4.335a39.932 39.932 0 0 0-1.877-.932c-5.809-2.766-12.416-4.61-19.194-5.671a39.564 39.564 0 0 0-1.361-.207 95.864 95.864 0 0 0-19.791-.719c-.484.025-.961.067-1.437.109-7.002.564-13.379 1.9-18.34 3.833l-.008-.001c-.198.084-.396.16-.594.251a39.087 39.087 0 0 0-4.943 2.408A111.11 111.11 0 0 0-71.526.135c17.229 14.664 32.864 10.401 33.825 5.176.271 5.553 13.269 11.743 34.694-2.402C-1.514 1.928-.535.954 0 0"
        style={{
          fill: "#fa5197",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 40.8 39.509)"
      />
      <path
        d="M0 0c-2.634 3.118-4.692 6.787-6.266 11.049C2.023 19.131 3.273 7.875 0 0"
        style={{
          fill: "#fffcf8",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 11.656 38.9)"
      />
      <path
        d="M0 0c-5.287 2.137-9.526 5.096-12.872 8.923C-3.634 18.625 2.24 13.457 0 0"
        style={{
          fill: "#fffcf8",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 16.338 42.215)"
      />
      <path
        d="M0 0c-7.002.564-13.379 1.9-18.34 3.833C-10.094 14.982-3.478 11.782 0 0"
        style={{
          fill: "#fffcf8",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 23.02 43.656)"
      />
      <path
        d="M0 0a95.864 95.864 0 0 0-19.791-.719C-13.035 11.227-5.468 10.24 0 0"
        style={{
          fill: "#fffcf8",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 30.51 43.44)"
      />
      <path
        d="M0 0c-5.809-2.766-12.416-4.61-19.193-5.67C-15.923 8.64-7.377 6.928 0 0"
        style={{
          fill: "#fffcf8",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 37.76 41.367)"
      />
      <path
        d="M0 0a31.794 31.794 0 0 0-5.071-6.013c-2.587-2.391-5.59-4.439-8.886-6.168C-13.361-.895-7.611 2.173 0 0"
        style={{
          fill: "#fffcf8",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 43.347 36.74)"
      />
      <path
        d="M0 0c-.609-4.788-2.016-9.819-4.778-14.479C-7.297-8.896-9.194-2.348 0 0"
        style={{
          fill: "#fffcf8",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 45.276 31.24)"
      />
      <path
        d="M0 0a1.705 1.705 0 1 0-3.4-.217A1.705 1.705 0 0 0 0 0"
        style={{
          fill: "#fff",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 32.57 24.095)"
      />
      <path
        d="M0 0a1.703 1.703 0 1 0-3.4-.217A1.703 1.703 0 1 0 0 0"
        style={{
          fill: "#fff",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 21.475 25.124)"
      />
    </svg>
  );
};
