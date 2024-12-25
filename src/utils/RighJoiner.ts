import _ from "lodash";
import { getDotValue } from "../lib/NeDbModel";

/**
 *  Right join işlemleri tek bir sınıfta.
 * @class
 *
 * @constructor
 *
 * @foreignObj hedef nesne
 * @localObj temel nesne
 * @options
 *        foreignField: hedef nesnenin anahatarı
 *        localField: temel nesnenin anahtarı
 *        as: temel nesneye yeni atanacak anahatarın ismi
 *        dropNoMatch: true ise temel nesne de veya hedefte anahtar yoksa droplar
 *
 */
interface RightJoinerOptions<O, S> {
  foreignField: keyof O;
  localField: keyof S;
  as: string;
  dropNoMatch: boolean;
}

export default class RightJoiner<
  O extends Record<string, any>,
  S extends Record<string, any>,
> {
  foreignObj: O[];

  localObj: S[];

  options: RightJoinerOptions<O, S>;

  constructor(
    foreignObj: O[],
    localObj: S[],
    options: RightJoinerOptions<O, S>,
  ) {
    this.foreignObj = foreignObj;
    this.localObj = localObj;
    this.options = options;
  }

  join() {
    const foreignByField = _.groupBy(this.foreignObj, (v) =>
      getDotValue(v, this.options.foreignField),
    );

    const result = this.localObj.map((lo) => {
      // eğer dropNoMatch true ise
      // localObj nesnesindeki anahtar yoksa ve eşleşmiyorsa undefined
      const localValue = getDotValue(lo, this.options.localField);
      if (
        this.options.dropNoMatch &&
        (localValue === undefined || foreignByField[localValue] === undefined)
      ) {
        return undefined;
      }

      const loFieldObjs = _.uniq([].concat(localValue));

      let currFieldObjs: O[] = [];

      loFieldObjs.forEach((fo) => {
        if (typeof foreignByField[fo] !== "undefined") {
          currFieldObjs = currFieldObjs.concat(foreignByField[fo]);
        }
      });

      return {
        ...lo,
        [this.options.as]: currFieldObjs,
      };
    });
    return _.compact(result);
  }
}
