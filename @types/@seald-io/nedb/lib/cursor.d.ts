export = Cursor;
/**
 * Has a callback
 * @callback Cursor~mapFn
 * @param {document[]} res
 * @return {*|Promise<*>}
 */
/**
 * Manage access to data, be it to find, update or remove it.
 *
 * It extends `Promise` so that its methods (which return `this`) are chainable & awaitable.
 * @extends Promise
 */
declare class Cursor {
  /**
   * Create a new cursor for this collection.
   * @param {Datastore} db - The datastore this cursor is bound to
   * @param {query} query - The query this cursor will operate on
   * @param {Cursor~mapFn} [mapFn] - Handler to be executed after cursor has found the results and before the callback passed to find/findOne/update/remove
   */
  constructor(db: Datastore, query: query, mapFn: any);
  /**
   * @protected
   * @type {Datastore}
   */
  protected db: Datastore;
  /**
   * @protected
   * @type {query}
   */
  protected query: query;
  mapFn: any;
  /**
   * @see Cursor#limit
   * @type {undefined|number}
   * @private
   */
  protected _limit;
  /**
   * @see Cursor#skip
   * @type {undefined|number}
   * @private
   */
  protected _skip;
  /**
   * @see Cursor#sort
   * @type {undefined|Object.<string, number>}
   * @private
   */
  protected _sort;
  /**
   * @see Cursor#projection
   * @type {undefined|Object.<string, number>}
   * @private
   */
  protected _projection;
  /**
   * Set a limit to the number of results for the given Cursor.
   * @param {Number} limit
   * @return {Cursor} the same instance of Cursor, (useful for chaining).
   */
  limit(limit: number): Cursor;
  /**
   * Skip a number of results for the given Cursor.
   * @param {Number} skip
   * @return {Cursor} the same instance of Cursor, (useful for chaining).
   */
  skip(skip: number): Cursor;
  /**
   * Sort results of the query for the given Cursor.
   * @param {Object.<string, number>} sortQuery - sortQuery is { field: order }, field can use the dot-notation, order is 1 for ascending and -1 for descending
   * @return {Cursor} the same instance of Cursor, (useful for chaining).
   */
  sort(sortQuery: { [x: string]: number }): Cursor;
  /**
   * Add the use of a projection to the given Cursor.
   * @param {Object.<string, number>} projection - MongoDB-style projection. {} means take all fields. Then it's { key1: 1, key2: 1 } to take only key1 and key2
   * { key1: 0, key2: 0 } to omit only key1 and key2. Except _id, you can't mix takes and omits.
   * @return {Cursor} the same instance of Cursor, (useful for chaining).
   */
  projection(projection: { [x: string]: number }): Cursor;
  /**
   * Apply the projection.
   *
   * This is an internal function. You should use {@link Cursor#execAsync} or {@link Cursor#exec}.
   * @param {document[]} candidates
   * @return {document[]}
   * @private
   */
  private _project;
  /**
   * Get all matching elements
   * Will return pointers to matched elements (shallow copies), returning full copies is the role of find or findOne
   * This is an internal function, use execAsync which uses the executor
   * @return {document[]|Promise<*>}
   * @private
   */
  private _execAsync;
  /**
   * @callback Cursor~execCallback
   * @param {Error} err
   * @param {document[]|*} res If a mapFn was given to the Cursor, then the type of this parameter is the one returned by the mapFn.
   */
  /**
   * Callback version of {@link Cursor#exec}.
   * @param {Cursor~execCallback} _callback
   * @see Cursor#execAsync
   */
  exec(_callback: any): void;
  /**
   * Get all matching elements.
   * Will return pointers to matched elements (shallow copies), returning full copies is the role of {@link Datastore#findAsync} or {@link Datastore#findOneAsync}.
   * @return {Promise<document[]|*>}
   * @async
   */
  execAsync(): Promise<Document[] | any>;
  then(onFulfilled: any, onRejected: any): Promise<any>;
  catch(onRejected: any): Promise<any>;
  finally(onFinally: any): Promise<any>;
}
declare namespace Cursor {
  export { Cursor };
}
/**
 * ~mapFn
 */
type Cursor = (res: Document[]) => any | Promise<any>;
