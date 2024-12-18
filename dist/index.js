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

// src/clients/NedbClient.ts
import Datastore2 from "@seald-io/nedb";
import { deepCopy as deepCopy2 } from "@seald-io/nedb/lib/model";

// src/Cursor.ts
import NeDbCursor from "@seald-io/nedb/lib/cursor";
var Cursor = class extends NeDbCursor {
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
import { checkObject } from "@seald-io/nedb/lib/model";
function hasOperator(obj) {
  try {
    checkObject(obj);
    return false;
  } catch (error) {
    return true;
  }
}

// src/createModel.ts
import { date, object, string } from "yup";

// src/Aggregation.ts
import Datastore from "@seald-io/nedb";
import { deepCopy, getDotValue } from "@seald-io/nedb/lib/model";
import _2 from "lodash";

// src/utils/RighJoiner.ts
import _ from "lodash";
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
    const foreignByField = _.groupBy(
      this.foreignObj,
      this.options.foreignField
    );
    const result = this.localObj.map((lo) => {
      if (this.options.dropNoMatch && (typeof lo[this.options.localField] === "undefined" || typeof foreignByField[lo[this.options.localField]] === "undefined")) {
        return void 0;
      }
      const loFieldObjs = _.uniq([].concat(lo[this.options.localField]));
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
    return _.compact(result);
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
      this.currentCS.mapFn = (docs) => docs.map((doc) => deepCopy(doc));
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
    const localFieldKeys = _2.uniq(
      docs.map((d) => getDotValue(d, localField))
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
    this.currentDS = new Datastore(this.datastoreOptions);
    await this.currentDS.insertAsync(newDocs);
  }
  async updateCursorsDatastore() {
    let currentDocs = [];
    currentDocs = await this.currentCS.execAsync();
    this.currentDS = new Datastore(this.datastoreOptions);
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
    this.currentDS = new Datastore({
      inMemoryOnly: true,
      compareStrings: this.currentDS.compareStrings
    });
    await this.currentDS.insertAsync(currentDocs);
    this.currentCS = null;
  }
};

// src/createBaseModel.ts
function createBaseModel(name, schema) {
  class BaseModel {
    static collectionName = name;
    static schema = schema;
    constructor() {
    }
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
    static findOne(query, projection = {}) {
      return getClient().findOne(this.collectionName, query, projection);
    }
    /**
     * Find one document and update it in current collection
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    static findOneUpdate(query, updateQuery, options) {
      return getClient().findOneAndUpdate(
        this.collectionName,
        query,
        updateQuery,
        options
      );
    }
    static findByIdAndUpdate(id, updateQuery, options) {
      return getClient().findByIdAndUpdate(
        this.collectionName,
        id,
        updateQuery,
        options
      );
    }
    static find(query = {}, options = {}) {
      return getClient().find(this.collectionName, query, options);
    }
    /**
     *
     * Find one document and delete it in current collection
     */
    static findOneAndDelete(query) {
      return getClient().findOneAndDelete(this.collectionName, query);
    }
    /**
     * Find document by id and delete it
     *
     * findOneAndDelete() command by a document's _id field.
     * In other words, findByIdAndDelete(id) is a shorthand for findOneAndDelete({ _id: id })
     *
     */
    static findByIdAndDelete(id) {
      return getClient().findByIdAndDelete(this.collectionName, id);
    }
    /**
     * Find one document and update it in current collection
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    static updateMany(query, values, options) {
      return getClient().updateMany(this.collectionName, query, values, options);
    }
    /**
     * Delete many documents in current collection
     */
    static async deleteOne(query) {
      const numRemoved = await getClient().deleteOne(this.collectionName, query);
      return numRemoved;
    }
    /**
     * Delete one document in current collection
     */
    static async deleteMany(query) {
      const numRemoved = await getClient().deleteMany(this.collectionName, query);
      return numRemoved;
    }
    static ensureIndex(options) {
      return getClient().ensureIndex(this.collectionName, options);
    }
    static async aggregate(pipeline) {
      const aggregateObj = new Aggregation({
        ds: getClient()._collections[this.collectionName],
        cs: null,
        pipeline
      });
      const data = await aggregateObj.run();
      return data;
    }
  }
  return BaseModel;
}

// src/createModel.ts
var baseDbSchema = object({
  _id: string().transform((v) => v.toString()).notRequired(),
  createdAt: date().notRequired(),
  updatedAt: date().notRequired()
});
function createModel(collectionName, schema) {
  const mergedSchema = baseDbSchema.concat(
    schema
  );
  const BaseModel = createBaseModel(collectionName, mergedSchema);
  class Model extends BaseModel {
    values;
    constructor(values) {
      super();
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
    async save(options = { validateBeforeSave: true }) {
      const res = await getClient().save(
        collectionName,
        this.values,
        options,
        this.values._id
      );
      if (res !== null) {
        this.values = res;
      }
    }
    /**
     * Delete current document
     */
    async delete() {
      const numRemoved = await getClient().delete(collectionName, this.values._id);
      return numRemoved;
    }
  }
  return Model;
}

// src/utils.ts
import NeDbModel from "@seald-io/nedb/lib/model";
async function castAndValidateOnUpserting(schema, query, updateQ) {
  let toBeInserted;
  try {
    NeDbModel.checkObject(updateQ);
    toBeInserted = updateQ;
  } catch (e) {
    toBeInserted = NeDbModel.modify(NeDbModel.deepCopy(query, true), updateQ);
  }
  const validatedData = await schema.validate(toBeInserted);
  return validatedData;
}
async function castAndValidateOnUpdate(schema, oldDoc, updateQ, overwrite) {
  if (overwrite || hasOperator(updateQ)) {
    const newDoc = NeDbModel.modify(NeDbModel.deepCopy(oldDoc), updateQ);
    const castedData = await schema.validate(newDoc);
    return { updateQ, castedData };
  } else {
    const castedData = await schema.partial().validate(updateQ);
    return {
      updateQ: { $set: castedData },
      castedData
    };
  }
}

// src/clients/NedbClient.ts
var NeDbClient = class _NeDbClient extends DatabaseClient {
  _path;
  _collections;
  _schemas;
  _options;
  constructor(url, collections, schemas, options) {
    super(url);
    this._path = _NeDbClient.urlToPath(url);
    this._options = options;
    this._collections = collections || {};
    this._schemas = schemas || {};
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
      const ds2 = new Datastore2({ inMemoryOnly: true, ...this._options });
    }
    let collectionPath = this.getCollectionPath(name);
    const ds = new Datastore2({ filename: collectionPath, ...this._options });
    const Model = createModel(name, schema);
    this._collections[name] = ds;
    this._schemas[name] = Model.schema;
    return Model;
  }
  /**
   * Save (upsert) document
   *
   */
  async save(collection, values, options, id) {
    const currentCollection = this._collections[collection];
    const currentSchema = this._schemas[collection];
    if (options.validateBeforeSave) {
      await currentSchema.validate(values);
    }
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
      (docs) => docs.length === 1 ? deepCopy2(docs[0]) : null,
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
    const currentSchema = this._schemas[collection];
    const qOptions = {
      ...options,
      multi: true,
      returnUpdatedDocs: true
    };
    const data = await this.findOne(collection, query);
    if (!data) {
      if (qOptions.upsert) {
        const toBeInserted = await castAndValidateOnUpserting(
          currentSchema,
          query,
          updateQuery
        );
        const newDoc = await currentCollection.insertAsync(toBeInserted);
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
    const currentSchema = this._schemas[collection];
    const qOptions = {
      ...options,
      multi: false,
      returnUpdatedDocs: true
    };
    const oldDoc = await this.findOne(collection, query);
    if (!oldDoc) {
      if (qOptions.upsert) {
        const toBeInserted = await castAndValidateOnUpserting(
          currentSchema,
          query,
          updateQuery
        );
        const newDoc = await currentCollection.insertAsync(toBeInserted);
        return newDoc;
      } else {
        return null;
      }
    } else {
      const { updateQ } = await castAndValidateOnUpdate(
        currentSchema,
        oldDoc,
        updateQuery,
        options.overwrite
      );
      const { affectedDocuments, upsert, numAffected } = await currentCollection.updateAsync(query, updateQ, qOptions);
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
      (docs) => docs.map((doc) => deepCopy2(doc)),
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
    let schemas = {};
    return new _NeDbClient(dbLocation, collections, schemas, options);
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
