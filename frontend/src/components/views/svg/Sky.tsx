import React from "react";
import { AvatarTheme } from "./avatarTheme";
import { kebabCase } from "lodash";

interface Props extends React.ComponentProps<"svg"> {
  className: string;
  theme: AvatarTheme;
  name?: string;
}

export const SkyAvatar: React.FC<Props> = (props) => {
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
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-k"}>
          <path d="M194.726 56.31h57.768V37.657h-57.768z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-l"}>
          <path d="M150 150h48.987V99.645H150Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-m"}>
          <path d="M171.295 136.96h9.707v-7.664h-9.707z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-n"}>
          <path d="M255.16 150H300V98.238h-44.84z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-o"}>
          <path d="M150 41.033h36.003V0H150Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-p"}>
          <path d="M249.712 30.994H300V0h-50.288z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-h"}>
          <path d="M178.841 84.824c-7.679-3.583-19.454-16.637-15.102-29.436 4.351-12.798 14.078-20.221 36.091-18.686 22.014 1.536 35.323.256 50.681-3.839 15.359-4.095 35.581-5.376 34.812 13.054-.767 18.429-13.31 23.806-13.31 23.806s-.512-8.192-10.495-12.799c-9.982-4.608-46.33-4.096-66.551 4.352-20.221 8.447-16.382 19.709-10.175 27.516 0 0-4.159-2.944-5.951-3.968" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-g"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-e"}>
          <path d="M195.535 100.541c-6.63-11.879-2.375-26.884 9.504-33.514 9.212-5.142 20.303-3.734 27.912 2.698 3.034-3.855 7.731-6.338 13.018-6.338 9.153 0 16.573 7.42 16.573 16.573 0 9.154-7.42 16.575-16.573 16.575-1.874 0-3.666-.325-5.345-.897a24.545 24.545 0 0 1-11.574 14.407 24.524 24.524 0 0 1-11.983 3.128c-8.64.001-17.022-4.552-21.532-12.632" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-c"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-d"}>
          <path d="M190.619 115.477h72.883V61.083h-72.883z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-a"}>
          <path d="M150 0h149.999v150H150Z" />
        </clipPath>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(37.29287 0 0 -37.29287 230.29 95.319)"
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
            offset={0.547}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#faffff",
            }}
            offset={0.843}
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
          gradientTransform="matrix(110.799 0 0 -110.799 225 75)"
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
            offset={0.32}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
            }}
            offset={0.506}
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
          gradientTransform="matrix(3.3775 28.7089 28.7089 -3.3775 222.042 35.67)"
          spreadMethod="pad"
          id={prefix + "-i"}
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
              stopColor: props.theme.bgOuterGradient,
            }}
            offset={0.986}
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
        transform="matrix(.35278 0 0 -.35278 -52.917 52.917)"
      >
        <path
          d="M150 0h149.999v150H150Z"
          style={{
            fill: `url(#${prefix}-b)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-c)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 52.917)"
      >
        <g
          clipPath={`url(#${prefix}-d)`}
          style={{
            opacity: 0.19999701,
          }}
        >
          <path
            d="M0 0a18.739 18.739 0 0 0-13.308 5.504A27.03 27.03 0 0 0-28.952.514a26.934 26.934 0 0 0-13.1 3.418c-12.97 7.239-16.957 23.286-9.718 36.256 4.755 8.519 13.101 14.206 22.867 14.206 4.566 0 9.097-1.183 13.106-3.42A26.768 26.768 0 0 0-3.876 37.346c1.281.272 2.578.41 3.876.41 10.408 0 17.533-8.853 17.533-19.262S10.408 0 0 0"
            style={{
              fill: "#702d5a",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(245.969 61.083)"
          />
        </g>
      </g>
      <g
        clipPath={`url(#${prefix}-e)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 52.917)"
      >
        <path
          d="M195.535 100.541c-6.63-11.879-2.375-26.884 9.504-33.514 9.212-5.142 20.303-3.734 27.912 2.698 3.034-3.855 7.731-6.338 13.018-6.338 9.153 0 16.573 7.42 16.573 16.573 0 9.154-7.42 16.575-16.573 16.575-1.874 0-3.666-.325-5.345-.897a24.545 24.545 0 0 1-11.574 14.407 24.524 24.524 0 0 1-11.983 3.128c-8.64.001-17.022-4.552-21.532-12.632"
          style={{
            fill: `url(#${prefix}-f)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-g)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 52.917)"
      >
        <path
          d="M0 0a8.04 8.04 0 0 1-6.325-3.072c.256 4.44-1.967 8.849-6.112 11.163-5.778 3.225-13.078 1.155-16.304-4.624-3.225-5.78-1.155-13.078 4.624-16.304 5.654-3.156 12.754-1.232 16.08 4.265.264-4.215 3.756-7.554 8.037-7.554A8.063 8.063 0 0 1 0 0"
          style={{
            fill: "#c91c5f",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(241.617 88.92)"
        />
        <path
          d="M0 0a2.943 2.943 0 1 0-5.886 0A2.943 2.943 0 0 0 0 0"
          style={{
            fill: "#650e30",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(241.361 81.88)"
        />
        <path
          d="M0 0a4.374 4.374 0 1 1 7.639-4.264A4.374 4.374 0 0 1 0 0"
          style={{
            fill: "#650e30",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(225.223 87.116)"
        />
        <path
          d="M0 0c-9.599 9.343-30.332 7.679-38.011-2.304-9.599 6.783 10.75 18.558 11.39 11.391 4.608 8.831 13.31 4.351 13.055-.64C-2.943 12.926 3.84 3.583 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(233.874 114.133)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-h)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 52.917)"
      >
        <path
          d="M178.841 84.824c-7.679-3.583-19.454-16.637-15.102-29.436 4.351-12.798 14.078-20.221 36.091-18.686 22.014 1.536 35.323.256 50.681-3.839 15.359-4.095 35.581-5.376 34.812 13.054-.767 18.429-13.31 23.806-13.31 23.806s-.512-8.192-10.495-12.799c-9.982-4.608-46.33-4.096-66.551 4.352-20.221 8.447-16.382 19.709-10.175 27.516 0 0-4.159-2.944-5.951-3.968"
          style={{
            fill: `url(#${prefix}-i)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-j)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 52.917)"
      >
        <path
          d="M0 0c9.599 2.304 13.95-6.527 13.438-12.927 9.727 4.224 6.272 11.391 2.56 10.879 4.352 5.631-.512 6.144-3.583 3.327C11.391 9.854-.512 3.071 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(250.64 104.918)"
        />
        <path
          d="M0 0c-2.097-3.824-5.905-6.389-11.127-6.712a14.02 14.02 0 0 0-1.274-.038h-.078c-5.774.062-9.829.76-13.676 1.689-3.041.738-5.966 1.621-9.514 2.465C-40.753-1.397-47.126-.284-57.017.161c-8.601.392-16.364-.177-23.352-.445-3.601-.131-6.995-.185-10.19.023-.714.046-1.42.108-2.119.176-4.853.515-9.215 1.751-13.109 4.393-.153.099-.307.207-.46.315a15.34 15.34 0 0 0-.822.606c-.046.031-.084.07-.13.108-2.035 1.59-3.925 3.609-5.683 6.15a25.771 25.771 0 0 0-2.234 3.886 21.409 21.409 0 0 0-.807 1.997c-5.152 14.843 9.584 26.922 18.591 31.169-5.598-5.905-7.794-11.972-5.598-17.477 1.398-3.517 4.592-6.804 9.822-9.676.66-.368 1.351-.722 2.081-1.075 3.256-1.567 7.187-3.002 11.833-4.254a64.163 64.163 0 0 1 2.135-.553 89.09 89.09 0 0 1 1.705-.407c4.085-.945 8.654-1.774 13.729-2.457h.016c.369-.054.737-.1 1.098-.147 5.498-.722 10.467-1.181 14.944-1.412a62.2 62.2 0 0 1 1.22-.054c3.572-.162 6.82-.162 9.768-.015 1.766.076 3.425.215 4.976.399.591.068 1.167.146 1.728.223 5.59.837 9.684 2.342 12.532 4.399 4.838 3.48 6.051 8.532 4.784 14.46C1.543 20.511 4.238 7.702 0 0"
          style={{
            fill: "#702d5a",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(282.124 40.253)"
        />
        <g
          clipPath={`url(#${prefix}-k)`}
          style={{
            opacity: 0.5,
          }}
        >
          <path
            d="M0 0c-5.084 1.198-11.457 2.312-21.348 2.757-8.601.391-16.364-.177-23.352-.445-12.755 7.026-5.536 13.361 1.175 16.34a64.186 64.186 0 0 1 2.135-.552 90.78 90.78 0 0 1 1.704-.408c4.086-.944 8.655-1.773 13.73-2.457h.016c.369-.053.737-.099 1.098-.146 5.498-.722 10.467-1.182 14.944-1.412a55.29 55.29 0 0 1 1.22-.054c3.572-.162 6.82-.162 9.768-.016C9.76 8.67 5.498 2.312 0 0"
            style={{
              fill: "#702d5a",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(246.455 37.657)"
          />
        </g>
        <path
          d="M0 0c9.265.595 6.935-6.939 6.247-9.638C14.626.05 8.318 4.613 0 0"
          style={{
            fill: props.theme.bgOuterGradient,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(177.042 89.744)"
        />
        <path
          d="M0 0c2.399 5.904 7.59 4.744 12.038 1.824C8.082 10.925-3.547 9.122 0 0"
          style={{
            fill: props.theme.bgOuterGradient,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(268.965 65.735)"
        />
        <path
          d="M0 0c-5.628-4.192-13.093-1.766-9.821 9.676C-8.424 6.159-5.229 2.872 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(189.016 61.639)"
        />
        <path
          d="M0 0c3.748-1.805 8.378-3.425 13.968-4.807C8.578-9.223.676-8.808 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(191.097 60.563)"
        />
        <path
          d="M0 0h.016C-5.053-5.997-12.816-5.583-13.73 2.457-9.645 1.513-5.076.684 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(220.5 52.893)"
        />
        <path
          d="M0 0c5.498-.722 10.467-1.182 14.943-1.412C10.413-7.863 2.872-8.224 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(221.613 52.746)"
        />
        <path
          d="M0 0c-2.949-6.436-10.221-7.971-14.744-.384C-9.031-.638-4.14-.492 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(252.522 51.664)"
        />
        <path
          d="M0 0c5.59.837 9.684 2.342 12.532 4.399C12.832-2.918 5.752-6.396 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(254.249 51.887)"
        />
        <path
          d="M0 0c-2.035 1.59-3.924 3.609-5.683 6.15a25.857 25.857 0 0 0-2.234 3.886C.507 13.039 1.927 6.273 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(174.925 45.59)"
        />
        <path
          d="M0 0c-4.853.515-9.215 1.751-13.108 4.393C-5.353 10.659-1.367 6.351 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(189.446 40.168)"
        />
        <path
          d="M0 0h-.077c-5.775.062-9.829.76-13.677 1.689C-8.77 10.014-3.233 6.466 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(269.723 33.503)"
        />
        <path
          d="M0 0c-2.097-3.824-5.905-6.389-11.127-6.712C-9.96 2.526-4.216 4.438 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(282.124 40.253)"
        />
        <path
          d="M0 0a1.535 1.535 0 1 0-3.07 0A1.535 1.535 0 0 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(242.673 82.648)"
        />
        <path
          d="M0 0a1.824 1.824 0 1 0-3.647.001A1.824 1.824 0 0 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(227.7 87.928)"
        />
        <g
          clipPath={`url(#${prefix}-l)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0c-6.337-13.741-35.229-9.155-35.229-9.155s9.289-7.741-7.225-13.417c7.589-.949 3.409-37.204-6.533-25.435V0Z"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(198.987 150)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-m)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0c1.704-7.666 10.321.688 9.633 3.44C8.945 6.192-.688 3.097 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(171.33 132.454)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-n)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0c-.679-.611-1.114-1.286-1.365-1.983-3.339 4.601-12.728 7.138-14.46.951-1.379-4.925 9.976-14.106 14.793-6.881.248.371.434.745.57 1.12 1.521-2.041 4.192-3.072 5.967-1.12C8.945-4.129 3.44 3.096 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(271.1 135.55)"
          />
          <path
            d="M0 0c-4.41-10.744 13.83-14.48 17.614-7.225 3.441-22.362 7.913-26.491 13.418-26.491-6.423-7.658-.784-18.509 4.817-18.031V0Z"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(264.151 150)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-o)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0h-35.862v38.903c5.394 9.052 12.247-13.159 10.665-21.701 22.362 4.472 22.362-5.161 17.202-8.945C-.385 8.257.585 3.833 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(185.862)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-p)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0v-24.416h-50.288c3.399 16.572 22.507 7.104 25.174 3.44 3.439 14.106 13.76 3.441 15.825.688C-10.355-7.121-5.625-1.5 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(300 24.416)"
          />
          <path
            d="M0 0c3.57-2.296 7.155-.26 7.976 2.888 3.778-2.439 11.721-.835 10.601 8.122-1.132 9.058-9.716 2.511-11.957-2.777C2.749 12.63-4.71 3.027 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(269.037 15.481)"
          />
        </g>
      </g>
    </svg>
  );
};
