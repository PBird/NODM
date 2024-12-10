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
  street: number().required(),
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

    // const cat1 = new Category({name: '34', street: 1})
  });

  afterEach(async () => {
    User.deleteMany({});
    Category.deleteMany({});
  });

  test("Should save Doc", async () => {
    const deneme = new User({
      age: 2,
      name: "deneme",
    });

    expect(typeof deneme.values._id).toEqual("undefined");
    await deneme.save();
    expect(typeof deneme.values._id).toEqual("string");

    deneme.set("name", "test");
    await deneme.save();
    expect(deneme.values.name).toEqual("test");
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
      street: 25,
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

  test("Should findOneAndDelete ", async () => {
    const numRemoved = await User.findOneAndDelete({ name: "deneme" });

    expect(numRemoved).toEqual(1);
  });

  test("Should find ", async () => {
    const docs = await User.find();

    expect(Array.isArray(docs)).toBeTruthy();
  });
});
