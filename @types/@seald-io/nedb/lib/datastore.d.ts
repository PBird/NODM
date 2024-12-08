export = Datastore;
/**
 * Callback with no parameter
 * @callback NoParamCallback
 * @param {?Error} err
 */
/**
 * String comparison function.
 * ```
 *   if (a < b) return -1
 *   if (a > b) return 1
 *   return 0
 * ```
 * @callback compareStrings
 * @param {string} a
 * @param {string} b
 * @return {number}
 */
/**
 * Callback that returns an Array of documents.
 * @callback MultipleDocumentsCallback
 * @param {?Error} err
 * @param {?document[]} docs
 */
/**
 * Callback that returns a single document.
 * @callback SingleDocumentCallback
 * @param {?Error} err
 * @param {?document} docs
 */
/**
 * Generic async function.
 * @callback AsyncFunction
 * @param {...*} args
 * @return {Promise<*>}
 */
/**
 * Callback with generic parameters.
 * @callback GenericCallback
 * @param {?Error} err
 * @param {...*} args
 */
/**
 * Compaction event. Happens when the Datastore's Persistence has been compacted.
 * It happens when calling {@link Datastore#compactDatafileAsync}, which is called periodically if you have called
 * {@link Datastore#setAutocompactionInterval}.
 *
 * @event Datastore#event:"compaction.done"
 * @type {undefined}
 */
/**
 * Generic document in NeDB.
 * It consists of an Object with anything you want inside.
 * @typedef document
 * @property {?string} [_id] Internal `_id` of the document, which can be `null` or undefined at some points (when not
 * inserted yet for example).
 * @type {object}
 */
/**
 * Nedb query.
 *
 * Each key of a query references a field name, which can use the dot-notation to reference subfields inside nested
 * documents, arrays, arrays of subdocuments and to match a specific element of an array.
 *
 * Each value of a query can be one of the following:
 * - `string`: matches all documents which have this string as value for the referenced field name
 * - `number`: matches all documents which have this number as value for the referenced field name
 * - `Regexp`: matches all documents which have a value that matches the given `Regexp` for the referenced field name
 * - `object`: matches all documents which have this object as deep-value for the referenced field name
 * - Comparison operators: the syntax is `{ field: { $op: value } }` where `$op` is any comparison operator:
 *   - `$lt`, `$lte`: less than, less than or equal
 *   - `$gt`, `$gte`: greater than, greater than or equal
 *   - `$in`: member of. `value` must be an array of values
 *   - `$ne`, `$nin`: not equal, not a member of
 *   - `$exists`: checks whether the document posses the property `field`. `value` should be true or false
 *   - `$regex`: checks whether a string is matched by the regular expression. Contrary to MongoDB, the use of
 *   `$options` with `$regex` is not supported, because it doesn't give you more power than regex flags. Basic
 *   queries are more readable so only use the `$regex` operator when you need to use another operator with it
 *   - `$size`: if the referenced filed is an Array, matches on the size of the array
 *   - `$elemMatch`: matches if at least one array element matches the sub-query entirely
 * - Logical operators: You can combine queries using logical operators:
 *   - For `$or` and `$and`, the syntax is `{ $op: [query1, query2, ...] }`.
 *   - For `$not`, the syntax is `{ $not: query }`
 *   - For `$where`, the syntax is:
 *   ```
 *   { $where: function () {
 *     // object is 'this'
 *     // return a boolean
 *   } }
 *   ```
 * @typedef query
 * @type {Object.<string, *>}
 */
/**
 * Nedb projection.
 *
 * You can give `find` and `findOne` an optional second argument, `projections`.
 * The syntax is the same as MongoDB: `{ a: 1, b: 1 }` to return only the `a`
 * and `b` fields, `{ a: 0, b: 0 }` to omit these two fields. You cannot use both
 * modes at the time, except for `_id` which is by default always returned and
 * which you can choose to omit. You can project on nested documents.
 *
 * To reference subfields, you can use the dot-notation.
 *
 * @typedef projection
 * @type {Object.<string, 0|1>}
 */
/**
 * The `beforeDeserialization` and `afterDeserialization` callbacks are hooks which are executed respectively before
 * parsing each document and after stringifying them. They can be used for example to encrypt the Datastore.
 * The `beforeDeserialization` should revert what `afterDeserialization` has done.
 * @callback serializationHook
 * @param {string} x
 * @return {string}
 */
