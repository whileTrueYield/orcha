from app.libs.scheduler.task_tree import TaskTree
from app.types import Task
from .constants_for_tests import WORK_WEEK
from .employee_schedule import EmployeeSchedule
from .schedule import Schedule
import pytest


def test_basic_schedule():
    epoch = 1626984000
    john = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    jane = EmployeeSchedule(
        id=2,
        weekly_schedule=WORK_WEEK,
        time_zone="America/New_York",
        start_time=epoch,
    )

    schedule = Schedule([john, jane])

    tasks = [
        Task(
            uid="1-1",
            name="Design",
            employee_id=1,
            step_id=3,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 3,
            max=3600 * 4,
        ),
        Task(
            uid="1-2",
            name="Dev",
            employee_id=2,
            step_id=1,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 11,
            max=3600 * 14,
            ancestors=["1-1"],
        ),
        Task(
            uid="1-3",
            name="PR",
            employee_id=1,
            step_id=2,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 3,
            max=3600 * 4,
            ancestors=["1-2"],
        ),
        Task(
            uid="1-4",
            name="QA",
            employee_id=1,
            step_id=7,
            # for testing, the node will always return the likely value
            min=3600 * 0.25,
            likely=3600 * 1,
            max=3600 * 4,
            deadline=1627588800,
            ancestors=["1-3"],
        ),
    ]

    # starting at Thu Jul 22 2021 13:00:00 GMT-0700
    tree = TaskTree(tasks=tasks, start_epoch=epoch)

    time_blocks = []
    for node in tree.node_index.values():
        node.length = node.likely
        estimate = schedule.estimate_node(node)
        schedule.commit_task_estimate(estimate)
        time_blocks.append(estimate)
        node.end = estimate["time_blocks"][-1][1]

    assert len(time_blocks) == 4
    assert time_blocks[0] == {
        "uid": "1-1",
        "employee_id": 1,
        "time_blocks": [
            (
                1626984000,
                1626994800,
                "1-1",
                1,
            ),  # 07/22/2021 13:00 to 07/22/2021 16:00
        ],
    }

    assert time_blocks[1] == {
        "uid": "1-2",
        "employee_id": 2,
        "time_blocks": [
            (
                1627041600,
                1627056000,
                "1-2",
                2,
            ),  # Fri 2021-07-23 05:00 to Fri 2021-07-23 09:00
            (
                1627059600,
                1627074000,
                "1-2",
                2,
            ),  # Fri 2021-07-23 10:00 to Fri 2021-07-23 14:00
            (
                1627300800,
                1627311600,
                "1-2",
                2,
            ),  # Mon 2021-07-26 05:00 to Mon 2021-07-26 08:00
        ],
    }

    assert time_blocks[2] == {
        "uid": "1-3",
        "employee_id": 1,
        "time_blocks": [
            (
                1627311600,
                1627322400,
                "1-3",
                1,
            ),  # Mon 2021-07-26 08:00 to Mon 2021-07-26 11:00
        ],
    }

    assert time_blocks[3] == {
        "uid": "1-4",
        "employee_id": 1,
        "time_blocks": [
            (
                1627322400,
                1627326000,
                "1-4",
                1,
            ),  # Mon 2021-07-26 11:00 to Mon 2021-07-26 12:00
        ],
    }


def test_raise_if_employee_not_found():
    # starting at Thu Jul 22 2021 13:00:00 GMT-0700
    epoch = 1626984000
    jane_ny = EmployeeSchedule(
        id=2,
        weekly_schedule=WORK_WEEK,
        time_zone="America/New_York",
        start_time=epoch,
    )

    schedule = Schedule([jane_ny])

    task = Task(
        uid="1-1",
        name="Design",
        employee_id=1,
        step_id=3,
        min=3600,
        likely=3600 * 3,
        max=3600 * 4,
        deadline=1627588800,
    )

    tree = TaskTree(tasks=[task], start_epoch=epoch)
    for node in tree.node_index.values():
        with pytest.raises(KeyError):
            schedule.estimate_node(node)


