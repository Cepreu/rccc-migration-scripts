import { db } from "../utils/DBSingleton.mjs";
import { caseItems } from "./CaseParserDB.mjs";
import configuration from "../../configuration.mjs";
import consMenu from "../utils/consMenu.mjs";

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS nic_case_items (
        accountID TEXT, 
        BUID TEXT, 
        sfdcCase TEXT, 
        operation TEXT, 
        skuid TEXT, 
        sku TEXT, 
        qtty REAL, 
        price REAL
    )
    `.replace(/\s+/g, " ")
).run();

const stmt = db.prepare(
  `select DBInserted, count(*) as N from nic_cases group by DBInserted order by DBInserted DESC;`
);
const insDates = stmt.all();
if (insDates.length) {
  console.log("Inserting dates: ");
  const choice = consMenu(insDates.map((b) => b.DBInserted + "\t" + b.N));
  const theInsDate = insDates[choice].DBInserted;
  console.log(theInsDate);
  console.log(theInsDate);

  const outfile = `${configuration.C2CPATH}/cases_${theInsDate}.sql`;
  caseItems(outfile, theInsDate);
}
