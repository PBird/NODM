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
    createdOn: new Date(),
  };

  beforeAll(() => {
    connect(`nedb://${dbPath}`, { autoload: true });
    db = getClient();

    User = db.model("user", userSchema);
    Category = db.model("category", categoySchema);
  });

  beforeEach(async () => {
    const user1 = new User(userData);
    // user1.values
    await user1.save();
  });

  afterEach(async () => {
    User.deleteMany({});
    Category.deleteMany({});
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
      console.log(error.message);
      expect(error.message).toBeDefined();
    }
  });

  test.only("Should update overwrite - findByIdAndUpdate", async () => {
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

  test.only("Should validate error operator - findByIdAndUpdate", async () => {
    expect.assertions(1);
    try {
      const deneme = await User.findByIdAndUpdate("testid", {
        $set: { age: "a" },
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("Should save Doc", async () => {
    const deneme = new User(userData);

    expect(typeof deneme.values._id).toEqual("undefined");
    await deneme.save();
    expect(typeof deneme.values._id).toEqual("string");

    deneme.set("email", "daffadfaf.dcadcd");
    await deneme.save();
    expect(deneme.values.email).toEqual("daffadfaf.dcadcd");
  });

  test("Should delete Doc", async () => {
    const userData = {
      age: 2,
      name: "willbedeleted",
      email: "deleted@gmailc.",
      website: "wwwwdeleted",
      createdOn: new Date(),
    };

    const deneme = new User(userData);

    await deneme.save();
    expect(typeof deneme.values._id).toEqual("string");
    await deneme.delete();
  });

  test("Should deleteOne", async () => {
    const userData = {
      age: 2,
      name: "deleteOneName",
      email: "deleteOneNamedeleted@gmailc.",
      website: "wwwwdeleteOneNamedeleted",
      createdOn: new Date(),
    };

    const catData = {
      name: "hehe",
    };

    const denemeCat = new Category(catData);
    denemeCat.save();

    const deneme = new User(userData);
    await deneme.save();

    await User.deleteOne({ name: "deleteOneName" });
    await Category.deleteOne({ name: "hehe" });
  });

  test("Should findOne", async () => {
    const a = await User.findOne({ name: "deneme" }, {});
  });

  test("Should aggregate func run", async () => {
    const a = await User.aggregate([
      { $match: { name: "deneme" } },

      { $limit: 1 },
    ]);
  });

  test("Should findOne and update ", async () => {
    const deneme = await User.findOneUpdate(
      { name: "deneme" },
      { name: "changedName" },
    );

    expect(deneme?.name).toEqual("changedName");
  });

  test("Should findOneAndDelete ", async () => {
    const numRemoved = await User.findOneAndDelete({ name: "deneme" });

    expect(numRemoved).toEqual(1);
  });

  test("Should find ", async () => {
    const docs = await User.find();

    expect(Array.isArray(docs)).toBeTruthy();
  });
});
