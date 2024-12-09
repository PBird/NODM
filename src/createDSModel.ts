import { ObjectSchema } from "yup";
import Model, { DBFields } from "./Model";
import { getClient as db } from "./clients";
import Aggregation from "./Aggregation";
import { FindOneAndUpdateOptions, FindOptions, UpdateOptions } from "./types";
import Datastore from "@seald-io/nedb";

// Classı fonksiyon içine aldık çünkü T type ını
// tanımlama aşamasında static methodlara atayamıyoruz.
//
export function createDSModel<T extends DBFields>(
  name: string,
  schema: ObjectSchema<T>,
) {
  class DSModel extends Model<T> {
    static _name = name;
    static schema = schema;

    constructor(values: T) {
      super(name, schema, values);
    }

    /**
     * Find one document in current collection
     *
     * TODO: Need options to specify whether references should be loaded
     * populate options will add
     *
     */
    static findOne(query: object, projection: { [key: string]: number } = {}) {
      return db().findOne<T>(this._name, query, projection);
    }

    /**
     * Find one document and update it in current collection
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    static findOneUpdate(
      query: object,
      updateQuery: any,
      options?: FindOneAndUpdateOptions,
    ) {
      return db().findOneAndUpdate<T>(this._name, query, updateQuery, options);
    }

    static findByIdAndUpdate(
      id: string,
      updateQuery: any,
      options?: FindOneAndUpdateOptions,
    ) {
      return db().findByIdAndUpdate<T>(this._name, id, updateQuery, options);
    }

    static find(query = {}, options: FindOptions = {}) {
      return db().find<T>(this._name, query, options);
    }

    /**
     *
     * Find one document and delete it in current collection
     */
    static findOneAndDelete(query: object) {
      return db().findOneAndDelete<T>(this._name, query);
    }

    /**
     * Find document by id and delete it
     *
     * findOneAndDelete() command by a document's _id field.
     * In other words, findByIdAndDelete(id) is a shorthand for findOneAndDelete({ _id: id })
     *
     */
    static findByIdAndDelete(id: string) {
      return db().findByIdAndDelete<T>(this._name, id);
    }

    /**
     * Find one document and update it in current collection
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    static updateMany(query: object, values: any, options?: UpdateOptions) {
      return db().updateMany<T>(this._name, query, values, options);
    }

    /**
     * Delete many documents in current collection
     */
    static async deleteOne(query: object) {
      const numRemoved = await db().deleteOne(this._name, query);
      return numRemoved;
    }

    /**
     * Delete one document in current collection
     */
    static async deleteMany(query: object) {
      const numRemoved = await db().deleteMany(this._name, query);
      return numRemoved;
    }

    static ensureIndex(options: Datastore.EnsureIndexOptions) {
      return db().ensureIndex<T>(this._name, options);
    }

    static async aggregate(pipeline: any[]): Promise<any[]> {
      const aggregateObj = new Aggregation({
        ds: db()._collections[name],
        cs: null,
        pipeline,
      });
      const data = await aggregateObj.run();
      return data;
    }
  }

  return DSModel;
}
