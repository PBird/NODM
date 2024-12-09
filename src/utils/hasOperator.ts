import { checkObject } from "@seald-io/nedb/lib/model";

export default function hasOperator(obj: any) {
  try {
    checkObject(obj);
    return false;
  } catch (error) {
    return true;
  }
}
