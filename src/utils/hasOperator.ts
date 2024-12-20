import { checkObject } from "../lib/NeDbModel";

export default function hasOperator(obj: any) {
  try {
    checkObject(obj);
    return false;
  } catch (error) {
    return true;
  }
}
