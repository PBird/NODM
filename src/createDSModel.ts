import { ObjectSchema } from "yup";
import Model, { DBFields } from "./Model";
import { getClient as db } from "./clients";

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
     *
     */
    static async findOne(query: object) {
      const result = await db().findOne<T>(this._name, query);
      return result;
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
  }

  return DSModel;
}
