import { BatchDescription } from "../batch/BatchDescription.mjs";
import { Export2Excel } from "../utils/write2file.mjs";
import { Rule } from "./RuleEngine.mjs";

export class StatExport extends Export2Excel {
  constructor(pathArr, batchName) {
    super(
      [
        {
          tab: "Batch Selectors",
          columns: ["Parameter", "Value"],
        },
        {
          tab: "Accounts",
          columns: [
            "ENTERPRISE_ACCOUNT_ID",
            "INCONTACT_BUID",
            "BILLING_ACCOUNT_ID",
            "AccountName",
            "batchID",
            "BRANDNAME",
            "CURRENCY",
            "BILLING_TERM",
            "CATALOG",
            "No.ofInContactSeats",
            "ContactCenterMRR",
            "totalMRR",
            "Error",
          ],
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
