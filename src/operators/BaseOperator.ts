import { getExpressionValue } from "../expressionHelpers";

type BaseOperatorOptions = {
  data: any;
  params: any;
};

export default abstract class BaseOperator {
  data: any;

  operators: Record<string, any>;

  constructor() {
    this.operators = {};
  }

  abstract run(): any;

  private calcObject(data, exp) {
    return Object.entries(exp).reduce((acc, [key, val]) => {
      if (typeof this.operators[key] !== undefined) {
        return this.operators[key](data, val);
      } else {
        const newAcc = {
          ...acc,
          [key]: this.calcExpression(data, val),
        };
        return newAcc;
      }
    }, {});
  }

  calcExpression(data, exp) {
    if (Array.isArray(exp)) {
      return exp.map((e) => {
        return this.calcExpression(data, e);
      });
    } else if (typeof exp === "object" && exp !== null) {
      return this.calcObject(data, exp);
    } else {
      return getExpressionValue(data, exp);
    }
  }
}
