import path from "path";
import date from "date-and-time";
import configuration from "../../configuration.mjs";
import { csv2sql } from "../utils/csv2sql.mjs";

export const importCaseReport = () => {
  const fields = [
    {
      field: "IC Case Number",
      dbcolumn: "ICCaseNumber",
      type: "INTEGER",
      pkey: true,
    },
    {
      field: "inContact BU ID",
      dbcolumn: "inContactBUID",
      type: "INTEGER",
    },
    {
      field: "Account (UID)",
      dbcolumn: "UID",
      type: "INTEGER",
    },
    {
      field: "Account Name: Account Name",
      dbcolumn: "AccountName",
    },
    {
      field: "Subject",
      dbcolumn: "Subject",
    },
    {
      field: "Order Number",
      dbcolumn: "OrderNumber",
      type: "INTEGER",
    },
    { field: "Order ID", dbcolumn: "OrderID" },
    { field: "Case Number", dbcolumn: "CaseNumber", type: "INTEGER" },
    { field: "Description", dbcolumn: "Description" },
    { field: "Submitted Date", dbcolumn: "SubmittedDate" },
    {
      field: "Provision Date",
      dbcolumn: "ProvisionDate",
      func: (x) => date.transform(x, "M/D/YYYY", "YYYY-MM-DD"),
    },
    { field: "Order Type", dbcolumn: "OrderType" },
    { field: "Status", dbcolumn: "Status" },
    {
      field: "Opportunity: Opportunity Name",
      dbcolumn: "OpportunityName",
    },
    {
      field: "Brand",
      dbcolumn: "Brand",
    },
    {
      field: "No. of InContact Seats",
      dbcolumn: "NoOfInContactSeats",
      type: "INTEGER",
    },
    {
      field: "Implementation Team",
      dbcolumn: "ImplementationTeam",
    },
    {
      field: "Contact Center Number",
      dbcolumn: "ContactCenterNumber",
    },
    {
      field: "Geo Region",
      dbcolumn: "GeoRegion",
    },
    {
      field: "Default Time Zone",
      dbcolumn: "DefaultTimeZone",
    },
    {
      field: "Created Date",
      dbcolumn: "CreatedDate",
      func: (x) => date.transform(x, "M/D/YYYY", "YYYY-MM-DD"),
    },
    {
      dbcolumn: "DBInserted",
      rowfunc: () => date.format(new Date(), "YYYY-MM-DD HH:mm:ss"),
    },
  ];
  const guardFunc = (row) => row["IC Case Number"] !== "";
  csv2sql("nic_cases", fields, configuration.C2CPATH, ",", guardFunc);
};
