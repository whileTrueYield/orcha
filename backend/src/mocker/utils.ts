import { sample } from "lodash";
import { WorkWeekTime } from "../models/entities";

const colors = [
  "orange",
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "gray",
  "black",
  "lightOrange",
  "lightRed",
  "lightBlue",
  "lightGreen",
  "lightYellow",
  "lightPurple",
  "lightGray",
  "white",
];

export const featureNames = [
  "listing",
  "search",
  "view",
  "edit",
  "integration",
  "api",
  "documentation",
  "DB table",
  "association",
  "deletion",
  "export",
  "reporting",
  "dashboard",
  "alert",
  "notification",
];

export const getRandomColor = () => sample(colors);

export const FULL_TIME_WORK_WEEK: WorkWeekTime = {
  monday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  tuesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  wednesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  thursday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  friday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  saturday: [],
  sunday: [],
};

export const FIRST_HALF_WORK_WEEK: WorkWeekTime = {
  monday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  tuesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  wednesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

export const SECOND_HALF_WORK_WEEK: WorkWeekTime = {
  monday: [],
  tuesday: [],
  wednesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  thursday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  friday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  saturday: [],
  sunday: [],
};

export const WEEK_END_WORK_WEEK: WorkWeekTime = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  sunday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
};
