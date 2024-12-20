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
var import_nedb3 = __toESM(require("@seald-io/nedb"), 1);

// src/lib/NeDbModel.ts
var import_lodash = require("lodash");
var checkKey = (k, v) => {
  if (typeof k === "number") k = k.toString();
  if (k[0] === "$" && !(k === "$$date" && typeof v === "number") && !(k === "$$deleted" && v === true) && !(k === "$$indexCreated") && !(k === "$$indexRemoved"))
    throw new Error("Field names cannot begin with the $ character");
  if (k.indexOf(".") !== -1) throw new Error("Field names cannot contain a .");
};
var checkObject = (obj) => {
  if (Array.isArray(obj)) {
    obj.forEach((o) => {
      checkObject(o);
    });
  }
  if (typeof obj === "object" && obj !== null) {
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        checkKey(k, obj[k]);
        checkObject(obj[k]);
      }
    }
  }
};
function deepCopy(obj, strictKeys = false) {
  if (typeof obj === "boolean" || typeof obj === "number" || typeof obj === "string" || obj === null || (0, import_lodash.isDate)(obj))
    return obj;
  if (Array.isArray(obj)) return obj.map((o) => deepCopy(o, strictKeys));
  if (typeof obj === "object") {
    const res = {};
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k) && (!strictKeys || k[0] !== "$" && k.indexOf(".") === -1)) {
        res[k] = deepCopy(obj[k], strictKeys);
      }
    }
    return res;
  }
  return void 0;
}
var isPrimitiveType = (obj) => typeof obj === "boolean" || typeof obj === "number" || typeof obj === "string" || obj === null || (0, import_lodash.isDate)(obj) || Array.isArray(obj);
var compareNSB = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
var compareArrays = (a, b) => {
  const minLength = Math.min(a.length, b.length);
  for (let i = 0; i < minLength; i += 1) {
    const comp = compareThings(a[i], b[i]);
    if (comp !== 0) return comp;
  }
  return compareNSB(a.length, b.length);
};
var compareThings = (a, b, _compareStrings) => {
  const compareStrings = _compareStrings || compareNSB;
  if (a === void 0) return b === void 0 ? 0 : -1;
  if (b === void 0) return 1;
  if (a === null) return b === null ? 0 : -1;
  if (b === null) return 1;
  if (typeof a === "number")
    return typeof b === "number" ? compareNSB(a, b) : -1;
  if (typeof b === "number")
    return typeof a === "number" ? compareNSB(a, b) : 1;
  if (typeof a === "string")
    return typeof b === "string" ? compareStrings(a, b) : -1;
  if (typeof b === "string")
    return typeof a === "string" ? compareStrings(a, b) : 1;
  if (typeof a === "boolean")
    return typeof b === "boolean" ? compareNSB(a, b) : -1;
  if (typeof b === "boolean")
    return typeof a === "boolean" ? compareNSB(a, b) : 1;
  if ((0, import_lodash.isDate)(a)) return (0, import_lodash.isDate)(b) ? compareNSB(a.getTime(), b.getTime()) : -1;
  if ((0, import_lodash.isDate)(b)) return (0, import_lodash.isDate)(a) ? compareNSB(a.getTime(), b.getTime()) : 1;
  if (Array.isArray(a)) return Array.isArray(b) ? compareArrays(a, b) : -1;
  if (Array.isArray(b)) return Array.isArray(a) ? compareArrays(a, b) : 1;
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  for (let i = 0; i < Math.min(aKeys.length, bKeys.length); i += 1) {
    const comp = compareThings(a[aKeys[i]], b[bKeys[i]]);
    if (comp !== 0) return comp;
  }
  return compareNSB(aKeys.length, bKeys.length);
};
var createModifierFunction = (lastStepModifierFunction, unset = false) => (obj, field, value) => {
  const func = (obj2, field2, value2) => {
    const fieldParts = typeof field2 === "string" ? field2.split(".") : field2;
    if (fieldParts.length === 1) lastStepModifierFunction(obj2, field2, value2);
    else {
      if (obj2[fieldParts[0]] === void 0) {
        if (unset) return;
        obj2[fieldParts[0]] = {};
      }
      func(obj2[fieldParts[0]], fieldParts.slice(1), value2);
    }
  };
  return func(obj, field, value);
};
var $addToSetPartial = (obj, field, value) => {
  if (!Object.prototype.hasOwnProperty.call(obj, field)) {
    obj[field] = [];
  }
  if (!Array.isArray(obj[field]))
    throw new Error("Can't $addToSet an element on non-array values");
  if (value !== null && typeof value === "object" && value.$each) {
    if (Object.keys(value).length > 1)
      throw new Error("Can't use another field in conjunction with $each");
    if (!Array.isArray(value.$each))
      throw new Error("$each requires an array value");
    value.$each.forEach((v) => {
      $addToSetPartial(obj, field, v);
    });
  } else {
    let addToSet = true;
    obj[field].forEach((v) => {
      if (compareThings(v, value) === 0) addToSet = false;
    });
    if (addToSet) obj[field].push(value);
  }
};
var modifierFunctions = {
  /**
   * Set a field to a new value
   */
  $set: createModifierFunction((obj, field, value) => {
    obj[field] = value;
  }),
  /**
   * Unset a field
   */
  $unset: createModifierFunction((obj, field, value) => {
    delete obj[field];
  }, true),
  /**
   * Updates the value of the field, only if specified field is smaller than the current value of the field
   */
  $min: createModifierFunction((obj, field, value) => {
    if (typeof obj[field] === "undefined") obj[field] = value;
    else if (value < obj[field]) obj[field] = value;
  }),
  /**
   * Updates the value of the field, only if specified field is greater than the current value of the field
   */
  $max: createModifierFunction((obj, field, value) => {
    if (typeof obj[field] === "undefined") obj[field] = value;
    else if (value > obj[field]) obj[field] = value;
  }),
  /**
   * Increment a numeric field's value
   */
  $inc: createModifierFunction((obj, field, value) => {
    if (typeof value !== "number") throw new Error(`${value} must be a number`);
    if (typeof obj[field] !== "number") {
      if (!Object.prototype.hasOwnProperty.call(obj, field)) obj[field] = value;
      else throw new Error("Don't use the $inc modifier on non-number fields");
    } else obj[field] += value;
  }),
  /**
   * Removes all instances of a value from an existing array
   */
  $pull: createModifierFunction((obj, field, value) => {
    if (!Array.isArray(obj[field]))
      throw new Error("Can't $pull an element from non-array values");
    const arr = obj[field];
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      if (match(arr[i], value)) arr.splice(i, 1);
    }
  }),
  /**
   * Remove the first or last element of an array
   */
  $pop: createModifierFunction((obj, field, value) => {
    if (!Array.isArray(obj[field]))
      throw new Error("Can't $pop an element from non-array values");
    if (typeof value !== "number")
      throw new Error(`${value} isn't an integer, can't use it with $pop`);
    if (value === 0) return;
    if (value > 0) obj[field] = obj[field].slice(0, obj[field].length - 1);
    else obj[field] = obj[field].slice(1);
  }),
  /**
   * Add an element to an array field only if it is not already in it
   * No modification if the element is already in the array
   * Note that it doesn't check whether the original array contains duplicates
   */
  $addToSet: createModifierFunction($addToSetPartial),
  /**
   * Push an element to the end of an array field
   * Optional modifier $each instead of value to push several values
   * Optional modifier $slice to slice the resulting array, see https://docs.mongodb.org/manual/reference/operator/update/slice/
   * Difference with MongoDB: if $slice is specified and not $each, we act as if value is an empty array
   */
  $push: createModifierFunction((obj, field, value) => {
    if (!Object.prototype.hasOwnProperty.call(obj, field)) obj[field] = [];
    if (!Array.isArray(obj[field]))
      throw new Error("Can't $push an element on non-array values");
    if (value !== null && typeof value === "object" && value.$slice && value.$each === void 0)
      value.$each = [];
    if (value !== null && typeof value === "object" && value.$each) {
      if (Object.keys(value).length >= 3 || Object.keys(value).length === 2 && value.$slice === void 0)
        throw new Error(
          "Can only use $slice in cunjunction with $each when $push to array"
        );
      if (!Array.isArray(value.$each))
        throw new Error("$each requires an array value");
      value.$each.forEach((v) => {
        obj[field].push(v);
      });
      if (value.$slice === void 0 || typeof value.$slice !== "number")
        return;
      if (value.$slice === 0) obj[field] = [];
      else {
        let start;
        let end;
        const n = obj[field].length;
        if (value.$slice < 0) {
          start = Math.max(0, n + value.$slice);
          end = n;
        } else if (value.$slice > 0) {
          start = 0;
          end = Math.min(n, value.$slice);
        }
        obj[field] = obj[field].slice(start, end);
      }
    } else {
      obj[field].push(value);
    }
  })
};
var modify = (obj, updateQuery) => {
  const keys = Object.keys(updateQuery);
  const firstChars = keys.map((item) => item[0]);
  const dollarFirstChars = firstChars.filter((c) => c === "$");
  let newDoc;
  let modifiers;
  if (keys.indexOf("_id") !== -1 && updateQuery._id !== obj._id)
    throw new Error("You cannot change a document's _id");
  if (dollarFirstChars.length !== 0 && dollarFirstChars.length !== firstChars.length)
    throw new Error("You cannot mix modifiers and normal fields");
  if (dollarFirstChars.length === 0) {
    newDoc = deepCopy(updateQuery);
    newDoc._id = obj._id;
  } else {
    modifiers = (0, import_lodash.uniq)(keys);
    newDoc = deepCopy(obj);
    modifiers.forEach((m) => {
      if (!modifierFunctions[m]) throw new Error(`Unknown modifier ${m}`);
      if (typeof updateQuery[m] !== "object")
        throw new Error(`Modifier ${m}'s argument must be an object`);
      const keys2 = Object.keys(updateQuery[m]);
      keys2.forEach((k) => {
        modifierFunctions[m](newDoc, k, updateQuery[m][k]);
      });
    });
  }
  checkObject(newDoc);
  if (obj._id !== newDoc._id)
    throw new Error("You can't change a document's _id");
  return newDoc;
};
var getDotValue = (obj, field) => {
  const fieldParts = typeof field === "string" ? field.split(".") : field;
  if (!obj) return void 0;
  if (fieldParts.length === 0) return obj;
  if (fieldParts.length === 1) return obj[fieldParts[0]];
  if (Array.isArray(obj[fieldParts[0]])) {
    const i = parseInt(fieldParts[1], 10);
    if (typeof i === "number" && !isNaN(i))
      return getDotValue(obj[fieldParts[0]][i], fieldParts.slice(2));
    return obj[fieldParts[0]].map((el) => getDotValue(el, fieldParts.slice(1)));
  } else return getDotValue(obj[fieldParts[0]], fieldParts.slice(1));
};
var areThingsEqual = (a, b) => {
  if (a === null || typeof a === "string" || typeof a === "boolean" || typeof a === "number" || b === null || typeof b === "string" || typeof b === "boolean" || typeof b === "number")
    return a === b;
  if ((0, import_lodash.isDate)(a) || (0, import_lodash.isDate)(b))
    return (0, import_lodash.isDate)(a) && (0, import_lodash.isDate)(b) && a.getTime() === b.getTime();
  if (!(Array.isArray(a) && Array.isArray(b)) && (Array.isArray(a) || Array.isArray(b)) || a === void 0 || b === void 0)
    return false;
  let aKeys;
  let bKeys;
  try {
    aKeys = Object.keys(a);
    bKeys = Object.keys(b);
  } catch (e) {
    return false;
  }
  if (aKeys.length !== bKeys.length) return false;
  for (const el of aKeys) {
    if (bKeys.indexOf(el) === -1) return false;
    if (!areThingsEqual(a[el], b[el])) return false;
  }
  return true;
};
var areComparable = (a, b) => {
  if (typeof a !== "string" && typeof a !== "number" && !(0, import_lodash.isDate)(a) && typeof b !== "string" && typeof b !== "number" && !(0, import_lodash.isDate)(b))
    return false;
  if (typeof a !== typeof b) return false;
  return true;
};
var comparisonFunctions = {
  /** Lower than */
  $lt: (a, b) => areComparable(a, b) && a < b,
  /** Lower than or equals */
  $lte: (a, b) => areComparable(a, b) && a <= b,
  /** Greater than */
  $gt: (a, b) => areComparable(a, b) && a > b,
  /** Greater than or equals */
  $gte: (a, b) => areComparable(a, b) && a >= b,
  /** Does not equal */
  $ne: (a, b) => a === void 0 || !areThingsEqual(a, b),
  /** Is in Array */
  $in: (a, b) => {
    if (!Array.isArray(b))
      throw new Error("$in operator called with a non-array");
    for (const el of b) {
      if (areThingsEqual(a, el)) return true;
    }
    return false;
  },
  /** Is not in Array */
  $nin: (a, b) => {
    if (!Array.isArray(b))
      throw new Error("$nin operator called with a non-array");
    return !comparisonFunctions.$in(a, b);
  },
  /** Matches Regexp */
  $regex: (a, b) => {
    if (!(0, import_lodash.isRegExp)(b))
      throw new Error("$regex operator called with non regular expression");
    if (typeof a !== "string") return false;
    else return b.test(a);
  },
  /** Returns true if field exists */
  $exists: (a, b) => {
    if (b || b === "") b = true;
    else b = false;
    if (a === void 0) return !b;
    else return b;
  },
  /** Specific to Arrays, returns true if a length equals b */
  $size: (a, b) => {
    if (!Array.isArray(a)) return false;
    if (b % 1 !== 0)
      throw new Error("$size operator called without an integer");
    return a.length === b;
  },
  /** Specific to Arrays, returns true if some elements of a match the query b */
  $elemMatch: (a, b) => {
    if (!Array.isArray(a)) return false;
    return a.some((el) => match(el, b));
  }
};
var arrayComparisonFunctions = { $size: true, $elemMatch: true };
var logicalOperators = {
  /**
   * Match any of the subqueries
   * @param {document} obj
   * @param {query[]} query
   * @return {boolean}
   */
  $or: (obj, query) => {
    if (!Array.isArray(query))
      throw new Error("$or operator used without an array");
    for (let i = 0; i < query.length; i += 1) {
      if (match(obj, query[i])) return true;
    }
    return false;
  },
  /**
   * Match all of the subqueries
   * @param {document} obj
   * @param {query[]} query
   * @return {boolean}
   */
  $and: (obj, query) => {
    if (!Array.isArray(query))
      throw new Error("$and operator used without an array");
    for (let i = 0; i < query.length; i += 1) {
      if (!match(obj, query[i])) return false;
    }
    return true;
  },
  /**
   * Inverted match of the query
   * @param {document} obj
   * @param {query} query
   * @return {boolean}
   */
  $not: (obj, query) => !match(obj, query),
  /**
   * @callback whereCallback
   * @param {document} obj
   * @return {boolean}
   */
  /**
   * Use a function to match
   * @param {document} obj
   * @param {whereCallback} fn
   * @return {boolean}
   */
  $where: (obj, fn) => {
    if (typeof fn !== "function")
      throw new Error("$where operator used without a function");
    const result = fn.call(obj);
    if (typeof result !== "boolean")
      throw new Error("$where function must return boolean");
    return result;
  }
};
var match = (obj, query) => {
  if (isPrimitiveType(obj) || isPrimitiveType(query))
    return matchQueryPart({ needAKey: obj }, "needAKey", query);
  for (const queryKey in query) {
    if (Object.prototype.hasOwnProperty.call(query, queryKey)) {
      const queryValue = query[queryKey];
      if (queryKey[0] === "$") {
        if (!logicalOperators[queryKey])
          throw new Error(`Unknown logical operator ${queryKey}`);
        if (!logicalOperators[queryKey](obj, queryValue)) return false;
      } else if (!matchQueryPart(obj, queryKey, queryValue)) return false;
    }
  }
  return true;
};
function matchQueryPart(obj, queryKey, queryValue, treatObjAsValue) {
  const objValue = getDotValue(obj, queryKey);
  if (Array.isArray(objValue) && !treatObjAsValue) {
    if (Array.isArray(queryValue))
      return matchQueryPart(obj, queryKey, queryValue, true);
    if (queryValue !== null && typeof queryValue === "object" && !(0, import_lodash.isRegExp)(queryValue)) {
      for (const key in queryValue) {
        if (Object.prototype.hasOwnProperty.call(queryValue, key) && arrayComparisonFunctions[key]) {
          return matchQueryPart(obj, queryKey, queryValue, true);
        }
      }
    }
    for (const el of objValue) {
      if (matchQueryPart({ k: el }, "k", queryValue)) return true;
    }
    return false;
  }
  if (queryValue !== null && typeof queryValue === "object" && !(0, import_lodash.isRegExp)(queryValue) && !Array.isArray(queryValue)) {
    const keys = Object.keys(queryValue);
    const firstChars = keys.map((item) => item[0]);
    const dollarFirstChars = firstChars.filter((c) => c === "$");
    if (dollarFirstChars.length !== 0 && dollarFirstChars.length !== firstChars.length)
      throw new Error("You cannot mix operators and normal fields");
    if (dollarFirstChars.length > 0) {
      for (const key of keys) {
        if (!comparisonFunctions[key])
          throw new Error(`Unknown comparison function ${key}`);
        if (!comparisonFunctions[key](objValue, queryValue[key])) return false;
      }
      return true;
    }
  }
  if ((0, import_lodash.isRegExp)(queryValue))
    return comparisonFunctions.$regex(objValue, queryValue);
  return areThingsEqual(objValue, queryValue);
}

