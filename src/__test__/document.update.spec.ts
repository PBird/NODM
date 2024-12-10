import path from "path";
import { getClient, connect } from "../";
import { object, string, number, date, InferType } from "yup";
import { NeDbClient } from "../clients/NedbClient";
import { CollectionModel } from "../types";

let userSchema = object({
  name: string().strict().required(),
  age: number().strict().required(),
});

let categoySchema = object({
  name: string().required(),
  address: number().required(),
});

const dbPath = path.join(__dirname, "dbFiles/");

describe("Document", () => {
  let db: NeDbClient;

  let User: CollectionModel<InferType<typeof userSchema>>;
  let Category: CollectionModel<InferType<typeof categoySchema>>;

  const userData = {
    _id: "testid",
    age: 2,
    name: "deneme",
    email: "df@gmailc.",
    website: "wwww.",
  };

  beforeAll(() => {
    connect(`nedb://${dbPath}`, { autoload: true });
    db = getClient();

    User = db.model("user", userSchema);
    Category = db.model("category", categoySchema);
  });

  beforeEach(async () => {
    const user1 = new User(userData);
    await user1.save();
  });

  afterEach(async () => {
    User.deleteMany({});
    Category.deleteMany({});
  });

  test("Should upsert - findByIdAndUpdate", async () => {
    const deneme = await User.findByIdAndUpdate(
      "testid2",
      {
        _id: "testid2",
        name: "ss",
        age: 2,
      },
      {
        upsert: true,
      },
    );

    expect(deneme).toEqual({ _id: "testid2", name: "ss", age: 2 });
  });

  test("Should update field - findByIdAndUpdate", async () => {
    const deneme = await User.findByIdAndUpdate("testid", {
      name: "changed",
    });

    expect(deneme).toMatchObject({ ...userData, name: "changed" });
  });

  test("Should update multiple field - findByIdAndUpdate", async () => {
    const deneme = await User.findByIdAndUpdate("testid", {
      name: "changed",
      age: 15,
    });

    expect(deneme).toMatchObject({ ...userData, age: 15, name: "changed" });
  });

  test("Should rais validation error on strict - findByIdAndUpdate", async () => {
    expect.assertions(1);
    try {
      const deneme = await User.findByIdAndUpdate("testid", {
        name: "changed",
        age: "1",
      });
    } catch (error) {
      expect(error.message).toBeDefined();
    }
  });

  test("Should update overwrite - findByIdAndUpdate", async () => {
    const deneme = await User.findByIdAndUpdate(
      "testid",
      {
        name: "changed",
        age: 15,
      },
      { overwrite: true },
    );

    expect(deneme).toEqual({ _id: "testid", age: 15, name: "changed" });
  });

  test("Should update with inc operator - findByIdAndUpdate", async () => {
    const deneme = await User.findByIdAndUpdate("testid", {
      $inc: { age: 3 },
    });

    expect(deneme).toMatchObject({ age: 5 });
  });

  test("Should validate with set operator - findByIdAndUpdate", async () => {
    const deneme = await User.findByIdAndUpdate("testid", {
      $set: { age: 8 },
    });

    expect(deneme).toMatchObject({ age: 8, name: "deneme" });
  });

  test("Should validate error operator - findByIdAndUpdate", async () => {
    expect.assertions(1);
    try {
      const deneme = await User.findByIdAndUpdate("testid", {
        $set: { age: "a" },
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("Should findOne and update ", async () => {
    const deneme = await User.findOneUpdate(
      { name: "deneme" },
      { name: "changedName" },
    );

    expect(deneme?.name).toEqual("changedName");
  });
});
