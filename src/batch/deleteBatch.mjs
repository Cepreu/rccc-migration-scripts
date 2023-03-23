import { db } from "../utils/DBSingleton.mjs";

export default (batchName) => {
  let stmt = db.prepare(`DELETE FROM BatchDescription WHERE name=?`);
  const info1 = stmt.run(batchName);
  console.log(`BatchDescription. Number of rows deleted: ${info1.changes}`);

  stmt = db.prepare(`DELETE FROM BatchAccounts WHERE batchID=?`);
  const info2 = stmt.run(batchName);
  console.log(`BatchAccounts. Number of rows deleted: ${info2.changes}`);

  stmt = db.prepare(`DELETE FROM BatchEntitlements WHERE batchID=?`);
  const info3 = stmt.run(batchName);
  console.log(`BatchEntitlements. Number of rows deleted: ${info3.changes}`);

  // Delete directory == TBD
};
