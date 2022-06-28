import { db } from "../utils/DBSingleton.mjs";
import { caseItems } from "./CaseParserDB.mjs";
//import {importCaseReport} from '../CSV_imports/importCaseReport.mjs'

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

//importCaseReport();

const outfile = "/Users/sergiy.krupnov/WORK/DATA/C2C/cases_2022-06-17.sql";
caseItems(outfile, "2022-06-17 16:31:17");
