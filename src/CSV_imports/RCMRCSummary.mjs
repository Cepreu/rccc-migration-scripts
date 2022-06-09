import { csv2sql } from "../utils/csv2sql.mjs";
import configuration from "../../configuration.mjs";

export const RCMRCSummary = () => {
  const yyyymmdd = (s) => new Date(s).toISOString().split("T")[0];

  const fields = [
    {
      field: "Account",
      dbcolumn: "Account",
    },
    {
      field: "Customer",
      dbcolumn: "Customer",
    },
    {
      field: "Address1",
      dbcolumn: "Address1",
    },
    {
      field: "Address2",
      dbcolumn: "Address2",
    },
    {
      field: "City",
      dbcolumn: "City",
    },
    {
      field: "State",
      dbcolumn: "State",
    },
    {
      field: "ZipCode",
      dbcolumn: "ZipCode",
    },
    {
      field: "Invoice",
      dbcolumn: "Invoice",
      pkey: true,
    },
    {
      field: "BillingPeriodStart",
      dbcolumn: "BillingPeriodStart",
      func: (x) => yyyymmdd(x),
    },
    {
      field: "BillingPeriodEnd",
      dbcolumn: "BillingPeriodEnd",
      func: (x) => yyyymmdd(x),
    },
    {
      field: "InvoiceDate",
      dbcolumn: "InvoiceDate",
      pkey: false,
      func: (x) => yyyymmdd(x),
    },
    {
      field: "DueDate",
      dbcolumn: "DueDate",
      func: (x) => yyyymmdd(x),
    },
    {
      field: "ProductType",
      dbcolumn: "ProductType",
    },
    {
      field: "CatalogID",
      dbcolumn: "CatalogID",
    },
    {
      field: "FeatureID",
      dbcolumn: "FeatureID",
    },
    {
      field: "FeatureDetailID",
      dbcolumn: "FeatureDetailID",
    },
    {
      field: "Product",
      dbcolumn: "Product",
      pkey: true,
    },
    {
      field: "Quantity",
      dbcolumn: "Quantity",
    },
    {
      field: "Amount",
      dbcolumn: "Amount",
    },
  ];
  csv2sql(
    "RCMRCSummary",
    fields,
    configuration.DWH_RCMRCSUMMARY,
    configuration.DWH_RCMRCSUMMARY_SEP || "|"
  );
};
