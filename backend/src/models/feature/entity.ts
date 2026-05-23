import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import {
  Feature,
  FeatureGroup,
  FeatureGroupStatus,
} from "@generated/type-graphql";

export const featureGroupStatuses = Object.values(FeatureGroupStatus);

@ObjectType()
export class PaginatedFeatures extends PaginatedNodes {
  @Field(() => [Feature])
  nodes: Feature[];
}

@ObjectType()
export class PaginatedFeatureGroups extends PaginatedNodes {
  @Field(() => [FeatureGroup])
  nodes: FeatureGroup[];
}

@ObjectType()
export class MiniFeature {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field()
  featureGroupName: string;

  @Field()
  productCode: string;

  @Field()
  productName: string;
}
