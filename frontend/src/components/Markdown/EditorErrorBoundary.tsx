/**
 * EditorErrorBoundary — surfaces editor failures instead of blanking.
 *
 * The Markdown editor mounts a third-party ESM editor (Crepe) behind a
 * `React.lazy` + `Suspense`. Without a boundary, a failed chunk load or a throw
 * during the editor's setup leaves the area silently blank (the Suspense
 * fallback is null), which is hard to diagnose. This boundary catches those
 * render/lifecycle/lazy-load errors and shows the message + a Retry.
 *
 * Note: React error boundaries do NOT catch errors from async callbacks (e.g. a
 * rejected `crepe.create()` promise). MarkdownEditor forwards those into this
 * boundary by re-throwing them during render — see MarkdownEditor.tsx.
 *
 * `resetKey` clears a caught error when it changes (e.g. navigating to a
 * different ticket), so one ticket's editor failure doesn't stick to the next.
 */
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  resetKey?: unknown;
}

interface State {
  error: Error | null;
}

export class EditorErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the real cause in the console for debugging.
    console.error("Markdown editor failed:", error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div role="alert" className="m-2 rounded bg-red-50 p-3 text-red-800">
          <p className="font-medium">The editor failed to load.</p>
          <p className="mt-1 break-words text-sm">{error.message}</p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
