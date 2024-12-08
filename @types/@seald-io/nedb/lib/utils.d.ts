export type IterateeFunction = (arg: any) => any;
/**
 * Utility functions for all environments.
 * This replaces the underscore dependency.
 *
 * @module utils
 * @private
 */
/**
 * @callback IterateeFunction
 * @param {*} arg
 * @return {*}
 */
/**
 * Produces a duplicate-free version of the array, using === to test object equality. In particular only the first
 * occurrence of each value is kept. If you want to compute unique items based on a transformation, pass an iteratee
 * function.
 *
 * Heavily inspired by {@link https://underscorejs.org/#uniq}.
 * @param {Array} array
 * @param {IterateeFunction} [iteratee] transformation applied to every element before checking for duplicates. This will not
 * transform the items in the result.
 * @return {Array}
 * @alias module:utils.uniq
 */
export function uniq(array: any[], iteratee?: IterateeFunction): any[];
/**
 * Returns true if d is a Date.
 *
 * Heavily inspired by {@link https://underscorejs.org/#isDate}.
 * @param {*} d
 * @return {boolean}
 * @alias module:utils.isDate
 */
export function isDate(d: any): boolean;
/**
 * Returns true if re is a RegExp.
 *
 * Heavily inspired by {@link https://underscorejs.org/#isRegExp}.
 * @param {*} re
 * @return {boolean}
 * @alias module:utils.isRegExp
 */
export function isRegExp(re: any): boolean;
/**
 * Return a copy of the object filtered using the given keys.
 *
 * @param {object} object
 * @param {string[]} keys
 * @return {object}
 */
export function pick(object: object, keys: string[]): object;
export function filterIndexNames(indexNames: any): ([k, v]: [any, any]) => any;
