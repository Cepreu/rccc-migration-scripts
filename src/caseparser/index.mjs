import {db} from '../utils/DBSingleton.mjs'
import {caseItems} from './CaseParserDB.mjs'
import {importCaseReport} from './importCaseReport.mjs'

db.prepare(`
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
    `.replace(/\s+/g, " "))
    .run()

importCaseReport()

const outfile = '/Users/sergiy.krupnov/WORK/DATA/C2C/cases.sql'
caseItems(outfile)
//caseItems(outfile, '2022-01-31 15:16:25')
