import path from "path";
import _ from "lodash";
import { getClient, connect } from "../../";
import { object, string, number, date, InferType } from "yup";
import { NeDbClient } from "../../clients/NedbClient";
import { CollectionModel } from "../../types";
import data from "../data.json";
import { removeFilesByType } from "../../utils/helperFile";

const dbPath = path.join(__dirname, "dbFiles/");

describe("Document", () => {
  let db: NeDbClient;

  let Quiz: CollectionModel<any>;

  const userData = {
    _id: "testid",
    age: 2,
    name: "deneme",
    email: "df@gmailc.",
    website: "wwww.",
  };

  beforeAll(async () => {
    connect(`nedb://${dbPath}`, { autoload: true });
    db = getClient();

    Quiz = db.model("quiz", object());

    await db._collections["quiz"].insertAsync(data.quizes);
  });

  afterAll(async () => {
    await removeFilesByType(dbPath, ".db");
  });

  afterEach(async () => {});

  test("SHOULD aggregate addFields constant", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: "test",
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe("test");
    });
  });

  test("SHOULD aggregate addFields $ reach in object field", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: "$final",
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe(d.final);
    });
  });

  test("SHOULD aggregate addFields $ reach inner object field", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: "$spec.color",
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe(d.spec.color);
    });
  });

  test("SHOULD aggregate addFields use operator $sum constant", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: { $sum: 1 },
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe(1);
    });
  });

  test("SHOULD aggregate addFields use operator $sum constant array", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: { $sum: [5, 10] },
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe(15);
    });
  });

  test("SHOULD aggregate addFields use operator $sum field", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: { $sum: "$final" },
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe(d.final);
    });
  });

  test("SHOULD aggregate addFields use operator $sum array of field", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: { $sum: "$quizzes" },
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe(_.sum(d.quizzes));
    });
  });

  test("SHOULD aggregate addFields use operator $sum single array", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: { $sum: ["$quizzes"] },
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe(_.sum(d.quizzes));
    });
  });

  test("SHOULD aggregate addFields use operator $sum mix array", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: { $sum: ["$quizzes", 5, null, "adf"] },
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe(5);
    });
  });

  test("SHOULD aggregate addFields use operator $sum multifield", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: { $sum: ["$midterm", "$final"] },
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe(d.midterm + d.final);
    });
  });

  test("SHOULD aggregate addFields use operator $sum inner", async () => {
    const docs = await Quiz.aggregate([
      {
        $addFields: {
          testField: { $sum: ["$labs.0", "$final"] },
        },
      },
    ]);

    docs.forEach((d) => {
      expect(d.testField).toBe(d.labs[0] + d.final);
    });
  });
});
