from typing import Literal, List
from .tz import get_date_from_timestamp_cached

WeekDay = Literal[
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
]


week_day_names: List[WeekDay] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]


class TzCalendar(object):
    year: int
    month: int
    day: int
    week_day_index: int
    time_zone: str

    def __init__(self, epoch: int, time_zone: str):
        date = get_date_from_timestamp_cached(epoch=epoch, time_zone=time_zone)

        self.year = date.year
        self.month = date.month
        self.day = date.day
        self.week_day_index = date.weekday()
        self.time_zone = time_zone

    def get_week_day_name(self) -> WeekDay:
        return week_day_names[self.get_week_day()]

    def get_week_day(self) -> int:
        return self.week_day_index % 7

    def get_date(self) -> str:
        return "%d-%02d-%02d" % (self.year, self.month, self.day)

    @classmethod
    def days_in_month(cls, year: int, month: int) -> int:
        if month == 2 and cls.is_leap_year(year):
            return 29

        return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]

    @classmethod
    def is_leap_year(cls, year: int) -> bool:
        return year % 400 == 0 if year % 100 == 0 else year % 4 == 0

    def add_days(self, days: int = 1):
        days_in_month = self.days_in_month(self.year, self.month)

        # should we change month?
        if self.day + days > days_in_month:
            days_consumed = days_in_month - self.day + 1
            self.day = 1

            # should we change year?
            if self.month == 12:
                self.month = 1
                self.year += 1
            else:
                self.month += 1

            self.week_day_index += days_consumed
            self.add_days(days - days_consumed)

        else:
            self.week_day_index += days
            self.day += days
