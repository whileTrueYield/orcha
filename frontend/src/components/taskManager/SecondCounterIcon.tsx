import React, { useEffect, useState } from "react";

interface SecondCounterIconProps {
  className?: string;
  thickness?: number;
  duration?: number;
  outline?: boolean;
  outlineClassName?: string;
}

const SIDE = 100;

const computePath = (radius: number, duration: number = 60): string => {
  const seconds = new Date().getSeconds();
  const progress = (seconds % duration) / duration;
  const posX = Math.cos(progress * 2 * Math.PI + 0.5 * Math.PI) * radius;
  const posY = Math.sin(progress * 2 * Math.PI + 0.5 * Math.PI) * radius;
  const large = progress < 0.5 ? 0 : 1;

  return `M 50 ${50 - radius} A ${radius} ${radius} 1 ${large} 1 ${50 - posX} ${
    50 - posY
  }`;
};

export const SecondCounterIcon: React.FC<SecondCounterIconProps> = (props) => {
  const thickness = props.thickness || 10;
  const radius = (SIDE - thickness) / 2;
  const { outline, className, outlineClassName, duration } = props;

  const [path, setPath] = useState(computePath(radius, duration));

  useEffect(() => {
    const interval = setInterval(() => {
      setPath(computePath(radius, duration));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [setPath, radius, duration]);

  return (
    <svg className={className} viewBox={`0 0 ${SIDE} ${SIDE}`}>
      <g fill="none" stroke="currentColor">
        {outline ? (
          <circle
            strokeWidth={thickness}
            className={outlineClassName ? outlineClassName : "text-gray-100"}
            cx={SIDE / 2}
            cy={SIDE / 2}
            r={radius}
          />
        ) : null}

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={thickness}
          d={path}
        />
      </g>
    </svg>
  );
};
