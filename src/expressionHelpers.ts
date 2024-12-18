import NeDbModel from "@seald-io/nedb/lib/model";

export function getExpressionValue(data, exp) {
  if (typeof exp === "string" && exp.startsWith("$")) {
    if (Array.isArray(data)) {
      const docs = { docs: data };
      const loc = `docs.${exp.split("$")[1]}`;
      return NeDbModel.getDotValue(docs, loc);
    } else {
      const loc = `${exp.split("$")[1]}`;
      return NeDbModel.getDotValue(data, loc);
    }
  }
  return exp;
}
