import path from "path";
import DatabaseClient from "./DatabaseClient";
import Datastore from "@seald-io/nedb";
import { deepCopy } from "@seald-io/nedb/lib/model";
import _ from "lodash";
import { ObjectSchema } from "yup";
import { createDSModel } from "../createDSModel";
import Cursor from "../Cursor";
import {
  DefaultUpdateOption,
  FindOneAndUpdateOptions,
  FindOptions,
  UpdateManyOptions,
  UpdateOptions,
} from "../types";
import { Options } from "tsup";
import hasOperator from "../utils/hasOperator";

export type NeDbClientOptions = Omit<
  Datastore.DataStoreOptions,
  "filename" | "inMemoryOnly"
>;

export class NeDbClient extends DatabaseClient {
  _path: string;

  _collections: { [key: string]: Datastore<any> };

  _options: NeDbClientOptions;

  constructor(url: string, collections, options: NeDbClientOptions) {
    super(url);
    this._path = NeDbClient.urlToPath(url);
    this._options = options;

    if (collections) {
      this._collections = collections;
    } else {
      this._collections = {};
    }
  }

  static urlToPath(url: string) {
    if (url.indexOf("nedb://") > -1) {
      return url.slice(7, url.length);
    }
    return url;
  }

  private getCollectionPath(collection) {
    if (this._path === "memory") {
      return this._path;
    }
    return path.join(this._path, collection) + ".db";
  }

  model<T extends Record<string, any>>(name: string, schema: ObjectSchema<T>) {
    // TODO: We can  configure memory db later
    if (this._path === "memory") {
      const ds = new Datastore({ inMemoryOnly: true, ...this._options });
    }

    let collectionPath = this.getCollectionPath(name);
    const ds = new Datastore<T>({ filename: collectionPath, ...this._options });

    const DSModel = createDSModel<T>(name, schema);

    this._collections[name] = ds;

    return DSModel;
  }

  /**
   * Save (upsert) document
   *
   */
  async save<T>(
    collection: string,
    values: any,
    id?: string,
  ): Promise<T | null> {
    const currentCollection = this._collections[collection];
    if (typeof id === "undefined") {
      const result = await currentCollection.insertAsync(values);

      return result;
    }
    const result = await currentCollection.updateAsync(
      { _id: id },
      { $set: values },
      { upsert: true, returnUpdatedDocs: true },
    );

    if (result.affectedDocuments !== null) {
      return result.affectedDocuments;
    }

    return null;
  }

  /**
   * Delete document
   *
   */
  async delete(collection: string, id?: string) {
    if (typeof id === "undefined") return 0;

    const currentCollection = this._collections[collection];

    const numRemoved = await currentCollection.removeAsync(
      { _id: id },
      { multi: false },
    );

    return numRemoved;
  }

  /**
   * Delete one document by query
   *
   */
  async deleteOne(collection: string, query: object) {
    const currentCollection = this._collections[collection];

    const numRemoved = await currentCollection.removeAsync(query, {
      multi: false,
    });

    return numRemoved;
  }

  /**
   * Delete many documents by query
   */
  async deleteMany(collection: string, query: object) {
    const currentCollection = this._collections[collection];
    const numRemoved = await currentCollection.removeAsync(query, {
      multi: true,
    });

    return numRemoved;
  }

  /**
   * Find one document
   */
  findOne<T>(
    collection: string,
    query: object,
    projection: { [key: string]: number } = {},
  ) {
    const currentCollection = this._collections[collection] as Datastore<T>;

    const cursor = new Cursor<T>(
      currentCollection,
      query,
      (docs) => (docs.length === 1 ? deepCopy(docs[0]) : null),
      {
        projection,
        limit: 1,
      },
    );

    return cursor;
  }

  /**
   * update all documents that match query (as opposed to just the first one)
   * regardless of the value of the multi option
   *
   */
  async updateMany<T extends object>(
    collection: string,
    query: object,
    updateQuery: T,
    options: UpdateManyOptions = {},
  ) {
    const currentCollection = this._collections[collection] as Datastore<T>;

    const qOptions: DefaultUpdateOption = {
      ...options,
      multi: true,
      returnUpdatedDocs: true,
    };

    const data = await this.findOne<T>(collection, query);

    if (!data) {
      if (qOptions.upsert) {
        const newDoc = await currentCollection.insertAsync(updateQuery);
        return newDoc;
      } else {
        return null;
      }
    } else {
      let currentUQ: any = {
        $set: updateQuery,
      };

      // if has any operator do updatequery
      if (qOptions.overwrite || hasOperator(updateQuery)) {
        currentUQ = updateQuery;
      }
      const { affectedDocuments, upsert, numAffected } =
        await currentCollection.updateAsync(query, updateQuery, qOptions);

      return affectedDocuments;
    }
  }

