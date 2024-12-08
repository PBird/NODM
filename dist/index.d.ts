import * as _seald_io_nedb from '@seald-io/nedb';
import _seald_io_nedb__default from '@seald-io/nedb';
import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import NeDbCursor from '@seald-io/nedb/lib/cursor';

type DBFields = {
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

declare abstract class DatabaseClient {
    _url: string;
    constructor(url: any);
    abstract save(collection: string, values: any, id: string): void;
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

declare function createDSModel<T extends DBFields>(name: string, schema: ObjectSchema<T>): {
    new (values: T): {
        _name: string;
        values: T & DBFields;
        get<K extends keyof DBFields | keyof T>(key: K): (T & DBFields)[K];
        set<K extends keyof DBFields | keyof T>(key: K, value: (T & DBFields)[K]): T[K];
        save(): Promise<void>;
        delete(): Promise<number>;
    };
    _name: string;
    schema: ObjectSchema<T, yup.AnyObject, any, "">;
    /**
     * Find one document in current collection
     *
     * TODO: Need options to specify whether references should be loaded
     * populate options will add
     *
     */
    findOne(query: object, projection?: {
        [key: string]: number;
    }): Cursor<T>;
    /**
     * Find one document and update it in current collection
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    findOneUpdate(query: object, values: any, options?: FindOneAndUpdateOptions): Promise<_seald_io_nedb.Document<T> | null>;
    findByIdAndUpdate(id: string, values: any, options?: FindOneAndUpdateOptions): Promise<_seald_io_nedb.Document<T> | null>;
    find(query?: {}, options?: FindOptions): Promise<T[]>;
    /**
     *
     * Find one document and delete it in current collection
     */
    findOneAndDelete(query: object): Promise<number>;
    /**
     * Find document by id and delete it
     *
     * findOneAndDelete() command by a document's _id field.
     * In other words, findByIdAndDelete(id) is a shorthand for findOneAndDelete({ _id: id })
     *
     */
    findByIdAndDelete(id: string): Promise<number>;
    /**
     * Delete many documents in current collection
     */
    deleteOne(query: object): Promise<number>;
    /**
     * Delete one document in current collection
     */
    deleteMany(query: object): Promise<number>;
    aggregate(pipeline: any[]): Promise<any[]>;
};

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
interface FindOneAndUpdateOptions {
    upsert?: boolean;
}
type CollectionModel = ReturnType<typeof createDSModel>;

declare class Cursor<T> extends NeDbCursor {
    constructor(db: _seald_io_nedb__default<T>, query: object, mapFn: any, options: CursorOptions);
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T | null) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
}

type NeDbClientOptions = Omit<_seald_io_nedb__default.DataStoreOptions, "filename" | "inMemoryOnly">;
declare class NeDbClient extends DatabaseClient {
    _path: string;
    _collections: {
        [key: string]: _seald_io_nedb__default<any>;
    };
    _options: NeDbClientOptions;
    constructor(url: string, collections: any, options: NeDbClientOptions);
    static urlToPath(url: string): string;
    private getCollectionPath;
    model<T extends Record<string, any>>(name: string, schema: ObjectSchema<T>): {
        new (values: T): {
            _name: string;
            values: T & DBFields;
            get<K extends keyof DBFields | keyof T>(key: K): (T & DBFields)[K];
            set<K extends keyof DBFields | keyof T>(key: K, value: (T & DBFields)[K]): T[K];
            save(): Promise<void>;
            delete(): Promise<number>;
        };
        _name: string;
        schema: ObjectSchema<T, yup.AnyObject, any, "">;
        findOne(query: object, projection?: {
            [key: string]: number;
        }): Cursor<T>;
        findOneUpdate(query: object, values: any, options?: FindOneAndUpdateOptions): Promise<_seald_io_nedb.Document<T> | null>;
        findByIdAndUpdate(id: string, values: any, options?: FindOneAndUpdateOptions): Promise<_seald_io_nedb.Document<T> | null>;
        find(query?: {}, options?: FindOptions): Promise<T[]>;
        findOneAndDelete(query: object): Promise<number>;
        findByIdAndDelete(id: string): Promise<number>;
        deleteOne(query: object): Promise<number>;
        deleteMany(query: object): Promise<number>;
        aggregate(pipeline: any[]): Promise<any[]>;
    };
    /**
     * Save (upsert) document
     *
     */
    save<T>(collection: string, values: any, id?: string): Promise<T | null>;
    /**
     * Delete document
     *
     */
    delete(collection: string, id?: string): Promise<number>;
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
     * Find one document and update it
     *
     * if doc exist it will update and return it
     * if upsert true and doc not exist: return  new doc
     * if upsert false and doc not exist: return null
     *
     */
    findOneAndUpdate<T>(collection: string, query: object, values: T, options: FindOneAndUpdateOptions): Promise<_seald_io_nedb.Document<T> | null>;
    findByIdAndUpdate<T>(collection: string, id: string, values: T, options: FindOneAndUpdateOptions): Promise<_seald_io_nedb.Document<T> | null>;
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
    static connect(url: any, options: _seald_io_nedb__default.DataStoreOptions): NeDbClient;
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
        [key: string]: _seald_io_nedb__default<any>;
    };
}

declare function getClient(): NeDbClient;

declare function connect(url: string, options: NeDbClientOptions): Error | undefined;

export { type CollectionModel, connect, getClient };
