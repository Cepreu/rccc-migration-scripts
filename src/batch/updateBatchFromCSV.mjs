import csv from "csv-parser";
import stripBom from "strip-bom-stream";
import fs from "fs";

import { db } from "../utils/DBSingleton.mjs";

export const batchUpdator = (batchID, csv_file, separator = ",") => {
  const updateSQL = db.prepare(
    `UPDATE BatchAccounts SET EID=?, SpendingLimit=? WHERE batchID=${batchID} AND EID=?`
  );
  const startAccList = 25; // First row in the file with titles
  fs.createReadStream(csv_file)
    .pipe(stripBom())
    .pipe(csv({ separator: separator, from_line: startAccList }))
    .on("data", (row) => {
      console.log(row); ////DELME
      const eid = parseInt(row["ENTERPRISE_ACCOUNT_ID"]);
      if (!isNaN(eid)) {
        const spLim = parseFloat(row["Spending Limit (Multiplier)"]) || null;
        const approved = row["Overall migration approval"] !== "No";
        if (!approved) {
          updateSQL.run(-eid, spLim, eid);
        } else if (spLim) {
          updateSQL.run(eid, spLim, eid);
        }
      }
    })
    .on("end", () => {
      console.log(`${table} successfully processed`);
    });
};
