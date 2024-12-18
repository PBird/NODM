import { calcExpression } from "../calcExpression";
import data from "./data.json";

describe("calcExpression", () => {
  test("SHOULD calcExpression field", () => {
    const finals = calcExpression(data.quizes, "$final");

    expect(finals).toEqual(data.quizes.map((q) => q.final));
  });

  test("SHOULD calcExpression inner field", () => {
    const labs0 = calcExpression(data.quizes, "$labs.0");

    expect(labs0).toEqual(data.quizes.map((q) => q.labs[0]));
  });

  test("SHOULD calcExpression sum constant 1", () => {
    const finalSum = calcExpression(data.quizes, { $sum: 1 });

    expect(finalSum).toEqual(data.quizes.reduce((acc, q) => acc + 1, 0));
  });

  test("SHOULD calcExpression sum constant 2", () => {
    const finalSum = calcExpression(data.quizes, { $sum: 2 });

    expect(finalSum).toEqual(data.quizes.reduce((acc, q) => acc + 2, 0));
  });

  test("SHOULD calcExpression sum 0", () => {
    const finalSum = calcExpression(data.quizes, { $sum: "s" });

    expect(finalSum).toEqual(0);
  });

  test("SHOULD calcExpression sum", () => {
    const finalSum = calcExpression(data.quizes, { $sum: "$final" });

    expect(finalSum).toEqual(data.quizes.reduce((acc, q) => acc + q.final, 0));
  });
});
