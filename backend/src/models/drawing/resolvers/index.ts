/**
 * Side-effect barrel — importing this file registers all drawing resolvers.
 *
 * The drawing.resolver module must be imported first because it registers
 * the Drawing Prisma object type that the other resolvers reference.
 */

import "./drawing.resolver";
import "./createDrawing.resolver";
import "./deleteDrawing.resolver";
import "./updateDrawing.resolver";
