export { getClient } from "./clients";
import { NeDbClient, NeDbClientOptions } from "./clients/NedbClient";
export { CollectionModel } from "./types";

export function connect(url: string, options: NeDbClientOptions) {
  if (url.indexOf("nedb://") > -1) {
    // url example: nedb://path/to/file/folder
    const db = NeDbClient.connect(url, options);
    global.CLIENT = db;
  } else {
    return new Error("Unrecognized DB connection url.");
  }
}
