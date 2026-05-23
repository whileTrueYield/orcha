import { CreateNoteResolver } from "./createNote.resolver";
import { UpdateNoteResolver } from "./updateNote.resolver";
import { NoteResolver } from "./note.resolver";
import { NotesResolver } from "./notes.resolver";
import { DeleteNoteResolver } from "./deleteNote.resolver";

export default [
  CreateNoteResolver,
  UpdateNoteResolver,
  NoteResolver,
  NotesResolver,
  DeleteNoteResolver,
];
