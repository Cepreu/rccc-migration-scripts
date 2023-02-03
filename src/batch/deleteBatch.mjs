export default (batchName) => {
  let stmt = db.prepare(`DELETE FROM BatchDescription WHERE name=?`);
  info = stmt.run(batchName);
  console.log(`BatchDescription. Number of rows deleted: ${info.changes}`);

  stmt = db.prepare(`DELETE FROM BatchAccounts WHERE batchID=?`);
  info = stmt.run(batchName);
  console.log(`BatchAccounts. Number of rows deleted: ${info.changes}`);

  stmt = db.prepare(`DELETE FROM BatchEntitlements WHERE batchID=?`);
  info = stmt.run(batchName);
  console.log(`BatchEntitlements. Number of rows deleted: ${info.changes}`);
};
