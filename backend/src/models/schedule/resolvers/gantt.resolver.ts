import { Query, Resolver, UseMiddleware, Ctx } from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { TicketStatus, ModelStage, Project } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver()
export class GanttResolver {
  @Query((_returns) => [Project])
  @UseMiddleware(hasRole([]))
  async getGanttProjects(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Project[]> {
    return ctx.prisma.project.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        ancestorIsArchived: false,
      },
      include: {
        tickets: {
          where: {
            status: TicketStatus.SCHEDULED,
            stage: ModelStage.PUBLISHED,
          },
          include: {
            product: true,
            ticketWorkflowStates: {
              where: {
                isActive: true,
              },
              orderBy: { position: "asc" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }
}
