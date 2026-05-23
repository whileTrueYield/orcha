import { CreateTeamResolver } from "./createTeam.resolver";
import { UpdateTeamResolver } from "./updateTeam.resolver";
import { TeamResolver } from "./team.resolver";
import { TeamsResolver } from "./teams.resolver";
import { TeamByCodeResolver } from "./teamByCode.resolver";
import { DeleteTeamResolver } from "./deleteTeam.resolver";

export default [
  CreateTeamResolver,
  UpdateTeamResolver,
  TeamResolver,
  TeamByCodeResolver,
  TeamsResolver,
  DeleteTeamResolver,
];
