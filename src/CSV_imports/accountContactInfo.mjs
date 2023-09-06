import { csv2sql } from "../utils/csv2sql.mjs";

export const importAccountContactInfo = (csv_file) => {
  const fieldDescs = [
    { field: "ID", dbcolumn: "EID", pkey: true },
    { field: "EMAIL", dbcolumn: "email" },
    { field: "PHONE", dbcolumn: "phone" },
  ];
  const guardFunc = (row) => !!row["EMAIL"] && !!row["PHONE"];
  csv2sql({
    table: "account_contact_info",
    fieldDescs,
    csv_file,
    dropTable: true,
    guardFunc,
  });
};
