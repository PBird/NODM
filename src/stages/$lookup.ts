import NeDbModel from "@seald-io/nedb/lib/model";
import { getClient as db } from "../clients";
import _ from "lodash";
import BaseStage from "./BaseStage";
import { StageOptions } from "../types";
import Cursor from "../Cursor";
import RightJoiner from "../utils/RighJoiner";
import Aggregation from "../Aggregation";

export default class $lookup<T> extends BaseStage<T> {
  query: any;

  constructor({ params, ds, cs }: StageOptions<T>) {
    super({ ds, cs });
    this.query = params;
  }

  async run() {
    let docs = [];
    if (this.currentCS === null) {
      docs = this.currentDS.getAllData();
    } else {
      docs = await this.currentCS.execAsync();
    }

    const { from, localField, foreignField, as, pipeline = [] } = this.query;

    const localFieldKeys = _.uniq(
      docs.map((d) => NeDbModel.getDotValue(d, localField)),
    ).flat();

    const foreignDocs = await this.getForeingDS(
      from,
      foreignField,
      localFieldKeys,
      pipeline,
    );

    const joiner = new RightJoiner(foreignDocs, docs, {
      foreignField,
      localField,
      as,
      dropNoMatch: false,
    });

    const newDocs = joiner.join();

    // TODO: burda type-safe yapılabilir
    const { cs, ds } = await this.createDatastoreFromDocs<any>(newDocs);
    this.currentDS = ds;
    // TODO: createDataStoreFromDocs should be ordered.
    // lookup ile oluşturulan döküman sırasını korumak için
    this.currentCS = cs.sort(this.currentCS?._sort);
  }

  async getForeingDS(
    from: string,
    foreignField: string,
    localFieldKeys: any[],
    pipeline: any[],
  ) {
    const foreignDS = db()._collections[from];
    let foreignDocs = [];

    if (typeof foreignDS !== "undefined") {
      if (foreignField in foreignDS.indexes) {
        const docs =
          foreignDS.indexes[foreignField].getMatching(localFieldKeys);
        const { ds: newForeignDs } = await this.createDatastoreFromDocs(docs);

        const foreignPipeline = [];

        const newAggregation = new Aggregation({
          ds: newForeignDs,
          cs: null,
          params: foreignPipeline.concat(pipeline),
        });

        foreignDocs = await newAggregation.run();
      } else {
        const foreignPipeline = [
          {
            $match: {
              [foreignField]: { $in: localFieldKeys },
            },
          },
        ];
        const newAggregation = new Aggregation({
          ds: foreignDS,
          cs: null,
          params: foreignPipeline.concat(pipeline),
        });

        foreignDocs = await newAggregation.run();
      }
    } else {
      throw new Error("Foreign model doesn't have aggregate function");
    }

    return foreignDocs;
  }
}
