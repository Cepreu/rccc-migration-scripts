import { db } from "../utils/DBSingleton.mjs";
import { caseItems } from "./CaseParserDB.mjs";
import configuration from "../../configuration.mjs";

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

const outfile = `/Users/sergiy.krupnov/WORK/DATA/C2C/cases_2022-07-07.sql`;
caseItems(outfile, "2022-07-07 09:51:01");
