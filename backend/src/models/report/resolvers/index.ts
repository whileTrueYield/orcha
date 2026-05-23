import { CreateReportResolver } from "./createReport.resolver";
import { CreateReportQueryResolver } from "./createReportQuery.resolver";
import { DeleteReportResolver } from "./deleteReport.resolver";
import { ReportResolver } from "./report.resolver";
import { ReportQueryResolver } from "./reportQuery.resolver";
import { ReportsResolver } from "./reports.resolver";
import { UpdateReportQueryResolver } from "./updateReportQuery.resolver";

export default [
  CreateReportResolver,
  DeleteReportResolver,
  ReportResolver,
  ReportsResolver,
  CreateReportQueryResolver,
  UpdateReportQueryResolver,
  ReportQueryResolver,
];
