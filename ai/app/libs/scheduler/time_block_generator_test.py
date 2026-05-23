from app.libs.scheduler.constants_for_tests import WORK_WEEK
from app.libs.scheduler.time_block_generator import time_block_generator
from app.libs.scheduler.schedule_cache import schedule_cache


def test_get_block_for_full_week():
    schedule_cache.flush()
    limit = 1000  # we'll do a 1000 iteration
    previous_start = None
    previous_stop = None

    # we'll start on Tue Jul 20 2021 12:34:46 GMT-0700 (Pacific Daylight Time)
    for [start, stop] in time_block_generator(
        WORK_WEEK, 1626809686, "America/Los_Angeles", 1626809686
    ):
        assert start < stop

        if previous_start:
            assert previous_start < start

        if previous_stop:
            assert previous_stop < start
            assert previous_start < stop

        previous_start = start
        previous_stop = stop

        if limit == 0:
            # 1,000 iterations equates to 500 days, which is 100 weeks
            # so at the 1,000th iterations we should fall one the same day of the week
            # From: Tue Jun 20 2023 13:00:00 GMT-0700 (Pacific Daylight Time)
            # To: Tue Jun 20 2023 17:00:00 GMT-0700 (Pacific Daylight Time)
            assert start == 1687291200
            assert stop == 1687305600

            return
        else:
            limit -= 1


def test_generate_from_start_time():
    schedule_cache.flush()
    # using epoch for Thu Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    gen = time_block_generator(WORK_WEEK, 1626987600, "America/Los_Angeles", 1626987600)

    [start, stop] = gen.__next__()
    assert start == 1626987600  # from 07/22/2021 14:00
    assert stop == 1626998400  # to 07/22/2021 17:00


def test_generate_with_time_off_inside_overlap():
    schedule_cache.flush()
    # using epoch for Thu Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    gen = time_block_generator(
        WORK_WEEK,
        1626987600,
        "America/Los_Angeles",
        1626987600,
        [[1626991200, 1626994800]],
    )

    [start, stop] = gen.__next__()
    assert start == 1626987600  # from 07/22/2021 14:00
    assert stop == 1626991200  # to 07/22/2021 15:00

    [start, stop] = gen.__next__()
    assert start == 1626994800  # from 07/22/2021 16:00
    assert stop == 1626998400  # to 07/22/2021 17:00


def test_generate_with_time_off_left_overlap():
    schedule_cache.flush()
    # using epoch for Thu Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    gen = time_block_generator(
        WORK_WEEK,
        1626987600,
        "America/Los_Angeles",
        1626987600,
        [[1626987000, 1626991200]],
    )

    [start, stop] = gen.__next__()
    assert start == 1626991200  # from 07/22/2021 15:00
    assert stop == 1626998400  # to 07/22/2021 17:00


def test_generate_with_time_off_right_overlap():
    schedule_cache.flush()
    # using epoch for Thu Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    gen = time_block_generator(
        WORK_WEEK,
        1626987600,
        "America/Los_Angeles",
        1626987600,
        [[1626994800, 1627002000]],
    )

    [start, stop] = gen.__next__()
    assert start == 1626987600  # from 07/22/2021 14:00
    assert stop == 1626994800  # to 07/22/2021 15:00


def test_generate_with_time_off_outside_overlap():
    schedule_cache.flush()
    # using epoch for Thu Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    gen = time_block_generator(
        WORK_WEEK,
        1626987600,
        "America/Los_Angeles",
        1626987600,
        [[1626985800, 1627002000]],  # from 07/22/2021 13:30 to  07/22/2021 18:00
    )

    [start, stop] = gen.__next__()
    assert start == 1627052400  # from 07/23/2021 08:00
    assert stop == 1627066800  # to 07/23/2021 12:00


