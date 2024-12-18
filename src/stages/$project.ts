import BaseStage from "./BaseStage";
import { StageOptions } from "../types";
import Cursor from "../Cursor";

export default class $project<T> extends BaseStage<T> {
  project: any;

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    this.project = params;
  }

  async run() {
    if (this.currentCS === null) {
      this.currentCS = new Cursor<T>(this.currentDS, {}, null, {
        projection: this.project,

      });
    } else {
      this.currentCS.projection(this.project);
    }
  }
}
