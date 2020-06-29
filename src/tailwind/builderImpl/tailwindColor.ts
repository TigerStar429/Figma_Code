import { nearestColorFrom } from "../../nearest-color/nearestColor";
import { nearestValue } from "../conversionTables";
import { rgbTo6hex } from "../../common/rgbToHex";

// retrieve the SOLID color for tailwind
export const tailwindColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
  kind: string
): string => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined
  if (fills && fills !== figma.mixed && fills.length > 0) {
    const fill = fills[0];
    if (fill.type === "SOLID") {
      // don't set text color when color is black (default) and opacity is 100%
      if (
        kind === "text" &&
        fill.color.r === 0.0 &&
        fill.color.g === 0.0 &&
        fill.color.b === 0.0 &&
        fill.opacity === 1.0
      ) {
        return "";
      }

      const hex = rgbTo6hex(fill.color);

      const opacity = fill.opacity ?? 1.0;

      // example: text-opacity-50
      //
      // https://tailwindcss.com/docs/opacity/
      // default is [0, 25, 50, 75, 100]
      // ignore the 100. If opacity was changed, let it be visible.
      const opacityProp =
        opacity !== 1.0
          ? `${kind}-opacity-${nearestValue(opacity * 100, [0, 25, 50, 75])} `
          : "";

      // example: text-red-500
      const colorProp = `${kind}-${getTailwindColor(hex)} `;

      // if fill isn't visible, it shouldn't be painted.
      return fill.visible !== false ? `${colorProp}${opacityProp}` : "";
    }
  }

  return "";
};

export const tailwindColors: Record<string, string> = {
  "#000000": "black",
  "#ffffff": "white",

  "#f7fafc": "gray-100",
  "#edf2f7": "gray-200",
  "#e2e8f0": "gray-300",
  "#cbd5e0": "gray-400",
  "#a0aec0": "gray-500",
  "#718096": "gray-600",
  "#4a5568": "gray-700",
  "#2d3748": "gray-800",
  "#1a202c": "gray-900",

  "#fff5f5": "red-100",
  "#fed7d7": "red-200",
  "#feb2b2": "red-300",
  "#fc8181": "red-400",
  "#f56565": "red-500",
  "#e53e3e": "red-600",
  "#c53030": "red-700",
  "#9b2c2c": "red-800",
  "#742a2a": "red-900",

  "#fffaf0": "orange-100",
  "#feebc8": "orange-200",
  "#fbd38d": "orange-300",
  "#f6ad55": "orange-400",
  "#ed8936": "orange-500",
  "#dd6b20": "orange-600",
  "#c05621": "orange-700",
  "#9c4221": "orange-800",
  "#7b341e": "orange-900",

  "#FFFFF0": "yellow-100",
  "#FEFCBF": "yellow-200",
  "#FAF089": "yellow-300",
  "#F6E05E": "yellow-400",
  "#ECC94B": "yellow-500",
  "#D69E2E": "yellow-600",
  "#B7791F": "yellow-700",
  "#975A16": "yellow-800",
  "#744210": "yellow-900",

  "#F0FFF4": "green-100",
  "#C6F6D5": "green-200",
  "#9AE6B4": "green-300",
  "#68D391": "green-400",
  "#48BB78": "green-500",
  "#38A169": "green-600",
  "#2F855A": "green-700",
  "#276749": "green-800",
  "#22543D": "green-900",

  "#E6FFFA": "teal-100",
  "#B2F5EA": "teal-200",
  "#81E6D9": "teal-300",
  "#4FD1C5": "teal-400",
  "#38B2AC": "teal-500",
  "#319795": "teal-600",
  "#2C7A7B": "teal-700",
  "#285E61": "teal-800",
  "#234E52": "teal-900",

  "#EBF8FF": "blue-100",
  "#BEE3F8": "blue-200",
  "#90CDF4": "blue-300",
  "#63B3ED": "blue-400",
  "#4299E1": "blue-500",
  "#3182CE": "blue-600",
  "#2B6CB0": "blue-700",
  "#2C5282": "blue-800",
  "#2A4365": "blue-900",

  "#EBF4FF": "indigo-100",
  "#C3DAFE": "indigo-200",
  "#A3BFFA": "indigo-300",
  "#7F9CF5": "indigo-400",
  "#667EEA": "indigo-500",
  "#5A67D8": "indigo-600",
  "#4C51BF": "indigo-700",
  "#434190": "indigo-800",
  "#3C366B": "indigo-900",

  "#FAF5FF": "purple-100",
  "#E9D8FD": "purple-200",
  "#D6BCFA": "purple-300",
  "#B794F4": "purple-400",
  "#9F7AEA": "purple-500",
  "#805AD5": "purple-600",
  "#6B46C1": "purple-700",
  "#553C9A": "purple-800",
  "#44337A": "purple-900",

  "#FFF5F7": "pink-100",
  "#FED7E2": "pink-200",
  "#FBB6CE": "pink-300",
  "#F687B3": "pink-400",
  "#ED64A6": "pink-500",
  "#D53F8C": "pink-600",
  "#B83280": "pink-700",
  "#97266D": "pink-800",
  "#702459": "pink-900",
};

export const tailwindNearestColor = nearestColorFrom(
  Object.keys(tailwindColors)
);

export const getTailwindColor = (color: string): string => {
  return tailwindColors[tailwindNearestColor(color)];
};
