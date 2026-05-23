import {
  parsedTimeToMilitaryTime,
  parseTime,
  formatToLocalTime,
} from "../time";

describe("parseTime", () => {
  it("parses military time", () => {
    expect(parseTime("08:00")).toEqual([8, 0]);
    expect(parseTime("12:00")).toEqual([12, 0]);
    expect(parseTime("01:01")).toEqual([1, 1]);
    expect(parseTime("23:00")).toEqual([23, 0]);
    expect(parseTime("00:00")).toEqual([0, 0]);
    expect(parseTime("00")).toEqual([0, 0]);
    expect(parseTime("0")).toEqual([0, 0]);
    expect(parseTime("12")).toEqual([12, 0]);
  });

  it("parses am/pm time", () => {
    expect(parseTime("08:32 pm")).toEqual([20, 32]);
    expect(parseTime("08:02 am")).toEqual([8, 2]);
    expect(parseTime("12 pm")).toEqual([12, 0]);
    expect(parseTime("1 pm")).toEqual([13, 0]);

    // without space
    expect(parseTime("08:3pm")).toEqual([20, 3]);
    expect(parseTime("08:52am")).toEqual([8, 52]);
    expect(parseTime("12pm")).toEqual([12, 0]);
    expect(parseTime("1pm")).toEqual([13, 0]);
    expect(parseTime("1:00 pm")).toEqual([13, 0]);
    expect(parseTime("5:00 pm")).toEqual([17, 0]);
    expect(parseTime("")).toEqual([0, 0]);
  });

  it("fixes bad AM/PM time", () => {
    expect(parseTime("13 am")).toEqual([13, 0]);
    expect(parseTime("13 pm")).toEqual([13, 0]);
  });
});
describe("parsedTimeToMilitaryTime", () => {
  it("parses all times", () => {
    expect(parsedTimeToMilitaryTime("13 pm")).toEqual("13:00");
    expect(parsedTimeToMilitaryTime("1 pm")).toEqual("13:00");
    expect(parsedTimeToMilitaryTime("1:30 am")).toEqual("01:30");
    expect(parsedTimeToMilitaryTime("1")).toEqual("01:00");
  });
});
describe("transformToTime", () => {
  it("captures times and returns it AM/PM formated", () => {
    expect(formatToLocalTime("13 am")).toEqual("1:00 PM");
    expect(formatToLocalTime("3 am")).toEqual("3:00 AM");
    expect(formatToLocalTime("3 pm")).toEqual("3:00 PM");
    expect(formatToLocalTime("3:01 pm")).toEqual("3:01 PM");
    expect(formatToLocalTime("16:00")).toEqual("4:00 PM");
  });
});
