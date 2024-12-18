import BaseStage from "./BaseStage";
import { StageOptions } from "../types";
import Cursor from "../Cursor";

export default class $skip<T> extends BaseStage<T> {
  skip: number;

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    if (!Number.isInteger(params)) {
      throw new Error(`Expected an integer: $skip: ${params}`);
    }
    this.skip = params;
  }

  async run() {
    if (this.currentCS === null) {
      this.currentCS = new Cursor<T>(this.currentDS, {}, null, {
        skip: this.skip,
      });
    } else {
      this.currentCS.skip(this.skip);
    }
  }
}
