/**
 * Side-effect barrel for Issue resolvers.
 *
 * Importing this module registers all Issue and IssueAction query and
 * mutation fields on the Pothos builder. No exports — purely side-effect imports.
 */

import "./issue.resolver";
import "./issues.resolver";
import "./updateIssue.resolver";
import "./deleteIssue.resolver";
import "./issueAction.resolver";
