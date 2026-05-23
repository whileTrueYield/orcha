from fastapi.testclient import TestClient
from .main import app

client = TestClient(app)


def test_root():
    response = client.get("/alive")
    assert response.status_code == 200
    assert response.json() == {"message": "I am alive"}


def test_estimate():
    schedules = [
        {
            "id": "1",
            "week": {
                "monday": [("08:00", "12:00"), ("13:00", "17:00")],
                "tuesday": [("08:00", "12:00"), ("13:00", "17:00")],
                "wednesday": [("08:00", "12:00"), ("13:00", "17:00")],
            },
            "timezone": "America/Los_Angeles",
        },
        {
            "id": "2",
            "week": {
                "monday": [("08:00", "12:00"), ("13:00", "17:00")],
                "wednesday": [("08:00", "12:00"), ("13:00", "17:00")],
                "friday": [("08:00", "12:00"), ("13:00", "17:00")],
            },
            "timezone": "America/New_York",
        },
    ]

    tasks = [
        {
            "uid": "1-1",
            "employee_id": 1,
            "min": 3600,
            "likely": 3600 * 3,
            "max": 3600 * 6,
        },
        {
            "uid": "1-2",
            "employee_id": 2,
            "min": 3600,
            "likely": 3600 * 2,
            "max": 3600 * 3,
        },
        {
            "uid": "1-3",
            "employee_id": 1,
            "min": 3600,
            "likely": 3600 * 3,
            "max": 3600 * 6,
        },
        {
            "uid": "1-4",
            "employee_id": 2,
            "min": 3600,
            "likely": 3600 * 4,
            "max": 3600 * 5,
            "deadline": 1627495200,  # Mon 07/26/2021 17:00
        },
    ]

    response = client.post(
        "/scheduler/estimate",
        json={
            "schedules": schedules,
            "tasks": tasks,
            "epoch": 1627311600,
            "started": [],
        },
    )

    assert response.status_code == 200


def test_estimate_with_started_tasks():
    schedules = [
        {
            "id": "1",
            "week": {
                "monday": [("08:00", "12:00"), ("13:00", "17:00")],
                "tuesday": [("08:00", "12:00"), ("13:00", "17:00")],
                "wednesday": [("08:00", "12:00"), ("13:00", "17:00")],
            },
            "timezone": "America/Los_Angeles",
        },
        {
            "id": "2",
            "week": {
                "monday": [("08:00", "12:00"), ("13:00", "17:00")],
                "wednesday": [("08:00", "12:00"), ("13:00", "17:00")],
                "friday": [("08:00", "12:00"), ("13:00", "17:00")],
            },
            "timezone": "America/New_York",
        },
    ]

    tasks = [
        {
            "uid": "1-1",
            "employee_id": 1,
            "min": 3600,
            "likely": 3600 * 3,
            "max": 3600 * 6,
        },
        {
            "uid": "1-2",
            "employee_id": 2,
            "min": 3600,
            "likely": 3600 * 2,
            "max": 3600 * 3,
        },
        {
            "uid": "1-3",
            "employee_id": 1,
            "min": 3600,
            "likely": 3600 * 3,
            "max": 3600 * 6,
        },
        {
            "uid": "1-4",
            "employee_id": 2,
            "min": 3600,
            "likely": 3600 * 4,
            "max": 3600 * 5,
            "deadline": 1627495200,  # Mon 07/26/2021 17:00
        },
    ]

    response = client.post(
        "/scheduler/estimate",
        json={
            "schedules": schedules,
            "tasks": tasks,
            "epoch": 1627311600,
            "started": [],
        },
    )

    assert response.status_code == 200
