import path from "path";
import DatabaseClient from "./DatabaseClient";
import Datastore from "@seald-io/nedb";
import _ from "lodash";
import { ObjectSchema } from "yup";
import Model, { DBFields } from "../Model";
import { createDSModel } from "../createDSModel";

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
  async findOne<T>(collection: string, query: object) {
    const currentCollection = this._collections[collection];

    const result = await currentCollection.findOneAsync<T>(query);
    return result;
  }

  /**
   * Find one document and update it
   *
   * @param {String} collection Collection's name
   * @param {Object} query Query
   * @param {Object} values
   * @param {Object} options
   * @returns {Promise}
   */
  findOneAndUpdate(collection, query, values, options) {
    if (!options) {
      options = {};
    }

    options.multi = false;

    throw new TypeError("function has not writen yet.");
  }

  /**
   * Find one document and delete it
   *
   * @param {String} collection Collection's name
   * @param {Object} query Query
   * @param {Object} options
   * @returns {Promise}
   */
  findOneAndDelete(collection, query, options) {
    const that = this;

    if (!options) {
      options = {};
    }

    // Since this is 'findOne...' we'll only allow user to update
    // one document at a time
    options.multi = false;

    return new Promise((resolve, reject) => {
      const db = this._collections[collection];
      db.remove(query, options, function (error, numRemoved) {
        if (error) return reject(error);
        return resolve(numRemoved);
      });
    });
  }

  /**
   * Find documents
   *
   * @param {String} collection Collection's name
   * @param {Object} query Query
   * @param {Object} options
   * @returns {Promise}
   */
  find(collection, query, options) {
    const that = this;
    return new Promise((resolve, reject) => {
      const db = this._collections[collection];
      let cursor = db.find(query);

      if (
        options.sort &&
        (_.isArray(options.sort) || _.isString(options.sort))
      ) {
        let sortOptions = {};
        if (!_.isArray(options.sort)) {
          options.sort = [options.sort];
        }

        options.sort.forEach(function (s) {
          if (!_.isString(s)) return;

          let sortOrder = 1;
          if (s[0] === "-") {
            sortOrder = -1;
            s = s.substring(1);
          }
          sortOptions[s] = sortOrder;
        });

        cursor = cursor.sort(sortOptions);
      }
      if (typeof options.skip === "number") {
        cursor = cursor.skip(options.skip);
      }
      if (typeof options.limit === "number") {
        cursor = cursor.limit(options.limit);
      }
      cursor.exec(function (error, result) {
        if (error) return reject(error);
        return resolve(result);
      });
    });
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
