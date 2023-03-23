import { db } from "./DBSingleton.mjs";
import consMenu from "./consMenu.mjs";
import configuration from "../../configuration.mjs";

export default () => {
  let selectedBatch;
  const stmtBatches = db.prepare(
    `SELECT name,description FROM BatchDescription ORDER BY name`
  );
  const batches = stmtBatches.all();
  if (batches.length) {
    console.log(`[Active DB: ${configuration.DB_DATAFILE}]`);
    console.log("Batch name: ");
    const theBatchNo = consMenu(batches);
    if (theBatchNo !== undefined) selectedBatch = batches[theBatchNo].name;
  }
  console.log(`choosed: ${selectedBatch}`);
  return selectedBatch;
};