def test_timezone_schedule():
    # starting at Thu 2021-07-22 13:00
    epoch = 1626984000
    john_la = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    jane_ny = EmployeeSchedule(
        id=2,
        weekly_schedule=WORK_WEEK,
        time_zone="America/New_York",
        start_time=epoch,
    )

    schedule = Schedule([john_la, jane_ny])

    tasks = [
        Task(
            uid="1-1",
            name="Design",
            employee_id=1,
            step_id=3,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 3,
            max=3600 * 4,
        ),
        Task(
            uid="1-2",
            name="Dev",
            employee_id=2,
            step_id=1,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 11,
            max=3600 * 14,
            ancestors=["1-1"],
        ),
        Task(
            uid="1-3",
            name="PR",
            employee_id=1,
            step_id=2,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 3,
            max=3600 * 4,
            ancestors=["1-2"],
        ),
        Task(
            uid="1-4",
            name="QA",
            employee_id=1,
            step_id=7,
            # for testing, the node will always return the likely value
            min=3600 * 0.25,
            likely=3600,
            max=3600 * 2,
            deadline=1627588800,
            ancestors=["1-3"],
        ),
    ]

    time_blocks = []
    tree = TaskTree(tasks=tasks, start_epoch=epoch)
    for node in tree.node_index.values():
        node.length = node.likely
        estimate = schedule.estimate_node(node)
        schedule.commit_task_estimate(estimate)
        time_blocks.append(estimate)
        node.end = estimate["time_blocks"][-1][1]

    assert len(time_blocks) == 4
    assert time_blocks[0] == {
        "uid": "1-1",
        "employee_id": 1,
        "time_blocks": [
            (
                1626984000,
                1626994800,
                "1-1",
                1,
            ),  # Thu 2021-07-22 13:00 to Thu 2021-07-22 16:00
        ],
    }

    assert time_blocks[1] == {
        "uid": "1-2",
        "employee_id": 2,
        "time_blocks": [
            (
                1627041600,
                1627056000,
                "1-2",
                2,
            ),  # Fri 2021-07-23 05:00 to Fri 2021-07-23 09:00
            (
                1627059600,
                1627074000,
                "1-2",
                2,
            ),  # Fri 2021-07-23 10:00 to Fri 2021-07-23 14:00
            (
                1627300800,
                1627311600,
                "1-2",
                2,
            ),  # Mon 2021-07-26 05:00 to Mon 2021-07-26 08:00
        ],
    }

    assert time_blocks[2] == {
        "employee_id": 1,
        "uid": "1-3",
        "time_blocks": [
            (
                1627311600,
                1627322400,
                "1-3",
                1,
            ),  # Mon 2021-07-26 08:00 to Mon 2021-07-26 11:00
        ],
    }

    assert time_blocks[3] == {
        "employee_id": 1,
        "uid": "1-4",
        "time_blocks": [
            (
                1627322400,
                1627326000,
                "1-4",
                1,
            ),  # Mon 2021-07-26 11:00 to Mon 2021-07-26 12:00
        ],
    }


def test_measure_task_estimates():
    # starting at 2021-07-22 16:00
    epoch = 1626984000
    john_la = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    jane_ny = EmployeeSchedule(
        id=2,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=epoch,
    )

    schedule = Schedule([john_la, jane_ny])

    tasks = [
        Task(
            uid="1-1",
            name="Design",
            employee_id=1,
            step_id=3,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 3,
            max=3600 * 4,
        ),
        Task(
            uid="1-2",
            name="Dev",
            employee_id=2,
            step_id=1,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 11,
            max=3600 * 14,
            ancestors=["1-1"],
        ),
        Task(
            uid="1-3",
            name="PR",
            employee_id=1,
            step_id=2,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 3,
            max=3600 * 4,
            ancestors=["1-2"],
        ),
        Task(
            uid="1-4",
            name="QA",
            employee_id=1,
            step_id=7,
            # for testing, the node will always return the likely value
            min=3600 / 4,
            likely=3600,
            max=3600 * 2,
            deadline=1627588800,
            ancestors=["1-3"],
        ),
    ]

    tree = TaskTree(tasks=tasks, start_epoch=epoch)
    task_estimates = []
    for node in tree.node_index.values():
        node.length = node.likely
        estimate = schedule.estimate_node(node)
        task_estimates.append(estimate)
        schedule.commit_task_estimate(estimate)
        node.end = estimate["time_blocks"][-1][1]

    assert Schedule.measure_task_estimates(task_estimates) == 3600 * 18


