import * as Datastore from '@seald-io/nedb';
import Datastore__default from '@seald-io/nedb';
import * as yup from 'yup';
import { AnyObject, ObjectSchema, Maybe } from 'yup';
import NeDbCursor from '@seald-io/nedb/lib/cursor';

declare abstract class DatabaseClient {
    _url: string;
    constructor(url: any);
    abstract delete(collection: string, id: string): void;
    abstract deleteOne(collection: any, query: any): void;
    abstract deleteMany(collection: any, query: any): void;
    abstract findOne(collection: string, query: any, projection: {
        [key: string]: number;
    }): void;
    abstract findOneAndUpdate(collection: any, query: any, values: any, options: any): void;
    abstract findOneAndDelete(collection: any, query: any): void;
    abstract find(collection: any, query: any, options: any): void;
    abstract count(collection: any, query: any): void;
    abstract createIndex(collection: any, field: any, options: any): void;
    static connect(url: any, options: any): void;
    abstract close(): void;
    abstract clearCollection(collection: any): void;
    abstract dropDatabase(): void;
    abstract toCanonicalId(id: any): void;
    abstract isNativeId(value: any): void;
    abstract toNativeId(id: any): void;
    abstract nativeIdType(): void;
    abstract driver(): void;
}

declare function createModel<T extends AnyObject>(collectionName: string, schema: ObjectSchema<T>): {
    new (values: {
        _id?: yup.Maybe<string | undefined>;
        createdAt?: yup.Maybe<Date | undefined>;
        updatedAt?: yup.Maybe<Date | undefined>;
    } & T): {
        values: {
            _id?: yup.Maybe<string | undefined>;
            createdAt?: yup.Maybe<Date | undefined>;
            updatedAt?: yup.Maybe<Date | undefined>;
        } & T;
        get<K extends ("_id" | "createdAt" | "updatedAt") | keyof T>(key: K): ({
            _id?: yup.Maybe<string | undefined>;
            createdAt?: yup.Maybe<Date | undefined>;
            updatedAt?: yup.Maybe<Date | undefined>;
        } & T)[K];
        set<K extends ("_id" | "createdAt" | "updatedAt") | keyof T>(key: K, value: ({
            _id?: yup.Maybe<string | undefined>;
            createdAt?: yup.Maybe<Date | undefined>;
            updatedAt?: yup.Maybe<Date | undefined>;
        } & T)[K]): T[K];
        /**
         * Save (upsert) document
         */
        save(options?: SaveOptions): Promise<void>;
        /**
         * Delete current document
         */
        delete(): Promise<number>;
    };
    collectionName: string;
    schema: ObjectSchema<{
        _id?: yup.Maybe<string | undefined>;
        createdAt?: yup.Maybe<Date | undefined>;
        updatedAt?: yup.Maybe<Date | undefined>;
    } & T, AnyObject, any, "">;
    validate(values: any): Promise<void>;
    findOne(query: object, projection?: {
        [key: string]: number;
    }): Cursor<{
        _id?: yup.Maybe<string | undefined>;
        createdAt?: yup.Maybe<Date | undefined>;
        updatedAt?: yup.Maybe<Date | undefined>;
    } & T>;
    findOneUpdate(query: object, updateQuery: any, options?: FindOneAndUpdateOptions): Promise<Datastore.Document<{
        _id?: yup.Maybe<string | undefined>;
        createdAt?: yup.Maybe<Date | undefined>;
        updatedAt?: yup.Maybe<Date | undefined>;
    } & T> | null>;
    findByIdAndUpdate(id: string, updateQuery: any, options?: FindOneAndUpdateOptions): Promise<Datastore.Document<{
        _id?: yup.Maybe<string | undefined>;
        createdAt?: yup.Maybe<Date | undefined>;
        updatedAt?: yup.Maybe<Date | undefined>;
    } & T> | null>;
    find(query?: {}, options?: FindOptions): Promise<({
        _id?: yup.Maybe<string | undefined>;
        createdAt?: yup.Maybe<Date | undefined>;
        updatedAt?: yup.Maybe<Date | undefined>;
    } & T)[]>;
    findOneAndDelete(query: object): Promise<number>;
    findByIdAndDelete(id: string): Promise<number>;
    updateMany(query: object, values: any, options?: UpdateOptions): Promise<any>;
    deleteOne(query: object): Promise<number>;
    deleteMany(query: object): Promise<number>;
    ensureIndex(options: Datastore.default.EnsureIndexOptions): Promise<void>;
    aggregate(pipeline: any[]): Promise<any[]>;
};

