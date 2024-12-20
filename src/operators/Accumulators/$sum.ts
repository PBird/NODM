import _ from "lodash";
import { getExpressionValue } from "../../expressionHelpers";
import BaseOperator from "../BaseOperator";

export default class $sum extends BaseOperator {
  static operatorType = "accumulator";

  data: any;
  params: any;

  constructor({ data, params }) {
    super();
    this.data = data;
    this.params = params;
  }

  run() {
    // if an accumulator such as $group
    // maybe we need to seperate accumulator or?
    if (Array.isArray(this.data)) {
      if (Array.isArray(this.params)) {
        throw new Error("The $sum accumulator is a unary operator");
      }

      const result = this.data.reduce((acc, curr) => {
        if (typeof this.params === "number") {
          acc = acc + this.params;
        } else {
          const v = getExpressionValue(curr, this.params);
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
      if (Array.isArray(this.params) && this.params.length > 1) {
        const result = this.params.reduce((acc, curr) => {
          const v = getExpressionValue(this.data, curr);

          if (typeof v === "number") {
            return v + acc;
          }
          return acc;
        }, 0);

        return result;
      } else {
        const currVal = Array.isArray(this.params)
          ? this.params[0]
          : this.params;
        const v = getExpressionValue(this.data, currVal);
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
}
