import React from "react";
import { AvatarTheme } from "./avatarTheme";
import { kebabCase } from "lodash";

interface Props extends React.ComponentProps<"svg"> {
  className: string;
  theme: AvatarTheme;
  name?: string;
}

export const YellowAvatar: React.FC<Props> = (props) => {
  const prefix = kebabCase(props.name);
  return (
    <svg
      width={199.999}
      height={199.999}
      viewBox="0 0 52.916 52.916"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-p"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-q"}>
          <path d="M201.605 216.63h46.939v-25.365h-46.939z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-r"}>
          <path d="M197.358 196.674h68.103v-14.35h-68.103z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-s"}>
          <path d="M208.435 201.094h15.066v-5.828h-15.066z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-t"}>
          <path d="M231.055 198.49h16.814v-4.873h-16.814z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-u"}>
          <path d="M215.838 236.813h19.314v-5.025h-19.314z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-v"}>
          <path d="M160.665 293.394h35.78v-27.798h-35.78z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-w"}>
          <path d="M160.665 265.596c7.569 18.922 29.587 25.803 35.78 24.427-7.913 3.44-16.858 5.849-15.482-1.032-9.633 6.881-7.913 1.72-6.536-2.408-4.129 5.16-7.913-3.441-6.881-6.537-7.569 5.161-6.193-1.72-4.129-4.473-2.752-2.408-2.752-9.977-2.752-9.977" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-y"}>
          <path d="M239.449 172.706h38.991v-18.211h-38.991Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-z"}>
          <path d="M239.449 160.551c12.386-6.194 34.634 5.046 38.991 12.155-.459-5.733-4.357-10.32-5.734-8.486 1.148-6.193-.687-5.963-2.981-2.523-.459-7.11-2.982-9.862-6.652-3.67-.917-3.899-3.211 0-3.211 0-.917-4.816-6.422-4.128-8.027-1.376-1.606-2.981-9.403-.917-12.386 3.9" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-B"}>
          <path d="M270.069 284.111h17.274v-18.515h-17.274z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-C"}>
          <path d="M270.068 281.422c11.01-4.129 12.73-12.041 13.762-15.826 2.408 4.129-.344 7.913-.344 7.913s4.473 2.753 3.785 6.193c-.688 3.44-5.161-3.097-5.161-3.097s2.409 5.849.688 7.225c-1.72 1.377-6.193-2.752-6.193-2.752s-3.44 2.064-6.537.344" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-E"}>
          <path d="M162.013 175.683h17.416v-18.33h-17.416z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-F"}>
          <path d="M179.429 160.909c-11.282 3.31-13.577 11.075-14.884 14.774-2.099-4.294.923-7.867.923-7.867s-4.259-3.072-3.321-6.453c.939-3.381 4.92 3.467 4.92 3.467s-1.973-6.01-.156-7.256c1.816-1.247 5.974 3.198 5.974 3.198s3.582-1.806 6.544.137" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-n"}>
          <path d="M171.102 183.201c1.257-3.086 3.015-4.908 5.197-5.829 3.736-1.58 8.703-.502 14.478 1.489.28.092.56.194.849.306 1.757.622 3.592 1.311 5.486 2.035 2.733 1.051 5.595 2.158 8.55 3.18 6.029 2.082 12.44 3.803 18.936 3.932 7.956.159 14.155-1.515 19.538-3.383 5.613-1.962 10.352-4.147 15.267-4.733.595-.074 1.181-.12 1.783-.139a19.368 19.368 0 0 1 5.053.484c2.429.548 5.001 1.607 7.821 3.356.747.454 1.401.947 1.978 1.469 13.127 11.797-15.565 37.845-49.317 38.737-.604.016-1.201.024-1.801.024-33.191-.002-60.699-24.035-53.818-40.928" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-k"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-l"}>
          <path d="M216.637 229.789h5.956v-4.347h-5.956z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-m"}>
          <path d="M228.486 231.166h5.884v-5.204h-5.884z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-i"}>
          <path d="M186.834 247.759c0-9.29 7.53-16.82 16.819-16.82 9.289 0 16.819 7.53 16.819 16.82 0 9.289-7.53 16.819-16.819 16.819-9.289 0-16.819-7.53-16.819-16.819" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-g"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-h"}>
          <path d="M184.769 268.109h37.767v-40.701h-37.767z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-e"}>
          <path d="M230.584 247.759c0-9.29 7.53-16.82 16.82-16.82 9.289 0 16.819 7.53 16.819 16.82 0 9.289-7.53 16.819-16.819 16.819-9.29 0-16.82-7.53-16.82-16.819" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-c"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-d"}>
          <path d="M228.52 268.109h37.767v-40.701H228.52Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-a"}>
          <path d="M150 150h149.999v149.999H150Z" />
        </clipPath>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(39.04943 0 0 -39.04943 192.489 255.757)"
          spreadMethod="pad"
          id={prefix + "-x"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0.85}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0.859}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
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
          gradientTransform="matrix(35.30986 0 0 -35.30986 250.917 188.761)"
          spreadMethod="pad"
          id={prefix + "-A"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0.87}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0.877}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
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
          gradientTransform="matrix(18.89387 0 0 -18.89387 269.725 268.349)"
          spreadMethod="pad"
          id={prefix + "-D"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0.654}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0.673}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
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
          gradientTransform="scale(-18.89389 18.89389) rotate(-4.204 120.716 133.544)"
          spreadMethod="pad"
          id={prefix + "-G"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0.71}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#000",
            }}
            offset={0.726}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
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
          gradientTransform="matrix(16.81928 0 0 -16.81928 203.653 247.759)"
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
          gradientTransform="matrix(16.8193 0 0 -16.8193 247.403 247.759)"
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
          gradientTransform="matrix(111.15225 0 0 -111.15225 225 225)"
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
            offset={0.24}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
            }}
            offset={0.514}
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
          gradientTransform="matrix(0 34.28 34.28 0 224.663 186.363)"
          spreadMethod="pad"
          id={prefix + "-o"}
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
            offset={0.005}
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
        transform="matrix(.35278 0 0 -.35278 -52.917 105.833)"
      >
        <path
          d="M150 150h149.999v149.999H150Z"
          style={{
            fill: `url(#${prefix}-b)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-c)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 105.833)"
      >
        <g
          clipPath={`url(#${prefix}-d)`}
          style={{
            opacity: 0.199997,
          }}
        >
          <path
            d="M0 0c-10.412 0-18.884 9.129-18.884 20.351 0 11.221 8.472 20.35 18.884 20.35s18.884-9.129 18.884-20.35C18.884 9.129 10.412 0 0 0"
            style={{
              fill: props.theme.darkAccent,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(247.403 227.408)"
          />
        </g>
      </g>
      <g
        clipPath={`url(#${prefix}-e)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 105.833)"
      >
        <path
          d="M230.584 247.759c0-9.29 7.53-16.82 16.82-16.82 9.289 0 16.819 7.53 16.819 16.82 0 9.289-7.53 16.819-16.819 16.819-9.29 0-16.82-7.53-16.82-16.819"
          style={{
            fill: `url(#${prefix}-f)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-g)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 105.833)"
      >
        <path
          d="M0 0c0-5.642-4.574-10.215-10.216-10.215-5.641 0-10.216 4.573-10.216 10.215 0 5.642 4.575 10.216 10.216 10.216C-4.574 10.216 0 5.642 0 0"
          style={{
            fill: "#632fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(251.222 246.933)"
        />
        <path
          d="M0 0a4.644 4.644 0 1 0-9.287.001A4.644 4.644 0 0 0 0 0"
          style={{
            fill: "#4420b0",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(240.077 246.314)"
        />
        <g
          clipPath={`url(#${prefix}-h)`}
          style={{
            opacity: 0.199997,
          }}
        >
          <path
            d="M0 0c-10.412 0-18.883 9.129-18.883 20.351 0 11.221 8.471 20.35 18.883 20.35 10.413 0 18.884-9.129 18.884-20.35C18.884 9.129 10.413 0 0 0"
            style={{
              fill: props.theme.darkAccent,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(203.652 227.408)"
          />
        </g>
      </g>
      <g
        clipPath={`url(#${prefix}-i)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 105.833)"
      >
        <path
          d="M186.834 247.759c0-9.29 7.53-16.82 16.819-16.82 9.289 0 16.819 7.53 16.819 16.82 0 9.289-7.53 16.819-16.819 16.819-9.289 0-16.819-7.53-16.819-16.819"
          style={{
            fill: `url(#${prefix}-j)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-k)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 105.833)"
      >
        <path
          d="M0 0c0-5.642 4.573-10.215 10.215-10.215 5.642 0 10.216 4.573 10.216 10.215 0 5.642-4.574 10.216-10.216 10.216C4.573 10.216 0 5.642 0 0"
          style={{
            fill: "#632fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(199.835 246.933)"
        />
        <path
          d="M0 0a4.643 4.643 0 1 1 9.287 0A4.643 4.643 0 0 1 0 0"
          style={{
            fill: "#4420b0",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(210.979 246.314)"
        />
        <path
          d="M0 0c-1.373-1.156-3.409-2.04-5.663-2.566a20.893 20.893 0 0 0-5.897-.523c-2.16.123-4.159.629-5.621 1.586-1.204.777-2.037 1.864-2.277 3.292-.142.836.298 1.689 1.145 2.487 3.839 3.623 15.984 6.162 19.314 1.394.248-.358.447-.757.592-1.197C2.153 2.738 1.452 1.214 0 0"
          style={{
            fill: "#b04b72",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(234.151 228.53)"
        />
        <g
          clipPath={`url(#${prefix}-l)`}
          style={{
            opacity: 0.5,
          }}
        >
          <path
            d="M0 0c-2.163.124-4.16.627-5.622 1.585C-7.437 6.232-1.329 4.548 0 0"
            style={{
              fill: "#7b3e1d",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(222.593 225.442)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-m)`}
          style={{
            opacity: 0.5,
          }}
        >
          <path
            d="M0 0c-1.37-1.156-3.409-2.039-5.663-2.567C-5.771 3.063 1.568 4.441 0 0"
            style={{
              fill: "#7b3e1d",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(234.15 228.53)"
          />
        </g>
        <path
          d="M0 0c8.668 18.367 20.431 20.431 16.098 9.906 12.795 12.382 19.811 9.493 15.89 3.095 11.969 2.89 12.176-7.429-4.334-9.493C11.145 1.445 3.303-15.684-.619-7.842-7.429-13.827-9.08-6.191-18.16-.413c-9.081 5.779-17.748-1.238-21.05 5.16-3.302 6.397 12.176 6.191 12.176 6.191s-4.541 5.778 1.032 6.397c5.572.62 11.35-8.874 11.35-8.874S-15.271 24.765 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(226.25 257.355)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-n)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 105.833)"
      >
        <path
          d="M171.102 183.201c1.257-3.086 3.015-4.908 5.197-5.829 3.736-1.58 8.703-.502 14.478 1.489.28.092.56.194.849.306 1.757.622 3.592 1.311 5.486 2.035 2.733 1.051 5.595 2.158 8.55 3.18 6.029 2.082 12.44 3.803 18.936 3.932 7.956.159 14.155-1.515 19.538-3.383 5.613-1.962 10.352-4.147 15.267-4.733.595-.074 1.181-.12 1.783-.139a19.368 19.368 0 0 1 5.053.484c2.429.548 5.001 1.607 7.821 3.356.747.454 1.401.947 1.978 1.469 13.127 11.797-15.565 37.845-49.317 38.737-.604.016-1.201.024-1.801.024-33.191-.002-60.699-24.035-53.818-40.928"
          style={{
            fill: `url(#${prefix}-o)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-p)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 105.833)"
      >
        <path
          d="M0 0c-.562-.463-1.197-.9-1.924-1.305-2.74-1.551-5.241-2.493-7.602-2.979a20.545 20.545 0 0 0-4.912-.43c-.586.017-1.156.058-1.734.124-4.779.52-9.386 2.46-14.842 4.201-5.233 1.66-11.259 3.146-18.994 3.005-6.315-.115-12.548-1.642-18.409-3.491-2.872-.908-5.654-1.891-8.312-2.823a241.396 241.396 0 0 0-5.333-1.809c-.28-.098-.553-.189-.825-.272C-88.5-7.545-93.33-8.503-96.962-7.1c-2.121.818-3.83 2.436-5.052 5.176-6.81 15.272 21.025 37.114 54.07 36.321C-15.131 33.605 12.762 10.475 0 0"
          style={{
            fill: "#532938",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(274.607 187.049)"
        />
        <g
          clipPath={`url(#${prefix}-q)`}
          style={{
            opacity: 0.600006,
          }}
        >
          <path
            d="M0 0c-1.444 20.019 15.443 26.317 22.908 23.733 2.682-.928 3.073-3.194 2.888-4.747-.347-2.933-3.675-5.69-1.65-8.255 3.096-3.92 9.286-1.444 9.286 2.683 0 1.929-2.927 3.914-2.889 6.089.043 2.479 3.265 5.021 7.223 4.746 9.755-.678 10.318-16.613 7.842-21.978C43.132-3.095 18.986-.412 18.986-.412Z"
            style={{
              fill: "#532938",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(201.692 192.348)"
          />
        </g>
        <path
          d="m0 0-.38-3.186a20.581 20.581 0 0 0-4.911-.429c-.587.016-1.156.057-1.734.124-4.78.519-9.386 2.46-14.842 4.201-5.234 1.659-11.26 3.145-18.994 3.005C-47.177 3.6-53.409 2.072-59.27.224c-2.873-.909-5.654-1.891-8.313-2.824l-.52 2.188c1.395 4.49 3.228 7.825 5.325 10.227 2.715 3.129 5.869 4.681 9.039 5.16.008.007.016.007.025.007 4.218.628 8.461-.651 11.755-2.673 2.195-1.346 3.962-3.022 5.019-4.673a18.38 18.38 0 0 0 2.534 2.006c5.25 3.516 10.995 3.442 16.254 1.84a28.551 28.551 0 0 0 2.195-.758C-7.033 7.24 0 0 0 0"
          style={{
            fill: "#fa5197",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(265.46 185.95)"
        />
        <g
          clipPath={`url(#${prefix}-r)`}
          style={{
            opacity: 0.300003,
          }}
        >
          <path
            d="m0 0-.38-3.186a20.581 20.581 0 0 0-4.911-.429c-.587.016-1.156.057-1.734.124-4.78.519-9.386 2.46-14.842 4.201-5.234 1.659-11.26 3.145-18.994 3.005C-47.177 3.6-53.409 2.072-59.27.224c-2.873-.909-5.654-1.891-8.313-2.824l-.52 2.188c1.395 4.49 3.228 7.825 5.325 10.227-2.221-5.622 17.343-4.474 24.186-4.721 7.1-.265 32.434-.149 22.635 5.63C-7.033 7.24 0 0 0 0"
            style={{
              fill: "#b0396a",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(265.46 185.95)"
          />
        </g>
        <path
          d="M0 0c-5.613-1.766-10.442-2.724-14.075-1.32.562 2.74 2.13 7.305 6.299 7.446C-3.756 6.266-1.23 2.493 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(191.72 181.27)"
        />
        <path
          d="M0 0c-4.854-1.536-9.46-3.286-13.645-4.632.115 3.236 1.073 8.594 6.257 8.742C-3.863 4.21-1.502 2.171 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(206.19 186.174)"
        />
        <path
          d="M0 0c-4.779.52-9.386 2.46-14.842 4.201 2.575 2.469 6.455 5.267 9.898 4.037C-1.659 7.065-.445 3.153 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(258.435 182.459)"
        />
        <path
          d="M0 0c-.562-.463-1.197-.9-1.924-1.305-4.696-2.658-8.7-3.533-12.514-3.409 1.395 3.311 3.673 7.471 6.53 8.155C-5.292 4.069-2.312 2.104 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(274.607 187.049)"
        />
        <g
          clipPath={`url(#${prefix}-s)`}
          style={{
            opacity: 0.399994,
          }}
        >
          <path
            d="M0 0c-.223-.313-.562-.652-1.032-1.023-5.902-4.698-20.538.015-10.748 3.689.009.008.017.008.025.008C-7.537 3.302-3.293 2.022 0 0"
            style={{
              fill: "#fa5197",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(223.501 198.259)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-t)`}
          style={{
            opacity: 0.399994,
          }}
        >
          <path
            d="M0 0c5.25 3.517 10.995 3.442 16.254 1.841.017-.017.041-.041.058-.066C20.142-2.881.834-2.872 0 0"
            style={{
              fill: "#fa5197",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(231.055 195.592)"
          />
        </g>
        <path
          d="M0 0a1.887 1.887 0 1 0-3.775 0A1.887 1.887 0 0 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(241.734 247.759)"
        />
        <path
          d="M0 0a1.887 1.887 0 1 0-3.774 0A1.887 1.887 0 0 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(213.752 249.135)"
        />
        <g
          clipPath={`url(#${prefix}-u)`}
          style={{
            opacity: 0.600006,
          }}
        >
          <path
            d="M0 0c-.192-.166-.478-.324-.863-.485-4.769-1.978-17.57-2.687-18.451-.909C-15.475 2.229-3.33 4.768 0 0"
            style={{
              fill: "#b04b72",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(235.152 234.2)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-v)`}
          style={{
            opacity: 0.300003,
          }}
        >
          <g clipPath={`url(#${prefix}-w)`}>
            <path
              d="M160.665 265.596c7.569 18.922 29.587 25.803 35.78 24.427-7.913 3.44-16.858 5.849-15.482-1.032-9.633 6.881-7.913 1.72-6.536-2.408-4.129 5.16-7.913-3.441-6.881-6.537-7.569 5.161-6.193-1.72-4.129-4.473-2.752-2.408-2.752-9.977-2.752-9.977"
              style={{
                fill: `url(#${prefix}-x)`,
                stroke: "none",
              }}
            />
          </g>
        </g>
        <g
          clipPath={`url(#${prefix}-y)`}
          style={{
            opacity: 0.300003,
          }}
        >
          <g clipPath={`url(#${prefix}-z)`}>
            <path
              d="M239.449 160.551c12.386-6.194 34.634 5.046 38.991 12.155-.459-5.733-4.357-10.32-5.734-8.486 1.148-6.193-.687-5.963-2.981-2.523-.459-7.11-2.982-9.862-6.652-3.67-.917-3.899-3.211 0-3.211 0-.917-4.816-6.422-4.128-8.027-1.376-1.606-2.981-9.403-.917-12.386 3.9"
              style={{
                fill: `url(#${prefix}-A)`,
                stroke: "none",
              }}
            />
          </g>
        </g>
        <g
          clipPath={`url(#${prefix}-B)`}
          style={{
            opacity: 0.399994,
          }}
        >
          <g clipPath={`url(#${prefix}-C)`}>
            <path
              d="M270.068 281.422c11.01-4.129 12.73-12.041 13.762-15.826 2.408 4.129-.344 7.913-.344 7.913s4.473 2.753 3.785 6.193c-.688 3.44-5.161-3.097-5.161-3.097s2.409 5.849.688 7.225c-1.72 1.377-6.193-2.752-6.193-2.752s-3.44 2.064-6.537.344"
              style={{
                fill: `url(#${prefix}-D)`,
                stroke: "none",
              }}
            />
          </g>
        </g>
        <g
          clipPath={`url(#${prefix}-E)`}
          style={{
            opacity: 0.300003,
          }}
        >
          <g clipPath={`url(#${prefix}-F)`}>
            <path
              d="M179.429 160.909c-11.282 3.31-13.577 11.075-14.884 14.774-2.099-4.294.923-7.867.923-7.867s-4.259-3.072-3.321-6.453c.939-3.381 4.92 3.467 4.92 3.467s-1.973-6.01-.156-7.256c1.816-1.247 5.974 3.198 5.974 3.198s3.582-1.806 6.544.137"
              style={{
                fill: `url(#${prefix}-G)`,
                stroke: "none",
              }}
            />
          </g>
        </g>
      </g>
    </svg>
  );
};
