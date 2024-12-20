import Datastore from "@seald-io/nedb";
import BaseStage from "../../../stages/BaseStage";
import { testDbPath } from "../../constants";
import data from "../../data.json";
import path from "path";
import $sum from "../../../operators/Accumulators/$sum";
import groupMultipleKey from "../../../stages/testGroup";
import { $group } from "../../../stages/$group";
import data2 from "../../data2.json";

describe("Stages/$group", () => {
  let ds: Datastore;
  beforeAll(async () => {
    ds = new Datastore({
      filename: path.join(testDbPath, "stages.$group.calcExpression.db"),
      autoload: true,
    });

    await ds.insertAsync(data2.invoices);
  });

  afterAll(async () => {
    await ds.dropDatabaseAsync();
  });

  test("SHOULD group one key", async () => {
    const obj_id = {
      _id: {
        type: "$type",
      },
    };

    const groupStage = new $group({ ds, cs: null, params: obj_id });

    await groupStage.run();

    const result = groupStage.currentDS.getAllData();

    expect(result).toMatchSnapshot();
    // console.log(result);
  });

  test("SHOULD group multi key", async () => {
    const obj_id = {
      _id: {
        type: "$type",
        date: "$date_of_bill",
      },
    };

    const groupStage = new $group({ ds, cs: null, params: obj_id });

    await groupStage.run();

    const result = groupStage.currentDS.getAllData();

    expect(result).toMatchSnapshot();
    // console.log(result);
  });

  test("SHOULD group work operators $sum", async () => {
    const obj_id = {
      _id: {
        totalPrice: { $sum: ["$price", "$qty"] },
      },
    };

    const groupStage = new $group({ ds, cs: null, params: obj_id });

    await groupStage.run();

    const result = groupStage.currentDS.getAllData();

    expect(result).toMatchSnapshot();
  });
});
