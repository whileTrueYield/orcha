from .scheduler_types import SchedulerAvailableTimeBlock
from typing import Generator, List, Tuple
from app.types import EmployeeTimeOff, WeeklySchedule

from .calendar import TzCalendar
from .tz import get_timestamp_cached
from .schedule_cache import schedule_cache


def time_block_generator(
    weekly_schedule: WeeklySchedule,
    epoch: int,
    time_zone: str,
    start_time: int,
    time_offs: List[EmployeeTimeOff] = [],
) -> Generator[SchedulerAvailableTimeBlock, None, None]:
    """
    Provide timeblock for an individual without accounting for
    any busy block. This is to be used by the scheduler to know
    which time section are available to be occupied by a busy block.
    """
    cache = schedule_cache.get(
        weekly_schedule=weekly_schedule,
        start_time=start_time,
        time_zone=time_zone,
    )

    if cache:
        calendar = cache.calendar
        for block in cache.time_blocks:
            # if the end is af
            if block[1] > epoch:
                if block[0] < epoch:
                    # if start time is before epoch we'll use epoch as
                    # a lower boundary
                    yield (epoch, block[1])
                else:
                    yield block

    else:
        # initialize the timezone aware calendar within the provided timezone
        calendar = TzCalendar(start_time, time_zone)
        cache = schedule_cache.create(
            weekly_schedule=weekly_schedule,
            start_time=start_time,
            time_zone=time_zone,
            calendar=calendar,
        )

    time_offs = sorted(time_offs)
    time_off_cursor = 0

    while True:
        time_blocks_for_cache: List[SchedulerAvailableTimeBlock] = []

        # for every block on that day
        for start, stop in weekly_schedule.get_day(calendar.get_week_day_name()):
            # compute the start time within the calendar timezone
            start_hour, start_minute = start.split(":")
            start_epoch = get_timestamp_cached(
                calendar.year,
                calendar.month,
                calendar.day,
                int(start_hour),
                int(start_minute),
                time_zone=time_zone,
            )

            stop_hour, stop_minute = stop.split(":")
            stop_epoch = get_timestamp_cached(
                calendar.year,
                calendar.month,
                calendar.day,
                int(stop_hour),
                int(stop_minute),
                time_zone=time_zone,
            )

            # Here we handle interraction between time offs the current time block.
            # Time offs can delete a time block, reduce it or split it into multiple time blocks
            time_blocks: List[Tuple[int, int]] = []
            while time_off_cursor < len(time_offs):
                time_off_start, time_off_stop = time_offs[time_off_cursor]

                # if the time off is in the past, move to the next time off
                if time_off_stop < start_epoch:
                    time_off_cursor = time_off_cursor + 1

                # time off is past the time block we are done
                elif time_off_start > stop_epoch:
                    time_blocks.append((start_epoch, stop_epoch))
                    break

                # time off overlaps on left, the start is shifted to the end of the timeoff
                elif time_off_start < start_epoch and time_off_stop < stop_epoch:
                    start_epoch = time_off_stop
                    time_off_cursor += 1

                # time off is inside the time block and splits it
                elif time_off_start > start_epoch and time_off_stop < stop_epoch:
                    time_blocks.append((start_epoch, time_off_start))
                    start_epoch = time_off_stop
                    time_off_cursor += 1

                # time off overlaps on the right, stop is shifted at the begining of the timeoff
                elif time_off_start > start_epoch and time_off_stop > stop_epoch:
                    time_blocks.append((start_epoch, time_off_start))
                    break

                # time off overlaps the entire timeblock, no time block generated
                else:
                    break

            # there is no more timeoff block to iterate over
            else:
                time_blocks.append((start_epoch, stop_epoch))

            time_blocks_for_cache.extend(time_blocks)
            for start_epoch, stop_epoch in time_blocks:
                # we can truncate the time block if the provided epoch
                # cuts in the middle of a time block
                if start_epoch <= epoch <= stop_epoch:
                    yield (epoch, stop_epoch)
                elif start_epoch > epoch:
                    yield (start_epoch, stop_epoch)

        # move to next day
        calendar.add_days()
        cache.extend(time_blocks=time_blocks_for_cache)
