import { csv2sql } from "../utils/csv2sql.mjs";

export const Entitlements_DWH = (file) => {
  const fields = [
    { field: "USERID", dbcolumn: "USERID" },
    { field: "ID", dbcolumn: "ID", type: "INTEGER", pkey: true },
    { field: "START_DATE", dbcolumn: "START_DATE" },
    { field: "END_DATE", dbcolumn: "END_DATE" },
    { field: "COUNTRY_ID", dbcolumn: "COUNTRY_ID", type: "INTEGER" },
    { field: "COUNTRY_NAME", dbcolumn: "COUNTRY_NAME" },
    { field: "BILLING_ITEM_ID", dbcolumn: "BILLING_ITEM_ID", type: "INTEGER" },
    { field: "EXT_PRODUCT_ID", dbcolumn: "EXT_PRODUCT_ID" },
    { field: "ITEM_NAME", dbcolumn: "ITEM_NAME" },
    { field: "RETAIL_PRICE", dbcolumn: "RETAIL_PRICE", type: "NUMERIC" },
    {
      dbcolumn: "DISCOUNT_VALUE",
      type: "NUMERIC",
      rowfunc: (row) =>
        row["DISCOUNT_TYPE"] === "Currency"
          ? row["DISCOUNT_VALUE"]
          : Number.parseFloat(
              ((row["RETAIL_PRICE"] * row["DISCOUNT_VALUE"]) / 100).toFixed(2)
            ),
    },
    { field: "QNTY_THRESHOLD", dbcolumn: "QNTY_THRESHOLD", type: "NUMERIC" },
    { field: "PRODUCTFAMILY", dbcolumn: "ProductFamily" },
    { field: "STATUS_NAME", dbcolumn: "STATUS_NAME" },
    { field: "MDURATION", dbcolumn: "MDURATION", type: "INTEGER" },
    { field: "CURRENCY_CODE", dbcolumn: "CURRENCY_CODE" },
    { field: "RAMPUP_START", dbcolumn: "RAMPUP_START" },
    { field: "RAMPUP_END", dbcolumn: "RAMPUP_END" },
  ];
  csv2sql("Entitlements_DWH", fields, file);
};
