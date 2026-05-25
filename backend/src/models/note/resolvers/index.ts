/**
 * Side-effect barrel for Note resolvers.
 *
 * Importing this module registers all Note query and mutation fields
 * on the Pothos builder. No exports — purely side-effect imports.
 */

import "./note.resolver";
import "./notes.resolver";
import "./createNote.resolver";
import "./updateNote.resolver";
import "./deleteNote.resolver";
