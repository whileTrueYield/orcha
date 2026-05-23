from functools import lru_cache
from dateutil.tz import gettz
from datetime import datetime


@lru_cache(maxsize=50)
def gettz_cached(name: str):
    return gettz(name=name)


@lru_cache(maxsize=1000)
def get_timestamp_cached(year, month, day, hour, minute, time_zone: str) -> int:
    tz = gettz_cached(name=time_zone)
    float_timestamp = datetime(
        year,
        month,
        day,
        hour,
        minute,
        tzinfo=tz,
    ).timestamp()
    return int(float_timestamp)


def get_date_from_timestamp_cached(epoch: int, time_zone: str):
    tz = gettz_cached(name=time_zone)
    return datetime.fromtimestamp(epoch, tz=tz)
