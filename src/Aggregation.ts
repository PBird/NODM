import Datastore from "@seald-io/nedb";
import { deepCopy, getDotValue } from "@seald-io/nedb/lib/model";
import Index from "@seald-io/nedb/lib/indexes";
import _ from "lodash";
import RightJoiner from "./utils/RighJoiner";
import { NeDbClient } from "./clients/NedbClient";
import { getClient as db } from "./clients";

// kendi Datastore'unu oluşturuyorsa type: J
// CS -> CS geçişte yeni Datastore' a gerek yok
// CS -> DS geçişte _aggregate içinde yeni Datastore oluşturuluyor.
// (Optimizasyon için her DS fonksiyonunda CS yi exec edip yeni Datastore oluşturmuyoruz.)
// J type ı zaten kendi Datastore'unu oluşturuyor.
// Eğer kendi Datastore'unu oluşturmuşsa ve ordaki _id gereksizse instance'ına asNewDataStore true olarak atıyoruz

type AggregationOptions = {
  ds: Datastore;
  cs: Datastore.Cursor<any> | null;
  pipeline: any[];
};

export type ParsedPipelineType = {
  name: string;
  params: any;
};

export default class Aggregation {
  currentDS: Datastore;

  currentCS: Datastore.Cursor<any> | null;

  datastoreOptions: Datastore.DataStoreOptions;

  currentPipeline!: ParsedPipelineType[];

  pipeline: any[];

  showIDfield: boolean;

  constructor({ ds, cs, pipeline }: AggregationOptions) {
    this.currentDS = ds;
    this.currentCS = cs;
    this.pipeline = pipeline;
    this.showIDfield = true;

    this.datastoreOptions = {
      inMemoryOnly: true,
      // @ts-ignore
      compareStrings: this.currentDS.compareStrings,
    };

    this.parsePipeline();
  }

  run() {
    return this._aggregate();
  }

  // eslint-disable-next-line
  async _aggregate(): Promise<any> {
    const operator = this.currentPipeline.shift();

    if (typeof operator === "undefined") {
      this.currentCS = this.currentCS || this.currentDS.findAsync({});
      if (!this.showIDfield) {
        this.currentCS = this.currentCS.projection({ _id: 0 });
      }
      // @ts-ignore
      // burada eğer currentCursor yeni Datastore oluşturduysa _id yi project etmemesi sağalanac

      return this.currentCS.execAsync();
    }

    await this[operator.name](operator.params);

    return this._aggregate();
  }

  async $match(params: any) {
    if (this.currentCS !== null) {
      await this.updateCursorsDatastore();

      // query i değiştiriyoruz. zaten eşleşenleri çektik
      // @ts-ignore
      this.currentCS.query = params;
      // @ts-ignore bu fonksiyon seald-io/nedb lib/datastore.js dosyasından referans alındı
      this.currentCS.mapFn = (docs) => docs.map((doc) => deepCopy(doc));
    } else {
      this.currentCS = this.currentDS.findAsync(params);
    }
  }

  async $count(params: string) {
    let countDocs = 0;
    if (this.currentCS !== null) {
      countDocs = (await this.updateCursorsDatastore()).length;
      // @ts-ignore bu fonksiyon seald-io/nedb lib/datastore.js dosyasından referans alındı
      this.currentCS.mapFn = (docs) => docs.length;
    } else {
      countDocs = await this.currentDS.countAsync({});
    }

    const newDocs = [
      {
        [params]: countDocs,
      },
    ];

    this.currentDS = await this.createDatastoreFromDocs(newDocs);
    this.currentCS = this.currentDS.findAsync({}).projection({ _id: 0 });
    this.showIDfield = false;
  }

  async $limit(params: number) {
    this.currentCS = this.currentCS || this.currentDS.findAsync({});
    this.currentCS = this.currentCS.limit(params);
  }

  async $skip(params: number) {
    this.currentCS = this.currentCS || this.currentDS.findAsync({});
    this.currentCS = this.currentCS.skip(params);
  }

  async $sort(params: any) {
    this.currentCS = this.currentCS || this.currentDS.findAsync({});
    this.currentCS = this.currentCS.sort(params);
  }

