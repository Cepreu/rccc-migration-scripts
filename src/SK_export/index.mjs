import readLineSync from "readline-sync";
import { createBatchEntitlements } from "./createBatchEntitlements.mjs";
import { prepareBatchFiles } from "./prepareBatchFiles.mjs";

const batchName = readLineSync.question("Batch name: ");
console.log("1) Renew Entitlements + Export");
console.log("2) Export only");

const userRes = readLineSync.question("Pick an option: ");
switch (userRes) {
  case "1":
    createBatchEntitlements(batchName);
  case "2":
    prepareBatchFiles(batchName);
    break;
}
console.log("G'buy");
