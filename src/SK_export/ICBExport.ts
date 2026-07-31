import { Export2Excel } from "../utils/write2file.js";
import type { DataRows } from "../types.js";

export class ICBExport extends Export2Excel {
  constructor(pathArr: string[], fileName: string) {
    super(
      [
        {
          tab: "Accounts",
          columns: [
            "ENTERPRISE_ACCOUNT_ID",
            "BILLING_ACCOUNT_ID",
            "ACCT_BRANDID",
            "BRANDNAME",
            "CURRENCY",
            "INCONTACT_BUID",
            "PACKAGE_ID",
            "BILLING_TERM",
            "SPENDING_LIMIT",
            "No.ofInContactSeats",
            "ContactCenterNumber",
            "DefaultTimeZone",
            "GeoRegion",
            "ImplementationTeam",
            "ContactCenterMRR",
            "totalMRR",
            "phone",
            "email",
            "Contract Term",
            "Contract Start date",
            "Renewal Term",
            "Auto Renewal",
          ],
        },
        {
          tab: "Entitlements",
          columns: [
            "ENTERPRISE_ACCOUNT_ID",
            "ID",
            "START_DATE",
            "END_DATE",
            "COUNTRY_ID",
            "COUNTRY_NAME",
            "BILLING_ITEM_ID",
            "EXT_PRODUCT_ID",
            "ITEM_NAME",
            "RETAIL_PRICE",
            "DISCOUNT_TYPE",
            "DISCOUNT_VALUE",
            "DISCOUNT",
            "QNTY_THRESHOLD",
            "TYPE_NAME",
            "STATUS_NAME",
          ],
        },
        {
          tab: "RCMRCSummary_",
          columns: [
            "Account",
            "Customer",
            "Address1",
            "Address2",
            "City",
            "State",
            "ZipCode",
            "Invoice",
            "BillingPeriodStart",
            "BillingPeriodEnd",
            "InvoiceDate",
            "DueDate",
            "ProductType",
            "CatalogID",
            "FeatureID",
            "FeatureDetailID",
            "Product",
            "Quantity",
            "Amount",
          ],
        },
        {
          tab: "CasesData",
          columns: ["accountID", "BUID", "skuid", "sku", "qtty", "price"],
        },
      ],
      pathArr,
      fileName
    );
  }
  appendData(
    accInfo: DataRows,
    entitlements: DataRows = [],
    cases: DataRows = [],
    monthlyData: DataRows = []
  ) {
    super.appendData([
      { tab: "Accounts", data: accInfo },
      { tab: "Entitlements", data: entitlements },
      { tab: "RCMRCSummary_", data: monthlyData },
      { tab: "CasesData", data: cases },
    ]);
  }
}
