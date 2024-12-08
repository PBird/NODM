/**
 * The signature of modifier functions is as follows
 * Their structure is always the same: recursively follow the dot notation while creating
 * the nested documents if needed, then apply the "last step modifier"
 */
export type modifierFunction = (obj: any, field: string, value: Document) => any;
/**
 * Arithmetic and comparison operators
 */
export type comparisonOperator = (a: any, b: any) => boolean;
/**
 * Serialize an object to be persisted to a one-line string
 * For serialization/deserialization, we use the native JSON parser and not eval or Function
 * That gives us less freedom but data entered in the database may come from users
 * so eval and the like are not safe
 * Accepted primitive types: Number, String, Boolean, Date, null
 * Accepted secondary types: Objects, Arrays
 * @param {document} obj
 * @return {string}
 * @alias module:model.serialize
 */
export function serialize(obj: Document): string;
/**
 * From a one-line representation of an object generate by the serialize function
 * Return the object itself
 * @param {string} rawData
 * @return {document}
 * @alias module:model.deserialize
 */
export function deserialize(rawData: string): Document;
/**
 * Deep copy a DB object
 * The optional strictKeys flag (defaulting to false) indicates whether to copy everything or only fields
 * where the keys are valid, i.e. don't begin with $ and don't contain a .
 * @param {?document} obj
 * @param {boolean} [strictKeys=false]
 * @return {?document}
 * @alias module:modelel:(.*)
 */
export function deepCopy(obj: Document | null, strictKeys?: boolean): Document | null;
/**
 * Check a DB object and throw an error if it's not valid
 * Works by applying the above checkKey function to all fields recursively
 * @param {document|document[]} obj
 * @alias module:model.checkObject
 */
export function checkObject(obj: Document | Document[]): void;
/**
 * Tells if an object is a primitive type or a "real" object
 * Arrays are considered primitive
 * @param {*} obj
 * @return {boolean}
 * @alias module:modelel:(.*)
 */
export function isPrimitiveType(obj: any): boolean;
/**
 * Modify a DB object according to an update query
 * @param {document} obj
 * @param {query} updateQuery
 * @return {document}
 * @alias module:model.modify
 */
export function modify(obj: Document, updateQuery: query): Document;
/**
 * Get a value from object with dot notation
 * @param {object} obj
 * @param {string} field
 * @return {*}
 * @alias module:model.getDotValue
 */
export function getDotValue(obj: object, field: string): any;
/**
 * Get dot values for either a bunch of fields or just one.
 */
export function getDotValues(obj: any, fields: any): any;
/**
 * Tell if a given document matches a query
 * @param {document} obj Document to check
 * @param {query} query
 * @return {boolean}
 * @alias module:model.match
 */
export function match(obj: Document, query: any): boolean;
/**
 * Check whether 'things' are equal
 * Things are defined as any native types (string, number, boolean, null, date) and objects
 * In the case of object, we check deep equality
 * Returns true if they are, false otherwise
 * @param {*} a
 * @param {*} a
 * @return {boolean}
 * @alias module:model.areThingsEqual
 */
export function areThingsEqual(a: any, b: any): boolean;
/**
 * Compare { things U undefined }
 * Things are defined as any native types (string, number, boolean, null, date) and objects
 * We need to compare with undefined as it will be used in indexes
 * In the case of objects and arrays, we deep-compare
 * If two objects dont have the same type, the (arbitrary) type hierarchy is: undefined, null, number, strings, boolean, dates, arrays, objects
 * Return -1 if a < b, 1 if a > b and 0 if a = b (note that equality here is NOT the same as defined in areThingsEqual!)
 * @param {*} a
 * @param {*} b
 * @param {compareStrings} [_compareStrings] String comparing function, returning -1, 0 or 1, overriding default string comparison (useful for languages with accented letters)
 * @return {number}
 * @alias module:model.compareThings
 */
export function compareThings(a: any, b: any, _compareStrings?: any): number;
