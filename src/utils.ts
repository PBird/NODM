import NeDbModel from "@seald-io/nedb/lib/model";
import { AnyObject, AnySchema, ObjectSchema } from "yup";
import hasOperator from "./utils/hasOperator";

export async function castAndValidateOnUpserting<T extends AnyObject>(
  schema: ObjectSchema<any>,
  query: object,
  updateQ: object,
) {
  let toBeInserted: T;

  try {
    NeDbModel.checkObject(updateQ);
    // updateQuery is a simple object with no modifier, use it as the document to insert
    toBeInserted = updateQ;
  } catch (e) {
    // updateQuery contains modifiers, use the find query as the base,
    // strip it from all operators and update it according to updateQuery
    toBeInserted = NeDbModel.modify(NeDbModel.deepCopy(query, true), updateQ);
  }

  const validatedData = await schema.validate(toBeInserted);

  return validatedData;
}

export async function castAndValidateOnUpdate<T extends AnyObject>(
  schema: ObjectSchema<T>,
  oldDoc: T,
  updateQ: object,
  overwrite?: boolean,
) {
  if (overwrite || hasOperator(updateQ)) {
    const newDoc = NeDbModel.modify(NeDbModel.deepCopy(oldDoc), updateQ);

    const castedData = await schema.validate(newDoc);
    return { updateQ, castedData };
  } else {
    const castedData = await schema.partial().validate(updateQ);

    return {
      updateQ: { $set: castedData },
      castedData: castedData,
    };
  }
}
