import { AcceptRoleResolver } from "./acceptRole.resolver";
import { DeleteRoleResolver } from "./deleteRole.resolver";
import { InviteResolver } from "./invite.resolver";
import { RejectRoleResolver } from "./rejectRole.resolver";
import { RoleResolver } from "./role.resolver";
import { MiniRoleResolver } from "./miniRole.resolver";
import { RolesResolver } from "./roles.resolver";
import { UpdateRoleResolver } from "./updateRole.resolver";
import { UpdateRolePreferencesResolver } from "./updateRolePreferences.resolver";
import { ReactivateRoleResolver } from "./reactivateRole.resolver";

export default [
  AcceptRoleResolver,
  DeleteRoleResolver,
  InviteResolver,
  RejectRoleResolver,
  RoleResolver,
  RolesResolver,
  UpdateRoleResolver,
  MiniRoleResolver,
  UpdateRolePreferencesResolver,
  ReactivateRoleResolver,
];
