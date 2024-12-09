"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  connect: () => connect,
  getClient: () => getClient
});
module.exports = __toCommonJS(src_exports);

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
var import_path = __toESM(require("path"), 1);

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

// src/clients/NedbClient.ts
var import_nedb2 = __toESM(require("@seald-io/nedb"), 1);
var import_model2 = require("@seald-io/nedb/lib/model");

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

// src/Aggregation.ts
var import_nedb = __toESM(require("@seald-io/nedb"), 1);
var import_model = require("@seald-io/nedb/lib/model");
var import_lodash2 = __toESM(require("lodash"), 1);

// src/utils/RighJoiner.ts
var import_lodash = __toESM(require("lodash"), 1);
var RightJoiner = class {
  foreignObj;
  localObj;
  options;
  constructor(foreignObj, localObj, options) {
    this.foreignObj = foreignObj;
    this.localObj = localObj;
    this.options = options;
  }
  join() {
    const foreignByField = import_lodash.default.groupBy(
      this.foreignObj,
      this.options.foreignField
    );
    const result = this.localObj.map((lo) => {
      if (this.options.dropNoMatch && (typeof lo[this.options.localField] === "undefined" || typeof foreignByField[lo[this.options.localField]] === "undefined")) {
        return void 0;
      }
      const loFieldObjs = import_lodash.default.uniq([].concat(lo[this.options.localField]));
      let currFieldObjs = [];
      loFieldObjs.forEach((fo) => {
        if (typeof foreignByField[fo] !== "undefined") {
          currFieldObjs = currFieldObjs.concat(foreignByField[fo]);
        }
      });
      return {
        ...lo,
        [this.options.as]: currFieldObjs
      };
    });
    return import_lodash.default.compact(result);
  }
};

