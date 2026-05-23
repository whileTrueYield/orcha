import { get, round } from "lodash";

const unitRe = /(m|h)/i;
const quantityRe = /((\d| |^)+\.\d+|\d+)/;

const MINUTE = 60;
const HOUR = MINUTE * 60;

const unitConversionRate = {
  m: MINUTE,
  h: HOUR,
};

/**
 * Convert a human readable time 1h, 30m into seconds
 * @param value human readable time e.g. 1h, 30m
 * @returns duration in seconds
 */
export const timeParser = (value: string): number => {
  const units = unitRe.exec(value);

  // default to hour
  const unit = units?.length ? units[1].toLowerCase() : "h";

  // we remove commas
  const quantities = quantityRe.exec(value.replace(/(,)/g, ""));
  const quantity = quantities?.length ? parseFloat(quantities[0]) : 0;

  return get(unitConversionRate, unit, unitConversionRate["h"]) * quantity;
};

export const timeFormater = (value?: number | null): string => {
  if (!value || isNaN(value) || value <= 0) {
    return "0h";
  }

  // we only want hours and minute precision, since we
  // cannot assume a work week to be a set number of hours
  if (value >= HOUR) {
    return round(value / HOUR, 2) + "h";
  }

  return round(value / MINUTE, 2) + "m";
};
