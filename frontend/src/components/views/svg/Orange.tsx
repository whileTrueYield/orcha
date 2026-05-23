import React from "react";
import { AvatarTheme } from "./avatarTheme";
import { kebabCase } from "lodash";

interface Props extends React.ComponentProps<"svg"> {
  className: string;
  theme: AvatarTheme;
  name?: string;
}

export const OrangeAvatar: React.FC<Props> = (props) => {
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
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-j"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-h"}>
          <path d="M68.552 94.703c-5.457-1.084-13.856-2.542-21.613-3.008-4.307-.262-8.418-.215-11.707.382a18.836 18.836 0 0 1-1.748-10.941c1.495-10.652 11.606-18.034 22.594-16.502 10.989 1.542 18.688 11.419 17.203 22.061a18.801 18.801 0 0 1-3.29 8.307c-.448-.092-.934-.196-1.439-.299" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-f"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-g"}>
          <path d="M32.146 104.643h42.802V60.851H32.146Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-d"}>
          <path d="M75.654 89.52c0-10.75 8.994-19.467 20.089-19.467 11.095 0 20.09 8.717 20.09 19.467 0 10.752-8.995 19.467-20.09 19.467s-20.089-8.715-20.089-19.467" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-c"}>
          <path d="M74.505 111.651h42.803V67.859H74.505Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-a"}>
          <path d="M0 0h150v150H0Z" />
        </clipPath>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(17.84514 0 0 -17.84514 53.382 79.718)"
          spreadMethod="pad"
          id={prefix + "-i"}
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
          gradientTransform="matrix(19.78045 0 0 -19.78045 95.743 89.52)"
          spreadMethod="pad"
          id={prefix + "-e"}
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
          gradientTransform="matrix(99.792 0 0 -99.792 75 75)"
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
            offset={0.352}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
            }}
            offset={0.61}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgOuterGradient,
            }}
            offset={1}
          />
        </radialGradient>
      </defs>
      <g
        clipPath={`url(#${prefix}-a)`}
        transform="matrix(.35278 0 0 -.35278 0 52.917)"
      >
        <path
          d="M0 0h150v150H0Z"
          style={{
            fill: `url(#${prefix}-b)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-c)`}
        style={{
          opacity: 0.30000299,
        }}
        transform="matrix(.35278 0 0 -.35278 0 52.917)"
      >
        <path
          d="M0 0c1.676-11.98 12.518-20.366 24.216-18.73C35.915-17.094 44.04-6.056 42.365 5.925c-1.676 11.98-12.518 20.366-24.217 18.729C6.45 23.019-1.676 11.979 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(74.724 86.793)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-d)`}
        transform="matrix(.35278 0 0 -.35278 0 52.917)"
      >
        <path
          d="M75.654 89.52c0-10.75 8.994-19.467 20.089-19.467 11.095 0 20.09 8.717 20.09 19.467 0 10.752-8.995 19.467-20.09 19.467s-20.089-8.715-20.089-19.467"
          style={{
            fill: `url(#${prefix}-e)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-f)`}
        transform="matrix(.35278 0 0 -.35278 0 52.917)"
      >
        <path
          d="M0 0c0-7.418-6.206-13.431-13.86-13.431-7.655 0-13.86 6.013-13.86 13.431 0 7.417 6.205 13.43 13.86 13.43C-6.206 13.43 0 7.417 0 0"
          style={{
            fill: "#197e34",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(103.997 89.832)"
        />
        <path
          d="M0 0c0-3.526-2.95-6.385-6.589-6.385-3.64 0-6.59 2.859-6.59 6.385s2.95 6.385 6.59 6.385C-2.95 6.385 0 3.526 0 0"
          style={{
            fill: "#0d3f1a",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(89.874 88.897)"
        />
        <g
          clipPath={`url(#${prefix}-g)`}
          style={{
            opacity: 0.30000299,
          }}
        >
          <path
            d="M0 0c1.676-11.98 12.518-20.365 24.216-18.729C35.915-17.094 44.041-6.055 42.365 5.926c-1.676 11.98-12.518 20.366-24.217 18.729C6.45 23.02-1.675 11.98 0 0"
            style={{
              fill: props.theme.darkAccent,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(32.365 79.784)"
          />
        </g>
      </g>
      <g
        clipPath={`url(#${prefix}-h)`}
        transform="matrix(.35278 0 0 -.35278 0 52.917)"
      >
        <path
          d="M68.552 94.703c-5.457-1.084-13.856-2.542-21.613-3.008-4.307-.262-8.418-.215-11.707.382a18.836 18.836 0 0 1-1.748-10.941c1.495-10.652 11.606-18.034 22.594-16.502 10.989 1.542 18.688 11.419 17.203 22.061a18.801 18.801 0 0 1-3.29 8.307c-.448-.092-.934-.196-1.439-.299"
          style={{
            fill: `url(#${prefix}-i)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-j)`}
        transform="matrix(.35278 0 0 -.35278 0 52.917)"
      >
        <path
          d="M0 0c-7.578-1.065-14.558 4.037-15.585 11.381a13.12 13.12 0 0 0 1.775 8.615c7.755.467 16.156 1.925 21.612 3.009a13.014 13.014 0 0 0 4.065-7.783C12.895 7.877 7.587 1.056 0 0"
          style={{
            fill: "#197e34",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(60.75 71.698)"
        />
        <path
          d="M0 0c.488-3.492 3.806-5.915 7.41-5.41 3.604.504 6.13 3.743 5.642 7.235-.489 3.493-3.806 5.915-7.41 5.411C2.038 6.732-.488 3.492 0 0"
          style={{
            fill: "#0d3f1a",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(59.574 85.335)"
        />
        <path
          d="M0 0c-.28-.177-.579-.364-.897-.542-24.154 5.645-52.438-1.906-70.36-17.837-2.223-.355-3.494-.542-3.494-.542.093.485.196.943.299 1.392 2.364 10.39 6.148 11.231 11.025 8.447.496-.29 1.01-.607 1.524-.962.028.7.084 1.373.177 1.999 1.224 9.213 8.195 11.138 13.399 6.42.392-.355.776-.748 1.14-1.178.141.608.309 1.205.486 1.776 2.084 6.531 6.728 10.418 14.894 3.886.468-.374.944-.775 1.439-1.223.327.569.654 1.102.981 1.597 5.055 7.55 10.596 5.953 13.568.851.327-.542.616-1.131.869-1.748a21.252 21.252 0 0 0 1.597 1.654C-7.419 9.419-2.738 6.093-.822 2.309A9.291 9.291 0 0 0 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(111.745 60.593)"
        />
        <path
          d="M0 0c-3.042-1.859-.234-15.885 3.037-17.987C6.307-20.09 36.909-7.242 43.683-4.906c6.774 2.337-2.57 10.045-8.877 10.979C28.499 7.008 18.221 2.569 17.52 0c-.701-2.569 1.168-9.812 1.168-9.812S14.25 4.204 8.876 3.271c-4.919-.857-1.168-13.784-1.168-13.784S4.205 2.569 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(74.486 120.978)"
        />
        <path
          d="M0 0c2.196.439 4.186 1.981 4.831 4.074A63.338 63.338 0 0 1-.897 5.69c-24.154 5.644-52.438-1.906-70.36-17.836-4.177-3.702-7.784-7.869-10.652-12.428 1.392-.945 3.205-1.589 5.597-1.589-4.98-1.868-14.016-3.737-9.961 9.036 0 0 .309-2.972 2.28-5.504 2.644 4.102 5.859 7.896 9.54 11.334 3.336 3.121 7.036 5.943 11.026 8.447.561.355 1.131.701 1.701 1.038a84.57 84.57 0 0 0 13.399 6.418c.542.206 1.084.403 1.626.599a90.416 90.416 0 0 0 14.894 3.887c.804.131 1.617.262 2.42.374 4.513.644 9.054.934 13.568.849a70.05 70.05 0 0 0 2.466-.092c4.243-.215 8.447-.767 12.531-1.683A68.7 68.7 0 0 0 4.84 7.018c-.486 1.728-1.869 3.597-4.532 5.447C10.904 12.773 15.885.317 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(112.095 53.543)"
        />
        <path
          d="M0 0a2.648 2.648 0 1 0-5.295.001A2.648 2.648 0 0 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(91.694 91.7)"
        />
        <path
          d="M0 0a2.648 2.648 0 1 0-5.295.001A2.648 2.648 0 0 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(62.336 86.31)"
        />
        <path
          d="M0 0c5.393-5.394 43.216-3.037 45.084-.935 1.869 2.103 1.402 17.053-1.868 19.156-3.271 2.102-4.439-12.148-4.439-12.148s1.402 10.512-3.971 10.98c-5.373.467-3.27-11.681-3.27-11.681s-.468 6.308-4.672 8.41c-4.205 2.103-21.258.467-24.528-3.037C-.935 7.241-1.402 1.401 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(28.233 91.311)"
        />
      </g>
    </svg>
  );
};
