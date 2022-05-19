import { csv2sql } from "../utils/csv2sql.mjs";
import configuration from "../../configuration.mjs";

export const Entitlements_DWH = () => {
  const fields = [
    { field: "USERID", dbcolumn: "USERID", type: "TEXT" },
    { field: "ID", dbcolumn: "ID", type: "INTEGER", pkey: true },
    { field: "START_DATE", dbcolumn: "START_DATE", type: "TEXT" },
    { field: "END_DATE", dbcolumn: "END_DATE", type: "TEXT" },
    { field: "COUNTRY_ID", dbcolumn: "COUNTRY_ID", type: "INTEGER" },
    { field: "COUNTRY_NAME", dbcolumn: "COUNTRY_NAME", type: "TEXT" },
    { field: "BILLING_ITEM_ID", dbcolumn: "BILLING_ITEM_ID", type: "INTEGER" },
    { field: "EXT_PRODUCT_ID", dbcolumn: "EXT_PRODUCT_ID", type: "TEXT" },
    { field: "ITEM_NAME", dbcolumn: "ITEM_NAME", type: "TEXT" },
    { field: "RETAIL_PRICE", dbcolumn: "RETAIL_PRICE", type: "NUMERIC" },
    { field: "DISCOUNT_VALUE", dbcolumn: "DISCOUNT_VALUE", type: "NUMERIC" },
    { field: "QNTY_THRESHOLD", dbcolumn: "QNTY_THRESHOLD", type: "NUMERIC" },
    { field: "PRODUCTFAMILY", dbcolumn: "ProductFamily", type: "TEXT" },
    { field: "STATUS_NAME", dbcolumn: "STATUS_NAME", type: "TEXT" },
    { field: "MDURATION", dbcolumn: "MDURATION", type: "INTEGER" },
    { field: "CURRENCY_CODE", dbcolumn: "CURRENCY_CODE", type: "TEXT" },
    { field: "RAMPUP_START", dbcolumn: "RAMPUP_START", type: "TEXT" },
    { field: "RAMPUP_END", dbcolumn: "RAMPUP_END", type: "TEXT" },
  ];
  csv2sql("Entitlements_DWH", fields, configuration.DWH_ENTITLEMENTS);
};
