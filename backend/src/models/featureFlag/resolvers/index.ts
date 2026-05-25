/**
 * Side-effect barrel — importing this file registers all featureFlag types and resolvers.
 */

// Entity must be imported first to register the FeatureFlag prismaObject.
import "../entity";
import "./featureFlag.resolver";
