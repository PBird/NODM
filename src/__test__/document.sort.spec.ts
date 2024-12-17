import path from "path";
import { getClient, connect } from "../";
import { object, string, number, date, InferType } from "yup";
import { NeDbClient } from "../clients/NedbClient";
import { CollectionModel } from "../types";
import data from "./data2.json";

let categoySchema = object({
  name: string().required(),
  address: number().required(),
});

const dbPath = path.join(__dirname, "dbFiles/");

describe("Document", () => {
  let db: NeDbClient;

  let Order: CollectionModel<any>;
  let Inventory: CollectionModel<any>;

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

    Order = db.model("orders", object());
    Inventory = db.model("inventory", object());

    // await db._collections["orders"].insertAsync(data.orders);
    // await db._collections["inventory"].insertAsync(data.inventory);
  });

  beforeEach(async () => {});

  afterEach(async () => {});

  test("Should sort with defined - sort", async () => {
    const inventories= await Inventory.find({}, {sort:  {instock: 1} })
    console.log("inventories : ", inventories)
  });
});
