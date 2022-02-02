const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const {DATABASE} = require('../configuration')
const {parseDescription,test1} = require('./DescriptionParser')

test1()

//////////////////////
// caseItems
//////////////////////
exports.caseItems = (outfile, timestamp) => {
    const sql = `
        SELECT 
            CaseNumber AS case_id,
            UID AS acc_id, 
            inContactBUID AS bu_id, 
            Description AS descr 
        FROM nic_cases 
        WHERE descr IS NOT NULL
        ${timestamp !== undefined? 'AND DBInserted="' + timestamp + '"': ""}
        `.replace(/\s+/g, " ")
        let db = new sqlite3.Database(DATABASE, sqlite3.OPEN_READONLY, (err) => {
        if (err) return console.error(err.message)
        console.log('Connected to DWH db.')
    })
    const sqler = fs.createWriteStream(outfile, {
        flags: 'w' //overwrite old content, if any
      })

    let i = 0
    db.each(
        sql,
        (err, row) => {
            if (err) {
                console.error(err.message)
            }
            const res = {}
            parseDescription(row.descr, row.case_id, row.acc_id, row.bu_id, res)
            if (res.hasOwnProperty("cases")) {
                sqler.write(`-- #${++i}\n`)
                sqler.write(res.cases)
            }
            if (res.hasOwnProperty("notes")) {
                sqler.write(`-- #${++i}\n`)
                sqler.write(res.notes)
            }
        },
        (err,num) => {
            sqler.close()
            db.close( (err) => {
                if (err) return console.error(err.message)
                console.log('Close the database connection.')
            })
        }
    )
}