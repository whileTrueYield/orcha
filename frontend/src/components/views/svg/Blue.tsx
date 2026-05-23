import React from "react";
import { AvatarTheme } from "./avatarTheme";
import { kebabCase } from "lodash";

interface Props extends React.ComponentProps<"svg"> {
  className: string;
  theme: AvatarTheme;
  name?: string;
}

export const BlueAvatar: React.FC<Props> = (props) => {
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
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-n"}>
          <path d="M35.775 344.895h75.02v-23.539h-75.02Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-o"}>
          <path d="M3.683 450h135.771V302.254H3.683Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-k"}>
          <path d="M38.502 369.049c-3.942-.059-7.788-2.082-10.288-5.412-2.784-3.709-3.558-8.524-2.18-13.555.893-3.281 2.686-6.629 5.328-9.95.421-.531.877-1.078 1.37-1.641a56.776 56.776 0 0 1 1.629-1.744 49.917 49.917 0 0 1 2.41-2.329c2.633-2.395 5.605-4.564 8.836-6.447.236-.149.472-.282.713-.417l.093-.053c4.518-2.547 9.486-4.541 14.804-5.935.415-.107.831-.213 1.218-.3a66.488 66.488 0 0 1 15.063-1.869 37.483 37.483 0 0 1 1.202 0c5.061.041 9.964.675 14.563 1.881.487.126.966.264 1.423.404 5.35 1.558 10.082 3.875 14.045 6.871.141.105.281.209.437.33l.599.474a39.008 39.008 0 0 1 2.369 2.067c2.644 2.472 4.808 5.178 6.43 8.042 3.978 7.003 4.523 14.661 1.424 19.986-1.857 3.191-4.854 5.022-8.221 5.022-.141 0-.284-.004-.426-.01-2.051-.091-4.374-.531-7.307-1.384-2.511-.725-5.126-1.649-7.893-2.628-.921-.325-1.851-.655-2.792-.98l-1.218-.421c-3.371-1.153-7.342-2.414-11.258-3.032-.915-.153-1.81-.26-2.659-.32l-.084-.006a25.573 25.573 0 0 0-1.874-.072c-.741 0-1.471.037-2.166.107-2.797.288-5.363.869-7.848 1.778-.526.19-1.078.408-1.674.659-3.049 1.309-5.648 2.969-8.162 4.575-.813.52-1.617 1.033-2.415 1.522-.451.28-.909.554-1.356.811-2.725 1.577-6.121 3.262-10.645 3.798-.985.121-2.006.183-3.032.183-.153 0-.308-.002-.458-.005" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-j"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-h"}>
          <path d="M44.449 397.401c-3.625-8.764.54-18.808 9.304-22.434 8.766-3.625 18.809.54 22.435 9.305 3.625 8.764-.54 18.808-9.305 22.434a17.122 17.122 0 0 1-6.558 1.308c-6.743.001-13.139-3.995-15.876-10.613" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-g"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-e"}>
          <path d="M77.983 381.163c0-7.504 6.083-13.586 13.587-13.586s13.587 6.082 13.587 13.586c0 7.505-6.083 13.588-13.587 13.588s-13.587-6.083-13.587-13.588" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-c"}>
          <path d="M0 450h450V0H0Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-d"}>
          <path d="M41.716 410.634h64.997v-45.442H41.716Z" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id={prefix + "-a"}>
          <path d="M0 300h150v150H0Z" />
        </clipPath>
        <radialGradient
          fx={0}
          fy={0}
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(17.17798 0 0 -17.17798 60.318 390.837)"
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
          gradientTransform="matrix(13.58695 0 0 -13.58695 91.57 381.164)"
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
          gradientTransform="matrix(102.186 0 0 -102.186 75 375)"
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
            offset={0.495}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.bgInnerGradient,
            }}
            offset={0.714}
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
          gradientTransform="scale(-59.29474 59.29474) rotate(-85.99 2.695 3.776)"
          spreadMethod="pad"
          id={prefix + "-l"}
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
              stopColor: props.theme.bgOuterGradient,
            }}
            offset={0.17}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.lightAccent,
            }}
            offset={0.661}
          />
          <stop
            style={{
              stopOpacity: 1,
              stopColor: props.theme.lightAccent,
            }}
            offset={1}
          />
        </linearGradient>
      </defs>
      <g
        clipPath={`url(#${prefix}-a)`}
        transform="matrix(.35278 0 0 -.35278 0 158.75)"
      >
        <path
          d="M0 300h150v150H0Z"
          style={{
            fill: `url(#${prefix}-b)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-c)`}
        transform="matrix(.35278 0 0 -.35278 0 158.75)"
      >
        <path
          d="M0 0c8.185 2.128 20.626-2.128 21.936-14.405 2.374-.164 4.839 5.71 3.601 9.658-1.238 3.948-6.182 5.97-6.182 5.97s7.829 3.634-.559 8.248c-8.388 4.613-8.807-5.592-8.807-5.592S-5.452 13.98 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(88.46 402.608)"
        />
        <path
          d="M0 0c-6.711 14.733-25.864 14.896-33.395 11.295-2.291 13.424 3.929 17.843 15.388 8.513-1.146 12.113 11.296 10.967 13.424-5.075C2.783 21.608 8.512 18.825 0 0"
          style={{
            fill: props.theme.darkAccent,
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(77.983 407.028)"
        />
        <g clipPath={`url(#${prefix}-d)`}>
          <path
            d="M0 0c-5.908.665-11.423-2.361-14.471-7.32.432 8.168-3.954 16.098-11.459 19.402-9.491 4.179-20.368-.623-24.294-10.724-3.926-10.1.585-21.676 10.076-25.855 8.734-3.845 18.637-.082 23.222 8.414-.006-7.981 5.651-14.811 13.351-15.678 8.304-.934 15.836 5.418 16.823 14.188C14.235-8.803 8.304-.935 0 0"
            style={{
              fill: props.theme.bgOuterGradient,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(93.357 397.044)"
          />
        </g>
      </g>
      <g
        clipPath={`url(#${prefix}-e)`}
        transform="matrix(.35278 0 0 -.35278 0 158.75)"
      >
        <path
          d="M77.983 381.163c0-7.504 6.083-13.586 13.587-13.586s13.587 6.082 13.587 13.586c0 7.505-6.083 13.588-13.587 13.588s-13.587-6.083-13.587-13.588"
          style={{
            fill: `url(#${prefix}-f)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-g)`}
        transform="matrix(.35278 0 0 -.35278 0 158.75)"
      >
        <path
          d="M0 0a7.039 7.039 0 1 0-14.078 0A7.039 7.039 0 0 0 0 0"
          style={{
            fill: "#eb4289",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(92.388 382.637)"
        />
        <path
          d="M0 0a3.602 3.602 0 1 0-7.203 0A3.602 3.602 0 0 0 0 0"
          style={{
            fill: "#611b38",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(88.95 382.637)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-h)`}
        transform="matrix(.35278 0 0 -.35278 0 158.75)"
      >
        <path
          d="M44.449 397.401c-3.625-8.764.54-18.808 9.304-22.434 8.766-3.625 18.809.54 22.435 9.305 3.625 8.764-.54 18.808-9.305 22.434a17.122 17.122 0 0 1-6.558 1.308c-6.743.001-13.139-3.995-15.876-10.613"
          style={{
            fill: `url(#${prefix}-i)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-j)`}
        transform="matrix(.35278 0 0 -.35278 0 158.75)"
      >
        <path
          d="M0 0a8.402 8.402 0 0 1 4.553-10.977A8.403 8.403 0 0 1 15.53-6.424a8.403 8.403 0 0 1-4.553 10.977A8.402 8.402 0 0 1 0 0"
          style={{
            fill: "#eb4289",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(60.254 391.206)"
        />
        <path
          d="M0 0a4.3 4.3 0 1 1 7.948-3.285A4.3 4.3 0 0 1 0 0"
          style={{
            fill: "#611b38",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(64.843 389.519)"
        />
      </g>
      <g
        clipPath={`url(#${prefix}-k)`}
        transform="matrix(.35278 0 0 -.35278 0 158.75)"
      >
        <path
          d="M38.502 369.049c-3.942-.059-7.788-2.082-10.288-5.412-2.784-3.709-3.558-8.524-2.18-13.555.893-3.281 2.686-6.629 5.328-9.95.421-.531.877-1.078 1.37-1.641a56.776 56.776 0 0 1 1.629-1.744 49.917 49.917 0 0 1 2.41-2.329c2.633-2.395 5.605-4.564 8.836-6.447.236-.149.472-.282.713-.417l.093-.053c4.518-2.547 9.486-4.541 14.804-5.935.415-.107.831-.213 1.218-.3a66.488 66.488 0 0 1 15.063-1.869 37.483 37.483 0 0 1 1.202 0c5.061.041 9.964.675 14.563 1.881.487.126.966.264 1.423.404 5.35 1.558 10.082 3.875 14.045 6.871.141.105.281.209.437.33l.599.474a39.008 39.008 0 0 1 2.369 2.067c2.644 2.472 4.808 5.178 6.43 8.042 3.978 7.003 4.523 14.661 1.424 19.986-1.857 3.191-4.854 5.022-8.221 5.022-.141 0-.284-.004-.426-.01-2.051-.091-4.374-.531-7.307-1.384-2.511-.725-5.126-1.649-7.893-2.628-.921-.325-1.851-.655-2.792-.98l-1.218-.421c-3.371-1.153-7.342-2.414-11.258-3.032-.915-.153-1.81-.26-2.659-.32l-.084-.006a25.573 25.573 0 0 0-1.874-.072c-.741 0-1.471.037-2.166.107-2.797.288-5.363.869-7.848 1.778-.526.19-1.078.408-1.674.659-3.049 1.309-5.648 2.969-8.162 4.575-.813.52-1.617 1.033-2.415 1.522-.451.28-.909.554-1.356.811-2.725 1.577-6.121 3.262-10.645 3.798-.985.121-2.006.183-3.032.183-.153 0-.308-.002-.458-.005"
          style={{
            fill: `url(#${prefix}-l)`,
            stroke: "none",
          }}
        />
      </g>
      <g
        clipPath={`url(#${prefix}-m)`}
        transform="matrix(.35278 0 0 -.35278 0 158.75)"
      >
        <path
          d="M0 0c-1.447-2.553-3.444-5.127-6.063-7.576a37.966 37.966 0 0 0-2.266-1.977c-.196-.157-.393-.308-.589-.465-.124-.098-.249-.19-.374-.282-3.863-2.92-8.44-5.114-13.429-6.567a30.59 30.59 0 0 0-1.362-.386c-4.466-1.173-9.233-1.782-14.091-1.821a31.655 31.655 0 0 0-1.153 0 64.689 64.689 0 0 0-14.634 1.814c-.406.092-.812.197-1.218.301-4.996 1.31-9.842 3.222-14.301 5.736-.255.144-.504.282-.753.439-3.058 1.781-5.933 3.857-8.532 6.221a47.192 47.192 0 0 0-2.318 2.239 51.937 51.937 0 0 0-1.578 1.689A42.17 42.17 0 0 0-83.958.917c-2.619 3.293-4.197 6.404-4.969 9.246-2.678 9.769 4.112 16.389 10.601 16.487 1.133.02 2.206-.039 3.222-.163 3.863-.459 6.947-1.84 9.9-3.55.432-.248.871-.51 1.303-.778 3.352-2.056 6.646-4.433 10.837-6.234a37.771 37.771 0 0 1 1.781-.701c2.416-.884 5.14-1.558 8.316-1.886a25.148 25.148 0 0 1 4.387-.039h.006c.963.066 1.932.183 2.914.347 3.818.603 7.74 1.801 11.57 3.11.413.144.819.282 1.231.426 3.7 1.283 7.288 2.626 10.582 3.575 2.475.721 4.78 1.218 6.849 1.31C2.128 22.407 6.457 11.368 0 0"
          style={{
            fill: "#4f2743",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(116.858 340.435)"
        />
        <path
          d="M0 0a38.34 38.34 0 0 0-2.266-1.978c-.196-.157-.393-.307-.589-.464-.124-.099-.249-.19-.374-.282-3.863-2.921-8.44-5.114-13.429-6.568a33.545 33.545 0 0 0-1.362-.386c-4.466-1.172-9.233-1.781-14.091-1.82a31.655 31.655 0 0 0-1.153 0 64.744 64.744 0 0 0-14.634 1.813c-.406.092-.812.197-1.218.302-4.996 1.309-9.842 3.221-14.301 5.736-.255.144-.504.281-.753.439-3.058 1.781-5.933 3.856-8.532 6.22-.832.753-1.604 1.5-2.318 2.239 6.077 4.014 12.212 6.044 17.646 6.784 10.929 1.5 19.029-2.246 18.178-5.638 1.925 3.608 14.156 6.856 27.455 1.146C-7.845 5.874-3.851 3.431 0 0"
          style={{
            fill: "#f53685",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(110.795 332.86)"
        />
        <g
          clipPath={`url(#${prefix}-n)`}
          style={{
            opacity: 0.30000299,
          }}
        >
          <path
            d="M0 0a38.34 38.34 0 0 0-2.266-1.978c-.196-.157-.393-.307-.589-.464-.124-.099-.249-.19-.374-.282-3.863-2.921-8.44-5.114-13.429-6.568a33.545 33.545 0 0 0-1.362-.386c-4.466-1.172-9.233-1.781-14.091-1.82a31.655 31.655 0 0 0-1.153 0 64.744 64.744 0 0 0-14.634 1.813c-.406.092-.812.197-1.218.302-4.996 1.309-9.842 3.221-14.301 5.736-.255.144-.504.281-.753.439-3.058 1.781-5.933 3.856-8.532 6.22-.832.753-1.604 1.5-2.318 2.239 6.077 4.014 12.212 6.044 17.646 6.784C-69.016 8.12-59.34 1.886-40.342-.805c19.644-2.783 37.971 2.868 28.601 8.348C-7.845 5.874-3.851 3.431 0 0"
            style={{
              fill: "#a8476f",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(110.795 332.86)"
          />
        </g>
        <path
          d="M0 0a2.128 2.128 0 1 0-4.257 0A2.128 2.128 0 0 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(90.67 384.274)"
        />
        <path
          d="M0 0a2.128 2.128 0 1 0-4.257 0A2.128 2.128 0 0 0 0 0"
          style={{
            fill: "#fff",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(74.49 389.567)"
        />
        <path
          d="M0 0c3.863-.458 6.947-1.84 9.9-3.549C6.548-6.784 1.742-7.838 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(41.753 366.922)"
        />
        <path
          d="M0 0c3.353-2.056 6.646-4.433 10.837-6.234C4.473-11.204.399-7.648 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(52.956 362.594)"
        />
        <path
          d="M0 0c-4.086-7.602-10.097-5.54-12.703 1.925 2.416-.884 5.14-1.558 8.316-1.886A25.148 25.148 0 0 1 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(78.278 353.734)"
        />
        <path
          d="M0 0c3.817.602 7.739 1.8 11.57 3.11C10.646-5.422 4.256-5.834 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(81.198 354.082)"
        />
        <path
          d="M0 0c-1.964-9.324-5.88-9.311-10.582-3.575C-6.882-2.292-3.293-.95 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(104.58 361.192)"
        />
        <path
          d="M0 0c-2.619 3.293-4.197 6.404-4.97 9.246C2.625 12.775 2.848 6.98 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(32.9 341.352)"
        />
        <path
          d="M0 0c-3.058 1.781-5.933 3.857-8.532 6.221a50.863 50.863 0 0 0-3.896 3.928C-2.017 15.309 1.093 7.766 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(46.625 329.65)"
        />
        <path
          d="M0 0c-4.996 1.31-9.842 3.222-14.301 5.736C-5.985 13.155-.779 8.047 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(61.679 323.476)"
        />
        <path
          d="M0 0a64.76 64.76 0 0 0-14.635 1.813C-7.91 9.907-2.456 6.823 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(77.531 321.361)"
        />
        <path
          d="M0 0c-4.466-1.172-9.233-1.781-14.091-1.82C-9.449 7.085-5.134 5.828 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(92.775 323.182)"
        />
        <path
          d="M0 0c-3.863-2.92-8.44-5.114-13.43-6.567C-11.518 3.549-6.771 4.099 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(107.566 330.135)"
        />
        <path
          d="M0 0c-1.84-3.241-4.557-6.515-8.329-9.553C-10.097-1.407-6.286.616 0 0"
          style={{
            fill: "#fffcf8",
            fillOpacity: 1,
            fillRule: "nonzero",
            stroke: "none",
          }}
          transform="translate(116.858 340.435)"
        />
        <g
          clipPath={`url(#${prefix}-o)`}
          style={{
            opacity: 0.10000598,
          }}
        >
          <path
            d="M0 0c-13.885-13.307 9.633-23.395 18.578-11.353C27.523.688 8.257 7.913 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(10.665 325.459)"
          />
          <path
            d="M0 0c-1.071-7.5 14.105-4.128 11.697 1.376C9.289 6.881.688 4.816 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(36.468 313.418)"
          />
          <path
            d="M0 0c-4.75-10.984 5.161-8.601 7.569-3.096C9.978 2.409 5.505 12.729 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(17.89 422.133)"
          />
          <path
            d="M0 0c-.365-5.837 5.849-3.097 5.505 1.376C5.161 5.848.344 5.504 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(120.757 388.762)"
          />
          <path
            d="M0 0c-1.72 5.849-21.33 3.097-19.266-5.849C-15.551-21.946 1.72-5.849 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(138.303 437.959)"
          />
          <path
            d="M0 0c-6.537 8.601-16.169-2.408-9.289-8.601C-3.099-14.172 6.537-8.601 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(137.27 337.156)"
          />
          <path
            d="M0 0c-.444-8.9-23.677-20.408-25.129-11.697-.66 3.96 1.975 8.329 5.784 11.697z"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(28.913 450)"
          />
          <path
            d="M0 0c1.224-5.3 11.009-1.376 11.009 2.752C11.009 6.881-1.032 4.473 0 0"
            style={{
              fill: "#118d99",
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
            }}
            transform="translate(120.413 304.816)"
          />
        </g>
      </g>
    </svg>
  );
};
