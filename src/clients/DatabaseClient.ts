export default abstract class DatabaseClient {
  _url: string;

  constructor(url) {
    this._url = url;
  }

  abstract save(collection: string, values: any, id: string): void;

  abstract delete(collection: string, id: string): void;

  abstract deleteOne(collection, query): void;

  abstract deleteMany(collection, query): void;

  abstract findOne(collection, query): void;

  abstract findOneAndUpdate(collection, query, values, options): void;

  abstract findOneAndDelete(collection, query, options): void;

  abstract find(collection, query, options): void;

  abstract count(collection, query): void;

  abstract createIndex(collection, field, options): void;

  static connect(url, options) {
    throw new TypeError("You must override connect (static).");
  }

  abstract close(): void;

  abstract clearCollection(collection): void;

  abstract dropDatabase(): void;

  abstract toCanonicalId(id): void;

  abstract isNativeId(value): void;

  abstract toNativeId(id): void;

  abstract nativeIdType(): void;

  abstract driver(): void;
}

module.exports = DatabaseClient;
