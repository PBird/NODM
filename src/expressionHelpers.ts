import { getDotValue } from "./lib/NeDbModel";

export function parseExpValue(text: string) {
  let exp = text;
  const isExp = typeof text === "string" && text.startsWith("$");

  if (isExp) {
    exp = text.split("$")[1];
  }

  return {
    isExp,
    exp,
  };
}

export function getExpressionValue(data, params) {
  const { isExp, exp } = parseExpValue(params);
  if (isExp) {
    if (Array.isArray(data)) {
      const docs = { docs: data };
      const loc = `docs.${exp}`;
      return getDotValue(docs, loc);
    } else {
      const loc = `${exp}`;
      return getDotValue(data, loc);
    }
  }
  return params;
}
