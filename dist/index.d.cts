import * as Datastore from '@seald-io/nedb';
import Datastore__default from '@seald-io/nedb';
import * as yup from 'yup';
import { ObjectSchema } from 'yup';

declare abstract class DatabaseClient {
    _url: string;
    constructor(url: any);
    abstract save(collection: string, values: any, id: string): void;
    abstract delete(collection: string, id: string): void;
    abstract deleteOne(collection: any, query: any): void;
    abstract deleteMany(collection: any, query: any): void;
    abstract findOne(collection: any, query: any): void;
    abstract findOneAndUpdate(collection: any, query: any, values: any, options: any): void;
    abstract findOneAndDelete(collection: any, query: any, options: any): void;
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

type DBFields = {
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

type NeDbClientOptions = Omit<Datastore__default.DataStoreOptions, "filename" | "inMemoryOnly">;
declare class NeDbClient extends DatabaseClient {
    _path: string;
    _collections: {
        [key: string]: Datastore__default<any>;
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
        findOne(query: object): Promise<Datastore.Document<T>>;
        deleteOne(query: object): Promise<number>;
        deleteMany(query: object): Promise<number>;
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
    findOne<T>(collection: string, query: object): Promise<Datastore.Document<T>>;
    /**
     * Find one document and update it
     *
     * @param {String} collection Collection's name
     * @param {Object} query Query
     * @param {Object} values
     * @param {Object} options
     * @returns {Promise}
     */
    findOneAndUpdate(collection: any, query: any, values: any, options: any): void;
    /**
     * Find one document and delete it
     *
     * @param {String} collection Collection's name
     * @param {Object} query Query
     * @param {Object} options
     * @returns {Promise}
     */
    findOneAndDelete(collection: any, query: any, options: any): Promise<unknown>;
    /**
     * Find documents
     *
     * @param {String} collection Collection's name
     * @param {Object} query Query
     * @param {Object} options
     * @returns {Promise}
     */
    find(collection: any, query: any, options: any): Promise<unknown>;
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

export { connect, getClient };
