import NeDbModel from "@seald-io/nedb/lib/model";
import BaseStage from "./BaseStage";
import { StageOptions } from "../types";
import Cursor from "../Cursor";

export default class $match<T> extends BaseStage<T> {
  query: any;

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    this.query = params;
  }

  async run() {
    if (this.currentCS !== null) {
      await this.updateCursorsDatastore();

      // query i değiştiriyoruz. zaten eşleşenleri çektik
      // @ts-ignore
      this.currentCS.query = this.query;
      // @ts-ignore bu fonksiyon seald-io/nedb lib/datastore.js dosyasından referans alındı
      this.currentCS.mapFn = (docs) => docs.map((doc) => NeDbModel.deepCopy(doc));
    } else {
      this.currentCS = new Cursor(this.currentDS, this.query, (docs) =>
        docs.map((doc) => NeDbModel.deepCopy(doc)),
      );
    }
  }
}
