import BaseStage from "./BaseStage";
import { StageOptions } from "../types";
import Cursor from "../Cursor";

export default class $limit<T> extends BaseStage<T> {
  limit: number;

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    if (!Number.isInteger(params)) {
      throw new Error(`Expected an integer: $limit: ${params}`);
    }
    this.limit = params;
  }

  async run() {
    if (this.currentCS === null) {
      this.currentCS = new Cursor<T>(this.currentDS, {}, null, {
        limit: this.limit,
      });
    } else {
      this.currentCS.limit(this.limit);
    }
  }
}
