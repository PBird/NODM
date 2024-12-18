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
var import_model7 = __toESM(require("@seald-io/nedb/lib/model"), 1);

// src/Cursor.ts
var import_cursor = __toESM(require("@seald-io/nedb/lib/cursor"), 1);
var import_model = __toESM(require("@seald-io/nedb/lib/model"), 1);
var Cursor = class extends import_cursor.default {
  constructor(db, query, mapFn, options = {}) {
    if (mapFn === null) {
      mapFn = (docs) => docs.map((doc) => import_model.default.deepCopy(doc));
    }
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
var import_model2 = require("@seald-io/nedb/lib/model");
function hasOperator(obj) {
  try {
    (0, import_model2.checkObject)(obj);
    return false;
  } catch (error) {
    return true;
  }
}

// src/createModel.ts
var import_yup = require("yup");

// src/stages/BaseStage.ts
var import_nedb = __toESM(require("@seald-io/nedb"), 1);
var import_indexes = __toESM(require("@seald-io/nedb/lib/indexes"), 1);
var BaseStage = class {
  datastoreOptions;
  currentDS;
  currentCS;
  constructor({ ds, cs }) {
    this.currentDS = ds;
    this.currentCS = cs;
    this.datastoreOptions = {
      inMemoryOnly: true,
      // @ts-ignore
      compareStrings: this.currentDS.compareStrings
    };
  }
  async updateCursorsDatastore() {
    let currentDocs = [];
    currentDocs = await this.currentCS.execAsync();
    const indexes = this.currentDS.indexes;
    this.currentDS = new import_nedb.default(this.datastoreOptions);
    await this.currentDS.executor.pushAsync(async () => {
      if (indexes) {
        Object.keys(indexes).forEach((key) => {
          this.currentDS.indexes[key] = new import_indexes.default(indexes[key]);
        });
      }
      this.currentDS._resetIndexes(currentDocs);
    }, true);
    this.currentCS = new Cursor(this.currentDS, {}, null, {
      sort: this.currentCS?._sort
    });
    return currentDocs;
  }
  async createDatastoreFromDocs(newDocs) {
    const newDS = new import_nedb.default(this.datastoreOptions);
    await newDS.executor.pushAsync(
      async () => newDS._resetIndexes(newDocs),
      true
    );
    const newCS = new Cursor(newDS, {}, null);
    return { ds: newDS, cs: newCS };
  }
};

// src/stages/$limit.ts
var $limit = class extends BaseStage {
  limit;
  constructor({ params, ds, cs }) {
    super({ ds, cs });
    if (!Number.isInteger(params)) {
      throw new Error(`Expected an integer: $limit: ${params}`);
    }
    this.limit = params;
  }
  async run() {
    if (this.currentCS === null) {
      this.currentCS = new Cursor(this.currentDS, {}, null, {
        limit: this.limit
      });
    } else {
      this.currentCS.limit(this.limit);
    }
  }
};

// src/stages/$sort.ts
var $sort = class extends BaseStage {
  sort;
  constructor({ params, ds, cs }) {
    super({ ds, cs });
    this.sort = params;
  }
  async run() {
    if (this.currentCS === null) {
      this.currentCS = new Cursor(this.currentDS, {}, null, {
        sort: this.sort
      });
    } else {
      this.currentCS.sort(this.sort);
    }
  }
};

// src/stages/$facet.ts
var $facet = class extends BaseStage {
  query;
  constructor({ params, ds, cs }) {
    super({ ds, cs });
    this.query = params;
  }
  async run() {
    const resultPromisses = [];
    const fieldKeys = [];
    if (this.currentCS !== null) {
      await this.updateCursorsDatastore();
    }
    Object.entries(this.query).forEach(([fieldKey, value]) => {
      if (!Array.isArray(value)) {
        throw new Error(
          `arguments to $facet must be arrays, ${fieldKey} is type ${typeof value}`
        );
      }
      const tempCS = new Cursor(this.currentDS, {}, null, {
        sort: this.currentCS?._sort
      });
      const newAggregation = new Aggregation({
        cs: tempCS,
        ds: this.currentDS,
        params: value
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
    const { ds, cs } = await this.createDatastoreFromDocs([newDoc]);
    this.currentDS = ds;
    this.currentCS = cs;
  }
};

// src/stages/$skip.ts
var $skip = class extends BaseStage {
  skip;
  constructor({ params, ds, cs }) {
    super({ ds, cs });
    if (!Number.isInteger(params)) {
      throw new Error(`Expected an integer: $skip: ${params}`);
    }
    this.skip = params;
  }
  async run() {
    if (this.currentCS === null) {
      this.currentCS = new Cursor(this.currentDS, {}, null, {
        skip: this.skip
      });
    } else {
      this.currentCS.skip(this.skip);
    }
  }
};

// src/stages/$project.ts
var $project = class extends BaseStage {
  project;
  constructor({ params, ds, cs }) {
    super({ ds, cs });
    this.project = params;
  }
  async run() {
    if (this.currentCS === null) {
      this.currentCS = new Cursor(this.currentDS, {}, null, {
        projection: this.project
      });
    } else {
      this.currentCS.projection(this.project);
    }
  }
};

// src/stages/$lookup.ts
var import_model3 = __toESM(require("@seald-io/nedb/lib/model"), 1);
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

// src/stages/$lookup.ts
var $lookup = class extends BaseStage {
  query;
  constructor({ params, ds, cs }) {
    super({ ds, cs });
    this.query = params;
  }
  async run() {
    let docs = [];
    if (this.currentCS === null) {
      docs = this.currentDS.getAllData();
    } else {
      docs = await this.currentCS.execAsync();
    }
    const { from, localField, foreignField, as, pipeline = [] } = this.query;
    const localFieldKeys = import_lodash2.default.uniq(
      docs.map((d) => import_model3.default.getDotValue(d, localField))
    ).flat();
    const foreignDocs = await this.getForeingDS(
      from,
      foreignField,
      localFieldKeys,
      pipeline
    );
    const joiner = new RightJoiner(foreignDocs, docs, {
      foreignField,
      localField,
      as,
      dropNoMatch: false
    });
    const newDocs = joiner.join();
    const { cs, ds } = await this.createDatastoreFromDocs(newDocs);
    this.currentDS = ds;
    this.currentCS = cs.sort(this.currentCS?._sort);
  }
  async getForeingDS(from, foreignField, localFieldKeys, pipeline) {
    const foreignDS = getClient()._collections[from];
    let foreignDocs = [];
    if (typeof foreignDS !== "undefined") {
      if (foreignField in foreignDS.indexes) {
        const docs = foreignDS.indexes[foreignField].getMatching(localFieldKeys);
        const { ds: newForeignDs } = await this.createDatastoreFromDocs(docs);
        const foreignPipeline = [];
        const newAggregation = new Aggregation({
          ds: newForeignDs,
          cs: null,
          params: foreignPipeline.concat(pipeline)
        });
        foreignDocs = await newAggregation.run();
      } else {
        const foreignPipeline = [
          {
            $match: {
              [foreignField]: { $in: localFieldKeys }
            }
          }
        ];
        const newAggregation = new Aggregation({
          ds: foreignDS,
          cs: null,
          params: foreignPipeline.concat(pipeline)
        });
        foreignDocs = await newAggregation.run();
      }
    } else {
      throw new Error("Foreign model doesn't have aggregate function");
    }
    return foreignDocs;
  }
};

// src/stages/$match.ts
var import_model4 = __toESM(require("@seald-io/nedb/lib/model"), 1);
var $match = class extends BaseStage {
  query;
  constructor({ params, ds, cs }) {
    super({ ds, cs });
    this.query = params;
  }
  async run() {
    if (this.currentCS !== null) {
      await this.updateCursorsDatastore();
      this.currentCS.query = this.query;
      this.currentCS.mapFn = (docs) => docs.map((doc) => import_model4.default.deepCopy(doc));
    } else {
      this.currentCS = new Cursor(
        this.currentDS,
        this.query,
        (docs) => docs.map((doc) => import_model4.default.deepCopy(doc))
      );
    }
  }
};

// src/stages/$count.ts
var $count = class extends BaseStage {
  countText;
  constructor({ params, ds, cs }) {
    super({ ds, cs });
    this.countText = params;
  }
  async run() {
    let countDocs = 0;
    if (this.currentCS !== null) {
      countDocs = (await this.updateCursorsDatastore()).length;
    } else {
      countDocs = await this.currentDS.countAsync({});
    }
    const newDocs = [
      {
        [this.countText]: countDocs
      }
    ];
    const { cs, ds } = await this.createDatastoreFromDocs(newDocs);
    this.currentCS = cs;
    this.currentDS = ds;
  }
};

// src/stages/$addFields.ts
var import_lodash3 = __toESM(require("lodash"), 1);

// src/expressionHelpers.ts
var import_model5 = __toESM(require("@seald-io/nedb/lib/model"), 1);
function getExpressionValue(data, exp) {
  if (typeof exp === "string" && exp.startsWith("$")) {
    if (Array.isArray(data)) {
      const docs = { docs: data };
      const loc = `docs.${exp.split("$")[1]}`;
      return import_model5.default.getDotValue(docs, loc);
    } else {
      const loc = `${exp.split("$")[1]}`;
      return import_model5.default.getDotValue(data, loc);
    }
  }
  return exp;
}

// src/operators/$sum.ts
function $sum(data, val) {
  if (Array.isArray(data)) {
    if (Array.isArray(val)) {
      throw new Error("The $sum accumulator is a unary operator");
    }
    const result = data.reduce((acc, curr) => {
      if (typeof val === "number") {
        acc = acc + val;
      } else {
        const v = getExpressionValue(curr, val);
        if (typeof v === "number") {
          acc = acc + v;
        }
      }
      return acc;
    }, 0);
    return result;
  } else {
    if (Array.isArray(val) && val.length > 1) {
      const result = val.reduce((acc, curr) => {
        const v = getExpressionValue(data, curr);
        if (typeof v === "number") {
          return v + acc;
        }
        return acc;
      }, 0);
      return result;
    } else {
      const currVal = Array.isArray(val) ? val[0] : val;
      const v = getExpressionValue(data, currVal);
      const arrV = [].concat(v);
      return arrV.reduce((acc, curr) => {
        if (typeof curr === "number") {
          return acc + curr;
        }
        return acc;
      }, 0);
    }
  }
}

// src/calcExpression.ts
var operators = { $sum };
function calcObject(data, exp) {
  return Object.entries(exp).reduce((acc, [key, val]) => {
    if (typeof operators[key] !== void 0) {
      return operators[key](data, val);
    } else {
      const newAcc = {
        ...acc,
        [key]: calcExpression(data, val)
      };
      return newAcc;
    }
  }, {});
}
function calcExpression(data, exp) {
  if (Array.isArray(exp)) {
    return exp.map((e) => {
      return calcExpression(data, e);
    });
  } else if (typeof exp === "object" && exp !== null) {
    return calcObject(data, exp);
  } else {
    return getExpressionValue(data, exp);
  }
}

// src/stages/$addFields.ts
var $addFields = class extends BaseStage {
  query;
  constructor({ params, ds, cs }) {
    super({ ds, cs });
    this.query = params;
    if (typeof this.query !== "object" && this.query === null && Array.isArray(this.query)) {
      throw new Error("$addFields specification stage must be an object");
    }
    if (Object.keys(params).find((s) => s.startsWith("$"))) {
      throw new Error("FieldPath field names may not start with $");
    }
  }
  async run() {
    let docs = [];
    if (this.currentCS !== null) {
      docs = await this.currentCS.execAsync();
    } else {
      docs = this.currentDS.getAllData();
    }
    const newDocs = docs.map((doc) => {
      const newVarObj = Object.entries(this.query).reduce((acc, [key, exp]) => {
        return {
          ...acc,
          [key]: calcExpression(doc, exp)
        };
      }, {});
      return import_lodash3.default.assign(doc, newVarObj);
    });
    const { ds, cs } = await this.createDatastoreFromDocs(newDocs);
    this.currentCS = cs;
    this.currentDS = ds;
  }
};

// src/Aggregation.ts
var Aggregation = class extends BaseStage {
  currentPipeline;
  pipeline;
  stages = {
    $count,
    $facet,
    $limit,
    $lookup,
    $match,
    $project,
    $skip,
    $sort,
    $addFields
  };
  constructor({ ds, cs, params }) {
    super({ ds, cs });
    this.pipeline = params;
    this.parsePipeline();
  }
  run() {
    return this._aggregate();
  }
  async _aggregate() {
    const operator = this.currentPipeline.shift();
    if (typeof operator === "undefined") {
      this.currentCS = this.currentCS || new Cursor(this.currentDS, {}, null);
      return this.currentCS.execAsync();
    }
    const stage = new this.stages[operator.name]({
      ds: this.currentDS,
      cs: this.currentCS,
      params: operator.params
    });
    await stage.run();
    this.currentDS = stage.currentDS;
    this.currentCS = stage.currentCS;
    return this._aggregate();
  }
  parsePipeline() {
    this.currentPipeline = this.pipeline.reduce(
      (acc, p) => {
        const stages = Object.keys(p);
        if (stages.length <= 1) {
          const [stageName] = stages;
          const stage = this.stages[stageName];
          if (!(typeof stage !== "undefined" && stageName.startsWith("$"))) {
            throw new Error(`aggregate: Operator not defined -> ${stageName}`);
          }
          const params = p[stageName];
          const operator = {
            name: stageName,
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
    static findOneAndUpdate(query, updateQuery, options) {
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
    static countDocuments(query = {}) {
      return getClient().count(this.collectionName, query);
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
      const start = performance.now();
      const aggregateObj = new Aggregation({
        ds: getClient()._collections[this.collectionName],
        cs: null,
        params: pipeline
      });
      const data = await aggregateObj.run();
      const end = performance.now();
      console.log(`GENERAL Aggregation lookup time: ${end - start}ms`);
      return data;
    }
  }
  return BaseModel;
}

// src/createModel.ts
var baseDbSchema = (0, import_yup.object)({
  _id: (0, import_yup.string)().trim().transform((v) => v.toString()).notRequired(),
  createdAt: (0, import_yup.date)().notRequired(),
  updatedAt: (0, import_yup.date)().notRequired()
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
      return res;
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
var import_model6 = __toESM(require("@seald-io/nedb/lib/model"), 1);
async function castAndValidateOnUpserting(schema, query, updateQ) {
  let toBeInserted;
  try {
    import_model6.default.checkObject(updateQ);
    toBeInserted = updateQ;
  } catch (e) {
    toBeInserted = import_model6.default.modify(import_model6.default.deepCopy(query, true), updateQ);
  }
  const validatedData = await schema.validate(toBeInserted);
  return validatedData;
}
async function castAndValidateOnUpdate(schema, oldDoc, updateQ, overwrite) {
  if (overwrite || hasOperator(updateQ)) {
    const newDoc = import_model6.default.modify(import_model6.default.deepCopy(oldDoc), updateQ);
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
    return import_path.default.join(this._path, collection) + ".db";
  }
  model(name, schema) {
    if (this._path === "memory") {
      const ds2 = new import_nedb2.default({ inMemoryOnly: true, ...this._options });
    }
    let collectionPath = this.getCollectionPath(name);
    const ds = new import_nedb2.default({ filename: collectionPath, ...this._options });
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
    let castedValues = values;
    if (options.validateBeforeSave) {
      castedValues = await currentSchema.validate(values);
    }
    if (typeof id === "undefined") {
      const result2 = await currentCollection.insertAsync(castedValues);
      return result2;
    }
    const result = await currentCollection.updateAsync(
      { _id: id },
      { $set: castedValues },
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
      (docs) => docs.length === 1 ? import_model7.default.deepCopy(docs[0]) : null,
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
      (docs) => docs.map((doc) => import_model7.default.deepCopy(doc)),
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
   */
  async count(collection, query) {
    const currentCollection = this._collections[collection];
    const cursor = new Cursor(
      currentCollection,
      query,
      (docs) => docs.length
    );
    const docCounts = await cursor;
    return docCounts;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connect,
  getClient
});
