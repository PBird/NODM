import NeDbCursor from "@seald-io/nedb/lib/cursor";
import Datastore from "@seald-io/nedb";

type CursorOptions = {
  limit?: number;
  skip?: number;
  projection?: { [key: string]: number };
  sort?: { [key: string]: number };
};

export default class Cursor<T> extends NeDbCursor {
  constructor(db: Datastore<T>, query, mapFn, options: CursorOptions) {
    super(db, query, mapFn);
    this._limit = options.limit;
    this._skip = options.skip;
    this._projection = options.projection;
    this._sort = options.sort;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T | null) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return super.then(onfulfilled, onrejected);
  }
}
