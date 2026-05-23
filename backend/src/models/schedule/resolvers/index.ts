import { CreateScheduleItemResolver } from "./createScheduleItem.resolver";
import { ScheduleItemResolver } from "./scheduleItem.resolver";
import { ScheduleItemsResolver } from "./scheduleItems.resolver";
import { UpdateScheduleItemResolver } from "./updateScheduleItem.resolver";
import { DeleteScheduleItemResolver } from "./deleteScheduleItem.resolver";
import { EstimateResolver } from "./estimate.resolver";
import { ScheduleConfigResolver } from "./ScheduleConfig.resolver";
import { TimeOffsResolver } from "./timeOffs.resolver";
import { DeleteTimeOffResolver } from "./deleteTimeOff.resolver";
import { UpdateTimeOffResolver } from "./updateTimeOff.resolver";
import { CreateTimeOffResolver } from "./createTimeOff.resolver";
import { SwimlaneResolver } from "./swimlane.resolver";
import { GanttResolver } from "./gantt.resolver";

export default [
  CreateScheduleItemResolver,
  ScheduleItemResolver,
  ScheduleItemsResolver,
  UpdateScheduleItemResolver,
  DeleteScheduleItemResolver,
  EstimateResolver,
  ScheduleConfigResolver,
  TimeOffsResolver,
  DeleteTimeOffResolver,
  UpdateTimeOffResolver,
  CreateTimeOffResolver,
  SwimlaneResolver,
  GanttResolver,
];
