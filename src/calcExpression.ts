import $sum from "./operators/$sum";
import { getExpressionValue } from "./expressionHelpers";

const operators = { $sum };

function calcObject(data, exp) {
  return Object.entries(exp).reduce((acc, [key, val]) => {
    if (typeof operators[key] !== undefined) {
      return operators[key](data, val);
    } else {
      const newAcc = {
        ...acc,
        [key]: calcExpression(data, val),
      };
      return newAcc;
    }
  }, {});
}

export function calcExpression(data, exp) {
  if (Array.isArray(exp)) {
    return exp.map((e) => {
      return calcExpression(data, e);
    });
  } else if (typeof exp === "object" && exp !== null) {
    return calcObject(data, exp);
  } else {
    return getExpressionValue(data, exp);
  }
}
