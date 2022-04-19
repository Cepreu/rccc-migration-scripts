import readLineSync from "readline-sync";
import { createBatchEntitlementsSFDC as createBatchEntitlements } from "./createBatchEntitlements.mjs";
import { prepareBatchFiles } from "./prepareBatchFiles.mjs";

const batchName = readLineSync.question("Batch name: ");
console.log("1) Renew Entitlements + Export");
console.log("2) Export only");

const userRes = readLineSync.question("Pick an option: ");
if (userRes === "1") {
  createBatchEntitlements(batchName);
} else if (userRes === "2") {
  prepareBatchFiles(batchName);
}
console.log("G'buy");
