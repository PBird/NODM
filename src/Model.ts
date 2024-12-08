import Datastore from "@seald-io/nedb";
import { getClient as db } from "./clients";
import { AnyObject, InferType, ObjectSchema } from "yup";

export type DBFields = {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export default class Model<T extends DBFields> {
  static _name: string;
  _name: string;
  values: T & DBFields;

  constructor(name: string, values: T & DBFields) {
    this._name = name;
    this.values = values;
  }

  get<K extends keyof (T & DBFields)>(key: K): (T & DBFields)[K] {
    return this.values[key];
  }

  set<K extends keyof (T & DBFields)>(key: K, value: (T & DBFields)[K]): T[K] {
    this.values[key] = value;
    return this.values[key];
  }

  /**
   * Save (upsert) document
   */
  async save() {
    const res = await db().save<T>(this._name, this.values, this.values._id);
    if (res !== null) {
      this.values = res;
    }
  }

  /**
   * Delete current document
   */
  async delete() {
    const numRemoved = await db().delete(this._name, this.values._id);
    return numRemoved;
  }
}
