from .employee_schedule import EmployeeSchedule
from .constants_for_tests import WORK_WEEK

import pytest


def test_employee_schedule_commit():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    employee_schedule.commit_blocks([(1, 2, "1", 1), (2, 3, "1", 1)])

    assert employee_schedule.busy_blocks == [
        (1, 2, "1", 1),
        (2, 3, "1", 1),
    ]


def test_employee_schedule_commit_sorts():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    employee_schedule.commit_blocks([(2, 3, "1", 1), (1, 2, "1", 1)])

    assert employee_schedule.busy_blocks == [
        (1, 2, "1", 1),
        (2, 3, "1", 1),
    ]


def test_employee_gap():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=4000,
    )
    employee_schedule.commit_blocks([(1000, 2000, "1", 1), (3000, 4000, "1", 1)])

    assert employee_schedule.gap(0) == (2000, 2000)


def test_employee_schedule_commit_merges():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    employee_schedule.commit_blocks(
        [
            (2, 3, "1", 1),
            (11, 14, "1", 1),
        ],
    )
    employee_schedule.commit_blocks(
        [
            (1, 2, "1", 1),
            (20, 40, "1", 1),
            (5, 6, "1", 1),
        ]
    )

    assert employee_schedule.busy_blocks == [
        (1, 2, "1", 1),
        (2, 3, "1", 1),
        (5, 6, "1", 1),
        (11, 14, "1", 1),
        (20, 40, "1", 1),
    ]


@pytest.mark.skip(reason="overlap detect is disabled for performance")
def test_employee_schedule_commit_do_not_overlap_input():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    with pytest.raises(ValueError):
        employee_schedule.commit_blocks(
            [
                (2, 3, "1", "1", 1),
                (1, 4, "1", "1", 1),
            ]
        )


@pytest.mark.skip(reason="overlap detect is disabled for performance")
def test_employee_schedule_commit_do_not_overlap():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    employee_schedule.commit_blocks([(5, 10, "1", "1", "1")])

    with pytest.raises(ValueError):
        employee_schedule.commit_blocks([(1, 6, "1", "1", "1")])

    with pytest.raises(ValueError):
        employee_schedule.commit_blocks([(7, 8, "1", "1", "1")])

    with pytest.raises(ValueError):
        employee_schedule.commit_blocks([(8, 12, "1", "1", "1")])


def test_employee_schedule_consume():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    # 16 hours to consume
    # starting on Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    time_blocks = employee_schedule.consume(3600 * 16, 1626987600, "1")

    assert time_blocks == [
        (1626987600, 1626998400, "1", 1),
        (1627052400, 1627066800, "1", 1),
        (1627070400, 1627084800, "1", 1),
        (1627311600, 1627326000, "1", 1),
        (1627329600, 1627333200, "1", 1),
    ]


def test_employee_schedule_consume_ignore_past():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    # 5 hours to consume
    # starting on Jul 20 2021 13:00:00 GMT-0700 (Pacific Daylight Time)
    time_blocks = employee_schedule.consume(3600 * 5, 1626811200, "1", "1")

    # 16 hours to consume
    # starting on Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    time_blocks = employee_schedule.consume(3600 * 16, 1626987600, "1", "1")

    assert time_blocks == [
        (1626987600, 1626998400, "1", 1),
        (1627052400, 1627066800, "1", 1),
        (1627070400, 1627084800, "1", 1),
        (1627311600, 1627326000, "1", 1),
        (1627329600, 1627333200, "1", 1),
    ]


def test_employee_schedule_consume_jump_over_busy():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    # adding 2x 1hour of work in the middle of the afternoon time block
    employee_schedule.commit_blocks(
        [
            (1626897600, 1626901200, "1", 1),  # July 21 2021 13:00:00 - 14:00:00
            (1626984000, 1626987600, "1", 1),  # July 22 2021 13:00:00 - 14:00:00
            (1626991200, 1626994800, "1", 1),  # July 22 2021 15:00:00 - 16:00:00
        ]
    )

    # 5 hours to consume
    # starting on Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    time_blocks = employee_schedule.consume(3600 * 5, 1626984000, "1")

    # even if there is a whole hour available to the employee from
    # 14:00 to 15:00, we do not want to fragment tasks. The algorithm
    # should find a place unhindered by previous tasks after the
    # previous task
    assert time_blocks == [
        (1626994800, 1626998400, "1", 1),  # 1 hour on Jul 22, end of day
        (1627052400, 1627066800, "1", 1),  # 4 hours on Jul 23, morning
    ]

    # 30 minutes to consume
    # starting on Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    time_blocks = employee_schedule.consume(3600 * 0.5, 1626987600, "1")

    # even if there is a whole hour available to the employee from
    # 14:00 to 15:00, we do not want to fragment tasks. The algorithm
    # should find a place unhindered by previous tasks after the
    # previous task
    assert time_blocks == [(1626987600, 1626989400, "1", 1)]


