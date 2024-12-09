import { ObjectSchema } from "yup";
import { getClient as db } from "./clients";
import Aggregation from "./Aggregation";
import createBaseModel from "./createBaseModel";
import { DBFields } from "./types";

// Classı fonksiyon içine aldık çünkü T type ını
// tanımlama aşamasında static methodlara atayamıyoruz.
export function createModel<T extends DBFields>(
  collectionName: string,
  schema: ObjectSchema<T>,
) {
  const BaseModel = createBaseModel<T>(collectionName, schema);

  class Model extends BaseModel {
    values: T & DBFields;

    constructor(values: T & DBFields) {
      super();
      this.values = values;
    }

    get<K extends keyof (T & DBFields)>(key: K): (T & DBFields)[K] {
      return this.values[key];
    }

    set<K extends keyof (T & DBFields)>(
      key: K,
      value: (T & DBFields)[K],
    ): T[K] {
      this.values[key] = value;
      return this.values[key];
    }

    /**
     * Save (upsert) document
     */
    async save() {
      const res = await db().save<T>(
        collectionName,
        this.values,
        this.values._id,
      );
      if (res !== null) {
        this.values = res;
      }
    }

    /**
     * Delete current document
     */
    async delete() {
      const numRemoved = await db().delete(collectionName, this.values._id);
      return numRemoved;
    }
  }

  return Model;
}
