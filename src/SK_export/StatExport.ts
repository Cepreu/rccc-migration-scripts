import { BatchDescription } from "../batch/BatchDescription.js";
import { Export2Excel } from "../utils/write2file.js";
import { Rule } from "./RuleEngine.js";
import type { DataRows } from "../types.js";
import type { LogEntry } from "./Logger.js";

export class StatExport extends Export2Excel {
  constructor(pathArr: string[], batchName: string) {
    super(
      [
        {
          tab: "Accounts",
          columns: [
            "ENTERPRISE_ACCOUNT_ID",
            "INCONTACT_BUID",
            "BILLING_ACCOUNT_ID",
            "AccountName",
            "BRANDNAME",
            "CURRENCY",
            "BILLING_TERM",
            "No.ofInContactSeats",
            "ContactCenterMRR",
            "totalMRR",
            "Error",
            "SpendingLimit",
            "Revenue Team",
            "Revenue Comments",
            "Billing Team",
            "Billing  Comments",
            "Overall Migration Approval",
          ],
          gap: 25, //header lines to be inserted manually
        },
        {
          tab: "Batch Selectors",
          columns: ["Parameter", "Value"],
        },
        {
          tab: "ErrsAndWarns",
          columns: ["severity", "rule", "issue", "account"],
        },
        {
          tab: "Rules",
          columns: ["Rule", "Description"],
        },
      ],
      pathArr,
      "batch_description"
    );

    this.#addBatchData(batchName);
  }

  #addBatchData(batchname: string) {
    const batchObj = BatchDescription.restoreFromDB(batchname);
    if (!batchObj) {
      throw new Error(`Batch description not found: ${batchname}`);
    }
    const batchInfo = [
      { Parameter: "Batch Name", Value: batchObj.name },
      { Parameter: "Batch Description", Value: batchObj.description },
      { Parameter: "Max Seats", Value: batchObj.accSizeMax },
      { Parameter: "Brand", Value: batchObj.brand },
      { Parameter: "Telco Provider", Value: batchObj.telcoProvider },
      { Parameter: "Seat Editions", Value: batchObj.seatEdition },
      {
        Parameter: "Account List",
        Value: JSON.stringify(batchObj.accountList),
      },
      { Parameter: "Cases Min", Value: batchObj.casesMin },
      { Parameter: "Cases Max", Value: batchObj.casesMax },
      { Parameter: "NBU Case available", Value: batchObj.casesNBU },
      { Parameter: "Batch Size", Value: batchObj.maxSize },
      {
        Parameter: "Max ContactCenter MRR",
        Value: batchObj.maxContactCenterMRR,
      },
      { Parameter: "Max Total MRR", Value: batchObj.maxTotalMRR },
      { Parameter: "Payment Plan", Value: batchObj.PaymentPlan },
      // {
      //   Parameter: "Account Payment Method",
      //   Value: batchObj.AccountPaymentMethod,
      // },
    ];
    super.appendData([{ tab: "Batch Selectors", data: batchInfo }]);
    super.appendData([{ tab: "Rules", data: Rule.GetDescriptions() }]);
  }

  appendData(accInfo: DataRows, errsAndWarnings: LogEntry[] = []) {
    super.appendData([
      { tab: "Accounts", data: accInfo },
      { tab: "ErrsAndWarns", data: errsAndWarnings },
    ]);
  }
}
