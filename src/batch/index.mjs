import batchChooser from "../utils/batchChooser.mjs";
import deleteBatch from "./deleteBatch.mjs";
import { BatchAccounts } from "./BatchAccounts.mjs";
import { batchParametersMenu } from "./batchParametersMenu.mjs";
import consMenu from "../utils/consMenu.mjs";

const userResp = consMenu(
  ["Create New Batch", "Modify Batch", "Delete batch"],
  true
);

let batchName;
switch (userResp) {
  case 1:
    batchName = batchChooser();
  case 0:
    const batchDescr = batchParametersMenu(batchName);
    const batchAccs = new BatchAccounts(batchDescr);
    batchAccs.selectBatchAccounts();
    break;
  case 2:
    batchName = batchChooser();
    console.log(`Are you sure you want to delete "${batchName}"?`);
    if (1 === consMenu(["No", "Yes"], false)) deleteBatch(batchName);
    break;
  default:
    break;
}
console.log("G'buy");
