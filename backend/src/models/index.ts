import { buildSchema, Query, Resolver } from "type-graphql";

import AuthResolver from "./auth/resolvers";
import BlackoutTimeResolver from "./blackoutTime/resolvers";
import CommentResolver from "./comment/resolvers";
import DemoResolver from "./demo/resolvers";
import DocumentationResolver from "./documentation/resolvers";
import DrawingResolver from "./drawing/resolvers";
import FeatureFlagResolver from "./featureFlag/resolvers";
import FeatureResolver from "./feature/resolvers";
import IssueResolvers from "./issue/resolvers";
import NoteResolver from "./note/resolvers";
import NoticationResolver from "./notification/resolvers";
import OrganizationResolvers from "./organization/resolvers";
import ProductResolvers from "./product/resolvers";
import ProjectResolver from "./project/resolvers";
import ReportResolver from "./report/resolvers";
import RoleResolver from "./role/resolvers";
import ScheduleResolver from "./schedule/resolvers";
import SearchResolver from "./search/resolvers";
import SkillResolver from "./skill/resolvers";
import TagResolver from "./tag/resolvers";
import TeamResolver from "./team/resolvers";
import TicketResolvers from "./ticket/resolvers";
import TodoResolvers from "./todo/resolvers";
import UserResolvers from "./user/resolvers";
import WorkflowResolver from "./workflow/resolvers";

import { MeContextMiddleware } from "../middlewares/isAuthenticated";

@Resolver()
export class VersionResolver {
  @Query(() => String!)
  version() {
    return "0.0.1";
  }
}

export async function getSchema() {
  const resolvers = [
    ...AuthResolver,
    ...BlackoutTimeResolver,
    ...CommentResolver,
    ...DemoResolver,
    ...DocumentationResolver,
    ...DrawingResolver,
    ...FeatureFlagResolver,
    ...FeatureResolver,
    ...IssueResolvers,
    ...NoteResolver,
    ...NoticationResolver,
    ...OrganizationResolvers,
    ...ProductResolvers,
    ...ProjectResolver,
    ...ReportResolver,
    ...RoleResolver,
    ...ScheduleResolver,
    ...SearchResolver,
    ...SkillResolver,
    ...TagResolver,
    ...TeamResolver,
    ...TicketResolvers,
    ...TodoResolvers,
    ...UserResolvers,
    ...WorkflowResolver,
  ];

  return buildSchema({
    resolvers: [VersionResolver, ...resolvers],
    globalMiddlewares: [MeContextMiddleware],
    validate: { forbidUnknownValues: false },
  });
}
