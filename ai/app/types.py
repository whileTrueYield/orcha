from typing import List, Optional, Tuple
from pydantic import BaseModel

ScheduleBlock = Tuple[
    str,  # start time, ie. "09:30"
    str,  # stop time, ie. "17:30"
]


class WeeklySchedule(BaseModel):
    monday: Optional[List[ScheduleBlock]] = []
    tuesday: Optional[List[ScheduleBlock]] = []
    wednesday: Optional[List[ScheduleBlock]] = []
    thursday: Optional[List[ScheduleBlock]] = []
    friday: Optional[List[ScheduleBlock]] = []
    saturday: Optional[List[ScheduleBlock]] = []
    sunday: Optional[List[ScheduleBlock]] = []
    hash: str = ""

    def __init__(self, **data):
        super().__init__(**data)
        self.hash = self.__hash__()

    def get_day(self, day: str) -> List[ScheduleBlock]:
        if day in (
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ):
            return self.__dict__[day]
        else:
            raise KeyError(f"Unknow day of the week {day} provided")

    def __hash__(self):
        blocks: List[str] = []
        blocks.append("monday")
        blocks.extend([f"{start}_{stop}" for start, stop in self.monday])
        blocks.append("tuesday")
        blocks.extend([f"{start}_{stop}" for start, stop in self.tuesday])
        blocks.append("wednesday")
        blocks.extend([f"{start}_{stop}" for start, stop in self.wednesday])
        blocks.append("thursday")
        blocks.extend([f"{start}_{stop}" for start, stop in self.thursday])
        blocks.append("friday")
        blocks.extend([f"{start}_{stop}" for start, stop in self.friday])
        blocks.append("saturday")
        blocks.extend([f"{start}_{stop}" for start, stop in self.saturday])
        blocks.append("sunday")
        blocks.extend([f"{start}_{stop}" for start, stop in self.sunday])

        return hash("_".join(blocks))


EmployeeTimeOff = Tuple[int, int]


class EmployeeSchedule(BaseModel):
    id: int
    week: WeeklySchedule
    timezone: str
    time_offs: List[EmployeeTimeOff] = []


class StartedTask(BaseModel):
    uid: str
    employee_id: int
    start_time: int


class Task(BaseModel):
    uid: str
    ancestors: List[str] = []
    deadline: Optional[int] = None
    employee_id: int
    min: int
    max: int
    likely: int
    priority: int = 1
    fractionable: bool = False


class ScheduledContext(BaseModel):
    epoch: int
    schedules: List[EmployeeSchedule]
    tasks: List[Task]
    started: List[StartedTask]


class ScheduleSnapshot(BaseModel):
    uid: str
    employee_id: int
    end: float
    end_min: int
    end_max: int
    end_p50: int
    end_p70: int
    end_p80: int
    end_p90: int
    end_p95: int
    start: float
    start_min: int
    start_max: int
    start_p50: int
    start_p70: int
    start_p80: int
    start_p90: int
    start_p95: int


class ScheduleBusyBlock(BaseModel):
    startTime: int
    stopTime: int
    uid: str
    roleId: int
