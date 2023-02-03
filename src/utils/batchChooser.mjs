import { db } from "./DBSingleton.mjs";
import consMenu from "./consMenu.mjs";
import configuration from "../../configuration.mjs";

export default () => {
  const stmtBatches = db.prepare(
    `SELECT name,description FROM BatchDescription ORDER BY name`
  );
  const batches = stmtBatches.all();
  if (batches.length) {
    console.log(`[Active DB: ${configuration.DB_DATAFILE}]`);
    console.log("Batch name: ");
    const theBatchNo = consMenu(batches);
    return batches[theBatchNo].name;
  }
  return null;
};
