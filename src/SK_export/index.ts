import batchChooser from "../utils/batchChooser.js";
import consMenu from "../utils/consMenu.js";
import { createBatchEntitlements } from "./createBatchEntitlements.js";
import { prepareBatchFiles } from "./prepareBatchFiles.js";
import { Invoice } from "./Invoice.js";

const batchName = batchChooser();
if (batchName) {
  console.log(batchName);

  const bmi = consMenu(Invoice.invoiceDates);
  if (bmi !== undefined) {
    const billingMonth = Invoice.invoiceDates[bmi].BILLING_MONTH;
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
}
console.log("G'buy");
