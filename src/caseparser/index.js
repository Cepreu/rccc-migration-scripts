const {caseItems} = require('./CaseParserDB')
const {DATABASE} = require('../configuration')
const db = require('better-sqlite3')(DATABASE, { verbose: console.log, fileMustExist: true, readonly: false})

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

//importCaseReport("C2C2021080120220131.csv")

const outfile = '~/Work/cases.sql'
caseItems(outfile, '2022-01-31 15:16:25')
