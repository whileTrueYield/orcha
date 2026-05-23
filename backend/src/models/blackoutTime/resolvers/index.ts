import { BlackoutTimeResolver } from "./blackoutTime.resolver";
import { BlackoutTimesResolver } from "./blackoutTimes.resolver";
import { CreateBlackoutTimeResolver } from "./createBlackOut.resolver";
import { CreateRecurringBlackoutTimeResolver } from "./createRecurringBlackOut.resolver";
import { DeleteBlackoutTimeResolver } from "./deleteBlackOut.resolver";
import { DeleteRecurringBlackoutTimeResolver } from "./deleteRecurringBlackOut.resolver";
import { RecurringBlackoutTimeResolver } from "./recurringBlackoutTime.resolver";
import { RecurringBlackoutTimesResolver } from "./recurringBlackoutTimes.resolver";
import { UpdateBlackoutTimeResolver } from "./updateBlackoutTime.resolver";
import { UpdateRecurringBlackoutTimeResolver } from "./updateRecurringBlackoutTime.resolver";

export default [
  BlackoutTimeResolver,
  UpdateBlackoutTimeResolver,
  BlackoutTimesResolver,
  CreateBlackoutTimeResolver,
  DeleteBlackoutTimeResolver,

  RecurringBlackoutTimeResolver,
  RecurringBlackoutTimesResolver,
  UpdateRecurringBlackoutTimeResolver,
  CreateRecurringBlackoutTimeResolver,
  DeleteRecurringBlackoutTimeResolver,
];
