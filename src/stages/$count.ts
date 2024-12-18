import BaseStage from "./BaseStage";
import { StageOptions } from "../types";

export default class $count<T> extends BaseStage<T> {
  countText: string;

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    this.countText = params;
  }

  async run() {
    let countDocs = 0;
    if (this.currentCS !== null) {
      countDocs = (await this.updateCursorsDatastore()).length;
    } else {
      countDocs = await this.currentDS.countAsync({});
    }

    const newDocs = [
      {
        [this.countText]: countDocs,
      },
    ];

    const { cs, ds } = await this.createDatastoreFromDocs(newDocs);
    this.currentCS = cs;
    this.currentDS = ds;
  }
}
