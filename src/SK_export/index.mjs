import readLineSync from "readline-sync";
import consMenu from "../utils/consMenu.mjs";
import { createBatchEntitlements } from "./createBatchEntitlements.mjs";
import { prepareBatchFiles } from "./prepareBatchFiles.mjs";
import { db } from "../utils/DBSingleton.mjs";

const stmtBatches = db.prepare(
  `SELECT name,description FROM BatchDescription ORDER BY name`
);
const batches = stmtBatches.all();
if (batches.length) {
  console.log("Batch name: ");
  const theBatchNo = consMenu(
    batches.map((b) => b.name + "\t" + b.description)
  );
  const batchName = batches[theBatchNo].name;
  console.log(batchName);
  const userResp = consMenu(["Renew Entitlements + Export", "Export only"]);
  switch (userResp) {
    case 0:
      createBatchEntitlements(batchName);
    case 1:
      prepareBatchFiles(batchName);
      break;
  }
}
console.log("G'buy");
