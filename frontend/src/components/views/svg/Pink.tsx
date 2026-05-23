import React from "react";
import { AvatarTheme } from "./avatarTheme";
import { kebabCase } from "lodash";

interface Props extends React.ComponentProps<"svg"> {
  className: string;
  theme: AvatarTheme;
  name?: string;
}

export const PinkAvatar: React.FC<Props> = (props) => {
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
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-m"}>
          <path d="M366.428 26.021h14.561v-8.874h-14.561z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-l"}>
          <path d="M369.752 55.165h11.287V37.543h-11.287z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-j"}>
          <path d="M366.222 37.317c.123-7.155 2.226-13.294 7.048-13.959 5.224-.721 8.591 5.419 9.99 12.967 1.98 10.737-.012 24.301-6.255 24.965a4.399 4.399 0 0 1-.471.025c-6.213-.001-10.52-13.163-10.312-23.998" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-i"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-g"}>
          <path d="M327.415 99.26c0-15.537 12.595-28.132 28.132-28.132 10.369 0 19.422 5.614 24.301 13.963 3.027-6.288 9.441-10.639 16.888-10.639 10.358 0 18.755 8.397 18.755 18.754 0 10.359-8.397 18.755-18.755 18.755-5.487 0-10.408-2.372-13.837-6.127-2.961 12.364-14.08 21.558-27.352 21.558-15.537 0-28.132-12.595-28.132-28.132" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-c"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-d"}>
          <path d="M325.753 132.852h90.925V65.668h-90.925z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-e"}>
          <path d="M396.736 116.094c-5.014 0-9.592-2.129-13.097-5.637-4.091 13.046-15.12 22.396-28.092 22.396-16.455 0-29.794-15.04-29.794-33.593 0-18.553 13.339-33.592 29.794-33.592 10.255 0 19.298 5.842 24.658 14.734 3.584-6.084 9.65-10.084 16.531-10.084 11.014 0 19.942 10.247 19.942 22.888 0 12.641-8.928 22.888-19.942 22.888" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-a"}>
          <path d="M300 0h150v150H300Z" />
        </clipPath>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(36.95117 0 0 -36.95117 371.453 99.26)"
          spreadMethod="pad"
          id={prefix + "-h"}
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
          gradientTransform="matrix(104.05293 0 0 -104.05293 374.484 69.324)"
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
            offset={0.125}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
            }}
            offset={0.647}
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
          gradientTransform="scale(-31.03605 31.03605) rotate(-86.922 -5.094 7.302)"
          spreadMethod="pad"
          id={prefix + "-k"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgOuterGradient,
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.lightAccent,
            }}
            offset={1}
          />
        </linearGradient>
        <linearGradient
          x1={0}
          y1={0}
          x2={1}
          y2={0}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(90.92508 0 0 -90.92508 325.753 99.26)"
          spreadMethod="pad"
          id={prefix + "-f"}
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
              stopColor: props.theme.bgOuterGradient,
            }}
            offset={1}
          />
        </linearGradient>
      </defs>
      <g
        clipPath={`url(#${prefix}-a)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 52.917)"
      >
        <path
          d="M300 0h150v150H300Z"
          style={{
            fill: `url(#${prefix}-b)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-c)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 52.917)"
      >
        <g
          clipPath={`url(#${prefix}-d)`}
          style={{
            opacity: 0.39999402,
          }}
        >
          <g clipPath={`url(#${prefix}-e)`}>
            <path
              d="M396.736 116.094c-5.014 0-9.592-2.129-13.097-5.637-4.091 13.046-15.12 22.396-28.092 22.396-16.455 0-29.794-15.04-29.794-33.593 0-18.553 13.339-33.592 29.794-33.592 10.255 0 19.298 5.842 24.658 14.734 3.584-6.084 9.65-10.084 16.531-10.084 11.014 0 19.942 10.247 19.942 22.888 0 12.641-8.928 22.888-19.942 22.888"
              style={{
                fill: `url(#${prefix}-f)`,
                stroke: "none",
              }}
            />
          </g>
        </g>
      </g>
      <g
        clipPath={`url(#${prefix}-g)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 52.917)"
      >
        <path
          d="M327.415 99.26c0-15.537 12.595-28.132 28.132-28.132 10.369 0 19.422 5.614 24.301 13.963 3.027-6.288 9.441-10.639 16.888-10.639 10.358 0 18.755 8.397 18.755 18.754 0 10.359-8.397 18.755-18.755 18.755-5.487 0-10.408-2.372-13.837-6.127-2.961 12.364-14.08 21.558-27.352 21.558-15.537 0-28.132-12.595-28.132-28.132"
          style={{
            fill: `url(#${prefix}-h)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-i)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 52.917)"
      >
        <path
          d="M0 0c0-7.866 6.377-14.244 14.244-14.244 7.866 0 14.244 6.378 14.244 14.244 0 7.867-6.378 14.244-14.244 14.244C6.377 14.244 0 7.867 0 0"
          style={{
            fill: "#9affa0",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(350.918 96.886)"
        />
        <path
          d="M0 0a7.478 7.478 0 1 1 14.956 0A7.479 7.479 0 1 1 0 0"
          style={{
            fill: "#4d8050",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(361.245 96.886)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-j)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 52.917)"
      >
        <path
          d="M366.222 37.317c.123-7.155 2.226-13.294 7.048-13.959 5.224-.721 8.591 5.419 9.99 12.967 1.98 10.737-.012 24.301-6.255 24.965a4.399 4.399 0 0 1-.471.025c-6.213-.001-10.52-13.163-10.312-23.998"
          style={{
            fill: `url(#${prefix}-k)`,
            stroke: "none",
          }}
        />
      </g>
      <path
        d="M0 0c-1.187-6.362-4.046-11.538-8.48-10.93-4.093.561-5.878 5.736-5.983 11.766-.181 9.363 3.665 20.787 9.154 20.207C-.01 20.483 1.681 9.05 0 0"
        style={{
          fill: "#53162c",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 28.937 39.77)"
      />
      <g
        clipPath={`url(#${prefix}-l)`}
        style={{
          opacity: 0.5,
        }}
        transform="matrix(.35278 0 0 -.35278 -105.833 52.917)"
      >
        <path
          d="M0 0c3.007 21.684 13.77 21.208 10.762-.633C5.223-3.165 0 0 0 0"
          style={{
            fill: "#53162c",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(369.752 39.157)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-m)`}
        style={{
          opacity: 0.19999701,
        }}
        transform="matrix(.35278 0 0 -.35278 -105.833 52.917)"
      >
        <path
          d="M0 0c1.425-13.137 12.82-9.971 14.561-1.583C8.863-10.604 1.741-6.964 0 0"
          style={{
            fill: "#730029",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(366.428 26.021)"
        />
      </g>
      <path
        d="M0 0c-1.187-6.362-4.046-11.538-8.48-10.93-4.093.561-5.878 5.736-5.983 11.766C-8.613 7.142-2.593 3.817 0 0"
        style={{
          fill: "#fa5197",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 28.937 39.77)"
      />
      <path
        d="M0 0a9.496 9.496 0 1 0-18.992 0 9.495 9.495 0 0 0 9.496 9.496A9.496 9.496 0 0 0 0 0"
        style={{
          fill: "#9affa0",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 35.383 20.12)"
      />
      <path
        d="M0 0a4.986 4.986 0 1 0-9.972.002A4.986 4.986 0 0 0 0 0"
        style={{
          fill: "#4d8050",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 32.954 20.12)"
      />
      <path
        d="M0 0a3.087 3.087 0 1 0-6.173.001A3.087 3.087 0 0 0 0 0"
        style={{
          fill: "#fff",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 33.792 19.366)"
      />
      <path
        d="M0 0a3.086 3.086 0 1 0-6.173 0A3.086 3.086 0 0 0 0 0"
        style={{
          fill: "#fff",
          fillOpacity: 1,
          fillRule: "nonzero",
          stroke: "none",
        }}
        transform="matrix(.35278 0 0 -.35278 23.155 17.523)"
      />
    </svg>
  );
};