  /**
   * Find one document and update it
   *
   * if doc exist it will update and return it
   * if upsert true and doc not exist: return  new doc
   * if upsert false and doc not exist: return null
   *
   */
  async findOneAndUpdate<T extends object>(
    collection: string,
    query: object,
    updateQuery: T,
    options: FindOneAndUpdateOptions = {},
  ) {
    const currentCollection = this._collections[collection] as Datastore<T>;

    const qOptions: DefaultUpdateOption = {
      ...options,
      multi: false,
      returnUpdatedDocs: true,
    };

    const data = await this.findOne<T>(collection, query);

    if (!data) {
      if (qOptions.upsert) {
        const newDoc = await currentCollection.insertAsync(updateQuery);
        return newDoc;
      } else {
        return null;
      }
    } else {
      let currentUQ: any = {
        $set: updateQuery,
      };

      // if has any operator do updatequery
      if (qOptions.overwrite || hasOperator(updateQuery)) {
        currentUQ = updateQuery;
      }
      const { affectedDocuments, upsert, numAffected } =
        await currentCollection.updateAsync(query, currentUQ, qOptions);

      return affectedDocuments;
    }
  }

  async findByIdAndUpdate<T extends object>(
    collection: string,
    id: string,
    updateQuery: T,
    options: FindOneAndUpdateOptions = {},
  ) {
    return this.findOneAndUpdate<T>(
      collection,
      { _id: id },
      updateQuery,
      options,
    );
  }

  /**
   * Find one document and delete it
   *
   */
  async findOneAndDelete<T>(collection: string, query: object) {
    const currentCollection = this._collections[collection] as Datastore<T>;

    const qOptions: { multi: false } = {
      multi: false,
    };

    return currentCollection.removeAsync(query, qOptions);
  }

  /**
   * Find document by id and delete it
   * findOneAndDelete() command by a document's _id field.
   * In other words, findByIdAndDelete(id) is a shorthand for findOneAndDelete({ _id: id })
   */
  async findByIdAndDelete<T>(collection: string, id: string) {
    return this.findOneAndDelete(collection, { _id: id });
  }

  /**
   * Find documents
   *
   */
  async find<T>(collection: any, query: object, options: FindOptions) {
    const currentCollection = this._collections[collection] as Datastore<T>;

    const cursor = new Cursor<T[]>(
      currentCollection,
      query,
      (docs) => docs.map((doc) => deepCopy(doc)),
      options,
    );

    const results = (await cursor) as T[];
    return results;
  }

  /**
   * ensureIndex documents
   *
   */
  async ensureIndex<T>(collection: any, options: Datastore.EnsureIndexOptions) {
    const currentCollection = this._collections[collection] as Datastore<T>;

    await currentCollection.ensureIndexAsync(options);
  }

  /**
   * Get count of collection by query
   *
   * @param {String} collection Collection's name
   * @param {Object} query Query
   * @returns {Promise}
   */
  count(collection, query) {
    const that = this;
    return new Promise((resolve, reject) => {
      const db = this._collections[collection];
      db.count(query, function (error, count) {
        if (error) return reject(error);
        return resolve(count);
      });
    });
  }

  /**
   * Create index
   *
   * @param {String} collection Collection's name
   * @param {String} field Field name
   * @param {Object} options Options
   * @returns {Promise}
   */
  createIndex(collection, field, options) {
    options = options || {};
    options.unique = options.unique || false;
    options.sparse = options.sparse || false;

    const db = this._collections[collection];
    db.ensureIndex({
      fieldName: field,
      unique: options.unique,
      sparse: options.sparse,
    });
  }

  /**
   * Connect to database
   *
   * @param {String} url
   * @param {Object} options
   * @returns {Promise}
   */
  static connect(url, options: Datastore.DataStoreOptions) {
    // Could be directory path or 'memory'
    let dbLocation = NeDbClient.urlToPath(url);

    let collections = {};

    return new NeDbClient(dbLocation, collections, options);
  }

  /**
   * Close current connection
   *
   * @returns {Promise}
   */
  close() {
    // Nothing to do for NeDB
  }

  /**
   * Drop collection
   *
   * @param {String} collection
   * @returns {Promise}
   */
  clearCollection(collection) {
    return this.deleteMany(collection, {});
  }

  /**
   * Drop current database
   *
   * @returns {Promise}
   */
  dropDatabase() {
    throw new TypeError("function has not writen yet.");
  }

  toCanonicalId(id) {
    return id;
  }

  // Native ids are the same as NeDB ids
  isNativeId(value) {
    return String(value).match(/^[a-zA-Z0-9]{16}$/) !== null;
  }

  toNativeId(id: any) {
    throw new TypeError("You must override toNativeId.");
  }

  nativeIdType() {
    return String;
  }

  driver() {
    return this._collections;
  }
}
