import test, { describe } from "node:test";
import { connect, getClient } from "../";
import path from "path";

describe("Database", () => {
  test("Should Database connect", () => {
    const dbPath = path.join(__dirname, "dbFiles/");
    connect(`nedb://${dbPath}`, { autoload: true });
    const a = getClient();
  });
});
