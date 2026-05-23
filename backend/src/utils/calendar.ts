import { format, utcToZonedTime } from "date-fns-tz";

export type WeekDays =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export class TzCalendar {
  year: number;
  month: number;
  day: number;
  weekDayIndex: number;
  timeZone: string;

  daysOfTheWeek: WeekDays[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  constructor(date: string | number, timeZone: string) {
    const dateStr = format(
      utcToZonedTime(new Date(date), timeZone),
      "u-M-d-i",
      {
        timeZone,
      }
    );

    const [year, month, day, weekDay] = dateStr.split("-");

    this.timeZone = timeZone;
    this.year = parseInt(year, 10);
    this.month = parseInt(month, 10);
    this.day = parseInt(day, 10);
    this.weekDayIndex = parseInt(weekDay, 10) - 1;
  }

  /**
   * Return the name of the current day, like "monday", "wednesday"...
   * @returns
   */
  getWeekDayName(): WeekDays {
    return this.daysOfTheWeek[this.getWeekDay()];
  }

  /**
   * Return the number value of the current day, between 0 and 6
   * 0 being monday, 6 being sunday
   * @returns
   */
  getWeekDay(): number {
    return this.weekDayIndex % 7;
  }

  /**
   * Get the date part of the current datetime (the time is not part of it) in
   * ISO format
   *
   * This can be used to construct a full ISO DateTime string
   */
  getDate(): string {
    return `${this.year}-${this.month.toString().padStart(2, "0")}-${this.day
      .toString()
      .padStart(2, "0")}`;
  }

  /**
   * Add a number of days to the current day
   * @param days
   */
  addDays(days: number = 1) {
    const daysInMonth = this.daysInMonth();
    if (this.day + days > daysInMonth) {
      const daysConsummed = daysInMonth - this.day + 1;
      this.day = 1;

      // should we change year
      if (this.month === 12) {
        this.month = 1;
        this.year++;
      } else {
        this.month++;
      }

      this.weekDayIndex += daysConsummed;
      this.addDays(days - daysConsummed);
    } else {
      this.weekDayIndex += days;
      this.day += days;
    }
  }

  /**
   * Return the number of days in current month
   */
  private daysInMonth(): number {
    if (this.month === 2 && this.isLeapYear(this.year)) {
      return 29;
    }

    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][this.month - 1];
  }

  /**
   * Return true if the current day is a leap year
   */
  isLeapYear(year: number): boolean {
    return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
  }
}
