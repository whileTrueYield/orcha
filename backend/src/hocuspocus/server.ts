import { hocusPocus } from "./hocuspocus";

hocusPocus.enableMessageLogging();
hocusPocus.disableDebugging();
// FIXME: Temporarily forcing the port for standalone run
// while we do the transition
hocusPocus.listen();