/**
 * @external EventEmitter
 * @see http://nodejs.org/api/events.html
 */
/**
 * @class
 * @classdesc The `Datastore` class is the main class of NeDB.
 * @extends external:EventEmitter
 * @emits Datastore#event:"compaction.done"
 * @typicalname NeDB
 */
declare class Datastore {
    /**
     * Create a new collection, either persistent or in-memory.
     *
     * If you use a persistent datastore without the `autoload` option, you need to call {@link Datastore#loadDatabase} or
     * {@link Datastore#loadDatabaseAsync} manually. This function fetches the data from datafile and prepares the database.
     * **Don't forget it!** If you use a persistent datastore, no command (insert, find, update, remove) will be executed
     * before it is called, so make sure to call it yourself or use the `autoload` option.
     *
     * Also, if loading fails, all commands registered to the {@link Datastore#executor} afterwards will not be executed.
     * They will be registered and executed, in sequence, only after a successful loading.
     *
     * @param {object|string} options Can be an object or a string. If options is a string, the behavior is the same as in
     * v0.6: it will be interpreted as `options.filename`. **Giving a string is deprecated, and will be removed in the
     * next major version.**
     * @param {string} [options.filename = null] Path to the file where the data is persisted. If left blank, the datastore is
     * automatically considered in-memory only. It cannot end with a `~` which is used in the temporary files NeDB uses to
     * perform crash-safe writes. Not used if `options.inMemoryOnly` is `true`.
     * @param {boolean} [options.inMemoryOnly = false] If set to true, no data will be written in storage. This option has
     * priority over `options.filename`.
     * @param {object} [options.modes] Permissions to use for FS. Only used for Node.js storage module. Will not work on Windows.
     * @param {number} [options.modes.fileMode = 0o644] Permissions to use for database files
     * @param {number} [options.modes.dirMode = 0o755] Permissions to use for database directories
     * @param {boolean} [options.timestampData = false] If set to true, createdAt and updatedAt will be created and
     * populated automatically (if not specified by user)
     * @param {boolean} [options.autoload = false] If used, the database will automatically be loaded from the datafile
     * upon creation (you don't need to call `loadDatabase`). Any command issued before load is finished is buffered and
     * will be executed when load is done. When autoloading is done, you can either use the `onload` callback, or you can
     * use `this.autoloadPromise` which resolves (or rejects) when autloading is done.
     * @param {NoParamCallback} [options.onload] If you use autoloading, this is the handler called after the `loadDatabase`. It
     * takes one `error` argument. If you use autoloading without specifying this handler, and an error happens during
     * load, an error will be thrown.
     * @param {serializationHook} [options.beforeDeserialization] Hook you can use to transform data after it was serialized and
     * before it is written to disk. Can be used for example to encrypt data before writing database to disk. This
     * function takes a string as parameter (one line of an NeDB data file) and outputs the transformed string, **which
     * must absolutely not contain a `\n` character** (or data will be lost).
     * @param {serializationHook} [options.afterSerialization] Inverse of `afterSerialization`. Make sure to include both and not
     * just one, or you risk data loss. For the same reason, make sure both functions are inverses of one another. Some
     * failsafe mechanisms are in place to prevent data loss if you misuse the serialization hooks: NeDB checks that never
     * one is declared without the other, and checks that they are reverse of one another by testing on random strings of
     * various lengths. In addition, if too much data is detected as corrupt, NeDB will refuse to start as it could mean
     * you're not using the deserialization hook corresponding to the serialization hook used before.
     * @param {number} [options.corruptAlertThreshold = 0.1] Between 0 and 1, defaults to 10%. NeDB will refuse to start
     * if more than this percentage of the datafile is corrupt. 0 means you don't tolerate any corruption, 1 means you
     * don't care.
     * @param {compareStrings} [options.compareStrings] If specified, it overrides default string comparison which is not
     * well adapted to non-US characters in particular accented letters. Native `localCompare` will most of the time be
     * the right choice.
     * @param {boolean} [options.testSerializationHooks=true] Whether to test the serialization hooks or not,
     * might be CPU-intensive
     */
    constructor(options: object | string);
    inMemoryOnly: boolean;
    /**
     * Determines if the `Datastore` should autoload the database upon instantiation. Is not read after instanciation.
     * @type {boolean}
     * @protected
     */
    protected autoload: boolean;
    /**
     * Determines if the `Datastore` should add `createdAt` and `updatedAt` fields automatically if not set by the user.
     * @type {boolean}
     * @protected
     */
    protected timestampData: boolean;
    /**
     * If null, it means `inMemoryOnly` is `true`. The `filename` is the name given to the storage module. Is not read
     * after instanciation.
     * @type {?string}
     * @protected
     */
    protected filename: string | null;
    /**
     * Overrides default string comparison which is not well adapted to non-US characters in particular accented
     * letters. Native `localCompare` will most of the time be the right choice
     * @type {compareStrings}
     * @function
     * @protected
     */
    protected compareStrings: compareStrings;
    /**
     * The `Persistence` instance for this `Datastore`.
     * @type {Persistence}
     */
    persistence: Persistence;
    /**
     * The `Executor` instance for this `Datastore`. It is used in all methods exposed by the {@link Datastore},
     * any {@link Cursor} produced by the `Datastore` and by {@link Datastore#compactDatafileAsync} to ensure operations
     * are performed sequentially in the database.
     * @type {Executor}
     * @protected
     */
    protected executor: Executor;
    /**
     * Indexed by field name, dot notation can be used.
     * _id is always indexed and since _ids are generated randomly the underlying binary search tree is always well-balanced
     * @type {Object.<string, Index>}
     * @protected
     */
    protected indexes: {
        [x: string]: Index;
    };
    /**
     * Stores the time to live (TTL) of the indexes created. The key represents the field name, the value the number of
     * seconds after which data with this index field should be removed.
     * @type {Object.<string, number>}
     * @protected
     */
    protected ttlIndexes: {
        [x: string]: number;
    };
    /**
     * A Promise that resolves when the autoload has finished.
     *
     * The onload callback is not awaited by this Promise, it is started immediately after that.
     * @type {?Promise}
     */
    autoloadPromise: Promise<any> | null;
    /**
     * Interval if {@link Datastore#setAutocompactionInterval} was called.
     * @private
     * @type {null|number}
     */
    private _autocompactionIntervalId;
    /**
     * Queue a compaction/rewrite of the datafile.
     * It works by rewriting the database file, and compacts it since the cache always contains only the number of
     * documents in the collection while the data file is append-only so it may grow larger.
     *
     * @async
     */
    compactDatafileAsync(): any;
    /**
     * Callback version of {@link Datastore#compactDatafileAsync}.
     * @param {NoParamCallback} [callback = () => {}]
     * @see Datastore#compactDatafileAsync
     */
    compactDatafile(callback?: NoParamCallback): void;
    /**
     * Set automatic compaction every `interval` ms
     * @param {Number} interval in milliseconds, with an enforced minimum of 5000 milliseconds
     */
    setAutocompactionInterval(interval: number): void;
    /**
     * Stop autocompaction (do nothing if automatic compaction was not running)
     */
    stopAutocompaction(): void;
    /**
     * Callback version of {@link Datastore#loadDatabaseAsync}.
     * @param {NoParamCallback} [callback]
     * @see Datastore#loadDatabaseAsync
     */
    loadDatabase(callback?: NoParamCallback): void;
    /**
     * Stops auto-compaction, finishes all queued operations, drops the database both in memory and in storage.
     * **WARNING**: it is not recommended re-using an instance of NeDB if its database has been dropped, it is
     * preferable to instantiate a new one.
     * @async
     * @return {Promise}
     */
    dropDatabaseAsync(): Promise<any>;
    /**
     * Callback version of {@link Datastore#dropDatabaseAsync}.
     * @param {NoParamCallback} [callback]
     * @see Datastore#dropDatabaseAsync
     */
    dropDatabase(callback?: NoParamCallback): void;
    /**
     * Load the database from the datafile, and trigger the execution of buffered commands if any.
     * @async
     * @return {Promise}
     */
    loadDatabaseAsync(): Promise<any>;
    /**
     * Get an array of all the data in the database.
     * @return {document[]}
     */
    getAllData(): document[];
    /**
     * Reset all currently defined indexes.
     * @param {?document|?document[]} [newData]
     * @private
     */
    private _resetIndexes;
    /**
     * Callback version of {@link Datastore#ensureIndex}.
     * @param {object} options
     * @param {string|string[]} options.fieldName
     * @param {boolean} [options.unique = false]
     * @param {boolean} [options.sparse = false]
     * @param {number} [options.expireAfterSeconds]
     * @param {NoParamCallback} [callback]
     * @see Datastore#ensureIndex
     */
    ensureIndex(options?: {
        fieldName: string | string[];
        unique?: boolean;
        sparse?: boolean;
        expireAfterSeconds?: number;
    }, callback?: NoParamCallback): void;
    /**
     * Ensure an index is kept for this field. Same parameters as lib/indexes
     * This function acts synchronously on the indexes, however the persistence of the indexes is deferred with the
     * executor.
     * @param {object} options
     * @param {string|string[]} options.fieldName Name of the field to index. Use the dot notation to index a field in a nested
     * document. For a compound index, use an array of field names. Using a comma in a field name is not permitted.
     * @param {boolean} [options.unique = false] Enforce field uniqueness. Note that a unique index will raise an error
     * if you try to index two documents for which the field is not defined.
     * @param {boolean} [options.sparse = false] Don't index documents for which the field is not defined. Use this option
     * along with "unique" if you want to accept multiple documents for which it is not defined.
     * @param {number} [options.expireAfterSeconds] - If set, the created index is a TTL (time to live) index, that will
     * automatically remove documents when the system date becomes larger than the date on the indexed field plus
     * `expireAfterSeconds`. Documents where the indexed field is not specified or not a `Date` object are ignored.
     * @return {Promise<void>}
     */
    ensureIndexAsync(options?: {
        fieldName: string | string[];
        unique?: boolean;
        sparse?: boolean;
        expireAfterSeconds?: number;
    }): Promise<void>;
    /**
     * Callback version of {@link Datastore#removeIndexAsync}.
     * @param {string} fieldName
     * @param {NoParamCallback} [callback]
     * @see Datastore#removeIndexAsync
     */
    removeIndex(fieldName: string, callback?: NoParamCallback): void;
    /**
     * Remove an index.
     * @param {string} fieldName Field name of the index to remove. Use the dot notation to remove an index referring to a
     * field in a nested document.
     * @return {Promise<void>}
     * @see Datastore#removeIndex
     */
    removeIndexAsync(fieldName: string): Promise<void>;
    /**
     * Add one or several document(s) to all indexes.
     *
     * This is an internal function.
     * @param {document} doc
     * @private
     */
    private _addToIndexes;
    /**
     * Remove one or several document(s) from all indexes.
     *
     * This is an internal function.
     * @param {document} doc
     * @private
     */
    private _removeFromIndexes;
    /**
     * Update one or several documents in all indexes.
     *
     * To update multiple documents, oldDoc must be an array of { oldDoc, newDoc } pairs.
     *
     * If one update violates a constraint, all changes are rolled back.
     *
     * This is an internal function.
     * @param {document|Array.<{oldDoc: document, newDoc: document}>} oldDoc Document to update, or an `Array` of
     * `{oldDoc, newDoc}` pairs.
     * @param {document} [newDoc] Document to replace the oldDoc with. If the first argument is an `Array` of
     * `{oldDoc, newDoc}` pairs, this second argument is ignored.
     * @private
     */
    private _updateIndexes;
    /**
     * Get all candidate documents matching the query, regardless of their expiry status.
     * @param {query} query
     * @return {document[]}
     *
     * @private
     */
    private _getRawCandidates;
    /**
     * Return the list of candidates for a given query
     * Crude implementation for now, we return the candidates given by the first usable index if any
     * We try the following query types, in this order: basic match, $in match, comparison match
     * One way to make it better would be to enable the use of multiple indexes if the first usable index
     * returns too much data. I may do it in the future.
     *
     * Returned candidates will be scanned to find and remove all expired documents
     *
     * This is an internal function.
     * @param {query} query
     * @param {boolean} [dontExpireStaleDocs = false] If true don't remove stale docs. Useful for the remove function
     * which shouldn't be impacted by expirations.
     * @return {Promise<document[]>} candidates
     * @private
     */
    private _getCandidatesAsync;
    /**
     * Insert a new document
     * This is an internal function, use {@link Datastore#insertAsync} which has the same signature.
     * @param {document|document[]} newDoc
     * @return {Promise<document|document[]>}
     * @private
     */
    private _insertAsync;
    /**
     * Create a new _id that's not already in use
     * @return {string} id
     * @private
     */
    private _createNewId;
    /**
     * Prepare a document (or array of documents) to be inserted in a database
     * Meaning adds _id and timestamps if necessary on a copy of newDoc to avoid any side effect on user input
     * @param {document|document[]} newDoc document, or Array of documents, to prepare
     * @return {document|document[]} prepared document, or Array of prepared documents
     * @private
     */
    private _prepareDocumentForInsertion;
    /**
     * If newDoc is an array of documents, this will insert all documents in the cache
     * @param {document|document[]} preparedDoc
     * @private
     */
    private _insertInCache;
    /**
     * If one insertion fails (e.g. because of a unique constraint), roll back all previous
     * inserts and throws the error
     * @param {document[]} preparedDocs
     * @private
     */
    private _insertMultipleDocsInCache;
    /**
     * Callback version of {@link Datastore#insertAsync}.
     * @param {document|document[]} newDoc
     * @param {SingleDocumentCallback|MultipleDocumentsCallback} [callback]
     * @see Datastore#insertAsync
     */
    insert(newDoc: document | document[], callback?: SingleDocumentCallback | MultipleDocumentsCallback): void;
    /**
     * Insert a new document, or new documents.
     * @param {document|document[]} newDoc Document or array of documents to insert.
     * @return {Promise<document|document[]>} The document(s) inserted.
     * @async
     */
    insertAsync(newDoc: document | document[]): Promise<document | document[]>;
    /**
     * Callback for {@link Datastore#countCallback}.
     * @callback Datastore~countCallback
     * @param {?Error} err
     * @param {?number} count
     */
    /**
     * Callback-version of {@link Datastore#countAsync}.
     * @param {query} query
     * @param {Datastore~countCallback} [callback]
     * @return {Cursor<number>|undefined}
     * @see Datastore#countAsync
     */
    count(query: query, callback: any): Cursor<number> | undefined;
    /**
     * Count all documents matching the query.
     * @param {query} query MongoDB-style query
     * @return {Cursor<number>} count
     * @async
     */
    countAsync(query: query): Cursor<number>;
    /**
     * Callback version of {@link Datastore#findAsync}.
     * @param {query} query
     * @param {projection|MultipleDocumentsCallback} [projection = {}]
     * @param {MultipleDocumentsCallback} [callback]
     * @return {Cursor<document[]>|undefined}
     * @see Datastore#findAsync
     */
    find(query: query, projection?: projection | MultipleDocumentsCallback, callback?: MultipleDocumentsCallback, ...args: any[]): Cursor<document[]> | undefined;
    /**
     * Find all documents matching the query.
     * We return the {@link Cursor} that the user can either `await` directly or use to can {@link Cursor#limit} or
     * {@link Cursor#skip} before.
     * @param {query} query MongoDB-style query
     * @param {projection} [projection = {}] MongoDB-style projection
     * @return {Cursor<document[]>}
     * @async
     */
    findAsync(query: query, projection?: projection): Cursor<document[]>;
    /**
     * @callback Datastore~findOneCallback
     * @param {?Error} err
     * @param {document} doc
     */
    /**
     * Callback version of {@link Datastore#findOneAsync}.
     * @param {query} query
     * @param {projection|SingleDocumentCallback} [projection = {}]
     * @param {SingleDocumentCallback} [callback]
     * @return {Cursor<document>|undefined}
     * @see Datastore#findOneAsync
     */
    findOne(query: query, projection?: projection | SingleDocumentCallback, callback?: SingleDocumentCallback, ...args: any[]): Cursor<document> | undefined;
    /**
     * Find one document matching the query.
     * We return the {@link Cursor} that the user can either `await` directly or use to can {@link Cursor#skip} before.
     * @param {query} query MongoDB-style query
     * @param {projection} projection MongoDB-style projection
     * @return {Cursor<document>}
     */
    findOneAsync(query: query, projection?: projection): Cursor<document>;
    /**
     * See {@link Datastore#updateAsync} return type for the definition of the callback parameters.
     *
     * **WARNING:** Prior to 3.0.0, `upsert` was either `true` of falsy (but not `false`), it is now always a boolean.
     * `affectedDocuments` could be `undefined` when `returnUpdatedDocs` was `false`, it is now `null` in these cases.
     *
     * **WARNING:** Prior to 1.8.0, the `upsert` argument was not given, it was impossible for the developer to determine
     * during a `{ multi: false, returnUpdatedDocs: true, upsert: true }` update if it inserted a document or just updated
     * it.
     *
     * @callback Datastore~updateCallback
     * @param {?Error} err
     * @param {number} numAffected
     * @param {?document[]|?document} affectedDocuments
     * @param {boolean} upsert
     * @see {Datastore#updateAsync}
     */
    /**
     * Version without the using {@link Datastore~executor} of {@link Datastore#updateAsync}, use it instead.
     *
     * @param {query} query
     * @param {document|update} update
     * @param {Object} options
     * @param {boolean} [options.multi = false]
     * @param {boolean} [options.upsert = false]
     * @param {boolean} [options.returnUpdatedDocs = false]
     * @return {Promise<{numAffected: number, affectedDocuments: document[]|document|null, upsert: boolean}>}
     * @private
     * @see Datastore#updateAsync
     */
    private _updateAsync;
    /**
     * Callback version of {@link Datastore#updateAsync}.
     * @param {query} query
     * @param {document|*} update
     * @param {Object|Datastore~updateCallback} [options|]
     * @param {boolean} [options.multi = false]
     * @param {boolean} [options.upsert = false]
     * @param {boolean} [options.returnUpdatedDocs = false]
     * @param {Datastore~updateCallback} [callback]
     * @see Datastore#updateAsync
     *
     */
    update(query: query, update: document | any, options: any, callback: any): void;
    /**
     * Update all docs matching query.
     * @param {query} query is the same kind of finding query you use with `find` and `findOne`.
     * @param {document|*} update specifies how the documents should be modified. It is either a new document or a
     * set of modifiers (you cannot use both together, it doesn't make sense!). Using a new document will replace the
     * matched docs. Using a set of modifiers will create the fields they need to modify if they don't exist, and you can
     * apply them to subdocs. Available field modifiers are `$set` to change a field's value, `$unset` to delete a field,
     * `$inc` to increment a field's value and `$min`/`$max` to change field's value, only if provided value is
     * less/greater than current value. To work on arrays, you have `$push`, `$pop`, `$addToSet`, `$pull`, and the special
     * `$each` and `$slice`.
     * @param {Object} [options = {}] Optional options
     * @param {boolean} [options.multi = false] If true, can update multiple documents
     * @param {boolean} [options.upsert = false] If true, can insert a new document corresponding to the `update` rules if
     * your `query` doesn't match anything. If your `update` is a simple object with no modifiers, it is the inserted
     * document. In the other case, the `query` is stripped from all operator recursively, and the `update` is applied to
     * it.
     * @param {boolean} [options.returnUpdatedDocs = false] (not Mongo-DB compatible) If true and update is not an upsert,
     * will return the array of documents matched by the find query and updated. Updated documents will be returned even
     * if the update did not actually modify them.
     * @return {Promise<{numAffected: number, affectedDocuments: document[]|document|null, upsert: boolean}>}
     * - `upsert` is `true` if and only if the update did insert a document, **cannot be true if `options.upsert !== true`**.
     * - `numAffected` is the number of documents affected by the update or insertion (if `options.multi` is `false` or `options.upsert` is `true`, cannot exceed `1`);
     * - `affectedDocuments` can be one of the following:
     *    - If `upsert` is `true`, the inserted document;
     *    - If `options.returnUpdatedDocs` is `false`, `null`;
     *    - If `options.returnUpdatedDocs` is `true`:
     *      - If `options.multi` is `false`, the updated document;
     *      - If `options.multi` is `true`, the array of updated documents.
     * @async
     */
    updateAsync(query: query, update: document | any, options?: {
        multi?: boolean;
        upsert?: boolean;
        returnUpdatedDocs?: boolean;
    }): Promise<{
        numAffected: number;
        affectedDocuments: document[] | document | null;
        upsert: boolean;
    }>;
    /**
     * @callback Datastore~removeCallback
     * @param {?Error} err
     * @param {?number} numRemoved
     */
    /**
     * Internal version without using the {@link Datastore#executor} of {@link Datastore#removeAsync}, use it instead.
     *
     * @param {query} query
     * @param {object} [options]
     * @param {boolean} [options.multi = false]
     * @return {Promise<number>}
     * @private
     * @see Datastore#removeAsync
     */
    private _removeAsync;
    /**
     * Callback version of {@link Datastore#removeAsync}.
     * @param {query} query
     * @param {object|Datastore~removeCallback} [options={}]
     * @param {boolean} [options.multi = false]
     * @param {Datastore~removeCallback} [cb = () => {}]
     * @see Datastore#removeAsync
     */
    remove(query: query, options: any, cb: any): void;
    /**
     * Remove all docs matching the query.
     * @param {query} query MongoDB-style query
     * @param {object} [options={}] Optional options
     * @param {boolean} [options.multi = false] If true, can update multiple documents
     * @return {Promise<number>} How many documents were removed
     * @async
     */
    removeAsync(query: query, options?: {
        multi?: boolean;
    }): Promise<number>;
}
declare namespace Datastore {
    export { NoParamCallback, compareStrings, MultipleDocumentsCallback, SingleDocumentCallback, AsyncFunction, GenericCallback, document, query, projection, serializationHook };
}
import Cursor = require("@seald-io/nedb/lib/cursor.js");
/**
 * Callback with no parameter
 */
