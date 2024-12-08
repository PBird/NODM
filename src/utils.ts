import type Model from "./Document";
import type { DBFields } from "./Model";
import type Datastore from "@seald-io/nedb";

export function bindDocument<T extends DBFields>(
  targetFunc: typeof Model<T>,
  extraStatics: any,
  ds: Datastore,
) {
  const boundFunc = targetFunc.bind(null, ds);
  Object.defineProperties(
    boundFunc,
    Object.getOwnPropertyDescriptors(targetFunc),
  );

  Object.defineProperties(
    boundFunc,
    Object.getOwnPropertyDescriptors(extraStatics),
  );
  return boundFunc;
}
