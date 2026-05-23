from statistics import median

from app.libs.scheduler.mcts_scheduler import MctsScheduler
from app.types import Task, StartedTask
from app.libs.scheduler.employee_schedule import EmployeeSchedule
from app.libs.scheduler.schedule import Schedule
from app.libs.scheduler.constants_for_tests import WORK_WEEK
from app.libs.scheduler.debug.debug_output import create_digraph


def test_scheduler_should_prioritize_earliest_deadline():
    # We start at Mon 07/26/2021 08:00
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

    schedule = Schedule([john, jane])

    task_a = [
        Task(
            uid="1-0",
            employee_id=1,
            step_id=1,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
        ),
        Task(
            uid="1-1",
            employee_id=2,
            step_id=2,
            min=3600,
            likely=3600 * 11,
            max=3600 * 22,
            deadline=1627574400,  # Thu 07/29/2021 09:00
            ancestors=["1-0"],
        ),
    ]

    task_b = [
        Task(
            uid="2-0",
            employee_id=1,
            step_id=1,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
        ),
        Task(
            uid="2-1",
            employee_id=2,
            step_id=2,
            min=3600,
            likely=3600 * 11,
            max=3600 * 22,
            deadline=1627423200,  # Tue 07/27/2021 15:00
            ancestors=["2-0"],
        ),
    ]

    tasks = [*task_a, *task_b]
    task_scheduler = MctsScheduler(schedule=schedule, epoch=epoch, tasks=tasks)

    task_scheduler.run(simulations=100)

    # create_html_schedule(
    #     schedule=best_schedule,
    #     epoch=epoch,
    #     node=node,
    #     lowest_score=task_scheduler.lowest_score,
    #     highest_score=task_scheduler.highest_score,
    # )
    # create_digraph(
    #     lowest_score=task_scheduler.lowest_score,
    #     highest_score=task_scheduler.highest_score,
    #     node=node,
    # )

    # task 2 has an earlier deadline, it should be processed first
    median(task_scheduler.tree.node_index["2-0"].starts) < median(
        task_scheduler.tree.node_index["1-0"].starts
    )


def test_scheduler_should_inherit_deadline():
    # We start at Mon 07/26/2021 08:00
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

    schedule = Schedule([john, jane])

    task_1 = [
        Task(
            uid="1-0",
            employee_id=1,
            step_id=1,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
        ),
        Task(
            uid="1-1",
            employee_id=2,
            step_id=2,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
            ancestors=["1-0"],
        ),
    ]

    task_2 = [
        Task(
            uid="2-0",
            employee_id=1,
            step_id=1,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
            ancestors=["1-1"],
        ),
        Task(
            uid="2-1",
            employee_id=2,
            step_id=2,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
            ancestors=["2-0"],
        ),
    ]

    task_3 = [
        Task(
            uid="3-0",
            employee_id=1,
            step_id=1,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
            ancestors=["2-1"],
        ),
        Task(
            uid="3-1",
            employee_id=2,
            step_id=2,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
            deadline=1627423200,  # Tue 07/27/2021 15:00
            ancestors=["3-0"],
        ),
    ]

    task_4 = [
        Task(
            uid="4-0",
            employee_id=1,
            step_id=1,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
        ),
        Task(
            uid="4-1",
            employee_id=2,
            step_id=2,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
            ancestors=["4-0"],
        ),
    ]

    tasks = [*task_1, *task_2, *task_3, *task_4]
    task_scheduler = MctsScheduler(schedule=schedule, epoch=epoch, tasks=tasks)

    node = task_scheduler.run(simulations=1000)

    create_digraph(node=node)

    snapshots = task_scheduler.snapshot()
    snaps_idx = {snap.uid: snap for snap in snapshots}

    # 1-0 should be started before 4-0 because it inherits 3-0's deadline
    assert snaps_idx["1-0"].start <= snaps_idx["4-0"].start


