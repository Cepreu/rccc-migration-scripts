import csv from "csv-parser";
import stripBom from "strip-bom-stream";
import fs from "fs";
import path from "path";
import configuration from "../../configuration.mjs";
import { db } from "../utils/DBSingleton.mjs";

export const batchUpdator = (batchID) => {
  const separator = ",";
  const csv_file = path.resolve(
    configuration.OUTPUTPATH,
    batchID,
    "Accounts.csv"
  );

  const updateSQL = db.prepare(
    `UPDATE BatchAccounts SET batchID=?, SpendingLimit=? WHERE batchID='${batchID}' AND EID=?`
  );
  const startAccList = 24; // First row in the file with titles
  fs.createReadStream(csv_file)
    .pipe(stripBom())
    .pipe(csv({ separator: separator, skipLines: startAccList }))
    .on("data", (row) => {
      const eid = row["ENTERPRISE_ACCOUNT_ID"];
      if (!isNaN(parseInt(eid))) {
        const spLim = parseFloat(row["SpendingLimit"]) || 1.5;
        const approved = row["Overall Migration Approval"] !== "No";
        if (!approved) {
          updateSQL.run("__" + batchID, spLim, eid);
        } else if (spLim) {
          updateSQL.run(eid, spLim, eid);
        }
      }
    })
    .on("end", () => {
      console.log(`${batchID} successfully processed`);
    });
};