// src/Aggregation.ts
var Aggregation = class _Aggregation {
  currentDS;
  currentCS;
  datastoreOptions;
  currentPipeline;
  pipeline;
  showIDfield;
  constructor({ ds, cs, pipeline }) {
    this.currentDS = ds;
    this.currentCS = cs;
    this.pipeline = pipeline;
    this.showIDfield = true;
    this.datastoreOptions = {
      inMemoryOnly: true,
      // @ts-ignore
      compareStrings: this.currentDS.compareStrings
    };
    this.parsePipeline();
  }
  run() {
    return this._aggregate();
  }
  // eslint-disable-next-line
  async _aggregate() {
    const operator = this.currentPipeline.shift();
    if (typeof operator === "undefined") {
      this.currentCS = this.currentCS || this.currentDS.findAsync({});
      if (!this.showIDfield) {
        this.currentCS = this.currentCS.projection({ _id: 0 });
      }
      return this.currentCS.execAsync();
    }
    await this[operator.name](operator.params);
    return this._aggregate();
  }
  async $match(params) {
    if (this.currentCS !== null) {
      await this.updateCursorsDatastore();
      this.currentCS.query = params;
      this.currentCS.mapFn = (docs) => docs.map((doc) => (0, import_model.deepCopy)(doc));
    } else {
      this.currentCS = this.currentDS.findAsync(params);
    }
  }
  async $count(params) {
    let countDocs = 0;
    if (this.currentCS !== null) {
      countDocs = (await this.updateCursorsDatastore()).length;
      this.currentCS.mapFn = (docs) => docs.length;
    } else {
      countDocs = await this.currentDS.countAsync({});
    }
    const newDocs = [
      {
        [params]: countDocs
      }
    ];
    this.updateDatastoreFromDocs(newDocs);
    this.currentCS = this.currentDS.findAsync({}).projection({ _id: 0 });
    this.showIDfield = false;
  }
  async $limit(params) {
    this.currentCS = this.currentCS || this.currentDS.findAsync({});
    this.currentCS = this.currentCS.limit(params);
  }
  async $skip(params) {
    this.currentCS = this.currentCS || this.currentDS.findAsync({});
    this.currentCS = this.currentCS.skip(params);
  }
  async $sort(params) {
    this.currentCS = this.currentCS || this.currentDS.findAsync({});
    this.currentCS = this.currentCS.sort(params);
  }
  async $project(params) {
    this.currentCS = this.currentCS || this.currentDS.findAsync({});
    this.currentCS = this.currentCS.projection(params);
  }
  async $facet(params) {
    const resultPromisses = [];
    const fieldKeys = [];
    if (this.currentCS !== null) {
      await this.updateCursorsDatastore();
    }
    Object.entries(params).forEach(([fieldKey, value]) => {
      if (!Array.isArray(value)) {
        throw new Error(
          `arguments to $facet must be arrays, ${fieldKey} is type ${typeof value}`
        );
      }
      const tempCS = this.currentDS.findAsync({}).sort(this.currentCS?._sort);
      const newAggregation = new _Aggregation({
        cs: tempCS,
        ds: this.currentDS,
        pipeline: value
      });
      const aggProm = newAggregation.run();
      fieldKeys.push(fieldKey);
      resultPromisses.push(aggProm);
    });
    const results = await Promise.all(resultPromisses);
    const newDoc = fieldKeys.reduce((acc, k, index) => {
      acc[k] = results[index];
      return acc;
    }, {});
    this.updateDatastoreFromDocs(newDoc);
    this.currentCS = this.currentDS.findAsync({});
    this.showIDfield = false;
  }
  async $lookup(params) {
    let docs = [];
    if (this.currentCS === null) {
      docs = this.currentDS.getAllData();
    } else {
      docs = await this.updateCursorsDatastore();
    }
    const { from, localField, foreignField, as, pipeline = [] } = params;
    const foreignDS = getClient()._collections[from];
    const localFieldKeys = import_lodash2.default.uniq(
      docs.map((d) => (0, import_model.getDotValue)(d, localField))
    ).flat();
    let foreignDocs = [];
    if (typeof foreignDS !== "undefined") {
      const foreignPipeline = [
        {
          $match: {
            [foreignField]: { $in: localFieldKeys }
          }
        }
      ];
      const newAggregation = new _Aggregation({
        ds: foreignDS,
        pipeline: foreignPipeline.concat(pipeline),
        cs: null
      });
      foreignDocs = await newAggregation.run();
    } else {
      throw new Error("Foreign model doesn't have aggregate function");
    }
    const joiner = new RightJoiner(foreignDocs, docs, {
      foreignField,
      localField,
      as,
      dropNoMatch: false
    });
    const newDocs = joiner.join();
    await this.updateDatastoreFromDocs(newDocs);
    this.currentCS = this.currentDS.findAsync({}).sort(this.currentCS?._sort);
  }
  parsePipeline() {
    this.currentPipeline = this.pipeline.reduce(
      (acc, p) => {
        const stages = Object.keys(p);
        if (stages.length <= 1) {
          const [operatorName] = stages;
          const method = this[operatorName];
          if (!(typeof method === "function" && operatorName.startsWith("$"))) {
            throw new Error(
              `aggregate: Operator not defined -> ${operatorName}`
            );
          }
          const params = p[operatorName];
          const operator = {
            name: operatorName,
            params
          };
          acc.push(operator);
          return acc;
        }
        throw new Error(
          "aggregate: A pipeline stage specification object must contain exactly one field"
        );
      },
      []
    );
  }
  async updateDatastoreFromDocs(newDocs) {
    this.currentDS = new import_nedb.default(this.datastoreOptions);
    await this.currentDS.insertAsync(newDocs);
  }
  async updateCursorsDatastore() {
    let currentDocs = [];
    currentDocs = await this.currentCS.execAsync();
    this.currentDS = new import_nedb.default(this.datastoreOptions);
    await this.currentDS.insertAsync(currentDocs);
    this.currentCS = this.currentDS.findAsync({}).sort(this.currentCS?._sort);
    return currentDocs;
  }
  //  Current cursor'u null değilse exec eder ve dönen Dökümanları yeni Datastore içine aktar.
  //  Eğer döküman dizisi verilirse dökümanlardan yeni data store oluşturur ve currentDS ye atar.
  //  @param  any[]  newDocs Datastore'un içine eklenecek dökümanlar
  //  @param  showIDfield  showIDfield tek değer alabilir o da false. Yeni oluşturduğumuz datastore içinden _id alanını
  //  silemediğimiz için bu yöntemle projectte göstermiyoruz
  //
  //  @returns Promise<void>
  async execCursor(newDocs, showIDfield = false) {
    if (typeof newDocs === "undefined" && this.currentCS === null) {
      return;
    }
    let currentDocs;
    if (typeof newDocs !== "undefined") {
      if (Array.isArray(newDocs)) {
        currentDocs = newDocs;
        if (!showIDfield) {
          this.showIDfield = showIDfield;
        }
      } else {
        throw new Error(`Coultn't create new Datastore from ${newDocs}`);
      }
    } else {
      currentDocs = await this.currentCS.execAsync();
    }
    this.currentDS = new import_nedb.default({
      inMemoryOnly: true,
      compareStrings: this.currentDS.compareStrings
    });
    await this.currentDS.insertAsync(currentDocs);
    this.currentCS = null;
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
     * populate options will add
     *
     */
    static findOne(query, projection = {}) {
      return getClient().findOne(this._name, query, projection);
    }
    /**
     * Find one document and update it in current collection
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    static findOneUpdate(query, updateQuery, options) {
      return getClient().findOneAndUpdate(this._name, query, updateQuery, options);
    }
    static findByIdAndUpdate(id, updateQuery, options) {
      return getClient().findByIdAndUpdate(this._name, id, updateQuery, options);
    }
    static find(query = {}, options = {}) {
      return getClient().find(this._name, query, options);
    }
    /**
     *
     * Find one document and delete it in current collection
     */
    static findOneAndDelete(query) {
      return getClient().findOneAndDelete(this._name, query);
    }
    /**
     * Find document by id and delete it
     *
     * findOneAndDelete() command by a document's _id field.
     * In other words, findByIdAndDelete(id) is a shorthand for findOneAndDelete({ _id: id })
     *
     */
    static findByIdAndDelete(id) {
      return getClient().findByIdAndDelete(this._name, id);
    }
    /**
     * Find one document and update it in current collection
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    static updateMany(query, values, options) {
      return getClient().updateMany(this._name, query, values, options);
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
    static ensureIndex(options) {
      return getClient().ensureIndex(this._name, options);
    }
    static async aggregate(pipeline) {
      const aggregateObj = new Aggregation({
        ds: getClient()._collections[name],
        cs: null,
        pipeline
      });
      const data = await aggregateObj.run();
      return data;
    }
  }
  return DSModel;
}

// src/Cursor.ts
var import_cursor = __toESM(require("@seald-io/nedb/lib/cursor"), 1);
var Cursor = class extends import_cursor.default {
  constructor(db, query, mapFn, options) {
    super(db, query, mapFn);
    this._limit = options.limit;
    this._skip = options.skip;
    this._projection = options.projection;
    this._sort = options.sort;
  }
  then(onfulfilled, onrejected) {
    return super.then(onfulfilled, onrejected);
  }
};

// src/utils/hasOperator.ts
var isOperator = (key) => key.startsWith("$");
function hasOperator(query) {
  const keys = Object.keys(query);
  return keys.findIndex(isOperator) > -1 ? true : false;
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
    return import_path.default.join(this._path, collection) + ".db";
  }
  model(name, schema) {
    if (this._path === "memory") {
      const ds2 = new import_nedb2.default({ inMemoryOnly: true, ...this._options });
    }
    let collectionPath = this.getCollectionPath(name);
    const ds = new import_nedb2.default({ filename: collectionPath, ...this._options });
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
  findOne(collection, query, projection = {}) {
    const currentCollection = this._collections[collection];
    const cursor = new Cursor(
      currentCollection,
      query,
      (docs) => docs.length === 1 ? (0, import_model2.deepCopy)(docs[0]) : null,
      {
        projection,
        limit: 1
      }
    );
    return cursor;
  }
  /**
   * update all documents that match query (as opposed to just the first one)
   * regardless of the value of the multi option
   *
   */
  async updateMany(collection, query, updateQuery, options = {}) {
    const currentCollection = this._collections[collection];
    const qOptions = {
      ...options,
      multi: true,
      returnUpdatedDocs: true
    };
    const data = await this.findOne(collection, query);
    if (!data) {
      if (qOptions.upsert) {
        const newDoc = await currentCollection.insertAsync(updateQuery);
        return newDoc;
      } else {
        return null;
      }
    } else {
      let currentUQ = {
        $set: updateQuery
      };
      if (qOptions.overwrite || hasOperator(updateQuery)) {
        currentUQ = updateQuery;
      }
      const { affectedDocuments, upsert, numAffected } = await currentCollection.updateAsync(query, updateQuery, qOptions);
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
  async findOneAndUpdate(collection, query, updateQuery, options = {}) {
    const currentCollection = this._collections[collection];
    const qOptions = {
      ...options,
      multi: false,
      returnUpdatedDocs: true
    };
    const data = await this.findOne(collection, query);
    if (!data) {
      if (qOptions.upsert) {
        const newDoc = await currentCollection.insertAsync(updateQuery);
        return newDoc;
      } else {
        return null;
      }
    } else {
      let currentUQ = {
        $set: updateQuery
      };
      if (qOptions.overwrite || hasOperator(updateQuery)) {
        currentUQ = updateQuery;
      }
      const { affectedDocuments, upsert, numAffected } = await currentCollection.updateAsync(query, currentUQ, qOptions);
      return affectedDocuments;
    }
  }
  async findByIdAndUpdate(collection, id, updateQuery, options = {}) {
    return this.findOneAndUpdate(
      collection,
      { _id: id },
      updateQuery,
      options
    );
  }
  /**
   * Find one document and delete it
   *
   */
  async findOneAndDelete(collection, query) {
    const currentCollection = this._collections[collection];
    const qOptions = {
      multi: false
    };
    return currentCollection.removeAsync(query, qOptions);
  }
  /**
   * Find document by id and delete it
   * findOneAndDelete() command by a document's _id field.
   * In other words, findByIdAndDelete(id) is a shorthand for findOneAndDelete({ _id: id })
   */
  async findByIdAndDelete(collection, id) {
    return this.findOneAndDelete(collection, { _id: id });
  }
  /**
   * Find documents
   *
   */
  async find(collection, query, options) {
    const currentCollection = this._collections[collection];
    const cursor = new Cursor(
      currentCollection,
      query,
      (docs) => docs.map((doc) => (0, import_model2.deepCopy)(doc)),
      options
    );
    const results = await cursor;
    return results;
  }
  /**
   * ensureIndex documents
   *
   */
  async ensureIndex(collection, options) {
    const currentCollection = this._collections[collection];
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connect,
  getClient
});
