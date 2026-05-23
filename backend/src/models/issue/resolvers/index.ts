import { UpdateIssueResolver } from "./updateIssue.resolver";
import { IssueResolver } from "./issue.resolver";
import { IssuesResolver } from "./issues.resolver";
import { DeleteIssueResolver } from "./deleteIssue.resolver";
import { IssueActionResolver } from "./issueAction.resolver";

export default [
  UpdateIssueResolver,
  IssueResolver,
  IssuesResolver,
  DeleteIssueResolver,
  IssueActionResolver,
];
