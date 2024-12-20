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
