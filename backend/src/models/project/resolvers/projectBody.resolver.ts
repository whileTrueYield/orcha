/**
 * Project.body field (#40) — reads the project's Markdown body + version through
 * the body repository (ADR 0007). An unwritten body reads as
 * { markdown: "", version: 0 }, so this field is non-nullable.
 */

import builder from "../../../schema/builder";
import { getBody } from "../../../markdown/bodyRepository";
import { DocumentBodyRef } from "../../documentBody/entity";

builder.prismaObjectField("Project", "body", (t) =>
  t.field({
    type: DocumentBodyRef,
    resolve: (project) => getBody("project", project.id),
  }),
);
