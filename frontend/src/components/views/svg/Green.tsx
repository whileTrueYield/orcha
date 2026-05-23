import React from "react";
import { AvatarTheme } from "./avatarTheme";
import { kebabCase } from "lodash";

interface Props extends React.ComponentProps<"svg"> {
  className: string;
  theme: AvatarTheme;
  name?: string;
}

export const GreenAvatar: React.FC<Props> = (props) => {
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
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-n"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-o"}>
          <path d="M365.719 219.352h25.404V195.66h-25.404z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-p"}>
          <path d="M360.309 200.727h39.839v-26.431h-39.839z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-q"}>
          <path d="M366.723 205.535h26.974v-18.938h-26.974z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-r"}>
          <path d="M364.958 174.987h30.031v-11.622h-30.031z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-s"}>
          <path d="M424.076 235.181h12.953v-18.508h-12.953z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-t"}>
          <path d="M313.822 184.041h23.516v-25.732h-23.516z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-u"}>
          <path d="M313.079 281.874h12.746v-14.753h-12.746z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-l"}>
          <path d="M343.459 233.172c.093-1.115.21-2.228.336-3.332 1.957-16.999 7.622-32.714 15.028-43.513 6.62-9.649 14.619-15.382 22.61-14.597 9.441.925 16.762 8.961 20.755 22.447 3.143 10.598 4.225 24.573 2.654 41.098-.137 1.41-.287 2.843-.463 4.3-11.615-7.529-42.29-13.946-60.92-6.403" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-k"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-i"}>
          <path d="M384.901 267.413c-4.214-2.997-5.33-7.653-4.761-12.261.101-.86.27-1.712.486-2.551a23.913 23.913 0 0 1 3.192-7.247v-.008c1.883-2.836 4.149-4.789 6.084-4.967.054-.003.11-.012.173-.014 6.293-.408 21.429 7.329 22.157 19.68-2.013 6.036-8.954 10.86-16.609 10.86-3.561.001-7.275-1.043-10.722-3.492" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-h"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-f"}>
          <path d="M334.231 252.392c3.117-11.972 19.467-16.622 25.561-14.998.061.013.114.034.167.048 1.864.55 3.707 2.906 5.002 6.054l-.001.008a23.881 23.881 0 0 1 1.722 7.729c.048.866.049 1.734-.019 2.596-.337 4.631-2.337 8.982-7.053 11.102-2.603 1.17-5.201 1.688-7.69 1.688-9.125-.001-16.765-6.96-17.689-14.227" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-c"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-d"}>
          <path d="M332.096 269.079h35.813v-34.474h-35.813z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-e"}>
          <path d="M379.024 273.801h35.515v-36.28h-35.515z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-a"}>
          <path d="M300 150h150v149.999H300Z" />
        </clipPath>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="scale(-15.62897) rotate(5.601 154.72 -267.393)"
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
          gradientTransform="matrix(15.55426 1.52542 1.52542 -15.55426 350.61 251.48)"
          spreadMethod="pad"
          id={prefix + "-g"}
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
          gradientTransform="matrix(99.77325 0 0 -99.77325 375 225)"
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
            offset={0.391}
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
          gradientTransform="scale(-52.76906 52.76906) rotate(84.399 -5.435 -2.306)"
          spreadMethod="pad"
          id={prefix + "-m"}
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
            offset={0.391}
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
        transform="matrix(.35278 0 0 -.35278 -105.833 105.833)"
      >
        <path
          d="M300 150h150v149.999H300Z"
          style={{
            fill: `url(#${prefix}-b)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-c)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 105.833)"
      >
        <g
          clipPath={`url(#${prefix}-d)`}
          style={{
            opacity: 0.30000299,
          }}
        >
          <path
            d="M0 0a23.7 23.7 0 0 0 .038-3.027c-.135-3.191-.826-6.336-1.85-9.002l.001-.009c-1.409-3.662-3.425-6.398-5.476-7.028-.059-.016-.116-.039-.184-.055-6.708-1.854-24.762 3.669-28.272 17.65 1.236 10.776 14.47 20.904 27.898 14.46C-2.633 10.488-.4 5.402 0 0"
            style={{
              fill: "#649630",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(367.84 254.074)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-e)`}
          style={{
            opacity: 0.30000299,
          }}
        >
          <path
            d="M0 0c.117-1.022.312-2.036.557-3.036.758-3.165 2.054-6.175 3.581-8.642l.001-.009c2.099-3.387 4.614-5.729 6.75-5.957.06-.003.122-.016.191-.018 6.942-.538 23.566 8.531 24.264 23.205-3.327 10.538-18.294 18.072-30.199 8.991C.523 11.008-.667 5.483 0 0"
            style={{
              fill: "#649630",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(379.195 255.206)"
          />
        </g>
        <path
          d="M0 0c8.539.708 14.092-.052 20.268-5.837 6.176-5.786 9.807 2.242 5.694 5.775-3.134 2.693-7.103.608-7.103.608s2.723 5.484-2.222 6.695c-4.945 1.211-6.556-3.643-6.556-3.643s-.933 5.517-4.253 4.8c-3.321-.717-3.085-5.781-3.085-5.781S-4.761 3.315 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(341.293 272.131)"
        />
        <path
          d="M0 0c2.961-4.927 6.497.246 13.361 3.398 6.866 3.152 13.925.323 15.273 2.542 1.347 2.219-.494 5.039-5.175 2.231 1.304 6.65-4.766 7.359-8.022-.656.571 8.795-6.679 6.91-7.433-2.686C3.867 9.771-2.991 4.976 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(375.058 272.313)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-f)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 105.833)"
      >
        <path
          d="M334.231 252.392c3.117-11.972 19.467-16.622 25.561-14.998.061.013.114.034.167.048 1.864.55 3.707 2.906 5.002 6.054l-.001.008a23.881 23.881 0 0 1 1.722 7.729c.048.866.049 1.734-.019 2.596-.337 4.631-2.337 8.982-7.053 11.102-2.603 1.17-5.201 1.688-7.69 1.688-9.125-.001-16.765-6.96-17.689-14.227"
          style={{
            fill: `url(#${prefix}-g)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-h)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 105.833)"
      >
        <path
          d="M0 0c.068-.862.067-1.73.02-2.596a23.908 23.908 0 0 0-1.723-7.729l.001-.008c-1.295-3.148-3.138-5.504-5.002-6.055-.053-.013-.106-.034-.167-.048-.49-.11-.99-.198-1.502-.249-6.062-.594-11.467 3.845-12.062 9.907-.593 6.061 3.845 11.466 9.907 12.061C-6.156 5.712-2.13 3.524 0 0"
          style={{
            fill: "#69a4fa",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(366.663 253.83)"
        />
        <path
          d="M0 0a23.887 23.887 0 0 0-1.723-7.729l.001-.008a5.84 5.84 0 0 0-2.757-1.006A5.833 5.833 0 0 0-10.863-3.5 5.837 5.837 0 0 0-5.62 2.884 5.833 5.833 0 0 0 0 0"
          style={{
            fill: "#35527d",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(366.683 251.233)"
        />
        <path
          d="M0 0a2.466 2.466 0 1 0-4.91-.482A2.467 2.467 0 1 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(359.87 252.954)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-i)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 105.833)"
      >
        <path
          d="M384.901 267.413c-4.214-2.997-5.33-7.653-4.761-12.261.101-.86.27-1.712.486-2.551a23.913 23.913 0 0 1 3.192-7.247v-.008c1.883-2.836 4.149-4.789 6.084-4.967.054-.003.11-.012.173-.014 6.293-.408 21.429 7.329 22.157 19.68-2.013 6.036-8.954 10.86-16.609 10.86-3.561.001-7.275-1.043-10.722-3.492"
          style={{
            fill: `url(#${prefix}-j)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-k)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 105.833)"
      >
        <path
          d="M0 0c.101-.859.27-1.711.485-2.55a23.913 23.913 0 0 1 3.192-7.247l.001-.008c1.883-2.836 4.148-4.79 6.083-4.967.054-.003.111-.013.174-.015a12.138 12.138 0 0 1 1.521.048c6.062.594 10.501 5.999 9.906 12.061-.594 6.062-6 10.501-12.061 9.906A11.039 11.039 0 0 1 0 0"
          style={{
            fill: "#69a4fa",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(380.14 255.151)"
        />
        <path
          d="M0 0a23.912 23.912 0 0 1 3.191-7.247l.001-.008a5.854 5.854 0 0 1 2.902-.451 5.834 5.834 0 0 1 5.243 6.384A5.84 5.84 0 0 1 0 0"
          style={{
            fill: "#35527d",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(380.626 252.601)"
        />
        <path
          d="M0 0a2.467 2.467 0 1 1 4.91.483A2.467 2.467 0 0 1 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(386.975 255.613)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-l)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 105.833)"
      >
        <path
          d="M343.459 233.172c.093-1.115.21-2.228.336-3.332 1.957-16.999 7.622-32.714 15.028-43.513 6.62-9.649 14.619-15.382 22.61-14.597 9.441.925 16.762 8.961 20.755 22.447 3.143 10.598 4.225 24.573 2.654 41.098-.137 1.41-.287 2.843-.463 4.3-11.615-7.529-42.29-13.946-60.92-6.403"
          style={{
            fill: `url(#${prefix}-m)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-n)`}
        transform="matrix(.35278 0 0 -.35278 -105.833 105.833)"
      >
        <path
          d="M0 0c1.443-15.182.448-28.02-2.438-37.757-3.668-12.389-10.395-19.771-19.069-20.622-7.341-.72-14.689 4.546-20.771 13.411-6.804 9.921-12.008 24.358-13.806 39.974a102.268 102.268 0 0 0-.309 3.061C-39.277-8.862-11.096-2.967-.426 3.95-.264 2.612-.127 1.294 0 0"
          style={{
            fill: "#532945",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(402.587 232.74)"
        />
        <g
          clipPath={`url(#${prefix}-o)`}
          style={{
            opacity: 0.60000598,
          }}
        >
          <path
            d="M0 0c-9.664 5.443-4.745 16.557.754 16.247 7.607-.427.988-10.076 5.703-10.266 4.714-.19 6.95.943 4.323 5.12-2.627 4.177.367 9.557 6.199 5.956 5.832-3.602 1.148-14.366 1.148-14.366L6.926-5.451Z"
            style={{
              fill: "#532945",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(371.217 201.111)"
          />
        </g>
        <path
          d="M0 0c-1.103-1.282-2.407-2.498-3.869-3.635-.312-2.488-1.181-7.668-3.05-8.642-1.884-.975-4.673 2.007-5.915 3.505-8.383-3.499-18.744-4.946-28.346-2.961-.976-1.77-3.049-4.964-5.015-4.397-1.99.58-3.819 5.338-4.627 7.755a33.282 33.282 0 0 0-5.262 3.381 102.268 102.268 0 0 0-.309 3.061C-39.277-8.862-11.096-2.967-.426 3.95-.264 2.612-.127 1.294 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(402.587 232.74)"
        />
        <path
          d="M0 0c-3.668-12.389-10.395-19.771-19.068-20.622-7.341-.72-14.69 4.546-20.772 13.411 1.005 3.166 2.124 5.718 3.304 7.735 1.059 1.802 2.161 3.178 3.266 4.187 4.187 3.838 8.395 2.428 10.175-.88 4.969 7.507 11.072 7.996 15.943 5.015 1.323-.801 2.546-1.863 3.638-3.102C-2.061 4.095-.858 2.123 0 0"
          style={{
            fill: "#ea3e74",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(400.148 194.983)"
        />
        <g
          clipPath={`url(#${prefix}-p)`}
          style={{
            opacity: 0.39999402,
          }}
        >
          <path
            d="M0 0c-3.668-12.389-10.395-19.771-19.068-20.622-7.341-.72-14.69 4.546-20.772 13.411 1.005 3.166 2.124 5.718 3.304 7.735-2.421-9.628 7.03-19.336 19.562-16.574C-6.149-13.657-1.465-1.185-3.514 5.744-2.061 4.095-.858 2.123 0 0"
            style={{
              fill: "#ea3e74",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(400.148 194.983)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-q)`}
          style={{
            opacity: 0.30000299,
          }}
        >
          <path
            d="M0 0c-8.88-5.364-17.345 5.607-15.928 11.663 4.187 3.838 8.395 2.428 10.175-.88 4.969 7.507 11.071 7.996 15.942 5.015C12.701 11.889 8.269 4.99 0 0"
            style={{
              fill: "#ea3e74",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(382.807 188.031)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-r)`}
          style={{
            opacity: 0.30000299,
          }}
        >
          <path
            d="M0 0c9.087-10.195 21.138-10.709 30.031-.314C25.49-11.195 11.537-19.216 0 0"
            style={{
              fill: "#649630",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(364.958 174.987)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-s)`}
          style={{
            opacity: 0.19999701,
          }}
        >
          <path
            d="M0 0c.842-.816 1.91-1.61 3.07-1.438C4.394-1.243 5.207.11 5.618 1.383a12.448 12.448 0 0 1-.565 8.993 12.445 12.445 0 0 1-6.543 6.197c-1.276.514-2.854.769-3.93-.087C-9.685 13.093-2.552 2.477 0 0"
            style={{
              fill: "#649630",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(430.826 218.136)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-t)`}
          style={{
            opacity: 0.19999701,
          }}
        >
          <path
            d="M0 0c-.077-.006-.152-.019-.229-.027-1.226 2.703-4.149 4.316-7.46 2.273-3.204-1.976-7.934-11.462-3.419-14.178.67-.403 1.42-.506 2.185-.423a1.281 1.281 0 0 1-.005-.059c-.26-3.735 1.115-7.971 4.513-9.543 3.616-1.673 7.954.349 10.727 3.21 2.201 2.272 3.868 5.172 4.187 8.319C11.108-4.42 6.034.509 0 0"
            style={{
              fill: "#649630",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(326.79 180.873)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-u)`}
          style={{
            opacity: 0.19999701,
          }}
        >
          <path
            d="M0 0c4.127 7.837-3.968 12.412-8.598 4.7-1.513-2.522-5.199-7.887-1.228-10.351 1.624-1.009 3.732-.061 5.307 1.022C-2.724-3.395-1.015-1.927 0 0"
            style={{
              fill: "#649630",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(324.688 273.201)"
          />
        </g>
      </g>
    </svg>
  );
};
