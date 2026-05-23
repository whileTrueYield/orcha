import { PaginationURL } from "types";
import { get } from "lodash";

export const defaultPagination: PaginationURL = {
  page: 0,
  pageSize: 10,
  sortDirection: "ASC",
  sortBy: "createdAt",
};

export const AppUri = window.location.origin;
export const ApiUri = import.meta.env.VITE_API_URI!;
export const GraphQLUri = import.meta.env.VITE_GRAPHQL_URI!;
export const UploadCdnUri = import.meta.env.VITE_UPLOAD_CDN_URI;

// The default delay a notification stays visible
// before it auto-disapear
const DEFAULT_NOTIFICATION_DELAY = 1;
export const NOTIFICATION_DELAYS = {
  Info: DEFAULT_NOTIFICATION_DELAY * 2,
  Success: DEFAULT_NOTIFICATION_DELAY,
  Warning: DEFAULT_NOTIFICATION_DELAY * 4,
  Error: DEFAULT_NOTIFICATION_DELAY * 8,
  Version: DEFAULT_NOTIFICATION_DELAY * 8,
};

interface ColorDefinition {
  name: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface ColorSet {
  [colorName: string]: ColorDefinition;
}

export const COLORS: ColorSet = {
  orange: {
    name: "Orange",
    bgColor: "bg-orange-500",
    textColor: "text-orange-50",
    borderColor: "border-orange-700",
  },
  red: {
    name: "Red",
    bgColor: "bg-red-500",
    textColor: "text-red-50",
    borderColor: "border-red-700",
  },
  blue: {
    name: "Blue",
    bgColor: "bg-brand-500",
    textColor: "text-brand-50",
    borderColor: "border-brand-700",
  },
  green: {
    name: "Green",
    bgColor: "bg-green-500",
    textColor: "text-green-50",
    borderColor: "border-green-700",
  },
  yellow: {
    name: "Yellow",
    bgColor: "bg-yellow-400",
    textColor: "text-white",
    borderColor: "border-yellow-700",
  },
  purple: {
    name: "Purple",
    bgColor: "bg-purple-500",
    textColor: "text-purple-50",
    borderColor: "border-purple-700",
  },
  gray: {
    name: "Gray",
    bgColor: "bg-gray-500",
    textColor: "text-gray-50",
    borderColor: "border-gray-700",
  },
  black: {
    name: "Black",
    bgColor: "bg-gray-800",
    textColor: "text-gray-100",
    borderColor: "border-black",
  },
  lightOrange: {
    name: "Light Orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-500",
  },
  lightRed: {
    name: "Light Red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-500",
  },
  lightBlue: {
    name: "Light Blue",
    bgColor: "bg-brand-100",
    textColor: "text-brand-800",
    borderColor: "border-brand-500",
  },
  lightGreen: {
    name: "Light Green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-500",
  },
  lightYellow: {
    name: "Light Yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-700",
  },
  lightPurple: {
    name: "Light Purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    borderColor: "border-purple-500",
  },
  lightGray: {
    name: "Light Gray",
    bgColor: "bg-gray-200",
    textColor: "text-gray-800",
    borderColor: "border-gray-600",
  },

  white: {
    name: "White",
    bgColor: "bg-white",
    textColor: "text-gray-600",
    borderColor: "border-gray-400",
  },
};

const DEFAULT_COLOR = {
  name: "Light Gray",
  bgColor: "bg-gray-200",
  textColor: "text-gray-500",
  borderColor: "border-gray-600",
};

export const getColor = (colorCode?: string): ColorDefinition => {
  if (colorCode) {
    return get(COLORS, colorCode, DEFAULT_COLOR);
  }
  return DEFAULT_COLOR;
};

export const colorNames = Object.keys(COLORS);
