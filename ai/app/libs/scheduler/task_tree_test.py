from typing import List, Optional
from app.types import Task
from .task_tree import TaskTree


def create_random_task(
    task_id: int,
    steps: int,
    employee_id: int = 1,
    deadline: Optional[int] = None,
    ancestors: List[str] = [],
    priority: int = 1,
) -> List[Task]:
    tasks: List[Task] = []
    ancestors = []
    for i in range(steps):
        tasks.append(
            Task(
                uid=f"{task_id}-{i}",
                step_id=i,
                employee_id=employee_id,
                min=3600,
                likely=3600 * 2,
                max=3600 * 4,
                fractionable=i % 4 == 3,
                ancestors=ancestors,
                priority=priority,
            )
        )
        # setup the next task to have the current task as an ancestor
        ancestors = [f"{task_id}-{i}"]

    # apply the deadline to the last object
    if deadline:
        tasks[-1].deadline = deadline

    return tasks


def test_should_drain_the_nodes():
    tasks: List[Task] = []

    for i in range(10):
        tasks.extend(create_random_task(i + 1, 5))

    tree = TaskTree(tasks=tasks, start_epoch=96000)

    assert len(tree.root) == 10

    count = 0
    while tree.pop():
        count += 1

    assert count == 10 * 5


def test_should_handle_dependencies():
    tasks: List[Task] = [
        *create_random_task(0, 5),  # [0..4]
        *create_random_task(1, 5),  # [5..9]
        *create_random_task(2, 5),  # [10..14]
    ]

    tasks[10].ancestors = ["1-4"]  # task 1, step 4 (last step)
    tasks[5].ancestors = ["0-4"]  # task 0, step 4 (last step)

    tree = TaskTree(tasks=tasks, start_epoch=960000)
    tree.reset()

    count = 0
    while True:
        node = tree.pop()
        if node is None:
            break

        count += 1
        assert len(tree.root) <= 1

    assert count == 3 * 5


def test_should_handle_priority():
    tasks: List[Task] = [
        *create_random_task(0, 5, priority=-1),  # priority -1 comes before P-0
        *create_random_task(1, 5, priority=0, deadline=5000),  # P-0 when deadline
        *create_random_task(2, 5),  # default to P-1
        *create_random_task(3, 5),  # default to P-1
    ]

    # by setting 3-5 as a ancestor to a priority -1 task (task 0), it inherits that priority
    tasks[0].ancestors = ["3-4"]

    tree = TaskTree(tasks=tasks, start_epoch=1)

    # because of the priority P-1, P0 to P1 we should have only on ticket at a time
    # in the tree root
    count = 0
    while True:
        node = tree.pop()
        if node is None:
            break

        count += 1
        assert len(tree.root) <= 1

    assert count == len(tasks)


def test_reset_is_idempotent():
    tasks: List[Task] = [
        *create_random_task(0, 5, priority=-1),  # priority -1 comes before P-0
        *create_random_task(1, 5, priority=0, deadline=5000),  # P-0 when deadline
        *create_random_task(2, 5),  # default to P-1
        *create_random_task(3, 5),  # default to P-1
    ]

    # by setting 3-5 as a ancestor to a priority -1 task (task 0), it inherits that priority
    tasks[0].ancestors = ["3-4"]

    tree = TaskTree(tasks=tasks, start_epoch=1)

    tree.reset()
    tree.reset()
    tree.reset()

    # because of the priority P-1, P0 to P1 we should have only on ticket at a time
    # in the tree root
    count = 0
    while True:
        node = tree.pop()
        if node is None:
            break

        count += 1
        assert len(tree.root) <= 1

    assert count == len(tasks)
