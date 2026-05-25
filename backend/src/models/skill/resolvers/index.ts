/**
 * Side-effect barrel — importing this file registers all skill types and resolvers.
 */

// Entity must be imported first to register the Skill prismaObject.
import "../entity";
import "./updateSkill.resolver";
