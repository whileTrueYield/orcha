/**
 * ConflictResolver — the side-by-side picker shown when saveDocumentBody returns
 * a 409. It renders the server's structured conflict regions (NOT git-markered
 * Markdown, which a WYSIWYG editor mis-parses): unchanged text as muted context,
 * and each overlap as a word-level split diff (Their version | Your version) with
 * Keep theirs / Keep both / Keep yours. Once every clash has a choice, it
 * reassembles clean Markdown and hands it to `onResolve` to save.
 *
 * The diff is rendered by react-diff-viewer-continued so the two near-identical
 * sides show only what actually changed, word by word. That library pulls in a
 * web worker / ResizeObserver / layout measurement, so jsdom tests mock it (the
 * same "untestable visual boundary" treatment the Crepe editor gets); the real
 * diff is verified by eye in the running app.
 *
 * Exports: ConflictResolver (default), reassembleBody, serverVersion.
 */
import { useState } from "react";
import DiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import { ConflictRegion, ConflictRegionKind } from "types/graphql";
import { Button } from "components/fields/Button";

export type RegionChoice = "ours" | "theirs" | "both";

// Reassemble the body from a choice per conflict region. The inverse of how the
// backend merge() split the body on "\n", so a full "ours" pick round-trips to
// our submission woven with the stable text, byte-for-byte.
export function reassembleBody(
  regions: ConflictRegion[],
  choices: Record<number, RegionChoice>,
): string {
  const lines: string[] = [];
  regions.forEach((region, index) => {
    if (region.kind === ConflictRegionKind.Stable) {
      lines.push(...region.lines);
      return;
    }
    const choice = choices[index];
    // A conflict region with no choice is a caller bug — the UI gates "Resolve &
    // Save" on every conflict being chosen, so reaching here means someone called
    // reassembleBody with an incomplete map. Fail loudly rather than silently
    // emitting an arbitrary (ours+theirs) body.
    if (choice === undefined)
      throw new Error(
        `reassembleBody: conflict region ${index} has no choice; resolve every conflict before reassembling`,
      );
    if (choice === "ours") lines.push(...region.ours);
    else if (choice === "theirs") lines.push(...region.theirs);
    else lines.push(...region.ours, ...region.theirs); // "both": ours then theirs
  });
  return lines.join("\n");
}

// The current stored body: the 3-way merge labels the server's side `theirs`, so
// taking theirs everywhere reproduces it — used to "discard my changes" with no
// extra round-trip.
export function serverVersion(regions: ConflictRegion[]): string {
  const choices: Record<number, RegionChoice> = {};
  regions.forEach((region, index) => {
    if (region.kind === ConflictRegionKind.Conflict) choices[index] = "theirs";
  });
  return reassembleBody(regions, choices);
}

interface Props {
  regions: ConflictRegion[];
  saving: boolean;
  onResolve: (markdown: string) => void;
  onCancel: () => void;
}

// Tune the diff viewer to the app's palette: white surface, gray gutters, and
// Tailwind green/red for added (yours) / removed (theirs), so it sits inside the
// neutral conflict card without fighting it.
const diffStyles = {
  variables: {
    light: {
      diffViewerBackground: "#ffffff",
      diffViewerColor: "#1f2937", // gray-800
      addedBackground: "#f0fdf4", // green-50
      addedColor: "#166534", // green-800
      removedBackground: "#fef2f2", // red-50
      removedColor: "#991b1b", // red-800
      wordAddedBackground: "#bbf7d0", // green-200
      wordRemovedBackground: "#fecaca", // red-200
      addedGutterBackground: "#dcfce7", // green-100
      removedGutterBackground: "#fee2e2", // red-100
      gutterBackground: "#f9fafb", // gray-50
      gutterColor: "#9ca3af", // gray-400
      diffViewerTitleBackground: "#f9fafb",
      diffViewerTitleColor: "#6b7280", // gray-500
      diffViewerTitleBorderColor: "#e5e7eb", // gray-200
    },
  },
  // The library floors the split table at minWidth:1000px and only releases it
  // under a 768px *viewport* media query — so inside a card narrower than 1000px
  // on a wide screen the table overflows and the card clips it. Drop the floor so
  // the fixed-layout table fits the card and the two columns wrap evenly.
  diffContainer: { minWidth: "unset" },
  contentText: { fontSize: "0.8125rem", lineHeight: "1.45" },
  lineNumber: { fontSize: "0.6875rem" },
  titleBlock: {
    fontSize: "0.6875rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
};

const ConflictResolver: React.FC<Props> = ({
  regions,
  saving,
  onResolve,
  onCancel,
}) => {
  const [choices, setChoices] = useState<Record<number, RegionChoice>>({});

  const choose = (index: number, choice: RegionChoice) =>
    setChoices((prev) => ({ ...prev, [index]: choice }));

  // Every conflicting region must have a choice before we can produce a body.
  const allChosen = regions.every(
    (region, index) =>
      region.kind === ConflictRegionKind.Stable || choices[index] !== undefined,
  );

  return (
    <div className="space-y-4 p-4">
      {regions.map((region, index) => {
        if (region.kind === ConflictRegionKind.Stable) {
          const text = region.lines.join("\n");
          return text.trim() ? (
            <p
              key={index}
              className="whitespace-pre-wrap px-1 text-sm text-gray-500"
            >
              {text}
            </p>
          ) : null;
        }

        const choice = choices[index];
        return (
          // Neutral card — amber is reserved for the top-level "edited elsewhere"
          // banner, so the card doesn't read as a callout-inside-a-callout.
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-amber-600">
              You both edited this
            </div>
            <DiffViewer
              // left = current server text, right = your edit; word-level so the
              // single changed word stands out instead of a wall of identical text.
              oldValue={region.theirs.join("\n")}
              newValue={region.ours.join("\n")}
              splitView
              compareMethod={DiffMethod.WORDS}
              leftTitle="Their version"
              rightTitle="Your version"
              hideSummary
              // The worker bundle is brittle across bundlers; these bodies are
              // tiny, so the synchronous fallback is more than fast enough.
              disableWorker
              styles={diffStyles}
            />
            {/* Buttons sit under the column they keep: theirs (left) … yours (right). */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <ChoiceButton
                selected={choice === "theirs"}
                onSelect={() => choose(index, "theirs")}
              >
                Keep theirs
              </ChoiceButton>
              <ChoiceButton
                selected={choice === "both"}
                onSelect={() => choose(index, "both")}
              >
                Keep both
              </ChoiceButton>
              <ChoiceButton
                selected={choice === "ours"}
                onSelect={() => choose(index, "ours")}
              >
                Keep yours
              </ChoiceButton>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-x-2 pt-1">
        <Button
          type="button"
          btnType="secondaryWhite"
          btnSize="small"
          disabled={saving}
          onClick={onCancel}
        >
          Discard my changes
        </Button>
        <Button
          type="button"
          btnType="primary"
          btnSize="small"
          disabled={!allChosen || saving}
          onClick={() => onResolve(reassembleBody(regions, choices))}
        >
          {saving ? "Saving…" : "Resolve & Save"}
        </Button>
      </div>
    </div>
  );
};

// A per-side keep button: a real outlined button when unselected (white), filled
// brand when selected — so the picks read as buttons, not links.
const ChoiceButton: React.FC<{
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}> = ({ selected, onSelect, children }) => (
  <Button
    type="button"
    btnSize="small"
    btnType={selected ? "primary" : "white"}
    onClick={onSelect}
  >
    {selected ? `✓ ${children}` : children}
  </Button>
);

export default ConflictResolver;
