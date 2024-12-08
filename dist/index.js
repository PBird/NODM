// src/clients/index.ts
var assertConnected = function(db) {
  if (db === null || db === void 0) {
    throw new Error(
      "You must first call 'connect' before loading/saving documents."
    );
  }
};
function getClient() {
  const client = global.CLIENT;
  assertConnected(client);
  return client;
}

// src/clients/NedbClient.ts
import path from "path";

// src/clients/DatabaseClient.ts
var DatabaseClient = class {
  _url;
  constructor(url) {
    this._url = url;
  }
  static connect(url, options) {
    throw new TypeError("You must override connect (static).");
  }
};
module.exports = DatabaseClient;

// src/clients/NedbClient.ts
import Datastore from "@seald-io/nedb";
import _ from "lodash";

// src/Model.ts
var Model = class {
  static _name;
  _name;
  values;
  constructor(name, values) {
    this._name = name;
    this.values = values;
  }
  get(key) {
    return this.values[key];
  }
  set(key, value) {
    this.values[key] = value;
    return this.values[key];
  }
  /**
   * Save (upsert) document
   */
  async save() {
    const res = await getClient().save(this._name, this.values, this.values._id);
    if (res !== null) {
      this.values = res;
    }
  }
  /**
   * Delete current document
   */
  async delete() {
    const numRemoved = await getClient().delete(this._name, this.values._id);
    return numRemoved;
  }
};

// src/createDSModel.ts
function createDSModel(name, schema) {
  class DSModel extends Model {
    static _name = name;
    static schema = schema;
    constructor(values) {
      super(name, values);
    }
    /**
     * Find one document in current collection
     *
     * TODO: Need options to specify whether references should be loaded
     *
     */
    static async findOne(query) {
      const result = await getClient().findOne(this._name, query);
      return result;
    }
    /**
     * Delete many documents in current collection
     */
    static async deleteOne(query) {
      const numRemoved = await getClient().deleteOne(this._name, query);
      return numRemoved;
    }
    /**
     * Delete one document in current collection
     */
    static async deleteMany(query) {
      const numRemoved = await getClient().deleteMany(this._name, query);
      return numRemoved;
    }
  }
  return DSModel;
}

// src/clients/NedbClient.ts
var NeDbClient = class _NeDbClient extends DatabaseClient {
  _path;
  _collections;
  _options;
  constructor(url, collections, options) {
    super(url);
    this._path = _NeDbClient.urlToPath(url);
    this._options = options;
    if (collections) {
      this._collections = collections;
    } else {
      this._collections = {};
    }
  }
  static urlToPath(url) {
    if (url.indexOf("nedb://") > -1) {
      return url.slice(7, url.length);
    }
    return url;
  }
  getCollectionPath(collection) {
    if (this._path === "memory") {
      return this._path;
    }
    return path.join(this._path, collection) + ".db";
  }
  model(name, schema) {
    if (this._path === "memory") {
      const ds2 = new Datastore({ inMemoryOnly: true, ...this._options });
    }
    let collectionPath = this.getCollectionPath(name);
    const ds = new Datastore({ filename: collectionPath, ...this._options });
    const DSModel = createDSModel(name, schema);
    this._collections[name] = ds;
    return DSModel;
  }
  /**
   * Save (upsert) document
   *
   */
  async save(collection, values, id) {
    const currentCollection = this._collections[collection];
    if (typeof id === "undefined") {
      const result2 = await currentCollection.insertAsync(values);
      return result2;
    }
    const result = await currentCollection.updateAsync(
      { _id: id },
      { $set: values },
      { upsert: true, returnUpdatedDocs: true }
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
  async delete(collection, id) {
    if (typeof id === "undefined") return 0;
    const currentCollection = this._collections[collection];
    const numRemoved = await currentCollection.removeAsync(
      { _id: id },
      { multi: false }
    );
    return numRemoved;
  }
  /**
   * Delete one document by query
   *
   */
  async deleteOne(collection, query) {
    const currentCollection = this._collections[collection];
    const numRemoved = await currentCollection.removeAsync(query, {
      multi: false
    });
    return numRemoved;
  }
  /**
   * Delete many documents by query
   */
  async deleteMany(collection, query) {
    const currentCollection = this._collections[collection];
    const numRemoved = await currentCollection.removeAsync(query, {
      multi: true
    });
    return numRemoved;
  }
  /**
   * Find one document
   */
  async findOne(collection, query) {
    const currentCollection = this._collections[collection];
    const result = await currentCollection.findOneAsync(query);
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
    options.multi = false;
    return new Promise((resolve, reject) => {
      const db = this._collections[collection];
      db.remove(query, options, function(error, numRemoved) {
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
      if (options.sort && (_.isArray(options.sort) || _.isString(options.sort))) {
        let sortOptions = {};
        if (!_.isArray(options.sort)) {
          options.sort = [options.sort];
        }
        options.sort.forEach(function(s) {
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
      cursor.exec(function(error, result) {
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
      db.count(query, function(error, count) {
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
      sparse: options.sparse
    });
  }
  /**
   * Connect to database
   *
   * @param {String} url
   * @param {Object} options
   * @returns {Promise}
   */
  static connect(url, options) {
    let dbLocation = _NeDbClient.urlToPath(url);
    let collections = {};
    return new _NeDbClient(dbLocation, collections, options);
  }
  /**
   * Close current connection
   *
   * @returns {Promise}
   */
  close() {
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
  toNativeId(id) {
    throw new TypeError("You must override toNativeId.");
  }
  nativeIdType() {
    return String;
  }
  driver() {
    return this._collections;
  }
};

// src/index.ts
function connect(url, options) {
  if (url.indexOf("nedb://") > -1) {
    const db = NeDbClient.connect(url, options);
    global.CLIENT = db;
  } else {
    return new Error("Unrecognized DB connection url.");
  }
}
export {
  connect,
  getClient
};
