from typing import List
from .task_tree import TaskTree, Task, WorkflowStep
from random import choice


def create_random_task(task_id: int, steps: int) -> Task:
    workflow_steps: List[WorkflowStep] = []
    for i in range(steps):
        workflow_steps.append(
            WorkflowStep(
                step_id=i,
                employee_id=choice([1, 2, 3, 4, 5, 6, 7, 8, 9]),
                min=60,
                likely=120,
                max=180,
            )
        )

    return Task(id=task_id, ancestors=[], deadline=0, steps=workflow_steps)


def test():
    tasks: List[Task] = []

    for i in range(100):
        tasks.append(create_random_task(i, 5))

    tasks[1].ancestors = [2, 9]
    tasks[2].ancestors = [3]
    tasks[3].ancestors = [4, 5, 6]
    tasks[5].ancestors = [7]
    tasks[8].ancestors = [9]
    tasks[18].ancestors = [19]
    tasks[28].ancestors = [29]
    tasks[38].ancestors = [39]
    tasks[48].ancestors = [49]
    tasks[58].ancestors = [59]
    tasks[58].ancestors = [69]

    tree = TaskTree(tasks=tasks, simulations=100)
    for i in range(1000):
        tree.reset()
        count = 0
        while True:
            node = tree.random_pop()
            if node:
                node.estimate(tree.sim_index)
                count += 1
            else:
                assert count == 100 * 5
                break


if __name__ == "__main__":
    test()
