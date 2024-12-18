import BaseStage from "./BaseStage";
import { StageOptions } from "../types";
import Cursor from "../Cursor";

export default class $sort<T> extends BaseStage<T> {
  sort: any;

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    this.sort = params;
  }

  async run() {
    if (this.currentCS === null) {
      this.currentCS = new Cursor<T>(this.currentDS, {}, null, {
        sort: this.sort,
      });
    } else {
      this.currentCS.sort(this.sort);
    }
  }
}
