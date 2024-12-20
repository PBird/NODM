import { flatten } from "flat";
import _ from "lodash";
import { isObject } from "../lib/NeDbUtils";
import { StageOptions } from "../types";
import BaseStage from "./BaseStage";
import { parseExpValue } from "../expressionHelpers";
import Datastore from "@seald-io/nedb";
import $sum from "../operators/Accumulators/$sum";

export class $group<T> extends BaseStage<T> {
  params: any;

  groupDs!: Datastore<any>;

  operators = { $sum };

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    this.params = params;

    if (!(isObject(params) && "_id" in params)) {
      throw new Error("a group specification must include an _id");
    }

    this.groupDs = new Datastore({ autoload: true, inMemoryOnly: true });
  }

  async run() {
    let docs = [];
    if (this.currentCS === null) {
      docs = await this.currentDS.findAsync({});
    } else {
      docs = await this.currentCS.execAsync();
    }

    await this.ensureGroupDsIndex();

    await this.createGroups(docs);

    // console.log(this.groupDs.getAllData());

    this.currentDS = this.groupDs;
  }

  async createGroups(docs: any[]) {
    for (const doc of docs) {
      const newDoc = this.calcExpression(doc, this.params);
      const existDoc = await this.groupDs.findOneAsync(newDoc);
      if (existDoc) {
        await this.groupDs.removeAsync(newDoc, { multi: false });
        await this.groupDs.insertAsync({
          ...existDoc,
          docs: existDoc.docs.concat(doc),
        });
      } else {
        await this.groupDs.insertAsync({ ...newDoc, docs: [doc] });
      }
    }
  }

  async ensureGroupDsIndex() {
    const { expKeys } = this.getKeys();

    await this.groupDs.ensureIndexAsync({
      fieldName: expKeys,
      unique: false,
    });
  }

  getKeys() {
    let keys: Record<string, any> = {};

    keys = flatten(this.params);

    const expKeys: string[] = Object.values(keys).reduce((acc, curr) => {
      const { isExp, exp } = parseExpValue(curr);
      if (isExp) {
        acc.push(exp);
      }
      return acc;
    }, []);

    return {
      keys,
      expKeys,
    };
  }

  // $group: {
  //    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },  // Her günü gruplayarak tarihi biçimlendiriyoruz
  //    products: { $push: "$$ROOT" }  // Her gün için ürünlerin tamamını listele
  //  }

  // group stage i her bir key içine sadece accumulator alıyor, örneğin $sum, $push
  // protected checkOperator(exp) {
  //   const keys = Object.keys(exp);
  //   if (keys.length > 1) {
  //     keys.forEach((key) => {
  //       if (typeof this.operators[key] !== "undefined") {
  //         if (this.operators[key].operatorType === "accumulator") {
  //           throw new Error(`The field must specify one accumulator`);
  //         }
  //       }
  //     });
  //   }
  // }
}

// db.invoices.aggregate([
//   {
//     "$group": {
//       _id: {
//         item: "$item_name",
//         date_of_bill: "$date_of_bill",
//         m: "a"
//       },
//       all: {
//         $push: "$$ROOT"
//       },
//       total: {
//         $sum: "$price"
//       },
//       avg: {
//         "$avg": "$price"
//       }
//     }
//   }
// ])
