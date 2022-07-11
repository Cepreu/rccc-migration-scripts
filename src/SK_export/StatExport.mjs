import { Export2Excel } from "../utils/write2file.mjs";

export class StatExport extends Export2Excel {
  constructor(pathArr, fileName) {
    super(
      [
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
            "VALID",
          ],
        },
        {
          tab: "ErrsAndWarns",
          columns: ["severity", "rule", "issue", "account"],
        },
      ],
      pathArr,
      fileName
    );
  }

  appendData(accInfo, errsAndWarnings) {
    super.appendData([
      { tab: "Accounts", data: accInfo },
      { tab: "ErrsAndWarns", data: errsAndWarnings },
    ]);
  }
}
