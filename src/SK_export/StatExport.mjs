import { BatchDescription } from "../batch/BatchDescription.mjs";
import { Export2Excel } from "../utils/write2file.mjs";
import { Rule } from "./RuleEngine.mjs";

export class StatExport extends Export2Excel {
  constructor(pathArr, batchName) {
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

  #addBatchData(batchname) {
    const batchObj = BatchDescription.restoreFromDB(batchname);
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
    ];
    super.appendData([{ tab: "Batch Selectors", data: batchInfo }]);
    super.appendData([{ tab: "Rules", data: Rule.GetDescriptions() }]);
  }

  appendData(accInfo, errsAndWarnings) {
    super.appendData([
      { tab: "Accounts", data: accInfo },
      { tab: "ErrsAndWarns", data: errsAndWarnings },
    ]);
  }
}