def test_scheduling_with_started_task():
    # Mon 07/26/2021 08:00
    epoch = 1627311600

    john = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    tasks = [
        Task(
            uid="2-0",
            employee_id=1,
            step_id=1,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
        ),
        Task(
            uid="3-0",
            employee_id=1,
            step_id=1,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
        ),
        Task(
            uid="4-0",
            employee_id=1,
            step_id=1,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
        ),
        Task(
            uid="1-0",
            employee_id=1,
            step_id=1,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
        ),
        Task(
            uid="1-1",
            employee_id=1,
            step_id=2,
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
            ancestors=["1-0"],
        ),
        Task(
            uid="1-2",
            employee_id=1,
            step_id=2,
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
            ancestors=["1-1", "1-0"],
        ),
        Task(
            uid="1-3",
            employee_id=1,
            step_id=2,
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
            ancestors=["1-1"],
        ),
    ]

    schedule = Schedule([john])
    started_tasks = [StartedTask(uid="1-1", employee_id=1, start_time=1627311000)]

    task_scheduler = MctsScheduler(
        schedule, tasks=tasks, epoch=epoch, started_tasks=started_tasks
    )

    task_scheduler.run(100)

    # create_digraph(
    #     lowest_score=task_scheduler.lowest_score,
    #     highest_score=task_scheduler.highest_score,
    #     node=node,
    # )

    snapshots = task_scheduler.snapshot()
    indexed_snapshots = {snap.uid: snap for snap in snapshots}

    # 1-1 has already been started, this should make 1-0 end after 1-1
    # even tho 1-0 is supposed to occure before 1-1
    assert indexed_snapshots["1-0"].end_p80 >= indexed_snapshots["1-1"].end_p80
    assert indexed_snapshots["1-2"].end_p80 >= indexed_snapshots["1-0"].end_p80
    assert indexed_snapshots["1-3"].end_p80 >= indexed_snapshots["1-0"].end_p80
    assert indexed_snapshots["1-2"].end_p80 >= indexed_snapshots["1-1"].end_p80
    assert indexed_snapshots["1-3"].end_p80 >= indexed_snapshots["1-1"].end_p80
    assert indexed_snapshots["2-0"].end_p80 >= indexed_snapshots["1-1"].end_p80
    assert indexed_snapshots["3-0"].end_p80 >= indexed_snapshots["1-1"].end_p80
    assert indexed_snapshots["4-0"].end_p80 >= indexed_snapshots["1-1"].end_p80


def test_scheduling_respects_ancestry():
    # Mon 07/26/2021 08:00
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
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
        ),
        Task(
            uid="1-1",
            employee_id=3,
            step_id=2,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
            ancestors=["1-0"],
        ),
        Task(
            uid="1-2",
            employee_id=1,
            step_id=3,
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
            ancestors=["1-1"],
        ),
        Task(
            uid="1-3",
            employee_id=2,
            step_id=4,
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
            deadline=1627344000,  # Mon 07/26/2021 17:00
            ancestors=["1-2"],
        ),
    ]

    task_b = [
        Task(
            uid="2-0",
            employee_id=3,
            step_id=1,
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
            ancestors=["1-3"],
        ),
        Task(
            uid="2-1",
            employee_id=1,
            step_id=2,
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
            ancestors=["2-0"],
        ),
        Task(
            uid="2-2",
            employee_id=2,
            step_id=3,
            min=3600,
            likely=3600 * 2,
            max=3600 * 5,
            ancestors=["2-1"],
        ),
        Task(
            uid="2-3",
            employee_id=3,
            step_id=4,
            min=3600,
            likely=3600 * 2,
            max=3600 * 5,
            ancestors=["2-2"],
        ),
        Task(
            uid="2-4",
            employee_id=1,
            step_id=5,
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
            deadline=1627344000,
            ancestors=["2-3"],
        ),
    ]

    task_c = [
        Task(
            uid="3-0",
            employee_id=2,
            step_id=1,
            min=3600,
            likely=3600 * 2,
            max=3600 * 5,
            ancestors=["2-2"],
        ),
        Task(
            uid="3-1",
            employee_id=1,
            step_id=2,
            min=3600,
            likely=3600 * 2,
            max=3600 * 5,
            ancestors=["3-0"],
        ),
        Task(
            uid="3-2",
            employee_id=3,
            step_id=3,
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
            ancestors=["3-1"],
        ),
        Task(
            uid="3-3",
            employee_id=1,
            step_id=4,
            min=3600,
            likely=3600 * 2,
            max=3600 * 5,
            ancestors=["3-2"],
        ),
        Task(
            uid="3-4",
            employee_id=3,
            step_id=5,
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
            deadline=1627344000,
            ancestors=["3-3"],
        ),
    ]

    task_d = [
        Task(
            uid="4-0",
            employee_id=2,
            step_id=1,
            min=3600 / 2,
            likely=3600 * 1,
            max=3600 * 2,
            ancestors=["3-3"],
        ),
        Task(
            uid="4-1",
            employee_id=3,
            step_id=2,
            min=3600,
            likely=3600 * 2,
            max=3600 * 5,
            deadline=1627405200,  # Tue 07/27/2021 10:00
            ancestors=["4-0"],
        ),
    ]

    tasks = [*task_a, *task_b, *task_c, *task_d]
    task_scheduler = MctsScheduler(schedule, tasks=tasks, epoch=epoch)

    task_scheduler.run(100)

    # create_digraph(
    #     lowest_score=task_scheduler.lowest_score,
    #     highest_score=task_scheduler.highest_score,
    #     node=node,
    # )

    snapshots = task_scheduler.snapshot()
    indexed_snapshots = {snap.uid: snap for snap in snapshots}

    assert indexed_snapshots["2-0"].end_p80 >= indexed_snapshots["1-3"].end_p80
    assert indexed_snapshots["3-0"].end_p80 >= indexed_snapshots["2-2"].end_p80
    assert indexed_snapshots["4-0"].end_p80 >= indexed_snapshots["3-3"].end_p80
