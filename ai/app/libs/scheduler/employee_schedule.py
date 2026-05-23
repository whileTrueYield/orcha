from typing import Generator, List, Tuple, Union
from app.types import EmployeeTimeOff, WeeklySchedule
from .time_block_generator import time_block_generator
from .scheduler_types import SchedulerAvailableTimeBlock, SchedulerBusyTimeBlock

SchedulerSchedule = List[SchedulerBusyTimeBlock]


class EmployeeSchedule:
    """
    Store and allows for easy interaction with an employee schedule
    """

    transaction_blocks: SchedulerSchedule = []

    def __init__(
        self,
        id: int,
        weekly_schedule: WeeklySchedule,
        time_zone: str,
        start_time: int,
        minimum: int = 60 * 5,
        busy_blocks: SchedulerSchedule = [],
        time_offs: List[EmployeeTimeOff] = [],
    ):
        self.id = id
        self.weekly_schedule: WeeklySchedule = weekly_schedule
        self.time_zone = time_zone
        self.minimum = minimum
        self.busy_blocks = busy_blocks
        self.start_time = start_time
        self.time_offs = time_offs

    def clone(self):
        return EmployeeSchedule(
            self.id,
            self.weekly_schedule,
            self.time_zone,
            self.start_time,
            self.minimum,
            self.busy_blocks,
            self.time_offs,
        )

    def flush(self):
        self.busy_blocks = []

    def gap(self, epoch: int) -> Tuple[int, int]:
        """
        Return the amount of free time between busy task
        """
        schedule = self.get_time_blocks(epoch=epoch)
        until_time = self.busy_blocks[-1][1]
        gap_time = 0
        busy_time = 0

        for time_block_start, time_block_stop, is_busy in schedule:
            if is_busy:
                busy_time += time_block_stop - time_block_start
                continue

            if time_block_start > until_time:
                return gap_time, busy_time

            if time_block_stop > until_time:
                gap_time += until_time - time_block_start
                return gap_time, busy_time

            gap_time += time_block_stop - time_block_start

        return gap_time, busy_time

    def get_blocks_by_uid(self, uid: str) -> SchedulerSchedule:
        """
        Return all the time blocks that are associated with the provided task uid
        """
        buffer_blocks: SchedulerSchedule = []

        for time_block in self.busy_blocks:
            if time_block[2] == uid:
                buffer_blocks.append(time_block)

        return buffer_blocks

    def get_time_blocks(self, epoch) -> Generator[Tuple[int, int, bool], None, None]:
        """
        Generate time blocks as a set starting at epoch.
        The result is a tuple:

            (start_timestamp:int, stop_timestamp:int, is_busy:bool)

        where `is_busy` is True when the time provided is already assigned to a task
        """
        busy_cursor = 0
        avail_block_gen = time_block_generator(
            weekly_schedule=self.weekly_schedule,
            epoch=epoch,
            time_zone=self.time_zone,
            start_time=self.start_time,
            time_offs=self.time_offs,
        )

        time_cursor = epoch

        busy_block_count = len(self.busy_blocks)

        for block_start, block_stop in avail_block_gen:
            # keep moving until we reach a block that includes time_cursor
            if block_stop < time_cursor:
                continue

            # move the busy cursor forward until we reach a busy block that includes time_cursor
            while (
                busy_cursor < busy_block_count
                and self.busy_blocks[busy_cursor][1] < time_cursor
            ):
                busy_cursor += 1

            while time_cursor < block_stop:
                # if we are out of busy blocks
                if busy_cursor >= busy_block_count:
                    yield (
                        max([block_start, time_cursor]),
                        block_stop,
                        False,  # not busy
                    )
                    time_cursor = block_stop
                else:
                    busy_block = self.busy_blocks[busy_cursor]

                    # if there is a busy time block at cursor we move to its end
                    if busy_block[0] <= time_cursor:
                        yield (
                            time_cursor,
                            busy_block[1],
                            True,  # is busy
                        )
                        time_cursor = busy_block[1]
                        busy_cursor += 1

                    # if the busy time block interupt the current free time block
                    # we yield the time fragment and move to the next busy block
                    elif busy_block[0] <= block_stop:
                        time_cursor = max([block_start, time_cursor])
                        # Do not yield an empty busy_block
                        if time_cursor < busy_block[0]:
                            yield (
                                time_cursor,
                                busy_block[0],
                                False,  # not busy
                            )

                        yield (
                            busy_block[0],
                            busy_block[1],
                            True,  # is busy
                        )

                        time_cursor = busy_block[1]
                        busy_cursor += 1

                    # Finally we are not interrupted by any busy block
                    else:
                        yield (
                            max([block_start, time_cursor]),
                            block_stop,
                            False,  # not busy
                        )
                        time_cursor = block_stop

    def consume(
        self, amount: int, epoch: int, uid: str, fractionable: bool = False
    ) -> SchedulerSchedule:
        """
        Constructs an array of time blocks [(start_epoch, stop_epoch)] to achieve
        the amount of time requested without overlapping with an already scheduled task.

        Note that this method does not commit the changes to the employee schedule,
        you'll have to use the commit_blocks() method for that.
        """
        schedule = self.get_time_blocks(epoch=epoch)

        amount_left = amount
        time_blocks: SchedulerSchedule = []

        for time_block_start, time_block_stop, is_busy in schedule:
            # if we are interrupted by a busy task and the amount in not enough
            # to finish the task, we'll reset the search and keep moving forward
            if is_busy:
                # if the task is not fractionable, we are starting back from scratch
                # to look for a set of uninterrupted blocks
                if not fractionable:
                    amount_left = amount
                    time_blocks = []
                continue

            available_time = time_block_stop - time_block_start

            # we do not consume less than the minimum
            # unless that is more than the amount we need
            if available_time <= self.minimum and available_time <= amount_left:
                continue

            # only consume what we need if there is more available time than needed
            if available_time >= amount_left:
                time_blocks.append(
                    (
                        time_block_start,
                        time_block_start + amount_left,
                        uid,  # node uniq ID
                        self.id,  # employee ID
                    )
                )
                return time_blocks

            # otherwise consume all the available time
            else:
                time_blocks.append((time_block_start, time_block_stop, uid, self.id))
                amount_left = amount_left - available_time

        return time_blocks

    def commit_blocks(self, new_blocks: SchedulerSchedule) -> SchedulerSchedule:
        """
        Merges the provided blocks into the employee's schedule
        """
        buffer_blocks = sorted(self.busy_blocks + new_blocks)

        ## The following loop is a safety check but it never throws and consumes a lot
        ## of resources. It would likely fail if the block generator was to ignore
        ## existing schedule usage which it is not.
        # for index, block in enumerate(buffer_blocks):
        #     if index > 0 and self.is_overlaping(block, buffer_blocks[index - 1]):
        #         raise ValueError(
        #             "Provided schedule blocks values overlap at (%d, %d) and (%d, %d)"
        #             % (
        #                 buffer_blocks[index - 1][0],
        #                 buffer_blocks[index - 1][1],
        #                 block[0],
        #                 block[1],
        #             )
        #         )

        self.busy_blocks = buffer_blocks

        return buffer_blocks

    @classmethod
    def is_overlaping(
        cls,
        block_a: Union[SchedulerAvailableTimeBlock, SchedulerBusyTimeBlock],
        block_b: Union[SchedulerAvailableTimeBlock, SchedulerBusyTimeBlock],
    ) -> bool:
        """
        Check if a time block contains or overlaps with another time block
        """
        return block_a[1] > block_b[0] and block_b[1] > block_a[0]
