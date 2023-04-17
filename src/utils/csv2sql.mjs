import csv from "csv-parser";
import stripBom from "strip-bom-stream";
import fs from "fs";

import { db } from "./DBSingleton.mjs";

export const csv2sql = (
  table,
  fieldDescs,
  csv_file,
  separator = ",",
  guardFunc,
  dropTable = false
) => {
  const crtTblFlds = fieldDescs.map(
    (x) => x.dbcolumn + " " + (x.type || "TEXT")
  );
  const crtTblPKeys = fieldDescs
    .filter((x) => x.pkey)
    .map((y) => y.dbcolumn)
    .join(",");
  if (crtTblPKeys) crtTblFlds.push(`PRIMARY KEY(${crtTblPKeys})`);

  if (dropTable) {
    db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
  }
  db.prepare(
    `CREATE TABLE IF NOT EXISTS ${table} (${crtTblFlds.join(",")})`
  ).run();

  const fldNames = fieldDescs.map((x) => x.dbcolumn).join(",");
  const qtnMarks = fieldDescs.map((x) => "?").join(",");
  const req = `INSERT OR IGNORE INTO ${table} (${fldNames}) VALUES (${qtnMarks})`;
  const stmt = db.prepare(req);

  fs.createReadStream(csv_file)
    .pipe(stripBom())
    .pipe(csv({ separator: separator }))
    .on("data", (row) => {
      const reqParams = fieldDescs.map((fd) => {
        if ("field" in fd) {
          return row[fd.field]
            ? "func" in fd
              ? fd.func(row[fd.field])
              : row[fd.field]
            : null;
        }
        return "rowfunc" in fd ? fd.rowfunc(row) : null;
      });
      if (guardFunc === undefined || guardFunc(row)) {
        stmt.run(...reqParams);
      }
    })
    .on("end", () => {
      console.log(`${table} successfully processed`);
    });
};
