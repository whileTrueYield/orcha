from app.types import WeeklySchedule

WORK_WEEK = WeeklySchedule(
    monday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
    tuesday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
    wednesday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
    thursday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
    friday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
)


PART_TIME_HALF_DAY_MORNING = WeeklySchedule(
    monday=[
        ("08:00", "12:00"),
    ],
    tuesday=[
        ("08:00", "12:00"),
    ],
    wednesday=[
        ("08:00", "12:00"),
    ],
    thursday=[
        ("08:00", "12:00"),
    ],
    friday=[
        ("08:00", "12:00"),
    ],
)

PART_TIME_HALF_DAY_AFTERNOON = WeeklySchedule(
    monday=[
        ("13:00", "17:00"),
    ],
    tuesday=[
        ("13:00", "17:00"),
    ],
    wednesday=[
        ("13:00", "17:00"),
    ],
    thursday=[
        ("13:00", "17:00"),
    ],
    friday=[
        ("13:00", "17:00"),
    ],
)


PART_TIME_EARLY_WEEK = WeeklySchedule(
    monday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
    tuesday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
    wednesday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
)

PART_TIME_LATE_WEEK = WeeklySchedule(
    wednesday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
    thursday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
    friday=[
        ("08:00", "12:00"),
        ("13:00", "17:00"),
    ],
)

PART_TIME_WEEK_END = WeeklySchedule(
    saturday=[
        ("08:00", "12:00"),
        ("13:00", "19:00"),
    ],
    sunday=[
        ("08:00", "12:00"),
        ("13:00", "19:00"),
    ],
)

ALL_WEEKS = [
    WORK_WEEK,
    PART_TIME_EARLY_WEEK,
    PART_TIME_LATE_WEEK,
    PART_TIME_HALF_DAY_AFTERNOON,
    PART_TIME_HALF_DAY_MORNING,
    PART_TIME_WEEK_END,
]
