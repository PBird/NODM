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

  const catData = {
    _id: "testcatid",
    name: "34",
    street: 1,
  };

  beforeAll(() => {
    connect(`nedb://${dbPath}`, { autoload: true });
    db = getClient();

    User = db.model("userfind", userSchema);
    Category = db.model("categoryfind", categoySchema);
  });

  beforeEach(async () => {
    const user1 = new User(userData);
    // user1.values
    await user1.save();

    const cat1 = new Category(catData);
    await cat1.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Category.deleteMany({});
  });

  test("Should findOne Doc", async () => {
    const doc = await Category.findOne({ _id: catData._id });

    expect(doc).toMatchObject(catData);
  });

  test("Should find Doc", async () => {
    const docs = await Category.find({ _id: { $in: [catData._id] } });

    expect(docs.length).toEqual(1);
  });
});
