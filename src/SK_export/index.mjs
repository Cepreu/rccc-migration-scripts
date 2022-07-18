import readLineSync from "readline-sync";
import consMenu from "../utils/consMenu.mjs";
import { createBatchEntitlements } from "./createBatchEntitlements.mjs";
import { prepareBatchFiles } from "./prepareBatchFiles.mjs";

const batchName = readLineSync.question("Batch name: ");

const userResp = consMenu(["Renew Entitlements + Export", "Export only"]);
switch (userResp) {
  case 0:
    createBatchEntitlements(batchName);
  case 1:
    prepareBatchFiles(batchName);
    break;
}
console.log("G'buy");
