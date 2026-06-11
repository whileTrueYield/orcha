/**
 * The GraphQL operations behind the Excalidraw embed (issue #42). The Drawing
 * store and its lock protocol are unchanged from the Tiptap era — this module
 * just keeps the documents out of the already-large embed component.
 *
 * Public API: CREATE_DRAWING, GET_DRAWING, UPDATE_DRAWING, GET_DRAWING_LOCK,
 * RELEASE_DRAWING_LOCK.
 */
import { gql } from "@apollo/client";

export const CREATE_DRAWING = gql`
  mutation createDrawing($input: CreateDrawingInput!) {
    createDrawing(input: $input) {
      id
      data
      updatedAt
    }
  }
`;

export const GET_DRAWING = gql`
  query drawing($id: Int!) {
    drawing(id: $id) {
      id
      data
      updatedAt
    }
  }
`;

export const UPDATE_DRAWING = gql`
  mutation updateDrawing($drawingId: Int!, $input: UpdateDrawingInput!) {
    updateDrawing(drawingId: $drawingId, input: $input) {
      id
      data
      updatedAt
    }
  }
`;

export const GET_DRAWING_LOCK = gql`
  mutation getDrawingLock($drawingId: Int!, $force: Boolean) {
    getDrawingLock(drawingId: $drawingId, force: $force) {
      id
      data
      updatedAt
    }
  }
`;

export const RELEASE_DRAWING_LOCK = gql`
  mutation releaseDrawingLock($drawingId: Int!) {
    releaseDrawingLock(drawingId: $drawingId) {
      id
      data
      updatedAt
    }
  }
`;
