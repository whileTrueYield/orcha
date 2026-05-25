/**
 * Side-effect barrel — importing this file registers all demo types and resolvers.
 */

// Entity must be imported first to register the DemoRequest prismaObject.
import "../entity";
import "./demo.resolver";
