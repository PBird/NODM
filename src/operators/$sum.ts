import _ from "lodash";
import { getExpressionValue } from "../expressionHelpers";

export default function $sum(data: any, val) {
  // if an accumulator such as $group
  if (Array.isArray(data)) {
    if (Array.isArray(val)) {
      throw new Error("The $sum accumulator is a unary operator");
    }

    const result = data.reduce((acc, curr) => {
      if (typeof val === "number") {
        acc = acc + val;
      } else {
        const v = getExpressionValue(curr, val);
        if (typeof v === "number") {
          acc = acc + v;
        }
      }

      return acc;
    }, 0);

    return result;
  }
  // normal
  else {
    if (Array.isArray(val) && val.length > 1) {
      const result = val.reduce((acc, curr) => {
        const v = getExpressionValue(data, curr);

        if (typeof v === "number") {
          return v + acc;
        }
        return acc;
      }, 0);

      return result;
    } else {
      const currVal = Array.isArray(val) ? val[0] : val;
      const v = getExpressionValue(data, currVal);
      const arrV = [].concat(v);
      return arrV.reduce((acc, curr) => {
        if (typeof curr === "number") {
          return acc + curr;
        }
        return acc;
      }, 0);
    }
  }
}