interface SaveOptions {
    validateBeforeSave: boolean;
}
interface CursorOptions {
    limit?: number;
    skip?: number;
    projection?: {
        [key: string]: number;
    };
    sort?: {
        [key: string]: number;
    };
}
interface FindOptions extends CursorOptions {
}
interface UpdateOptions {
    upsert?: boolean;
    overwrite?: boolean;
    validateBeforeSave?: boolean;
}
interface UpdateManyOptions extends UpdateOptions {
}
interface FindOneAndUpdateOptions extends UpdateOptions {
}
type CollectionModel<T extends AnyObject> = ReturnType<typeof createModel<T>>;

declare class Cursor<T> extends NeDbCursor {
    constructor(db: Datastore__default<T>, query: object, mapFn: any, options: CursorOptions);
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T | null) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
}

type NeDbClientOptions = Omit<Datastore__default.DataStoreOptions, "filename" | "inMemoryOnly">;
declare class NeDbClient extends DatabaseClient {
    _path: string;
    _collections: {
        [key: string]: Datastore__default<any>;
    };
    _schemas: {
        [key: string]: ObjectSchema<AnyObject>;
    };
    _options: NeDbClientOptions;
    constructor(url: string, collections: {
        [key: string]: Datastore__default<any>;
    }, schemas: {
        [key: string]: ObjectSchema<AnyObject>;
    }, options: NeDbClientOptions);
    static urlToPath(url: string): string;
    private getCollectionPath;
    model<T extends AnyObject>(name: string, schema: ObjectSchema<T>): {
        new (values: {
            _id?: Maybe<string | undefined>;
            createdAt?: Maybe<Date | undefined>;
            updatedAt?: Maybe<Date | undefined>;
        } & T): {
            values: {
                _id?: Maybe<string | undefined>;
                createdAt?: Maybe<Date | undefined>;
                updatedAt?: Maybe<Date | undefined>;
            } & T;
            get<K extends ("_id" | "createdAt" | "updatedAt") | keyof T>(key: K): ({
                _id?: Maybe<string | undefined>;
                createdAt?: Maybe<Date | undefined>;
                updatedAt?: Maybe<Date | undefined>;
            } & T)[K];
            set<K extends ("_id" | "createdAt" | "updatedAt") | keyof T>(key: K, value: ({
                _id?: Maybe<string | undefined>;
                createdAt?: Maybe<Date | undefined>;
                updatedAt?: Maybe<Date | undefined>;
            } & T)[K]): T[K];
            save(options?: SaveOptions): Promise<void>;
            delete(): Promise<number>;
        };
        collectionName: string;
        schema: ObjectSchema<{
            _id?: Maybe<string | undefined>;
            createdAt?: Maybe<Date | undefined>;
            updatedAt?: Maybe<Date | undefined>;
        } & T, AnyObject, any, "">;
        validate(values: any): Promise<void>;
        findOne(query: object, projection?: {
            [key: string]: number;
        }): Cursor<{
            _id?: Maybe<string | undefined>;
            createdAt?: Maybe<Date | undefined>;
            updatedAt?: Maybe<Date | undefined>;
        } & T>;
        findOneUpdate(query: object, updateQuery: any, options?: FindOneAndUpdateOptions): Promise<Datastore.Document<{
            _id?: Maybe<string | undefined>;
            createdAt?: Maybe<Date | undefined>;
            updatedAt?: Maybe<Date | undefined>;
        } & T> | null>;
        findByIdAndUpdate(id: string, updateQuery: any, options?: FindOneAndUpdateOptions): Promise<Datastore.Document<{
            _id?: Maybe<string | undefined>;
            createdAt?: Maybe<Date | undefined>;
            updatedAt?: Maybe<Date | undefined>;
        } & T> | null>;
        find(query?: {}, options?: FindOptions): Promise<({
            _id?: Maybe<string | undefined>;
            createdAt?: Maybe<Date | undefined>;
            updatedAt?: Maybe<Date | undefined>;
        } & T)[]>;
        findOneAndDelete(query: object): Promise<number>;
        findByIdAndDelete(id: string): Promise<number>;
        updateMany(query: object, values: any, options?: UpdateOptions): Promise<any>;
        deleteOne(query: object): Promise<number>;
        deleteMany(query: object): Promise<number>;
        ensureIndex(options: Datastore__default.EnsureIndexOptions): Promise<void>;
        aggregate(pipeline: any[]): Promise<any[]>;
    };
    /**
     * Save (upsert) document
     *
     */
    save<T>(collection: string, values: any, options: SaveOptions, id?: Maybe<string>): Promise<T | null>;
    /**
     * Delete document
     *
     */
    delete(collection: string, id?: Maybe<string>): Promise<number>;
    /**
     * Delete one document by query
     *
     */
    deleteOne(collection: string, query: object): Promise<number>;
    /**
     * Delete many documents by query
     */
    deleteMany(collection: string, query: object): Promise<number>;
    /**
     * Find one document
     */
    findOne<T>(collection: string, query: object, projection?: {
        [key: string]: number;
    }): Cursor<T>;
    /**
     * update all documents that match query (as opposed to just the first one)
     * regardless of the value of the multi option
     *
     */
    updateMany<T extends object>(collection: string, query: object, updateQuery: T, options?: UpdateManyOptions): Promise<any>;
    /**
     * Find one document and update it
     *
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    findOneAndUpdate<T extends object>(collection: string, query: object, updateQuery: T, options?: FindOneAndUpdateOptions): Promise<Datastore.Document<T> | null>;
    findByIdAndUpdate<T extends object>(collection: string, id: string, updateQuery: T, options?: FindOneAndUpdateOptions): Promise<Datastore.Document<T> | null>;
    /**
     * Find one document and delete it
     *
     */
    findOneAndDelete<T>(collection: string, query: object): Promise<number>;
    /**
     * Find document by id and delete it
     * findOneAndDelete() command by a document's _id field.
     * In other words, findByIdAndDelete(id) is a shorthand for findOneAndDelete({ _id: id })
     */
    findByIdAndDelete<T>(collection: string, id: string): Promise<number>;
    /**
     * Find documents
     *
     */
    find<T>(collection: any, query: object, options: FindOptions): Promise<T[]>;
    /**
     * ensureIndex documents
     *
     */
    ensureIndex<T>(collection: any, options: Datastore__default.EnsureIndexOptions): Promise<void>;
    /**
     * Get count of collection by query
     *
     * @param {String} collection Collection's name
     * @param {Object} query Query
     * @returns {Promise}
     */
    count(collection: any, query: any): Promise<unknown>;
    /**
     * Create index
     *
     * @param {String} collection Collection's name
     * @param {String} field Field name
     * @param {Object} options Options
     * @returns {Promise}
     */
    createIndex(collection: any, field: any, options: any): void;
    /**
     * Connect to database
     *
     * @param {String} url
     * @param {Object} options
     * @returns {Promise}
     */
    static connect(url: any, options: Datastore__default.DataStoreOptions): NeDbClient;
    /**
     * Close current connection
     *
     * @returns {Promise}
     */
    close(): void;
    /**
     * Drop collection
     *
     * @param {String} collection
     * @returns {Promise}
     */
    clearCollection(collection: any): Promise<number>;
    /**
     * Drop current database
     *
     * @returns {Promise}
     */
    dropDatabase(): void;
    toCanonicalId(id: any): any;
    isNativeId(value: any): boolean;
    toNativeId(id: any): void;
    nativeIdType(): StringConstructor;
    driver(): {
        [key: string]: Datastore__default<any>;
    };
}

declare function getClient(): NeDbClient;

declare function connect(url: string, options: NeDbClientOptions): Error | undefined;

export { type CollectionModel, connect, getClient };
