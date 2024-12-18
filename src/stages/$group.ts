import { StageOptions } from "../types";
import BaseStage from "./BaseStage";

export class $group<T> extends BaseStage<T> {
  query: any;

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    this.query = params;
    if (!("_id" in params)) {
      throw new Error("a group specification must include an _id");
    }
  }

  async run() {
    let docs = [];
    if (this.currentCS === null) {
      docs = this.currentDS.getAllData();
    } else {
      docs = await this.currentCS.execAsync();
    }
  }
}
