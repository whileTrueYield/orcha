from math import log, sqrt
from typing import Dict, List, Optional
from collections.abc import Callable

from app.libs.scheduler.schedule import Schedule
from app.libs.scheduler.task_tree import TaskTree, TaskNode
from app.libs.scheduler.schedule_cache import schedule_cache
from app.types import ScheduleSnapshot, StartedTask, Task
from tqdm import trange
from random import choice
from time import time

TIME_LIMIT = 60  # process do not run beyond 60 seconds


class Node:
    nodes: List[TaskNode]
    parent: Optional["Node"]
    prior: float
    score_sum: float
    visits: int

    def __init__(
        self,
        nodes: List[TaskNode] = [],
        parent: Optional["Node"] = None,
        prior: float = sqrt(2),
    ):
        self.children: List[Node] = []
        self.nodes = nodes
        self.prior = prior

        self.score_sum = 0.0
        self.visits = 0

        self.parent = parent
        if parent:
            parent.children.append(self)

    def relative_value(self, lowest_score: float, highest_score: float) -> float:
        """
        Compute the value of a node based on it's final result in the context
        of other results (lowest_score and highest_score)
        """
        if self.visits:
            if highest_score == lowest_score:
                return 0.5

            x = self.score_sum / self.visits
            return (x - lowest_score) / (highest_score - lowest_score)
        return 0

    def expand(self, tree: TaskTree):
        """
        Expand the current node with all the possible next nodes
        """
        for node in tree.root:
            Node(nodes=[*self.nodes, node], parent=self, prior=node.prior)

    def is_expanded(self) -> bool:
        return len(self.children) > 0


