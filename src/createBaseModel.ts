import { AnyObject, date, InferType, object, ObjectSchema, string } from "yup";
import Datastore from "@seald-io/nedb";
import { FindOneAndUpdateOptions, FindOptions, UpdateOptions } from "./types";
import Aggregation from "./Aggregation";

import { getClient as db } from "./clients";

export default function createBaseModel<T extends AnyObject>(
  name: string,
  schema: ObjectSchema<T>,
) {
  class BaseModel {
    static collectionName = name;
    static schema = schema;

    constructor() {}

    static async validate(values) {
      await this.schema.validate(values);
    }

    /**
     * Find one document in current collection
     *
     * TODO: Need options to specify whether references should be loaded
     * populate options will add
     *
     */
    static findOne(query: object, projection: { [key: string]: number } = {}) {
      return db().findOne<T>(this.collectionName, query, projection);
    }

    /**
     * Find one document and update it in current collection
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    static findOneAndUpdate(
      query: object,
      updateQuery: any,
      options?: FindOneAndUpdateOptions,
    ) {
      return db().findOneAndUpdate<T>(
        this.collectionName,
        query,
        updateQuery,
        options,
      );
    }

    static findByIdAndUpdate(
      id: string,
      updateQuery: any,
      options?: FindOneAndUpdateOptions,
    ) {
      return db().findByIdAndUpdate<T>(
        this.collectionName,
        id,
        updateQuery,
        options,
      );
    }

    static find(query = {}, options: FindOptions = {}) {
      return db().find<T>(this.collectionName, query, options);
    }

    /**
     *
     * Find one document and delete it in current collection
     */
    static findOneAndDelete(query: object) {
      return db().findOneAndDelete<T>(this.collectionName, query);
    }

    /**
     * Find document by id and delete it
     *
     * findOneAndDelete() command by a document's _id field.
     * In other words, findByIdAndDelete(id) is a shorthand for findOneAndDelete({ _id: id })
     *
     */
    static findByIdAndDelete(id: string) {
      return db().findByIdAndDelete<T>(this.collectionName, id);
    }

    /**
     * Find one document and update it in current collection
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    static updateMany(query: object, values: any, options?: UpdateOptions) {
      return db().updateMany<T>(this.collectionName, query, values, options);
    }

    /**
     * Delete many documents in current collection
     */
    static async deleteOne(query: object) {
      const numRemoved = await db().deleteOne(this.collectionName, query);
      return numRemoved;
    }

    /**
     * Delete one document in current collection
     */
    static async deleteMany(query: object) {
      const numRemoved = await db().deleteMany(this.collectionName, query);
      return numRemoved;
    }

    static ensureIndex(options: Datastore.EnsureIndexOptions) {
      return db().ensureIndex<T>(this.collectionName, options);
    }

    static async aggregate(pipeline: any[]): Promise<any[]> {
      const aggregateObj = new Aggregation({
        ds: db()._collections[this.collectionName],
        cs: null,
        pipeline,
      });
      const data = await aggregateObj.run();
      return data;
    }
  }

  return BaseModel;
}
