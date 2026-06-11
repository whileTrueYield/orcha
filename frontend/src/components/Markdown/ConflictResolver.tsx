/**
 * ConflictResolver — the side-by-side picker shown when saveDocumentBody returns
 * a 409. It renders the server's structured conflict regions (NOT git-markered
 * Markdown, which a WYSIWYG editor mis-parses): unchanged text as muted context,
 * and each overlap as "Your version" / "Their version" monospace panels with
 * Keep yours / Keep theirs / Keep both. Once every clash has a choice, it
 * reassembles clean Markdown and hands it to `onResolve` to save.
 *
 * Exports: ConflictResolver (default), reassembleBody, serverVersion.
 *
 * No editor dependency, so it is fully testable in jsdom.
 */
import { useState } from "react";
import cn from "classnames";
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

const renderLines = (lines: string[]) =>
  lines.length ? lines.join("\n") : "(removed)";

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
    <div className="space-y-3 p-4">
      {regions.map((region, index) => {
        if (region.kind === ConflictRegionKind.Stable) {
          const text = region.lines.join("\n");
          return text.trim() ? (
            <p
              key={index}
              className="whitespace-pre-wrap text-sm text-gray-500"
            >
              {text}
            </p>
          ) : null;
        }

        const choice = choices[index];
        return (
          <div
            key={index}
            className="rounded-md border border-amber-200 bg-amber-50/40 p-3"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-700">
              You both edited this
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <ConflictPanel
                label="Your version"
                keepLabel="Keep yours"
                lines={region.ours}
                selected={choice === "ours"}
                onSelect={() => choose(index, "ours")}
              />
              <ConflictPanel
                label="Their version"
                keepLabel="Keep theirs"
                lines={region.theirs}
                selected={choice === "theirs"}
                onSelect={() => choose(index, "theirs")}
              />
            </div>
            <div className="mt-2 flex justify-center">
              <Button
                type="button"
                btnSize="xsmall"
                btnType={choice === "both" ? "primary" : "secondaryWhite"}
                onClick={() => choose(index, "both")}
              >
                Keep both
              </Button>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-x-2 pt-2">
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

const ConflictPanel: React.FC<{
  label: string;
  keepLabel: string;
  lines: string[];
  selected: boolean;
  onSelect: () => void;
}> = ({ label, keepLabel, lines, selected, onSelect }) => (
  <div
    className={cn(
      "rounded border p-2",
      selected ? "border-brand-500 ring-1 ring-brand-400" : "border-gray-200",
    )}
  >
    <div className="mb-1 text-xs font-medium text-gray-600">{label}</div>
    <pre className="mb-2 whitespace-pre-wrap break-words font-mono text-xs text-gray-800">
      {renderLines(lines)}
    </pre>
    <Button
      type="button"
      btnSize="xsmall"
      btnType={selected ? "primary" : "secondaryWhite"}
      onClick={onSelect}
    >
      {selected ? "Selected" : keepLabel}
    </Button>
  </div>
);

export default ConflictResolver;