class MctsScheduler:
    """
    This is the Monte Carlo Tree Search schedule simulator.
    1. It builds a schedule by randomly choosing the tasks
    2. Once the schedule is built, it scores the quality of the schedule (sums the idle gaps)
    3. It back propagate the score on its first nodes (see MCTS description online)
    4. Repeat until it reach 2,000 simulations or the TIME_LIMIT is reached
    """

    tasks: List[Task]
    schedule: Schedule
    epoch: int
    noLimit: int
    root_node: Node

    def __init__(
        self,
        schedule: Schedule,
        epoch: int,
        tasks: List[Task] = [],
        started_tasks: List[StartedTask] = [],
        timeLimit: int = TIME_LIMIT,
    ):
        tasks = self.prioritize_started_task(tasks, started_tasks)

        self.schedule = schedule
        self.epoch = epoch
        self.tree = TaskTree(tasks, start_epoch=epoch)
        self.root_node = Node()
        self.timeLimit = timeLimit
        self.scores: List[float] = []
        self.bestSchedule = schedule
        self.normlizedSchedule = schedule
        self.bestScore = 0.0

    def prioritize_started_task(
        self, tasks: List[Task], started_tasks: List[StartedTask]
    ):
        """
        Move started task to the front
        """
        ancestry: Dict[str, List[str]] = {}

        # move any started task to the upmost priority
        # since they're being worked on
        for task in tasks:
            for started_task in started_tasks:
                if task.uid == started_task.uid:
                    task.priority = -2
                    ancestry[started_task.uid] = task.ancestors
                    task.ancestors = []

        # second pass, we re-connect ancestry, so:
        # if B was started and the ancestry was A <- B <- C
        # then we should connect A <- C back together
        for task in tasks:
            for [started_task_uid, ancestors] in ancestry.items():
                if started_task_uid in task.ancestors:
                    task.ancestors.remove(started_task_uid)
                    task.ancestors = list(set([*ancestors, *task.ancestors]))

        return tasks

    def reset(self, randomized: bool = True):
        """
        Run before every simulation, empty the schedules and reset the
        task tree comsumption.
        """
        self.tree.reset(randomized)
        self.schedule.flush()

    def selection(self, node: Node, scoring_fn: Callable[[Node], float]) -> Node:
        """
        Select the next node to be visited based on their UCB score value

        The value is estimated relative to the highest and lowest score ever encountered
        """
        best_node = node.children[0]
        best_score = scoring_fn(best_node)

        for child in node.children[1:]:
            score = scoring_fn(child)
            if score > best_score:
                best_score = score
                best_node = child

        return best_node

    def propagation(self, search_path: List[Node], score: float):
        """
        Propagate the score and the number of visit on all the visited node
        for this simulation
        """
        for node in reversed(search_path):
            node.visits += 1
            node.score_sum += score

    def get_score(self, task_nodes: List[TaskNode]) -> float:
        """
        Compute the value of a schedulle based on the sum of the idle time

        More idle time means the schedule is less efficient, therefore the
        score is lower.
        """
        populate_schedule(schedule=self.schedule, task_nodes=task_nodes)

        scores: List[float] = []

        for schedule in self.schedule.employees.values():
            free_time, busy_time = schedule.gap(self.epoch)
            scores.append(busy_time / (free_time + busy_time))

        if len(scores):
            return sum(scores) / len(scores)
        else:
            return 0

    def run(
        self,
        simulations: int,
        show_progress: bool = False,
    ) -> Node:
        self.lowest_score = None
        self.highest_score = None

        start_time = time()

        # trange will display a progress bar as we go through the simulations
        range_method = trange if show_progress else range
        for _ in range_method(simulations):
            # Simulation should not go beyond the time limit
            if time() - start_time > self.timeLimit:
                break
            self.explore()

        schedule_cache.flush()
        self.simulate_normal()
        return self.root_node

    def simulate_normal(self):
        """
        This does not attempt to explore, instead it uses the discovered
        best node to build the best possible schedule.

        This should be run at the end of an exploration to compute a normalized
        version of the schedule
        """
        node = self.root_node
        self.reset(randomized=False)

        search_path = [node]

        # explore every already expanded nodes
        while node.is_expanded():
            node = self.selection(node, node_score)
            search_path.append(node)
            self.tree.pop(node=node.nodes[-1])

        # expand one place further
        node.expand(tree=self.tree)

        # if the expansion was successful, randomly chose a node inside
        if node.children:
            next_node = choice(node.children)
            self.tree.pop(node=next_node.nodes[-1])
            search_path.append(next_node)

        # Start randomly exploring the tree from the last position
        # notice that only expanded nodes will be maintained in memory and scored
        # the following ones are for random exploration and will not be scored
        task_nodes = search_path[-1].nodes.copy()
        while task_node := self.tree.pop():
            task_nodes.append(task_node)

        # task_nodes now contains our combination of optimized steps (first nodes)
        # followed by a random selection of nodes
        self.get_score(task_nodes=task_nodes)
        self.normlizedSchedule = self.schedule.clone()

    def explore(self):
        """
        Runs a full simulation, starting from the root node and containing
        all the nodes of the tree
        """
        node = self.root_node
        self.reset()

        search_path = [node]

        # explore every already expanded nodes
        while node.is_expanded():
            node = self.selection(node, ucb_score)
            search_path.append(node)
            self.tree.pop(node=node.nodes[-1])

        # expand one place further
        node.expand(tree=self.tree)

        # if the expansion was successful, randomly chose a node inside
        if node.children:
            next_node = choice(node.children)
            self.tree.pop(node=next_node.nodes[-1])
            search_path.append(next_node)

        # Start randomly exploring the tree from the last position
        # notice that only expanded nodes will be maintained in memory and scored
        # the following ones are for random exploration and will not be scored
        task_nodes = search_path[-1].nodes.copy()
        while task_node := self.tree.pop():
            task_nodes.append(task_node)

        # task_nodes now contains our combination of optimized steps (first nodes)
        # followed by a random selection of nodes
        score = self.get_score(task_nodes=task_nodes)

        if score > self.bestScore:
            self.bestScore = score
            self.bestSchedule = self.schedule.clone()

        self.scores.append(score)

        self.propagation(search_path=search_path, score=score)

    def snapshot(self) -> List[ScheduleSnapshot]:
        predictions: List[ScheduleSnapshot] = []

        for task_node in self.tree.node_index.values():
            # Here we capture the normalized projection (last simulation)
            # that contains simplified and optimized start and stop time
            start = task_node.starts.pop()
            end = task_node.ends.pop()

            # to extract the p90, p80... we need to sort these results
            # but we ignore the last record (since it's a normalized simulation)
            node_ends = sorted(task_node.ends)
            node_starts = sorted(task_node.starts)

            predictions.append(
                ScheduleSnapshot(
                    uid=task_node.uid,
                    employee_id=task_node.employee_id,
                    end=end,
                    end_min=node_ends[0],
                    end_max=node_ends[-1],
                    end_p50=node_ends[round(len(node_ends) * 0.50)],
                    end_p70=node_ends[round(len(node_ends) * 0.70)],
                    end_p80=node_ends[round(len(node_ends) * 0.80)],
                    end_p90=node_ends[round(len(node_ends) * 0.90)],
                    end_p95=node_ends[round(len(node_ends) * 0.95)],
                    start=start,
                    start_min=node_starts[0],
                    start_max=node_starts[-1],
                    start_p50=node_starts[round(len(node_starts) * 0.50)],
                    start_p70=node_starts[round(len(node_starts) * 0.70)],
                    start_p80=node_starts[round(len(node_starts) * 0.80)],
                    start_p90=node_starts[round(len(node_starts) * 0.90)],
                    start_p95=node_starts[round(len(node_starts) * 0.95)],
                )
            )
        return predictions

    def schedule_task_nodes(self, task_nodes: List[TaskNode]):
        self.reset()

        for task_node in task_nodes:
            node = self.tree.pop(node=task_node)

            if node:
                estimate = self.schedule.estimate_node(node)
                node.start = estimate["time_blocks"][0][0]
                node.end = estimate["time_blocks"][-1][1]
                self.schedule.commit_task_estimate(estimate)

        return self.schedule


def ucb_score(node: Node) -> float:
    if node.parent and node.visits:
        return node.score_sum / node.visits + node.prior * sqrt(
            log(node.parent.visits) / (node.visits)
        )
    else:
        return node.prior


def node_score(node: Node) -> float:
    if node.visits:
        return node.score_sum / node.visits
    else:
        return node.prior


def populate_schedule(schedule: Schedule, task_nodes: List[TaskNode]):
    schedule.flush()

    for task_node in task_nodes:
        estimate = schedule.estimate_node(task_node)
        task_node.start = estimate["time_blocks"][0][0]  # retrieve the start time
        task_node.end = estimate["time_blocks"][-1][1]  # retrieve the end time
        schedule.commit_task_estimate(estimate)
