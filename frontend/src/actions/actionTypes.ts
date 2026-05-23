import { Pagination } from "../types";

export interface APIResponseOne<Record = any> {
  status: "success" | "failure";
  data: Record;
}

export interface APIResponseMany<Record = any> extends Pagination {
  status: "success" | "failure";
  data: Record[];
}

export interface EmptyAction<Type> {
  type: Type;
  error?: any;
  meta?: {};
}

export interface ActionWithPayload<Type, Payload> extends EmptyAction<Type> {
  payload: Payload;
}
