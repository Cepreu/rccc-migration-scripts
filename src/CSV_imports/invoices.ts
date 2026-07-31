import { csv2sql } from "../utils/csv2sql.js";
import { yyyymmdd } from "../utils/conversions.js";

export const Invoices = (csv_file) => {
  const fieldDescs = [
    { field: "CCBID", dbcolumn: "CCBID", type: "TEXT" },
    { field: "USERID", dbcolumn: "USERID", type: "TEXT", pkey: true },
    { field: "INC_ACCOUNTID", dbcolumn: "INC_ACCOUNTID", type: "TEXT" },
    { field: "BRANDID", dbcolumn: "BRANDID", type: "TEXT" },
    { field: "BRANDNAME", dbcolumn: "BRANDNAME", type: "TEXT" },
    { field: "SERVICELEVEL", dbcolumn: "SERVICELEVEL", type: "TEXT" },
    { field: "ACCOUNTSTATUSID", dbcolumn: "ACCOUNTSTATUSID", type: "TEXT" },
    {
      field: "BILLING_MONTH",
      dbcolumn: "BILLING_MONTH",
      type: "TEXT",
      pkey: true,
      func: (x) => yyyymmdd(x),
    },
    { field: "BILLING_DATE", dbcolumn: "BILLING_DATE", type: "TEXT" },
    { field: "CURRENCYID", dbcolumn: "CURRENCYID", type: "TEXT" },
    { field: "TOTAL_AMOUNT", dbcolumn: "TOTAL_AMOUNT", type: "TEXT" },
    { field: "ADMINID", dbcolumn: "ADMINID", type: "TEXT" },
    { field: "TS_INSERTED", dbcolumn: "TS_INSERTED", type: "TEXT" },
    { field: "TS_UPDATED", dbcolumn: "TS_UPDATED", type: "TEXT" },
    {
      field: "PLAN_PAYMENTTYPEID",
      dbcolumn: "PLAN_PAYMENTTYPEID",
      type: "TEXT",
    },
  ];
  csv2sql({ table: "invoices", fieldDescs, csv_file });
};

export const InvoiceLines = (csv_file) => {
  const fieldDescs = [
    { field: "CCBID", dbcolumn: "CCBID", type: "INTEGER" },
    { field: "USERID", dbcolumn: "USERID", type: "INTEGER", pkey: true },
    { field: "INC_ACCOUNTID", dbcolumn: "INC_ACCOUNTID", type: "INTEGER" },
    { field: "BRANDID", dbcolumn: "BRANDID", type: "INTEGER" },
    { field: "BRANDNAME", dbcolumn: "BRANDNAME", type: "TEXT" },
    {
      field: "BILLING_MONTH",
      dbcolumn: "BILLING_MONTH",
      type: "TEXT",
      pkey: true,
      func: (x) => yyyymmdd(x),
    },
    { field: "BILLING_DATE", dbcolumn: "BILLING_DATE", type: "TEXT" },
    { field: "TOTAL_AMOUNT", dbcolumn: "TOTAL_AMOUNT", type: "NUMBER" },
    { field: "EXT_PRODUCT_ID", dbcolumn: "EXT_PRODUCT_ID", type: "TEXT" },
    { field: "NSBID", dbcolumn: "NSBID", type: "INTEGER" },
    { field: "BILLINGITEMID", dbcolumn: "BILLINGITEMID", type: "INTEGER" },
    { field: "CCBITEMID", dbcolumn: "CCBITEMID", type: "INTEGER" },
    { field: "ITEMNAME", dbcolumn: "ITEMNAME", type: "TEXT" },
    {
      field: "ENTITLEMENT_LOG_ID",
      dbcolumn: "ENTITLEMENT_LOG_ID",
      type: "INTEGER",
      pkey: true,
    },
    { field: "ITEM_PRICE", dbcolumn: "ITEM_PRICE", type: "NUMBER" },
    { field: "QUANTITY", dbcolumn: "QUANTITY", type: "NUMBER" },
    { field: "ITEM_DISC", dbcolumn: "ITEM_DISC", type: "NUMBER" },
    { field: "AMOUNT", dbcolumn: "AMOUNT", type: "NUMBER" },
    { field: "TAX_TRANS_TYPE", dbcolumn: "TAX_TRANS_TYPE", type: "TEXT" },
    { field: "TAX_SVC_TYPE", dbcolumn: "TAX_SVC_TYPE", type: "TEXT" },
    { field: "TAX_AMOUNT", dbcolumn: "TAX_AMOUNT", type: "NUMBER" },
    { field: "VSOE_PRICE", dbcolumn: "VSOE_PRICE", type: "NUMBER" },
  ];
  csv2sql({ table: "invoiceLines", fieldDescs, csv_file });
};
