import React from "react";
import { AvatarTheme } from "./avatarTheme";
import { kebabCase } from "lodash";

interface Props extends React.ComponentProps<"svg"> {
  className: string;
  theme: AvatarTheme;
  name?: string;
}

export const RedAvatar: React.FC<Props> = (props) => {
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
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-p"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-q"}>
          <path d="M204.991 341.684h40.306v-28.711h-40.306z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-r"}>
          <path d="M208.03 349.511h35.119v-13.615H208.03Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-s"}>
          <path d="M206.364 337.123h37.362v-20.585h-37.362z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-t"}>
          <path d="M150 329.302h23.725V300H150Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-u"}>
          <path d="M257.253 309.289h19.283V300h-19.283z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-v"}>
          <path d="M280.57 351.605H300v-36.88h-19.43z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-w"}>
          <path d="M150 450h20.124v-37.916H150Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-x"}>
          <path d="M245.353 445.135h21.964v-14.256h-21.964z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-y"}>
          <path d="M271.624 443.581H300v-33.692h-28.376z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-n"}>
          <path d="M193.684 394.891c-2.922-6.483-2.636-12.939.633-14.414.647-.293 1.378-.362 2.143-.244 1.677 1.816 3.298 4.118 4.724 6.623a47.378 47.378 0 0 1 2.157 4.209c.424.946.814 1.892 1.169 2.832.208.563.403 1.119.577 1.669.835 2.533 1.342 4.947 1.405 6.985-.417.64-.939 1.127-1.585 1.419-.452.203-.937.3-1.445.3-3.173 0-7.253-3.79-9.778-9.379" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-l"}>
          <path d="M185.808 378.868c1.504-4.951 6.831-2.79 10.651 1.362 1.678 1.819 3.3 4.121 4.726 6.628a48.206 48.206 0 0 1 3.321 7.038c1.176 3.131 1.912 6.17 1.985 8.652.045 1.368-.118 2.568-.514 3.515-.561 1.332-1.512 1.924-2.708 1.923-6.632-.001-20.779-18.196-17.461-29.118" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-j"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-k"}>
          <path d="M182.848 411.655h25.104v-37.804h-25.104z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-h"}>
          <path d="M224.204 376.73c0-7.059 5.724-12.783 12.784-12.783 7.06 0 12.784 5.724 12.784 12.783 0 7.061-5.724 12.784-12.784 12.784-7.06 0-12.784-5.723-12.784-12.784" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-f"}>
          <path d="M215.335 376.556c0-10.71 8.682-19.393 19.392-19.393 10.71 0 19.393 8.683 19.393 19.393s-8.683 19.394-19.393 19.394-19.392-8.684-19.392-19.394" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-c"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-d"}>
          <path d="M177.695 384.328h83.765v-51.396h-83.765Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-e"}>
          <path d="M213.685 400.049h42.084v-46.985h-42.084z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-a"}>
          <path d="M150 300h149.999v150H150Z" />
        </clipPath>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(13.47988 1.3534 1.3534 -13.47988 195.971 391.971)"
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
          gradientTransform="matrix(19.3926 0 0 -19.3926 234.727 376.556)"
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
          gradientTransform="matrix(99.771 0 0 -99.771 225 375)"
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
            offset={0.302}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
            }}
            offset={0.575}
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
          gradientTransform="matrix(14.826 0 0 -14.826 191.666 392.224)"
          spreadMethod="pad"
          id={prefix + "-o"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#22cfe8",
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#1fb4d6",
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
          gradientTransform="matrix(25.567 0 0 -25.567 224.205 376.73)"
          spreadMethod="pad"
          id={prefix + "-i"}
        >
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#22cfe8",
            }}
            offset={0}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: "#1fb4d6",
            }}
            offset={1}
          />
        </linearGradient>
      </defs>
      <g
        clipPath={`url(#${prefix}-a)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 158.75)"
      >
        <path
          d="M150 300h149.999v150H150Z"
          style={{
            fill: `url(#${prefix}-b)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-c)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 158.75)"
      >
        <g
          clipPath={`url(#${prefix}-d)`}
          style={{
            opacity: 0.19999701,
          }}
        >
          <path
            d="M0 0c2.565-23.686 27.378-38.063 28.538-41.542 1.159-3.478.461-9.853.461-9.853l35.715.809s-1.391 7.421 2.783 9.276c4.174 1.855 14.217 10.811 16.268 18.624-7.456-12.826-29.95-16.305-46.415-13.29C20.885-32.961 5.319-17.361 0 0"
            style={{
              fill: "#850b11",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(177.695 384.328)"
          />
        </g>
        <path
          d="M0 0c-2.5 14.436 3.565 7.044 3.565 7.044s1.798 11.537 7.131.87c2.319 7.884 7.45.173 5.363-7.479 3.015 5.334 7.652-1.623.166-13.566C16.175-1.043 7.298 6.696 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(200.899 427.168)"
        />
        <path
          d="M0 0c16.87 4.349 40.003-14.262 40.003-14.262s6.783 7.653-3.652 8.175c10.087 6.261 2.608 9.914-6.784 8.001 8.871 6.957-6.261 8.87-13.392 3.652C20.523 12.523 4.522 7.653 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(231.684 408.297)"
        />
        <g
          clipPath={`url(#${prefix}-e)`}
          style={{
            opacity: 0.19999701,
          }}
        >
          <path
            d="M0 0c-1.582-12.896-12.197-22.206-23.708-20.794C-35.22-19.382-43.27-7.783-41.688 5.114c1.582 12.896 12.197 22.206 23.709 20.794C-6.468 24.496 1.582 12.896 0 0"
            style={{
              fill: props.theme.darkAccent,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(255.571 374)"
          />
        </g>
      </g>
      <g
        clipPath={`url(#${prefix}-f)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 158.75)"
      >
        <path
          d="M215.335 376.556c0-10.71 8.682-19.393 19.392-19.393 10.71 0 19.393 8.683 19.393 19.393s-8.683 19.394-19.393 19.394-19.392-8.684-19.392-19.394"
          style={{
            fill: `url(#${prefix}-g)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-h)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 158.75)"
      >
        <path
          d="M224.204 376.73c0-7.059 5.724-12.783 12.784-12.783 7.06 0 12.784 5.724 12.784 12.783 0 7.061-5.724 12.784-12.784 12.784-7.06 0-12.784-5.723-12.784-12.784"
          style={{
            fill: `url(#${prefix}-i)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-j)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 158.75)"
      >
        <path
          d="M0 0a5.13 5.13 0 1 0-10.261 0A5.13 5.13 0 0 0 0 0"
          style={{
            fill: "#105e6e",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(242.12 376.73)"
        />
        <g
          clipPath={`url(#${prefix}-k)`}
          style={{
            opacity: 0.19999701,
          }}
        >
          <path
            d="M0 0c-.058-2.919-.844-6.421-2.119-10.005a54.16 54.16 0 0 0-3.668-8.1c-1.604-2.912-3.453-5.601-5.395-7.738-4.508-4.973-11.086-7.658-13.128-1.495C-29.815-10.729-4.846 15.319-.601 4.229-.154 3.053.037 1.611 0 0"
            style={{
              fill: props.theme.darkAccent,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(207.947 404.76)"
          />
        </g>
      </g>
      <g
        clipPath={`url(#${prefix}-l)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 158.75)"
      >
        <path
          d="M185.808 378.868c1.504-4.951 6.831-2.79 10.651 1.362 1.678 1.819 3.3 4.121 4.726 6.628a48.206 48.206 0 0 1 3.321 7.038c1.176 3.131 1.912 6.17 1.985 8.652.045 1.368-.118 2.568-.514 3.515-.561 1.332-1.512 1.924-2.708 1.923-6.632-.001-20.779-18.196-17.461-29.118"
          style={{
            fill: `url(#${prefix}-m)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-n)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 158.75)"
      >
        <path
          d="M193.684 394.891c-2.922-6.483-2.636-12.939.633-14.414.647-.293 1.378-.362 2.143-.244 1.677 1.816 3.298 4.118 4.724 6.623a47.378 47.378 0 0 1 2.157 4.209c.424.946.814 1.892 1.169 2.832.208.563.403 1.119.577 1.669.835 2.533 1.342 4.947 1.405 6.985-.417.64-.939 1.127-1.585 1.419-.452.203-.937.3-1.445.3-3.173 0-7.253-3.79-9.778-9.379"
          style={{
            fill: `url(#${prefix}-o)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-p)`}
        transform="matrix(.35278 0 0 -.35278 -52.917 158.75)"
      >
        <path
          d="M0 0a48.265 48.265 0 0 0-3.321-7.039c-.792-.541-1.592-.719-2.243-.428-1.429.647-1.615 3.342-.408 6.014 1.207 2.674 3.349 4.322 4.784 3.676C-.478 1.903-.073 1.076 0 0"
          style={{
            fill: "#105e6e",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(204.506 393.896)"
        />
        <path
          d="M0 0c16.697-2.435 27.132 1.392 33.162 4.406C31.422-5.333 27.249-8 19.595-.58c-3.71-9.044-9.971-9.16-15.537-1.275-5.449-8.464-12.522-5.798-15.653 3.247-6.261-7.885-15.131-3.131-13.566 8.116-5.797-4.522-8.928-3.362-9.044 10.435-6.029-1.739-9.624 1.276-6.029 10.552 0 0 8.58-15.885 17.044-21.682C-14.726 3.015 0 0 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(219.45 348.12)"
        />
        <g
          clipPath={`url(#${prefix}-q)`}
          style={{
            opacity: 0.30000299,
          }}
        >
          <path
            d="M0 0c-2.261-5.893-6.029-16.386 1.102-21.604 7.13-5.217 26.726-4.928 33.509 1.855C41.394-12.965 33.045 3.5 33.045 3.5Z"
            style={{
              fill: "#850b11",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(208.03 338.185)"
          />
        </g>
        <path
          d="M0 0c-.008-2.414-.411-4.758-1.434-6.769-4.64-9.162-30.263-9.51-34.785 0-1.301 2.741-1.37 6.06-.814 9.392.3 1.774.773 3.555 1.336 5.252 2.052 6.192 5.274 11.327 5.274 11.327s5.099-1.378 11.826-1.621c6.735-.251 13.685.577 13.685.577s3.033-5.892 4.334-12.572C-.224 3.75 0 1.851 0 0"
          style={{
            fill: "#f63c72",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(243.727 330.31)"
        />
        <g
          clipPath={`url(#${prefix}-r)`}
          style={{
            opacity: 0.30000299,
          }}
        >
          <path
            d="M0 0c-3.089 7.903-12.787 11.479-16.856 3.18-1.114 3.666-11.57 9.517-18.263-.891 2.053 6.192 5.274 11.326 5.274 11.326s5.099-1.377 11.826-1.621c6.735-.25 13.685.577 13.685.577S-1.301 6.679 0 0"
            style={{
              fill: "#c22d58",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(243.148 335.896)"
          />
        </g>
        <path
          d="M0 0c2.087-6.609 1.043-17.276 1.043-17.276s2.758 7.104.684 17.292C.812 1.507 0 0 0 0"
          style={{
            fill: "#c22d58",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(224.32 346.38)"
        />
        <path
          d="M0 0c-1.391 1.044-4.956-1.391-5.739-2.696 0 0 2.509 1.134 3.862 1.174-2.243-3.521-5.598-6.102-9.26-7.883a45.218 45.218 0 0 0-6.03-2.367 48.427 48.427 0 0 0-6.317-1.48c-8.553-1.35-17.379-1-25.707 1.045-4.161 1.026-8.176 2.591-11.808 4.686-1.825 1.062-3.567 2.287-5.232 3.62A48.928 48.928 0 0 0-71.012.387c-1.492 1.546-2.959 3.132-4.297 4.83a61.3 61.3 0 0 0-3.75 5.301c-1.133 1.848-2.21 3.743-3.087 5.74-.426 1.002-.835 2.019-1.144 3.067-.266.878-.516 1.77-.691 2.683 1.13-.413 2.585-2.18 2.585-2.18s-1.827 4.782-3.827 3.826c-2-.957-1.043-5.218-1.043-5.218s.459 2.617 1.319 3.423c.167-2.109.646-4.155 1.301-6.123a39.135 39.135 0 0 1 2.734-6.231c2.158-3.983 4.836-7.66 7.907-10.981 3.07-3.317 6.562-6.278 10.474-8.626 3.922-2.378 8.249-3.917 12.637-4.989 4.4-1.056 8.907-1.594 13.415-1.677 4.509-.076 9.03.295 13.46 1.194 4.419.914 8.791 2.31 12.776 4.567 1.984 1.13 3.871 2.468 5.535 4.075C-3.22-5.496-1.919-3.833-.949-1.978-.33-3.072-.261-6-.261-6S1.392-1.043 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(262.642 362.468)"
        />
        <g
          clipPath={`url(#${prefix}-s)`}
          style={{
            opacity: 0.5,
          }}
        >
          <path
            d="M0 0c-.008-2.414-.411-4.758-1.434-6.769-4.64-9.162-30.263-9.51-34.785 0-1.301 2.741-1.37 6.06-.814 9.392C-30.994 11.806-19.807 4.279-19-4.452-12.064 8.46-1.97 7.43 0 0"
            style={{
              fill: "#f63c72",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(243.727 330.31)"
          />
        </g>
        <path
          d="M0 0a2.435 2.435 0 1 0-4.87 0A2.435 2.435 0 0 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(244.554 379.426)"
        />
        <path
          d="M0 0a36.533 36.533 0 0 0-.578-1.67 50.4 50.4 0 0 0-1.168-2.831 2.425 2.425 0 0 0-1.266 2.136A2.432 2.432 0 0 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(205.087 395.566)"
        />
        <g
          clipPath={`url(#${prefix}-t)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0h-23.725v29.281a7.025 7.025 0 0 0 3.004-.42c2.356-.881 4.166-2.879 5.298-5.126 1.132-2.247 1.658-4.744 2.085-7.221 1.173 1.455 4.269.433 4.558-1.414.238-1.517-1.383-2.859-2.835-2.722 4.232-1.53 7.907-3.863 10.163-7.795A11.66 11.66 0 0 0 0 0"
            style={{
              fill: props.theme.bgInnerGradient,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(173.725 300)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-u)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0a10.497 10.497 0 0 0-.633-2.329h-18.575a29.159 29.159 0 0 0 9.259 7.83c2.219 1.187 4.954 2.075 7.193.922C-.544 5.288.354 2.46 0 0"
            style={{
              fill: props.theme.bgInnerGradient,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(276.46 302.33)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-v)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0v-36.881a9.688 9.688 0 0 0-3.062.709c-4.61 1.899-7.052 6.925-7.641 11.969l-.224-.31c-1.249-1.682-3.095-3.382-5.15-2.962-2.322.475-3.254 3.296-3.344 5.663-.158 4.074 1.706 14.546 6.079 16.621 3.389 1.603 5.333-.128 6.285-2.794C-5.264-4.648-2.883-1.713 0 0"
            style={{
              fill: props.theme.bgInnerGradient,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(300 351.606)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-w)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0a25.381 25.381 0 0 0-11.033-11.622c-1.872-.991-4.053-1.758-6.083-1.149a4.96 4.96 0 0 0-1.5.747v36.953h13.08c2.584-3.757 1.982-9.578-1.327-12.668 1.558.974 3.753.888 5.332-.131 1.872-1.207 2.9-3.461 3.024-5.686C1.617 4.221.939 2.02 0 0"
            style={{
              fill: props.theme.bgInnerGradient,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(168.616 425.071)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-x)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0c-3.124 2.813-16.172 10.965-19.47 5.167C-23.286-1.54-8.676-6.832-4.393-7.037c1.463-.07 2.993.041 4.267.763 1.274.721 2.217 2.187 1.943 3.626C1.614-1.577.811-.73 0 0"
            style={{
              fill: props.theme.bgInnerGradient,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(265.452 437.934)"
          />
        </g>
        <g
          clipPath={`url(#${prefix}-y)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0v-18.464a6.25 6.25 0 0 0-1.177-.468c-3.429-.97-6.963 1.001-9.802 3.155-6.997 5.308-17.972 15.319-17.373 24.935.028.42.089.84.186 1.253.271 1.142.829 2.208 1.727 2.941 1.737 1.421 4.249 1.283 6.454.877C-11.528 12.671-4.83 7.019 0 0"
            style={{
              fill: props.theme.bgInnerGradient,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(300 429.076)"
          />
        </g>
      </g>
    </svg>
  );
};
