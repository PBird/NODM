import Datastore from "@seald-io/nedb";
import BaseStage from "../../../stages/BaseStage";
import { testDbPath } from "../../constants";
import data from "../../data.json";
import path from "path";
import $sum from "../../../operators/Accumulators/$sum";

describe("Stages/BaseStage->calcExpression", () => {
  class $testStage<T> extends BaseStage<T> {
    operators = { $sum };

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

  test("SHOULD calcExpression object", () => {
    const finalSum = testStage.calcExpression(data.quizes, {
      test1: "$final",
      test2: 123,
    });

    expect(finalSum).toEqual({
      test1: data.quizes.map((q) => q.final),
      test2: 123,
    });
  });

  test("SHOULD calcExpression in object sum", () => {
    const finalSum = testStage.calcExpression(data.quizes, {
      test1: "$final",
      test2: 123,
      test3: { testin: { $sum: "$final" } },
    });

    expect(finalSum).toEqual({
      test1: data.quizes.map((q) => q.final),
      test2: 123,
      test3: { testin: data.quizes.reduce((acc, q) => acc + q.final, 0) },
    });
  });

  test("SHOULD calcExpression give error", () => {
    expect.assertions(1);
    try {
      testStage.calcExpression(data.quizes, {
        deneme: { $sum: "$final", name: 2 },
      });
    } catch (error) {
      expect(error.message).toBe(
        "an expression specification must contain exactly one field",
      );
    }

    // expect(finalSum).toEqual(data.quizes.reduce((acc, q) => acc + q.final, 0));
  });
});
