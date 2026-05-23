from collections import defaultdict, deque
from math import sqrt
from typing import DefaultDict, Deque, Dict, List, Optional, Tuple
from app.types import Task
import numpy as np


class TaskNode:
    uid: str
    employee_id: int
    deadline: Optional[int]
    successors: List["TaskNode"]
    ancestors: List["TaskNode"]
    pending_ancestor_count: int
    simulation_count: List[float]
    tree: "TaskTree"
    pert_avg: int
    prior: float
    min: int
    max: int
    likely: int
    _length: Optional[int]
    fractionable: bool
    ends: Deque[int]
    starts: Deque[int]
    _priority: int

    def __init__(
        self,
        uid: str,
        employee_id: int,
        min: int,
        max: int,
        likely: int,
        tree: "TaskTree",
        priority: int,
        deadline: Optional[int] = None,
        fractionable: bool = False,
    ):
        self.uid = uid
        self.employee_id = employee_id
        self.deadline = deadline
        self.successors = []
        self.ancestors = []
        self.tree = tree
        self._priority = priority
        self.fractionable = fractionable

        # Time estimates rules:
        # You should provide 3 estimates in seconds
        # - 0 < min < likely < max
        if not all([min, likely, max]):
            raise ValueError(f"Node {uid} has a zero estimate")

        if not min < likely:
            raise ValueError(
                f"Node {uid} min ({min}) should be less than likely ({likely}) estimate"
            )

        if not likely < max:
            raise ValueError(
                f"Node {uid} likely ({likely}) should be less than max({max}) estimate"
            )

        # We generate simulation ahead of time. The index simulation
        # for this node will be matched across with all the other nodes
        self.min = min
        self.likely = likely
        self.max = max
        self.pert_avg = round((min + likely * 4 + max) / 6)

        # This count increases with each discovered ancestor.
        # once it reaches 0, all the ancestor have been
        # processed and the TaskNode can be now processed
        self.pending_ancestor_count = 0
        self.prior = sqrt(2)
        self.ends: Deque[int] = deque([], maxlen=1000)
        self.starts: Deque[int] = deque([], maxlen=1000)

        # The beta simulation set is a random value within the boundaries
        # set by the time estimate. It will tend to have more value toward the
        # median (aka. likely) than the boundaries (aka. min and max)
        # build the beta set (1,000 records) this runs twice as fast
        # as computing a new beta distribution on demand
        lamb = 4.0
        self._r = max - min
        alpha = 1.0 + lamb * (likely - min) / self._r
        beta = 1.0 + lamb * (max - likely) / self._r

        # We use a random number of simulation to prevent task synchronization
        # during each iteration. For example some nodes will reset at iteration
        # 785, while other will at iteration 945. This provides more randomness
        # to large simulation loops
        self.pert_sim_count = np.random.randint(500, 1000)

        self.betaSet = np.random.beta(alpha, beta, self.pert_sim_count)

        # set the length for first iteration
        self.betaIndex = 0
        self.length = round(self.getPert())

    def getPert(self):
        """
        instead of computing the pert during every "reset", we pre-computed
        a set of PERT values for the node and we iterate and loop through these
        values, this speedup MCTS thanks to numpy batch creation.
        """
        self.betaIndex = self.betaIndex + 1

        if self.betaIndex == self.pert_sim_count:
            self.betaIndex = 0

        return self.min + self.betaSet[self.betaIndex] * self._r

    def inherited_deadline(self) -> Optional[int]:
        """
        DEPRECATED
        This is likely dead now that we don't use deadlines anymore
        """
        deadlines: List[int] = []

        if self.deadline is not None:
            deadlines.append(self.deadline)

        for successor in self.successors:
            successor_deadline = successor.inherited_deadline()
            if successor_deadline is not None:
                deadlines.append(successor_deadline)

        if deadlines:
            return min(deadlines) - self.pert_avg
        return None

    def add_ancestor(self, ancestor: "TaskNode"):
        self.ancestors.append(ancestor)

    def add_successor(self, successor: "TaskNode"):
        self.successors.append(successor)
        successor.add_ancestor(self)

    def decrease_ancestor_count(self) -> int:
        self.pending_ancestor_count -= 1
        return self.pending_ancestor_count

    def earliest_start(self) -> int:
        if self.ancestors:
            return max([a.end for a in self.ancestors])
        return self.tree.start_epoch

    def reset(self, randomized: bool = True):
        """
        Will set the length of a task to be randomized or using the simplified
        and static PERT estimate:

        Estimate = (min + 4 * likely + max)/6

        This allows the simulation to run with a standard value set
        to be able to generate a schedule for human to see instead of the
        real schedule existing in superposition
        """
        self.pending_ancestor_count = len(self.ancestors)
        self.length = round(
            self.getPert()
            if randomized
            else (self.min + self.max + self.likely * 4) / 6
        )

    def get_end(self) -> int:
        if self.ends:
            return self.ends[-1]
        return self.tree.start_epoch

    def set_end(self, end: int):
        self.ends.append(end)

    end = property(get_end, set_end)

    def get_start(self) -> int:
        return self.starts[-1]

    def set_start(self, start: int):
        self.starts.append(start)

    start = property(get_start, set_start)

    @property
    def priority(self):
        """
        Priority is inherited from the successor. If a successor has a lower
        priority, this node should have the a priority at least as low to be
        processed before its successor
        """
        if self.successors:
            return min([self._priority, *[node.priority for node in self.successors]])

        return self._priority

    def successor(self) -> "TaskNode":
        if self.successors:
            return [n.successor() for n in self.successors][0]
        return self


