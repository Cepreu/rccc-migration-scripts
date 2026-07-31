import { csv2sql } from "../utils/csv2sql.js";

export const Entitlements_DWH = (csv_file) => {
  const fieldDescs = [
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
      dbcolumn: "DISCOUNT",
      type: "NUMERIC",
      rowfunc: (row) =>
        row["DISCOUNT_TYPE"] === "Percentage"
          ? Number.parseFloat(
              ((row["RETAIL_PRICE"] * row["DISCOUNT_VALUE"]) / 100).toFixed(2)
            )
          : row["DISCOUNT_VALUE"],
    },
    { field: "DISCOUNT_TYPE", dbcolumn: "DISCOUNT_TYPE" },
    { field: "DISCOUNT_VALUE", dbcolumn: "DISCOUNT_VALUE", type: "NUMERIC" },
    { field: "QNTY_THRESHOLD", dbcolumn: "QNTY_THRESHOLD", type: "NUMERIC" },
    { field: "PRODUCTFAMILY", dbcolumn: "ProductFamily" },
    { field: "STATUS_NAME", dbcolumn: "STATUS_NAME" },
    { field: "MDURATION", dbcolumn: "MDURATION", type: "INTEGER" },
    { field: "CURRENCY_CODE", dbcolumn: "CURRENCY_CODE" },
    { field: "RAMPUP_START", dbcolumn: "RAMPUP_START" },
    { field: "RAMPUP_END", dbcolumn: "RAMPUP_END" },
  ];
  csv2sql({ table: "Entitlements_DWH", fieldDescs, csv_file, dropTable: true });
};
