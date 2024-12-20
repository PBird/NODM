import _ from "lodash";
import { getExpressionValue } from "../../expressionHelpers";
import BaseOperator from "../BaseOperator";

export default class $push extends BaseOperator {
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
        throw new Error("The $push accumulator is a unary operator");
      }

      const result = this.data.reduce((acc, curr) => {
        const v = getExpressionValue(curr, this.params);
        acc.push(v);
        return acc;
      }, []);

      return result;
    }
    // normal
  }
}
