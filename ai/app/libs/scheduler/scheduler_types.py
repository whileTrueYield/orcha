from typing import Tuple


SchedulerBusyTimeBlock = Tuple[
    int,  # start_time
    int,  # stop_time
    str,  # node uid
    int,  # employee_id
]

SchedulerAvailableTimeBlock = Tuple[
    int,  # start_time
    int,  # stop_time
]