def test_schedule_commit():
    # starting at Thu Jul 22 2021 13:00:00 GMT-0700
    epoch = 1626994800
    john_la = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=1626994800,
    )

    jane_ny = EmployeeSchedule(
        id=2,
        weekly_schedule=WORK_WEEK,
        time_zone="America/New_York",
        start_time=1626994800,
    )

    schedule = Schedule([john_la, jane_ny])

    tasks = [
        Task(
            uid="1-1",
            name="Design",
            employee_id=1,
            step_id=3,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 3,
            max=3600 * 5,
            ancestors=[],
        ),
        Task(
            uid="1-2",
            name="Dev",
            employee_id=2,
            step_id=1,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 11,
            max=3600 * 20,
            ancestors=["1-1"],
        ),
        Task(
            uid="1-3",
            name="PR",
            employee_id=1,
            step_id=2,
            # for testing, the node will always return the likely value
            min=3600,
            likely=3600 * 3,
            max=3600 * 6,
            ancestors=["1-2"],
        ),
        Task(
            uid="1-4",
            name="QA",
            employee_id=1,
            step_id=7,
            # for testing, the node will always return the likely value
            min=3600 * 0.25,
            likely=3600,
            max=3600 * 2,
            deadline=1627588800,
            ancestors=["1-3"],
        ),
    ]

    tree = TaskTree(tasks=tasks, start_epoch=epoch)
    time_blocks = []
    for node in tree.node_index.values():
        node.length = node.likely
        estimate = schedule.estimate_node(node)
        schedule.commit_task_estimate(estimate)
        time_blocks.append(estimate)
        node.end = estimate["time_blocks"][-1][1]

    assert len(time_blocks) == 4

    assert time_blocks[0] == {
        "uid": "1-1",
        "employee_id": 1,
        "time_blocks": [
            (
                1626994800,
                1626998400,
                "1-1",
                1,
            ),  # 2021-07-22 16:00 to 2021-07-22 17:00
            (
                1627052400,
                1627059600,
                "1-1",
                1,
            ),  # 2021-07-23 08:00 to 2021-07-23 10:00
        ],
    }

    assert time_blocks[1] == {
        "uid": "1-2",
        "employee_id": 2,
        "time_blocks": [
            (
                1627059600,
                1627074000,
                "1-2",
                2,
            ),  # Fri 2021-07-23 10:00 to Fri 2021-07-23 14:00
            (
                1627300800,
                1627315200,
                "1-2",
                2,
            ),  # Mon 2021-07-26 05:00 to Mon 2021-07-26 09:00
            (
                1627318800,
                1627329600,
                "1-2",
                2,
            ),  # Mon 2021-07-26 10:00 to Mon 2021-07-26 13:00
        ],
    }

    assert time_blocks[2] == {
        "uid": "1-3",
        "employee_id": 1,
        "time_blocks": [
            (
                1627329600,
                1627340400,
                "1-3",
                1,
            ),  # Mon 2021-07-26 13:00 to Mon 2021-07-26 16:00
        ],
    }

    assert time_blocks[3] == {
        "uid": "1-4",
        "employee_id": 1,
        "time_blocks": [
            (
                1627340400,
                1627344000,
                "1-4",
                1,
            ),  # Mon 2021-07-26 16:00 to Mon 2021-07-26 17:00
        ],
    }
