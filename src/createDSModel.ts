import { ObjectSchema } from "yup";
import Model, { DBFields } from "./Model";
import { getClient as db } from "./clients";
import Aggregation from "./Aggregation";
import { FindOptions } from "./types";

export function createDSModel<T extends DBFields>(
  name: string,
  schema: ObjectSchema<T>,
) {
  class DSModel extends Model<T> {
    static _name = name;
    static schema = schema;

    constructor(values: T) {
      super(name, values);
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
    static findOneUpdate(query: object, values: any) {
      return db().findOneAndUpdate<T>(this._name, query, values);
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
