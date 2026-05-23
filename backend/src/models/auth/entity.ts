import { Field, ObjectType, registerEnumType } from "type-graphql";
import { Organization, Role, User } from "@generated/type-graphql";
import { AuthStatus } from "../../types";

registerEnumType(AuthStatus, { name: "AuthStatus" });

@ObjectType()
export class Me {
  @Field((_type) => Role, { nullable: true })
  role?: Role;

  @Field((_type) => Organization, { nullable: true })
  organization?: Organization;

  @Field((_type) => User, { nullable: true })
  user?: User;

  @Field((_type) => AuthStatus)
  status: AuthStatus;
}