// src/Cursor.ts
var import_cursor = __toESM(require("@seald-io/nedb/lib/cursor"), 1);
var Cursor = class extends import_cursor.default {
  constructor(db, query, mapFn, options = {}) {
    if (mapFn === null) {
      mapFn = (docs) => docs.map((doc) => deepCopy(doc));
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
function hasOperator(obj) {
  try {
    checkObject(obj);
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

// src/expressionHelpers.ts
function parseExpValue(text) {
  let exp = text;
  const isExp = typeof text === "string" && text.startsWith("$");
  if (isExp) {
    exp = text.split("$")[1];
  }
  return {
    isExp,
    exp
  };
}
function getExpressionValue(data, params) {
  const { isExp, exp } = parseExpValue(params);
  if (isExp) {
    if (Array.isArray(data)) {
      const docs = { docs: data };
      const loc = `docs.${exp}`;
      return getDotValue(docs, loc);
    } else {
      const loc = `${exp}`;
      return getDotValue(data, loc);
    }
  }
  return params;
}

// src/stages/BaseStage.ts
var BaseStage = class {
  datastoreOptions;
  currentDS;
  currentCS;
  operators;
  constructor({ ds, cs }) {
    this.currentDS = ds;
    this.currentCS = cs;
    this.datastoreOptions = {
      inMemoryOnly: true,
      // @ts-ignore
      compareStrings: this.currentDS.compareStrings
    };
    this.operators = {};
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
  calcObject(data, exp) {
    let singleton = false;
    return Object.entries(exp).reduce((acc, [key, params]) => {
      if (typeof this.operators[key] !== "undefined") {
        const opt = new this.operators[key]({ data, params });
        const res = opt.run();
        if (res !== void 0) {
          singleton = true;
          return res;
        } else {
          return acc;
        }
      } else {
        if (singleton) {
          throw new Error(
            "an expression specification must contain exactly one field"
          );
        }
        const newAcc = {
          ...acc,
          [key]: this.calcExpression(data, params)
        };
        return newAcc;
      }
    }, {});
  }
  calcExpression(data, exp) {
    if (Array.isArray(exp)) {
      return exp.map((e) => {
        return this.calcExpression(data, e);
      });
    } else if (typeof exp === "object" && exp !== null) {
      return this.calcObject(data, exp);
    } else {
      return getExpressionValue(data, exp);
    }
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
var import_lodash3 = __toESM(require("lodash"), 1);

// src/utils/RighJoiner.ts
var import_lodash2 = __toESM(require("lodash"), 1);
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
    const foreignByField = import_lodash2.default.groupBy(
      this.foreignObj,
      this.options.foreignField
    );
    const result = this.localObj.map((lo) => {
      if (this.options.dropNoMatch && (typeof lo[this.options.localField] === "undefined" || typeof foreignByField[lo[this.options.localField]] === "undefined")) {
        return void 0;
      }
      const loFieldObjs = import_lodash2.default.uniq([].concat(lo[this.options.localField]));
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
    return import_lodash2.default.compact(result);
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
      docs = await this.currentDS.findAsync({});
    } else {
      docs = await this.currentCS.execAsync();
    }
    const { from, localField, foreignField, as, pipeline = [] } = this.query;
    const localFieldKeys = import_lodash3.default.uniq(
      docs.map((d) => getDotValue(d, localField))
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
      this.currentCS.mapFn = (docs) => docs.map((doc) => deepCopy(doc));
    } else {
      this.currentCS = new Cursor(
        this.currentDS,
        this.query,
        (docs) => docs.map((doc) => deepCopy(doc))
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
var import_lodash4 = __toESM(require("lodash"), 1);

// src/operators/BaseOperator.ts
var BaseOperator = class {
  data;
  operators;
  constructor() {
    this.operators = {};
  }
  calcObject(data, exp) {
    return Object.entries(exp).reduce((acc, [key, val]) => {
      if (typeof this.operators[key] !== void 0) {
        return this.operators[key](data, val);
      } else {
        const newAcc = {
          ...acc,
          [key]: this.calcExpression(data, val)
        };
        return newAcc;
      }
    }, {});
  }
  calcExpression(data, exp) {
    if (Array.isArray(exp)) {
      return exp.map((e) => {
        return this.calcExpression(data, e);
      });
    } else if (typeof exp === "object" && exp !== null) {
      return this.calcObject(data, exp);
    } else {
      return getExpressionValue(data, exp);
    }
  }
};

// src/operators/Accumulators/$sum.ts
var $sum = class extends BaseOperator {
  static operatorType = "accumulator";
  data;
  params;
  constructor({ data, params }) {
    super();
    this.data = data;
    this.params = params;
  }
  run() {
    if (Array.isArray(this.data)) {
      if (Array.isArray(this.params)) {
        throw new Error("The $sum accumulator is a unary operator");
      }
      const result = this.data.reduce((acc, curr) => {
        if (typeof this.params === "number") {
          acc = acc + this.params;
        } else {
          const v = getExpressionValue(curr, this.params);
          if (typeof v === "number") {
            acc = acc + v;
          }
        }
        return acc;
      }, 0);
      return result;
    } else {
      if (Array.isArray(this.params) && this.params.length > 1) {
        const result = this.params.reduce((acc, curr) => {
          const v = getExpressionValue(this.data, curr);
          if (typeof v === "number") {
            return v + acc;
          }
          return acc;
        }, 0);
        return result;
      } else {
        const currVal = Array.isArray(this.params) ? this.params[0] : this.params;
        const v = getExpressionValue(this.data, currVal);
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
};

// src/stages/$addFields.ts
var $addFields = class extends BaseStage {
  query;
  operators = { $sum };
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
      docs = await this.currentDS.findAsync({});
    }
    const newDocs = docs.map((doc) => {
      const newVarObj = Object.entries(this.query).reduce((acc, [key, exp]) => {
        modifierFunctions.$set(acc, key, this.calcExpression(doc, exp));
        return acc;
      }, {});
      return import_lodash4.default.assign(doc, newVarObj);
    });
    const { ds, cs } = await this.createDatastoreFromDocs(newDocs);
    this.currentCS = cs;
    this.currentDS = ds;
  }
};

// src/stages/$group.ts
var import_flat = require("flat");

// src/lib/NeDbUtils.ts
var isObject = (arg) => typeof arg === "object" && arg !== null;

// src/stages/$group.ts
var import_nedb2 = __toESM(require("@seald-io/nedb"), 1);
var $group = class extends BaseStage {
  params;
  groupDs;
  operators = { $sum };
  constructor({ params, ds, cs }) {
    super({ ds, cs });
    this.params = params;
    if (!(isObject(params) && "_id" in params)) {
      throw new Error("a group specification must include an _id");
    }
    this.groupDs = new import_nedb2.default({ autoload: true, inMemoryOnly: true });
  }
  async run() {
    let docs = [];
    if (this.currentCS === null) {
      docs = await this.currentDS.findAsync({});
    } else {
      docs = await this.currentCS.execAsync();
    }
    await this.ensureGroupDsIndex();
    await this.createGroups(docs);
    this.currentDS = this.groupDs;
  }
  async createGroups(docs) {
    for (const doc of docs) {
      const newDoc = this.calcExpression(doc, this.params);
      const existDoc = await this.groupDs.findOneAsync(newDoc);
      if (existDoc) {
        await this.groupDs.removeAsync(newDoc, { multi: false });
        await this.groupDs.insertAsync({
          ...existDoc,
          docs: existDoc.docs.concat(doc)
        });
      } else {
        await this.groupDs.insertAsync({ ...newDoc, docs: [doc] });
      }
    }
  }
  async ensureGroupDsIndex() {
    const { expKeys } = this.getKeys();
    await this.groupDs.ensureIndexAsync({
      fieldName: expKeys,
      unique: false
    });
  }
  getKeys() {
    let keys = {};
    keys = (0, import_flat.flatten)(this.params);
    const expKeys = Object.values(keys).reduce((acc, curr) => {
      const { isExp, exp } = parseExpValue(curr);
      if (isExp) {
        acc.push(exp);
      }
      return acc;
    }, []);
    return {
      keys,
      expKeys
    };
  }
  // $group: {
  //    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },  // Her günü gruplayarak tarihi biçimlendiriyoruz
  //    products: { $push: "$$ROOT" }  // Her gün için ürünlerin tamamını listele
  //  }
  // group stage i her bir key içine sadece accumulator alıyor, örneğin $sum, $push
  // protected checkOperator(exp) {
  //   const keys = Object.keys(exp);
  //   if (keys.length > 1) {
  //     keys.forEach((key) => {
  //       if (typeof this.operators[key] !== "undefined") {
  //         if (this.operators[key].operatorType === "accumulator") {
  //           throw new Error(`The field must specify one accumulator`);
  //         }
  //       }
  //     });
  //   }
  // }
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
    $addFields,
    $group
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
      const aggregateObj = new Aggregation({
        ds: getClient()._collections[this.collectionName],
        cs: null,
        params: pipeline
      });
      const data = await aggregateObj.run();
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
async function castAndValidateOnUpserting(schema, query, updateQ) {
  let toBeInserted;
  try {
    checkObject(updateQ);
    toBeInserted = updateQ;
  } catch (e) {
    toBeInserted = modify(deepCopy(query, true), updateQ);
  }
  const validatedData = await schema.validate(toBeInserted);
  return validatedData;
}
async function castAndValidateOnUpdate(schema, oldDoc, updateQ, overwrite) {
  if (overwrite || hasOperator(updateQ)) {
    const newDoc = modify(deepCopy(oldDoc), updateQ);
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
      const ds2 = new import_nedb3.default({ inMemoryOnly: true, ...this._options });
    }
    let collectionPath = this.getCollectionPath(name);
    const ds = new import_nedb3.default({ filename: collectionPath, ...this._options });
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
      (docs) => docs.length === 1 ? deepCopy(docs[0]) : null,
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
      (docs) => docs.map((doc) => deepCopy(doc)),
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
