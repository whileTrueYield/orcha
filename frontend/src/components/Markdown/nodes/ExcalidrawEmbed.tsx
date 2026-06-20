/**
 * The block Excalidraw embed (PRD #36, issue #42) — a near-verbatim port of the
 * Tiptap-era DrawingComponent (see git history: `TipTap/extensions/Drawing/`).
 *
 * The Markdown body only stores a `::excalidraw{id}` reference; the scene lives
 * in the unchanged Drawing store. Inline the canvas is read-only; double-click
 * (or the expand button) goes full screen, which acquires the drawing lock and
 * enables editing. Changes save debounced while editing (renewing the lock) and
 * once more on exit/unmount; leaving full screen releases the lock.
 *
 * Unlike the Tiptap version, the embed never creates a Drawing — the autocomplete
 * creates the record first and inserts the node with its id, so a rendered embed
 * can assume the record exists (crash-early: a failed fetch shows an error
 * placeholder instead of silently spawning a new drawing).
 *
 * Public API:
 *   - ExcalidrawEmbed({ id, onDelete })
 *
 * Assumes it renders inside `reactNodeView`'s EmbedProviders (Apollo present,
 * no React Router).
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { Excalidraw, MainMenu, serializeAsJSON } from "@excalidraw/excalidraw";
import {
  AppState,
  BinaryFileData,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { ArrowsExpandIcon, TrashIcon } from "@heroicons/react/outline";
import { filter } from "lodash";
import cn from "classnames";
import { useMutation, useQuery } from "@apollo/client";

import { uploadFileToCdn } from "upload/uploadFile";
import { useDebounceFn } from "components/taskManager/hooks";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import {
  Drawing,
  MutationGetDrawingLockArgs,
  MutationReleaseDrawingLockArgs,
  MutationUpdateDrawingArgs,
  QueryDrawingArgs,
} from "types/graphql";
import { onGraphQLError } from "utils/GQLClient";

import {
  GET_DRAWING,
  GET_DRAWING_LOCK,
  RELEASE_DRAWING_LOCK,
  UPDATE_DRAWING,
} from "./excalidrawGraphql";
import { resolvablePromise, ResolvablePromise, urltoDataUrl } from "./excalidrawUtils";
// Excalidraw 0.17+ no longer auto-injects its stylesheet (the pre-0.17 UMD
// build did); the ESM build requires importing it explicitly or the canvas and
// its UI render unstyled. Import it before our overrides so ./excalidraw.css wins.
import "@excalidraw/excalidraw/index.css";
import "./excalidraw.css";

interface Props {
  id: number;
  onDelete: () => void;
}

export function ExcalidrawEmbed({ id, onDelete }: Props) {
  const lastSave = useRef<string | undefined>(undefined);
  const currentState = useRef<string | undefined>(undefined);
  // The optimistic-concurrency token for updateDrawing. A ref, not state: lock
  // acquisition bumps `updatedAt` server-side (Prisma @updatedAt), and a
  // debounced save holding a pre-lock copy in its closure would be rejected as
  // stale ("changed since you opened it"). The ref makes every save read the
  // newest token no matter when its timer was scheduled.
  const updatedAtRef = useRef<Drawing["updatedAt"] | undefined>(undefined);
  const [initialData, setInitialData] = useState<string>();

  const containerRef = useRef<HTMLDivElement>(null);
  const [fullScreen, _setFullScreen] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const { error } = useQuery<QueryReturnValue["drawing"], QueryDrawingArgs>(
    GET_DRAWING,
    {
      variables: { id },
      onCompleted: ({ drawing }) => {
        setInitialData(drawing.data);
        lastSave.current = drawing.data;
        updatedAtRef.current = drawing.updatedAt;
      },
    },
  );

  const [updateDrawing] = useMutation<
    MutationReturnValue["updateDrawing"],
    MutationUpdateDrawingArgs
  >(UPDATE_DRAWING);

  const [getDrawingLock] = useMutation<
    MutationReturnValue["getDrawingLock"],
    MutationGetDrawingLockArgs
  >(GET_DRAWING_LOCK);

  const [releaseDrawingLock] = useMutation<
    MutationReturnValue["releaseDrawingLock"],
    MutationReleaseDrawingLockArgs
  >(RELEASE_DRAWING_LOCK, { variables: { drawingId: id } });

  // Excalidraw accepts a promise as initialData; it resolves only once the
  // scene's images have been fetched (see the effect below).
  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  // The canvas is being resized when toggling full screen; deferring gives the
  // container time to settle before zoom-to-fit measures it.
  const deferredZoomToFit = useCallback(() => {
    setTimeout(() => {
      if (excalidrawAPI) {
        excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements(), {
          fitToContent: true,
          animate: false,
        });
      }
    }, 100);
  }, [excalidrawAPI]);

  // Save to the backend only if changes exist since the last save. Returns the
  // mutation promise so callers can sequence against it (always a promise, even
  // when there is nothing to save).
  const saveOnChange = useCallback(
    (renewLock: boolean = false): Promise<unknown> => {
      if (
        lastSave.current &&
        currentState.current &&
        lastSave.current !== currentState.current
      ) {
        return updateDrawing({
          variables: {
            drawingId: id,
            input: {
              data: currentState.current,
              renewLock,
              updatedAt: updatedAtRef.current,
            },
          },
          onError: onGraphQLError({ title: "could not save your changes" }),
          onCompleted: ({ updateDrawing }) => {
            lastSave.current = updateDrawing.data;
            updatedAtRef.current = updateDrawing.updatedAt;
          },
        });
      }
      return Promise.resolve();
    },
    [id, updateDrawing],
  );

  // Entering full screen acquires the drawing lock (pulling the latest scene)
  // and enables editing; leaving saves pending changes and releases the lock.
  const setFullScreen = (next: boolean) => {
    if (next) {
      getDrawingLock({
        variables: { drawingId: id, force: false },
        onError: onGraphQLError({ title: "Could not acquire lock" }),
        onCompleted: ({ getDrawingLock }) => {
          if (excalidrawAPI) {
            excalidrawAPI.updateScene(JSON.parse(getDrawingLock.data));
          }
          setReadOnlyMode(false);
          // Acquiring the lock bumped updatedAt on the server; saves must carry
          // the post-lock token or they would all be rejected as stale.
          updatedAtRef.current = getDrawingLock.updatedAt;
          deferredZoomToFit();
          _setFullScreen(true);
        },
      });
    } else {
      // Release only after the save settles: releasing also bumps updatedAt
      // (Prisma @updatedAt), so a save still in flight when the release lands
      // would be rejected as stale. Save errors are surfaced by saveOnChange
      // itself; the lock is released regardless so it never dangles.
      saveOnChange().finally(() => releaseDrawingLock());
      setReadOnlyMode(true);
      deferredZoomToFit();
      _setFullScreen(false);
    }
  };

  // Image files are stored as CDN URLs but the canvas needs data URLs, so each
  // is fetched and converted before the initialData promise resolves.
  useEffect(() => {
    if (!excalidrawAPI || initialData === undefined) {
      return;
    }

    const fetchData = async () => {
      const initialState: ExcalidrawInitialDataState = {
        elements: [],
        ...JSON.parse(initialData || "{}"),
      };

      const imageElements = filter(
        initialState?.elements as ExcalidrawElement[],
        { type: "image" },
      );

      const images: BinaryFileData[] = [];
      for (const element of imageElements) {
        if (element.type === "image" && element.fileId) {
          const dataURL = await urltoDataUrl(element.fileId);
          if (dataURL) {
            dataURL.id = element.fileId;
            images.push(dataURL);
          }
        }
      }

      initialStatePromiseRef.current.promise.resolve(initialState);
      excalidrawAPI.addFiles(images);
      deferredZoomToFit();
    };

    fetchData();
  }, [excalidrawAPI, initialData, deferredZoomToFit]);

  // Enter inside the canvas is a plain line feed in a text element; without this
  // the surrounding editor would interpret it as "add a new block".
  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.stopPropagation();
      }
    };

    containerElement.addEventListener("keydown", onKeyDown);
    return () => {
      containerElement.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const generateIdForFile = useCallback(async (file: File): Promise<string> => {
    return await uploadFileToCdn(file, "organization");
  }, []);

  // Save any pending changes when the embed unmounts (e.g. the body closes
  // while still in edit mode).
  useEffect(() => {
    return () => {
      saveOnChange(false);
    };
  }, [saveOnChange]);

  const defferedOnChange = useDebounceFn(() => saveOnChange(true), 5000);

  const onChange = (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    // Excalidraw also fires onChange for non-edits (scene load, viewport
    // moves), and its serialized form never string-matches the stored data —
    // so tracking state while read-only would schedule a bogus save before the
    // lock is even acquired. Only edit mode can produce real changes.
    if (readOnlyMode) return;

    currentState.current = serializeAsJSON(
      elements,
      appState,
      files,
      "database",
    );
    defferedOnChange();
  };

  if (error) {
    return (
      <div className="max-w-lg rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
        Drawing #{id} is unavailable
      </div>
    );
  }

  const renderControlButtons = () => {
    if (fullScreen) {
      return (
        <button
          type="button"
          className="absolute left-16 top-5 z-10 rounded border bg-white p-1 text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
          onClick={() => setFullScreen(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
            />
          </svg>
        </button>
      );
    }
    return (
      <>
        <button
          type="button"
          className="absolute left-4 top-4 z-10 hidden rounded border bg-white p-1 text-gray-600 opacity-0 transition hover:bg-gray-100 hover:text-gray-800 group-hover:opacity-100 sm:block"
          onClick={() => setFullScreen(true)}
        >
          <ArrowsExpandIcon className="h-6 w-6" />
        </button>
        <button
          type="button"
          className="absolute right-4 top-4 z-10 rounded border bg-white p-1 text-gray-600 opacity-0 transition hover:border-red-200 hover:bg-red-100 hover:text-red-800 group-hover:opacity-100"
          onClick={onDelete}
        >
          <TrashIcon className="h-6 w-6" />
        </button>
      </>
    );
  };

  return (
    <div
      contentEditable={false}
      ref={containerRef}
      className={cn("excalidraw-custom-styles group", {
        "excalidraw-expanded group fixed inset-0 left-0 top-40 z-10 sm:top-16 md:left-16 xl:left-64":
          fullScreen,
        "excalidraw-contained relative my-4 h-128": !fullScreen,
      })}
      onScrollCapture={(event) => {
        if (readOnlyMode) {
          event.stopPropagation();
          event.preventDefault();
        }
      }}
    >
      <Excalidraw
        // Excalidraw 0.17 removed API-access-via-ref in favor of the
        // `excalidrawAPI` callback prop; the imperative API is delivered here.
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={initialStatePromiseRef.current.promise}
        viewModeEnabled={readOnlyMode}
        generateIdForFile={generateIdForFile}
        onChange={onChange}
      >
        <MainMenu>
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.Item
            onSelect={() => setFullScreen(!fullScreen)}
            title="Toggle full screen"
            icon={<ArrowsExpandIcon />}
          >
            Toggle Full Screen
          </MainMenu.Item>
        </MainMenu>
      </Excalidraw>
      {readOnlyMode ? (
        <div
          className="group absolute inset-0 z-10"
          onDoubleClick={() => setFullScreen(true)}
        >
          {renderControlButtons()}
          <div className="absolute bottom-4 left-1/2 -ml-24 hidden rounded-lg bg-gray-100 bg-opacity-75 px-4 py-1 text-center text-base text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 sm:block">
            Double Click to Edit
          </div>
        </div>
      ) : (
        renderControlButtons()
      )}
    </div>
  );
}