class TaskTree:
    node_index: Dict[str, TaskNode]
    initial_root: List[TaskNode]

    # this is the current root
    current_root: List[TaskNode]
    # this is all root sorted by priority
    prioritized_roots: Deque[List[TaskNode]]

    root: List[TaskNode]
    nodes: List[TaskNode]

    ancestors: DefaultDict[str, List[str]]
    start_epoch: int

    def __init__(self, tasks: List[Task], start_epoch: int = 0):
        assert start_epoch > 0

        self.initial_root: List[TaskNode] = []
        self.ancestors = defaultdict(list)
        self.node_index = {}
        self.start_epoch = start_epoch
        self.nodes = []
        self.root = []

        # Convert every steps of every tasks into a set of Task Node.
        #
        # We connect Task Nodes with each others to represent their
        # order of execution (step 1,2,3...).
        #
        # When a task have one or many task as a dependency (task A must
        # be done before task B) we also connect the first node of the
        # dependant task to all it's ancestor's node
        for task in tasks:
            # task.uid is a custom uniq identifier that is also
            # used to reference other nodes in the ancestors array:
            # for example, a step.uid could be "ticketWorkflowState:123"
            # or "projectPart:63"
            node = TaskNode(
                uid=task.uid,
                employee_id=task.employee_id,
                min=task.min,
                max=task.max,
                likely=task.likely,
                tree=self,
                fractionable=task.fractionable,
                priority=task.priority,
                deadline=task.deadline,
            )

            # add the newly created node to the tree index
            self.node_index[node.uid] = node
            self.nodes.append(node)

            # The ancestors are cross-task dependencies, we'll need to store
            # this information aside until we have all the Task Nodes created
            # to then re-establish them
            for ancestor in task.ancestors:
                # we use the node UID, which can be any string
                # like:
                # - "ticketWorkflowState:123",
                # - "projectPart:63"
                self.ancestors[node.uid].append(ancestor)

        # Add cross task dependencies.
        for [node_uid, ancestors] in self.ancestors.items():
            node = self.node_index[node_uid]

            for ancestor_id in ancestors:
                ancestorNode = self.node_index.get(ancestor_id)

                # We are only interested in ancestors that can be
                # found inside our node tree
                if ancestorNode is not None:
                    ancestorNode.add_successor(node)

        # self.compute_node_priors()
        self.reset()

    def compute_node_priors(self):
        """
        DEPRECATED: WE STOPPED USING DEADLINES

        Use nodes inherited deadlines (from successors) to build
        a prior for MCTS.

        Every deadline is measured within the boundaries of the
        longest deadline and the start epoch.

        The prior is a factor to be applied on the default node prior.
        """
        priors: List[Tuple[int, TaskNode]] = []

        for node in self.node_index.values():
            deadline = node.inherited_deadline()
            if deadline:
                priors.append((deadline, node))

        if priors:
            max_prior = max([p[0] for p in priors])
            for deadline, node in priors:
                node.prior = 2 - self.normalize(deadline, max_prior)

    def normalize(self, deadline: int, max_prior: int) -> float:
        return (deadline * self.start_epoch) / (max_prior * self.start_epoch)

    def next_root(self) -> List[TaskNode]:
        if self.prioritized_roots:
            return self.prioritized_roots.popleft()
        else:
            return []

    def build_roots(self):
        """
        Build a queue containing a list of root nodes.

        The queue is sorted by priority. This means that every root contains
        node with the same priority, starting with the lowest one (like -1)
        """
        root_by_priority: DefaultDict[int, List[TaskNode]] = defaultdict(list)
        self.prioritized_roots = deque()
        for node in self.nodes:
            # only node without ancestors can be added to the root
            if not node.ancestors:
                root_by_priority[node.priority].append(node)

        for priority in sorted(root_by_priority.keys()):
            self.prioritized_roots.append(root_by_priority[priority])

        self.root = self.next_root()

    def reset(self, randomized: bool = True):
        """
        Generate a new task set.
        """
        self.build_roots()
        self.end = None

        for node in self.nodes:
            node.reset(randomized)

    def pop(
        self,
        uid: Optional[str] = None,
        node: Optional[TaskNode] = None,
    ) -> Optional[TaskNode]:
        """
        Return a randomly chosen node from the root of the tree
        """
        # if the root is empty, lets grab the next layer
        if not self.root:
            self.root = self.next_root()

        if self.root:
            if uid is not None:
                # if we know which root node we want by ID
                index = self.root.index(self.node_index[uid])
            elif node is not None:
                # if we specify the node we want by reference
                index = self.root.index(node)
            else:
                # otherwise we'll randomly pick a node
                # index = randrange(len(self.root))
                index = np.random.randint(len(self.root))

            node = self.root.pop(index)
            if node is not None:
                # Scan all the node's successors and see if any of them are
                # ready to be added to the tree roots (a successor node can
                # have other predecessor)
                for successor in node.successors:
                    # we decount the number of ancestor for every sucessor nodes
                    if successor.decrease_ancestor_count() == 0:
                        # if there is no more dependencies, we can move the node to the root
                        # as a viable next option
                        self.root.append(successor)

            return node

        return None
