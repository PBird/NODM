import path from "path";
import { getClient, connect } from "../";
import { object, string, number, date, InferType } from "yup";
import { NeDbClient } from "../clients/NedbClient";
import { CollectionModel } from "../types";

let userSchema = object({
  name: string().required(),
  age: number().required().positive().integer(),
  email: string().email(),
  website: string().url().nullable(),
  createdOn: date().default(() => new Date()),
});

let categoySchema = object({
  name: string().required(),
});

const dbPath = path.join(__dirname, "dbFiles/");

describe("Document", () => {
  let db: NeDbClient;

  let User: CollectionModel<InferType<typeof userSchema>>;
  let Category: CollectionModel<InferType<typeof categoySchema>>;

  const userData = {
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
    await user1.save();
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
