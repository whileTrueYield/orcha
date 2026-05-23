import { Field, Int, ID, Float, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Report } from "@generated/type-graphql";
import { ReportWidgetType } from "@prisma/client";

@ObjectType()
export class PaginatedReports extends PaginatedNodes {
  @Field(() => [Report])
  nodes: Report[];
}

export const reportWidgetTypes = Object.values(ReportWidgetType);

@ObjectType()
export class FilterElement {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  recordId: number;

  @Field()
  label: string;
}

@ObjectType()
export class QueryAggregate {
  @Field(() => Float)
  value: number;

  @Field({ nullable: true })
  main?: string;

  @Field({ nullable: true })
  secondary?: string;
}

@ObjectType()
export class ReportAggregate {
  @Field(() => [QueryAggregate])
  primary: QueryAggregate[];

  @Field(() => [QueryAggregate])
  secondary: QueryAggregate[];
}
