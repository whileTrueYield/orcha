/**
 * DemoRequest Pothos type registration.
 *
 * Registers the DemoRequest Prisma object so it can be referenced
 * by the demo resolvers via `t.prismaField({ type: "DemoRequest" })`.
 *
 * Exports: DemoRequestRef.
 */

import builder from "../../schema/builder";
import { DemoStatusEnum } from "../../schema/enums";

export const DemoRequestRef = builder.prismaObject("DemoRequest", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    ip_address: t.exposeString("ip_address"),
    status: t.expose("status", { type: DemoStatusEnum }),
    config: t.exposeString("config"),
    confirmed: t.exposeBoolean("confirmed"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});
