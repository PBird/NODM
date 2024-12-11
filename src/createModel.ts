import { AnyObject, date, InferType, object, ObjectSchema, string } from "yup";
import { getClient as db } from "./clients";
import Aggregation from "./Aggregation";
import createBaseModel from "./createBaseModel";
import { SaveOptions } from "./types";

const baseDbSchema = object({
  _id: string()
    .transform((v) => v.toString())
    .notRequired(),
  createdAt: date().notRequired(),
  updatedAt: date().notRequired(),
});

// Classı fonksiyon içine aldık çünkü T type ını
// tanımlama aşamasında static methodlara atayamıyoruz.
export function createModel<T extends AnyObject>(
  collectionName: string,
  schema: ObjectSchema<T>,
) {
  type TWithDSchema = InferType<typeof baseDbSchema> & T;

  // @ts-ignore
  // TODO: I cant concat without type error maybe we can fix later
  const mergedSchema = baseDbSchema.concat(
    schema,
  ) as ObjectSchema<TWithDSchema>;

  const BaseModel = createBaseModel<TWithDSchema>(collectionName, mergedSchema);

  class Model extends BaseModel {
    values: TWithDSchema;

    constructor(values: TWithDSchema) {
      super();
      this.values = values;
    }

    get<K extends keyof TWithDSchema>(key: K): TWithDSchema[K] {
      return this.values[key];
    }

    set<K extends keyof TWithDSchema>(key: K, value: TWithDSchema[K]): T[K] {
      this.values[key] = value;
      return this.values[key];
    }

    /**
     * Save (upsert) document
     */
    async save(options: SaveOptions = { validateBeforeSave: true }) {
      const res = await db().save<TWithDSchema>(
        collectionName,
        this.values,
        options,
        this.values._id,
      );
      if (res !== null) {
        this.values = res;
      }

      return res;
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
