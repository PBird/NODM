import Datastore from "@seald-io/nedb";
import Index from "@seald-io/nedb/lib/indexes";
import Cursor from "../Cursor";
import { getExpressionValue } from "../expressionHelpers";

type BaseOperatorOptions<T> = {
  ds: Datastore;
  cs: Cursor<T> | null;
};

export default abstract class BaseStage<T> {
  datastoreOptions: Datastore.DataStoreOptions;

  currentDS: Datastore<T>;

  currentCS: Cursor<T> | null;

  operators: Record<string, any>;

  constructor({ ds, cs }: BaseOperatorOptions<T>) {
    this.currentDS = ds;

    this.currentCS = cs;

    this.datastoreOptions = {
      inMemoryOnly: true,
      // @ts-ignore
      compareStrings: this.currentDS.compareStrings,
    };

    this.operators = {};
  }

  abstract run(): Promise<void>;

  async updateCursorsDatastore() {
    let currentDocs = [];

    currentDocs = await this.currentCS!.execAsync();

    const indexes = this.currentDS.indexes;

    this.currentDS = new Datastore(this.datastoreOptions);

    // await this.currentDS.insertAsync(currentDocs)

    await this.currentDS.executor.pushAsync(async () => {
      // Recreate all indexes in the datastore
      if (indexes) {
        // this.currentDS.indexes = indexes;
        // We can assign indexes directly but i choose to create new
        // Maybe we can change it if will not give error for match or other stuff
        Object.keys(indexes).forEach((key) => {
          this.currentDS.indexes[key] = new Index(indexes[key]);
        });
      }

      this.currentDS._resetIndexes(currentDocs);
    }, true);

    // TODO: maybe we can remove sort it
    this.currentCS = new Cursor(this.currentDS, {}, null, {
      sort: this.currentCS?._sort,
    });

    return currentDocs;
  }

  async createDatastoreFromDocs<O>(newDocs: O[]) {
    const newDS = new Datastore<O>(this.datastoreOptions);

    await newDS.executor.pushAsync(
      async () => newDS._resetIndexes(newDocs),
      true,
    );
    const newCS = new Cursor<O>(newDS, {}, null);

    return { ds: newDS, cs: newCS };
  }

  private calcObject(data, exp) {
    let singleton = false;
    return Object.entries(exp).reduce((acc, [key, params]) => {
      if (typeof this.operators[key] !== "undefined") {
        const opt = new this.operators[key]({ data, params });
        const res = opt.run();
        if (res !== undefined) {
          singleton = true;
          return res;
        } else {
          return acc;
        }
      } else {
        if (singleton) {
          throw new Error(
            "an expression specification must contain exactly one field",
          );
        }
        const newAcc = {
          ...acc,
          [key]: this.calcExpression(data, params),
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
}
