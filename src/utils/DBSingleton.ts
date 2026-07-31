import Database from "better-sqlite3";
import configuration from "../../configuration.js";

const db: any = new Database(configuration.DB_DATAFILE, {
  fileMustExist: true,
  readonly: false,
  verbose: configuration.DB_VERBOSE,
});

export { db };
