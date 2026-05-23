import { CreateProjectResolver } from "./createProject.resolver";
import { UpdateProjectResolver } from "./updateProject.resolver";
import { ProjectResolver } from "./project.resolver";
import { ProjectsResolver } from "./projects.resolver";
import { DeleteProjectResolver } from "./deleteProject.resolver";
import { MiniProjectResolver } from "./miniProjects.resolver";
import { ProjectAnalyticsResolver } from "./projectAnalytics.resolver";

export default [
  CreateProjectResolver,
  UpdateProjectResolver,
  ProjectResolver,
  ProjectsResolver,
  DeleteProjectResolver,
  MiniProjectResolver,
  ProjectAnalyticsResolver,
];
