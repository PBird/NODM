import path from "path";
import DatabaseClient from "./DatabaseClient";
import Datastore from "@seald-io/nedb";
import { deepCopy } from "@seald-io/nedb/lib/model";
import _ from "lodash";
import { AnyObject, AnySchema, Maybe, ObjectSchema } from "yup";
import Cursor from "../Cursor";
import {
  DefaultUpdateOption,
  FindOneAndUpdateOptions,
  FindOptions,
  SaveOptions,
  UpdateManyOptions,
  UpdateOptions,
} from "../types";
import hasOperator from "../utils/hasOperator";
import { createModel } from "../createModel";
import { castAndValidateOnUpserting, castAndValidateOnUpdate } from "../utils";

export type NeDbClientOptions = Omit<
  Datastore.DataStoreOptions,
  "filename" | "inMemoryOnly"
>;

export class NeDbClient extends DatabaseClient {
  _path: string;

  _collections: { [key: string]: Datastore<any> };
  _schemas: { [key: string]: ObjectSchema<AnyObject> };

  _options: NeDbClientOptions;

  constructor(
    url: string,
    collections: { [key: string]: Datastore<any> },
    schemas: { [key: string]: ObjectSchema<AnyObject> },
    options: NeDbClientOptions,
  ) {
    super(url);
    this._path = NeDbClient.urlToPath(url);
    this._options = options;

    this._collections = collections || {};
    this._schemas = schemas || {};
  }

  static urlToPath(url: string) {
    if (url.indexOf("nedb://") > -1) {
      return url.slice(7, url.length);
    }
    return url;
  }

  private getCollectionPath(collection: string) {
    if (this._path === "memory") {
      return this._path;
    }
    return path.join(this._path, collection) + ".db";
  }

  model<T extends AnyObject>(name: string, schema: ObjectSchema<T>) {
    // TODO: We can  configure memory db later
    if (this._path === "memory") {
      const ds = new Datastore({ inMemoryOnly: true, ...this._options });
    }

    let collectionPath = this.getCollectionPath(name);
    const ds = new Datastore<T>({ filename: collectionPath, ...this._options });

    const Model = createModel<T>(name, schema);

    this._collections[name] = ds;
    this._schemas[name] = Model.schema as ObjectSchema<AnyObject>;

    return Model;
  }

  /**
   * Save (upsert) document
   *
   */
  async save<T>(
    collection: string,
    values: any,
    options: SaveOptions,
    id?: Maybe<string>,
  ): Promise<T | null> {
    const currentCollection = this._collections[collection];
    const currentSchema = this._schemas[collection];

    // validate before save
    if (options.validateBeforeSave) {
      await currentSchema.validate(values);
    }

    if (typeof id === "undefined") {
      const result = await currentCollection.insertAsync<T>(values);

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
  async delete(collection: string, id?: Maybe<string>) {
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
    const currentSchema = this._schemas[collection];

    const qOptions: DefaultUpdateOption = {
      ...options,
      multi: true,
      returnUpdatedDocs: true,
    };

    const data = await this.findOne<T>(collection, query);

    if (!data) {
      if (qOptions.upsert) {
        // TODO: upsert için test et
        const toBeInserted = await castAndValidateOnUpserting<T>(
          currentSchema,
          query,
          updateQuery,
        );

        const newDoc = await currentCollection.insertAsync(toBeInserted);
        return newDoc;
      } else {
        return null;
      }
    } else {
      let currentUQ: any = {
        $set: updateQuery,
      };

      // TODO: maybe we can validate docs like updateOne
      // if has any operator do updatequery
      if (qOptions.overwrite || hasOperator(updateQuery)) {
        currentUQ = updateQuery;
      }
      const { affectedDocuments, upsert, numAffected } =
        await currentCollection.updateAsync(query, currentUQ, qOptions);

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
    const currentSchema = this._schemas[collection];

    const qOptions: DefaultUpdateOption = {
      ...options,
      multi: false,
      returnUpdatedDocs: true,
    };

    const oldDoc = await this.findOne<T>(collection, query);

    if (!oldDoc) {
      if (qOptions.upsert) {
        // get toBeInserted doc and validate
        const toBeInserted = await castAndValidateOnUpserting<T>(
          currentSchema,
          query,
          updateQuery,
        );
        const newDoc = await currentCollection.insertAsync<T>(toBeInserted);
        return newDoc;
      } else {
        return null;
      }
    } else {
      const { updateQ } = await castAndValidateOnUpdate(
        currentSchema,
        oldDoc,
        updateQuery,
        options.overwrite,
      );

      const { affectedDocuments, upsert, numAffected } =
        await currentCollection.updateAsync(query, updateQ, qOptions);

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
    let schemas = {};

    return new NeDbClient(dbLocation, collections, schemas, options);
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
