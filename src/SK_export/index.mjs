import batchChooser from "../utils/batchChooser.mjs";
import consMenu from "../utils/consMenu.mjs";
import { createBatchEntitlements } from "./createBatchEntitlements.mjs";
import { prepareBatchFiles } from "./prepareBatchFiles.mjs";
import { Invoice } from "./Invoice.mjs";

const batchName = batchChooser();
if (batchName) {
  console.log(batchName);

  const billingMonth = consMenu(Invoice.invoiceDates);
  console.log(billingMonth);

  const userResp = consMenu(["Renew Entitlements + Export", "Export only"]);
  switch (userResp) {
    case 0:
      createBatchEntitlements(batchName, billingMonth);
    case 1:
      prepareBatchFiles(batchName, billingMonth);
      break;
  }
}
console.log("G'buy");