type NoParamCallback = (err: Error | null) => any;
/**
 * String comparison function.
 * ```
 *   if (a < b) return -1
 *   if (a > b) return 1
 *   return 0
 * ```
 */
type compareStrings = (a: string, b: string) => number;
/**
 * Callback that returns an Array of documents.
 */
type MultipleDocumentsCallback = (err: Error | null, docs: document[] | null) => any;
/**
 * Callback that returns a single document.
 */
type SingleDocumentCallback = (err: Error | null, docs: document | null) => any;
/**
 * Generic async function.
 */
type AsyncFunction = (...args: any[]) => Promise<any>;
/**
 * Callback with generic parameters.
 */
type GenericCallback = (err: Error | null, ...args: any[]) => any;
/**
 * Generic document in NeDB.
 * It consists of an Object with anything you want inside.
 */
type document = {
    /**
     * Internal `_id` of the document, which can be `null` or undefined at some points (when not
     * inserted yet for example).
     */
    _id?: string | null;
};
/**
 * Nedb query.
 *
 * Each key of a query references a field name, which can use the dot-notation to reference subfields inside nested
 * documents, arrays, arrays of subdocuments and to match a specific element of an array.
 *
 * Each value of a query can be one of the following:
 * - `string`: matches all documents which have this string as value for the referenced field name
 * - `number`: matches all documents which have this number as value for the referenced field name
 * - `Regexp`: matches all documents which have a value that matches the given `Regexp` for the referenced field name
 * - `object`: matches all documents which have this object as deep-value for the referenced field name
 * - Comparison operators: the syntax is `{ field: { $op: value } }` where `$op` is any comparison operator:
 *   - `$lt`, `$lte`: less than, less than or equal
 *   - `$gt`, `$gte`: greater than, greater than or equal
 *   - `$in`: member of. `value` must be an array of values
 *   - `$ne`, `$nin`: not equal, not a member of
 *   - `$exists`: checks whether the document posses the property `field`. `value` should be true or false
 *   - `$regex`: checks whether a string is matched by the regular expression. Contrary to MongoDB, the use of
 *   `$options` with `$regex` is not supported, because it doesn't give you more power than regex flags. Basic
 *   queries are more readable so only use the `$regex` operator when you need to use another operator with it
 *   - `$size`: if the referenced filed is an Array, matches on the size of the array
 *   - `$elemMatch`: matches if at least one array element matches the sub-query entirely
 * - Logical operators: You can combine queries using logical operators:
 *   - For `$or` and `$and`, the syntax is `{ $op: [query1, query2, ...] }`.
 *   - For `$not`, the syntax is `{ $not: query }`
 *   - For `$where`, the syntax is:
 *   ```
 *   { $where: function () {
 *     // object is 'this'
 *     // return a boolean
 *   } }
 *   ```
 */
type query = {
    [x: string]: any;
};
/**
 * Nedb projection.
 *
 * You can give `find` and `findOne` an optional second argument, `projections`.
 * The syntax is the same as MongoDB: `{ a: 1, b: 1 }` to return only the `a`
 * and `b` fields, `{ a: 0, b: 0 }` to omit these two fields. You cannot use both
 * modes at the time, except for `_id` which is by default always returned and
 * which you can choose to omit. You can project on nested documents.
 *
 * To reference subfields, you can use the dot-notation.
 */
type projection = {
    [x: string]: 0 | 1;
};
/**
 * The `beforeDeserialization` and `afterDeserialization` callbacks are hooks which are executed respectively before
 * parsing each document and after stringifying them. They can be used for example to encrypt the Datastore.
 * The `beforeDeserialization` should revert what `afterDeserialization` has done.
 */
type serializationHook = (x: string) => string;
