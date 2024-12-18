import { AnyObject } from "yup";
import Datastore from "@seald-io/nedb";
import type { createModel } from "./createModel";
import Cursor from "./Cursor";

export type StageOptions<T> = {
  ds: Datastore<T>;
  cs: Cursor<T> | null;
  params: any;
};

export type DBFields = {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface SaveOptions {
  validateBeforeSave: boolean;
}

export interface CursorOptions {
  limit?: number;
  skip?: number;
  projection?: { [key: string]: number };
  sort?: { [key: string]: number };
}

export interface FindOptions extends CursorOptions {}

export interface DefaultUpdateOption {
  upsert?: boolean;
  overwrite?: boolean;
  multi?: boolean;
  validateBeforeSave?: boolean;
  returnUpdatedDocs: true;
}

export interface UpdateOptions {
  upsert?: boolean;
  overwrite?: boolean;
  validateBeforeSave?: boolean;
}

export interface UpdateManyOptions extends UpdateOptions {}

export interface FindOneAndUpdateOptions extends UpdateOptions {}

export type CollectionModel<T extends AnyObject> = ReturnType<
  typeof createModel<T>
>;