def test_employee_schedule_consume_no_jump_when_fractionable():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    # adding 2x 1hour of work in the middle of the afternoon time block
    employee_schedule.commit_blocks(
        [
            (1626897600, 1626901200, "1", 1),  # July 21 2021 13:00:00 - 14:00:00
            (1626984000, 1626987600, "1", 1),  # July 22 2021 13:00:00 - 14:00:00
            (1626991200, 1626994800, "1", 1),  # July 22 2021 15:00:00 - 16:00:00
        ]
    )

    # 5 hours to consume
    # starting on Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    time_blocks = employee_schedule.consume(3600 * 5, 1626984000, "1", True)

    # since allow the task to be fractionable and there is an hour available
    # to the employee from 14:00 to 15:00. The algorithm
    # should use any available spot
    assert time_blocks == [
        (1626987600, 1626991200, "1", 1),  # 1 hour
        (1626994800, 1626998400, "1", 1),  # 1 hour
        (1627052400, 1627063200, "1", 1),  # 3 hours
    ]

    # 30 minutes to consume
    # starting on Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    time_blocks = employee_schedule.consume(3600 * 0.5, 1626987600, "1")

    # even if there is a whole hour available to the employee from
    # 14:00 to 15:00, we do not want to fragment tasks. The algorithm
    # should find a place unhindered by previous tasks after the
    # previous task
    assert time_blocks == [(1626987600, 1626989400, "1", 1)]


def test_employee_schedule_consume_not_under_minimum():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    employee_schedule.commit_blocks(
        [
            (1626984000, 1626998160, "1", 1),  # July 22 2021 13:00:00 - 16:56:00
        ]
    )

    # 5 minutes to consume
    # starting on Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    time_blocks = employee_schedule.consume(60 * 5, 1626984000, "1", "1")

    # here there is 4 minute left on the day, but the minimum size of a
    # block is 5 minutes, this should push the block to the day after
    assert time_blocks == [
        (1627052400, 1627052700, "1", 1),  # 5 minutes on Jul 23, morning
    ]

    # 2 minutes to consume
    # starting on Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    time_blocks = employee_schedule.consume(60 * 2, 1626984000, "1", "1")

    # it now consumes less than the minumum but has enough available
    # time (it's an exception in the rule)
    assert time_blocks == [
        (1626998160, 1626998280, "1", 1),  # 5 minutes on Jul 23, morning
    ]


def test_employee_schedule_consume_insert_between_busy():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    # adding 2x 1hour of work in the middle of the afternoon time block
    employee_schedule.commit_blocks(
        [
            (1626984000, 1626987600, "1", 1),  # July 22 2021 13:00:00 - 14:00:00
            (1626991200, 1626994800, "1", 1),  # July 22 2021 15:00:00 - 16:00:00
        ]
    )
    # 1 hours to consume in between two tasks
    # starting on Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    time_blocks = employee_schedule.consume(amount=3600, epoch=1626987600, uid="1")

    # even if there is a whole hour available to the employee from
    # 14:00 to 15:00, we do not want to fragment tasks. The algorithm
    # should find a place unhindered by previous tasks after the
    # previous task
    assert time_blocks == [
        (
            1626987600,
            1626991200,
            "1",
            1,
        ),  # 1 hour on Jul 22, 14:00:00 - 15:00:00
    ]


def test_divide_time_block_cluster():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    # adding 2x 1hour of work in the middle of the afternoon time block
    employee_schedule.commit_blocks(
        [
            (1626980400, 1626985800, "1", 1),  # July 22 2021 12:00:00 - 13:30:00
            (1626991200, 1626994800, "1", 1),  # July 22 2021 15:00:00 - 16:00:00
            (1626996600, 1627002000, "1", 1),  # July 22 2021 16:30:00 - 18:00:00
        ]
    )

    generator = employee_schedule.get_time_blocks(1626966000)
    assert [next(generator) for i in range(6)] == [
        (1626966000, 1626980400, False),  # available
        (1626980400, 1626985800, True),  # busy
        (1626985800, 1626991200, False),  # available
        (1626991200, 1626994800, True),  # busy
        (1626994800, 1626996600, False),  # available
        (1626996600, 1627002000, True),  # busy
    ]


