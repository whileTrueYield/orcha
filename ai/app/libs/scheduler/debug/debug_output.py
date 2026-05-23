from typing import List, Optional

from app.libs.scheduler.schedule import Schedule
from ..mcts_scheduler import Node
import os


__location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))


def create_digraph(
    node: Node,
    filename: str = "output.dot",
):
    with open(filename, "w+") as f:
        f.write(
            """digraph {
node [fontsize=10, shape=box, height=0.25];
edge [fontsize=10];
"""  # rankdir=LR;
        )
        f.writelines(digraph(node))
        f.write("}")


def digraph(
    node: Node,
    index: str = "0",
    parent: str = "",
    best: bool = True,
) -> List[str]:
    lines: List[str] = []

    node_uid = node.nodes and node.nodes[-1].uid or "<root>"
    color = best and "green" or "gray"
    bgcolor = best and "lightgreen" or node.visits > 0 and "lightblue" or "gray95"
    style = best and "bold" or node.visits > 0 and "solid" or "dashed"
    lines.append(
        'n%s [label="%.2f/%.2f \\n T %s (%d) \\n Pr %.4f (P %d)" color=%s style=filled color=%s];\n'
        % (
            index,
            node.score_sum / node.visits,
            node.prior,
            node_uid,
            node.visits,
            node.prior,
            node.nodes[-1].priority if node.nodes else 0,
            color,
            bgcolor,
        )
    )

    best_node = None
    if best and node.children:
        children_with_visits = [node for node in node.children if node.visits]
        best_node = max(
            children_with_visits,
            key=lambda child: child.score_sum / child.visits,
        )

    for idx, child in enumerate(node.children):
        if child.visits:
            node_id = node.nodes[-1].uid.replace("-", "_") if node.nodes else ""
            lines.extend(
                digraph(
                    node=child,
                    index="%s_%st%s" % (index, idx, node_id),
                    parent=index,
                    best=best and child == best_node,
                )
            )

    if parent:
        lines.append(
            "n%s -> n%s [color = %s style=%s];\n" % (parent, index, color, style)
        )

    return lines


PX_PER_HR = 80

COLOR_SET: List[str] = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
]


def create_html_schedule(
    schedule: Schedule,
    epoch: int,
    node: Node,
    note: Optional[str] = None,
    output: str = "output.html",
):
    rows: List[List[str]] = []

    for employee in sorted(schedule.employees.values(), key=lambda x: x.id):
        columns: List[str] = []
        for block in employee.busy_blocks:
            [task_id, step_id] = block[2].split("-")
            styles = "left: %dpx;width: %dpx; background: %s" % (
                (block[0] - epoch) / (3600 / PX_PER_HR),
                (block[1] - block[0]) / (3600 / PX_PER_HR),
                COLOR_SET[int(task_id) % len(COLOR_SET)],
            )
            columns.append(
                '<div style="%s" title="%s" employee_id="%s" class="box"><span>task %s<br />step %s</span></div>'
                % (styles, block[1], employee.id, task_id, step_id)
            )

        rows.append(columns)

    html_elts: List[str] = []
    html_elts.append("<div>")
    for row in rows:
        html_elts.append('<div class="row">')
        for column in row:
            html_elts.append(column)
        html_elts.append("</div>")
    html_elts.append("</div>")

    html_elts.append("<div>")
    if note is not None:
        html_elts.append(f'<div class="note">{note}</div>')

    # html_elts.append(
    #     f'<div style="margin: 1rem">best: {highest_score:,.4f}, worst: {lowest_score:,.4f}</div>'
    # )
    html_elts.append('<div class="sub_container">')
    html_elts.append('<div class="task_status">')
    on_time_count = 0
    late_count = 0
    time_late = 0
    time_ahead = 0

    # for task_node in task_nodes:
    #     task_schedule = schedule.get(task_id=task.id)
    #     deltas.append(task.deadline - task_schedule[-1][1])
    # if task_schedule[-1][1] > task.deadline:
    #     late_count += 1
    #     html_elts.append(
    #         '<div class="task late">task %s is late by %dh</div>'
    #         % (task.id, (task_schedule[-1][1] - task.deadline) / 3600)
    #     )
    #     time_late += task_schedule[-1][1] - task.deadline

    # else:
    #     on_time_count += 1
    #     html_elts.append(
    #         '<div class="task ontime">task %s is on time by %dh</div>'
    #         % (task.id, (task.deadline - task_schedule[-1][1]) / 3600)
    #     )
    #     time_ahead += task.deadline - task_schedule[-1][1]

    # if len(deltas) > 1:
    #     html_elts.append(
    #         f'<div style="margin: 1rem">std dev: {statistics.stdev(deltas)/3600. :.2f}, '
    #         + f"mean: {statistics.mean(deltas) /3600.:.2f}</div>"
    #     )

    html_elts.append("</div>")
    html_elts.append('<div class="nodes">')
    all_visits = sum(n.visits for n in node.children)

    for child in sorted(
        node.children,
        key=lambda n: n.visits > 0 and n.score_sum / n.visits or 0,
        reverse=True,
    ):
        html_elts.append('<p class="node">')
        html_elts.append(
            f"{child.score_sum:.4f} / task ID: {child.nodes[0].uid} "
            + f"/ V:{100 * child.visits / all_visits:.2f}% / P:{child.prior:.4f}"
        )
        html_elts.append("</p>")
    html_elts.append("</div>")
    html_elts.append("</div>")
    html_elts.append(
        f'<div style="margin: 1rem">on time: {on_time_count} ({int(time_ahead / 3600):,} Hr)'
        + f", late: {late_count} ({int(time_late / 3600):,} Hr)</div>"
    )

    html_elts.append("</div>")

    template_file = open(os.path.join(__location__, "debug_template.html"), "r")
    template = template_file.read()
    with open(output, "w+") as f:
        f.write(template.replace("HTML_SCHEDULE", "\n".join(html_elts)))
