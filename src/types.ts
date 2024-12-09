import type { createModel } from "./createModel";

export type DBFields = {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

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
  returnUpdatedDocs: true;
}

export interface UpdateOptions {
  upsert?: boolean;
  overwrite?: boolean;
}

export interface UpdateManyOptions extends UpdateOptions {}

export interface FindOneAndUpdateOptions extends UpdateOptions {}

export type CollectionModel<T extends DBFields> = ReturnType<
  typeof createModel<T>
>;
