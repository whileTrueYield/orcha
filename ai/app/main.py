from typing import List
from fastapi import FastAPI

from app.libs.scheduler.schedule import Schedule
from app.libs.scheduler.employee_schedule import EmployeeSchedule
from app.libs.scheduler.mcts_scheduler import MctsScheduler

from app.types import ScheduleBusyBlock, ScheduleSnapshot, ScheduledContext

app = FastAPI()


@app.get("/alive")
async def root():
    return {"message": "I am alive"}


@app.post("/scheduler/estimate", response_model=List[ScheduleSnapshot])
async def mcts_estimate(context: ScheduledContext):
    employees = [
        EmployeeSchedule(
            id=schedule.id,
            weekly_schedule=schedule.week,
            time_zone=schedule.timezone,
            start_time=context.epoch,
            time_offs=schedule.time_offs,
        )
        for schedule in context.schedules
    ]

    schedule = Schedule(employees=employees)
    task_scheduler = MctsScheduler(
        schedule=schedule,
        epoch=context.epoch,
        tasks=context.tasks,
        started_tasks=context.started,
    )

    task_scheduler.run(simulations=2000, show_progress=True)

    return task_scheduler.snapshot()


# This is used by the planner to run a quick simulation
@app.post("/scheduler/estimate/quick", response_model=List[ScheduleSnapshot])
async def mcts_estimate_quick(context: ScheduledContext):
    employees = [
        EmployeeSchedule(
            id=schedule.id,
            weekly_schedule=schedule.week,
            time_zone=schedule.timezone,
            start_time=context.epoch,
            time_offs=schedule.time_offs,
        )
        for schedule in context.schedules
    ]

    schedule = Schedule(employees=employees)
    task_scheduler = MctsScheduler(
        schedule=schedule,
        epoch=context.epoch,
        tasks=context.tasks,
        started_tasks=context.started,
        timeLimit=20,  # up to 20 seconds
    )

    task_scheduler.run(simulations=2000, show_progress=True)

    return task_scheduler.snapshot()


@app.post("/scheduler/events", response_model=List[ScheduleBusyBlock])
async def mcts_events(context: ScheduledContext):
    employees = [
        EmployeeSchedule(
            id=schedule.id,
            weekly_schedule=schedule.week,
            time_zone=schedule.timezone,
            start_time=context.epoch,
            time_offs=schedule.time_offs,
        )
        for schedule in context.schedules
    ]

    schedule = Schedule(employees=employees)
    task_scheduler = MctsScheduler(
        schedule=schedule,
        epoch=context.epoch,
        tasks=context.tasks,
        started_tasks=context.started,
        timeLimit=60,  # up to 1 minute
    )

    task_scheduler.run(simulations=5000, show_progress=True)

    return schedule.snapshot()
