import React from "react";
import { AvatarTheme } from "./avatarTheme";
import { kebabCase } from "lodash";

interface Props extends React.ComponentProps<"svg"> {
  className: string;
  theme: AvatarTheme;
  name?: string;
}

export const PurpleAvatar: React.FC<Props> = (props) => {
  const prefix = kebabCase(props.name);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={200}
      height={199.999}
      viewBox="0 0 52.917 52.916"
      {...props}
    >
      <defs>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-h"}>
          <path d="M48.91 246.2c-11.416-.648-20.144-10.428-19.495-21.844.648-11.414 10.428-20.142 21.844-19.493 11.415.647 20.143 10.428 19.494 21.843-.626 11.015-9.755 19.527-20.65 19.528-.396 0-.793-.011-1.193-.034" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-g"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-e"}>
          <path d="M102.957 251.024c-11.414-.648-20.143-10.428-19.494-21.844.649-11.414 10.429-20.143 21.843-19.494 11.416.649 20.144 10.428 19.495 21.843-.625 11.016-9.754 19.529-20.65 19.529-.396 0-.794-.011-1.194-.034" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-d"}>
          <path d="M28.349 249.411H72.49V200.7H28.349Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-c"}>
          <path d="M82.02 254.712h44.225v-48.713H82.019Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-a"}>
          <path d="M0 150h150v149.999H0Z" />
        </clipPath>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="scale(20.7026 -20.7026) rotate(-3.25 -190.77 -48.08)"
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
          gradientTransform="scale(20.7026 -20.7026) rotate(-3.25 -193.57 -94.204)"
          spreadMethod="pad"
          id={prefix + "-f"}
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
          gradientTransform="matrix(108.4005 0 0 -108.4005 75 225)"
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
            offset={0.407}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
            }}
            offset={0.718}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgOuterGradient,
            }}
            offset={0.964}
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
        transform="matrix(.35278 0 0 -.35278 0 105.833)"
      >
        <path
          d="M0 150h150v149.999H0Z"
          style={{
            fill: `url(#${prefix}-b)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-c)`}
        style={{
          opacity: 0.19999701,
        }}
        transform="matrix(.35278 0 0 -.35278 0 105.833)"
      >
        <path
          d="M0 0c1.857-13.345-6.421-25.525-18.49-27.205-12.069-1.679-23.358 7.777-25.216 21.122-1.857 13.345 6.421 25.525 18.49 27.205C-13.147 22.801-1.857 13.345 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(125.985 233.397)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-d)`}
        style={{
          opacity: 0.19999701,
        }}
        transform="matrix(.35278 0 0 -.35278 0 105.833)"
      >
        <path
          d="M0 0c1.857-13.345-6.401-25.521-18.446-27.198-12.046-1.677-23.316 7.782-25.173 21.127-1.858 13.345 6.401 25.522 18.446 27.199C-13.127 22.804-1.857 13.345 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(72.229 228.09)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-e)`}
        transform="matrix(.35278 0 0 -.35278 0 105.833)"
      >
        <path
          d="M102.957 251.024c-11.414-.648-20.143-10.428-19.494-21.844.649-11.414 10.429-20.143 21.843-19.494 11.416.649 20.144 10.428 19.495 21.843-.625 11.016-9.754 19.529-20.65 19.529-.396 0-.794-.011-1.194-.034"
          style={{
            fill: `url(#${prefix}-f)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-g)`}
        transform="matrix(.35278 0 0 -.35278 0 105.833)"
      >
        <path
          d="M0 0c.387-6.807-4.817-12.638-11.624-13.024-6.806-.387-12.637 4.817-13.024 11.623-.387 6.806 4.817 12.638 11.624 13.025C-6.218 12.01-.387 6.806 0 0"
          style={{
            fill: "#8b2d5c",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(108.576 229.245)"
        />
        <path
          d="M0 0a5.735 5.735 0 1 0-11.451-.65A5.735 5.735 0 0 0 0 0"
          style={{
            fill: "#46172e",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(95.617 227.73)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-h)`}
        transform="matrix(.35278 0 0 -.35278 0 105.833)"
      >
        <path
          d="M48.91 246.2c-11.416-.648-20.144-10.428-19.495-21.844.648-11.414 10.428-20.142 21.844-19.493 11.415.647 20.143 10.428 19.494 21.843-.626 11.015-9.755 19.527-20.65 19.528-.396 0-.793-.011-1.193-.034"
          style={{
            fill: `url(#${prefix}-i)`,
            stroke: "none",
          }}
        />
      </g>
      <path
        d="M0 0c.387-6.806 6.218-12.01 13.024-11.623 6.807.387 12.011 6.218 11.624 13.024-.387 6.806-6.218 12.01-13.024 11.623C4.817 12.638-.386 6.807 0 0"
        style={{
          fill: "#8b2d5c",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 16.155 26.837)"
      />
      <path
        d="M0 0a5.735 5.735 0 1 1 11.451.651A5.735 5.735 0 0 1 0 0"
        style={{
          fill: "#46172e",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 20.758 26.85)"
      />
      <path
        d="M0 0c6.673-4.488 9.207 3.426 21.73 5.129 9.834 1.338 15.9-1.044 19.322 2.267 3.422 3.309-1.072-16.612-18.576-19.164C4.971-14.32 0 0 0 0"
        style={{
          fill: props.theme.bgInnerGradient,
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 10.86 31.568)"
      />
      <path
        d="M0 0c-4.666-11.469 2.138-20.217 10.497-10.886 1.361-10.885 7.387-9.914 10.886-3.304C9.525-11.857 2.527-4.082 0 0"
        style={{
          fill: "#fffcf8",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 18.979 34.986)"
      />
      <path
        d="M0 0c.937 17.771 22.054 23.06 32.177 16.237 2.799 12.425-11.585 11.997-12.496 7.467-8.857 11.958-16.439 4.907-9.466-1.317-11.44-.845-16.139-10.652-9.313-10.848C-2.144 6.888 0 0 0 0"
        style={{
          fill: props.theme.darkAccent,
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 9.167 22.323)"
      />
      <path
        d="M0 0c2.567 16.501 20.874 26.692 34.182 8.368 1.25 8.832-6.196 13.082-8.037 11.225.141 7.796-6.274 7.626-11.356 1.107-2.159 10.586-9.646 5.293-11.563-5.525C-1.396 21.144-4.422 9.289 0 0"
        style={{
          fill: props.theme.darkAccent,
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 29.429 17.463)"
      />
      <path
        d="M0 0c-3.821-.112-7.647.456-11.146 1.82a25.22 25.22 0 0 0-9.196 6.184c-.659.652-1.239 1.383-1.838 2.088-.549.752-1.135 1.469-1.625 2.263-.758 1.106-1.414 2.282-2.032 3.477 1.534.596 3.446.967 5.998 1.227-10.86 5.553-13.299-.444-11.875-7.1 1.005 1.855 1.953 3.224 3.134 4.249.747-1.219 1.533-2.413 2.426-3.538.589-.816 1.283-1.558 1.933-2.323.707-.724 1.39-1.464 2.157-2.125 2.975-2.727 6.557-4.794 10.377-5.963C-7.865-.925-3.843-1.217.054-.824 3.951-.426 7.771.599 11.265 2.274 7.664.853 3.821.118 0 0"
        style={{
          fill: props.theme.darkAccent,
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 28.514 39.902)"
      />
      <path
        d="M0 0a3.11 3.11 0 1 0-6.21-.354A3.11 3.11 0 0 0 0 0"
        style={{
          fill: "#fff",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 34.634 24.448)"
      />
      <path
        d="M0 0a3.11 3.11 0 1 0-6.21-.353A3.11 3.11 0 1 0 0 0"
        style={{
          fill: "#fff",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 22.333 25.559)"
      />
    </svg>
  );
};
