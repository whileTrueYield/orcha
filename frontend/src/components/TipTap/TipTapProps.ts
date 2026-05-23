export interface TipTapProps {
  content?: string | null;
  readonly?: boolean;
  autoFocus?: boolean | "start" | "end" | "all";
  showToolbar?: boolean | "minimal";
  onChange?: (json: string) => void;
  className?: string;
  placeholder?: string;
}
