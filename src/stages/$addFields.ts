import NeDbModel from "@seald-io/nedb/lib/model";
import _ from "lodash";
import BaseStage from "./BaseStage";
import { StageOptions } from "../types";
import Cursor from "../Cursor";
import { calcExpression } from "../calcExpression";

export default class $addFields<T> extends BaseStage<T> {
  query: any;

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    this.query = params;

    if (
      typeof this.query !== "object" &&
      this.query === null &&
      Array.isArray(this.query)
    ) {
      throw new Error("$addFields specification stage must be an object");
    }
    if (Object.keys(params).find((s) => s.startsWith("$"))) {
      throw new Error("FieldPath field names may not start with $");
    }
  }

  async run() {
    let docs = [];
    if (this.currentCS !== null) {
      docs = await this.currentCS.execAsync();
    } else {
      docs = this.currentDS.getAllData();
    }

    const newDocs = docs.map((doc) => {
      const newVarObj = Object.entries(this.query).reduce((acc, [key, exp]) => {
        return {
          ...acc,
          [key]: calcExpression(doc, exp),
        };
      }, {});
      return _.assign(doc, newVarObj);
    });

    const { ds, cs } = await this.createDatastoreFromDocs<T>(newDocs);
    this.currentCS = cs;
    this.currentDS = ds;
  }
}
