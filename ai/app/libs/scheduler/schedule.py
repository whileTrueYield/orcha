from app.libs.scheduler.employee_schedule import EmployeeSchedule, SchedulerSchedule
from typing import Dict, Generator, TypedDict, List
from app.libs.scheduler.task_tree import TaskNode
from app.types import ScheduleBusyBlock


class TaskEstimate(TypedDict):
    employee_id: int
    uid: str
    time_blocks: SchedulerSchedule


class Schedule:
    employees: Dict[int, EmployeeSchedule]

    def __init__(self, employees: List[EmployeeSchedule]):
        self.employees = {}

        for employee in employees:
            self.employees[employee.id] = employee

    def flush(self):
        for employee in self.employees.values():
            employee.flush()

    def clone(self):
        employees: List[EmployeeSchedule] = []
        # TODO: use values instead of items
        for employee in self.employees.values():
            employees.append(employee.clone())

        return Schedule(employees)

    def get_node_end(self, uid: str) -> int:
        # This is a faster version of:
        # return self.get_node_blocks(uid=uid)[-1][1]
        max = 0
        for employee in self.employees.values():
            for block in employee._busy_blocks:
                if block[2] == uid and block[1] > max:
                    max = block[1]

        return max

    def get_node_start(self, uid: str) -> int:
        return self.get_node_blocks(uid=uid)[0][0]

    def get_node_blocks(self, uid: str) -> SchedulerSchedule:
        blocks: SchedulerSchedule = []
        for employee in self.employees.values():
            blocks.extend(b for b in employee.busy_blocks if b[2] == uid)

        return sorted(blocks, key=lambda block: block[0])

    def estimate_node(self, node: TaskNode) -> TaskEstimate:
        employee = self.employees[node.employee_id]

        time_blocks = employee.consume(
            amount=node.length,
            epoch=node.earliest_start(),
            uid=node.uid,
            fractionable=node.fractionable,
        )

        return {
            "employee_id": node.employee_id,
            "uid": node.uid,
            "time_blocks": time_blocks,
        }

    @classmethod
    def measure_task_estimate(cls, task_estimate: TaskEstimate):
        return sum([est[1] - est[0] for est in task_estimate["time_blocks"]])

    @classmethod
    def measure_task_estimates(cls, task_estimates: List[TaskEstimate]):
        return sum([cls.measure_task_estimate(estimate) for estimate in task_estimates])

    @classmethod
    def measure_task(cls, task_schedule: SchedulerSchedule):
        return sum([time_block[1] - time_block[0] for time_block in task_schedule])

    def commit_task_estimate(self, task_estimate: TaskEstimate):
        time_blocks = task_estimate["time_blocks"]
        employee_id = task_estimate["employee_id"]

        employee = self.employees[employee_id]
        employee.commit_blocks(time_blocks)

    def commit_task_estimates(self, task_estimates: List[TaskEstimate]):
        for task_estimate in task_estimates:
            self.commit_task_estimate(task_estimate=task_estimate)

    def snapshot(self) -> Generator[ScheduleBusyBlock, None, None]:
        for employeeSchedule in self.employees.values():
            for blocks in employeeSchedule.busy_blocks:
                yield ScheduleBusyBlock(
                    startTime=blocks[0],
                    stopTime=blocks[1],
                    uid=blocks[2],
                    roleId=blocks[3],
                )