def test_detect_busy_block_after_break():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    # adding 2x 1hour of work in the middle of the afternoon time block
    employee_schedule.commit_blocks(
        [
            (1626984000, 1626985800, "1", 1),  # July 22 2021 13:00:00 - 13:30:00
        ]
    )

    generator = employee_schedule.get_time_blocks(1626966000)
    assert [next(generator) for i in range(3)] == [
        (1626966000, 1626980400, False),  # available
        (1626984000, 1626985800, True),  # busy
        (1626985800, 1626998400, False),  # available
    ]


def test_divide_time_block_empty():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    generator = employee_schedule.get_time_blocks(1626984000)
    free_block = generator.__next__()
    assert free_block == (1626984000, 1626998400, False)  # uninterrupted


def test_divide_time_block_busy_left():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    employee_schedule.commit_blocks(
        [
            (1626980400, 1626985800, "1", 1),  # July 22 2021 12:00:00 - 13:30:00
        ]
    )

    generator = employee_schedule.get_time_blocks(1626966000)
    assert [next(generator) for i in range(3)] == [
        (1626966000, 1626980400, False),  # Available morning
        (1626980400, 1626985800, True),  # Busy (on lunch break!!)
        (1626985800, 1626998400, False),  # Available afternoon
    ]


def test_divide_time_block_open_left():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    employee_schedule.commit_blocks(
        [
            (1626991200, 1626994800, "1", 1),  # July 22 2021 15:00:00 - 16:00:00
            (1626996600, 1627002000, "1", 1),  # July 22 2021 16:30:00 - 18:00:00
        ]
    )

    # start the generator at 12pm, the first block should be starting at 1pm
    generator = employee_schedule.get_time_blocks(1626980400)
    assert [next(generator) for i in range(4)] == [
        (1626984000, 1626991200, False),  # Available
        (1626991200, 1626994800, True),  # Busy
        (1626994800, 1626996600, False),  # Available
        (1626996600, 1627002000, True),  # Busy
    ]


def test_divide_time_block_busy_right():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    employee_schedule.commit_blocks(
        [
            (1626996600, 1627002000, "1", 1),  # Thu Jul 22 2021 16:30:00 - 18:00:00
        ]
    )

    generator = employee_schedule.get_time_blocks(1626984000)
    assert [next(generator) for i in range(3)] == [
        (1626984000, 1626996600, False),
        (1626996600, 1627002000, True),
        (1627052400, 1627066800, False),  # Fri Jul 23 08:00 - 12:00
    ]


def test_divide_time_block_open_right():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    employee_schedule.commit_blocks(
        [
            (1626980400, 1626985800, "1", 1),  # July 22 2021 12:00:00 - 13:30:00
            (1626991200, 1626994800, "1", 1),  # July 22 2021 15:00:00 - 16:00:00
        ]
    )

    generator = employee_schedule.get_time_blocks(1626980400)
    assert [next(generator) for i in range(5)] == [
        (1626980400, 1626985800, True),
        (1626985800, 1626991200, False),
        (1626991200, 1626994800, True),
        (1626994800, 1626998400, False),
        (1627052400, 1627066800, False),
    ]


def test_employee_schedule_consume_middle():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    # adding 2x 1hour of work in the middle of the afternoon time block
    employee_schedule.commit_blocks(
        [
            (1626984000, 1626987600, "1", 1),  # July 22 2021 13:00:00 - 14:00:00
            (1626991200, 1626994800, "1", 1),  # July 22 2021 15:00:00 - 16:00:00
        ]
    )

    generator = employee_schedule.get_time_blocks(1626984000)
    assert [next(generator) for i in range(5)] == [
        (1626984000, 1626987600, True),  # Busy block
        (1626987600, 1626991200, False),  # interrupted
        (1626991200, 1626994800, True),  # un-interrupted
        (1626994800, 1626998400, False),  # un-interrupted
        (1627052400, 1627066800, False),
    ]


def test_employee_schedule_get_blocks_by_task_id():
    employee_schedule = EmployeeSchedule(
        id=1,
        weekly_schedule=WORK_WEEK,
        time_zone="America/Los_Angeles",
        start_time=0,
    )

    # adding 2x 1hour of work in the middle of the afternoon time block
    employee_schedule.commit_blocks(
        [
            (1626984000, 1626987600, "1", 1),
            (1626994800, 1626998400, "2", "6"),
            (1626998400, 1627012800, "1", "3"),
        ]
    )

    assert employee_schedule.get_blocks_by_uid(uid="1") == [
        (1626984000, 1626987600, "1", 1),
        (1626998400, 1627012800, "1", "3"),
    ]

    assert employee_schedule.get_blocks_by_uid(uid="2") == [
        (1626994800, 1626998400, "2", "6"),
    ]