  async $project(params: any) {
    this.currentCS = this.currentCS || this.currentDS.findAsync({});
    this.currentCS = this.currentCS.projection(params);
  }

  async $facet(params: any) {
    const resultPromisses: Promise<any>[] = [];
    const fieldKeys: string[] = [];

    // cursorun hafızası var o yüzden veriyi dataStore a çeviriyoruz. Böylece cursor null oluyor
    // await this.execCursor();
    if (this.currentCS !== null) {
      await this.updateCursorsDatastore();
    }

    Object.entries(params).forEach(([fieldKey, value]) => {
      if (!Array.isArray(value)) {
        throw new Error(
          `arguments to $facet must be arrays, ${fieldKey} is type ${typeof value}`,
        );
      }

      // lookup ile oluşturulan döküman sırasını korumak için
      // Geçicic sort bilgisi olan CS oluşturuyoruz.  Böylece CS her biri için bağımsız oluyor.
      // birbirlerinden etkilenmiyorlar. _limit,_query vs değişirse.

      const tempCS = this.currentDS.findAsync({}).sort(this.currentCS?._sort);

      const newAggregation = new Aggregation({
        cs: tempCS,
        ds: this.currentDS,
        pipeline: value,
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

    this.currentDS = await this.createDatastoreFromDocs(newDoc);
    this.currentCS = this.currentDS.findAsync({});
    this.showIDfield = false;
  }

  async $lookup(params: any) {
    let docs = [];
    if (this.currentCS === null) {
      docs = this.currentDS.getAllData();
    } else {
      docs = await this.currentCS.execAsync();
    }

    const { from, localField, foreignField, as, pipeline = [] } = params;

    const localFieldKeys = _.uniq(
      docs.map((d) => getDotValue(d, localField)),
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

    this.currentDS = await this.createDatastoreFromDocs(newDocs);

    // lookup ile oluşturulan döküman sırasını korumak için
    this.currentCS = this.currentDS.findAsync({}).sort(this.currentCS?._sort);
  }

  parsePipeline() {
    this.currentPipeline = this.pipeline.reduce<ParsedPipelineType[]>(
      (acc, p) => {
        const stages = Object.keys(p);
        if (stages.length <= 1) {
          const [operatorName] = stages;

          const method = this[operatorName];
          if (!(typeof method === "function" && operatorName.startsWith("$"))) {
            throw new Error(
              `aggregate: Operator not defined -> ${operatorName}`,
            );
          }
          const params = p[operatorName];

          const operator = {
            name: operatorName,
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

  async createDatastoreFromDocs(newDocs: any) {
    const newDS = new Datastore(this.datastoreOptions);

    await newDS.executor.pushAsync(
      async () => newDS._resetIndexes(newDocs),
      true,
    );

    return newDS;
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
        const newForeignDs = await this.createDatastoreFromDocs(docs);

        const foreignPipeline = [];

        const newAggregation = new Aggregation({
          ds: newForeignDs,
          pipeline: foreignPipeline.concat(pipeline),
          cs: null,
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
          pipeline: foreignPipeline.concat(pipeline),
          cs: null,
        });

        foreignDocs = await newAggregation.run();
      }
    } else {
      throw new Error("Foreign model doesn't have aggregate function");
    }

    return foreignDocs;
  }

  async updateCursorsDatastore() {
    let currentDocs = [];

    currentDocs = await this.currentCS.execAsync();

    const indexes = this.currentCS.indexes;

    this.currentDS = new Datastore(this.datastoreOptions);

    // await this.currentDS.insertAsync(currentDocs)

    await this.currentDS.executor.pushAsync(async () => {
      // Recreate all indexes in the datastore
      if (indexes) {
        // this.currentDS.indexes = indexes;
        // We can assign indexes directly but i choose to create new 
        // Maybe we can change it if will not give error for match or other stuff 
        Object.keys(indexes).forEach((key) => {
          this.currentDS.indexes[key] = new Index(indexes[key]);
        });
      }

      this.currentDS._resetIndexes(currentDocs);
    }, true);

    this.currentCS = this.currentDS.findAsync({}).sort(this.currentCS?._sort);

    return currentDocs;
  }
}
