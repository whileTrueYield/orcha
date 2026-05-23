import { Field, Float, Int, ObjectType } from "type-graphql";

import { PaginatedNodes } from "../../utils/pagination";
import { ScheduleItem } from "@generated/type-graphql";

@ObjectType()
export class PaginatedScheduleItems extends PaginatedNodes {
  @Field(() => [ScheduleItem])
  nodes: ScheduleItem[];
}

@ObjectType()
export class ScheduleItemUpdateBoundaries {
  @Field(() => Date, { nullable: true })
  minDate: Date | null;

  @Field()
  maxDate?: Date;
}

@ObjectType()
export class ScheduleEstimate {
  @Field(() => Int)
  roleId: number;

  @Field(() => Int)
  ticketId: number;

  @Field(() => String)
  ticketTitle: string;

  @Field(() => String)
  ticketProductCode: string;

  @Field(() => Int)
  ticketLocalId: number;

  @Field(() => String)
  ticketWorkflowStateName: string;

  @Field(() => Int)
  ticketWorkflowStateId: number;

  @Field(() => Int)
  startEpoch: number;

  @Field(() => Int)
  stopEpoch: number;

  @Field(() => Int)
  duration: number;

  @Field(() => Int)
  start_min: number;
}

@ObjectType()
export class ScheduleRole {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => Float, { description: "available time in hours" })
  pastCapacity: number;

  @Field(() => Float, { description: "available time in hours" })
  futureCapacity: number;
}
