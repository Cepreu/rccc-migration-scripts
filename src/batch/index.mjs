import readLineSync from "readline-sync";
import { BatchAccounts } from "./BatchAccounts.mjs";
import { batchParametersMenu } from "./batchParametersMenu.mjs";
import consMenu from "../utils/consMenu.mjs";

const userResp = consMenu(["Create New Batch", "Modify Batch"], true);

let batchName;
if (userResp === 1) {
  batchName = readLineSync.question("Batch name: ");
}
const batchDescr = batchParametersMenu(batchName);
const batchAccs = new BatchAccounts(batchDescr);
batchAccs.selectBatchAccounts();

console.log("G'buy");
