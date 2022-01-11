const { Console } = require('console')
const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const {insertCase} = require('./CaseParser')
const {caseItems} = require('./CaseParserDB')
const {DATABASE} = require('../configuration')

function fromFiles() {
    const directoryPath = '../accounts/NEW/'
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory: ' + err)
        }
        files.forEach( f => {
            if (/[\d_]+/.test(f)) {
                insertCase(path.join(directoryPath, f))
            }
        })
    })
}

let db = new sqlite3.Database(DATABASE);
db.run('CREATE TABLE IF NOT EXISTS nic_case_items (accountID TEXT, BUID TEXT, sfdcCase TEXT, operation TEXT, skuid TEXT, sku TEXT, qtty REAL, price REAL)')
db.close();

const outfile = '/Users/sergiy.krupnov/Work/cases.sql'
caseItems(outfile)
