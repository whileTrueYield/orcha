from typing import List

from tqdm.std import tqdm
from .mcts_scheduler import MctsScheduler
from app.types import Task
from .employee_schedule import EmployeeSchedule
from .schedule import Schedule
from .constants_for_tests import WORK_WEEK


def profile_mcts():
    epoch = 1627311600
    john = EmployeeSchedule(
        id="1",
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    jane = EmployeeSchedule(
        id="2",
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    bill = EmployeeSchedule(
        id="3",
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    schedule = Schedule([john, jane, bill])
    tasks: List[Task] = []

    tasks.append(
        Task(
            id="1",
            steps=[
                {
                    "employee_id": "1",
                    "step_id": "1",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "3",
                    "step_id": "2",
                    "length": 3600 * 3,
                },
                {
                    "employee_id": "1",
                    "step_id": "3",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "2",
                    "step_id": "4",
                    "length": 3600 * 3,
                },
            ],
            deadline=1627495200,  # Mon 07/26/2021 17:00
        )
    )

    tasks.append(
        Task(
            id="2",
            steps=[
                {
                    "employee_id": "3",
                    "step_id": "1",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "1",
                    "step_id": "2",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "2",
                    "step_id": "3",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "3",
                    "step_id": "4",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "1",
                    "step_id": "5",
                    "length": 3600 * 1,
                },
            ],
            deadline=1627498800,
        )
    )

    tasks.append(
        Task(
            id="3",
            steps=[
                {
                    "employee_id": "2",
                    "step_id": "1",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "1",
                    "step_id": "2",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "3",
                    "step_id": "3",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "1",
                    "step_id": "4",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "3",
                    "step_id": "5",
                    "length": 3600 * 1,
                },
            ],
            deadline=1627506000,
        )
    )

    tasks.append(
        Task(
            id="4",
            steps=[
                {
                    "employee_id": "2",
                    "step_id": "1",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "3",
                    "step_id": "2",
                    "length": 3600 * 2,
                },
            ],
            deadline=1627513200,  # Tue 07/27/2021 10:00
        )
    )

    tasks.append(
        Task(
            id="5",
            steps=[
                {
                    "employee_id": "3",
                    "step_id": "1",
                    "length": 3600 * 3,
                },
                {
                    "employee_id": "1",
                    "step_id": "2",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "2",
                    "step_id": "3",
                    "length": 3600 * 8,
                },
                {
                    "employee_id": "3",
                    "step_id": "4",
                    "length": 3600 * 4,
                },
                {
                    "employee_id": "2",
                    "step_id": "5",
                    "length": 3600 * 1,
                },
            ],
            deadline=1627585200,
        )
    )
    tasks.append(
        Task(
            id="6",
            steps=[
                {
                    "employee_id": "3",
                    "step_id": "1",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "1",
                    "step_id": "2",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "1",
                    "step_id": "3",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "2",
                    "step_id": "4",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "2",
                    "step_id": "5",
                    "length": 3600 * 1,
                },
            ],
            deadline=1627426800,
        )
    )

    tasks.append(
        Task(
            id="7",
            steps=[
                {
                    "employee_id": "1",
                    "step_id": "1",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "3",
                    "step_id": "2",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "2",
                    "step_id": "3",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "1",
                    "step_id": "4",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "3",
                    "step_id": "5",
                    "length": 3600 * 1,
                },
            ],
            deadline=1627603200,
        )
    )

    tasks.append(
        Task(
            id="8",
            steps=[
                {
                    "employee_id": "1",
                    "step_id": "1",
                    "length": 3600 * 5,
                },
                {
                    "employee_id": "3",
                    "step_id": "2",
                    "length": 3600 * 3,
                },
                {
                    "employee_id": "2",
                    "step_id": "3",
                    "length": 3600 * 3,
                },
                {
                    "employee_id": "3",
                    "step_id": "4",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "2",
                    "step_id": "5",
                    "length": 3600 * 2,
                },
            ],
            deadline=1627603200,
        )
    )

    tasks.append(
        Task(
            id="9",
            steps=[
                {
                    "employee_id": "2",
                    "step_id": "1",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "1",
                    "step_id": "2",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "3",
                    "step_id": "3",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "1",
                    "step_id": "4",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "3",
                    "step_id": "5",
                    "length": 3600 * 1,
                },
            ],
            deadline=1627603200,
        )
    )

    tasks.append(
        Task(
            id="10",
            steps=[
                {
                    "employee_id": "2",
                    "step_id": "1",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "1",
                    "step_id": "2",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "3",
                    "step_id": "3",
                    "length": 3600 * 1,
                },
                {
                    "employee_id": "1",
                    "step_id": "4",
                    "length": 3600 * 2,
                },
                {
                    "employee_id": "3",
                    "step_id": "5",
                    "length": 3600 * 1,
                },
            ],
            deadline=1627603200,
        )
    )

    scores = 0
    cycles = 200
    with tqdm(total=cycles) as pbar:
        for i in range(cycles):
            schedule.flush()
            task_scheduler = MctsScheduler(schedule=schedule, epoch=epoch, tasks=tasks)
            task_scheduler.run(200, show_progress=False)
            scores += task_scheduler.boundaries[1]
            pbar.update(1)
            pbar.desc = (
                f"score: {task_scheduler.boundaries[1]:,.0f}/avg: {scores/(i+1):,.0f}"
            )
    print(f"results: {scores/(cycles):.2f}")


profile_mcts()
