from app.libs.scheduler.debug.debug_output import create_digraph, create_html_schedule
from .mcts_scheduler import MctsScheduler
from app.types import Task
from .employee_schedule import EmployeeSchedule
from .schedule import Schedule
from .constants_for_tests import WORK_WEEK

mins = 60
hours = 3600


def profile_mcts():
    epoch = 1627311600

    john = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    jane = EmployeeSchedule(
        id=2,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    bill = EmployeeSchedule(
        id=3,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    schedule = Schedule([john, jane, bill])

    task_a = [
        Task(
            uid="1-0",
            employee_id=1,
            step_id=1,
            min=20 * mins,
            likely=1 * hours,
            max=1.25 * hours,
        ),
        Task(
            uid="1-1",
            employee_id=3,
            step_id=2,
            min=1.2 * hours,
            likely=2.5 * hours,
            max=5 * hours,
            ancestors=["1-0"],
        ),
        Task(
            uid="1-2",
            employee_id=1,
            step_id=3,
            min=25 * mins,
            likely=45 * mins,
            max=1.3 * hours,
            ancestors=["1-1"],
        ),
        Task(
            uid="1-3",
            employee_id=2,
            step_id=4,
            min=1.2 * hours,
            likely=2.2 * hours,
            max=4.5 * hours,
            deadline=1627344000,  # Mon 07/26/2021 17:00
            ancestors=["1-2"],
        ),
    ]

    task_b = [
        Task(
            uid="2-0",
            employee_id=3,
            step_id=1,
            min=35 * mins,
            likely=1.25 * hours,
            max=3 * hours,
        ),
        Task(
            uid="2-1",
            employee_id=1,
            step_id=2,
            min=30 * mins,
            likely=1.7 * hours,
            max=2.25 * hours,
            ancestors=["2-0"],
        ),
        Task(
            uid="2-2",
            employee_id=2,
            step_id=3,
            min=hours,
            likely=3 * hours,
            max=4.5 * hours,
            ancestors=["2-1"],
        ),
        Task(
            uid="2-3",
            employee_id=3,
            step_id=4,
            min=45 * mins,
            likely=1.8 * hours,
            max=5.2 * hours,
            ancestors=["2-2"],
        ),
        Task(
            uid="2-4",
            employee_id=1,
            step_id=5,
            min=2.3 * hours,
            likely=5 * hours,
            max=6 * hours,
            deadline=1627344000,
            ancestors=["2-3"],
        ),
    ]

    task_c = [
        Task(
            uid="3-0",
            employee_id=2,
            step_id=1,
            min=1.13 * hours,
            likely=2.8 * hours,
            max=6.7 * hours,
        ),
        Task(
            uid="3-1",
            employee_id=1,
            step_id=2,
            min=1 * hours,
            likely=2.75 * hours,
            max=3.55 * hours,
            ancestors=["3-0"],
        ),
        Task(
            uid="3-2",
            employee_id=3,
            step_id=3,
            min=35 * mins,
            likely=hours * 1.25,
            max=hours * 2.2,
            ancestors=["3-1"],
        ),
        Task(
            uid="3-3",
            employee_id=1,
            step_id=4,
            min=hours,
            likely=hours * 2.6,
            max=hours * 5.5,
            ancestors=["3-2"],
        ),
        Task(
            uid="3-4",
            employee_id=3,
            step_id=5,
            min=6 * hours,
            likely=12 * hours,
            max=18 * hours,
            deadline=1627344000,
            ancestors=["3-3"],
        ),
    ]

    task_d = [
        Task(
            uid="4-0",
            employee_id=2,
            step_id=1,
            min=15 * mins,
            likely=hours * 1,
            max=1.5 * hours,
        ),
        Task(
            uid="4-1",
            employee_id=3,
            step_id=2,
            min=75 * mins,
            likely=2.2 * hours,
            max=4.1 * hours,
            deadline=1627405200,  # Tue 07/27/2021 10:00
            ancestors=["4-0"],
        ),
    ]

    task_e = [
        Task(
            uid="5-0",
            employee_id=2,
            step_id=1,
            min=hours / 2,
            likely=hours * 1,
            max=hours * 2,
        ),
        Task(
            uid="5-1",
            employee_id=3,
            step_id=2,
            min=hours,
            likely=hours * 2,
            max=hours * 5,
            deadline=1627405200,  # Tue 07/27/2021 10:00
            ancestors=["5-0"],
        ),
    ]

    task_f = [
        Task(
            uid="6-0",
            employee_id=2,
            step_id=1,
            min=1.2 * hours,
            likely=2.25 * hours,
            max=4.45 * hours,
        ),
        Task(
            uid="6-1",
            employee_id=1,
            step_id=2,
            min=6 * hours,
            likely=10 * hours,
            max=15 * hours,
            ancestors=["6-0"],
        ),
        Task(
            uid="6-2",
            employee_id=3,
            step_id=3,
            min=hours / 2,
            likely=hours * 1,
            max=hours * 2,
            ancestors=["6-1"],
        ),
        Task(
            uid="6-3",
            employee_id=1,
            step_id=4,
            min=4 * hours,
            likely=6 * hours,
            max=8 * hours,
            ancestors=["6-2"],
        ),
        Task(
            uid="6-4",
            employee_id=3,
            step_id=5,
            min=hours / 2,
            likely=hours * 1,
            max=hours * 2,
            deadline=1627344000,
            ancestors=["6-3"],
        ),
    ]

    task_g = [
        Task(
            uid="7-0",
            employee_id=2,
            step_id=1,
            min=25 * mins,
            likely=4 * hours,
            max=7 * hours,
        ),
        Task(
            uid="7-1",
            employee_id=3,
            step_id=2,
            min=2 * hours,
            likely=4 * hours,
            max=5 * hours,
            deadline=1627405200,  # Tue 07/27/2021 10:00
            ancestors=["7-0"],
        ),
    ]

    task_h = [
        Task(
            uid="8-0",
            employee_id=2,
            step_id=1,
            min=20 * mins,
            likely=hours * 2.5,
            max=hours * 2.8,
        ),
        Task(
            uid="8-1",
            employee_id=1,
            step_id=2,
            min=1.5 * hours,
            likely=hours * 2.25,
            max=hours * 3.6,
            ancestors=["8-0"],
        ),
        Task(
            uid="8-2",
            employee_id=3,
            step_id=3,
            min=hours / 2,
            likely=hours * 1,
            max=hours * 2,
            ancestors=["8-1"],
        ),
        Task(
            uid="8-3",
            employee_id=1,
            step_id=4,
            min=5 * hours,
            likely=6 * hours,
            max=10 * hours,
            ancestors=["8-2"],
        ),
        Task(
            uid="8-4",
            employee_id=3,
            step_id=5,
            min=35 * mins,
            likely=6 * hours,
            max=8.2 * hours,
            deadline=1627344000,
            ancestors=["8-3"],
        ),
    ]

    # Mon 07/26/2021 08:00
    tasks = [*task_a, *task_b, *task_c, *task_d, *task_e, *task_f, *task_g, *task_h]
    task_scheduler = MctsScheduler(schedule, tasks=tasks, epoch=epoch)
    node = task_scheduler.run(20000, show_progress=True)

    # task_scheduler.snapshot()

    create_digraph(node=node)

    # task_scheduler.schedule_task_ids(task_ids=task_ids)
    create_html_schedule(
        schedule=task_scheduler.normlizedSchedule,
        epoch=epoch,
        node=node,
    )

    print("Best Score %.3f%%" % (task_scheduler.bestScore * 100))


profile_mcts()
