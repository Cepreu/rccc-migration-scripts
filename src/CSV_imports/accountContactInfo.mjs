import { csv2sql } from "../utils/csv2sql.mjs";

export const importAccountContactInfo = (csv_file) => {
  const fieldDescs = [
    { field: "User ID", dbcolumn: "EID", pkey: true },
    {
      field: "Primary Recipient",
      dbcolumn: "email",
      rowfunc: (row) => row["Primary Recipient"].split("; ")[0],
    },
    {
      dbcolumn: "phone",
      rowfunc: (row) => row["Phone Number"].trim(),
    },
  ];
  const guardFunc = (row) =>
    !!row["Primary Recipient"] && !!row["Phone Number"].trim();
  csv2sql({
    table: "account_contact_info",
    fieldDescs,
    csv_file,
    dropTable: true,
    guardFunc,
  });
};