def test_generate_with_time_off_exact_overlap():
    schedule_cache.flush()
    # using epoch for Thu Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)
    gen = time_block_generator(
        WORK_WEEK,
        1626984000,
        "America/Los_Angeles",
        1626984000,
        [[1626984000, 1627002000]],  # from 07/22/2021 13:00 to  07/22/2021 18:00
    )

    [start, stop] = gen.__next__()
    assert start == 1627052400  # from 07/23/2021 08:00
    assert stop == 1627066800  # to 07/23/2021 12:00

    [start, stop] = gen.__next__()
    assert start == 1627070400  # from 07/23/2021 13:00
    assert stop == 1627084800  # to 07/23/2021 17:00


def test_generate_with_many_time_off_overlaps():
    schedule_cache.flush()
    # using epoch for Thu Jul 22 2021 14:00:00 GMT-0700 (Pacific Daylight Time)

    gen = time_block_generator(
        WORK_WEEK,
        1626901200,
        "America/Los_Angeles",
        1626901200,
        [
            [  # from 07/21/2021 12:30 to  07/21/2021 14:30 left overlap
                1626895800,
                1626903000,
            ],
            [  # from 07/21/2021 15:00 to  07/21/2021 15:30 inside overlap
                1626904800,
                1626906600,
            ],
            [  # from 07/21/2021 16:00 to  07/21/2021 18:00 right overlap
                1626908400,
                1626915600,
            ],
            [  # from 07/22/2021 08:00 to  07/22/2021 12:00 exact overlap
                1626966000,
                1626980400,
            ],
            [  # from 07/22/2021 12:30 to 07/23/2021 12:30 outside overlap
                1626982200,
                1627068600,
            ],
        ],
    )

    [start, stop] = gen.__next__()
    assert start == 1626903000  # from 07/21/2021 14:30
    assert stop == 1626904800  # to 07/21/2021 15:00

    [start, stop] = gen.__next__()
    assert start == 1626906600  # from 07/21/2021 15:30
    assert stop == 1626908400  # to 07/21/2021 16:00

    [start, stop] = gen.__next__()
    assert start == 1627070400  # from 07/23/2021 13:00
    assert stop == 1627084800  # to 07/23/2021 17:00


def test_split_time_block_based_on_provided_epoch():
    schedule_cache.flush()
    # using epoch for Tue Jul 20 2021 09:53:20 GMT-0700 (Pacific Daylight Time)
    gen = time_block_generator(WORK_WEEK, 1626800000, "America/Los_Angeles", 1626800000)

    [start, stop] = gen.__next__()

    # Tue Jul 20 2021 09:53:20 GMT-0700 (Pacific Daylight Time)
    # same as the provided epoch
    assert start == 1626800000

    # Tue Jul 20 2021 12:00:00 GMT-0700 (Pacific Daylight Time)
    assert stop == 1626807600


def test_get_next_avail_epoch():
    schedule_cache.flush()
    # using epoch for Tue Jul 20 2021 09:53:20 GMT-0700 (Pacific Daylight Time)
    gen = time_block_generator(WORK_WEEK, 1626810800, "America/Los_Angeles", 1626810800)

    [start, stop] = gen.__next__()

    # Tue Jul 20 2021 13:00:00 GMT-0700 (Pacific Daylight Time)
    assert start == 1626811200

    # Tue Jul 20 2021 17:00:00 GMT-0700 (Pacific Daylight Time)
    assert stop == 1626825600

    [start, stop] = gen.__next__()
    # Wed Jul 21 2021 08:00:00 GMT-0700 (Pacific Daylight Time)
    assert start == 1626879600

    # Wed Jul 21 2021 12:00:00 GMT-0700 (Pacific Daylight Time)
    assert stop == 1626894000


def test_jump_over_weekend():
    schedule_cache.flush()
    # using epoch for Fri Jul 23 2021 21:13:20 GMT-0700 (Pacific Daylight Time)
    gen = time_block_generator(WORK_WEEK, 1627100000, "America/Los_Angeles", 1627100000)

    [start, stop] = gen.__next__()

    # Mon Jul 26 2021 08:00:00 GMT-0700 (Pacific Daylight Time)
    assert start == 1627311600

    # Mon Jul 26 2021 12:00:00 GMT-0700 (Pacific Daylight Time)
    assert stop == 1627326000
