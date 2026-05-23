from .calendar import TzCalendar


def test_compute_date_according_to_utc_time():
    calendar = TzCalendar(1609459200, "America/Los_Angeles")

    assert calendar.day == 31
    assert calendar.month == 12
    assert calendar.year == 2020

    calendar = TzCalendar(1609459200, "Europe/Paris")
    assert calendar.day == 1
    assert calendar.month == 1
    assert calendar.year == 2021


def test_add_a_single_day():
    paris_tz_calendar = TzCalendar(1609459200, "Europe/Paris")
    paris_tz_calendar.add_days()

    assert paris_tz_calendar.day == 2
    assert paris_tz_calendar.month == 1
    assert paris_tz_calendar.year == 2021


def test_change_month_upon_add_a_day():
    paris_tz_calendar = TzCalendar(1612051200, "Europe/Paris")

    paris_tz_calendar.add_days()
    assert paris_tz_calendar.day == 1
    assert paris_tz_calendar.month == 2
    assert paris_tz_calendar.year == 2021


def test_feb_on_leap_year():
    los_angeles_tz_calendar = TzCalendar(1582884000, "America/Los_Angeles")

    los_angeles_tz_calendar.add_days()
    assert los_angeles_tz_calendar.day == 29
    assert los_angeles_tz_calendar.month == 2
    assert los_angeles_tz_calendar.year == 2020

    los_angeles_tz_calendar.add_days()
    assert los_angeles_tz_calendar.day == 1
    assert los_angeles_tz_calendar.month == 3
    assert los_angeles_tz_calendar.year == 2020


def test_feb_on_non_leap_year():
    los_angeles_tz_calendar = TzCalendar(-5359615200, "America/Los_Angeles")

    los_angeles_tz_calendar.add_days()
    assert los_angeles_tz_calendar.day == 1
    assert los_angeles_tz_calendar.month == 3
    assert los_angeles_tz_calendar.year == 1800


def test_adds_large_number_of_days():
    los_angeles_tz_calendar = TzCalendar(1582884000, "America/Los_Angeles")

    los_angeles_tz_calendar.add_days(900)
    assert los_angeles_tz_calendar.day == 16
    assert los_angeles_tz_calendar.month == 8
    assert los_angeles_tz_calendar.year == 2022


def test_gives_correct_week_day():
    los_angeles_tz_calendar = TzCalendar(1582891200, "America/Los_Angeles")

    assert los_angeles_tz_calendar.get_date() == "2020-02-28"
    assert los_angeles_tz_calendar.get_week_day_name() == "friday"

    los_angeles_tz_calendar.add_days()
    assert los_angeles_tz_calendar.get_week_day_name() == "saturday"

    los_angeles_tz_calendar.add_days()
    assert los_angeles_tz_calendar.get_week_day_name() == "sunday"

    los_angeles_tz_calendar.add_days()
    assert los_angeles_tz_calendar.get_week_day_name() == "monday"

    los_angeles_tz_calendar.add_days()
    assert los_angeles_tz_calendar.get_week_day_name() == "tuesday"

    los_angeles_tz_calendar.add_days()
    assert los_angeles_tz_calendar.get_week_day_name() == "wednesday"

    los_angeles_tz_calendar.add_days()
    assert los_angeles_tz_calendar.get_week_day_name() == "thursday"

    los_angeles_tz_calendar.add_days()
    assert los_angeles_tz_calendar.get_week_day_name() == "friday"

    los_angeles_tz_calendar.add_days(900)
    assert los_angeles_tz_calendar.get_date() == "2022-08-23"
    assert los_angeles_tz_calendar.get_week_day_name() == "tuesday"
