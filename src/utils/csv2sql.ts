import csv from "csv-parser";
import stripBom from "strip-bom-stream";
import fs from "fs";

import { db } from "./DBSingleton.js";
import type { DataRow } from "../types.js";

interface CsvFieldDescriptor {
  dbcolumn: string;
  field?: string;
  type?: string;
  pkey?: boolean;
  func?: (value: string) => unknown;
  rowfunc?: (row: DataRow) => unknown;
}

interface CsvImportOptions {
  table: string;
  fieldDescs: CsvFieldDescriptor[];
  csv_file: string;
  separator?: string;
  guardFunc?: (row: DataRow) => boolean;
  dropTable?: boolean;
}

const SQL_COLUMN_TYPES = new Set(["TEXT", "INTEGER", "NUMERIC", "NUMBER"]);

const quoteIdentifier = (identifier: string): string => {
  if (/^"[^"]+"$/.test(identifier)) return identifier;
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`);
  }
  return `"${identifier}"`;
};

const columnDefinition = ({ dbcolumn, type = "TEXT" }: CsvFieldDescriptor) => {
  const normalizedType = type.toUpperCase();
  if (!SQL_COLUMN_TYPES.has(normalizedType)) {
    throw new Error(`Unsupported SQL column type: ${type}`);
  }
  return `${quoteIdentifier(dbcolumn)} ${normalizedType}`;
};

export const csv2sql = ({
  table,
  fieldDescs,
  csv_file,
  separator = ",",
  guardFunc,
  dropTable = false,
}: CsvImportOptions): void => {
  const tableName = quoteIdentifier(table);
  const backupTableName = quoteIdentifier(`${table}_backup`);
  const crtTblFlds = fieldDescs.map(columnDefinition);
  const crtTblPKeys = fieldDescs
    .filter((x) => x.pkey)
    .map((y) => quoteIdentifier(y.dbcolumn))
    .join(",");
  if (crtTblPKeys) crtTblFlds.push(`PRIMARY KEY(${crtTblPKeys})`);

  if (dropTable) {
    db.prepare(`DROP TABLE IF EXISTS ${backupTableName}`).run();
    if (
      db
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
        .all(table).length > 0
    ) {
      db.prepare(`ALTER TABLE ${tableName} RENAME TO ${backupTableName};`).run();
    }
  }
  db.prepare(
    `CREATE TABLE IF NOT EXISTS ${tableName} (${crtTblFlds.join(",")})`
  ).run();

  const fldNames = fieldDescs.map((x) => quoteIdentifier(x.dbcolumn)).join(",");
  const qtnMarks = fieldDescs.map((x) => "?").join(",");
  const req = `INSERT OR IGNORE INTO ${tableName} (${fldNames}) VALUES (${qtnMarks})`;
  const stmt = db.prepare(req);

  fs.createReadStream(csv_file)
    .pipe(stripBom())
    .pipe(csv({ separator: separator }))
    .on("data", (row) => {
      const reqParams = fieldDescs.map((fd) => {
        if ("field" in fd) {
          const value = row[fd.field];
          return value !== "" && value !== undefined && value !== null
            ? fd.func
              ? fd.func(value)
              : value
            : null;
        }
        return fd.rowfunc ? fd.rowfunc(row) : null;
      });
      if (guardFunc === undefined || guardFunc(row)) {
        stmt.run(...reqParams);
      }
    })
    .on("end", () => {
      console.log(`${table} successfully processed`);
    });
};
