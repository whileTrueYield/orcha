export interface WeeklyCalendarItem {
  startTime: string;
  stopTime: string;
  startEpoch: number;
  stopEpoch: number;
  dayOfTheWeek: string;
  title?: string;
}
