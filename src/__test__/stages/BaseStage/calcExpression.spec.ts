import Datastore from "@seald-io/nedb";
import BaseStage from "../../../stages/BaseStage";
import { testDbPath } from "../../constants";
import data from "../../data.json";
import path from "path";
import $sum from "../../../operators/$sum";

describe("Stages/BaseStage->calcExpression", () => {
  class $testStage<T> extends BaseStage<T> {
    operators = {$sum};

    constructor({ params, ds, cs }) {
      super({ ds, cs });
    }

    run(): Promise<void> {
      return;
    }
  }

  let testStage: $testStage<any>;

  beforeAll(() => {
    const ds = new Datastore({
      filename: path.join(testDbPath, "stages.BaseStage.calcExpression.db"),
      autoload: true,
    });

    testStage = new $testStage({ ds, cs: null, params: null });
  });

  test("SHOULD calcExpression field", () => {
    const finals = testStage.calcExpression(data.quizes, "$final");

    expect(finals).toEqual(data.quizes.map((q) => q.final));
  });

  test("SHOULD calcExpression inner field", () => {
    const labs0 = testStage.calcExpression(data.quizes, "$labs.0");

    expect(labs0).toEqual(data.quizes.map((q) => q.labs[0]));
  });

  test("SHOULD calcExpression sum constant 1", () => {
    const finalSum = testStage.calcExpression(data.quizes, { $sum: 1 });

    expect(finalSum).toEqual(data.quizes.reduce((acc, q) => acc + 1, 0));
  });

  test("SHOULD calcExpression sum constant 2", () => {
    const finalSum = testStage.calcExpression(data.quizes, { $sum: 2 });

    expect(finalSum).toEqual(data.quizes.reduce((acc, q) => acc + 2, 0));
  });

  test("SHOULD calcExpression sum 0", () => {
    const finalSum = testStage.calcExpression(data.quizes, { $sum: "s" });

    expect(finalSum).toEqual(0);
  });

  test("SHOULD calcExpression sum", () => {
    const finalSum = testStage.calcExpression(data.quizes, { $sum: "$final" });

    expect(finalSum).toEqual(data.quizes.reduce((acc, q) => acc + q.final, 0));
  });
});
