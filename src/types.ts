import { createDSModel } from "./createDSModel";

export interface CursorOptions {
  limit?: number;
  skip?: number;
  projection?: { [key: string]: number };
  sort?: { [key: string]: number };
}

export interface FindOptions extends CursorOptions {}

export interface FindOneAndUpdateOptions {
  upsert?: boolean;
}

export type CollectionModel = ReturnType<typeof createDSModel>;
