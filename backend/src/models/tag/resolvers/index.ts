import { CreatePersonalTagResolver } from "./createPersonalTag.resolver";
import { CreateTagResolver } from "./createTag.resolver";
import { UpdateTagResolver } from "./updateTag.resolver";
import { UpdatePersonalTagResolver } from "./updatePersonalTag.resolver";
import { TagResolver } from "./tag.resolver";
import { PersonalTagResolver } from "./personalTag.resolver";
import { TagsResolver } from "./tags.resolver";
import { PersonalTagsResolver } from "./personalTags.resolver";
import { DeleteTagResolver } from "./deleteTag.resolver";
import { DeletePersonalTagResolver } from "./deletePersonalTag.resolver";
import { MiniTagResolver } from "./miniTag.resolver";

export default [
  CreateTagResolver,
  CreatePersonalTagResolver,
  UpdateTagResolver,
  UpdatePersonalTagResolver,
  TagResolver,
  PersonalTagResolver,
  TagsResolver,
  PersonalTagsResolver,
  DeleteTagResolver,
  DeletePersonalTagResolver,
  MiniTagResolver,
];
