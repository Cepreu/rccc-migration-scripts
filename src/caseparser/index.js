const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const {caseItems} = require('./CaseParserDB')
const {DATABASE} = require('../configuration')
//const {importCaseReport} = require('./importCaseReport')

let db = new sqlite3.Database(DATABASE);
db.run('CREATE TABLE IF NOT EXISTS nic_case_items (accountID TEXT, BUID TEXT, sfdcCase TEXT, operation TEXT, skuid TEXT, sku TEXT, qtty REAL, price REAL)')
db.close();

//importCaseReport("C2C2021080120220131.csv")

const outfile = '/Users/sergiy.krupnov/Work/cases.sql'
caseItems(outfile, '2022-01-31 15:16:25')
