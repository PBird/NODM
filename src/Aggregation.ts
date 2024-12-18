import Datastore from "@seald-io/nedb";
import { deepCopy, getDotValue } from "@seald-io/nedb/lib/model";
import _ from "lodash";
import RightJoiner from "./utils/RighJoiner";
import $limit from "./stages/$limit";
import BaseStage from "./stages/BaseStage";
import Cursor from "./Cursor";
import $sort from "./stages/$sort";
import $facet from "./stages/$facet";
import $skip from "./stages/$skip";
import $project from "./stages/$project";
import $lookup from "./stages/$lookup";
import $match from "./stages/$match";
import $count from "./stages/$count";
import $addFields from "./stages/$addFields";

// kendi Datastore'unu oluşturuyorsa type: J
// CS -> CS geçişte yeni Datastore' a gerek yok
// CS -> DS geçişte _aggregate içinde yeni Datastore oluşturuluyor.
// (Optimizasyon için her DS fonksiyonunda CS yi exec edip yeni Datastore oluşturmuyoruz.)
// J type ı zaten kendi Datastore'unu oluşturuyor.
// Eğer kendi Datastore'unu oluşturmuşsa ve ordaki _id gereksizse instance'ına asNewDataStore true olarak atıyoruz

type AggregationOptions<T> = {
  ds: Datastore;
  cs: Cursor<T> | null;
  params: any[];
};

export type ParsedPipelineType = {
  name: string;
  params: any;
};

type StageType<T, C extends BaseStage<T>> = new (...args: any[]) => C;

export default class Aggregation<T> extends BaseStage<T> {
  currentPipeline!: ParsedPipelineType[];

  pipeline: any[];

  stages: Record<string, StageType<T, BaseStage<T>>> = {
    $count,
    $facet,
    $limit,
    $lookup,
    $match,
    $project,
    $skip,
    $sort,
    $addFields,
  };

  constructor({ ds, cs, params }: AggregationOptions<T>) {
    super({ ds, cs });
    this.pipeline = params;

    this.parsePipeline();
  }

  run() {
    return this._aggregate();
  }

  async _aggregate(): Promise<any> {
    const operator = this.currentPipeline.shift();

    if (typeof operator === "undefined") {
      this.currentCS =
        this.currentCS || new Cursor<T>(this.currentDS, {}, null);
      // @ts-ignore
      // burada eğer currentCursor yeni Datastore oluşturduysa _id yi project etmemesi sağalanac

      return this.currentCS.execAsync();
    }

    // await this[operator.name](operator.params);

    const stage = new this.stages[operator.name]({
      ds: this.currentDS,
      cs: this.currentCS,
      params: operator.params,
    });

    await stage.run();

    this.currentDS = stage.currentDS;
    this.currentCS = stage.currentCS;

    return this._aggregate();
  }

  parsePipeline() {
    this.currentPipeline = this.pipeline.reduce<ParsedPipelineType[]>(
      (acc, p) => {
        const stages = Object.keys(p);
        if (stages.length <= 1) {
          const [stageName] = stages;

          const stage = this.stages[stageName];
          if (!(typeof stage !== "undefined" && stageName.startsWith("$"))) {
            throw new Error(`aggregate: Operator not defined -> ${stageName}`);
          }
          const params = p[stageName];

          const operator = {
            name: stageName,
            params,
          };
          acc.push(operator);

          return acc;
        }
        throw new Error(
          "aggregate: A pipeline stage specification object must contain exactly one field",
        );
      },
      [],
    );
  }
}
