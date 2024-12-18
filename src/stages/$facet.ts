import NeDbModel from "@seald-io/nedb/lib/model";
import BaseStage from "./BaseStage";
import { StageOptions } from "../types";
import Cursor from "../Cursor";
import Aggregation from "../Aggregation";

export default class $facet<T> extends BaseStage<T> {
  query: any;

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    this.query = params;
  }

  async run() {
    const resultPromisses: Promise<any>[] = [];
    const fieldKeys: string[] = [];

    // cursorun hafızası var o yüzden veriyi dataStore a çeviriyoruz. Böylece cursor null oluyor
    // await this.execCursor();
    if (this.currentCS !== null) {
      await this.updateCursorsDatastore();
    }

    Object.entries(this.query).forEach(([fieldKey, value]) => {
      if (!Array.isArray(value)) {
        throw new Error(
          `arguments to $facet must be arrays, ${fieldKey} is type ${typeof value}`,
        );
      }

      // lookup ile oluşturulan döküman sırasını korumak için
      // Geçicic sort bilgisi olan CS oluşturuyoruz.  Böylece CS her biri için bağımsız oluyor.
      // birbirlerinden etkilenmiyorlar. _limit,_query vs değişirse.

      const tempCS = new Cursor<T>(this.currentDS, {}, null, {
        sort: this.currentCS?._sort,
      });

      const newAggregation = new Aggregation({
        cs: tempCS,
        ds: this.currentDS,
        params: value,
      });

      const aggProm = newAggregation.run();
      fieldKeys.push(fieldKey);
      resultPromisses.push(aggProm);
    });
    const results = await Promise.all(resultPromisses);

    const newDoc = fieldKeys.reduce((acc, k, index) => {
      acc[k] = results[index];
      return acc;
    }, {});

    const { ds, cs } = await this.createDatastoreFromDocs([newDoc]);
    this.currentDS = ds;
    this.currentCS = cs;
  }
}
