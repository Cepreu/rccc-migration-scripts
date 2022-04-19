import { csv2sql } from "../utils/csv2sql.mjs";
import configuration from "../../configuration.mjs";

export const CatalogNGBS = () => {
  const fields = [
    {
      field: "L Category",
      dbcolumn: "L_CATEGORY",
      type: "TEXT",
      pkey: true,
      rowfunc: (row) => ["CCL", row["L Category"], row["Number"]].join("_"),
    },
    {
      dbcolumn: "FEATURE_ID",
      type: "TEXT",
      pkey: true,
      rowfunc: (row) => ["CCL", row["L Category"], row["Number"]].join("_"),
    },
    { field: "Licenses", dbcolumn: "LICENSE", type: "TEXT", pkey: true },
    { field: "License Type", dbcolumn: "LISENSE_TYPE", type: "TEXT" },
    { field: "Tax category_USD", dbcolumn: "TAX_CATEGORY", type: "TEXT" },
    {
      field: "Named (USD)",
      dbcolumn: "PRICE_USD",
      type: "NUMERIC",
      pkey: false,
      func: (x) => Number(x.replace(/[^0-9.-]+/g, "")),
    },
    {
      field: "Named (CAD)",
      dbcolumn: "PRICE_CAD",
      type: "NUMERIC",
      pkey: false,
      func: (x) => Number(x.replace(/[^0-9.-]+/g, "")),
    },
    { field: "Parent", dbcolumn: "PARENT_FEATURE_ID", type: "TEXT" },
  ];
  const guardFunc = (row) => row["L Category"] !== "";
  csv2sql(
    "CatalogNGBS",
    fields,
    configuration.NGBS_CATALOG,
    ",",
    guardFunc,
    true
  );
};

export const CatalogSFDC = () => {
  const fields = [
    {
      field: "License Category",
      dbcolumn: "L_CATEGORY",
      type: "TEXT",
      pkey: true,
    },
    { field: "ProductName", dbcolumn: "PRODUCT_NAME", type: "TEXT" },
    { field: "ProductFamily", dbcolumn: "PRODUCT_FAMILY", type: "TEXT" },
    { field: "Parent", dbcolumn: "PARENT", type: "TEXT" },
    {
      field: "Price",
      dbcolumn: "PRICE_USD",
      type: "NUMERIC",
      pkey: false,
      func: (x) => Number(x.replace(/[^0-9.-]+/g, "")),
    },
    {
      field: "CAD",
      dbcolumn: "PRICE_CAD",
      type: "NUMERIC",
      pkey: false,
      func: (x) => Number(x.replace(/[^0-9.-]+/g, "")),
    },
    { field: "SKU", dbcolumn: "SKU", type: "TEXT" },
    { field: "NiC Name", dbcolumn: "NIC_NAME", type: "TEXT" },
    {
      field: "NiC Price",
      dbcolumn: "NIC_PRICE",
      type: "NUMERIC",
      pkey: false,
      func: (x) => Number(x.replace(/[^0-9.-]+/g, "")),
    },
  ];
  const guardFunc = (row) => row["License Category"] !== "";
  csv2sql(
    "CatalogSFDC",
    fields,
    configuration.SFDC_CATALOG,
    ",",
    guardFunc,
    true
  );
};
