import { TzCalendar } from "../calendar";
import expect from "expect";

describe("TzCalendar", () => {
  it("compute date according to UTC string and timezone", () => {
    const losAngelesTzCalendar = new TzCalendar(
      "2021-01-01T00:00:00.000Z",
      "America/Los_Angeles"
    );
    expect(losAngelesTzCalendar.day).toEqual(31);
    expect(losAngelesTzCalendar.month).toEqual(12);
    expect(losAngelesTzCalendar.year).toEqual(2020);

    const parisTzCalendar = new TzCalendar(
      "2021-01-01T00:00:00.000Z",
      "Europe/Paris"
    );
    expect(parisTzCalendar.day).toEqual(1);
    expect(parisTzCalendar.month).toEqual(1);
    expect(parisTzCalendar.year).toEqual(2021);
  });

  it("adds a single day", () => {
    const parisTzCalendar = new TzCalendar(
      "2021-01-01T00:00:00.000Z",
      "Europe/Paris"
    );
    parisTzCalendar.addDays();
    expect(parisTzCalendar.day).toEqual(2);
    expect(parisTzCalendar.month).toEqual(1);
    expect(parisTzCalendar.year).toEqual(2021);
  });

  it("change month upon adding a day", () => {
    const parisTzCalendar = new TzCalendar(
      "2021-01-31T00:00:00.000Z",
      "Europe/Paris"
    );
    parisTzCalendar.addDays();
    expect(parisTzCalendar.day).toEqual(1);
    expect(parisTzCalendar.month).toEqual(2);
    expect(parisTzCalendar.year).toEqual(2021);
  });

  it("manages leap years", () => {
    const losAngelesTzCalendar = new TzCalendar(
      "2020-02-28T10:00:00.000Z",
      "America/Los_Angeles"
    );
    losAngelesTzCalendar.addDays();
    expect(losAngelesTzCalendar.day).toEqual(29);
    expect(losAngelesTzCalendar.month).toEqual(2);
    expect(losAngelesTzCalendar.year).toEqual(2020);

    losAngelesTzCalendar.addDays();
    expect(losAngelesTzCalendar.day).toEqual(1);
    expect(losAngelesTzCalendar.month).toEqual(3);
    expect(losAngelesTzCalendar.year).toEqual(2020);
  });

  it("manages non leap years", () => {
    const losAngelesTzCalendar = new TzCalendar(
      "1800-02-28T10:00:00.000Z",
      "America/Los_Angeles"
    );
    losAngelesTzCalendar.addDays();
    expect(losAngelesTzCalendar.day).toEqual(1);
    expect(losAngelesTzCalendar.month).toEqual(3);
    expect(losAngelesTzCalendar.year).toEqual(1800);
  });

  it("it adds large number of days", () => {
    const losAngelesTzCalendar = new TzCalendar(
      "2020-02-28T10:00:00.000Z",
      "America/Los_Angeles"
    );
    losAngelesTzCalendar.addDays(900);
    expect(losAngelesTzCalendar.day).toEqual(16);
    expect(losAngelesTzCalendar.month).toEqual(8);
    expect(losAngelesTzCalendar.year).toEqual(2022);
  });

  it("accepts an epoch", () => {
    const losAngelesTzCalendar = new TzCalendar(0, "America/New_York");
    expect(losAngelesTzCalendar.day).toEqual(31);
    expect(losAngelesTzCalendar.month).toEqual(12);
    expect(losAngelesTzCalendar.year).toEqual(1969);
  });

  it("gives the correct week day and name", () => {
    const losAngelesTzCalendar = new TzCalendar(
      "2020-02-28T12:00:00.000Z",
      "America/Los_Angeles"
    );
    expect(losAngelesTzCalendar.getDate()).toEqual("2020-02-28");

    expect(losAngelesTzCalendar.getWeekDayName()).toEqual("friday");
    losAngelesTzCalendar.addDays();
    expect(losAngelesTzCalendar.getWeekDayName()).toEqual("saturday");
    losAngelesTzCalendar.addDays();
    expect(losAngelesTzCalendar.getWeekDayName()).toEqual("sunday");
    losAngelesTzCalendar.addDays();
    expect(losAngelesTzCalendar.getWeekDayName()).toEqual("monday");
    losAngelesTzCalendar.addDays();
    expect(losAngelesTzCalendar.getWeekDayName()).toEqual("tuesday");
    losAngelesTzCalendar.addDays();
    expect(losAngelesTzCalendar.getWeekDayName()).toEqual("wednesday");
    losAngelesTzCalendar.addDays();
    expect(losAngelesTzCalendar.getWeekDayName()).toEqual("thursday");
    losAngelesTzCalendar.addDays();
    expect(losAngelesTzCalendar.getWeekDayName()).toEqual("friday");
    losAngelesTzCalendar.addDays();

    losAngelesTzCalendar.addDays(900);

    expect(losAngelesTzCalendar.getDate()).toEqual("2022-08-24");
    expect(losAngelesTzCalendar.getWeekDayName()).toEqual("wednesday");
  });
});
