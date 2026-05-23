import { CreateDocumentationResolver } from "./createDocumentation.resolver";
import { DeleteDocumentationResolver } from "./deleteDocumentation.resolver";
import { DocumentationPageResolver } from "./documentationPage.resolver";
import { DocumentationResolver } from "./documentation.resolver";
import { DocumentationsResolver } from "./documentations.resolver";
import { PublishDocumentationResolver } from "./publishDocumentation";
import { UpdateDocumentationPageResolver } from "./updateDocumentationPage.resolver";
import { UpdateDocumentationResolver } from "./updateDocumentation.resolver";

export default [
  CreateDocumentationResolver,
  DeleteDocumentationResolver,
  DocumentationPageResolver,
  DocumentationResolver,
  DocumentationsResolver,
  PublishDocumentationResolver,
  UpdateDocumentationPageResolver,
  UpdateDocumentationResolver,
];
