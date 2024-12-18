import { getExpressionValue } from "../expressionHelpers";

describe("ExpressionHelpers", () => {
  const doc = {
    name: "test1",
    address: {
      a: 1,
      b: {
        c: 2,
      },
    },
  };

  const docs = [
    {
      name: "test1",
      address: {
        a: 1,
        b: {
          c: 2,
        },
      },
    },
    {
      name: "test2",
      address: {
        a: 11,
        b: {
          c: 222,
        },
      },
    },
  ];

  test("SHOULD getExpressionValue for doc", () => {
    const name = getExpressionValue(doc, "$name");

    expect(name).toEqual(doc.name);
  });

  test("SHOULD getExpressionValue for doc inner field", () => {
    const name = getExpressionValue(doc, "$address.a");

    expect(name).toEqual(doc.address.a);
  });

  test("SHOULD getExpressionValue for docs", () => {
    const names = getExpressionValue(docs, "$name");

    expect(names).toEqual(docs.map((d) => d.name));
  });

  test("SHOULD getExpressionValue for docs inner field", () => {
    const aas = getExpressionValue(docs, "$address.a");

    expect(aas).toEqual(docs.map((d) => d.address.a));
  });
});
