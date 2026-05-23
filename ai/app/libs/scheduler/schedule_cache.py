from typing import Dict, List, Optional

from app.types import WeeklySchedule
from .scheduler_types import SchedulerAvailableTimeBlock
from .calendar import TzCalendar


class ScheduleCache:
    def __init__(self, calendar: TzCalendar):
        self.time_blocks: List[SchedulerAvailableTimeBlock] = []
        self.calendar: TzCalendar = calendar

    def append(self, time_block: SchedulerAvailableTimeBlock):
        self.time_blocks.append(time_block)

    def extend(self, time_blocks: List[SchedulerAvailableTimeBlock]):
        self.time_blocks.extend(time_blocks)


class ScheduleCacheRepository:
    def __init__(self):
        self.repository: Dict(int, ScheduleCache) = {}

    def flush(self):
        self.repository: Dict(int, ScheduleCache) = {}

    def get(
        self, weekly_schedule: WeeklySchedule, start_time: int, time_zone: str
    ) -> Optional[ScheduleCache]:
        cache_hash = hash((weekly_schedule.hash, start_time, time_zone))
        if cache_hash in self.repository:
            return self.repository[cache_hash]
        return None

    def create(
        self,
        weekly_schedule: WeeklySchedule,
        start_time: int,
        time_zone: str,
        calendar: TzCalendar,
    ) -> ScheduleCache:
        cache = self.repository[
            hash((weekly_schedule.hash, start_time, time_zone))
        ] = ScheduleCache(calendar=calendar)

        return cache


schedule_cache = ScheduleCacheRepository()
