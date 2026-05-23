import { usePageTitle } from "hooks/usePageTitle";
import { snakeCase } from "lodash";
import React, { useState } from "react";
import "./LogoGenerator.css";

export const LogoGenerator: React.FC = () => {
  usePageTitle("Logo Generator");
  const [side, setSide] = useState(600);
  const [circleRadius, setCircleRadius] = useState(40);
  const [centerCircleRatio, setCenterCircleRatio] = useState(1.0);
  const [armThickness, setArmThickness] = useState(40);

  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [bgColor, setBgColor] = useState("bg-white");
  const [centerColor, setCenterColor] = useState("#D1D5DB");
  const [topLeftColor, setTopLeftColor] = useState("#EF4444");
  const [bottomLeftColor, setBottomLeftColor] = useState("#10B981");
  const [rightColor, setRightColor] = useState("#EAB308");

  const [armDistanceRatio, setArmDistanceRatio] = useState(0.4);
  const [circleDistanceRatio, setCircleDistanceRatio] = useState(0.4);
  const [insideArmLengthRatio, setInsideArmLengthRatio] = useState(0.28);
  const [outsideArmLengthRatio, setOutsideArmLengthRatio] = useState(0.35);
  const [circleOuterRadiusRatio, setCircleOuterRadiusRatio] = useState(1.2);

  const circleDistance = side * circleDistanceRatio;
  const armDistance = side * armDistanceRatio;

  const insideArmLength = side * insideArmLengthRatio;
  const outsideArmLength = side * outsideArmLengthRatio;

  const circleOuterRadius = circleRadius * circleOuterRadiusRatio;

  const centerX = side / 2 + offsetX;
  const centerY = side / 2 + offsetY;

  const POI = {
    center: { x: centerX, y: centerY },
    topLeft: {
      x: centerX + Math.cos((Math.PI * 2) / 3) * circleDistance,
      y: centerY - Math.sin((Math.PI * 2) / 3) * circleDistance,
    },
    bottomLeft: {
      x: centerX + Math.cos((Math.PI * 4) / 3) * circleDistance,
      y: centerY - Math.sin((Math.PI * 4) / 3) * circleDistance,
    },
    right: {
      x: centerX + circleDistance,
      y: centerY,
    },
    armTopLeft: {
      x: centerX + Math.cos((Math.PI * 2) / 3) * armDistance,
      y: centerY - Math.sin((Math.PI * 2) / 3) * armDistance,
    },
    armBottomLeft: {
      x: centerX + Math.cos((Math.PI * 4) / 3) * armDistance,
      y: centerY - Math.sin((Math.PI * 4) / 3) * armDistance,
    },
    armRight: {
      x: centerX + armDistance,
      y: centerY,
    },
  };

  const colors = {
    center: centerColor,
    topLeft: topLeftColor,
    bottomLeft: bottomLeftColor,
    right: rightColor,
  };

  const getBranch = (
    angle: number,
    center: { x: number; y: number },
    length: number
  ): string => {
    const offset = armThickness / 2;
    const radius = offset;

    const A = {
      x: center.x + Math.cos(angle + Math.PI / 2) * offset,
      y: center.y - Math.sin(angle + Math.PI / 2) * offset,
    };

    const B = {
      x: center.x + Math.cos(angle - Math.PI / 2) * offset,
      y: center.y - Math.sin(angle - Math.PI / 2) * offset,
    };

    const C = {
      x: B.x + Math.cos(angle) * length,
      y: B.y - Math.sin(angle) * length,
    };

    const D = {
      x: A.x + Math.cos(angle) * length,
      y: A.y - Math.sin(angle) * length,
    };

    return `M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} A ${radius} ${radius} 0 0 0 ${D.x} ${D.y} Z`;
  };

  function download() {
    const svgHtml = document.getElementById("svg-icon")!.innerHTML;
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(svgHtml)
    );

    const el = document.getElementById("bg-color") as HTMLSelectElement;
    let color = "transparent";
    if (el) {
      color = el.options[el.selectedIndex].innerHTML;
    }

    element.setAttribute(
      "download",
      `orcha-logo-${side}x${side}-${snakeCase(color)}.svg`
    );

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  return (
    <div className="flex flex-row space-x-3">
      <div>
        <div style={{ width: "600px", height: "600px" }}>
          <div
            style={{ width: "600px", height: "600px" }}
            className="canvas fixed flex flex-none items-center justify-center"
          >
            <div id="svg-icon">
              <svg
                width={side}
                height={side}
                viewBox={`0 0 ${side} ${side}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask id="center-circle-mask">
                  <rect x="0" y="0" width={side} height={side} fill="white" />
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={circleOuterRadius * centerCircleRatio}
                    fill="black"
                  />
                  <circle
                    cx={POI.topLeft.x}
                    cy={POI.topLeft.y}
                    r={circleOuterRadius}
                    fill="black"
                  />
                  <circle
                    cx={POI.bottomLeft.x}
                    cy={POI.bottomLeft.y}
                    r={circleOuterRadius}
                    fill="black"
                  />
                  <circle
                    cx={POI.right.x}
                    cy={POI.right.y}
                    r={circleOuterRadius}
                    fill="black"
                  />
                </mask>
                <rect x="0" y="0" width={side} height={side} fill={bgColor} />

                <circle
                  cx={centerX}
                  cy={centerY}
                  r={circleRadius * centerCircleRatio}
                  fill={colors.center}
                />
                <circle
                  cx={POI.topLeft.x}
                  cy={POI.topLeft.y}
                  r={circleRadius}
                  fill={colors.topLeft}
                />
                <circle
                  cx={POI.bottomLeft.x}
                  cy={POI.bottomLeft.y}
                  r={circleRadius}
                  fill={colors.bottomLeft}
                />
                <circle
                  cx={POI.right.x}
                  cy={POI.right.y}
                  r={circleRadius}
                  fill={colors.right}
                />
                <path
                  mask="url(#center-circle-mask)"
                  rx={armThickness / 2}
                  fill={colors.center}
                  d={getBranch((Math.PI * 2) / 3, POI.center, insideArmLength)}
                />
                <path
                  mask="url(#center-circle-mask)"
                  rx={armThickness / 2}
                  fill={colors.center}
                  d={getBranch((Math.PI * 4) / 3, POI.center, insideArmLength)}
                />
                <path
                  mask="url(#center-circle-mask)"
                  rx={armThickness / 2}
                  fill={colors.center}
                  d={getBranch(0, POI.center, insideArmLength)}
                />
                <path
                  mask="url(#center-circle-mask)"
                  rx={armThickness / 2}
                  fill={colors.topLeft}
                  d={getBranch(0, POI.armTopLeft, outsideArmLength)}
                />
                <path
                  mask="url(#center-circle-mask)"
                  rx={armThickness / 2}
                  fill={colors.topLeft}
                  d={getBranch(
                    (Math.PI * 4) / 3,
                    POI.armTopLeft,
                    outsideArmLength
                  )}
                />

                <path
                  mask="url(#center-circle-mask)"
                  rx={armThickness / 2}
                  fill={colors.bottomLeft}
                  d={getBranch(
                    (Math.PI * 2) / 3,
                    POI.armBottomLeft,
                    outsideArmLength
                  )}
                />
                <path
                  mask="url(#center-circle-mask)"
                  rx={armThickness / 2}
                  fill={colors.bottomLeft}
                  d={getBranch(0, POI.armBottomLeft, outsideArmLength)}
                />
                <path
                  mask="url(#center-circle-mask)"
                  rx={armThickness / 2}
                  fill={colors.right}
                  d={getBranch(
                    (Math.PI * 4) / 3,
                    POI.armRight,
                    outsideArmLength
                  )}
                />
                <path
                  mask="url(#center-circle-mask)"
                  rx={armThickness / 2}
                  fill={colors.right}
                  d={getBranch(
                    (Math.PI * 2) / 3,
                    POI.armRight,
                    outsideArmLength
                  )}
                />
              </svg>
            </div>
            <div className="absolute left-0 mt-6" style={{ bottom: "-60px" }}>
              <button
                className="rounded bg-brand-600 px-3 py-2 text-white shadow hover:bg-brand-500"
                onClick={download}
              >
                download image
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex-grow">
        <h2 className="mb-2 text-lg text-gray-700">Dimensions</h2>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Side size:</div>
            <div className="text-sm text-gray-500">{side}px</div>
          </label>
          <div>
            <input
              type="range"
              min="50"
              max="800"
              value={side}
              onChange={(event) => setSide(parseInt(event.target.value, 10))}
              className="form-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Offset X:</div>
            <div className="text-sm text-gray-500">{offsetX}px</div>
          </label>
          <div>
            <input
              type="range"
              min="-50"
              max="50"
              value={offsetX}
              onChange={(event) => setOffsetX(parseInt(event.target.value, 10))}
              className="form-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Offset Y:</div>
            <div className="text-sm text-gray-500">{offsetY}px</div>
          </label>
          <div>
            <input
              type="range"
              min="-50"
              max="50"
              value={offsetY}
              onChange={(event) => setOffsetY(parseInt(event.target.value, 10))}
              className="form-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Circle Radius:</div>
            <div className="text-sm text-gray-500">{circleRadius}px</div>
          </label>
          <div>
            <input
              type="range"
              min="2"
              max="100"
              value={circleRadius}
              onChange={(event) =>
                setCircleRadius(parseInt(event.target.value, 10))
              }
              className="form-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Center Circle Ratio:</div>
            <div className="text-sm text-gray-500">
              {Math.round(centerCircleRatio * circleRadius)}px
            </div>
          </label>
          <div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={centerCircleRatio}
              onChange={(event) =>
                setCenterCircleRatio(parseFloat(event.target.value))
              }
              className="form-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Arm Thickness:</div>
            <div className="text-sm text-gray-500">{armThickness}px</div>
          </label>
          <div>
            <input
              type="range"
              min="2"
              max="100"
              value={armThickness}
              onChange={(event) =>
                setArmThickness(parseInt(event.target.value, 10))
              }
              className="form-input w-full"
            />
          </div>
        </div>

        <h2 className="mt-6 mb-2 text-lg text-gray-700">Ratios</h2>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Outside Circles position radius:</div>
            <div className="text-sm text-gray-500">{circleDistanceRatio}x</div>
          </label>
          <div>
            <input
              type="range"
              min={0.0}
              max={1.0}
              step=".002"
              value={circleDistanceRatio}
              onChange={(event) =>
                setCircleDistanceRatio(parseFloat(event.target.value))
              }
              className="form-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Outside Arms position radius:</div>
            <div className="text-sm text-gray-500">{armDistanceRatio}x</div>
          </label>
          <div>
            <input
              type="range"
              min={0.0}
              max={1.0}
              step=".002"
              value={armDistanceRatio}
              onChange={(event) =>
                setArmDistanceRatio(parseFloat(event.target.value))
              }
              className="form-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Outer circle exclusion radius:</div>
            <div className="text-sm text-gray-500">
              {circleOuterRadiusRatio}x
            </div>
          </label>
          <div>
            <input
              type="range"
              min={1.0}
              max={2}
              step=".002"
              value={circleOuterRadiusRatio}
              onChange={(event) =>
                setCircleOuterRadiusRatio(parseFloat(event.target.value))
              }
              className="form-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Inside arms length:</div>
            <div className="text-sm text-gray-500">{insideArmLengthRatio}x</div>
          </label>
          <div>
            <input
              type="range"
              min={0.0}
              max={1.0}
              step=".002"
              value={insideArmLengthRatio}
              onChange={(event) =>
                setInsideArmLengthRatio(parseFloat(event.target.value))
              }
              className="form-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 flex flex-row justify-between text-gray-700">
            <div>Outside arms length:</div>
            <div className="text-sm text-gray-500">
              {outsideArmLengthRatio}x
            </div>
          </label>
          <div>
            <input
              type="range"
              min={0.0}
              max={1.0}
              step=".002"
              value={outsideArmLengthRatio}
              onChange={(event) =>
                setOutsideArmLengthRatio(parseFloat(event.target.value))
              }
              className="form-input w-full"
            />
          </div>
        </div>

        <h2 className="text-lg text-gray-700">Colors</h2>
        <div className="grid grid-cols-2">
          <div className="col-span-1 mt-4">
            <label className="mb-1 flex flex-row justify-between text-gray-700">
              <div>Background</div>
            </label>
            <div>
              <select
                className="form-select"
                id="bg-color"
                value={bgColor}
                onChange={(event) => setBgColor(event.target.value)}
              >
                <option value="transparent">Transparent</option>
                <option value="#ffffff">White</option>
                <option value="#374151">Dark Grey</option>
                <option value="#F3F4F6">Light Grey</option>
                <option value="#2b6cb0">Dark Brand Color</option>
                <option value="#ebf8ff">Light Brand Color</option>
              </select>
            </div>
          </div>

          <div className="col-span-1 mt-4">
            <label className="mb-1 flex flex-row justify-between text-gray-700">
              <div>Color 1:</div>
            </label>
            <div>
              <select
                className="form-select"
                value={centerColor}
                onChange={(event) => setCenterColor(event.target.value)}
              >
                <option value="transparent">None</option>
                <option value="#E5E7EB">Light Grey</option>
                <option value="#D1D5DB">Grey</option>
                <option value="#9CA3AF">Dark Grey</option>
                <option value="#3B82F6">Blue</option>
                <option value="#EF4444">Red</option>
                <option value="#10B981">Green</option>
                <option value="#EAB308">Yellow</option>
              </select>
            </div>
          </div>

          <div className="col-span-1 mt-4">
            <label className="mb-1 flex flex-row justify-between text-gray-700">
              <div>Top Color:</div>
            </label>
            <div>
              <select
                className="form-select"
                value={topLeftColor}
                onChange={(event) => setTopLeftColor(event.target.value)}
              >
                <option value="transparent">None</option>
                <option value="#E5E7EB">Light Grey</option>
                <option value="#D1D5DB">Grey</option>
                <option value="#9CA3AF">Dark Grey</option>
                <option value="#3B82F6">Blue</option>
                <option value="#EF4444">Red</option>
                <option value="#10B981">Green</option>
                <option value="#EAB308">Yellow</option>
              </select>
            </div>
          </div>

          <div className="col-span-1 mt-4">
            <label className="mb-1 flex flex-row justify-between text-gray-700">
              <div>Bottom Color:</div>
            </label>
            <div>
              <select
                className="form-select"
                value={bottomLeftColor}
                onChange={(event) => setBottomLeftColor(event.target.value)}
              >
                <option value="transparent">None</option>
                <option value="#E5E7EB">Light Grey</option>
                <option value="#D1D5DB">Grey</option>
                <option value="#9CA3AF">Dark Grey</option>
                <option value="#3B82F6">Blue</option>
                <option value="#EF4444">Red</option>
                <option value="#10B981">Green</option>
                <option value="#EAB308">Yellow</option>
              </select>
            </div>
          </div>

          <div className="col-span-1 mt-4">
            <label className="mb-1 flex flex-row justify-between text-gray-700">
              <div>Right Color:</div>
            </label>
            <div>
              <select
                className="form-select"
                value={rightColor}
                onChange={(event) => setRightColor(event.target.value)}
              >
                <option value="transparent">None</option>
                <option value="#E5E7EB">Light Grey</option>
                <option value="#D1D5DB">Grey</option>
                <option value="#9CA3AF">Dark Grey</option>
                <option value="#3B82F6">Blue</option>
                <option value="#EF4444">Red</option>
                <option value="#10B981">Green</option>
                <option value="#EAB308">Yellow</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
