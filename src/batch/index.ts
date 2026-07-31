import batchChooser from "../utils/batchChooser.js";
import deleteBatch from "./deleteBatch.js";
import { BatchAccounts } from "./BatchAccounts.js";
import { batchParametersMenu } from "./batchParametersMenu.js";
import { batchUpdator } from "./updateBatchFromCSV.js";
import consMenu from "../utils/consMenu.js";

const userResp = consMenu(
  ["Create New Batch", "Modify Batch", "Delete Batch", "Update Batch"],
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
    if (batchName) {
      console.log(`Are you sure you want to delete "${batchName}"?`);
      if (1 === consMenu(["No", "Yes"], false)) deleteBatch(batchName);
    }
    break;
  case 3:
    batchName = batchChooser();
    if (batchName) {
      batchUpdator(batchName);
    }
    break;
  default:
    break;
}
console.log("G'buy");
