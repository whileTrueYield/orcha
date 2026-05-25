/**
 * Side-effect barrel — importing this file registers all auth types and resolvers.
 */

// Entity must be imported first to register the Me object type and AuthStatus enum.
import "../entity";
import "./auth.resolver";
