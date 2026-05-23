import { useCallback, useEffect, useRef, useState } from "react";

import { Excalidraw, MainMenu, serializeAsJSON } from "@excalidraw/excalidraw";
import {
  AppState,
  BinaryFileData,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import "./Drawing.css";
import { ArrowsExpandIcon, TrashIcon } from "@heroicons/react/outline";
import { filter } from "lodash";
import cn from "classnames";
import { uploadFileToCdn } from "upload/uploadFile";
import { resolvablePromise, ResolvablePromise, urltoDataUrl } from "./utils";
import { useDebounceFn } from "components/taskManager/hooks";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import {
  Drawing,
  MutationCreateDrawingArgs,
  MutationGetDrawingLockArgs,
  MutationReleaseDrawingLockArgs,
  MutationUpdateDrawingArgs,
  QueryDrawingArgs,
} from "types/graphql";
import { onGraphQLError } from "utils/GQLClient";

const DEFAULT_DATA = JSON.stringify({ elements: [] });

export const DrawingComponent: React.FC<NodeViewProps> = (props) => {
  const lastSave = useRef<string>();
  const currentState = useRef<string>();
  const [drawing, setDrawing] = useState<Drawing>();

  const [initialData, setInitialData] = useState<string>();

  const { node, updateAttributes } = props;
  const drawingId = node.attrs.drawingId;

  const [updateDrawing] = useMutation<
    MutationReturnValue["updateDrawing"],
    MutationUpdateDrawingArgs
  >(UPDATE_DRAWING);

  const [createDrawing] = useMutation<
    MutationReturnValue["createDrawing"],
    MutationCreateDrawingArgs
  >(CREATE_NEW_DRAWING);

  const [getDrawing] = useLazyQuery<
    QueryReturnValue["drawing"],
    QueryDrawingArgs
  >(GET_DRAWING);

  const [getDrawingLock] = useMutation<
    MutationReturnValue["getDrawingLock"],
    MutationGetDrawingLockArgs
  >(GET_DRAWING_LOCK);

  const [releaseDrawingLock] = useMutation<
    MutationReturnValue["releaseDrawingLock"],
    MutationReleaseDrawingLockArgs
  >(RELEASE_DRAWING_LOCK, { variables: { drawingId } });

  const containerRef = useRef<HTMLDivElement>(null);
  const [fullScreen, _setFullScreen] = useState(false);
  const [readOnlyMode, _setReadOnlyMode] = useState(true);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  const setReadOnlyMode = (readOnlyMode: boolean) => {
    _setReadOnlyMode(readOnlyMode);
  };

  // When switching to or out of full screen, we want
  // to zoom and center to the content.
  const setFullScreen = (fullScreen: boolean) => {
    if (fullScreen) {
      // when entering fullscreen, we'll acquire a lock on the drawning
      // and pull the latest changes too
      getDrawingLock({
        variables: { drawingId, force: false },
        onError: onGraphQLError({ title: "Could not acquire lock" }),
        onCompleted: ({ getDrawingLock }) => {
          if (excalidrawAPI) {
            excalidrawAPI.updateScene(JSON.parse(getDrawingLock.data));
          }
          setReadOnlyMode(false);
          setDrawing(getDrawingLock);
          deferredZoomToFit();
          _setFullScreen(fullScreen);
        },
      });
    } else {
      // When leaving fullscreen we want to save any changes
      // and release the drawing lock
      saveOnChange();
      releaseDrawingLock();
      setReadOnlyMode(true);
      deferredZoomToFit();
      _setFullScreen(fullScreen);
    }
  };

  // we deferred the zoom since the canvas is being changed when we
  // zoom to fit, this gives it time trigger the state rendering
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

  // We load the image asynchrnously as we need to fetch each of them
  // convert them to base64 and add them to excalidraw API
  // once everything is loaded, we resolve the initialState promise
  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    const fetchData = async () => {
      // const elements = await initialData.elements ? await initialData.elements : [];
      const initialState: ExcalidrawInitialDataState = {
        elements: [],
        ...(initialData ? JSON.parse(initialData) : {}),
      };

      // const _initialData = await initialData;
      const imageElements = filter(
        initialState?.elements as ExcalidrawElement[],
        { type: "image" },
      );

      const images: BinaryFileData[] = [];

      for (const element of imageElements) {
        if (element.type === "image" && element.fileId) {
          const dataURL = await urltoDataUrl(element.fileId);

          if (dataURL) {
            dataURL.id = element.fileId!;
            images.push(dataURL);
          }
        }
      }

      initialStatePromiseRef.current.promise.resolve(initialState);
      excalidrawAPI.addFiles(images);
      deferredZoomToFit();
    };

    if (initialData) {
      fetchData();
    } else {
      if (drawingId) {
        getDrawing({
          variables: { id: drawingId },
          onCompleted: ({ drawing }) => {
            updateAttributes({ drawingId: drawing.id });
            setInitialData(drawing.data);
            lastSave.current = drawing.data;
            setDrawing(drawing);
          },
        });
      } else {
        createDrawing({
          variables: { input: { data: DEFAULT_DATA } },
          onCompleted: ({ createDrawing }) => {
            updateAttributes({ drawingId: createDrawing.id });
            setInitialData(createDrawing.data);
            lastSave.current = createDrawing.data;
            setDrawing(createDrawing);
          },
        });
      }
    }
  }, [
    excalidrawAPI,
    initialData,
    deferredZoomToFit,
    drawingId,
    createDrawing,
    getDrawing,
    updateAttributes,
  ]);

  useEffect(() => {
    const containerElement = containerRef.current;
    if (containerElement) {
      const onKeyDown = (event: KeyboardEvent) => {
        // we prevent propagation, hitting enter would be interpreted
        // by the editor as adding a new block, here we just want to allow
        // a simple line-feed in text
        if (event.key === "Enter") {
          event.stopPropagation();
        }
      };

      containerElement.addEventListener("keydown", onKeyDown);
      return () => {
        containerElement.removeEventListener("keydown", onKeyDown);
      };
    }
  }, []);

  const generateIdForFile = useCallback(async (file: File): Promise<string> => {
    return await uploadFileToCdn(file, "organization");
  }, []);

  // save the drawing to the backend only if changes exist
  const saveOnChange = useCallback(
    (renewLock: boolean = false) => {
      if (
        drawingId &&
        lastSave.current &&
        currentState.current &&
        lastSave.current !== currentState.current
      ) {
        updateDrawing({
          variables: {
            drawingId,
            input: {
              data: currentState.current,
              renewLock,
              updatedAt: drawing?.updatedAt,
            },
          },
          onError: onGraphQLError({ title: "could not save your changes" }),
          onCompleted: ({ updateDrawing }) => {
            lastSave.current = updateDrawing.data;
            setDrawing(updateDrawing);
          },
        });
      }
    },
    [drawingId, updateDrawing, drawing],
  );

  // on unmount we want to save the drawing, here we return saveOnChange(false)
  // method, effectively triggering it on unmount and also releasing the
  useEffect(() => {
    return () => {
      saveOnChange(false);
    };
  }, [saveOnChange, releaseDrawingLock]);

  const defferedOnChange = useDebounceFn(() => saveOnChange(true), 5000);

  const onChange = (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    currentState.current = serializeAsJSON(
      elements,
      appState,
      files,
      "database",
    );
    // we'll enqueue the changes
    defferedOnChange();
  };

  const renderControlButtons = () => {
    if (fullScreen) {
      return (
        <button
          type="button"
          className="absolute left-16 top-5 z-10 rounded border bg-white p-1 text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
          onClick={() => setFullScreen(!fullScreen)}
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
    } else {
      return (
        <>
          <button
            type="button"
            className="absolute left-4 top-4 z-10 hidden rounded border bg-white p-1 text-gray-600 opacity-0 transition hover:bg-gray-100 hover:text-gray-800 group-hover:opacity-100 sm:block"
            onClick={() => setFullScreen(!fullScreen)}
          >
            <ArrowsExpandIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded border bg-white p-1 text-gray-600 opacity-0 transition hover:border-red-200 hover:bg-red-100 hover:text-red-800 group-hover:opacity-100"
            onClick={props.deleteNode}
          >
            <TrashIcon className="h-6 w-6" />
          </button>
        </>
      );
    }
  };

  return (
    <NodeViewWrapper>
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
          ref={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
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
    </NodeViewWrapper>
  );
};

const CREATE_NEW_DRAWING = gql`
  mutation createDrawing($input: CreateDrawingInput!) {
    createDrawing(input: $input) {
      id
      data
      updatedAt
    }
  }
`;

const GET_DRAWING = gql`
  query drawing($id: Int!) {
    drawing(id: $id) {
      id
      data
      updatedAt
    }
  }
`;

const UPDATE_DRAWING = gql`
  mutation updateDrawing($drawingId: Int!, $input: UpdateDrawingInput!) {
    updateDrawing(drawingId: $drawingId, input: $input) {
      id
      data
      updatedAt
    }
  }
`;

const GET_DRAWING_LOCK = gql`
  mutation getDrawingLock($drawingId: Int!, $force: Boolean) {
    getDrawingLock(drawingId: $drawingId, force: $force) {
      id
      data
      updatedAt
    }
  }
`;

const RELEASE_DRAWING_LOCK = gql`
  mutation releaseDrawingLock($drawingId: Int!) {
    releaseDrawingLock(drawingId: $drawingId) {
      id
      data
      updatedAt
    }
  }
`;
